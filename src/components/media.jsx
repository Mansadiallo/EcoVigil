import React, { useEffect, useRef, useState } from "react";
import { IconCamera, IconImage, IconPlay, IconRotateCcw, IconX } from "./icons.jsx";
import { DEVICE_ID, supabase } from "../lib/supabase.js";

export function shareContent(title, text) {
  if (navigator.share) {
    navigator.share({ title, text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert("Copié ! Colle-le où tu veux le partager."));
  }
}

export function toCSV(rows, columns) {
  const header = columns.map(c => c.label).join(",");
  const lines = rows.map(r => columns.map(c => {
    let v = r[c.key];
    if (v === null || v === undefined) v = "";
    v = String(v).replace(/"/g, '""');
    return `"${v}"`;
  }).join(","));
  return [header, ...lines].join("\n");
}

export function compressImage(dataUrl, maxSize = 1280, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
        else { width = Math.round((width * maxSize) / height); height = maxSize; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function uploadPhotoGeneric(dataUrl, prefix) {
  if (!dataUrl) return null;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "jpg").split("+")[0];
    const path = `${prefix}/${DEVICE_ID}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("pace-photos").upload(path, blob, { contentType: blob.type });
    if (error) throw error;
    const { data } = supabase.storage.from("pace-photos").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error("Erreur d'upload photo :", e);
    return null;
  }
}

// Les signalements/arbres/observations peuvent désormais porter une photo OU une courte vidéo
// (même champ "photo_url" / "photo" côté stockage) : ce helper distingue les deux par extension
// pour choisir entre <img> et <video> à l'affichage, sans changer le schéma de données.
function isVideoUrl(url) {
  if (!url) return false;
  return /\.(webm|mp4|mov|m4v|ogg)(\?|$)/i.test(url) || (typeof url === "string" && url.startsWith("blob:"));
}

// Composant d'affichage unifié (miniature/aperçu) pour un média photo ou vidéo.
export function MediaThumb({ src, style, controls = true }) {
  if (!src) return null;
  if (isVideoUrl(src)) {
    return <video src={src} controls={controls} playsInline muted={!controls} style={style} />;
  }
  return <img src={src} alt="" style={style} />;
}

// Variante compacte pour les petites vignettes (listes) : affiche un pictogramme lecture
// plutôt qu'une balise <video> peu lisible en dessous d'une cinquantaine de pixels.
export function MediaThumbSmall({ src, style }) {
  if (!src) return null;
  if (isVideoUrl(src)) {
    return (
      <div style={{ ...style, background: "#17211C", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconPlay size={Math.max(12, Math.round(((style && style.width) || 40) * 0.4))} color="#fff" />
      </div>
    );
  }
  return <img src={src} alt="" style={style} />;
}

// Échappement HTML pour toute donnée saisie par un utilisateur (nom d'arbre, espèce
// observée, nom de zone, etc.) avant insertion dans une chaîne HTML brute (popups Leaflet,
// qui n'utilisent pas JSX et n'ont donc pas l'échappement automatique de React). Sans cela,
// un utilisateur pourrait saisir p.ex. `<img src=x onerror=...>` comme "espèce" ou "essence
// d'arbre" et l'exécuter dans le navigateur de toute personne consultant la carte (XSS stocké).
export function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Équivalent en chaîne HTML brute, pour les popups Leaflet qui n'utilisent pas JSX.
export function mediaHtml(url, maxHeight = 110) {
  if (!url) return "";
  const baseStyle = `width:100%;max-height:${maxHeight}px;object-fit:cover;border-radius:8px;margin-top:6px`;
  const safeUrl = escapeHtml(url);
  if (isVideoUrl(url)) {
    return `<video src="${safeUrl}" style="${baseStyle};background:#000" controls playsInline muted></video>`;
  }
  return `<img src="${safeUrl}" style="${baseStyle}" />`;
}

// --- Appareil photo intégré (aperçu live + capture photo ET vidéo, sans quitter l'app) ---
const CAMERA_VIDEO_MAX_SECONDS = 60;

function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("photo"); // "photo" | "video"
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  function stopVideoStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tr => tr.stop());
      streamRef.current = null;
    }
  }
  function stopAudioStream() {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(tr => tr.stop());
      audioStreamRef.current = null;
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setReady(false);
      setError(null);
      stopVideoStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(tr => tr.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch (e) {}
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e && e.name === "NotAllowedError" ? "permission" : "unavailable");
      }
    }
    start();
    return () => {
      cancelled = true;
      stopVideoStream();
      stopAudioStream();
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [facingMode]);

  function handleCapturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture({ kind: "photo", dataUrl: canvas.toDataURL("image/jpeg", 0.85) });
  }

  async function startRecording() {
    if (!streamRef.current || isRecording) return;
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = audioStream;
      const combined = new MediaStream([
        ...streamRef.current.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
      const mimeType = candidates.find(c => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) || "";
      const recorder = mimeType ? new MediaRecorder(combined, { mimeType }) : new MediaRecorder(combined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        chunksRef.current = [];
        stopAudioStream();
        onCapture({ kind: "video", blob, url: URL.createObjectURL(blob) });
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next >= CAMERA_VIDEO_MAX_SECONDS) stopRecording();
          return next;
        });
      }, 1000);
    } catch (e) {
      setError("permission");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }

  function handleMainButton() {
    if (mode === "photo") { handleCapturePhoto(); return; }
    if (isRecording) stopRecording(); else startRecording();
  }

  function handleClose() {
    if (isRecording) stopRecording();
    onClose();
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 4000, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {error ? (
          <div style={{ color: "#fff", textAlign: "center", padding: 28, fontSize: 13, lineHeight: 1.5 }}>
            {error === "permission"
              ? "Accès à la caméra ou au micro refusé. Autorise l'accès dans les réglages du navigateur, ou choisis un fichier depuis la galerie."
              : "Caméra indisponible sur cet appareil. Choisis un fichier depuis la galerie."}
          </div>
        ) : (
          <video ref={videoRef} playsInline muted autoPlay style={{ width: "100%", height: "100%", objectFit: "cover", transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
        )}
        {isRecording && (
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(181,69,27,0.9)", color: "#fff", fontSize: 12.5, fontWeight: 600, padding: "5px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
            {fmtTime(elapsed)}
          </div>
        )}
        <button onClick={handleClose} aria-label="Fermer la caméra" style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconX size={18} color="#fff" />
        </button>
        {!error && !isRecording && (
          <button onClick={() => setFacingMode(m => m === "environment" ? "user" : "environment")} aria-label="Changer de caméra" style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IconRotateCcw size={17} color="#fff" />
          </button>
        )}
      </div>
      <div style={{ background: "#000", padding: "14px 0 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {error ? (
          <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 13, cursor: "pointer" }}>Fermer</button>
        ) : (
          <React.Fragment>
            {!isRecording && (
              <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: 3 }}>
                <button onClick={() => setMode("photo")} style={{ padding: "6px 16px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: mode === "photo" ? "#fff" : "transparent", color: mode === "photo" ? "#17211C" : "#fff" }}>Photo</button>
                <button onClick={() => setMode("video")} style={{ padding: "6px 16px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: mode === "video" ? "#fff" : "transparent", color: mode === "video" ? "#17211C" : "#fff" }}>Vidéo</button>
              </div>
            )}
            <button onClick={handleMainButton} disabled={!ready} aria-label={mode === "photo" ? "Prendre la photo" : (isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement")} style={{
              width: 68, height: 68, borderRadius: "50%", border: `4px solid ${mode === "video" ? "#B5451B" : "#fff"}`,
              background: ready ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              cursor: ready ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {mode === "video" && (
                isRecording
                  ? <span style={{ width: 22, height: 22, borderRadius: 5, background: "#B5451B" }} />
                  : <span style={{ width: 50, height: 50, borderRadius: "50%", background: "#B5451B" }} />
              )}
            </button>
            {mode === "video" && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                {isRecording ? `Max. ${CAMERA_VIDEO_MAX_SECONDS}s — appuie pour arrêter` : "Appuie pour filmer"}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// --- Enregistreur audio intégré (dictaphone) : capture, pause, reprise — sans vidéo
// ni service externe. Alimente les preuves de type "audio" (voir ENQ_PREUVES), qui
// pourront ensuite être transcrites manuellement (voir TranscriptionAudio plus bas).
// onCapture(file) est appelé avec un File une fois l'enregistrement arrêté, et avec
// null si l'utilisateur choisit de recommencer — même contrat que le champ fichier
// d'une preuve photo (np.fichier), pour rester sur le même circuit d'enregistrement.
const AUDIO_RECORD_MAX_SECONDS = 600; // 10 minutes : cohérent avec la durée d'une interview de terrain

export function AudioRecorder({ onCapture }) {
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const previewRef = useRef(null); // miroir de `preview`, lu au démontage pour éviter une fermeture obsolète (l'effet de nettoyage ci-dessous ne se relance jamais, son tableau de dépendances étant vide)
  const [state, setState] = useState("idle"); // idle | recording | paused | pret
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // { url, blob }

  function stopStream() { if (streamRef.current) { streamRef.current.getTracks().forEach(tr => tr.stop()); streamRef.current = null; } }
  function clearTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { clearTimer(); stopStream(); if (previewRef.current) URL.revokeObjectURL(previewRef.current.url); }, []);

  function planifierChrono() {
    timerRef.current = setInterval(() => {
      setElapsed(prev => { const next = prev + 1; if (next >= AUDIO_RECORD_MAX_SECONDS) arreter(); return next; });
    }, 1000);
  }

  async function demarrer() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const candidats = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = candidats.find(c => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) || "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        stopStream();
        const url = URL.createObjectURL(blob);
        const p = { url, blob };
        previewRef.current = p;
        setPreview(p);
        setState("pret");
        const ext = (blob.type.split("/")[1] || "webm").split(";")[0];
        onCapture(new File([blob], `audio-${Date.now()}.${ext}`, { type: blob.type }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setState("recording");
      setElapsed(0);
      planifierChrono();
    } catch (e) {
      setError(e && e.name === "NotAllowedError" ? "permission" : "unavailable");
    }
  }
  function pause() { if (recorderRef.current && recorderRef.current.state === "recording") { recorderRef.current.pause(); clearTimer(); setState("paused"); } }
  function reprendre() { if (recorderRef.current && recorderRef.current.state === "paused") { recorderRef.current.resume(); setState("recording"); planifierChrono(); } }
  function arreter() { clearTimer(); if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop(); setState("pret"); }
  function recommencer() { if (previewRef.current) URL.revokeObjectURL(previewRef.current.url); previewRef.current = null; setPreview(null); setElapsed(0); setState("idle"); onCapture(null); }
  function fmt(s) { const m = Math.floor(s / 60), sec = s % 60; return `${m}:${String(sec).padStart(2, "0")}`; }
  const miniBtn = { padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text)", fontSize: 12, cursor: "pointer" };

  if (error) {
    return (
      <div style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
        {error === "permission" ? "Accès au micro refusé. Autorise l'accès, ou choisis un fichier audio existant." : "Microphone indisponible sur cet appareil. Choisis un fichier audio existant."}
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 10 }}>
      {state === "idle" && (
        <button type="button" onClick={demarrer} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-accent-dark)", background: "none", color: "var(--c-accent-dark)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          🎙️ Démarrer l'enregistrement
        </button>
      )}
      {(state === "recording" || state === "paused") && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--c-border)" }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: state === "recording" ? "#B5451B" : "var(--c-text-muted)", flex: "none" }} />
          <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</span>
          {state === "recording"
            ? <button type="button" onClick={pause} style={miniBtn}>Pause</button>
            : <button type="button" onClick={reprendre} style={miniBtn}>Reprendre</button>}
          <button type="button" onClick={arreter} style={{ ...miniBtn, color: "#B5451B", borderColor: "#B5451B" }}>Arrêter</button>
        </div>
      )}
      {state === "pret" && preview && (
        <div>
          <audio src={preview.url} controls style={{ width: "100%", marginBottom: 6 }} />
          <button type="button" onClick={recommencer} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0 }}>Recommencer l'enregistrement</button>
        </div>
      )}
    </div>
  );
}

// Bouton "photo/vidéo" réutilisable : ouvre la caméra intégrée par défaut (aperçu live,
// capture photo ou enregistrement vidéo), avec repli vers le sélecteur de fichiers/galerie
// si la caméra est indisponible ou refusée. La valeur de `photo` reste une simple chaîne
// (data URL pour une image, URL blob locale pour une vidéo) afin de rester compatible avec
// le flux d'upload existant (uploadPhoto/uploadPhotoGeneric font un fetch() de cette URL).
export function PhotoCaptureButton({ photo, onChange, label, previewMaxHeight = 160, compact = false }) {
  const fileRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const supportsCamera = typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  const isVideo = isVideoUrl(photo);

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.type && f.type.startsWith("video/")) {
      onChange(URL.createObjectURL(f));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => onChange(await compressImage(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  async function handleCapture(result) {
    setShowCamera(false);
    if (result.kind === "video") {
      onChange(result.url);
    } else {
      onChange(await compressImage(result.dataUrl));
    }
  }

  function handleRemove() {
    if (isVideo) { try { URL.revokeObjectURL(photo); } catch (e) {} }
    onChange(null);
  }

  return (
    <React.Fragment>
      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: "none" }} />
      {showCamera && <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      {photo ? (
        <div style={{ position: "relative", marginBottom: compact ? 8 : 10 }}>
          {isVideo ? (
            <video src={photo} controls playsInline style={{ width: "100%", borderRadius: compact ? 10 : 12, maxHeight: previewMaxHeight, objectFit: "cover", background: "#000" }} />
          ) : (
            <img src={photo} alt="Aperçu" style={{ width: "100%", borderRadius: compact ? 10 : 12, maxHeight: previewMaxHeight, objectFit: "cover" }} />
          )}
          <button onClick={handleRemove} style={{ position: "absolute", top: 8, right: 8, background: "var(--c-text)bb", border: "none", borderRadius: "50%", width: 26, height: 26, color: "#fff", cursor: "pointer" }}><IconX size={14} /></button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, marginBottom: compact ? 8 : 10 }}>
          <button onClick={() => supportsCamera ? setShowCamera(true) : fileRef.current.click()} style={{
            flex: 1, border: "1.5px dashed var(--c-text-faint)", borderRadius: compact ? 10 : 12,
            padding: compact ? 12 : 14, background: "var(--c-surface-dashed)", color: "var(--c-text-secondary)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: compact ? 12 : 12.5 }}>
            <IconCamera size={compact ? 15 : 16} /> {label || "Ajouter une photo"}
          </button>
          {supportsCamera && (
            <button onClick={() => fileRef.current.click()} aria-label="Choisir depuis la galerie" title="Choisir depuis la galerie" style={{
              width: compact ? 40 : 44, flexShrink: 0, border: "1.5px dashed var(--c-text-faint)", borderRadius: compact ? 10 : 12,
              background: "var(--c-surface-dashed)", color: "var(--c-text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconImage size={compact ? 15 : 16} />
            </button>
          )}
        </div>
      )}
    </React.Fragment>
  );
}
