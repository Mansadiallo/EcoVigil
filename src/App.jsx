import React, { useState, useEffect, useRef, useMemo } from "react";
import { LOGO_DATA_URL, CAROUSEL_PHOTOS_REELLES } from "./imagesData.js";

/* ---------- Icônes SVG légères (inspirées lucide, sans dépendance) ---------- */
function Icon({ path, size = 20, color = "currentColor", fill = "none", strokeWidth = 2, viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}
const IconHome = (p) => <Icon {...p} path={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>} />;
const IconMapPin = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>} />;
const IconTree = (p) => <Icon {...p} path={<><path d="M12 22v-7"/><path d="M9 9a3 3 0 1 1 6 0c0 2-2 3-3 3s-3-1-3-3z"/><path d="M6 13a4 4 0 1 1 8 0c0 2.2-2 4-4 4s-4-1.8-4-4z"/><path d="M10 6a2.5 2.5 0 1 1 5 0c0 1.6-1.5 2.5-2.5 2.5S10 7.6 10 6z"/></>} />;
const IconAlert = (p) => <Icon {...p} path={<><path d="M10.3 3.9 1.8 18a1.8 1.8 0 0 0 1.5 2.7h17.4a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} />;
const IconCamera = (p) => <Icon {...p} path={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>} />;
const IconImage = (p) => <Icon {...p} path={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>} />;
const IconX = (p) => <Icon {...p} path={<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>} />;
const IconChevronLeft = (p) => <Icon {...p} path={<path d="M15 18l-6-6 6-6"/>} />;
const IconFlame = (p) => <Icon {...p} path={<path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 1 3 3 3 5a7 7 0 0 1-14 0c0-4 3-5 4-9 1 2 2 2 3-3z"/>} />;
const IconDroplet = (p) => <Icon {...p} path={<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/>} />;
const IconTrash = (p) => <Icon {...p} path={<><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>} />;
const IconRotateCcw = (p) => <Icon {...p} path={<><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>} />;
const IconWind = (p) => <Icon {...p} path={<><path d="M3 8h9a3 3 0 1 0-3-3"/><path d="M3 16h13a3 3 0 1 1-3 3"/><path d="M3 12h16a3 3 0 1 0-3-3"/></>} />;
const IconWaves = (p) => <Icon {...p} path={<><path d="M2 8c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/><path d="M2 15c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/></>} />;
const IconFlask = (p) => <Icon {...p} path={<><path d="M9 2v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-11V2"/><path d="M8.5 2h7"/><path d="M6.5 15h11"/></>} />;
const IconGlassWater = (p) => <Icon {...p} path={<><path d="M6 3h12l-1.2 16.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8z"/><path d="M6.6 11h10.8"/></>} />;
const IconNewspaper = (p) => <Icon {...p} path={<><path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M19 4a2 2 0 0 1 2 2v11a1 1 0 0 1-1 1"/><path d="M8 8h6"/><path d="M8 12h6"/><path d="M8 16h4"/></>} />;
const IconUsers = (p) => <Icon {...p} path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const IconDownload = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>} />;
const IconPaw = (p) => <Icon {...p} path={<><circle cx="4.5" cy="9" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9" r="2"/><path d="M6 20c-1.5 0-3-1.2-3-3 0-2.5 3-4 3-6.5 0 0 3-1.5 6-1.5s6 1.5 6 1.5c0 2.5 3 4 3 6.5 0 1.8-1.5 3-3 3-2 0-2.5-1.5-6-1.5s-4 1.5-6 1.5z"/></>} />;
const IconCloudRain = (p) => <Icon {...p} path={<><path d="M16 13a4 4 0 0 0-2-7.4A6 6 0 0 0 3 8.5 4.5 4.5 0 0 0 4.5 17H16a3.5 3.5 0 0 0 0-7z"/><path d="M8 19l-1 2"/><path d="M12 19l-1 2"/><path d="M16 19l-1 2"/></>} />;
const IconSun = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/></>} />;
const IconMaximize = (p) => <Icon {...p} path={<><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>} />;
const IconMinimize = (p) => <Icon {...p} path={<><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></>} />;
const IconLayers = (p) => <Icon {...p} path={<><path d="M12 2 2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>} />;
const IconClock = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>} />;
const IconSparkles = (p) => <Icon {...p} path={<><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="M5.6 5.6l2.8 2.8"/><path d="M15.6 15.6l2.8 2.8"/><path d="M18.4 5.6l-2.8 2.8"/><path d="M8.4 15.6l-2.8 2.8"/></>} />;
const IconMenu = (p) => <Icon {...p} path={<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>} />;
const IconMoon = (p) => <Icon {...p} path={<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>} />;
const IconMonitor = (p) => <Icon {...p} path={<><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>} />;
const IconCalendar = (p) => <Icon {...p} path={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></>} />;
const IconUserCircle = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19a5.5 5.5 0 0 1 11 0"/></>} />;
const IconMailPlus = (p) => <Icon {...p} path={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></>} />;
const IconArrowLeft = (p) => <Icon {...p} path={<><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>} />;
const IconGlobe = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>} />;
const IconEye = (p) => <Icon {...p} path={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />;
const IconEyeOff = (p) => <Icon {...p} path={<><path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9"/><path d="M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a18.4 18.4 0 0 1-2.3 3.3"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/></>} />;
const IconEdit = (p) => <Icon {...p} path={<><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></>} />;
const IconInfo = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>} />;
const IconSend = (p) => <Icon {...p} path={<><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></>} />;
const IconPick = (p) => <Icon {...p} path={<><path d="M14.5 3 21 9.5"/><path d="M3 21l7-1 8-8-6-6-8 8z"/></>} />;
const IconFish = (p) => <Icon {...p} path={<><path d="M2 12s4-6 12-6 8 6 8 6-3 6-8 6-12-6-12-6z"/><circle cx="16" cy="11" r=".6"/></>} />;
const IconPlus = (p) => <Icon {...p} path={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />;
const IconCheck = (p) => <Icon {...p} path={<path d="M20 6 9 17l-5-5"/>} />;
const IconSprout = (p) => <Icon {...p} path={<><path d="M7 20h10"/><path d="M12 20V10"/><path d="M12 10C10 10 8 8 8 5c3 0 5 2 5 5"/><path d="M12 8c1.5 0 3-1.2 3-3.5C13 4.5 12 6 12 8z"/></>} />;
const IconShare = (p) => <Icon {...p} path={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9"/><path d="M15.4 6.6L8.6 10.5"/></>} />;
const IconBell = (p) => <Icon {...p} path={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>} />;
const IconWifiOff = (p) => <Icon {...p} path={<><path d="M1 1l22 22"/><path d="M16.7 16.7a10 10 0 0 0-9.4 0"/><path d="M5 12.9a15 15 0 0 1 4-2.5"/><path d="M12 20h.01"/><path d="M19.1 12.9A15 15 0 0 0 15 10.4"/></>} />;
const IconWifi = (p) => <Icon {...p} path={<><path d="M5 12.9a15 15 0 0 1 14 0"/><path d="M8.5 16.4a10 10 0 0 1 7 0"/><path d="M2 8.8a20 20 0 0 1 20 0"/><path d="M12 20h.01"/></>} />;
const IconSearch = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></>} />;
const IconRoute = (p) => <Icon {...p} path={<><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.2 7.2C10 10 8 14 12 15s4 3 6.6 3"/></>} />;
const IconPlay = (p) => <Icon {...p} path={<path d="M6 4l14 8-14 8V4z"/>} fill="currentColor" />;
const IconSquareStop = (p) => <Icon {...p} path={<><rect x="4" y="4" width="16" height="16" rx="2"/></>} fill="currentColor" />;
const IconCloudDownload = (p) => <Icon {...p} path={<><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.7A4.5 4.5 0 0 0 6.5 19h11z"/><path d="M12 10v7"/><path d="M9 14l3 3 3-3"/></>} />;
const IconGauge = (p) => <Icon {...p} path={<><path d="M12 14l3-4"/><circle cx="12" cy="14" r="1.5"/><path d="M4.9 19a9 9 0 1 1 14.2 0"/></>} />;
const IconLock = (p) => <Icon {...p} path={<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></>} />;
const IconShield = (p) => <Icon {...p} path={<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/>} />;
const IconLogOut = (p) => <Icon {...p} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>} />;
const IconTarget = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></>} />;
const IconTrendingUp = (p) => <Icon {...p} path={<><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></>} />;

function shareContent(title, text) {
  if (navigator.share) {
    navigator.share({ title, text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert("Copié ! Colle-le où tu veux le partager."));
  }
}

function toCSV(rows, columns) {
  const header = columns.map(c => c.label).join(",");
  const lines = rows.map(r => columns.map(c => {
    let v = r[c.key];
    if (v === null || v === undefined) v = "";
    v = String(v).replace(/"/g, '""');
    return `"${v}"`;
  }).join(","));
  return [header, ...lines].join("\n");
}

function compressImage(dataUrl, maxSize = 1280, quality = 0.72) {
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

async function uploadPhotoGeneric(dataUrl, prefix) {
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
function MediaThumb({ src, style, controls = true }) {
  if (!src) return null;
  if (isVideoUrl(src)) {
    return <video src={src} controls={controls} playsInline muted={!controls} style={style} />;
  }
  return <img src={src} alt="" style={style} />;
}

// Variante compacte pour les petites vignettes (listes) : affiche un pictogramme lecture
// plutôt qu'une balise <video> peu lisible en dessous d'une cinquantaine de pixels.
function MediaThumbSmall({ src, style }) {
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
function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Équivalent en chaîne HTML brute, pour les popups Leaflet qui n'utilisent pas JSX.
function mediaHtml(url, maxHeight = 110) {
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

function AudioRecorder({ onCapture }) {
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
function PhotoCaptureButton({ photo, onChange, label, previewMaxHeight = 160, compact = false }) {
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

// --- Notifications push réelles (fonctionnent même app fermée / téléphone verrouillé) ---
const VAPID_PUBLIC_KEY = "BADF58nqmx-yyzmqQ5TkwdSGIoUye6BRH19sVkMKUqF7JBf6o2RU0iFwWgwCq2Gjf-SUIHuyr4jNLg2UQDTJEUc";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeToPush() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const json = sub.toJSON();
    const s = getActiveSession();
    const email = s && s.user ? s.user.email : null;
    await supabase.from("push_subscriptions").upsert({
      device_id: DEVICE_ID, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, email,
    }, { onConflict: "device_id" });
    return true;
  } catch (e) {
    console.error("Erreur d'abonnement push :", e);
    return false;
  }
}

function downloadCSV(filename, csv) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function celluleTexte(v) { return (v === null || v === undefined) ? "" : String(v); }

// --- Export Excel (fichier .xlsx réel, via SheetJS déjà chargé en CDN) ---
function exportExcel(filename, rows, columns, title) {
  if (!window.XLSX) { alert("Bibliothèque Excel indisponible (vérifie ta connexion)."); return; }
  // Note technique : l'intégration d'une image réelle et la mise en forme des cellules (gras,
  // couleur) sont des fonctionnalités payantes de SheetJS Pro. La version gratuite utilisée ici
  // ne les supporte pas — même en fixant ws[cellule].s, rien ne s'appliquerait silencieusement.
  // On identifie donc le rapport par des lignes d'en-tête texte "ECOVIGIL" à la place.
  const aoa = [
    ["ECOVIGIL"],
    [title || "Rapport"],
    [`Exporté le ${new Date().toLocaleString("fr-FR")}`],
    [],
    columns.map(c => c.label),
    ...rows.map(r => columns.map(c => celluleTexte(r[c.key]))),
    [],
    [`EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental — ${rows.length} ligne${rows.length > 1 ? "s" : ""}`],
  ];
  const ligneEntete = 4; // index (0-based) de la ligne des libellés de colonnes dans aoa
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(columns.length - 1, 0) } }];
  ws["!cols"] = columns.map(() => ({ wch: 18 }));
  // Mise en page : gèle les lignes d'en-tête (titre + libellés de colonnes) pour qu'elles
  // restent visibles en défilant, répète la ligne de libellés sur chaque page imprimée, et
  // passe en paysage (plus lisible pour des tableaux à nombreuses colonnes). Ces trois
  // propriétés sont documentées comme supportées par la version gratuite de SheetJS
  // (contrairement au style de cellule et aux images, qui ne le sont pas).
  ws["!freeze"] = { xSplit: "0", ySplit: String(ligneEntete + 1), topLeftCell: `A${ligneEntete + 2}`, activePane: "bottomLeft", state: "frozen" };
  ws["!printHeader"] = [ligneEntete + 1, ligneEntete + 1];
  ws["!pageSetup"] = { orientation: "landscape", scale: 100, fitToWidth: 1 };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  XLSX.writeFile(wb, filename);
}

// --- Export Word : document HTML avec les espaces de noms Office, ouvert nativement par
// Word (technique standard, sans dépendance supplémentaire, fiable depuis Office 97). ---
// Génère, pour Word/PDF (documents narratifs), une "fiche" par ligne : chaque champ est présenté
// comme un intitulé suivi de son explication, empilés verticalement — pas de grille de tableau,
// contrairement à Excel/CSV qui restent au format tabulaire (adapté au traitement de données).
function exportWord(filename, title, rows, columns) {
  const echapper = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fiches = rows.map((r, idx) => {
    const champs = columns.map(c => `
      <p style="margin:2px 0 7px 0;line-height:1.4;">
        <span style="font-weight:bold;color:#2E5A3E;">${echapper(c.label)} : </span><span>${echapper(celluleTexte(r[c.key]) || "—")}</span>
      </p>`).join("");
    return `
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ccc;">
        <div style="font-weight:bold;font-size:13px;color:#2E5A3E;margin-bottom:6px;">Élément ${idx + 1}</div>
        ${champs}
      </div>`;
  }).join("");
  // Mise en page réelle : format A4 portrait avec marges, via la syntaxe @page propre à Office
  // (identique à ce que Word génère lui-même) — orientation portrait plus adaptée à un document
  // narratif (paragraphes) qu'à un tableau large.
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${echapper(title)}</title>
<style>
  @page Section1 { size: 21.0cm 29.7cm; mso-page-orientation: portrait; margin: 2cm 2cm 2cm 2cm; }
  div.Section1 { page: Section1; }
</style>
</head>
<body style="font-family:Calibri,Arial,sans-serif;font-size:11px;">
<div class="Section1">
<table style="border:none;margin-bottom:18px;"><tr>
  <td style="border:none;padding:0;"><img src="${LOGO_DATA_URL}" width="48" height="48" alt="EcoVigil" /></td>
  <td style="border:none;padding:0 0 0 10px;vertical-align:middle;">
    <div style="font-size:18px;font-weight:bold;color:#2E5A3E;">${echapper(title)}</div>
    <div style="font-size:10px;color:#666;">Exporté le ${new Date().toLocaleString("fr-FR")} — EcoVigil — ${rows.length} élément${rows.length > 1 ? "s" : ""}</div>
  </td>
</tr></table>
${fiches}
<div style="margin-top:16px;padding-top:8px;border-top:1px solid #ccc;font-size:9px;color:#888;text-align:center;">
  EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental
</div>
</div>
</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Export PDF (via jsPDF, déjà chargé en CDN) — même logique narrative que exportWord ---
function exportPDF(filename, title, rows, columns) {
  if (!window.jspdf) { alert("Bibliothèque PDF indisponible (vérifie ta connexion)."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentW = pageW - marginX * 2 - 2;
  const bottomLimit = pageH - 18; // réserve pour le pied de page

  function dessinerEntete() {
    try { doc.addImage(LOGO_DATA_URL, "PNG", marginX, 8, 12, 12); } catch (e) { /* logo non critique */ }
    doc.setFontSize(14); doc.setTextColor(46, 90, 62); doc.setFont(undefined, "bold");
    doc.text(title, marginX + 16, 15);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleString("fr-FR")} — EcoVigil — ${rows.length} élément${rows.length > 1 ? "s" : ""}`, marginX + 16, 21);
    doc.setTextColor(0);
    doc.setDrawColor(74, 139, 111); doc.setLineWidth(0.5);
    doc.line(marginX, 24, pageW - marginX, 24);
    return 32;
  }

  let y = dessinerEntete();

  rows.forEach((r, idx) => {
    const champs = columns.map(c => ({ label: c.label, texte: doc.splitTextToSize(celluleTexte(r[c.key]) || "—", contentW - 4) }));
    const hauteurBloc = 8 + champs.reduce((acc, ch) => acc + 4.4 + ch.texte.length * 4.2 + 1.5, 0) + 8;

    // On évite de couper une fiche entre deux pages : si elle ne tient pas, nouvelle page d'abord.
    if (y + hauteurBloc > bottomLimit) {
      doc.addPage();
      y = dessinerEntete();
    }

    doc.setFontSize(11); doc.setTextColor(46, 90, 62); doc.setFont(undefined, "bold");
    doc.text(`Élément ${idx + 1}`, marginX, y);
    y += 6.5;

    champs.forEach(ch => {
      doc.setFontSize(8.5); doc.setTextColor(90, 90, 90); doc.setFont(undefined, "bold");
      doc.text(`${ch.label} :`, marginX, y);
      y += 4.4;
      doc.setFont(undefined, "normal"); doc.setTextColor(20, 20, 20);
      doc.text(ch.texte, marginX + 2, y);
      y += ch.texte.length * 4.2 + 1.5;
    });

    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
    doc.line(marginX, y, pageW - marginX, y);
    y += 8;
  });

  // Pied de page (logo + numéro) ajouté après coup sur chaque page réellement générée.
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    try { doc.addImage(LOGO_DATA_URL, "PNG", marginX, pageH - 12, 6, 6); } catch (e) {}
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text("EcoVigil", marginX + 8, pageH - 8);
    doc.text(`Page ${p} / ${totalPages}`, pageW - marginX, pageH - 8, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(filename);
}

const CATEGORIES = [
  { id: "decharge", label: "Décharge sauvage", icon: IconTrash },
  { id: "pollution", label: "Pollution des cours d'eau", icon: IconDroplet },
  { id: "deforestation", label: "Déforestation", icon: IconTree },
  { id: "feu", label: "Feu de brousse", icon: IconFlame },
  { id: "mine", label: "Exploitation minière illégale", icon: IconPick },
  { id: "deversement", label: "Déversement polluant", icon: IconAlert },
  { id: "braconnage", label: "Braconnage", icon: IconPaw },
  { id: "peche_illegale", label: "Pêche illégale", icon: IconFish },
  { id: "pollution_air", label: "Pollution de l'air / fumées toxiques", icon: IconWind },
  { id: "extraction_sable", label: "Extraction de sable illégale", icon: IconLayers },
  { id: "zones_humides", label: "Destruction de zones humides / mangroves", icon: IconWaves },
  { id: "dechets_dangereux", label: "Déchets médicaux ou dangereux", icon: IconFlask },
  { id: "construction_illegale", label: "Construction illégale en zone protégée", icon: IconHome },
  { id: "assechement", label: "Assèchement d'un point d'eau", icon: IconSun },
  { id: "espece_envahissante", label: "Espèce envahissante", icon: IconSprout },
  { id: "erosion", label: "Érosion des sols / désertification", icon: IconGlobe },
  { id: "inondation", label: "Inondation", icon: IconCloudRain },
  { id: "eau_potable", label: "Contamination de l'eau potable", icon: IconGlassWater },
];

// Libellés des catégories de signalement et niveaux d'urgence par langue, indexés par id (le tableau FR reste la source de vérité pour id/icône).
const CATEGORIES_LABELS = {
  en: {
    decharge: "Illegal dump", pollution: "Water pollution", deforestation: "Deforestation", feu: "Bush fire",
    mine: "Illegal mining", deversement: "Pollutant spill", braconnage: "Poaching", peche_illegale: "Illegal fishing",
    pollution_air: "Air pollution / toxic fumes", extraction_sable: "Illegal sand extraction",
    zones_humides: "Wetland / mangrove destruction", dechets_dangereux: "Medical or hazardous waste",
    construction_illegale: "Illegal construction in protected area", assechement: "Water point drying up",
    espece_envahissante: "Invasive species", erosion: "Soil erosion / desertification",
    inondation: "Flooding", eau_potable: "Drinking water contamination",
  },
  pt: {
    decharge: "Lixeira ilegal", pollution: "Poluição de cursos de água", deforestation: "Desflorestação", feu: "Incêndio florestal",
    mine: "Mineração ilegal", deversement: "Derrame poluente", braconnage: "Caça furtiva", peche_illegale: "Pesca ilegal",
    pollution_air: "Poluição do ar / fumos tóxicos", extraction_sable: "Extração ilegal de areia",
    zones_humides: "Destruição de zonas húmidas / mangais", dechets_dangereux: "Resíduos médicos ou perigosos",
    construction_illegale: "Construção ilegal em área protegida", assechement: "Secagem de um ponto de água",
    espece_envahissante: "Espécie invasora", erosion: "Erosão do solo / desertificação",
    inondation: "Inundação", eau_potable: "Contaminação da água potável",
  },
  es: {
    decharge: "Vertedero ilegal", pollution: "Contaminación de cursos de agua", deforestation: "Deforestación", feu: "Incendio forestal",
    mine: "Minería ilegal", deversement: "Derrame contaminante", braconnage: "Caza furtiva", peche_illegale: "Pesca ilegal",
    pollution_air: "Contaminación del aire / humos tóxicos", extraction_sable: "Extracción ilegal de arena",
    zones_humides: "Destrucción de humedales / manglares", dechets_dangereux: "Residuos médicos o peligrosos",
    construction_illegale: "Construcción ilegal en área protegida", assechement: "Secado de un punto de agua",
    espece_envahissante: "Especie invasora", erosion: "Erosión del suelo / desertificación",
    inondation: "Inundación", eau_potable: "Contaminación del agua potable",
  },
  sw: {
    decharge: "Dampo haramu", pollution: "Uchafuzi wa vyanzo vya maji", deforestation: "Ukataji miti", feu: "Moto wa nyika",
    mine: "Uchimbaji haramu", deversement: "Umwagikaji wa uchafuzi", braconnage: "Ujangili", peche_illegale: "Uvuvi haramu",
    pollution_air: "Uchafuzi wa hewa / moshi wenye sumu", extraction_sable: "Uchimbaji haramu wa mchanga",
    zones_humides: "Uharibifu wa ardhioevu / mikoko", dechets_dangereux: "Taka za hospitali au hatari",
    construction_illegale: "Ujenzi haramu katika eneo lililohifadhiwa", assechement: "Kukauka kwa chanzo cha maji",
    espece_envahissante: "Spishi vamizi", erosion: "Mmomonyoko wa udongo / jangwa",
    inondation: "Mafuriko", eau_potable: "Uchafuzi wa maji ya kunywa",
  },
  ar: {
    decharge: "مكب نفايات عشوائي", pollution: "تلوث المجاري المائية", deforestation: "إزالة الغابات", feu: "حريق أدغال",
    mine: "تعدين غير قانوني", deversement: "تسرب ملوّث", braconnage: "صيد جائر", peche_illegale: "صيد غير قانوني",
    pollution_air: "تلوث الهواء / أدخنة سامة", extraction_sable: "استخراج رمل غير قانوني",
    zones_humides: "تدمير الأراضي الرطبة / أشجار المانغروف", dechets_dangereux: "نفايات طبية أو خطرة",
    construction_illegale: "بناء غير قانوني في منطقة محمية", assechement: "جفاف مصدر مياه",
    espece_envahissante: "نوع غازٍ", erosion: "تآكل التربة / التصحر",
    inondation: "فيضان", eau_potable: "تلوث مياه الشرب",
  },
};
const URGENCE_LABELS = {
  en: { faible: "Low", moyenne: "Medium", haute: "High" },
  pt: { faible: "Baixa", moyenne: "Média", haute: "Alta" },
  es: { faible: "Baja", moyenne: "Media", haute: "Alta" },
  sw: { faible: "Chini", moyenne: "Wastani", haute: "Juu" },
  ar: { faible: "منخفضة", moyenne: "متوسطة", haute: "مرتفعة" },
};
// Index des problèmes environnementaux publiés (taxonomie dynamique, Phase 2-4), chargé une
// fois et mis en cache en mémoire pour que TOUT l'affichage (carte, historique admin, accueil,
// notifications, export) reste cohérent avec le formulaire Signaler, sans dupliquer de requête
// ni de logique de traduction : on réutilise le même principe de fallback que TRANSLATIONS/t().
let ENV_PROBLEMES_INDEX = {};
let ENV_DEFI_PAR_CODE = {}; // code de problème -> nom du défi parent (fr), pour la ventilation par défi
let envTaxonomieChargee = false;
async function chargerTaxonomiePubliee() {
  if (envTaxonomieChargee) return;
  const [{ data: problemes }, { data: defis }] = await Promise.all([
    supabase.from("env_problemes").select("code, nom, icone, defi_id").eq("statut", "publie"),
    supabase.from("env_defis").select("id, nom").eq("statut", "publie"),
  ]);
  const defisParId = {};
  (defis || []).forEach(d => { defisParId[d.id] = (d.nom && d.nom.fr) || d.id; });
  (problemes || []).forEach(p => {
    ENV_PROBLEMES_INDEX[p.code] = p;
    ENV_DEFI_PAR_CODE[p.code] = defisParId[p.defi_id] || null;
  });
  envTaxonomieChargee = true;
}
// Résout n'importe quel code de catégorie (ancien CATEGORIES codé en dur OU nouveau problème
// publié dynamiquement) vers un objet {id, label, icon} — ne renvoie jamais undefined, donc
// tous les appelants existants qui faisaient CATEGORIES.find(...) peuvent utiliser ceci à la
// place sans avoir à gérer un cas "introuvable" séparément.
function categorieMeta(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return cat;
  const p = ENV_PROBLEMES_INDEX[id];
  if (p) return { id, label: (p.nom && p.nom.fr) || id, icon: envIcon(p.icone) };
  return { id, label: id, icon: IconAlert };
}
function categorieLabel(lang, id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return (CATEGORIES_LABELS[lang] && CATEGORIES_LABELS[lang][id]) || cat.label;
  const p = ENV_PROBLEMES_INDEX[id];
  if (p && p.nom) return p.nom[lang] || p.nom.fr || id;
  return id;
}
function urgenceLabel(lang, id) {
  const u = URGENCE.find(x => x.id === id);
  if (!u) return id;
  return (URGENCE_LABELS[lang] && URGENCE_LABELS[lang][id]) || u.label;
}

// --- Phase 5 : rattachement de chaque signalement à sa fiche environnementale complète
// (point 8 du cahier des charges). Chargement à la demande (pas à chaque rendu de liste),
// mis en cache par code pour éviter de re-questionner la base à chaque ouverture.
let ENV_FICHE_CACHE = {};
async function chargerFicheComplete(code) {
  if (ENV_FICHE_CACHE[code] !== undefined) return ENV_FICHE_CACHE[code];
  const { data: probleme } = await supabase.from("env_problemes").select("*").eq("code", code).eq("statut", "publie").maybeSingle();
  if (!probleme) { ENV_FICHE_CACHE[code] = null; return null; }
  const { data: defi } = await supabase.from("env_defis").select("*").eq("id", probleme.defi_id).eq("statut", "publie").maybeSingle();
  const fiche = { probleme, defi };
  ENV_FICHE_CACHE[code] = fiche;
  return fiche;
}
function champTexte(champ) { return (champ && champ.fr) || ""; }
function champListe(champ) { return ((champ && champ.fr) || []).join(", "); }

function FicheEnvironnementale({ code }) {
  const [fiche, setFiche] = useState(undefined); // undefined = pas chargé, null = rien de publié pour ce code
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => { if (ouvert && fiche === undefined) chargerFicheComplete(code).then(setFiche); }, [ouvert]);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOuvert(o => !o)} style={{ fontSize: 10.5, color: "var(--c-accent-dark)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
        {ouvert ? "▾" : "▸"} Fiche environnementale
      </button>
      {ouvert && fiche === undefined && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>Chargement…</div>}
      {ouvert && fiche === null && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>Aucune fiche publiée pour ce problème.</div>}
      {ouvert && fiche && (
        <div style={{ fontSize: 11, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, marginTop: 4, lineHeight: 1.6 }}>
          {fiche.defi && <div><b>Défi :</b> {champTexte(fiche.defi.nom)}</div>}
          {champListe(fiche.probleme.causes_presumees) && <div><b>Causes probables :</b> {champListe(fiche.probleme.causes_presumees)}</div>}
          {champListe(fiche.probleme.impacts) && <div><b>Impacts :</b> {champListe(fiche.probleme.impacts)}</div>}
          {champTexte(fiche.probleme.action_recommandee) && <div><b>Action recommandée :</b> {champTexte(fiche.probleme.action_recommandee)}</div>}
          {champListe(fiche.probleme.indicateurs) && <div><b>Indicateurs :</b> {champListe(fiche.probleme.indicateurs)}</div>}
          {champTexte(fiche.probleme.resultat_attendu) && <div><b>Résultat attendu :</b> {champTexte(fiche.probleme.resultat_attendu)}</div>}
        </div>
      )}
    </div>
  );
}

const URGENCE = [
  { id: "faible", label: "Faible", color: "#4A8B6F" },
  { id: "moyenne", label: "Moyenne", color: "#E3A73B" },
  { id: "haute", label: "Haute", color: "#B5451B" },
];


function uid() { return Math.random().toString(36).slice(2, 10); }

/* ---------- File d'attente hors-ligne (signalements, arbres, observations) ----------
   Principe : si l'appareil est hors-ligne (ou si l'envoi échoue), l'action est
   stockée dans localStorage avec un identifiant temporaire, affichée immédiatement
   dans l'interface avec un badge "en attente", puis renvoyée automatiquement au
   retour du réseau (événement 'online' + vérification périodique de sécurité). */
const PENDING_QUEUE_KEY = "pace-pending-queue";

function loadPendingQueue() {
  try { return JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY) || "[]"); } catch (e) { return []; }
}
function savePendingQueue(q) {
  try { localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(q)); } catch (e) {
    // Quota localStorage dépassé (ex. trop de photos en attente) : on retire le plus ancien
    // pour laisser de la place au nouveau, plutôt que de perdre silencieusement l'action.
    try {
      const trimmed = q.slice(1);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(trimmed));
    } catch (e2) {}
  }
}
function enqueuePendingAction(type, payload) {
  const tempId = "pending-" + uid() + uid();
  const q = loadPendingQueue();
  q.push({ id: tempId, type, payload, queued_at: Date.now() });
  savePendingQueue(q);
  try { window.dispatchEvent(new Event("pace-queue-updated")); } catch (e) {}
  return tempId;
}
function dequeuePendingAction(tempId) {
  savePendingQueue(loadPendingQueue().filter(it => it.id !== tempId));
  try { window.dispatchEvent(new Event("pace-queue-updated")); } catch (e) {}
}

// ---- Enquêtes hors-ligne : dossiers éditables avant synchronisation, sur le même principe que
// PENDING_QUEUE_KEY ci-dessus, mais avec un contenu qu'on peut continuer à modifier (plusieurs
// sauvegardes locales successives) plutôt qu'une action figée à rejouer telle quelle.
const ENQ_OFFLINE_KEY = "ecovigil-enquetes-offline";
function loadOfflineEnquetes() {
  try { return JSON.parse(localStorage.getItem(ENQ_OFFLINE_KEY) || "{}"); } catch (e) { return {}; }
}
function saveOfflineEnquetes(map) {
  try { localStorage.setItem(ENQ_OFFLINE_KEY, JSON.stringify(map)); } catch (e) {
    // Quota localStorage dépassé (photos en attente) : on retire le dossier le plus ancien
    // déjà synchronisé plutôt que de perdre silencieusement la sauvegarde en cours.
    try {
      const entries = Object.entries(map).filter(([, r]) => r.statutSync === "synced").sort((a, b) => (a[1].updatedLocalAt || 0) - (b[1].updatedLocalAt || 0));
      const trimmed = { ...map }; if (entries[0]) delete trimmed[entries[0][0]];
      localStorage.setItem(ENQ_OFFLINE_KEY, JSON.stringify(trimmed));
    } catch (e2) {}
  }
  try { window.dispatchEvent(new Event("pace-enquetes-offline-updated")); } catch (e) {}
}
function getOfflineEnquete(localId) { return loadOfflineEnquetes()[localId] || null; }
function putOfflineEnquete(rec) { const m = loadOfflineEnquetes(); m[rec.localId] = rec; saveOfflineEnquetes(m); }
function removeOfflineEnquete(localId) { const m = loadOfflineEnquetes(); delete m[localId]; saveOfflineEnquetes(m); }

// Une seule entrée de file par dossier : évite les doublons si plusieurs sauvegardes locales
// s'enchaînent avant la prochaine synchronisation.
function enqueuePendingEnquete(localId) {
  const q = loadPendingQueue();
  if (q.some(it => it.type === "enquete" && it.payload && it.payload.localId === localId)) return;
  q.push({ id: "pending-" + uid() + uid(), type: "enquete", payload: { localId }, queued_at: Date.now() });
  savePendingQueue(q);
  try { window.dispatchEvent(new Event("pace-queue-updated")); } catch (e) {}
}

// Synchronise un dossier d'enquête hors-ligne (création ou mise à jour) puis ses preuves en
// attente. Ne synchronise jamais silencieusement par-dessus une modification faite ailleurs :
// si la version distante a changé depuis la dernière synchronisation locale, le dossier est
// marqué "conflit" et la synchronisation automatique s'arrête pour lui — seule une résolution
// manuelle (dans EnquetesStandard) peut la reprendre.
async function syncOneDossierEnquete(localId) {
  const rec = getOfflineEnquete(localId);
  if (!rec) return { remoteId: null, numero: null, conflict: false };
  if (rec.statutSync === "conflit") return { remoteId: rec.remoteId, numero: rec.numero, conflict: true };
  const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));
  const cols = { ...rec.cols, lat: num(rec.cols.lat), lng: num(rec.cols.lng), precision_gps_m: num(rec.cols.precision_gps_m), donnees: rec.donnees };
  let remoteId = rec.remoteId, baseUpdatedAt = rec.baseUpdatedAt;
  if (!remoteId) {
    const { data, error } = await supabase.from("enquete_dossiers").insert({ ...cols, statut: "brouillon", source: rec.source, organisation_id: rec.organisationId || null, cree_par: rec.creePar }).select().single();
    if (error) throw error;
    remoteId = data.id; baseUpdatedAt = data.updated_at;
    putOfflineEnquete({ ...getOfflineEnquete(localId), remoteId, baseUpdatedAt, numero: data.numero, statutSync: "synced" });
  } else {
    const { data: courant, error: e0 } = await supabase.from("enquete_dossiers").select("updated_at").eq("id", remoteId).single();
    if (e0) throw e0;
    if (baseUpdatedAt && courant.updated_at !== baseUpdatedAt) {
      const { data: distant } = await supabase.from("enquete_dossiers").select("*").eq("id", remoteId).single();
      putOfflineEnquete({ ...getOfflineEnquete(localId), statutSync: "conflit", conflitDistant: distant || null });
      try { window.dispatchEvent(new CustomEvent("pace-enquete-conflit", { detail: { localId } })); } catch (e) {}
      return { remoteId, numero: rec.numero, conflict: true }; // on s'arrête ici : ne jamais écraser silencieusement, une résolution humaine est requise
    }
    let res;
    if (rec.deviceId) res = await supabase.rpc("benevole_dossier_maj", { p_device: rec.deviceId, p_dossier: remoteId, p_donnees: rec.donnees, p_lat: cols.lat, p_lng: cols.lng, p_precision: cols.precision_gps_m, p_niveau: cols.niveau_constat, p_statut: cols.statut }).single();
    else res = await supabase.from("enquete_dossiers").update(cols).eq("id", remoteId).select().single();
    if (res.error) throw res.error;
    baseUpdatedAt = res.data.updated_at;
    putOfflineEnquete({ ...getOfflineEnquete(localId), remoteId, baseUpdatedAt, statutSync: "synced" });
  }
  // Preuves ajoutées hors connexion, pas encore associées côté serveur
  const enCours = getOfflineEnquete(localId);
  const restantes = [];
  for (const p of (enCours.preuvesLocales || [])) {
    try {
      let url = null;
      // La compression (recodage JPEG) ne s'applique qu'aux photos : appliquée à un
      // enregistrement audio ou tout autre type, elle le corromprait. Les autres types
      // sont envoyés tels quels, pour garantir que le fichier original n'est jamais modifié.
      if (p.dataUrl) url = await uploadPhotoGeneric(p.type === "photo" ? await compressImage(p.dataUrl, 1000, 0.7) : p.dataUrl, "enquetes");
      if (p.deviceId) { const r = await supabase.rpc("benevole_preuve_ajout", { p_device: p.deviceId, p_dossier: remoteId, p_type: p.type, p_description: p.description, p_url: url, p_nature: p.nature, p_capture_at: p.capture_at, p_lat: p.lat, p_lng: p.lng }); if (r.error) throw r.error; }
      else { const r = await supabase.from("enquete_dossier_preuves").insert({ dossier_id: remoteId, type: p.type, description: p.description, url, nature: p.nature, capture_at: p.capture_at, lat: p.lat, lng: p.lng, ajoute_par: p.ajoutePar }); if (r.error) throw r.error; }
    } catch (e) { restantes.push(p); }
  }
  // Transcriptions saisies hors connexion (voir TranscriptionAudio) : une par preuve
  // audio, avec son propre identifiant serveur une fois créée, pour permettre des
  // mises à jour successives du brouillon sans jamais dupliquer la transcription.
  const transcriptionsRestantes = {};
  for (const [preuveId, t] of Object.entries(enCours.transcriptionsLocales || {})) {
    try {
      if (!t.transcriptionId) {
        const r = enCours.deviceId
          ? await supabase.rpc("benevole_transcription_creer", { p_device: enCours.deviceId, p_preuve_id: preuveId, p_texte: t.texte })
          : await supabase.from("enquete_preuve_transcriptions").insert({ preuve_id: preuveId, dossier_id: remoteId, texte: t.texte }).select().single();
        if (r.error) throw r.error;
      } else {
        const r = enCours.deviceId
          ? await supabase.rpc("benevole_transcription_maj", { p_device: enCours.deviceId, p_transcription_id: t.transcriptionId, p_texte: t.texte })
          : await supabase.from("enquete_preuve_transcriptions").update({ texte: t.texte }).eq("id", t.transcriptionId);
        if (r.error) throw r.error;
      }
    } catch (e) { transcriptionsRestantes[preuveId] = t; }
  }
  const finRec = getOfflineEnquete(localId);
  const numero = finRec ? finRec.numero : rec.numero;
  if (finRec) putOfflineEnquete({ ...finRec, preuvesLocales: restantes, transcriptionsLocales: transcriptionsRestantes });
  if (restantes.length > 0 || Object.keys(transcriptionsRestantes).length > 0) throw new Error("Certaines preuves ou transcriptions n'ont pas pu être synchronisées");
  // Entièrement synchronisé : plus besoin de la copie locale, la lecture se fait désormais côté serveur.
  removeOfflineEnquete(localId);
  return { remoteId, numero, conflict: false };
}


async function logActivity(action, table, id, detail) {
  try {
    const s = getActiveSession();
    const acteur = s && s.user ? s.user.email : "inconnu";
    await supabase.from("activity_log").insert({ action, cible_table: table, cible_id: id ? String(id) : null, acteur, detail: detail || null });
  } catch (e) { /* journal best-effort, ne bloque jamais l'action principale */ }
}

// Statistiques d'usage par zone géographique (Centre d'EcoVigil) : à chaque ouverture de
// l'app, on résout une position approximative (ville/région/pays) à partir de l'adresse IP
// via un service public gratuit — jamais de GPS précis, jamais lié à une identité pour les
// citoyens anonymes (l'acteur du journal reste "inconnu" dans ce cas). Utilise le même journal
// "activity_log" que les autres actions plutôt qu'une nouvelle table, pour rester cohérent avec
// l'existant. Best-effort : une erreur réseau ne doit jamais gêner l'usage normal de l'app.
async function capturerConnexionParZone() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return;
    const data = await res.json();
    if (data.error) return;
    await logActivity("connexion", null, null, JSON.stringify({
      ville: data.city || null, region: data.region || null, pays: data.country_name || null,
    }));
  } catch (e) { /* pas de réseau / service indisponible : on abandonne silencieusement */ }
}

// Journal d'audit propre à un groupe de terrain (traçabilité missions/affiliation/reconnaissance,
// visible par les membres du groupe ET par son organisation affiliée — chaîne de redevabilité
// complète bénévole ↔ groupe ↔ organisation).
async function logGroupeAudit(groupeId, action, cibleType, cibleId, detail) {
  try {
    const acteur = (currentSession && currentSession.user) ? currentSession.user.email : DEVICE_ID;
    await supabase.from("gt_audit_log").insert({
      groupe_id: groupeId, action, cible_type: cibleType || null, cible_id: cibleId ? String(cibleId) : null,
      acteur, detail: detail || null,
    });
  } catch (e) { /* journal best-effort, ne bloque jamais l'action principale */ }
}

// Journal d'audit immuable (spécifique aux actions de modération sensibles : signalements).
// Exclusivement appelé depuis le Centre d'EcoVigil : on lit donc la session active (qui vaut
// toujours la session admin à ce moment-là) plutôt que la session citoyen.
async function logAudit(actionType, targetEntity, targetId, reason, metadata) {
  try {
    const s = getActiveSession();
    const adminId = s && s.user ? s.user.email : "inconnu";
    await supabase.from("audit_logs").insert({
      admin_id: adminId, action_type: actionType, target_entity: targetEntity, target_id: String(targetId),
      reason: reason || null, metadata: metadata || {},
      ip_address: "non disponible côté client", // le navigateur n'expose pas l'IP réelle ; nécessiterait un relai serveur
    });
  } catch (e) { /* journal best-effort, ne bloque jamais l'action principale */ }
}

// Demande de suppression de données (RGPD, écran Confidentialité citoyen) : simple insertion
// sans authentification requise, donc éligible à la même file d'attente hors-ligne que les
// signalements/arbres/observations/suivis. isReplay=true est utilisé par flushPendingQueue.
async function envoyerDemandeSuppression(opts) {
  opts = opts || {};
  if (!opts.isReplay && !navigator.onLine) {
    enqueuePendingAction("suppression", {});
    return;
  }
  try {
    const { error } = await supabase.from("demandes_suppression").insert({ device_id: DEVICE_ID, motif: "Demande depuis l'écran Confidentialité (citoyen)" });
    if (error) throw error;
    if (opts.tempId) dequeuePendingAction(opts.tempId);
  } catch (e) {
    if (opts.isReplay) { throw e; }
    console.error("Erreur d'envoi de la demande de suppression :", e);
    enqueuePendingAction("suppression", {});
  }
}

// Inscription bénévole (RPC benevole_inscrire) : le code d'organisation ne peut être vérifié
// que par le serveur. Hors-ligne, on met en file d'attente sans pouvoir garantir sa validité —
// si le code est erroné, l'échec n'apparaîtra qu'au rejeu (après plusieurs tentatives, l'élément
// est marqué "échoué" comme les autres types de file, voir flushPendingQueue).
async function inscrireBenevole(payload, opts) {
  opts = opts || {};
  if (!opts.isReplay && !navigator.onLine) {
    enqueuePendingAction("benevole", payload);
    return { queued: true };
  }
  const { error } = await supabase.rpc("benevole_inscrire", {
    p_id: payload.benevoleId, p_contact: payload.contactFinal, p_pays: payload.pays || null,
    p_ville: payload.ville || null, p_zone: payload.zone || null, p_device_id: DEVICE_ID, p_code: payload.code || null,
  });
  if (error) {
    if (opts.isReplay) { throw error; }
    if (!navigator.onLine) { enqueuePendingAction("benevole", payload); return { queued: true }; }
    return { queued: false, error };
  }
  if (opts.tempId) dequeuePendingAction(opts.tempId);
  return { queued: false, error: null };
}

const SUPABASE_URL = "https://dimdahhvgdwbluwbslzh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbWRhaGh2Z2R3Ymx1d2JzbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjIyOTcsImV4cCI6MjA5OTY5ODI5N30.DumlneB3r-YSsEeQ8Uc-g62-XdSwRX1xQjMcj2yzozI";
// --- Client Supabase maison, basé uniquement sur fetch() ---
// Remplace la bibliothèque officielle (chargée depuis jsdelivr.net, bloquée dans l'aperçu du chat)
// par un client minimal compatible avec l'API REST PostgREST + Auth + Storage de Supabase.
const REST_URL = SUPABASE_URL + "/rest/v1";
const AUTH_URL = SUPABASE_URL + "/auth/v1";
const STORAGE_URL = SUPABASE_URL + "/storage/v1";

let currentSession = null;
try { currentSession = JSON.parse(localStorage.getItem("pace-session") || "null"); } catch (e) { currentSession = null; }
let authListeners = [];

// ===== Session du Centre d'EcoVigil (admin), totalement indépendante de la session citoyen =====
// Stockage localStorage séparé + écouteurs séparés : avoir un profil citoyen connecté ne bloque
// jamais l'accès direct au Centre d'EcoVigil, et s'y connecter ne déconnecte jamais le profil
// citoyen. "activeIdentity" détermine laquelle des deux sessions restHeaders() /
// refreshSessionIfNeeded() / l'objet "auth" ci-dessous utilisent à un instant donné : il est
// basculé de façon strictement synchrone par App (enterAdminIdentity/exitAdminIdentity), avant
// même que le composant du Centre d'EcoVigil ne soit monté — jamais via un effet asynchrone qui
// pourrait s'exécuter dans le mauvais ordre.
let adminSession = null;
try { adminSession = JSON.parse(localStorage.getItem("pace-admin-session") || "null"); } catch (e) { adminSession = null; }
let adminAuthListeners = [];
// "admin" dès le chargement si l'URL contient déjà ?admin=1 (accès direct au Centre d'EcoVigil,
// typiquement une navigation fraîche vers ce lien) : indispensable pour que le tout premier appel
// à getSession()/getActiveSession(), déclenché par l'effet de montage du Centre d'EcoVigil, lise
// déjà le bon store — avant même que React n'ait eu l'occasion de monter le moindre composant.
let activeIdentity = (function () {
  try { return new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "citoyen"; } catch (e) { return "citoyen"; }
})(); // "citoyen" | "admin"
function enterAdminIdentity() { activeIdentity = "admin"; }
function exitAdminIdentity() { activeIdentity = "citoyen"; }
function getActiveSession() { return activeIdentity === "admin" ? adminSession : currentSession; }

function persistSession(session) {
  currentSession = session;
  try {
    if (session) localStorage.setItem("pace-session", JSON.stringify(session));
    else localStorage.removeItem("pace-session");
  } catch (e) {}
  authListeners.forEach((cb) => { try { cb(session ? "SIGNED_IN" : "SIGNED_OUT", session); } catch (e) {} });
}

function persistAdminSession(session) {
  adminSession = session;
  try {
    if (session) localStorage.setItem("pace-admin-session", JSON.stringify(session));
    else localStorage.removeItem("pace-admin-session");
  } catch (e) {}
  adminAuthListeners.forEach((cb) => { try { cb(session ? "SIGNED_IN" : "SIGNED_OUT", session); } catch (e) {} });
}

// Les méthodes signIn*/signUp/signOut/mfa.* ci-dessous sont écrites une seule fois et partagées
// entre le profil citoyen et le Centre d'EcoVigil : elles persistent toujours via cette fonction,
// qui redirige elle-même vers le bon stockage selon l'identité active au moment de l'appel.
function persistActiveSession(session) {
  if (activeIdentity === "admin") persistAdminSession(session);
  else persistSession(session);
}

function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp || null;
  } catch (e) { return null; }
}

let refreshInFlight = null;
async function refreshSessionIfNeeded() {
  const session = getActiveSession();
  if (!session || !session.refresh_token) return;
  const exp = decodeJwtExp(session.access_token);
  const now = Math.floor(Date.now() / 1000);
  if (exp && exp - now > 300) return; // encore valide plus de 5 minutes, rien à faire
  if (refreshInFlight) return refreshInFlight;
  const forAdmin = activeIdentity === "admin";
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.access_token) {
          const nouvelleSession = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user || session.user };
          if (forAdmin) persistAdminSession(nouvelleSession); else persistSession(nouvelleSession);
        }
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        // Le serveur a explicitement rejeté le refresh_token (révoqué / expiré / invalide) :
        // la session est définitivement morte. On la nettoie pour éviter un état incohérent
        // où l'app se croit connectée mais où chaque appel échouerait silencieusement.
        if (forAdmin) persistAdminSession(null); else persistSession(null);
      }
      // Toute autre erreur (5xx, réseau) est traitée comme transitoire : on garde la session
      // et on retentera au prochain cycle plutôt que de déconnecter sur un simple problème réseau.
    } catch (e) {
      // Échec réseau (fetch n'a pas abouti) : transitoire, on ne touche pas à la session.
    }
    refreshInFlight = null;
  })();
  return refreshInFlight;
}

function restHeaders(extra) {
  const session = getActiveSession();
  const token = session ? session.access_token : null;
  return Object.assign({ apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY) }, extra || {});
}

// --- Session "citoyen anonyme" (Supabase Anonymous Sign-in) ---------------------------------
// Distincte de currentSession (réservée à la connexion email/mot de passe des organisations et
// de l'admin) : sert uniquement à prouver, côté RLS, quel appareil est à l'origine d'une action
// en libre-service (créer/rouvrir/résoudre SES PROPRES signalements). Contrairement à DEVICE_ID
// (une simple chaîne générée côté client, visible de tous dans le flux public), cette session
// donne un vrai auth.uid() vérifiable par Postgres — impossible à usurper en lisant les données
// publiques. Nécessite que "Anonymous sign-ins" soit activé dans Authentication > Sign In / Providers.
let deviceSession = null;
try { deviceSession = JSON.parse(localStorage.getItem("pace-device-session") || "null"); } catch (e) { deviceSession = null; }

function persistDeviceSession(session) {
  deviceSession = session;
  try {
    if (session) localStorage.setItem("pace-device-session", JSON.stringify(session));
    else localStorage.removeItem("pace-device-session");
  } catch (e) {}
}

let deviceRefreshInFlight = null;
async function refreshDeviceSessionIfNeeded() {
  if (!deviceSession || !deviceSession.refresh_token) return;
  const exp = decodeJwtExp(deviceSession.access_token);
  const now = Math.floor(Date.now() / 1000);
  if (exp && exp - now > 300) return;
  if (deviceRefreshInFlight) return deviceRefreshInFlight;
  deviceRefreshInFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: deviceSession.refresh_token }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.access_token) persistDeviceSession({ access_token: json.access_token, refresh_token: json.refresh_token, user: json.user || deviceSession.user });
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        persistDeviceSession(null); // refresh_token révoqué/expiré : on en redemandera un neuf
      }
    } catch (e) { /* réseau indisponible : transitoire, on retentera plus tard */ }
    deviceRefreshInFlight = null;
  })();
  return deviceRefreshInFlight;
}

// Renvoie une session anonyme valide pour cet appareil, en (re)créant une le cas échéant.
// Renvoie null si hors-ligne ou si les connexions anonymes ne sont pas encore activées côté
// Supabase : les appelants doivent alors se comporter comme avant (ou avertir l'utilisateur).
async function ensureDeviceSession() {
  await refreshDeviceSessionIfNeeded();
  if (deviceSession && deviceSession.access_token) return deviceSession;
  try {
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ data: {}, gotrue_meta_security: {} }),
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (json && json.access_token) {
      const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
      persistDeviceSession(session);
      return session;
    }
  } catch (e) { /* pas de réseau : on retentera au prochain appel */ }
  return null;
}

class PaceQuery {
  constructor(table) {
    this.table = table;
    this.params = new URLSearchParams();
    this.method = "GET";
    this.body = undefined;
    this._single = false;
    this._maybe = false;
    this._head = false;
    this._countMode = null;
    this._upsert = false;
    this._onConflict = null;
    this._extraHeaders = null;
  }
  // Permet d'ajouter des en-têtes HTTP personnalisés à une requête précise (ex. "x-device-id"
  // pour prouver, côté RLS, quel appareil est à l'origine d'une mise à jour en libre-service).
  headers(obj) { this._extraHeaders = Object.assign(this._extraHeaders || {}, obj); return this; }
  select(cols, opts) {
    if (cols) this.params.set("select", cols);
    if (opts && opts.head) this._head = true;
    if (opts && opts.count) this._countMode = opts.count;
    return this;
  }
  eq(col, val) { this.params.append(col, "eq." + val); return this; }
  neq(col, val) { this.params.append(col, "neq." + val); return this; }
  not(col, op, val) { this.params.append(col, `not.${op}.${val === null ? "null" : val}`); return this; }
  gt(col, val) { this.params.append(col, "gt." + val); return this; }
  gte(col, val) { this.params.append(col, "gte." + val); return this; }
  lt(col, val) { this.params.append(col, "lt." + val); return this; }
  lte(col, val) { this.params.append(col, "lte." + val); return this; }
  is(col, val) { this.params.append(col, "is." + val); return this; }
  in(col, vals) { this.params.append(col, "in.(" + (vals || []).map(v => String(v)).join(",") + ")"); return this; }
  or(expr) { this.params.set("or", "(" + expr + ")"); return this; }
  order(col, opts) { this.params.set("order", col + ((opts && opts.ascending === false) ? ".desc" : ".asc")); return this; }
  limit(n) { this.params.set("limit", String(n)); return this; }
  insert(obj) { this.method = "POST"; this.body = obj; return this; }
  update(obj) { this.method = "PATCH"; this.body = obj; return this; }
  upsert(obj, opts) { this.method = "POST"; this.body = obj; this._upsert = true; this._onConflict = opts && opts.onConflict; return this; }
  delete() { this.method = "DELETE"; return this; }
  // Désactive le renvoi de la ligne affectée (Prefer: return=minimal au lieu de representation).
  // Indispensable quand l'appelant n'a pas de droit de LECTURE sur la table (ex. inscription
  // publique sur une table dont le SELECT est réservé aux admins) : demander la représentation
  // dans ce cas fait échouer l'écriture elle-même avec une erreur RLS, alors que l'écriture
  // seule (sans relecture) est parfaitement autorisée.
  returning(actif) { this._noReturn = actif === false; return this; }
  single() { this._single = true; return this; }
  maybeSingle() { this._single = true; this._maybe = true; return this; }
  then(resolve, reject) { return this._exec().then(resolve, reject); }
  catch(reject) { return this._exec().catch(reject); }
  finally(cb) { return this._exec().finally(cb); }
  async _exec() {
    await refreshSessionIfNeeded();
    if (this._upsert && this._onConflict) this.params.set("on_conflict", this._onConflict);
    let url = REST_URL + "/" + this.table;
    const qs = this.params.toString();
    if (qs) url += "?" + qs;

    const headers = restHeaders(Object.assign({ "Content-Type": "application/json" }, this._extraHeaders || {}));
    if (this._noReturn && (this.method === "POST" || this.method === "PATCH" || this.method === "DELETE")) {
      headers["Prefer"] = (this._upsert && this._onConflict ? "resolution=merge-duplicates," : "") + "return=minimal";
    } else if (this.method === "POST" || this.method === "PATCH") {
      headers["Prefer"] = (this._upsert ? "resolution=merge-duplicates," : "") + "return=representation";
    } else if (this.method === "DELETE") {
      headers["Prefer"] = "return=representation";
    } else if (this._head) {
      headers["Prefer"] = "count=" + (this._countMode || "exact");
    }

    try {
      const res = await fetch(url, {
        method: this._head ? "HEAD" : this.method,
        headers,
        body: this.body !== undefined ? JSON.stringify(this.body) : undefined,
      });
      if (this._head) {
        const range = res.headers.get("content-range") || "";
        const count = range.includes("/") ? parseInt(range.split("/")[1], 10) : null;
        return { data: null, error: res.ok ? null : { message: "Erreur serveur" }, count };
      }
      const text = await res.text();
      let json = null;
      if (text) { try { json = JSON.parse(text); } catch (e) { json = null; } }
      if (!res.ok) {
        const msg = (json && (json.message || json.error_description)) || "Erreur serveur";
        return { data: null, error: { message: msg } };
      }
      if (this._single) {
        const row = Array.isArray(json) ? (json[0] || null) : json;
        if (!row && !this._maybe) return { data: null, error: { message: "Aucune ligne trouvée" } };
        return { data: row, error: null };
      }
      return { data: json, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  }
}

const supabase = {
  from(table) { return new PaceQuery(table); },
  async rpc(fnName, params) {
    try {
      const res = await fetch(`${REST_URL}/rpc/${fnName}`, {
        method: "POST",
        headers: restHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(params || {}),
      });
      const text = await res.text();
      let json = null;
      if (text) { try { json = JSON.parse(text); } catch (e) { json = null; } }
      if (!res.ok) {
        const msg = (json && (json.message || json.error_description)) || "Erreur serveur";
        return { data: null, error: { message: msg } };
      }
      return { data: json, error: null };
    } catch (e) { return { data: null, error: { message: e.message } }; }
  },
  storage: {
    from(bucket) {
      return {
        async upload(path, blob, opts) {
          try {
            const res = await fetch(`${STORAGE_URL}/object/${bucket}/${path}`, {
              method: "POST",
              headers: restHeaders({ "Content-Type": (opts && opts.contentType) || "application/octet-stream" }),
              body: blob,
            });
            if (!res.ok) {
              let msg = "Échec de l'envoi";
              try { const j = await res.json(); msg = j.message || msg; } catch (e) {}
              return { data: null, error: { message: msg } };
            }
            return { data: { path }, error: null };
          } catch (e) { return { data: null, error: { message: e.message } }; }
        },
        getPublicUrl(path) {
          return { data: { publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` } };
        },
      };
    },
  },
  auth: {
    async getSession() { return { data: { session: getActiveSession() } }; },
    // S'abonne au store correspondant à l'identité active AU MOMENT de l'appel : comme
    // enterAdminIdentity()/exitAdminIdentity() sont toujours basculés de façon synchrone AVANT le
    // montage du composant concerné (voir App), le Centre d'EcoVigil s'abonne toujours à
    // adminAuthListeners et le reste de l'app (profil citoyen, organisation) toujours à
    // authListeners — chacun des deux écouteurs de haut niveau reste ainsi bien isolé de l'autre.
    onAuthStateChange(cb) {
      if (activeIdentity === "admin") {
        adminAuthListeners.push(cb);
        return { data: { subscription: { unsubscribe() { adminAuthListeners = adminAuthListeners.filter((f) => f !== cb); } } } };
      }
      authListeners.push(cb);
      return { data: { subscription: { unsubscribe() { authListeners = authListeners.filter((f) => f !== cb); } } } };
    },
    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { error: { message: json.error_description || json.msg || "Identifiants incorrects." } };
        const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
        persistActiveSession(session);
        return { data: { session }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async signInWithOtp({ email, options }) {
      try {
        const qs = (options && options.emailRedirectTo) ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/otp${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, create_user: true }),
        });
        if (!res.ok) { const j = await res.json().catch(() => ({})); return { error: { message: j.error_description || j.msg || "Erreur d'envoi." } }; }
        return { error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    // "redirectTo" (optionnel) : URL vers laquelle GoTrue redirige après clic sur le lien reçu par
    // e-mail. Si absent, GoTrue retombe sur le "Site URL" configuré dans le dashboard Supabase — une
    // dépendance fragile (un changement d'hébergeur, un renommage de domaine, etc. casse alors tous
    // les liens sans que le code ne change). On préfère donc, à chaque appel, transmettre explicitement
    // l'URL de la page actuellement chargée (window.location.origin + pathname), qui reste toujours
    // correcte quel que soit l'endroit où l'app est réellement servie.
    async signUp({ email, password, options }) {
      try {
        const body = { email, password };
        if (options && options.data) body.data = options.data;
        const qs = (options && options.emailRedirectTo) ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/signup${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail = json.error_description || json.msg || json.error || json.error_code || json.code;
          return { error: { message: (detail ? String(detail) : `Erreur d'inscription (HTTP ${res.status}).`), status: res.status, code: json.error_code || json.code } };
        }
        if (json.access_token) {
          const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
          persistActiveSession(session);
          return { data: { session, user: json.user }, error: null };
        }
        // Pas de session : confirmation par e-mail requise. GoTrue renvoie alors l'objet
        // utilisateur directement dans "json". Note anti-énumération : si l'e-mail est déjà
        // enregistré, GoTrue répond aussi sans erreur (pour ne pas révéler qu'un compte existe)
        // mais avec "identities: []" et n'envoie AUCUN e-mail — c'est ce cas qu'il faut détecter
        // côté appelant pour ne pas faire croire à tort qu'un e-mail de confirmation part.
        return { data: { session: null, user: json }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async signOut() { persistActiveSession(null); return { error: null }; },
    // Session anonyme Supabase (déjà activée sur ce projet) : sert de base d'identité stable
    // (auth.uid()) pour un membre d'organisation qui rejoint via un code d'invitation, sans
    // e-mail ni téléphone ni mot de passe.
    async signInAnonymously() {
      try {
        const res = await fetch(`${AUTH_URL}/signup`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || "Erreur de connexion." } };
        const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
        persistActiveSession(session);
        return { data: { session }, error: null };
      } catch (e) { return { data: null, error: { message: e.message } }; }
    },
    async resetPasswordForEmail(email, options) {
      try {
        const qs = (options && options.redirectTo) ? `?redirect_to=${encodeURIComponent(options.redirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/recover${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) { const j = await res.json().catch(() => ({})); return { error: { message: j.error_description || j.msg || "Erreur d'envoi." } }; }
        return { error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async updateUser({ password }, accessToken) {
      try {
        const res = await fetch(`${AUTH_URL}/user`, {
          method: "PUT",
          headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { error: { message: json.error_description || json.msg || "Erreur de mise à jour." } };
        return { data: { user: json }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    // ===== Double authentification (2FA / TOTP) =====
    // Utilise directement les endpoints MFA de GoTrue (compatibles avec supabase-js) : l'inscription
    // d'un facteur nécessite une session déjà active (mot de passe déjà vérifié) ; la vérification
    // d'un challenge élève ensuite le niveau d'assurance de la session (claim "aal" du JWT : aal1 →
    // aal2) et renouvelle les tokens.
    mfa: {
      async enroll({ factorType = "totp", friendlyName } = {}) {
        try {
          const res = await fetch(`${AUTH_URL}/factors`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
            body: JSON.stringify({ factor_type: factorType, friendly_name: friendlyName }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur d'activation de la double authentification." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      async challenge({ factorId }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}/challenge`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur lors de la demande de code." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      // accessToken optionnel : lors du step-up post-connexion, la session courante n'est encore
      // qu'au niveau aal1, on utilise donc explicitement ce token plutôt que la session active
      // (identique dans ce cas précis, gardé pour clarté et robustesse).
      async verify({ factorId, challengeId, code, accessToken }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}/verify`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (accessToken || (getActiveSession() && getActiveSession().access_token)), "Content-Type": "application/json" },
            body: JSON.stringify({ challenge_id: challengeId, code }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Code incorrect ou expiré." } };
          if (json.access_token) {
            const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
            persistActiveSession(session);
            return { data: { session }, error: null };
          }
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      async unenroll({ factorId }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}`, {
            method: "DELETE",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur lors de la suppression." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
    },
  },
};

// Décode le payload d'un JWT (base64url) pour lire son claim "aal" (Authenticator Assurance
// Level : "aal1" = mot de passe seul, "aal2" = mot de passe + second facteur vérifié). Ne fait
// aucune vérification de signature — usage limité à de l'affichage/contrôle de flux côté client,
// jamais à une décision de sécurité qui devrait être re-vérifiée côté serveur (RLS Postgres via
// auth.jwt()->>'aal', déjà le cas pour les policies Supabase sensibles).
// URL de la page actuellement chargée (sans hash/paramètres), utilisée comme cible de redirection
// pour les e-mails d'authentification (confirmation, réinitialisation...) — reste toujours correcte
// quel que soit l'hébergeur réel de l'app (Netlify, GitHub Pages, domaine personnalisé...), sans
// dépendre du "Site URL" configuré côté dashboard Supabase.
function urlRedirectionAuth(admin) {
  return window.location.origin + window.location.pathname + (admin ? "?admin=1" : "");
}

function decoderJwtPayload(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) { return null; }
}

function getDeviceId() {
  try {
    let id = localStorage.getItem("pace-device-id");
    if (!id) { id = uid() + uid(); localStorage.setItem("pace-device-id", id); }
    return id;
  } catch (e) {
    // localStorage inaccessible (ex. aperçu en iframe restreinte) : identifiant en mémoire pour cette session
    return "temp-" + uid() + uid();
  }
}
const DEVICE_ID = getDeviceId();

// Renvoie les renseignements du bénévole inscrit sur cet appareil (nom, contact, pays, ville,
// quartier), mis en cache lors de l'inscription — ou null si l'appareil n'a jamais rempli le
// formulaire bénévole. Utilisé pour accompagner automatiquement ses signalements.
function getBenevoleInfo() {
  try {
    const raw = localStorage.getItem("pace-benevole-info");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

// --- Point 3 : accessibilité — dictionnaire de traduction (FR par défaut, EN en premier palier).
// Couvre la navigation principale et les titres d'écran ; le reste de l'app reste en français pour l'instant.
const TRANSLATIONS = {
  fr: {
    nav_accueil: "Accueil", nav_carte: "Carte", nav_arbre: "Arbre", nav_classement: "Classement", nav_plus: "Plus",
    title_accueil: "Tableau de bord", sub_accueil: "Ensemble pour un avenir durable.",
    title_carte: "Carte", title_arbre: "Mon Arbre", sub_arbre: "Enregistre, géolocalise et suis la croissance de tes arbres.",
    title_classement: "Classement", title_admin: "Centre d'EcoVigil",
    stat_arbres: "Arbres plantés", stat_signalements: "Signalements", stat_resolus: "Résolus", stat_co2: "CO₂ évité (estimé)",
    btn_nouveau_signalement: "Nouveau signalement", btn_planter: "Enregistrer un arbre planté",
    lang_label: "Langue",
    plateforme_desc: "Plateforme Africaine d'Actions et de Contrôle Environnemental", logo_pace_alt: "Logo EcoVigil", devise_ecovigil: "Observer • Signaler • Protéger",
    annuler: "Annuler", enregistrer: "Enregistrer", envoyer: "Envoyer", fermer: "Fermer", continuer: "Continuer",
    title_biodiversite: "Biodiversité", sub_biodiversite: "Observe et documente la faune et la flore autour de toi.",
    aucune_observation: "Aucune observation pour le moment.",
    retour: "← Retour", sub_biodiv2: "Observe et partage les espèces autour de toi.", signaler_observation: "Signaler une observation",
    photo_espece: "Photo de l'espèce", espece_placeholder: "Espèce observée (ex : Calao, Perroquet gris...)",
    remarques_placeholder: "Remarques (optionnel)", envoi_en_cours: "Envoi...", aucune_observation_partagee: "Aucune observation partagée pour l'instant.",
    title_signaler: "Signaler un problème", sub_signaler: "Décris ce que tu observes autour de toi.",
    urgence_label: "Niveau d'urgence", photo_label: "Photo", ajouter_photo: "Ajouter une photo", description_label: "Description",
    decrire_situation: "Décris la situation...", gps_auto: "Position GPS jointe automatiquement",
    envoyer_signalement: "Envoyer le signalement", signalement_envoye: "Signalement envoyé", merci_equipe: "Merci, notre équipe va l'examiner.",
    meteo_locale: "Météo locale", alerte_pluie: "Fortes pluies possibles — évite les zones inondables.", alerte_chaleur: "Chaleur extrême — hydrate-toi et évite le soleil direct.",
    activer_notifs: "Activer les notifications pour suivre tes signalements",
    assistant_titre: "Assistant de Décisions Environnementales", assistant_sub: "Identifie une espèce, pose une question environnementale",
    actualites: "Actualités", signalements_resolus: "Signalements résolus",
    activite_recente: "Activité récente", rien_signaler: "Rien à signaler pour l'instant. Fais ton premier signalement ou plante ton premier arbre.",
    resolu: "Résolu", en_attente: "En attente", traite_par: "✓ Traité par",
    marquer_resolu_signaleur: "Marquer comme résolu", remettre_en_attente_signaleur: "Remettre en attente",
    centre_controle: "Centre d'EcoVigil", apropos_confidentialite: "À propos & Confidentialité",
    devenir_benevole: "Devenir bénévole", inscription_recue: "Inscription reçue ! Ton accès sera activé après validation par un administrateur.",
    rejoindre_equipe: "Rejoins l'équipe locale EcoVigil et participe aux campagnes de terrain.", sinscrire: "S'inscrire",
    nom_complet: "Nom complet", telephone_email: "Téléphone ou e-mail", pays_label: "Pays", ville_label: "Ville",
    quartier_zone: "Quartier / zone (optionnel)", confirmer_inscription: "Confirmer l'inscription", indicatif_associe: "Indicatif associé : ", inscription_echec: "L'inscription n'a pas pu être envoyée. Vérifie ta connexion.",
    titre_carte_intelligente: "Carte environnementale intelligente",
    sub_carte_intelligente: "Active les couches qui t'intéressent pour voir les données réelles autour de toi.",
    en_ligne: "En ligne",
    hors_ligne: "Hors ligne",
    en_attente_synchro: "en attente de synchro — toucher pour réessayer",
    couches_btn: "Couches",
    filtres_btn: "Filtres",
    outils_btn: "Outils",
    ajouter_btn: "Ajouter",
    rechercher_btn: "Rechercher",
    parcours_btn: "Parcours",
    toucher_carte_ajouter: "Touche un point sur la carte pour y ajouter une donnée.",
    point_choisi_prefix: "Point choisi : ",
    point_choisi_suffix: " — que veux-tu ajouter ?",
    type_signalement: "Signalement",
    type_arbre: "Arbre",
    type_observation: "Observation",
    type_zone: "Zone",
    description_optionnel: "Description (optionnel)",
    essence_nom_arbre: "Essence / nom de l'arbre",
    espece_observee_placeholder: "Espèce observée",
    nom_zone_placeholder: "Nom de la zone",
    retour_btn: "Retour",
    enregistrement_encours: "Enregistrement…",
    annuler_ajout: "Annuler l'ajout",
    rechercher_placeholder: "Rechercher un arbre, un signalement, un lieu…",
    donnees_pace: "Données EcoVigil",
    lieux_osm: "Lieux (OpenStreetMap)",
    recherche_encours: "Recherche…",
    aucun_resultat: "Aucun résultat.",
    filtres_titre: "Filtres",
    toutes_categories: "Toutes les catégories",
    tous_statuts: "Tous les statuts",
    statut_en_cours: "En cours",
    depuis_le: "Depuis le",
    reinitialiser_filtres: "Réinitialiser les filtres",
    quitter_plein_ecran: "Quitter le plein écran",
    plein_ecran: "Plein écran",
    vue_satellite: "Vue satellite",
    me_geolocaliser: "Me géolocaliser",
    gps_detaille: "GPS détaillé",
    aucune_description: "Aucune description.",
    observation_biodiversite: "Observation de biodiversité",
    plante_le: "Planté le ",
    zones_enregistrees_local: "Zones enregistrées (local)",
    projets_suivi_admin: "Projets et suivi-évaluation : réservés au Centre d'EcoVigil, non affichés ici.",
    layer_arbres: "Arbres",
    layer_signalements: "Autres atteintes environnementales",
    layer_dechets: "Déchets et décharges",
    layer_pollution: "Pollution",
    layer_biodiversite: "Biodiversité",
    layer_deforestation: "Déforestation",
    layer_mine: "Exploitation minière",
    layer_pollution_eau: "Pollution des cours d'eau",
    layer_assechement: "Assèchement des points d'eau",
    layer_deversement: "Déversements polluants",
    apercu_photo: "Aperçu",
    legend_toi: "Toi", legend_arbre_plante: "Arbre planté",
    gps_recherche_signal: "Recherche du signal GPS…", gps_precision_label: "Précision", gps_lat_label: "Lat", gps_lng_label: "Lng",
    gps_altitude_label: "Altitude", gps_vitesse_label: "Vitesse", gps_cap_label: "Cap",
    geoloc_non_supportee: "Ton navigateur ne prend pas en charge la géolocalisation.",
    geoloc_contexte_securise: "La géolocalisation nécessite une connexion sécurisée (https://).",
    geoloc_refusee: "Localisation refusée. Autorise l'accès à ta position dans les réglages du navigateur, puis réessaie.",
    geoloc_indisponible: "Position indisponible pour le moment. Vérifie que la localisation est activée sur ton appareil.",
    geoloc_timeout: "La localisation a pris trop de temps. Réessaie.", geoloc_en_cours: "Localisation en cours…",
    toi_ici: "Toi, ici", aucune_couche_active: "Active une couche ci-dessus pour afficher des données sur la carte.",
    en_attente_validation: "En attente de validation — visible par toi seulement",
    zone_enregistree_localement: "Zone enregistrée localement",
    tableau_bord_zone: "Tableau de bord de la zone affichée", stat_donnees_affichees: "Données affichées",
    note_reboisement: "Projets et superficie de reboisement : non affichés ici (pas de coordonnées de zone associées aux projets). Disponibles dans le Suivi-Éval GAR.",
    climat_chargement: "Chargement des données climatiques…", climat_indisponible: "Données climatiques indisponibles pour ce point.",
    climat_erreur_reseau: "Impossible de récupérer les données climatiques (réseau).", climat_actuel_title: "Climat actuel (Open-Meteo)",
    climat_temperature: "Température", climat_precipitations: "Précipitations", climat_vent: "Vent",
    observation_generique: "Observation", non_identifiee: "Non identifiée", zone_sans_nom: "Zone sans nom",
    hors_ligne_banner: "Hors-ligne — tes données restent enregistrées sur ce téléphone", hors_ligne_banner_attente: "en attente d'envoi",
    envoi_en_cours_prefix: "Envoi de", envoi_attente_suffix: "élément(s) en attente…",
  },
  en: {
    nav_accueil: "Home", nav_carte: "Map", nav_arbre: "Tree", nav_classement: "Leaderboard", nav_plus: "More",
    title_accueil: "Dashboard", sub_accueil: "Together for a sustainable future.",
    title_carte: "Map", title_arbre: "My Tree", sub_arbre: "Register, locate and track your trees' growth.",
    title_classement: "Leaderboard", title_admin: "EcoVigil Center",
    stat_arbres: "Trees planted", stat_signalements: "Reports", stat_resolus: "Resolved", stat_co2: "CO₂ avoided (estimate)",
    btn_nouveau_signalement: "New report", btn_planter: "Register a planted tree",
    lang_label: "Language",
    plateforme_desc: "African Platform for Environmental Action and Monitoring", logo_pace_alt: "EcoVigil logo", devise_ecovigil: "Observe • Report • Protect",
    annuler: "Cancel", enregistrer: "Save", envoyer: "Send", fermer: "Close", continuer: "Continue",
    title_biodiversite: "Biodiversity", sub_biodiversite: "Observe and document the flora and fauna around you.",
    aucune_observation: "No observation yet.",
    retour: "← Back", sub_biodiv2: "Observe and share the species around you.", signaler_observation: "Report an observation",
    photo_espece: "Species photo", espece_placeholder: "Species observed (e.g. Hornbill, Grey parrot...)",
    remarques_placeholder: "Notes (optional)", envoi_en_cours: "Sending...", aucune_observation_partagee: "No observation shared yet.",
    title_signaler: "Report a problem", sub_signaler: "Describe what you observe around you.",
    urgence_label: "Urgency level", photo_label: "Photo", ajouter_photo: "Add a photo", description_label: "Description",
    decrire_situation: "Describe the situation...", gps_auto: "GPS position attached automatically",
    envoyer_signalement: "Send report", signalement_envoye: "Report sent", merci_equipe: "Thank you, our team will review it.",
    meteo_locale: "Local weather", alerte_pluie: "Heavy rain possible — avoid flood-prone areas.", alerte_chaleur: "Extreme heat — stay hydrated and avoid direct sun.",
    activer_notifs: "Enable notifications to track your reports",
    assistant_titre: "Environmental Decision Assistant", assistant_sub: "Identify a species, ask an environmental question",
    actualites: "News", signalements_resolus: "Resolved reports",
    activite_recente: "Recent activity", rien_signaler: "Nothing to report yet. Make your first report or plant your first tree.",
    resolu: "Resolved", en_attente: "Pending", traite_par: "✓ Handled by",
    marquer_resolu_signaleur: "Mark as resolved", remettre_en_attente_signaleur: "Reopen",
    centre_controle: "EcoVigil Center", apropos_confidentialite: "About & Privacy",
    devenir_benevole: "Become a volunteer", inscription_recue: "Registration received! Your access will be activated once an administrator approves it.",
    rejoindre_equipe: "Join the local EcoVigil team and take part in field campaigns.", sinscrire: "Sign up",
    nom_complet: "Full name", telephone_email: "Phone or email", pays_label: "Country", ville_label: "City",
    quartier_zone: "Neighborhood / area (optional)", confirmer_inscription: "Confirm registration", indicatif_associe: "Linked dialing code: ", inscription_echec: "Registration could not be sent. Check your connection.",
    titre_carte_intelligente: "Smart environmental map",
    sub_carte_intelligente: "Turn on the layers you're interested in to see real data around you.",
    en_ligne: "Online",
    hors_ligne: "Offline",
    en_attente_synchro: "pending sync — tap to retry",
    couches_btn: "Layers",
    filtres_btn: "Filters",
    outils_btn: "Tools",
    ajouter_btn: "Add",
    rechercher_btn: "Search",
    parcours_btn: "Trail",
    toucher_carte_ajouter: "Tap a point on the map to add data there.",
    point_choisi_prefix: "Point selected: ",
    point_choisi_suffix: " — what would you like to add?",
    type_signalement: "Report",
    type_arbre: "Tree",
    type_observation: "Observation",
    type_zone: "Zone",
    description_optionnel: "Description (optional)",
    essence_nom_arbre: "Species / tree name",
    espece_observee_placeholder: "Species observed",
    nom_zone_placeholder: "Zone name",
    retour_btn: "Back",
    enregistrement_encours: "Saving…",
    annuler_ajout: "Cancel add",
    rechercher_placeholder: "Search a tree, report, place…",
    donnees_pace: "EcoVigil data",
    lieux_osm: "Places (OpenStreetMap)",
    recherche_encours: "Searching…",
    aucun_resultat: "No results.",
    filtres_titre: "Filters",
    toutes_categories: "All categories",
    tous_statuts: "All statuses",
    statut_en_cours: "In progress",
    depuis_le: "Since",
    reinitialiser_filtres: "Reset filters",
    quitter_plein_ecran: "Exit fullscreen",
    plein_ecran: "Fullscreen",
    vue_satellite: "Satellite view",
    me_geolocaliser: "Locate me",
    gps_detaille: "Detailed GPS",
    aucune_description: "No description.",
    observation_biodiversite: "Biodiversity observation",
    plante_le: "Planted on ",
    zones_enregistrees_local: "Saved zones (local)",
    projets_suivi_admin: "Projects and monitoring: reserved for the EcoVigil Control Center, not shown here.",
    layer_arbres: "Trees",
    layer_signalements: "Reports (other)",
    layer_dechets: "Waste",
    layer_pollution: "Pollution",
    layer_biodiversite: "Biodiversity",
    apercu_photo: "Preview",
    legend_toi: "You", legend_arbre_plante: "Planted tree",
    gps_recherche_signal: "Searching for GPS signal…", gps_precision_label: "Accuracy", gps_lat_label: "Lat", gps_lng_label: "Lng",
    gps_altitude_label: "Altitude", gps_vitesse_label: "Speed", gps_cap_label: "Heading",
    geoloc_non_supportee: "Your browser doesn't support geolocation.",
    geoloc_contexte_securise: "Geolocation requires a secure connection (https://).",
    geoloc_refusee: "Location denied. Allow access to your position in your browser settings, then try again.",
    geoloc_indisponible: "Position unavailable right now. Check that location is enabled on your device.",
    geoloc_timeout: "Locating took too long. Try again.", geoloc_en_cours: "Locating…",
    toi_ici: "You, here", aucune_couche_active: "Turn on a layer above to display data on the map.",
    en_attente_validation: "Pending review — visible to you only",
    zone_enregistree_localement: "Zone saved locally",
    tableau_bord_zone: "Dashboard for the displayed area", stat_donnees_affichees: "Data displayed",
    note_reboisement: "Reforestation projects and areas: not shown here (no zone coordinates linked to projects). Available in the GAR Monitoring & Evaluation.",
    climat_chargement: "Loading climate data…", climat_indisponible: "Climate data unavailable for this point.",
    climat_erreur_reseau: "Unable to retrieve climate data (network).", climat_actuel_title: "Current climate (Open-Meteo)",
    climat_temperature: "Temperature", climat_precipitations: "Precipitation", climat_vent: "Wind",
    observation_generique: "Observation", non_identifiee: "Not identified", zone_sans_nom: "Unnamed zone",
    hors_ligne_banner: "Offline — your data stays saved on this phone", hors_ligne_banner_attente: "pending",
    envoi_en_cours_prefix: "Sending", envoi_attente_suffix: "item(s) pending…",
  },
  pt: {
    nav_accueil: "Início", nav_carte: "Mapa", nav_arbre: "Árvore", nav_classement: "Classificação", nav_plus: "Mais",
    title_accueil: "Painel", sub_accueil: "Juntos por um futuro sustentável.",
    title_carte: "Mapa", title_arbre: "Minha Árvore", sub_arbre: "Regista, localiza e acompanha o crescimento das tuas árvores.",
    title_classement: "Classificação", title_admin: "Centro EcoVigil",
    stat_arbres: "Árvores plantadas", stat_signalements: "Ocorrências", stat_resolus: "Resolvidas", stat_co2: "CO₂ evitado (estimado)",
    btn_nouveau_signalement: "Nova ocorrência", btn_planter: "Registar uma árvore plantada",
    lang_label: "Idioma",
    plateforme_desc: "Plataforma Africana de Ações e Controlo Ambiental", logo_pace_alt: "Logótipo EcoVigil", devise_ecovigil: "Observar • Denunciar • Proteger",
    annuler: "Cancelar", enregistrer: "Guardar", envoyer: "Enviar", fermer: "Fechar", continuer: "Continuar",
    title_biodiversite: "Biodiversidade", sub_biodiversite: "Observa e documenta a fauna e a flora à tua volta.",
    aucune_observation: "Ainda sem observações.",
    retour: "← Voltar", sub_biodiv2: "Observa e partilha as espécies à tua volta.", signaler_observation: "Reportar uma observação",
    photo_espece: "Foto da espécie", espece_placeholder: "Espécie observada (ex: Calau, Papagaio-cinzento...)",
    remarques_placeholder: "Notas (opcional)", envoi_en_cours: "A enviar...", aucune_observation_partagee: "Ainda nenhuma observação partilhada.",
    title_signaler: "Reportar um problema", sub_signaler: "Descreve o que observas à tua volta.",
    urgence_label: "Nível de urgência", photo_label: "Foto", ajouter_photo: "Adicionar uma foto", description_label: "Descrição",
    decrire_situation: "Descreve a situação...", gps_auto: "Posição GPS anexada automaticamente",
    envoyer_signalement: "Enviar ocorrência", signalement_envoye: "Ocorrência enviada", merci_equipe: "Obrigado, a nossa equipa vai analisar.",
    meteo_locale: "Clima local", alerte_pluie: "Chuvas fortes possíveis — evita zonas inundáveis.", alerte_chaleur: "Calor extremo — hidrata-te e evita o sol direto.",
    activer_notifs: "Ativar notificações para acompanhar as tuas ocorrências",
    assistant_titre: "Assistente de Decisões Ambientais", assistant_sub: "Identifica uma espécie, coloca uma questão ambiental",
    actualites: "Notícias", signalements_resolus: "Ocorrências resolvidas",
    activite_recente: "Atividade recente", rien_signaler: "Nada a reportar por enquanto. Faz a tua primeira ocorrência ou planta a tua primeira árvore.",
    resolu: "Resolvido", en_attente: "Pendente", traite_par: "✓ Tratado por",
    centre_controle: "Centro EcoVigil", apropos_confidentialite: "Sobre & Privacidade",
    devenir_benevole: "Tornar-me voluntário", inscription_recue: "Inscrição recebida! O teu acesso será ativado após aprovação de um administrador.",
    rejoindre_equipe: "Junta-te à equipa local EcoVigil e participa nas campanhas de campo.", sinscrire: "Inscrever-me",
    nom_complet: "Nome completo", telephone_email: "Telefone ou e-mail", pays_label: "País", ville_label: "Cidade",
    quartier_zone: "Bairro / zona (opcional)", confirmer_inscription: "Confirmar inscrição", indicatif_associe: "Indicativo associado: ", inscription_echec: "Não foi possível enviar a inscrição. Verifica a tua ligação.",
    titre_carte_intelligente: "Mapa ambiental inteligente",
    sub_carte_intelligente: "Ativa as camadas que te interessam para ver dados reais à tua volta.",
    en_ligne: "Online",
    hors_ligne: "Offline",
    en_attente_synchro: "aguardando sincronização — toca para tentar novamente",
    couches_btn: "Camadas",
    filtres_btn: "Filtros",
    outils_btn: "Ferramentas",
    ajouter_btn: "Adicionar",
    rechercher_btn: "Pesquisar",
    parcours_btn: "Percurso",
    toucher_carte_ajouter: "Toca num ponto no mapa para adicionar dados aí.",
    point_choisi_prefix: "Ponto escolhido: ",
    point_choisi_suffix: " — o que queres adicionar?",
    type_signalement: "Ocorrência",
    type_arbre: "Árvore",
    type_observation: "Observação",
    type_zone: "Zona",
    description_optionnel: "Descrição (opcional)",
    essence_nom_arbre: "Espécie / nome da árvore",
    espece_observee_placeholder: "Espécie observada",
    nom_zone_placeholder: "Nome da zona",
    retour_btn: "Voltar",
    enregistrement_encours: "A guardar…",
    annuler_ajout: "Cancelar adição",
    rechercher_placeholder: "Pesquisar uma árvore, ocorrência, local…",
    donnees_pace: "Dados EcoVigil",
    lieux_osm: "Locais (OpenStreetMap)",
    recherche_encours: "A pesquisar…",
    aucun_resultat: "Sem resultados.",
    filtres_titre: "Filtros",
    toutes_categories: "Todas as categorias",
    tous_statuts: "Todos os estados",
    statut_en_cours: "Em curso",
    depuis_le: "Desde",
    reinitialiser_filtres: "Repor filtros",
    quitter_plein_ecran: "Sair do ecrã inteiro",
    plein_ecran: "Ecrã inteiro",
    vue_satellite: "Vista de satélite",
    me_geolocaliser: "Localizar-me",
    gps_detaille: "GPS detalhado",
    aucune_description: "Sem descrição.",
    observation_biodiversite: "Observação de biodiversidade",
    plante_le: "Plantada em ",
    zones_enregistrees_local: "Zonas guardadas (local)",
    projets_suivi_admin: "Projetos e monitorização: reservados ao Centro de Controlo EcoVigil, não mostrados aqui.",
    layer_arbres: "Árvores",
    layer_signalements: "Ocorrências (outras)",
    layer_dechets: "Resíduos",
    layer_pollution: "Poluição",
    layer_biodiversite: "Biodiversidade",
    apercu_photo: "Pré-visualização",
    legend_toi: "Tu", legend_arbre_plante: "Árvore plantada",
    gps_recherche_signal: "A procurar sinal GPS…", gps_precision_label: "Precisão", gps_lat_label: "Lat", gps_lng_label: "Lng",
    gps_altitude_label: "Altitude", gps_vitesse_label: "Velocidade", gps_cap_label: "Rumo",
    geoloc_non_supportee: "O teu navegador não suporta geolocalização.",
    geoloc_contexte_securise: "A geolocalização requer uma ligação segura (https://).",
    geoloc_refusee: "Localização recusada. Autoriza o acesso à tua posição nas definições do navegador e tenta novamente.",
    geoloc_indisponible: "Posição indisponível de momento. Verifica se a localização está ativada no teu dispositivo.",
    geoloc_timeout: "A localização demorou demasiado tempo. Tenta novamente.", geoloc_en_cours: "A localizar…",
    toi_ici: "Tu, aqui", aucune_couche_active: "Ativa uma camada acima para mostrar dados no mapa.",
    en_attente_validation: "Aguarda validação — visível apenas para ti",
    zone_enregistree_localement: "Zona guardada localmente",
    tableau_bord_zone: "Painel da área apresentada", stat_donnees_affichees: "Dados apresentados",
    note_reboisement: "Projetos e área de reflorestação: não apresentados aqui (sem coordenadas de zona associadas aos projetos). Disponíveis no Acompanhamento-Avaliação GAR.",
    climat_chargement: "A carregar dados climáticos…", climat_indisponible: "Dados climáticos indisponíveis para este ponto.",
    climat_erreur_reseau: "Não foi possível obter os dados climáticos (rede).", climat_actuel_title: "Clima atual (Open-Meteo)",
    climat_temperature: "Temperatura", climat_precipitations: "Precipitação", climat_vent: "Vento",
    observation_generique: "Observação", non_identifiee: "Não identificada", zone_sans_nom: "Zona sem nome",
    hors_ligne_banner: "Offline — os teus dados ficam guardados neste telemóvel", hors_ligne_banner_attente: "por enviar",
    envoi_en_cours_prefix: "A enviar", envoi_attente_suffix: "elemento(s) por enviar…",
  },
  es: {
    nav_accueil: "Inicio", nav_carte: "Mapa", nav_arbre: "Árbol", nav_classement: "Clasificación", nav_plus: "Más",
    title_accueil: "Panel", sub_accueil: "Juntos por un futuro sostenible.",
    title_carte: "Mapa", title_arbre: "Mi Árbol", sub_arbre: "Registra, ubica y sigue el crecimiento de tus árboles.",
    title_classement: "Clasificación", title_admin: "Centro EcoVigil",
    stat_arbres: "Árboles plantados", stat_signalements: "Reportes", stat_resolus: "Resueltos", stat_co2: "CO₂ evitado (estimado)",
    btn_nouveau_signalement: "Nuevo reporte", btn_planter: "Registrar un árbol plantado",
    lang_label: "Idioma",
    plateforme_desc: "Plataforma Africana de Acción y Control Ambiental", logo_pace_alt: "Logo de EcoVigil", devise_ecovigil: "Observar • Denunciar • Proteger",
    annuler: "Cancelar", enregistrer: "Guardar", envoyer: "Enviar", fermer: "Cerrar", continuer: "Continuar",
    title_biodiversite: "Biodiversidad", sub_biodiversite: "Observa y documenta la fauna y flora a tu alrededor.",
    aucune_observation: "Aún no hay observaciones.",
    retour: "← Volver", sub_biodiv2: "Observa y comparte las especies a tu alrededor.", signaler_observation: "Reportar una observación",
    photo_espece: "Foto de la especie", espece_placeholder: "Especie observada (ej: Cálao, Loro gris...)",
    remarques_placeholder: "Notas (opcional)", envoi_en_cours: "Enviando...", aucune_observation_partagee: "Aún no hay observaciones compartidas.",
    title_signaler: "Reportar un problema", sub_signaler: "Describe lo que observas a tu alrededor.",
    urgence_label: "Nivel de urgencia", photo_label: "Foto", ajouter_photo: "Añadir una foto", description_label: "Descripción",
    decrire_situation: "Describe la situación...", gps_auto: "Posición GPS adjuntada automáticamente",
    envoyer_signalement: "Enviar reporte", signalement_envoye: "Reporte enviado", merci_equipe: "Gracias, nuestro equipo lo revisará.",
    meteo_locale: "Clima local", alerte_pluie: "Posibles lluvias fuertes — evita zonas inundables.", alerte_chaleur: "Calor extremo — hidrátate y evita el sol directo.",
    activer_notifs: "Activar notificaciones para seguir tus reportes",
    assistant_titre: "Asistente de Decisiones Ambientales", assistant_sub: "Identifica una especie, haz una pregunta ambiental",
    actualites: "Noticias", signalements_resolus: "Reportes resueltos",
    activite_recente: "Actividad reciente", rien_signaler: "Nada que reportar por ahora. Haz tu primer reporte o planta tu primer árbol.",
    resolu: "Resuelto", en_attente: "Pendiente", traite_par: "✓ Atendido por",
    centre_controle: "Centro EcoVigil", apropos_confidentialite: "Acerca de & Privacidad",
    devenir_benevole: "Ser voluntario", inscription_recue: "¡Inscripción recibida! Tu acceso se activará tras la aprobación de un administrador.",
    rejoindre_equipe: "Únete al equipo local de EcoVigil y participa en campañas de campo.", sinscrire: "Inscribirme",
    nom_complet: "Nombre completo", telephone_email: "Teléfono o correo", pays_label: "País", ville_label: "Ciudad",
    quartier_zone: "Barrio / zona (opcional)", confirmer_inscription: "Confirmar inscripción", indicatif_associe: "Prefijo asociado: ", inscription_echec: "No se pudo enviar la inscripción. Verifica tu conexión.",
    titre_carte_intelligente: "Mapa ambiental inteligente",
    sub_carte_intelligente: "Activa las capas que te interesan para ver datos reales a tu alrededor.",
    en_ligne: "En línea",
    hors_ligne: "Sin conexión",
    en_attente_synchro: "pendiente de sincronizar — toca para reintentar",
    couches_btn: "Capas",
    filtres_btn: "Filtros",
    outils_btn: "Herramientas",
    ajouter_btn: "Añadir",
    rechercher_btn: "Buscar",
    parcours_btn: "Recorrido",
    toucher_carte_ajouter: "Toca un punto en el mapa para añadir datos ahí.",
    point_choisi_prefix: "Punto elegido: ",
    point_choisi_suffix: " — ¿qué quieres añadir?",
    type_signalement: "Reporte",
    type_arbre: "Árbol",
    type_observation: "Observación",
    type_zone: "Zona",
    description_optionnel: "Descripción (opcional)",
    essence_nom_arbre: "Especie / nombre del árbol",
    espece_observee_placeholder: "Especie observada",
    nom_zone_placeholder: "Nombre de la zona",
    retour_btn: "Volver",
    enregistrement_encours: "Guardando…",
    annuler_ajout: "Cancelar adición",
    rechercher_placeholder: "Buscar un árbol, reporte, lugar…",
    donnees_pace: "Datos de EcoVigil",
    lieux_osm: "Lugares (OpenStreetMap)",
    recherche_encours: "Buscando…",
    aucun_resultat: "Sin resultados.",
    filtres_titre: "Filtros",
    toutes_categories: "Todas las categorías",
    tous_statuts: "Todos los estados",
    statut_en_cours: "En curso",
    depuis_le: "Desde",
    reinitialiser_filtres: "Restablecer filtros",
    quitter_plein_ecran: "Salir de pantalla completa",
    plein_ecran: "Pantalla completa",
    vue_satellite: "Vista satelital",
    me_geolocaliser: "Ubicarme",
    gps_detaille: "GPS detallado",
    aucune_description: "Sin descripción.",
    observation_biodiversite: "Observación de biodiversidad",
    plante_le: "Plantado el ",
    zones_enregistrees_local: "Zonas guardadas (local)",
    projets_suivi_admin: "Proyectos y seguimiento: reservados al Centro de Control EcoVigil, no se muestran aquí.",
    layer_arbres: "Árboles",
    layer_signalements: "Reportes (otros)",
    layer_dechets: "Residuos",
    layer_pollution: "Contaminación",
    layer_biodiversite: "Biodiversidad",
    apercu_photo: "Vista previa",
    legend_toi: "Tú", legend_arbre_plante: "Árbol plantado",
    gps_recherche_signal: "Buscando señal GPS…", gps_precision_label: "Precisión", gps_lat_label: "Lat", gps_lng_label: "Lng",
    gps_altitude_label: "Altitud", gps_vitesse_label: "Velocidad", gps_cap_label: "Rumbo",
    geoloc_non_supportee: "Tu navegador no admite la geolocalización.",
    geoloc_contexte_securise: "La geolocalización requiere una conexión segura (https://).",
    geoloc_refusee: "Ubicación denegada. Autoriza el acceso a tu posición en los ajustes del navegador y vuelve a intentarlo.",
    geoloc_indisponible: "Posición no disponible por ahora. Comprueba que la ubicación esté activada en tu dispositivo.",
    geoloc_timeout: "La ubicación tardó demasiado. Vuelve a intentarlo.", geoloc_en_cours: "Ubicando…",
    toi_ici: "Tú, aquí", aucune_couche_active: "Activa una capa arriba para mostrar datos en el mapa.",
    en_attente_validation: "Pendiente de validación — visible solo para ti",
    zone_enregistree_localement: "Zona guardada localmente",
    tableau_bord_zone: "Panel de la zona mostrada", stat_donnees_affichees: "Datos mostrados",
    note_reboisement: "Proyectos y superficie de reforestación: no se muestran aquí (sin coordenadas de zona asociadas a los proyectos). Disponibles en el Seguimiento-Evaluación GAR.",
    climat_chargement: "Cargando datos climáticos…", climat_indisponible: "Datos climáticos no disponibles para este punto.",
    climat_erreur_reseau: "No se pudieron obtener los datos climáticos (red).", climat_actuel_title: "Clima actual (Open-Meteo)",
    climat_temperature: "Temperatura", climat_precipitations: "Precipitación", climat_vent: "Viento",
    observation_generique: "Observación", non_identifiee: "No identificada", zone_sans_nom: "Zona sin nombre",
    hors_ligne_banner: "Sin conexión — tus datos se guardan en este teléfono", hors_ligne_banner_attente: "pendiente de envío",
    envoi_en_cours_prefix: "Enviando", envoi_attente_suffix: "elemento(s) pendiente(s)…",
  },
  sw: {
    nav_accueil: "Nyumbani", nav_carte: "Ramani", nav_arbre: "Mti", nav_classement: "Orodha", nav_plus: "Zaidi",
    title_accueil: "Dashibodi", sub_accueil: "Pamoja kwa maisha endelevu.",
    title_carte: "Ramani", title_arbre: "Mti Wangu", sub_arbre: "Sajili, weka mahali na fuatilia ukuaji wa miti yako.",
    title_classement: "Orodha ya ushindani", title_admin: "Kituo cha EcoVigil",
    stat_arbres: "Miti iliyopandwa", stat_signalements: "Ripoti", stat_resolus: "Zilizotatuliwa", stat_co2: "CO₂ iliyoepukwa (makadirio)",
    btn_nouveau_signalement: "Ripoti mpya", btn_planter: "Sajili mti uliopandwa",
    lang_label: "Lugha",
    plateforme_desc: "Jukwaa la Kiafrika la Vitendo na Udhibiti wa Mazingira", logo_pace_alt: "Nembo ya EcoVigil", devise_ecovigil: "Angalia • Ripoti • Linda",
    annuler: "Ghairi", enregistrer: "Hifadhi", envoyer: "Tuma", fermer: "Funga", continuer: "Endelea",
    title_biodiversite: "Bioanuwai", sub_biodiversite: "Angalia na andika wanyama na mimea inayokuzunguka.",
    aucune_observation: "Hakuna uchunguzi bado.",
    retour: "← Rudi", sub_biodiv2: "Angalia na shiriki spishi zinazokuzunguka.", signaler_observation: "Ripoti uchunguzi",
    photo_espece: "Picha ya spishi", espece_placeholder: "Spishi iliyoonekana (mf: Hondohondo, Kasuku wa kijivu...)",
    remarques_placeholder: "Maelezo (si lazima)", envoi_en_cours: "Inatuma...", aucune_observation_partagee: "Hakuna uchunguzi ulioshirikiwa bado.",
    title_signaler: "Ripoti tatizo", sub_signaler: "Eleza unachokiona kinachokuzunguka.",
    urgence_label: "Kiwango cha dharura", photo_label: "Picha", ajouter_photo: "Ongeza picha", description_label: "Maelezo",
    decrire_situation: "Eleza hali...", gps_auto: "Mahali pa GPS pameambatanishwa kiotomatiki",
    envoyer_signalement: "Tuma ripoti", signalement_envoye: "Ripoti imetumwa", merci_equipe: "Asante, timu yetu itaichunguza.",
    meteo_locale: "Hali ya hewa ya eneo", alerte_pluie: "Mvua kubwa inawezekana — epuka maeneo yenye mafuriko.", alerte_chaleur: "Joto kali sana — kunywa maji na epuka jua moja kwa moja.",
    activer_notifs: "Washa arifa kufuatilia ripoti zako",
    assistant_titre: "Msaidizi wa Maamuzi ya Mazingira", assistant_sub: "Tambua spishi, uliza swali la kimazingira",
    actualites: "Habari", signalements_resolus: "Ripoti zilizotatuliwa",
    activite_recente: "Shughuli za hivi karibuni", rien_signaler: "Hakuna cha kuripoti bado. Fanya ripoti yako ya kwanza au panda mti wako wa kwanza.",
    resolu: "Imetatuliwa", en_attente: "Inasubiri", traite_par: "✓ Ilishughulikiwa na",
    centre_controle: "Kituo cha EcoVigil", apropos_confidentialite: "Kuhusu & Faragha",
    devenir_benevole: "Kuwa mtu wa kujitolea", inscription_recue: "Usajili umepokelewa! Ufikiaji wako utawashwa baada ya kuidhinishwa na msimamizi.",
    rejoindre_equipe: "Jiunge na timu ya EcoVigil ya eneo lako na shiriki katika kampeni za uwandani.", sinscrire: "Jisajili",
    nom_complet: "Jina kamili", telephone_email: "Simu au barua pepe", pays_label: "Nchi", ville_label: "Mji",
    quartier_zone: "Mtaa / eneo (si lazima)", confirmer_inscription: "Thibitisha usajili", indicatif_associe: "Nambari ya nchi iliyounganishwa: ", inscription_echec: "Usajili haukutumwa. Angalia muunganisho wako.",
    titre_carte_intelligente: "Ramani mahiri ya mazingira",
    sub_carte_intelligente: "Washa tabaka unazopenda ili kuona data halisi kukuzunguka.",
    en_ligne: "Mtandaoni",
    hors_ligne: "Nje ya mtandao",
    en_attente_synchro: "inasubiri usawazishaji — gusa kujaribu tena",
    couches_btn: "Tabaka",
    filtres_btn: "Vichujio",
    outils_btn: "Zana",
    ajouter_btn: "Ongeza",
    rechercher_btn: "Tafuta",
    parcours_btn: "Njia",
    toucher_carte_ajouter: "Gusa sehemu kwenye ramani ili kuongeza data hapo.",
    point_choisi_prefix: "Sehemu iliyochaguliwa: ",
    point_choisi_suffix: " — unataka kuongeza nini?",
    type_signalement: "Ripoti",
    type_arbre: "Mti",
    type_observation: "Uchunguzi",
    type_zone: "Eneo",
    description_optionnel: "Maelezo (si lazima)",
    essence_nom_arbre: "Aina / jina la mti",
    espece_observee_placeholder: "Spishi iliyoonekana",
    nom_zone_placeholder: "Jina la eneo",
    retour_btn: "Rudi",
    enregistrement_encours: "Inahifadhi…",
    annuler_ajout: "Ghairi kuongeza",
    rechercher_placeholder: "Tafuta mti, ripoti, mahali…",
    donnees_pace: "Data za EcoVigil",
    lieux_osm: "Mahali (OpenStreetMap)",
    recherche_encours: "Inatafuta…",
    aucun_resultat: "Hakuna matokeo.",
    filtres_titre: "Vichujio",
    toutes_categories: "Aina zote",
    tous_statuts: "Hali zote",
    statut_en_cours: "Inaendelea",
    depuis_le: "Tangu",
    reinitialiser_filtres: "Weka upya vichujio",
    quitter_plein_ecran: "Toka skrini nzima",
    plein_ecran: "Skrini nzima",
    vue_satellite: "Mwonekano wa setilaiti",
    me_geolocaliser: "Nionyeshe eneo langu",
    gps_detaille: "GPS ya kina",
    aucune_description: "Hakuna maelezo.",
    observation_biodiversite: "Uchunguzi wa bioanuwai",
    plante_le: "Ilipandwa ",
    zones_enregistrees_local: "Maeneo yaliyohifadhiwa (ndani)",
    projets_suivi_admin: "Miradi na ufuatiliaji: yamehifadhiwa kwa Kituo cha Usimamizi cha EcoVigil, hayaonyeshwi hapa.",
    layer_arbres: "Miti",
    layer_signalements: "Ripoti (nyingine)",
    layer_dechets: "Taka",
    layer_pollution: "Uchafuzi",
    layer_biodiversite: "Bioanuwai",
    apercu_photo: "Muhtasari",
    legend_toi: "Wewe", legend_arbre_plante: "Mti uliopandwa",
    gps_recherche_signal: "Inatafuta ishara ya GPS…", gps_precision_label: "Usahihi", gps_lat_label: "Lat", gps_lng_label: "Lng",
    gps_altitude_label: "Mwinuko", gps_vitesse_label: "Kasi", gps_cap_label: "Mwelekeo",
    geoloc_non_supportee: "Kivinjari chako hakitumii huduma ya eneo.",
    geoloc_contexte_securise: "Huduma ya eneo inahitaji muunganisho salama (https://).",
    geoloc_refusee: "Eneo limekataliwa. Ruhusu ufikiaji wa mahali ulipo kwenye mipangilio ya kivinjari kisha jaribu tena.",
    geoloc_indisponible: "Mahali hapapatikani kwa sasa. Hakikisha huduma ya eneo imewashwa kwenye kifaa chako.",
    geoloc_timeout: "Kutafuta eneo kumechukua muda mrefu. Jaribu tena.", geoloc_en_cours: "Inatafuta eneo…",
    toi_ici: "Wewe, hapa", aucune_couche_active: "Washa tabaka hapo juu ili kuonyesha data kwenye ramani.",
    en_attente_validation: "Inasubiri uthibitisho — inaonekana kwako pekee",
    zone_enregistree_localement: "Eneo limehifadhiwa kwenye kifaa",
    tableau_bord_zone: "Dashibodi ya eneo linaloonyeshwa", stat_donnees_affichees: "Data zinazoonyeshwa",
    note_reboisement: "Miradi na eneo la upandaji miti: hayaonyeshwi hapa (hayana viwianishi vya eneo vilivyounganishwa na miradi). Yanapatikana katika Ufuatiliaji-Tathmini GAR.",
    climat_chargement: "Inapakia data za hali ya hewa…", climat_indisponible: "Data za hali ya hewa hazipatikani kwa eneo hili.",
    climat_erreur_reseau: "Imeshindwa kupata data za hali ya hewa (mtandao).", climat_actuel_title: "Hali ya hewa ya sasa (Open-Meteo)",
    climat_temperature: "Joto", climat_precipitations: "Mvua", climat_vent: "Upepo",
    observation_generique: "Uchunguzi", non_identifiee: "Haijatambuliwa", zone_sans_nom: "Eneo lisilo na jina",
    hors_ligne_banner: "Nje ya mtandao — data yako inabaki imehifadhiwa kwenye simu hii", hors_ligne_banner_attente: "inasubiri kutumwa",
    envoi_en_cours_prefix: "Inatuma", envoi_attente_suffix: "kipengele/vipengele vinasubiri…",
  },
  ar: {
    nav_accueil: "الرئيسية", nav_carte: "الخريطة", nav_arbre: "شجرة", nav_classement: "الترتيب", nav_plus: "المزيد",
    title_accueil: "لوحة القيادة", sub_accueil: "معًا من أجل مستقبل مستدام.",
    title_carte: "الخريطة", title_arbre: "شجرتي", sub_arbre: "سجّل موقع أشجارك وتابع نموّها.",
    title_classement: "الترتيب", title_admin: "مركز EcoVigil",
    stat_arbres: "الأشجار المزروعة", stat_signalements: "البلاغات", stat_resolus: "التي تمت معالجتها", stat_co2: "ثاني أكسيد الكربون الموفَّر (تقديري)",
    btn_nouveau_signalement: "بلاغ جديد", btn_planter: "تسجيل شجرة مزروعة",
    lang_label: "اللغة",
    plateforme_desc: "المنصة الأفريقية للعمل والمراقبة البيئية", logo_pace_alt: "شعار EcoVigil", devise_ecovigil: "راقب • أبلغ • احمِ",
    annuler: "إلغاء", enregistrer: "حفظ", envoyer: "إرسال", fermer: "إغلاق", continuer: "متابعة",
    title_biodiversite: "التنوع البيولوجي", sub_biodiversite: "راقب ووثّق الحيوانات والنباتات من حولك.",
    aucune_observation: "لا توجد ملاحظات بعد.",
    retour: "→ رجوع", sub_biodiv2: "راقب وشارك الأنواع من حولك.", signaler_observation: "الإبلاغ عن ملاحظة",
    photo_espece: "صورة النوع", espece_placeholder: "النوع الملاحظ (مثال: طائر الكالاو، ببغاء رمادي...)",
    remarques_placeholder: "ملاحظات (اختياري)", envoi_en_cours: "جارٍ الإرسال...", aucune_observation_partagee: "لا توجد ملاحظات مشتركة بعد.",
    title_signaler: "الإبلاغ عن مشكلة", sub_signaler: "صف ما تلاحظه من حولك.",
    urgence_label: "درجة الإلحاح", photo_label: "صورة", ajouter_photo: "إضافة صورة", description_label: "الوصف",
    decrire_situation: "صف الحالة...", gps_auto: "يُرفق موقع GPS تلقائيًا",
    envoyer_signalement: "إرسال البلاغ", signalement_envoye: "تم إرسال البلاغ", merci_equipe: "شكرًا، سيقوم فريقنا بمراجعته.",
    titre_carte_intelligente: "خريطة بيئية ذكية",
    sub_carte_intelligente: "فعّل الطبقات التي تهمك لرؤية بيانات حقيقية من حولك.",
    en_ligne: "متصل",
    hors_ligne: "غير متصل",
    en_attente_synchro: "بانتظار المزامنة — اضغط لإعادة المحاولة",
    couches_btn: "الطبقات",
    filtres_btn: "التصفية",
    outils_btn: "الأدوات",
    ajouter_btn: "إضافة",
    rechercher_btn: "بحث",
    parcours_btn: "المسار",
    toucher_carte_ajouter: "اضغط على نقطة في الخريطة لإضافة بيانات هناك.",
    point_choisi_prefix: "النقطة المختارة: ",
    point_choisi_suffix: " — ماذا تريد أن تضيف؟",
    type_signalement: "بلاغ",
    type_arbre: "شجرة",
    type_observation: "ملاحظة",
    type_zone: "منطقة",
    description_optionnel: "الوصف (اختياري)",
    essence_nom_arbre: "النوع / اسم الشجرة",
    espece_observee_placeholder: "النوع الملاحظ",
    nom_zone_placeholder: "اسم المنطقة",
    retour_btn: "رجوع",
    enregistrement_encours: "جارٍ الحفظ…",
    annuler_ajout: "إلغاء الإضافة",
    rechercher_placeholder: "ابحث عن شجرة، بلاغ، مكان…",
    donnees_pace: "بيانات EcoVigil",
    lieux_osm: "أماكن (OpenStreetMap)",
    recherche_encours: "جارٍ البحث…",
    aucun_resultat: "لا توجد نتائج.",
    filtres_titre: "التصفية",
    toutes_categories: "كل الفئات",
    tous_statuts: "كل الحالات",
    statut_en_cours: "قيد المعالجة",
    depuis_le: "منذ",
    reinitialiser_filtres: "إعادة تعيين التصفية",
    quitter_plein_ecran: "الخروج من ملء الشاشة",
    plein_ecran: "ملء الشاشة",
    vue_satellite: "عرض القمر الصناعي",
    me_geolocaliser: "تحديد موقعي",
    gps_detaille: "GPS مفصل",
    aucune_description: "لا يوجد وصف.",
    observation_biodiversite: "ملاحظة تنوع بيولوجي",
    plante_le: "زُرعت في ",
    zones_enregistrees_local: "مناطق محفوظة (محليًا)",
    projets_suivi_admin: "المشاريع والمتابعة: مخصصة لمركز تحكم EcoVigil، لا تُعرض هنا.",
    layer_arbres: "الأشجار",
    layer_signalements: "بلاغات (أخرى)",
    layer_dechets: "النفايات",
    layer_pollution: "التلوث",
    layer_biodiversite: "التنوع البيولوجي",
    meteo_locale: "الطقس المحلي", alerte_pluie: "أمطار غزيرة محتملة — تجنّب المناطق المعرضة للفيضانات.", alerte_chaleur: "حرارة شديدة — حافظ على الترطيب وتجنّب الشمس المباشرة.",
    activer_notifs: "تفعيل الإشعارات لمتابعة بلاغاتك",
    assistant_titre: "مساعد القرارات البيئية", assistant_sub: "تعرّف على نوع، أو اطرح سؤالًا بيئيًا",
    actualites: "الأخبار", signalements_resolus: "البلاغات المعالجة",
    activite_recente: "النشاط الأخير", rien_signaler: "لا يوجد شيء للإبلاغ عنه حاليًا. قم بأول بلاغ لك أو ازرع أول شجرة.",
    resolu: "تمت المعالجة", en_attente: "قيد الانتظار", traite_par: "✓ تمت المعالجة من قبل",
    centre_controle: "مركز EcoVigil", apropos_confidentialite: "حول التطبيق والخصوصية",
    devenir_benevole: "كن متطوعًا", inscription_recue: "تم استلام التسجيل! سيتم تفعيل وصولك بعد موافقة أحد المسؤولين.",
    rejoindre_equipe: "انضم إلى فريق EcoVigil المحلي وشارك في الحملات الميدانية.", sinscrire: "التسجيل",
    nom_complet: "الاسم الكامل", telephone_email: "الهاتف أو البريد الإلكتروني", pays_label: "البلد", ville_label: "المدينة",
    quartier_zone: "الحي / المنطقة (اختياري)", confirmer_inscription: "تأكيد التسجيل", indicatif_associe: "الرمز الدولي المرتبط: ", inscription_echec: "تعذّر إرسال التسجيل. تحقق من اتصالك.",
    apercu_photo: "معاينة",
    legend_toi: "أنت", legend_arbre_plante: "شجرة مزروعة",
    gps_recherche_signal: "جارٍ البحث عن إشارة GPS…", gps_precision_label: "الدقة", gps_lat_label: "خط العرض", gps_lng_label: "خط الطول",
    gps_altitude_label: "الارتفاع", gps_vitesse_label: "السرعة", gps_cap_label: "الاتجاه",
    geoloc_non_supportee: "متصفحك لا يدعم تحديد الموقع الجغرافي.",
    geoloc_contexte_securise: "يتطلب تحديد الموقع الجغرافي اتصالاً آمناً (https://).",
    geoloc_refusee: "تم رفض الموقع. اسمح بالوصول إلى موقعك في إعدادات المتصفح، ثم أعد المحاولة.",
    geoloc_indisponible: "الموقع غير متاح حالياً. تحقّق من تفعيل خدمة الموقع على جهازك.",
    geoloc_timeout: "استغرق تحديد الموقع وقتاً طويلاً. أعد المحاولة.", geoloc_en_cours: "جارٍ تحديد الموقع…",
    toi_ici: "أنت هنا", aucune_couche_active: "فعّل طبقة أعلاه لعرض البيانات على الخريطة.",
    en_attente_validation: "بانتظار التحقق — مرئي لك فقط",
    zone_enregistree_localement: "منطقة محفوظة محلياً",
    tableau_bord_zone: "لوحة بيانات المنطقة المعروضة", stat_donnees_affichees: "البيانات المعروضة",
    note_reboisement: "مشاريع ومساحات إعادة التشجير: غير معروضة هنا (لا توجد إحداثيات منطقة مرتبطة بالمشاريع). متوفرة في نظام المتابعة والتقييم GAR.",
    climat_chargement: "جارٍ تحميل بيانات المناخ…", climat_indisponible: "بيانات المناخ غير متوفرة لهذه النقطة.",
    climat_erreur_reseau: "تعذّر الحصول على بيانات المناخ (الشبكة).", climat_actuel_title: "المناخ الحالي (Open-Meteo)",
    climat_temperature: "درجة الحرارة", climat_precipitations: "الهطول", climat_vent: "الرياح",
    observation_generique: "ملاحظة", non_identifiee: "غير محددة", zone_sans_nom: "منطقة بلا اسم",
    hors_ligne_banner: "غير متصل — تبقى بياناتك محفوظة على هذا الهاتف", hors_ligne_banner_attente: "بانتظار الإرسال",
    envoi_en_cours_prefix: "جارٍ إرسال", envoi_attente_suffix: "عنصر/عناصر بانتظار الإرسال…",
  },
};
// Langues à écriture droite-à-gauche : affecte la mise en page globale (voir dir={...} sur le conteneur racine).
const RTL_LANGS = ["ar"];
// N'ko (écriture ߒߞߏ, langues mandingues) : infrastructure prête (voir langues disponibles dans le
// sélecteur de réglages et RTL_LANGS ci-dessus si activé), mais les traductions ne sont volontairement
// PAS incluses ici — une traduction automatique non vérifiée par un locuteur natif risquerait d'induire
// les citoyens en erreur sur un outil à vocation civique. Pour l'activer : ajouter une clé "nko" ci-dessus
// avec les mêmes clés que "fr", ajouter "nko" à RTL_LANGS (le n'ko s'écrit de droite à gauche), et
// l'ajouter à la liste `langues` dans ThemePanel.
function t(lang, key) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.fr[key] || key;
}

// --- Point 1 : estimation du CO2 selon l'âge de l'arbre plutôt qu'une constante fixe.
// Approximation : ~6 kg/an la 1ère année (jeune plant), puis ~21 kg/an en rythme de croisière une fois établi.
function co2EstimeParArbre(a) {
  const plantedAt = a.plantedAt || (a.planted_at ? new Date(a.planted_at).getTime() : Date.now());
  const ansEcoules = Math.max(0, (Date.now() - plantedAt) / (365 * 86400000));
  if (ansEcoules <= 1) return Math.round(ansEcoules * 6);
  return Math.round(6 + (ansEcoules - 1) * 21);
}

// --- Anti-fraude (point 2) : distance entre deux coordonnées GPS, en mètres ---
function distanceMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Formats d'affichage des coordonnées GPS : degré décimal (DD), degré/minute/seconde
// (DMS) et UTM (WGS84, formule standard de projection de Mercator transverse).
function ddVersDMS(dd, estLatitude) {
  const dir = estLatitude ? (dd >= 0 ? "N" : "S") : (dd >= 0 ? "E" : "O");
  const abs = Math.abs(dd);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(1);
  return `${deg}°${min}'${sec}"${dir}`;
}
function ddVersUTM(lat, lng) {
  const a = 6378137.0; // demi-grand axe, ellipsoïde WGS84
  const eccSq = 0.00669438;
  const k0 = 0.9996;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const zone = Math.floor((lng + 180) / 6) + 1;
  const lngOrigineRad = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const eccPrimeSq = eccSq / (1 - eccSq);
  const N = a / Math.sqrt(1 - eccSq * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = eccPrimeSq * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lngRad - lngOrigineRad);
  const M = a * (
    (1 - eccSq / 4 - (3 * eccSq ** 2) / 64 - (5 * eccSq ** 3) / 256) * latRad
    - ((3 * eccSq) / 8 + (3 * eccSq ** 2) / 32 + (45 * eccSq ** 3) / 1024) * Math.sin(2 * latRad)
    + ((15 * eccSq ** 2) / 256 + (45 * eccSq ** 3) / 1024) * Math.sin(4 * latRad)
    - ((35 * eccSq ** 3) / 3072) * Math.sin(6 * latRad)
  );
  let easting = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSq) * A ** 5) / 120) + 500000.0;
  let northing = k0 * (M + N * Math.tan(latRad) * ((A * A) / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 + ((61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSq) * A ** 6) / 720));
  if (lat < 0) northing += 10000000.0;
  const bandes = "CDEFGHJKLMNPQRSTUVWXX";
  const bandeIdx = Math.min(Math.max(Math.floor((lat + 80) / 8), 0), bandes.length - 1);
  return `${zone}${bandes[bandeIdx]} ${Math.round(easting)}mE ${Math.round(northing)}mN`;
}
function formatCoordonnees(lat, lng, format) {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return "";
  if (format === "dms") return `${ddVersDMS(lat, true)} ${ddVersDMS(lng, false)}`;
  if (format === "utm") return ddVersUTM(lat, lng);
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// --- Phase 5 : règle d'interprétation opérationnelle pour la priorisation (point 4 du
// cahier des charges). Combine l'urgence déclarée par le citoyen et la récurrence (autres
// signalements non résolus du même problème à proximité) : un incident isolé de gravité
// "faible" reste faible, mais un problème qui se répète au même endroit remonte en priorité
// même si chaque signalement pris isolément semblait mineur.
const PRIORITE_ORDRE = { critique: 4, haute: 3, moyenne: 2, faible: 1 };
function calculerPriorite(signalement, tousSignalements) {
  let score = { faible: 1, moyenne: 2, haute: 3 }[signalement.urgence] || 1;
  if (signalement.lat && signalement.lng) {
    const proches = (tousSignalements || []).filter(s =>
      s.id !== signalement.id && s.categorie === signalement.categorie && s.statut !== "resolu" &&
      s.lat && s.lng && distanceMetres(s.lat, s.lng, signalement.lat, signalement.lng) < 1000
    );
    if (proches.length >= 3) score += 2;
    else if (proches.length >= 1) score += 1;
  }
  if (score >= 5) return "critique";
  if (score >= 3) return "haute";
  if (score >= 2) return "moyenne";
  return "faible";
}
const PRIORITE_INFO = {
  critique: { label: "Priorité critique", color: "#8B1E1E" },
  haute: { label: "Priorité haute", color: "#B5451B" },
  moyenne: { label: "Priorité moyenne", color: "#E3A73B" },
  faible: { label: "Priorité faible", color: "#4A8B6F" },
};

// Limite de fréquence par appareil : évite le spam de masse depuis un seul device.
// Première ligne de défense côté client — à compléter par une politique RLS/Edge Function côté serveur si besoin d'une garantie forte.
function checkLimiteFrequence(maxParHeure) {
  try {
    const key = "pace-rate-log";
    const now = Date.now();
    const raw = localStorage.getItem(key);
    let log = raw ? JSON.parse(raw) : [];
    log = log.filter(t => now - t < 3600000);
    if (log.length >= maxParHeure) return false;
    log.push(now);
    localStorage.setItem(key, JSON.stringify(log));
    return true;
  } catch (e) { return true; }
}

function TreeRing({ pct = 0, size = 56, stroke = 6, color = "var(--c-accent)", bg = "var(--c-border-soft)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
    </svg>
  );
}

function Screen({ children }) { return <div style={{ padding: "16px 16px 90px" }}>{children}</div>; }

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, color: "var(--c-accent-dark)" }}>{children}</div>
      {sub && <div style={{ fontSize: 13, color: "var(--c-text-secondary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatCard({ label, value, unit, accent }) {
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: "12px 14px", flex: 1, border: "1px solid var(--c-border)" }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 22, fontWeight: 600, color: accent || "var(--c-accent-dark)" }}>
        {value}<span style={{ fontSize: 12, marginLeft: 3, color: "var(--c-text-muted)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function ClimatWidget({ lang }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setError(true); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();
          setWeather(data.current);
        } catch (e) { setError(true); }
      },
      () => setError(true),
      { timeout: 6000 }
    );
  }, []);

  if (error || !weather) return null;

  const code = weather.weather_code;
  const isRain = code >= 51 && code <= 82;
  const isHeat = weather.temperature_2m >= 34;
  const WIcon = isRain ? IconCloudRain : IconSun;
  const alert = isRain ? t(lang, "alerte_pluie") : isHeat ? t(lang, "alerte_chaleur") : null;

  return (
    <div style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-sky))", borderRadius: 14, padding: 14, marginBottom: 16, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{t(lang, "meteo_locale")}</div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 26, fontWeight: 700 }}>{Math.round(weather.temperature_2m)}°C</div>
        </div>
        <WIcon size={30} color="#fff" />
      </div>
      {alert && (
        <div style={{ marginTop: 8, fontSize: 11.5, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px" }}>
          ⚠ {alert}
        </div>
      )}
    </div>
  );
}

// Catégories mises en avant dans le module photo de l'accueil (sous-ensemble représentatif des CATEGORIES).
const CAROUSEL_PROBLEME_IDS = ["decharge", "pollution", "deforestation", "feu", "mine", "deversement", "braconnage", "pollution_air", "dechets_dangereux", "erosion", "assechement", "peche_illegale", "espece_envahissante", "construction_illegale", "inondation", "eau_potable"];
// Module visuel : photos d'exemple réalistes des problèmes environnementaux à signaler, qui se
// succèdent en fondu enchaîné (auto-défilement, pause au survol/toucher, indicateurs cliquables).
function ExemplesProblemesCarousel({ lang, onNavigate, accesEtendu }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex(i => (i + 1) % CAROUSEL_PROBLEME_IDS.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  const catId = CAROUSEL_PROBLEME_IDS[index];
  const cat = categorieMeta(catId);
  const CatIcon = cat.icon;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <IconAlert size={15} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-accent-dark)" }}>Exemples de problèmes à signaler</div>
      </div>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        style={{ position: "relative", width: "100%", height: 190, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "var(--c-surface-soft)" }}
      >
        {CAROUSEL_PROBLEME_IDS.map((id, i) => (
          <img
            key={id}
            src={CAROUSEL_PHOTOS_REELLES[id] || `https://picsum.photos/seed/pace-${id}/800/500`}
            alt={categorieLabel(lang, id)}
            loading={i === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              opacity: i === index ? 1 : 0, transition: "opacity 1.1s ease",
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.7) 100%)" }} />

        <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 4 }}>
          {CAROUSEL_PROBLEME_IDS.map((id, i) => (
            <button key={id} onClick={() => setIndex(i)} aria-label={categorieLabel(lang, id)} style={{
              width: i === index ? 16 : 6, height: 6, borderRadius: 3, border: "none", padding: 0, cursor: "pointer",
              background: i === index ? "#fff" : "rgba(255,255,255,0.5)", transition: "width .3s ease" }} />
          ))}
        </div>

        {accesEtendu && (
          <button onClick={() => onNavigate("signaler")} style={{
            position: "absolute", top: 10, right: 12, background: "rgba(255,255,255,0.92)", color: "var(--c-accent-dark)",
            border: "none", borderRadius: 20, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4 }}>
            <IconAlert size={12} /> Signaler
          </button>
        )}

        <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 8, padding: 5, display: "flex" }}>
              <CatIcon size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.6 }}>EcoVigil</span>
          </div>
          <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{categorieLabel(lang, catId)}</div>
        </div>
      </div>
    </div>
  );
}

// Bascule entre l'espace bénévole et l'espace organisation (visible si les deux sont disponibles)
function EspaceSwitch({ actif, onBenevole, onOrganisation }) {
  const b = (id, lab, fn) => <button type="button" onClick={actif === id ? undefined : fn} aria-pressed={actif === id}
    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: actif === id ? "default" : "pointer", fontSize: 13, fontWeight: 600,
      background: actif === id ? "var(--c-accent-dark)" : "transparent", color: actif === id ? "#fff" : "var(--c-text)" }}>{lab}</button>;
  return <div role="group" aria-label="Changer d'espace" style={{ display: "flex", gap: 4, padding: 4, background: "var(--c-surface-soft)", border: "1px solid var(--c-border-soft)", borderRadius: 14, marginBottom: 14 }}>
    {b("benevole", "Espace bénévole", onBenevole)}{b("organisation", "Espace organisation", onOrganisation)}</div>;
}

function Accueil({ signalements, arbres, notifState, onEnableNotif, onOpenAdmin, actualites, onNavigate, lang, estBenevoleValide, benevoleStatut, onBenevoleInscrit, estOrganisationValidee, organisationStatut, organisationEtapeDossier, organisationEtapeMotif, onBasculerStatutSignalement, profilInfo, onProfilChange }) {
  const resolus = signalements.filter(s => s.statut === "resolu").length;
  const co2 = arbres.reduce((sum, a) => sum + co2EstimeParArbre(a), 0);
  const accesEtendu = estBenevoleValide || estOrganisationValidee; // bénévole validé OU organisation validée
  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_accueil")}>{t(lang, "title_accueil")}</SectionTitle>
      {estBenevoleValide && estOrganisationValidee && <EspaceSwitch actif="benevole" onBenevole={() => {}} onOrganisation={() => onNavigate("espace_org")} />}

      {notifState === "default" && (
        <button onClick={onEnableNotif} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
          background: "var(--c-surface-soft)", border: "1px solid var(--c-border-soft)", borderRadius: 12, padding: "10px 12px",
          marginBottom: 14, cursor: "pointer", color: "var(--c-accent-dark)", fontSize: 12.5
        }}>
          <IconBell size={16} /> {t(lang, "activer_notifs")}
        </button>
      )}

      <ClimatWidget lang={lang} />

      <ExemplesProblemesCarousel lang={lang} onNavigate={onNavigate} accesEtendu={accesEtendu} />

      {!accesEtendu && (
        <div style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-accent))", borderRadius: 14, padding: "14px 16px", marginBottom: 4, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconShield size={16} color="#fff" />
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Accès complet réservé aux bénévoles et organisations</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.92, lineHeight: 1.5 }}>
            Carte, signalements, arbres et biodiversité sont réservés aux bénévoles et organisations validés par EcoVigil.
            Inscris-toi ci-dessous pour y accéder.
          </div>
        </div>
      )}
      {!estBenevoleValide && <VolunteerCard lang={lang} benevoleStatut={benevoleStatut} onInscrit={onBenevoleInscrit} profilInfo={profilInfo} onProfilChange={onProfilChange} />}
      {!estOrganisationValidee && <OrganisationCard lang={lang} organisationStatut={organisationStatut} organisationEtapeDossier={organisationEtapeDossier} organisationEtapeMotif={organisationEtapeMotif} profilInfo={profilInfo} onProfilChange={onProfilChange} />}

      {false && estOrganisationValidee && !estBenevoleValide && (
        <button onClick={() => onNavigate("espace_org")} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
          background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-accent))", border: "none", borderRadius: 14, padding: "13px 14px",
          marginBottom: 16, marginTop: 4, cursor: "pointer", color: "#fff" }}>
          <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: 10, padding: 8 }}><IconShield size={17} color="#fff" /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Espace Organisation</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Modération de votre domaine, rapports, actualités officielles</div>
          </div>
        </button>
      )}

      {/* Modules déplacés dans le menu hamburger : cartes masquées de l'accueil (code conservé) */}
      {false && (
      <button onClick={() => accesEtendu && onNavigate("assistant")} disabled={!accesEtendu} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
        background: accesEtendu ? "linear-gradient(120deg,var(--c-accent-dark),var(--c-accent))" : "var(--c-surface-soft)",
        border: accesEtendu ? "none" : "1px dashed var(--c-border)", borderRadius: 14, padding: "13px 14px",
        marginBottom: 16, cursor: accesEtendu ? "pointer" : "default", color: accesEtendu ? "#fff" : "var(--c-text-muted)"
      }}>
        <div style={{ background: accesEtendu ? "rgba(255,255,255,0.18)" : "var(--c-surface)", borderRadius: 10, padding: 8 }}>
          {accesEtendu ? <IconSparkles size={17} color="#fff" /> : <IconLock size={17} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{t(lang, "assistant_titre")}</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{accesEtendu ? t(lang, "assistant_sub") : "Réservé aux bénévoles et organisations validés"}</div>
        </div>
      </button>
      )}

      {false && (
      <div style={{ marginBottom: 18 }}>
        <button onClick={() => onNavigate("groupes_terrain")} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 14,
          border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", textAlign: "left", width: "100%" }}>
          <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}>
            <IconUsers size={18} color="var(--c-accent)" />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-text)" }}>Groupes de terrain</div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Crée ou rejoins un groupe pour coordonner des missions avec d'autres bénévoles</div>
        </button>
      </div>
      )}

      {false && (
      <div style={{ marginBottom: 18 }}>
        <button onClick={() => estBenevoleValide && onNavigate("enquetes_terrain")} disabled={!estBenevoleValide} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 14,
          border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: estBenevoleValide ? "pointer" : "default", textAlign: "left", width: "100%",
          opacity: estBenevoleValide ? 1 : 0.6 }}>
          <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}>
            {estBenevoleValide ? <IconSearch size={18} color="var(--c-accent)" /> : <IconLock size={18} color="var(--c-text-muted)" />}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-text)" }}>Enquêtes terrain</div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{estBenevoleValide ? "Formulaires confiés par les organisations auxquelles tu es affilié" : "Réservé aux bénévoles validés"}</div>
        </button>
      </div>
      )}

      {false && (
      <div style={{ marginBottom: 18 }}>
        <button onClick={() => onNavigate("evenements")} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 14,
          border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", textAlign: "left", width: "100%" }}>
          <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}>
            <IconCalendar size={18} color="var(--c-accent)" />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-text)" }}>Événements</div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Journées de plantation, nettoyage, sensibilisation près de chez toi</div>
        </button>
      </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <button onClick={() => accesEtendu && onNavigate("biodiversite")} disabled={!accesEtendu} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 14,
          border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: accesEtendu ? "pointer" : "default", textAlign: "left", width: "100%",
          opacity: accesEtendu ? 1 : 0.6 }}>
          <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}>
            {accesEtendu ? <IconPaw size={18} color="var(--c-accent)" /> : <IconLock size={18} color="var(--c-text-muted)" />}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-text)" }}>{t(lang, "title_biodiversite")}</div>
          {!accesEtendu && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Réservé aux bénévoles et organisations validés</div>}
        </button>
      </div>

      {actualites.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <IconNewspaper size={15} color="var(--c-accent-dark)" />
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "actualites")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actualites.slice(0, 3).map(n => (
              <div key={n.id} style={{
                background: n.urgent ? "var(--c-warning-bg)" : "var(--c-surface)", border: `1px solid ${n.urgent ? "var(--c-warning-border-soft)" : "var(--c-border)"}`,
                borderRadius: 12, padding: 12 }}>
                {n.urgent && <div style={{ fontSize: 10, fontWeight: 700, color: "#B5451B", marginBottom: 3 }}>⚠ ALERTE</div>}
                {n.auteur_nom && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--c-accent-dark)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><IconShield size={10} /> {n.auteur_nom}</div>}
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--c-text)" }}>{n.titre}</div>
                <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginTop: 3 }}>{n.contenu}</div>
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 5 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <StatCard label={t(lang, "stat_arbres")} value={arbres.length} unit="" accent="var(--c-accent)" />
        <StatCard label={t(lang, "signalements_resolus")} value={resolus} unit={`/${signalements.length}`} accent="#B5451B" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label={t(lang, "stat_co2")} value={co2} unit="kg" accent="#E3A73B" />
      </div>
      <SectionTitle>{t(lang, "activite_recente")}</SectionTitle>
      {signalements.length === 0 && arbres.length === 0 && (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13.5, background: "var(--c-surface)", padding: 16, borderRadius: 12, border: "1px dashed var(--c-border-soft)" }}>
          {t(lang, "rien_signaler")}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...signalements].reverse().slice(0, 3).map(s => {
          const cat = categorieMeta(s.categorie);
          const IconC = cat.icon;
          return (
            <div key={s.id} style={{ background: "var(--c-surface)", padding: 10, borderRadius: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconC size={16} color="var(--c-accent)" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-text)" }}>{categorieLabel(lang, cat.id)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{s.date}</div>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: s.statut === "resolu" ? "var(--c-success-bg)" : "var(--c-warning-bg)", color: s.statut === "resolu" ? "var(--c-accent)" : "#B5451B" }}>
                  {s.statut === "resolu" ? t(lang, "resolu") : t(lang, "en_attente")}
                </span>
              </div>
              <div style={{ marginTop: 8, paddingLeft: 42 }}>
                <FicheEnvironnementale code={s.categorie} />
              </div>
              {onBasculerStatutSignalement && (
                <div style={{ marginTop: 8, paddingLeft: 42 }}>
                  <button onClick={() => onBasculerStatutSignalement(s)} style={{
                    fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                    border: s.statut === "resolu" ? "1px solid var(--c-border)" : "none",
                    background: s.statut === "resolu" ? "var(--c-surface)" : "var(--c-accent-dark)",
                    color: s.statut === "resolu" ? "var(--c-text-secondary)" : "#fff" }}>
                    {s.statut === "resolu" ? t(lang, "remettre_en_attente_signaleur") : t(lang, "marquer_resolu_signaleur")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {[...signalements].reverse().slice(0, 3).some(s => s.statut === "resolu" && s.resolution_organisme) && (
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", padding: "0 4px" }}>
            {[...signalements].reverse().slice(0, 3).filter(s => s.statut === "resolu" && s.resolution_organisme).map(s => (
              <div key={s.id} style={{ marginBottom: 2 }}>{t(lang, "traite_par")} {ORGANISME_LABELS[s.resolution_organisme] || s.resolution_organisme}{s.resolution_action ? ` — ${s.resolution_action}` : ""}</div>
            ))}
          </div>
        )}
      </div>

      {estBenevoleValide && <VolunteerCard lang={lang} benevoleStatut={benevoleStatut} />}

      {/* Lien "Centre d'EcoVigil" retiré de l'écran d'accueil : accès admin uniquement via ?admin=1 dans l'URL */}
      <button onClick={() => onNavigate("confidentialite")} style={{
        width: "100%", background: "none", border: "none", color: "var(--c-text-faint)",
        fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: 8
      }}>{t(lang, "apropos_confidentialite")}</button>
    </Screen>
  );
}

const ENV_ICON_MAP = { IconTrash, IconDroplet, IconTree, IconFlame, IconPick, IconAlert, IconPaw, IconFish, IconWind, IconLayers, IconWaves, IconFlask, IconHome, IconSun, IconSprout, IconGlobe };
function envIcon(nom) { return ENV_ICON_MAP[nom] || IconAlert; }

function Signaler({ onSubmit, lang, coordFormat }) {
  const [step, setStep] = useState(1); // 1 = défi, 2 = problème (mode dynamique uniquement), 3 = détails
  const [defiChoisi, setDefiChoisi] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [problemeChoisi, setProblemeChoisi] = useState(null); // objet complet si mode dynamique, pour accéder à champs_collecte
  const [urgence, setUrgence] = useState("moyenne");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [donneesCollecte, setDonneesCollecte] = useState({});
  const [sent, setSent] = useState(false);
  const [gpsFix, setGpsFix] = useState(null);

  // Taxonomie dynamique (défis/problèmes publiés par le super-admin). Tant que rien n'est
  // publié, `defisPublies` reste vide et le formulaire se comporte exactement comme avant
  // (grille plate des 16 catégories codées en dur) — aucune régression.
  const [defisPublies, setDefisPublies] = useState(null);
  const [problemesPublies, setProblemesPublies] = useState([]);
  useEffect(() => {
    Promise.all([
      supabase.from("env_defis").select("*").eq("statut", "publie").order("ordre", { ascending: true }),
      supabase.from("env_problemes").select("*").eq("statut", "publie").order("ordre", { ascending: true }),
    ]).then(([{ data: d }, { data: p }]) => {
      setDefisPublies(d || []);
      setProblemesPublies(p || []);
    });
  }, []);
  const modeDynamique = !!(defisPublies && defisPublies.length > 0);
  const problemesDuDefi = defiChoisi ? problemesPublies.filter(p => p.defi_id === defiChoisi.id) : [];
  const champsDynamiques = (problemeChoisi && problemeChoisi.champs_collecte) || [];

  function champManquant() {
    // Les champs de type "photo" ne sont pas rendus ici (la photo est déjà gérée par le
    // bouton photo général du formulaire) : ils ne doivent donc jamais bloquer l'envoi.
    return champsDynamiques.some(c => c.type !== "photo" && c.requis && !donneesCollecte[c.cle]);
  }

  function submit() {
    const finalize = (lat, lng) => {
      onSubmit({ categorie, urgence, description, photo, lat, lng, donnees_collecte: donneesCollecte });
      setSent(true);
      setTimeout(() => {
        setSent(false); setStep(1); setDefiChoisi(null); setCategorie(null); setProblemeChoisi(null);
        setDescription(""); setPhoto(null); setUrgence("moyenne"); setDonneesCollecte({}); setGpsFix(null);
      }, 1800);
    };
    // Priorité au relevé GPS visible dans le formulaire (widget LocationPrecision), que
    // l'utilisateur a pu vérifier avant l'envoi. On ne retente un relevé "à l'aveugle" que
    // si ce widget n'a encore rien capté (ex. permission accordée tardivement).
    if (gpsFix && gpsFix.lat != null && gpsFix.lng != null) {
      finalize(gpsFix.lat, gpsFix.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
    }
  }

  if (sent) {
    return (
      <Screen>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 380, textAlign: "center" }}>
          <div style={{ background: "var(--c-success-bg)", borderRadius: "50%", padding: 18, marginBottom: 14 }}><IconCheck size={32} color="var(--c-accent)" /></div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "signalement_envoye")}</div>
          <div style={{ fontSize: 13, color: "var(--c-text-secondary)", marginTop: 6 }}>{t(lang, "merci_equipe")}</div>
        </div>
      </Screen>
    );
  }

  // Étape "choix du défi" (uniquement en mode dynamique, avec du contenu publié)
  if (modeDynamique && step === 1) {
    return (
      <Screen>
        <SectionTitle sub={t(lang, "sub_signaler")}>{t(lang, "title_signaler")}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {defisPublies.map(d => {
            const IconD = envIcon(d.icone);
            return (
              <button key={d.id} onClick={() => { setDefiChoisi(d); setStep(2); }} style={{
                textAlign: "left", border: "1px solid var(--c-border)", background: "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconD size={20} color="var(--c-text-secondary)" />
                <div style={{ fontSize: 12.5, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{(d.nom && d.nom[lang]) || (d.nom && d.nom.fr) || d.code}</div>
              </button>
            );
          })}
        </div>
      </Screen>
    );
  }

  // Étape "choix du problème dans le défi" (mode dynamique uniquement)
  if (modeDynamique && step === 2) {
    return (
      <Screen>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button onClick={() => setStep(1)} style={{ padding: 8, borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>
          <SectionTitle sub={(defiChoisi.nom && defiChoisi.nom[lang]) || (defiChoisi.nom && defiChoisi.nom.fr)}>{t(lang, "title_signaler")}</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {problemesDuDefi.map(p => {
            const IconP = envIcon(p.icone);
            const active = categorie === p.code;
            return (
              <button key={p.id} onClick={() => { setCategorie(p.code); setProblemeChoisi(p); setStep(3); }} style={{
                textAlign: "left", border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconP size={20} color={active ? "var(--c-accent)" : "var(--c-text-secondary)"} />
                <div style={{ fontSize: 12.5, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{(p.nom && p.nom[lang]) || (p.nom && p.nom.fr) || p.code}</div>
              </button>
            );
          })}
          {problemesDuDefi.length === 0 && (
            <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Aucun problème publié pour ce défi pour le moment.</div>
          )}
        </div>
      </Screen>
    );
  }

  const etapeDetails = modeDynamique ? step === 3 : step === 2;

  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_signaler")}>{t(lang, "title_signaler")}</SectionTitle>
      {!modeDynamique && step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CATEGORIES.map(c => {
            const IconC = c.icon;
            const active = categorie === c.id;
            return (
              <button key={c.id} onClick={() => setCategorie(c.id)} style={{
                textAlign: "left", border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconC size={20} color={active ? "var(--c-accent)" : "var(--c-text-secondary)"} />
                <div style={{ fontSize: 12.5, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{categorieLabel(lang, c.id)}</div>
              </button>
            );
          })}
        </div>
      )}
      {etapeDetails && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "urgence_label")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {URGENCE.map(u => (
              <button key={u.id} onClick={() => setUrgence(u.id)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
                border: urgence === u.id ? `2px solid ${u.color}` : "1px solid var(--c-border)",
                background: urgence === u.id ? `${u.color}18` : "var(--c-surface)",
                color: urgence === u.id ? u.color : "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5 }}>{urgenceLabel(lang, u.id)}</button>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "photo_label")}</div>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label={t(lang, "ajouter_photo")} previewMaxHeight={160} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "description_label")}</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t(lang, "decrire_situation")}
            style={{ width: "100%", borderRadius: 12, border: "1px solid var(--c-border)", padding: 10, fontSize: 13, fontFamily: "Work Sans, sans-serif", resize: "none" }} />

          {champsDynamiques.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>Détails spécifiques à ce problème</div>
              {champsDynamiques.filter(c => c.type !== "photo").map(c => (
                <div key={c.cle}>
                  <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 4 }}>{c.label}{c.requis && " *"}</div>
                  {c.type === "select" ? (
                    <select value={donneesCollecte[c.cle] || ""} onChange={e => setDonneesCollecte(prev => ({ ...prev, [c.cle]: e.target.value }))}
                      style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, background: "var(--c-surface)", color: "var(--c-text)" }}>
                      <option value="" disabled>Choisir…</option>
                      {(c.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={c.type === "nombre" ? "number" : "text"} value={donneesCollecte[c.cle] || ""} onChange={e => setDonneesCollecte(prev => ({ ...prev, [c.cle]: e.target.value }))}
                      style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFix} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        {etapeDetails && <button onClick={() => setStep(modeDynamique ? 2 : 1)} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>}
        <button disabled={(!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())} onClick={() => (!modeDynamique && step === 1) ? setStep(2) : submit()} style={{
          flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
          background: ((!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 14,
          cursor: ((!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())) ? "default" : "pointer" }}>
          {(!modeDynamique && step === 1) ? t(lang, "continuer") : t(lang, "envoyer_signalement")}
        </button>
      </div>
    </Screen>
  );
}

const AFRICA_CENTER = [7.1881, 21.0938]; // Centre géographique approximatif du continent africain

function markerHtml(color, kind, borderColor) {
  // kind: "pin" (signalement), "tree", ou "leaf" (biodiversité)
  // borderColor (uniquement pour "pin") : distingue l'origine du signalement — bénévole,
  // ONG ou administration publique — sans toucher à la couleur de remplissage, qui reste
  // l'urgence (voir section 6 du cahier des charges : signalements distinguables par origine).
  if (kind === "tree") {
    return `<div style="width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22v-7"/><path d="M9 9a3 3 0 1 1 6 0c0 2-2 3-3 3s-3-1-3-3z"/><path d="M6 13a4 4 0 1 1 8 0c0 2.2-2 4-4 4s-4-1.8-4-4z"/>
      </svg></div>`;
  }
  if (kind === "leaf") {
    return `<div style="width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg></div>`;
  }
  if (kind === "search") {
    return `<div style="width:30px;height:30px;border-radius:6px;background:#fff;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
      </svg></div>`;
  }
  return `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.25);border:3px solid ${borderColor || "#fff"}"></div>`;
}

// Origine d'un signalement — bénévole, ONG, administration publique, ou citoyen (défaut,
// sans marquage visuel particulier). "origineParGroupe" fait le lien groupe -> type
// d'organisation, construit une seule fois (voir chargerOrigines dans Carte).
const ORIGINE_COULEURS = { benevole: "#2E6B8A", ong: "#1F7A4D", administration: "#7A1F1F" };
const ORIGINE_LABELS = { citoyen: "Citoyen", benevole: "Bénévole", ong: "ONG", administration: "Administration publique" };
function origineSignalement(s, origineParGroupe) {
  if (s.groupe_id && origineParGroupe[s.groupe_id]) return origineParGroupe[s.groupe_id] === "gouvernement" ? "administration" : "ong";
  if (s.benevole_id || s.benevole_nom) return "benevole";
  return "citoyen";
}

// Regroupement des catégories de signalements en 8 couches thématiques clairement
// identifiables (déforestation, exploitation minière, pollution, déchets et décharges,
// pollution des cours d'eau, assèchement des points d'eau, déversements polluants,
// autres atteintes environnementales). La base garde une seule table `signalements`
// avec un champ `categorie` : ces couches filtrent cette même source par catégorie
// plutôt que de venir de tables séparées.
const COUCHE_DEFORESTATION_CATEGORIES = ["deforestation"];
const COUCHE_MINE_CATEGORIES = ["mine"];
const COUCHE_DECHETS_CATEGORIES = ["decharge", "dechets_dangereux"];
const COUCHE_POLLUTION_CATEGORIES = ["pollution_air"];
const COUCHE_POLLUTION_EAU_CATEGORIES = ["pollution", "eau_potable"];
const COUCHE_ASSECHEMENT_CATEGORIES = ["assechement"];
const COUCHE_DEVERSEMENT_CATEGORIES = ["deversement"];
// "Autres atteintes environnementales" (couche "signalements") : feu, braconnage, pêche
// illégale, extraction de sable, zones humides, construction illégale, espèce
// envahissante, érosion, inondation — tout ce qui ne rentre dans aucune couche dédiée.
function coucheDeCategorie(catId) {
  if (COUCHE_DEFORESTATION_CATEGORIES.includes(catId)) return "deforestation";
  if (COUCHE_MINE_CATEGORIES.includes(catId)) return "mine";
  if (COUCHE_DECHETS_CATEGORIES.includes(catId)) return "dechets";
  if (COUCHE_POLLUTION_EAU_CATEGORIES.includes(catId)) return "pollution_eau";
  if (COUCHE_ASSECHEMENT_CATEGORIES.includes(catId)) return "assechement";
  if (COUCHE_DEVERSEMENT_CATEGORIES.includes(catId)) return "deversement";
  if (COUCHE_POLLUTION_CATEGORIES.includes(catId)) return "pollution";
  return "signalements";
}

// Point-dans-polygone (ray casting) — utilisé pour l'analyse de zone sélectionnée,
// sans dépendance supplémentaire (turf.js) puisque Leaflet.draw ne le fournit pas.
function pointInPolygon(point, vs) {
  const x = point[1], y = point[0];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][1], yi = vs[i][0];
    const xj = vs[j][1], yj = vs[j][0];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ===== GPS: qualité du signal à partir de la précision (accuracy en mètres) =====
function gpsQualite(accuracy) {
  if (accuracy == null || isNaN(accuracy)) return { label: "Inconnue", couleur: "#94a3b8" };
  if (accuracy <= 10) return { label: "Excellente", couleur: "#16a34a" };
  if (accuracy <= 25) return { label: "Bonne", couleur: "#65a30d" };
  if (accuracy <= 50) return { label: "Moyenne", couleur: "#d97706" };
  return { label: "Faible", couleur: "#dc2626" };
}
function formatCap(deg) {
  if (deg == null || isNaN(deg)) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const i = Math.round(deg / 45) % 8;
  return `${Math.round(deg)}° (${dirs[i]})`;
}
function formatVitesse(ms) {
  if (ms == null || isNaN(ms)) return "—";
  return `${(ms * 3.6).toFixed(1)} km/h`;
}

// Widget de précision GPS réutilisable, à intégrer directement dans un formulaire
// (Signaler, Mon Arbre, Biodiversité, Espace Organisation) pour que le citoyen VOIT ses
// coordonnées et leur marge d'erreur avant d'envoyer, plutôt qu'un relevé unique pris en
// silence au moment de l'envoi (avec un repli invisible vers un point par défaut en cas
// d'échec, source d'erreurs de localisation). Suit la position en direct (watchPosition) le
// temps que le formulaire reste ouvert, et remonte le dernier relevé fiable via onUpdate
// pour que le composant parent l'utilise à l'envoi.
function LocationPrecision({ coordFormat, onUpdate, compact = false }) {
  const [gps, setGps] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  function start() {
    if (!navigator.geolocation) { setError("unsupported"); return; }
    setError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const data = {
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy, altitude: pos.coords.altitude,
          speed: pos.coords.speed, heading: pos.coords.heading,
          timestamp: pos.timestamp,
        };
        setGps(data);
        if (onUpdateRef.current) onUpdateRef.current(data);
      },
      (err) => setError(err && err.code === 1 ? "permission" : "unavailable"),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );
  }

  useEffect(() => {
    start();
    return () => {
      if (watchIdRef.current != null && navigator.geolocation) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    };
  }, []);

  function refresh() {
    if (watchIdRef.current != null && navigator.geolocation) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    setGps(null);
    start();
  }

  const qualite = gps ? gpsQualite(gps.accuracy) : null;
  const imprecise = !!(gps && gps.accuracy != null && gps.accuracy > 50);

  return (
    <div style={{ background: "var(--c-surface-soft)", borderRadius: compact ? 10 : 12, padding: compact ? 9 : 11, marginBottom: compact ? 8 : 10, fontSize: 11.5, border: imprecise ? "1px solid #B5451B55" : "1px solid var(--c-border-soft)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--c-text)", fontWeight: 600 }}>
          <IconTarget size={13} color="var(--c-text-muted)" /> Position GPS
        </div>
        <button type="button" onClick={refresh} title="Actualiser la position" aria-label="Actualiser la position" style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", color: "var(--c-text-muted)" }}>
          <IconRotateCcw size={13} />
        </button>
      </div>
      {error ? (
        <div style={{ color: "#B5451B", marginTop: 5, lineHeight: 1.5 }}>
          {error === "permission"
            ? "Localisation refusée. Autorise l'accès à la position dans les réglages du navigateur pour des coordonnées fiables."
            : error === "unsupported"
              ? "La géolocalisation n'est pas disponible sur cet appareil."
              : "Signal GPS introuvable pour le moment — réessaie dans quelques secondes."}
        </div>
      ) : !gps ? (
        <div style={{ color: "var(--c-text-muted)", marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
          <IconClock size={12} /> Recherche du signal GPS…
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: qualite.couleur, display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "var(--c-text-secondary)" }}>Précision {qualite.label.toLowerCase()} — ±{Math.round(gps.accuracy)} m</span>
          </div>
          <div style={{ marginTop: 4, fontFamily: "IBM Plex Mono, monospace", color: "var(--c-text)", fontSize: 11 }}>
            {formatCoordonnees(gps.lat, gps.lng, coordFormat)}
          </div>
          {imprecise && (
            <div style={{ marginTop: 5, color: "#B5451B", lineHeight: 1.5 }}>
              Précision faible : sors à l'air libre ou attends quelques secondes avant d'envoyer, pour éviter une localisation erronée.
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

// ===== Cache de tuiles hors-ligne (IndexedDB) =====
// Stockage local des images de tuiles cartographiques pour un usage sans connexion.
// Aucune dépendance externe : uniquement l'API IndexedDB native du navigateur.
const TILE_DB_NAME = "pace-tiles-cache";
const TILE_STORE = "tiles";
function openTileDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) { reject(new Error("IndexedDB indisponible")); return; }
    const req = indexedDB.open(TILE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TILE_STORE)) db.createObjectStore(TILE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function getCachedTile(key) {
  try {
    const db = await openTileDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(TILE_STORE, "readonly");
      const req = tx.objectStore(TILE_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}
async function putCachedTile(key, blob) {
  try {
    const db = await openTileDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(TILE_STORE, "readwrite");
      tx.objectStore(TILE_STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* stockage impossible, on ignore silencieusement */ }
}
async function countCachedTiles() {
  try {
    const db = await openTileDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, "readonly");
      const req = tx.objectStore(TILE_STORE).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch { return 0; }
}
async function clearCachedTiles() {
  try {
    const db = await openTileDB();
    await new Promise((resolve) => {
      const tx = db.transaction(TILE_STORE, "readwrite");
      tx.objectStore(TILE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

// Calcule la liste des tuiles (x,y,z) couvrant une zone (bounds) pour un intervalle de zooms.
function tilesPourZone(bounds, zMin, zMax) {
  const tiles = [];
  const lon2tileX = (lon, z) => Math.floor((lon + 180) / 360 * Math.pow(2, z));
  const lat2tileY = (lat, z) => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
  for (let z = zMin; z <= zMax; z++) {
    const xMin = lon2tileX(bounds.getWest(), z);
    const xMax = lon2tileX(bounds.getEast(), z);
    const yMin = lat2tileY(bounds.getNorth(), z);
    const yMax = lat2tileY(bounds.getSouth(), z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ x, y, z });
      }
    }
  }
  return tiles;
}

// Couche Leaflet personnalisée : sert les tuiles depuis le cache local hors-ligne,
// et met en cache automatiquement les tuiles reçues en ligne. Compatible OSM et fonds satellite.
function creerCoucheTuilesHorsLigne(urlTemplate, options) {
  const CustomLayer = L.TileLayer.extend({
    createTile: function (coords, done) {
      const img = document.createElement("img");
      img.alt = "";
      const z = coords.z, x = coords.x, y = coords.y;
      const key = `${options.id || "osm"}/${z}/${x}/${y}`;
      const url = this.getTileUrl(coords);

      const applyFromBlob = (blob) => {
        const objUrl = URL.createObjectURL(blob);
        img.onload = () => { done(null, img); URL.revokeObjectURL(objUrl); };
        img.onerror = () => done(null, img);
        img.src = objUrl;
      };

      getCachedTile(key).then((cachedBlob) => {
        if (cachedBlob) { applyFromBlob(cachedBlob); if (navigator.onLine) { /* déjà en cache, pas de re-téléchargement */ } return; }
        if (!navigator.onLine) {
          // Hors-ligne et tuile non présente localement : tuile grise transparente pour ne pas casser l'affichage.
          img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
          done(null, img);
          return;
        }
        fetch(url).then(r => { if (!r.ok) throw new Error("tuile indisponible"); return r.blob(); })
          .then(blob => { putCachedTile(key, blob); applyFromBlob(blob); })
          .catch(() => { img.src = url; done(null, img); });
      });

      return img;
    }
  });
  return new CustomLayer(urlTemplate, options);
}

// ===== Comparaison satellite temporelle (Sentinel-2 / Copernicus) =====
// Mosaïques annuelles "Sentinel-2 cloudless" publiées par EOX IT Services GmbH
// (s2maps.eu) à partir des données Copernicus Sentinel-2 : accès public, sans
// clé ni jeton, et indépendant de la fréquence de mise à jour du fond Esri
// World Imagery utilisé par ailleurs dans l'app. Chaque mosaïque agrège les
// meilleures acquisitions Sentinel-2 de l'année indiquée (donc une composition
// annuelle sans nuages, pas une date de prise de vue exacte) — la comparaison
// sert d'aide visuelle, pas de preuve automatique de changement.
const SENTINEL2_MOSAIC_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
function urlMosaiqueSentinel2(annee) {
  return `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${annee}_3857/default/g/{z}/{y}/{x}.jpg`;
}
const SENTINEL2_ATTRIBUTION = "Sentinel-2 cloudless — EOX IT Services GmbH (données Copernicus Sentinel modifiées)";
// Résolution native Sentinel-2 (~10 m/pixel) : au-delà du zoom 14 environ, les tuiles
// sont nécessairement interpolées. Fixer la même limite pour "avant" ET "après" évite
// qu'une mosaïque paraisse plus nette que l'autre pour une raison purement technique
// (zoom serveur différent) plutôt qu'un vrai changement de terrain.
const SENTINEL2_ZOOM_NATIF_MAX = 14;

// Compare deux tuiles octet par octet (pas de supposition, pas de hash approximatif) :
// c'est la seule façon de confirmer que deux mosaïques renvoient réellement une image
// différente pour la zone regardée, avant de présenter la comparaison comme fiable.
async function chargerTuileBrute(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("tuile indisponible");
  return await res.arrayBuffer();
}
function tuilesIdentiques(buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) return false;
  const a = new Uint8Array(buf1), b = new Uint8Array(buf2);
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}

function Carte({ signalements, arbres, observations, enquetesCarte, onAddSignalement, onAddArbre, onAddObservation, online, pendingQueueCount, onFlushQueue, lang, coordFormat }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tileStandardRef = useRef(null);
  const tileSatelliteRef = useRef(null);
  const coucheOccupationSolRef = useRef(null);
  const coucheHydrologieRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const parcoursLayerRef = useRef(null);
  const [locating, setLocating] = useState(true);
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [satellite, setSatellite] = useState(false);
  // Couches thématiques Esri (ArcGIS REST, sans clé API) : occupation du sol et hydrologie.
  // Contrairement au fond satellite (bascule exclusive), ce sont des surcouches indépendantes,
  // qu'on peut activer par-dessus n'importe quel fond de carte.
  const [coucheOccupationSol, setCoucheOccupationSol] = useState(false);
  const [coucheHydrologie, setCoucheHydrologie] = useState(false);
  // Origine des signalements (bénévole / ONG / administration publique) — chargé une seule
  // fois : correspondance groupe de terrain -> type de l'organisation de rattachement.
  const [origineParGroupe, setOrigineParGroupe] = useState({});
  useEffect(() => {
    supabase.from("gt_groupes").select("id, organisations(type)").then(({ data }) => {
      const map = {};
      (data || []).forEach(g => { if (g.organisations) map[g.id] = g.organisations.type; });
      setOrigineParGroupe(map);
    });
  }, []);
  // Date de capture de l'imagerie satellite Esri visible au centre de la carte — Esri met à
  // jour ce fond par zones, sans cycle régulier (voir échange précédent). On interroge la
  // sous-couche "Citations" du service via l'opération identify pour l'afficher honnêtement,
  // plutôt que de laisser croire que l'image est récente.
  const [dateImagerie, setDateImagerie] = useState(undefined); // undefined = pas encore cherché, null = introuvable
  const dateImagerieTimerRef = useRef(null);

  // Comparaison temporelle d'imagerie satellite (Sentinel-2 / Copernicus), indépendante
  // du fond Esri : superpose deux mosaïques annuelles sur la zone actuellement visible,
  // avec un curseur de balayage avant/après. Aide visuelle à l'observation de changements
  // (perte de végétation, eau, sols dégradés, exploitation minière...) — pas une preuve
  // automatique d'infraction : à recouper avec une vérification de terrain.
  const [showComparaison, setShowComparaison] = useState(false);
  const [compareActif, setCompareActif] = useState(false);
  const [compareAnnee1, setCompareAnnee1] = useState(SENTINEL2_MOSAIC_YEARS[0]);
  const [compareAnnee2, setCompareAnnee2] = useState(SENTINEL2_MOSAIC_YEARS[SENTINEL2_MOSAIC_YEARS.length - 1]);
  const [compareSwipePos, setCompareSwipePos] = useState(50); // % depuis la gauche de la carte
  const [compareErreurAvant, setCompareErreurAvant] = useState(false);
  const [compareErreurApres, setCompareErreurApres] = useState(false);
  // Résultat de la vérification octet-par-octet des tuiles réellement reçues pour la zone
  // visible : null = pas encore vérifié, "verification" = en cours, "identiques" = les deux
  // mosaïques renvoient exactement la même image ici, "distinctes" = elles diffèrent
  // réellement, "erreur" = vérification impossible (réseau).
  const [compareVerif, setCompareVerif] = useState(null);
  const compareVerifTimerRef = useRef(null);
  const coucheCompareAvantRef = useRef(null);
  const coucheCompareApresRef = useRef(null);
  const compareDraggingRef = useRef(false);
  // Les identifiants de mosaïques annuelles réellement publiées par EOX peuvent différer
  // d'une année à l'autre (le service évolue). Plutôt que de deviner une liste fixe — au
  // risque de proposer une année inexistante, dont les tuiles échoueraient en silence —
  // on interroge le GetCapabilities WMTS au chargement pour n'afficher que les années
  // dont la mosaïque existe vraiment. Repli sur la liste par défaut si la vérification
  // échoue (réseau, CORS...), avec un avertissement explicite dans le panneau.
  // null = vérification en cours, false = vérification impossible (repli), array = confirmé.
  const [anneesSentinelVerifiees, setAnneesSentinelVerifiees] = useState(null);
  useEffect(() => {
    let annule = false;
    fetch("https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml")
      .then(r => { if (!r.ok) throw new Error("capacites indisponibles"); return r.text(); })
      .then(xmlText => {
        if (annule) return;
        const doc = new DOMParser().parseFromString(xmlText, "text/xml");
        const identifiants = Array.from(doc.getElementsByTagName("ows:Identifier")).map(n => n.textContent || "");
        const annees = identifiants
          .map(id => { const m = /^s2cloudless-(\d{4})_3857$/.exec(id); return m ? Number(m[1]) : null; })
          .filter(Boolean)
          .sort((a, b) => a - b);
        setAnneesSentinelVerifiees(annees.length >= 2 ? annees : false);
      })
      .catch(() => { if (!annule) setAnneesSentinelVerifiees(false); });
    return () => { annule = true; };
  }, []);
  const anneesSentinel = Array.isArray(anneesSentinelVerifiees) ? anneesSentinelVerifiees : SENTINEL2_MOSAIC_YEARS;
  useEffect(() => {
    if (!Array.isArray(anneesSentinelVerifiees)) return;
    setCompareAnnee1(a => anneesSentinelVerifiees.includes(a) ? a : anneesSentinelVerifiees[0]);
    setCompareAnnee2(a => anneesSentinelVerifiees.includes(a) ? a : anneesSentinelVerifiees[anneesSentinelVerifiees.length - 1]);
  }, [anneesSentinelVerifiees]);

  // Couches — toutes désactivées par défaut, seul le fond de carte est actif.
  const [layersOn, setLayersOn] = useState({ arbres: true, signalements: true, dechets: true, pollution: true, biodiversite: true, deforestation: true, mine: true, pollution_eau: true, assechement: true, deversement: true, enquetes: true });
  const [showLayers, setShowLayers] = useState(false);
  const [filtreGraviteEnquete, setFiltreGraviteEnquete] = useState("");

  // Filtres intelligents combinables.
  const [filtreCategorie, setFiltreCategorie] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreDepuis, setFiltreDepuis] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filtresActifs = !!(filtreCategorie || filtreStatut || filtreDepuis || filtreGraviteEnquete);

  const [visibleCount, setVisibleCount] = useState({ arbres: 0, dechets: 0, pollution: 0, signalements: 0, biodiversite: 0, deforestation: 0, mine: 0, pollution_eau: 0, assechement: 0, deversement: 0 });

  // Outils d'analyse géographique.
  const drawnItemsRef = useRef(null);
  const [showTools, setShowTools] = useState(false);
  const [coordMode, setCoordMode] = useState(false);
  const [clickedCoord, setClickedCoord] = useState(null);
  const [measureResult, setMeasureResult] = useState(null); // { type: "distance"|"superficie", texte }
  const [zoneAnalysis, setZoneAnalysis] = useState(null); // { total, parType: {...}, items: [...] }
  const analysisDataRef = useRef({ signalements: [], arbres: [], observations: [], layersOn: {} });
  useEffect(() => { analysisDataRef.current = { signalements, arbres, observations, layersOn }; }, [signalements, arbres, observations, layersOn]);
  const coordModeRef = useRef(false);
  useEffect(() => { coordModeRef.current = coordMode; }, [coordMode]);
  const coordMarkerRef = useRef(null);

  // Sources environnementales externes. Seule "Climat" est une intégration
  // réelle et vérifiée (Open-Meteo, déjà utilisée ailleurs dans l'app, sans
  // clé requise). Les autres sont volontairement laissées "non connectées" :
  // je n'ai pas pu vérifier en conditions réelles d'URL de tuiles fiable pour
  // elles ici, et le cahier des charges interdit d'inventer des données
  // externes. Prêtes à être branchées dès qu'une source vérifiée existe —
  // voir EXTERNAL_LAYER_DEFS ci-dessous pour l'endroit où l'ajouter.
  const [climatMode, setClimatMode] = useState(false);
  const climatModeRef = useRef(false);
  useEffect(() => { climatModeRef.current = climatMode; }, [climatMode]);
  const [climatLoading, setClimatLoading] = useState(false);

  const userMarkerRef = useRef(null);
  const [locateError, setLocateError] = useState("");

  // ===== 1. GPS précis (panneau détaillé + suivi continu) =====
  const [showGps, setShowGps] = useState(false);
  const [gpsData, setGpsData] = useState(null); // { lat,lng,accuracy,altitude,altitudeAccuracy,speed,heading,timestamp }
  const gpsWatchIdRef = useRef(null);

  useEffect(() => {
    if (!showGps) {
      if (gpsWatchIdRef.current != null && navigator.geolocation) { navigator.geolocation.clearWatch(gpsWatchIdRef.current); gpsWatchIdRef.current = null; }
      return;
    }
    if (!navigator.geolocation) return;
    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const c = pos.coords;
        setGpsData({ lat: c.latitude, lng: c.longitude, accuracy: c.accuracy, altitude: c.altitude, altitudeAccuracy: c.altitudeAccuracy, speed: c.speed, heading: c.heading, timestamp: pos.timestamp });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => { if (gpsWatchIdRef.current != null && navigator.geolocation) { navigator.geolocation.clearWatch(gpsWatchIdRef.current); gpsWatchIdRef.current = null; } };
  }, [showGps]);

  // ===== 2. Recherche (données EcoVigil locales + lieux OpenStreetMap/Nominatim) =====
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPlaceResults, setSearchPlaceResults] = useState([]);
  const searchLocalResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const out = [];
    (arbres || []).filter(a => a.valide || a.device_id === DEVICE_ID).forEach(a => { if ((a.nom || "").toLowerCase().includes(q)) out.push({ kind: "arbre", label: a.nom, sub: t(lang, "legend_arbre_plante"), lat: a.lat, lng: a.lng, data: a }); });
    (signalements || []).filter(s => s.valide || s.device_id === DEVICE_ID).forEach(s => {
      const cat = categorieMeta(s.categorie);
      const label = categorieLabel(lang, cat.id);
      if ((label || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q)) out.push({ kind: "signalement", label, sub: s.date, lat: s.lat, lng: s.lng, data: s });
    });
    (observations || []).forEach(o => { if ((o.espece || "").toLowerCase().includes(q)) out.push({ kind: "observation", label: o.espece || t(lang, "observation_generique"), sub: t(lang, "layer_biodiversite"), lat: o.lat, lng: o.lng, data: o }); });
    return out.slice(0, 12);
  }, [searchQuery, arbres, signalements, observations]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) { setSearchPlaceResults([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`)
        .then(r => r.ok ? r.json() : [])
        .then(list => setSearchPlaceResults((list || []).map(p => ({ kind: "lieu", label: p.display_name, lat: parseFloat(p.lat), lng: parseFloat(p.lon) }))))
        .catch(() => setSearchPlaceResults([]))
        .finally(() => setSearchLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function allerVers(lat, lng, zoom = 16) {
    if (!mapRef.current || lat == null || lng == null) return;
    mapRef.current.setView([lat, lng], zoom);
    setShowSearch(false);
  }

  // ===== 4. Collecte terrain directement depuis la carte =====
  const [addMode, setAddMode] = useState(false);
  const addModeRef = useRef(false);
  useEffect(() => { addModeRef.current = addMode; }, [addMode]);
  const [addPoint, setAddPoint] = useState(null);
  const [addType, setAddType] = useState(null); // "signalement" | "arbre" | "observation" | "zone"
  const [addSaving, setAddSaving] = useState(false);
  const addPointMarkerRef = useRef(null);
  const [fCategorie, setFCategorie] = useState(CATEGORIES[0] ? CATEGORIES[0].id : "");
  const [fUrgence, setFUrgence] = useState("moyenne");
  const [fDescription, setFDescription] = useState("");
  const [fNom, setFNom] = useState("");
  const [fEspece, setFEspece] = useState("");
  const [fZoneNom, setFZoneNom] = useState("");

  function resetAddForm() {
    setAddType(null); setFCategorie(CATEGORIES[0] ? CATEGORIES[0].id : ""); setFUrgence("moyenne");
    setFDescription(""); setFNom(""); setFEspece(""); setFZoneNom("");
  }
  function annulerAjout() {
    setAddMode(false); setAddPoint(null); resetAddForm();
    if (addPointMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(addPointMarkerRef.current); addPointMarkerRef.current = null; }
  }
  async function validerAjout() {
    if (!addPoint || !addType) return;
    const [lat, lng] = addPoint;
    setAddSaving(true);
    try {
      if (addType === "signalement" && onAddSignalement) {
        await onAddSignalement({ categorie: fCategorie, urgence: fUrgence, description: fDescription, photo: null, lat, lng });
      } else if (addType === "arbre" && onAddArbre) {
        await onAddArbre({ nom: fNom || t(lang, "type_arbre"), photo: null, lat, lng });
      } else if (addType === "observation" && onAddObservation) {
        await onAddObservation({ espece: fEspece || t(lang, "non_identifiee"), description: fDescription, photo: null, lat, lng });
      } else if (addType === "zone") {
        enregistrerZoneLocale({ nom: fZoneNom || t(lang, "zone_sans_nom"), type: "point", lat, lng, cree_le: new Date().toISOString() });
      }
      annulerAjout();
    } finally {
      setAddSaving(false);
    }
  }

  // ===== Zones (polygones) — persistées localement, prêtes pour la synchro serveur =====
  const [zonesLocales, setZonesLocales] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pace-zones-local") || "[]"); } catch { return []; }
  });
  const [showZones, setShowZones] = useState(true);
  function enregistrerZoneLocale(zone) {
    setZonesLocales(prev => {
      const next = [...prev, { ...zone, id: `zone-${Date.now()}` }];
      try { localStorage.setItem("pace-zones-local", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // ===== Parcours GPS (tracé de terrain) =====
  const [parcoursRecording, setParcoursRecording] = useState(false);
  const [parcoursPoints, setParcoursPoints] = useState([]);
  const [parcoursStart, setParcoursStart] = useState(null);
  const [parcoursElapsed, setParcoursElapsed] = useState(0);
  const parcoursWatchIdRef = useRef(null);
  const parcoursPolylineRef = useRef(null);
  const [savedParcours, setSavedParcours] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pace-parcours-local") || "[]"); } catch { return []; }
  });
  const [showParcoursPanel, setShowParcoursPanel] = useState(false);

  function demarrerParcours() {
    if (!navigator.geolocation || !mapRef.current) return;
    setParcoursPoints([]);
    setParcoursStart(Date.now());
    setParcoursRecording(true);
    if (parcoursPolylineRef.current) { mapRef.current.removeLayer(parcoursPolylineRef.current); }
    parcoursPolylineRef.current = L.polyline([], { color: "var(--c-warning)", weight: 4 }).addTo(mapRef.current);
    parcoursWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setParcoursPoints(prev => {
          const next = [...prev, p];
          if (parcoursPolylineRef.current) parcoursPolylineRef.current.setLatLngs(next);
          return next;
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }
  function arreterParcours(sauvegarder) {
    if (parcoursWatchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(parcoursWatchIdRef.current);
    parcoursWatchIdRef.current = null;
    setParcoursRecording(false);
    if (sauvegarder && parcoursPoints.length > 1) {
      let dist = 0;
      for (let i = 1; i < parcoursPoints.length; i++) {
        dist += L.latLng(parcoursPoints[i - 1]).distanceTo(L.latLng(parcoursPoints[i]));
      }
      const parcours = {
        id: `parcours-${Date.now()}`, points: parcoursPoints, distance_m: Math.round(dist),
        duree_s: Math.round((Date.now() - parcoursStart) / 1000), date: new Date().toISOString(),
      };
      setSavedParcours(prev => {
        const next = [...prev, parcours];
        try { localStorage.setItem("pace-parcours-local", JSON.stringify(next)); } catch {}
        return next;
      });
    }
    if (!sauvegarder && parcoursPolylineRef.current && mapRef.current) { mapRef.current.removeLayer(parcoursPolylineRef.current); parcoursPolylineRef.current = null; }
  }
  function supprimerParcours(id) {
    setSavedParcours(prev => {
      const next = prev.filter(p => p.id !== id);
      try { localStorage.setItem("pace-parcours-local", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  useEffect(() => {
    if (!parcoursRecording) return;
    const t = setInterval(() => setParcoursElapsed(Math.round((Date.now() - parcoursStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [parcoursRecording, parcoursStart]);
  function formatDuree(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}min ${String(sec).padStart(2, "0")}s`;
  }

  // ===== 5. Mode hors connexion — tuiles téléchargées à l'avance =====
  const [showOffline, setShowOffline] = useState(false);
  const [tilesCachedCount, setTilesCachedCount] = useState(0);
  const [offlineDownloading, setOfflineDownloading] = useState(false);
  const [offlineProgress, setOfflineProgress] = useState({ done: 0, total: 0 });
  const offlineCancelRef = useRef(false);

  useEffect(() => { if (showOffline) countCachedTiles().then(setTilesCachedCount); }, [showOffline]);

  async function telechargerZoneHorsLigne() {
    if (!mapRef.current) return;
    // Le fond standard est désormais en tuiles vectorielles (OpenFreeMap/MapLibre), qui ne
    // passent pas par ce cache IndexedDB tuile-par-tuile. Seul le fond satellite (raster) peut
    // être pré-téléchargé pour l'instant : on bascule dessus si l'utilisateur est en mode standard.
    if (!satellite) { return; }
    setOfflineDownloading(true);
    offlineCancelRef.current = false;
    const bounds = mapRef.current.getBounds();
    const zActuel = mapRef.current.getZoom();
    const zMin = Math.max(4, zActuel - 1);
    const zMax = Math.min(18, zActuel + 2); // zone + 2 niveaux de zoom pour naviguer une fois sur place
    const tuiles = tilesPourZone(bounds, zMin, zMax);
    setOfflineProgress({ done: 0, total: tuiles.length });
    const urlBase = { tpl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", id: "satellite", subs: null };
    let done = 0;
    for (const t of tuiles) {
      if (offlineCancelRef.current) break;
      const sub = urlBase.subs ? urlBase.subs[done % urlBase.subs.length] : "a";
      const url = urlBase.tpl.replace("{s}", sub).replace("{z}", t.z).replace("{x}", t.x).replace("{y}", t.y);
      const key = `${urlBase.id}/${t.z}/${t.x}/${t.y}`;
      try {
        const already = await getCachedTile(key);
        if (!already) {
          const res = await fetch(url);
          if (res.ok) { const blob = await res.blob(); await putCachedTile(key, blob); }
          // Petite pause entre les requêtes : téléchargement respectueux, pas en rafale.
          await new Promise(r => setTimeout(r, 40));
        }
      } catch { /* tuile ignorée, la synchro/tentative suivante pourra réussir */ }
      done++;
      if (done % 5 === 0 || done === tuiles.length) setOfflineProgress({ done, total: tuiles.length });
    }
    setOfflineDownloading(false);
    countCachedTiles().then(setTilesCachedCount);
  }
  function annulerTelechargement() { offlineCancelRef.current = true; }
  async function viderCacheHorsLigne() { await clearCachedTiles(); setTilesCachedCount(0); }

  // Assemble les tuiles déjà en cache (niveau de zoom actuel) en une seule image PNG,
  // puis propose de l'enregistrer/partager vers la galerie via le mécanisme natif du
  // téléphone (Web Share API). Distinct du cache technique (IndexedDB, invisible) qui
  // reste nécessaire pour que la carte fonctionne réellement hors ligne.
  const [captureEnCours, setCaptureEnCours] = useState(false);
  async function capturerImageZone() {
    if (!mapRef.current) return;
    setCaptureEnCours(true);
    try {
      const map = mapRef.current;
      const bounds = map.getBounds();
      const z = Math.round(map.getZoom());
      const id = satellite ? "satellite" : "osm";
      const tuiles = tilesPourZone(bounds, z, z);
      if (tuiles.length === 0) { alert("Aucune zone visible à capturer."); return; }

      const xs = tuiles.map(t => t.x), ys = tuiles.map(t => t.y);
      const xMin = Math.min(...xs), xMax = Math.max(...xs);
      const yMin = Math.min(...ys), yMax = Math.max(...ys);
      const TAILLE_TUILE = 256;
      const largeur = (xMax - xMin + 1) * TAILLE_TUILE;
      const hauteur = (yMax - yMin + 1) * TAILLE_TUILE;
      if (largeur * hauteur > 4096 * 4096) {
        alert("La zone affichée est trop grande pour être capturée en une seule image. Zoome un peu plus avant de réessayer.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = largeur; canvas.height = hauteur;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#e5e5e5";
      ctx.fillRect(0, 0, largeur, hauteur);

      let manquantes = 0;
      for (const t of tuiles) {
        const key = `${id}/${t.z}/${t.x}/${t.y}`;
        const blob = await getCachedTile(key);
        if (!blob) { manquantes++; continue; }
        try {
          const bitmap = await createImageBitmap(blob);
          ctx.drawImage(bitmap, (t.x - xMin) * TAILLE_TUILE, (t.y - yMin) * TAILLE_TUILE, TAILLE_TUILE, TAILLE_TUILE);
        } catch (e) { manquantes++; }
      }

      canvas.toBlob(async (blob) => {
        if (!blob) { alert("Échec de la génération de l'image."); setCaptureEnCours(false); return; }
        const fichier = new File([blob], `pace-zone-${Date.now()}.png`, { type: "image/png" });
        let partage = false;
        if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
          try { await navigator.share({ files: [fichier], title: "Zone EcoVigil" }); partage = true; }
          catch (e) { /* partage annulé par l'utilisateur ou indisponible : repli ci-dessous */ }
        }
        if (!partage) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = fichier.name;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        if (manquantes > 0) alert(`Image générée avec ${manquantes} portion(s) manquante(s) (zones non téléchargées, affichées en gris). Télécharge d'abord la zone complète pour un résultat sans trou.`);
        setCaptureEnCours(false);
      }, "image/png");
    } catch (e) {
      alert("Échec de la capture : " + (e && e.message ? e.message : "erreur inconnue"));
      setCaptureEnCours(false);
    }
  }
  function locateMe(mapInstance) {
    const map = mapInstance || mapRef.current;
    if (!map) return;
    if (!navigator.geolocation) { setLocateError(t(lang, "geoloc_non_supportee")); setLocating(false); return; }
    if (window.isSecureContext === false) { setLocateError(t(lang, "geoloc_contexte_securise")); setLocating(false); return; }
    setLocateError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        map.setView(latlng, 13);
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(latlng);
        } else {
          userMarkerRef.current = L.circleMarker(latlng, {
            radius: 8, color: "var(--c-sky)", fillColor: "var(--c-sky)", fillOpacity: 0.9, weight: 2,
          }).addTo(map).bindPopup(t(lang, "toi_ici"));
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocateError(t(lang, "geoloc_refusee"));
        else if (err.code === 2) setLocateError(t(lang, "geoloc_indisponible"));
        else setLocateError(t(lang, "geoloc_timeout"));
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  }

  function startDraw(type) {
    if (!mapRef.current) return;
    setCoordMode(false);
    setClickedCoord(null);
    if (type === "marker") new L.Draw.Marker(mapRef.current).enable();
    else if (type === "polyline") new L.Draw.Polyline(mapRef.current, { shapeOptions: { color: "var(--c-accent-dark)", weight: 3 } }).enable();
    else if (type === "polygon") new L.Draw.Polygon(mapRef.current, { shapeOptions: { color: "var(--c-accent-dark)", weight: 3 } }).enable();
  }
  function clearAnalyse() {
    if (drawnItemsRef.current) drawnItemsRef.current.clearLayers();
    if (coordMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(coordMarkerRef.current); coordMarkerRef.current = null; }
    setMeasureResult(null);
    setZoneAnalysis(null);
    setClickedCoord(null);
    setCoordMode(false);
  }
  function exporterAnalyse() {
    if (!zoneAnalysis || !zoneAnalysis.items.length) return;
    const csv = toCSV(zoneAnalysis.items, [
      { key: "type", label: "Type" }, { key: "nom", label: "Nom / catégorie" }, { key: "date", label: "Date" },
      { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" },
    ]);
    downloadCSV(`pace-analyse-zone-${Date.now()}.csv`, csv);
  }

  function toggleLayer(id) { setLayersOn(prev => ({ ...prev, [id]: !prev[id] })); }
  function resetFiltres() { setFiltreCategorie(""); setFiltreStatut(""); setFiltreDepuis(""); setFiltreGraviteEnquete(""); }

  function passeFiltrePeriode(dateIso) {
    if (!filtreDepuis || !dateIso) return true;
    return new Date(dateIso) >= new Date(filtreDepuis);
  }

  useEffect(() => {
    if (!mapRef.current) return;
    setTimeout(() => {
      mapRef.current.invalidateSize();
      // invalidateSize() ne redimensionne que le conteneur Leaflet ; le canvas WebGL
      // du fond vectoriel MapLibre doit être redimensionné séparément, sinon il reste
      // coupé/mal cadré après un changement de taille (plein écran, rotation d'écran...).
      if (tileStandardRef.current && tileStandardRef.current.getMaplibreMap) {
        tileStandardRef.current.getMaplibreMap().resize();
      }
    }, 250);
  }, [fullscreen]);

  useEffect(() => {
    if (!tileStandardRef.current || !tileSatelliteRef.current) return;
    if (satellite) {
      mapRef.current.removeLayer(tileStandardRef.current);
      tileSatelliteRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(tileSatelliteRef.current);
      tileStandardRef.current.addTo(mapRef.current);
    }
  }, [satellite]);

  // Couches thématiques Esri — surcouches indépendantes du fond de carte (standard OU
  // satellite), créées une seule fois puis simplement ajoutées/retirées à la bascule.
  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined" || !L.esri) return;
    if (!coucheOccupationSolRef.current) {
      // Occupation du sol 10 m, hébergée par Esri (ArcGIS Living Atlas) — aucune clé API,
      // aucun compte Copernicus requis. Classification dérivée d'imagerie Sentinel-2 en amont,
      // mais servie et mise en cache entièrement par Esri : intégration bien plus simple.
      coucheOccupationSolRef.current = L.esri.imageMapLayer({
        url: "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer",
        opacity: 0.65,
        attribution: "Esri, Impact Observatory",
      });
    }
    if (coucheOccupationSol) coucheOccupationSolRef.current.addTo(mapRef.current);
    else if (mapRef.current.hasLayer(coucheOccupationSolRef.current)) mapRef.current.removeLayer(coucheOccupationSolRef.current);
  }, [coucheOccupationSol]);

  useEffect(() => {
    if (!mapRef.current || typeof L === "undefined" || !L.esri) return;
    if (!coucheHydrologieRef.current) {
      // Repères hydrologiques (cours d'eau, lacs, bassins) — couche de référence Esri,
      // purement cartographique, sans lien avec l'imagerie satellite.
      coucheHydrologieRef.current = L.esri.tiledMapLayer({
        url: "https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Hydro_Reference_Overlay/MapServer",
        opacity: 0.9,
        attribution: "Esri",
      });
    }
    if (coucheHydrologie) coucheHydrologieRef.current.addTo(mapRef.current);
    else if (mapRef.current.hasLayer(coucheHydrologieRef.current)) mapRef.current.removeLayer(coucheHydrologieRef.current);
  }, [coucheHydrologie]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    async function chargerDateImagerie() {
      try {
        const center = map.getCenter();
        const b = map.getBounds();
        const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
        const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/identify?geometry=${center.lng},${center.lat}&geometryType=esriGeometryPoint&sr=4326&layers=all&tolerance=3&mapExtent=${bbox}&imageDisplay=400,400,96&returnGeometry=false&f=json`;
        const res = await fetch(url);
        const data = await res.json();
        const resultat = (data.results || []).find(r => r.attributes && Object.keys(r.attributes).some(k => k.toLowerCase().includes("date")));
        if (!resultat) { setDateImagerie(null); return; }
        const cleDate = Object.keys(resultat.attributes).find(k => k.toLowerCase().includes("date"));
        setDateImagerie(resultat.attributes[cleDate] || null);
      } catch (e) {
        setDateImagerie(null);
      }
    }

    function chargerAvecDebounce() {
      clearTimeout(dateImagerieTimerRef.current);
      dateImagerieTimerRef.current = setTimeout(chargerDateImagerie, 700);
    }

    if (satellite) {
      chargerAvecDebounce();
      map.on("moveend", chargerAvecDebounce);
    } else {
      setDateImagerie(undefined);
    }
    return () => {
      clearTimeout(dateImagerieTimerRef.current);
      map.off("moveend", chargerAvecDebounce);
    };
  }, [satellite]);

  useEffect(() => {
    if (mapRef.current || !mapElRef.current || typeof L === "undefined") return;
    // maxZoom explicite requis par L.markerClusterGroup (calcule ses niveaux de cluster à
    // partir de map.getMaxZoom()) — les tuiles vectorielles MapLibre, contrairement aux
    // anciennes tuiles raster CARTO, ne renseignent pas cette valeur automatiquement.
    const map = L.map(mapElRef.current, { zoomControl: true, maxZoom: 19 }).setView(AFRICA_CENTER, 4);
    // Fond de carte standard : tuiles vectorielles OpenFreeMap (gratuites, sans clé API),
    // rendues via MapLibre GL et branchées sur Leaflet grâce à maplibre-gl-leaflet.
    // Contrairement à l'ancien fond CARTO raster, ces tuiles ne passent pas par le cache
    // IndexedDB de la section 5 (creerCoucheTuilesHorsLigne) : le pré-téléchargement
    // hors-ligne du fond standard n'est donc plus disponible pour le moment (voir note
    // dans la fonction de téléchargement hors-ligne plus bas).
    // Repli automatique : certains appareils/navigateurs (WebGL désactivé, script bloqué
    // par un bloqueur de pub, vieux webview Android...) ne peuvent pas initialiser MapLibre.
    // Plutôt que de laisser la carte vide, on bascule alors sur un fond raster classique.
    let coucheVectorielleOk = false;
    if (typeof L.maplibreGL === "function") {
      try {
        const coucheVectorielle = L.maplibreGL({
          style: "https://tiles.openfreemap.org/styles/liberty",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://openfreemap.org">OpenFreeMap</a>',
        });
        coucheVectorielle.addTo(map);
        tileStandardRef.current = coucheVectorielle;
        coucheVectorielleOk = true;
      } catch (e) {
        console.warn("Fond vectoriel MapLibre indisponible, repli sur le fond raster :", e);
      }
    }
    if (!coucheVectorielleOk) {
      tileStandardRef.current = creerCoucheTuilesHorsLigne("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19, id: "osm-secours",
      }).addTo(map);
    }
    tileSatelliteRef.current = creerCoucheTuilesHorsLigne("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri", maxZoom: 19, id: "satellite",
    });
    // 8. Performance : regroupement des marqueurs (clustering) quand la librairie est
    // chargée, avec repli silencieux sur un simple groupe de calques sinon.
    layerRef.current = (typeof L.markerClusterGroup === "function")
      ? L.markerClusterGroup({ maxClusterRadius: 60, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 17 }).addTo(map)
      : L.layerGroup().addTo(map);
    drawnItemsRef.current = new L.FeatureGroup().addTo(map);
    zonesLayerRef.current = L.layerGroup().addTo(map);
    parcoursLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    map.on("click", (e) => {
      if (addModeRef.current) {
        const p = [e.latlng.lat, e.latlng.lng];
        setAddPoint(p);
        if (addPointMarkerRef.current) map.removeLayer(addPointMarkerRef.current);
        addPointMarkerRef.current = L.circleMarker(e.latlng, { radius: 8, color: "var(--c-accent-dark)", fillColor: "var(--c-accent-dark)", fillOpacity: 0.9, weight: 2 }).addTo(map);
        return;
      }
      if (coordModeRef.current) {
        setClickedCoord([e.latlng.lat, e.latlng.lng]);
        if (coordMarkerRef.current) map.removeLayer(coordMarkerRef.current);
        coordMarkerRef.current = L.circleMarker(e.latlng, { radius: 7, color: "var(--c-warning)", fillColor: "var(--c-warning)", fillOpacity: 0.9, weight: 2 }).addTo(map);
      }
      if (climatModeRef.current) {
        setClimatLoading(true);
        const popup = L.popup().setLatLng(e.latlng).setContent(t(lang, "climat_chargement")).openOn(map);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${e.latlng.lat}&longitude=${e.latlng.lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`)
          .then((res) => res.json())
          .then((data) => {
            const c = data.current;
            if (!c) { popup.setContent(t(lang, "climat_indisponible")); return; }
            popup.setContent(
              `<b>${t(lang, "climat_actuel_title")}</b><br/>${t(lang, "climat_temperature")} : ${c.temperature_2m}°C<br/>${t(lang, "climat_precipitations")} : ${c.precipitation} mm<br/>${t(lang, "climat_vent")} : ${c.wind_speed_10m} km/h`
            );
          })
          .catch(() => popup.setContent(t(lang, "climat_erreur_reseau")))
          .finally(() => setClimatLoading(false));
      }
    });

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItemsRef.current.clearLayers();
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);

      if (e.layerType === "marker") {
        const p = layer.getLatLng();
        setMeasureResult({ type: "point", texte: `Point créé : ${formatCoordonnees(p.lat, p.lng, coordFormat)}` });
        setZoneAnalysis(null);
      } else if (e.layerType === "polyline") {
        const pts = layer.getLatLngs();
        let dist = 0;
        for (let i = 1; i < pts.length; i++) dist += pts[i - 1].distanceTo(pts[i]);
        const texte = dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${Math.round(dist)} m`;
        setMeasureResult({ type: "distance", texte: `Distance mesurée : ${texte}` });
        setZoneAnalysis(null);
      } else if (e.layerType === "polygon" || e.layerType === "rectangle") {
        const latlngs = layer.getLatLngs()[0];
        const areaM2 = L.GeometryUtil.geodesicArea(latlngs);
        const texte = areaM2 >= 10000 ? `${(areaM2 / 10000).toFixed(2)} ha` : `${Math.round(areaM2)} m²`;
        setMeasureResult({ type: "superficie", texte: `Superficie mesurée : ${texte}` });

        const poly = latlngs.map((p) => [p.lat, p.lng]);
        const d = analysisDataRef.current;
        const items = [];
        if (d.layersOn.arbres) (d.arbres || []).filter((a) => a.valide || a.device_id === DEVICE_ID).forEach((a) => { if (a.lat && a.lng && pointInPolygon([a.lat, a.lng], poly)) items.push({ type: "Arbre", nom: a.nom, date: a.date, lat: a.lat, lng: a.lng }); });
        if (["signalements", "dechets", "pollution", "deforestation", "mine", "pollution_eau", "assechement", "deversement"].some(c => d.layersOn[c])) {
          (d.signalements || []).filter((s) => s.valide || s.device_id === DEVICE_ID).forEach((s) => {
            const couche = coucheDeCategorie(s.categorie);
            if (!d.layersOn[couche]) return;
            if (s.lat && s.lng && pointInPolygon([s.lat, s.lng], poly)) {
              const cat = categorieMeta(s.categorie);
              items.push({ type: cat.label, nom: cat.label, date: s.date, lat: s.lat, lng: s.lng });
            }
          });
        }
        if (d.layersOn.biodiversite) (d.observations || []).forEach((o) => { if (o.lat && o.lng && pointInPolygon([o.lat, o.lng], poly)) items.push({ type: "Biodiversité", nom: o.espece || "Observation", date: new Date(o.created_at).toLocaleDateString("fr-FR"), lat: o.lat, lng: o.lng }); });

        const parType = {};
        items.forEach((it) => { parType[it.type] = (parType[it.type] || 0) + 1; });
        setZoneAnalysis({ total: items.length, parType, items });
      }
    });

    if (navigator.geolocation) {
      locateMe(map);
    } else {
      setLocating(false);
    }

    setTimeout(() => {
      map.invalidateSize();
      if (tileStandardRef.current && tileStandardRef.current.getMaplibreMap) {
        tileStandardRef.current.getMaplibreMap().resize();
      }
    }, 200);

    // Rotation d'écran / redimensionnement de fenêtre : le canvas WebGL du fond vectoriel
    // ne suit pas automatiquement Leaflet, on le force à se recadrer.
    window.addEventListener("resize", () => {
      if (tileStandardRef.current && tileStandardRef.current.getMaplibreMap) {
        tileStandardRef.current.getMaplibreMap().resize();
      }
    });
  }, []);

  // Création / suppression des deux couches Sentinel-2 (avant / après) selon l'activation
  // de la comparaison et les années choisies. La couche "après" est placée dans une pane
  // dédiée pour pouvoir être découpée (clip-path) par le curseur de balayage, sans toucher
  // à la couche "avant" ni au fond de carte existant.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (coucheCompareAvantRef.current) { map.removeLayer(coucheCompareAvantRef.current); coucheCompareAvantRef.current = null; }
    if (coucheCompareApresRef.current) { map.removeLayer(coucheCompareApresRef.current); coucheCompareApresRef.current = null; }
    if (!compareActif) return;
    if (!map.getPane("paneCompareAvant")) {
      const p = map.createPane("paneCompareAvant");
      p.style.zIndex = 448; p.style.pointerEvents = "none";
    }
    if (!map.getPane("paneCompareApres")) {
      const p = map.createPane("paneCompareApres");
      p.style.zIndex = 449; p.style.pointerEvents = "none";
    }
    setCompareErreurAvant(false);
    setCompareErreurApres(false);
    coucheCompareAvantRef.current = L.tileLayer(urlMosaiqueSentinel2(compareAnnee1), {
      pane: "paneCompareAvant", maxZoom: 19, maxNativeZoom: SENTINEL2_ZOOM_NATIF_MAX, attribution: SENTINEL2_ATTRIBUTION,
    }).on("tileerror", () => setCompareErreurAvant(true)).addTo(map);
    coucheCompareApresRef.current = L.tileLayer(urlMosaiqueSentinel2(compareAnnee2), {
      pane: "paneCompareApres", maxZoom: 19, maxNativeZoom: SENTINEL2_ZOOM_NATIF_MAX, attribution: SENTINEL2_ATTRIBUTION,
    }).on("tileerror", () => setCompareErreurApres(true)).addTo(map);
    const paneApres = map.getPane("paneCompareApres");
    if (paneApres) paneApres.style.clipPath = `inset(0 0 0 ${compareSwipePos}%)`;
    // Le glissement avant/après porte sur toute l'image, pas sur la carte : on suspend le
    // déplacement et le zoom de la carte le temps de la comparaison (réactivés à la sortie),
    // pour que le geste de glissement ne soit jamais intercepté par le panoramique de fond.
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    return () => {
      if (coucheCompareAvantRef.current) { map.removeLayer(coucheCompareAvantRef.current); coucheCompareAvantRef.current = null; }
      if (coucheCompareApresRef.current) { map.removeLayer(coucheCompareApresRef.current); coucheCompareApresRef.current = null; }
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
    };
  }, [compareActif, compareAnnee1, compareAnnee2]);

  // Déplacement du curseur de balayage : ne redécoupe que la pane "après", sans recréer
  // les couches (évite de re-télécharger les tuiles à chaque pixel de glissement).
  useEffect(() => {
    if (!mapRef.current || !compareActif) return;
    const paneApres = mapRef.current.getPane("paneCompareApres");
    if (paneApres) paneApres.style.clipPath = `inset(0 0 0 ${compareSwipePos}%)`;
  }, [compareSwipePos, compareActif]);

  // Vérification réelle, octet par octet, que les deux mosaïques renvoient bien une image
  // différente pour la zone actuellement affichée — pas une supposition sur le service.
  // Retentée à chaque changement d'années et à chaque déplacement/zoom de la carte
  // (avec un court délai pour ne pas la relancer à chaque frame pendant un glissement).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !compareActif) { setCompareVerif(null); return; }
    let annule = false;
    function lancerVerification() {
      setCompareVerif("verification");
      const z = Math.min(SENTINEL2_ZOOM_NATIF_MAX, Math.round(map.getZoom()));
      const centre = map.getCenter();
      const x = Math.floor((centre.lng + 180) / 360 * Math.pow(2, z));
      const y = Math.floor((1 - Math.log(Math.tan(centre.lat * Math.PI / 180) + 1 / Math.cos(centre.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
      const url1 = urlMosaiqueSentinel2(compareAnnee1).replace("{z}", z).replace("{y}", y).replace("{x}", x);
      const url2 = urlMosaiqueSentinel2(compareAnnee2).replace("{z}", z).replace("{y}", y).replace("{x}", x);
      Promise.all([chargerTuileBrute(url1), chargerTuileBrute(url2)])
        .then(([buf1, buf2]) => { if (!annule) setCompareVerif(tuilesIdentiques(buf1, buf2) ? "identiques" : "distinctes"); })
        .catch(() => { if (!annule) setCompareVerif("erreur"); });
    }
    lancerVerification();
    const onMoveEnd = () => { clearTimeout(compareVerifTimerRef.current); compareVerifTimerRef.current = setTimeout(lancerVerification, 600); };
    map.on("moveend", onMoveEnd);
    return () => { annule = true; map.off("moveend", onMoveEnd); clearTimeout(compareVerifTimerRef.current); };
  }, [compareActif, compareAnnee1, compareAnnee2]);

  function lierComparaisonAuSignalement() {
    const map = mapRef.current;
    if (!map) return;
    const centre = map.getCenter();
    fermerTousLesPanneaux();
    resetAddForm();
    setAddType("signalement");
    setAddPoint([centre.lat, centre.lng]);
    setFDescription(
      compareVerif === "identiques"
        ? `Observation satellite Sentinel-2 (EOX/Copernicus) : aucune différence détectée entre ${compareAnnee1} et ${compareAnnee2} ` +
          `autour de ${centre.lat.toFixed(5)}, ${centre.lng.toFixed(5)}.`
        : `Observation satellite Sentinel-2 (EOX/Copernicus) : différence visible entre ${compareAnnee1} et ${compareAnnee2} ` +
          `autour de ${centre.lat.toFixed(5)}, ${centre.lng.toFixed(5)}. Constat visuel à confirmer sur le terrain — ` +
          `ce n'est pas en soi une preuve d'infraction.`
    );
    if (addPointMarkerRef.current) { map.removeLayer(addPointMarkerRef.current); }
    addPointMarkerRef.current = L.circleMarker(centre, { radius: 8, color: "var(--c-accent-dark)", fillColor: "var(--c-accent-dark)", fillOpacity: 0.9, weight: 2 }).addTo(map);
    setAddMode(true);
  }

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    const counts = { arbres: 0, dechets: 0, pollution: 0, signalements: 0, biodiversite: 0, deforestation: 0, mine: 0, pollution_eau: 0, assechement: 0, deversement: 0 };

    if (layersOn.arbres) {
      (arbres || []).filter((a) => a.valide || a.device_id === DEVICE_ID).forEach((a) => {
        if (!passeFiltrePeriode(a.planted_at)) return;
        counts.arbres++;
        const icon = L.divIcon({ html: markerHtml("var(--c-accent)", "tree"), className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
        const photoHtml = mediaHtml(a.photo_url, 110);
        const pendingHtml = !a.valide ? `<div style="font-size:11px;color:#B5451B;margin-top:4px">⏳ ${t(lang, "en_attente_validation")}</div>` : "";
        L.marker([a.lat, a.lng], { icon, opacity: a.valide ? 1 : 0.6 }).addTo(layerRef.current)
          .on("click", () => setSelected({ type: "arbre", data: a }))
          .bindPopup(`<b>${escapeHtml(a.nom)}</b><br/>${t(lang, "plante_le")}${a.date}${photoHtml}${pendingHtml}`);
      });
    }

    if (COUCHES_SIGNALEMENT.some(c => layersOn[c])) {
      (signalements || []).filter((s) => s.valide || s.device_id === DEVICE_ID).forEach((s) => {
        const couche = coucheDeCategorie(s.categorie);
        if (!layersOn[couche]) return;
        if (filtreCategorie && s.categorie !== filtreCategorie) return;
        if (filtreStatut && s.statut !== filtreStatut) return;
        if (!passeFiltrePeriode(s.created_at)) return;
        counts[couche]++;
        const u = URGENCE.find((x) => x.id === s.urgence);
        const color = u ? u.color : "#B5451B";
        const origine = origineSignalement(s, origineParGroupe);
        const icon = L.divIcon({ html: markerHtml(color, "pin", ORIGINE_COULEURS[origine]), className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
        const cat = categorieMeta(s.categorie);
        const photoHtml = mediaHtml(s.photo_url, 110);
        const pendingHtml = !s.valide ? `<div style="font-size:11px;color:#B5451B;margin-top:4px">⏳ ${t(lang, "en_attente_validation")}</div>` : "";
        const origineHtml = origine !== "citoyen" ? `<div style="font-size:10.5px;color:${ORIGINE_COULEURS[origine]};font-weight:600;margin-top:2px">${ORIGINE_LABELS[origine]}</div>` : "";
        L.marker([s.lat, s.lng], { icon, opacity: s.valide ? 1 : 0.6 }).addTo(layerRef.current)
          .on("click", () => setSelected({ type: "signalement", data: s }))
          .bindPopup(`<b>${escapeHtml(categorieLabel(lang, cat.id))}</b><br/>${s.date}${origineHtml}${photoHtml}${pendingHtml}`);
      });
    }

    if (layersOn.biodiversite) {
      (observations || []).forEach((o) => {
        if (!o.lat || !o.lng) return;
        if (!passeFiltrePeriode(o.created_at)) return;
        counts.biodiversite++;
        const icon = L.divIcon({ html: markerHtml("var(--c-sky)", "leaf"), className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
        const photoHtml = mediaHtml(o.photo_url, 110);
        L.marker([o.lat, o.lng], { icon }).addTo(layerRef.current)
          .on("click", () => setSelected({ type: "observation", data: o }))
          .bindPopup(`<b>${o.espece ? escapeHtml(o.espece) : t(lang, "observation_generique")}</b><br/>${new Date(o.created_at).toLocaleDateString("fr-FR")}${photoHtml}`);
      });
    }

    if (layersOn.enquetes) {
      (enquetesCarte || []).forEach((e) => {
        if (!e.lat || !e.lng) return;
        if (filtreGraviteEnquete && e.niveau_constat !== filtreGraviteEnquete) return;
        if (!passeFiltrePeriode(e.created_at)) return;
        counts.enquetes = (counts.enquetes || 0) + 1;
        const color = ENQ_NIVEAU_COULEUR[e.niveau_constat] || "#6B7A8F";
        const icon = L.divIcon({ html: markerHtml(color, "search"), className: "", iconSize: [30, 30], iconAnchor: [15, 30] });
        L.marker([e.lat, e.lng], { icon }).addTo(layerRef.current)
          .on("click", () => setSelected({ type: "enquete", data: e }))
          .bindPopup(`<b>${escapeHtml(e.titre)}</b><br/>${escapeHtml(nomTypeEnqueteCarte(e.categorie))}<br/><span style="color:${color};font-weight:600">${escapeHtml((ENQ_NIVEAUX.find(n => n[0] === e.niveau_constat) || [])[1] || "")}</span> · ${e.numero}`);
      });
    }

    setVisibleCount(counts);
  }, [signalements, arbres, observations, enquetesCarte, layersOn, filtreCategorie, filtreStatut, filtreDepuis, filtreGraviteEnquete, origineParGroupe]);

  // Rendu des zones locales et des parcours enregistrés (7. interaction avec les données EcoVigil).
  useEffect(() => {
    if (!zonesLayerRef.current) return;
    zonesLayerRef.current.clearLayers();
    if (!showZones) return;
    zonesLocales.forEach(z => {
      const icon = L.divIcon({ html: markerHtml("var(--c-warning)", "pin"), className: "", iconSize: [26, 26], iconAnchor: [13, 26] });
      L.marker([z.lat, z.lng], { icon }).addTo(zonesLayerRef.current).bindPopup(`<b>${escapeHtml(z.nom)}</b><br/>${t(lang, "zone_enregistree_localement")}`);
    });
  }, [zonesLocales, showZones]);

  useEffect(() => {
    if (!parcoursLayerRef.current) return;
    parcoursLayerRef.current.clearLayers();
    if (!showParcoursPanel) return;
    savedParcours.forEach(p => {
      L.polyline(p.points, { color: "var(--c-sky)", weight: 3, opacity: 0.8, dashArray: "6 4" }).addTo(parcoursLayerRef.current)
        .bindPopup(`<b>Parcours</b><br/>${(p.distance_m / 1000).toFixed(2)} km · ${formatDuree(p.duree_s)}`);
    });
  }, [savedParcours, showParcoursPanel]);

  const totalVisible = visibleCount.arbres + visibleCount.dechets + visibleCount.pollution + visibleCount.signalements + visibleCount.biodiversite + visibleCount.deforestation + visibleCount.mine + visibleCount.pollution_eau + visibleCount.assechement + visibleCount.deversement;
  const COUCHES_SIGNALEMENT = ["signalements", "dechets", "pollution", "deforestation", "mine", "pollution_eau", "assechement", "deversement"];
  const aucuneCoucheActive = !layersOn.arbres && !layersOn.biodiversite && !layersOn.enquetes && COUCHES_SIGNALEMENT.every(c => !layersOn[c]);

  const LAYER_DEFS = [
    { id: "arbres", label: "Arbres", labelKey: "layer_arbres", icon: IconTree, color: "var(--c-accent)" },
    { id: "deforestation", label: "Déforestation", labelKey: "layer_deforestation", icon: IconTree, color: "#8A6318" },
    { id: "mine", label: "Exploitation minière", labelKey: "layer_mine", icon: IconPick, color: "#7A1F1F" },
    { id: "pollution", label: "Pollution", labelKey: "layer_pollution", icon: IconWind, color: "#6B7A8F" },
    { id: "dechets", label: "Déchets et décharges", labelKey: "layer_dechets", icon: IconTrash, color: "#8A6318" },
    { id: "pollution_eau", label: "Pollution des cours d'eau", labelKey: "layer_pollution_eau", icon: IconDroplet, color: "#2E6B8A" },
    { id: "assechement", label: "Assèchement des points d'eau", labelKey: "layer_assechement", icon: IconSun, color: "#E3A73B" },
    { id: "deversement", label: "Déversements polluants", labelKey: "layer_deversement", icon: IconAlert, color: "#B5451B" },
    { id: "signalements", label: "Autres atteintes environnementales", labelKey: "layer_signalements", icon: IconGlobe, color: "#6B7A8F" },
    { id: "biodiversite", label: "Biodiversité", labelKey: "layer_biodiversite", icon: IconSprout, color: "var(--c-sky)" },
    { id: "enquetes", label: "Enquêtes validées", labelKey: "layer_enquetes", icon: IconSearch, color: "#7A1F1F" },
  ];

  // Sources externes prévues par le cahier des charges mais pas encore
  // branchées à une donnée réelle vérifiable (voir commentaire plus haut).
  const EXTERNAL_LAYERS_NON_CONNECTEES = [
    { id: "forets", label: "Couverture forestière", icon: IconTree },
    { id: "aires_protegees", label: "Aires protégées", icon: IconShield },
    { id: "zones_humides", label: "Zones humides", icon: IconWaves },
    { id: "risques", label: "Risques (incendie / inondation)", icon: IconFlame },
  ];

  function DetailCard({ s }) {
    if (s.type === "signalement") {
      return (
        <>
          <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: 14 }}>{categorieLabel(lang, s.data.categorie)}</div>
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 3 }}>{s.data.date}{s.data.statut ? ` · ${s.data.statut}` : ""}</div>
          <div style={{ fontSize: 13, color: "var(--c-text-secondary)", marginTop: 6 }}>{s.data.description || t(lang, "aucune_description")}</div>
        </>
      );
    }
    if (s.type === "enquete") {
      const niveauT = ENQ_NIVEAUX.find(n => n[0] === s.data.niveau_constat) || [];
      const color = ENQ_NIVEAU_COULEUR[s.data.niveau_constat] || "#6B7A8F";
      return (
        <>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.data.titre}</div>
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 3 }}>{nomTypeEnqueteCarte(s.data.categorie)} · {s.data.numero}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color, marginTop: 6 }}>{niveauT[1] || ""}</div>
          {niveauT[2] && <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginTop: 4 }}>{niveauT[2]}</div>}
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 6 }}>Enquête {s.data.statut === "verifiee" ? "vérifiée" : "terminée"} le {new Date(s.data.updated_at).toLocaleDateString("fr-FR")}</div>
        </>
      );
    }
    if (s.type === "observation") {
      return (
        <>
          <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: 14 }}>{s.data.espece || t(lang, "observation_biodiversite")}</div>
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 3 }}>{new Date(s.data.created_at).toLocaleDateString("fr-FR")}</div>
          <div style={{ fontSize: 13, color: "var(--c-text-secondary)", marginTop: 6 }}>{s.data.description || t(lang, "aucune_description")}</div>
        </>
      );
    }
    return (
      <>
        <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.data.nom}</div>
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 3 }}>{t(lang, "plante_le")}{s.data.date}</div>
      </>
    );
  }

  function fermerTousLesPanneaux() {
    setShowLayers(false); setShowFilters(false); setShowTools(false);
    setShowSearch(false); setShowOffline(false); setShowParcoursPanel(false);
    setShowComparaison(false);
    if (addMode) annulerAjout();
  }
  function ouvrirPanneau(setter) { fermerTousLesPanneaux(); setter(true); }

  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_carte_intelligente")}>{t(lang, "titre_carte_intelligente")}</SectionTitle>

      {/* Statut réseau / synchronisation — visible en permanence (section 9 : Synchroniser). */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 20, background: online ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)", color: online ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {online ? <IconWifi size={12} /> : <IconWifiOff size={12} />} {online ? t(lang, "en_ligne") : t(lang, "hors_ligne")}
        </span>
        {pendingQueueCount > 0 && (
          <button onClick={() => onFlushQueue && onFlushQueue()} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 20, border: "none", background: "var(--c-warning)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
            <IconCloudDownload size={12} /> {pendingQueueCount} {t(lang, "en_attente_synchro")}
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => showLayers ? setShowLayers(false) : ouvrirPanneau(setShowLayers)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showLayers ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showLayers ? "var(--c-accent-dark)" : "var(--c-surface)", color: showLayers ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconLayers size={14} /> {t(lang, "couches_btn")} {!aucuneCoucheActive && `(${Object.values(layersOn).filter(Boolean).length})`}
        </button>
        <button onClick={() => showFilters ? setShowFilters(false) : ouvrirPanneau(setShowFilters)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: filtresActifs ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: filtresActifs ? "var(--c-accent-dark)" : "var(--c-surface)", color: filtresActifs ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconTarget size={14} /> {t(lang, "filtres_btn")} {filtresActifs && "●"}
        </button>
        <button onClick={() => showTools ? setShowTools(false) : ouvrirPanneau(setShowTools)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showTools ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showTools ? "var(--c-accent-dark)" : "var(--c-surface)", color: showTools ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconEdit size={14} /> {t(lang, "outils_btn")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => addMode ? annulerAjout() : ouvrirPanneau(() => setAddMode(true))} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: addMode ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: addMode ? "var(--c-accent-dark)" : "var(--c-surface)", color: addMode ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconMapPin size={14} /> {t(lang, "ajouter_btn")}
        </button>
        <button onClick={() => showSearch ? setShowSearch(false) : ouvrirPanneau(setShowSearch)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showSearch ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showSearch ? "var(--c-accent-dark)" : "var(--c-surface)", color: showSearch ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconSearch size={14} /> {t(lang, "rechercher_btn")}
        </button>
        <button onClick={() => showOffline ? setShowOffline(false) : ouvrirPanneau(setShowOffline)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showOffline ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showOffline ? "var(--c-accent-dark)" : "var(--c-surface)", color: showOffline ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconCloudDownload size={14} /> {t(lang, "hors_ligne")}
        </button>
        <button onClick={() => showComparaison ? setShowComparaison(false) : ouvrirPanneau(setShowComparaison)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: (showComparaison || compareActif) ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: (showComparaison || compareActif) ? "var(--c-accent-dark)" : "var(--c-surface)", color: (showComparaison || compareActif) ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }} title="Comparaison satellite Sentinel-2">
          <IconTrendingUp size={14} /> Évolution
        </button>
        <button onClick={() => showParcoursPanel ? setShowParcoursPanel(false) : ouvrirPanneau(setShowParcoursPanel)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showParcoursPanel ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showParcoursPanel ? "var(--c-accent-dark)" : "var(--c-surface)", color: showParcoursPanel ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <IconRoute size={14} /> {t(lang, "parcours_btn")}
        </button>
      </div>

      {addMode && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-accent-dark)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          {!addPoint && (
            <div style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>{t(lang, "toucher_carte_ajouter")}</div>
          )}
          {addPoint && !addType && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>
                {t(lang, "point_choisi_prefix")}{addPoint[0].toFixed(5)}, {addPoint[1].toFixed(5)}{t(lang, "point_choisi_suffix")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button onClick={() => setAddType("signalement")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>🚩 {t(lang, "type_signalement")}</button>
                <button onClick={() => setAddType("arbre")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>🌳 {t(lang, "type_arbre")}</button>
                <button onClick={() => setAddType("observation")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>🦋 {t(lang, "type_observation")}</button>
                <button onClick={() => setAddType("zone")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>⬠ {t(lang, "type_zone")}</button>
              </div>
            </>
          )}
          {addPoint && addType === "signalement" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={fCategorie} onChange={e => setFCategorie(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {[...CATEGORIES, ...Object.keys(ENV_PROBLEMES_INDEX).filter(code => !CATEGORIES.some(c => c.id === code)).map(code => ({ id: code }))].map(c => <option key={c.id} value={c.id}>{categorieLabel(lang, c.id)}</option>)}
              </select>
              <select value={fUrgence} onChange={e => setFUrgence(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {URGENCE.map(u => <option key={u.id} value={u.id}>{urgenceLabel(lang, u.id)}</option>)}
              </select>
              <textarea value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder={t(lang, "description_optionnel")} rows={2} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)", resize: "vertical" }} />
            </div>
          )}
          {addPoint && addType === "arbre" && (
            <input value={fNom} onChange={e => setFNom(e.target.value)} placeholder={t(lang, "essence_nom_arbre")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }} />
          )}
          {addPoint && addType === "observation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={fEspece} onChange={e => setFEspece(e.target.value)} placeholder={t(lang, "espece_observee_placeholder")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }} />
              <textarea value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder={t(lang, "description_optionnel")} rows={2} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)", resize: "vertical" }} />
            </div>
          )}
          {addPoint && addType === "zone" && (
            <input value={fZoneNom} onChange={e => setFZoneNom(e.target.value)} placeholder={t(lang, "nom_zone_placeholder")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }} />
          )}
          {addPoint && addType && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => setAddType(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t(lang, "retour_btn")}</button>
              <button onClick={validerAjout} disabled={addSaving} style={{ flex: 2, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: addSaving ? "default" : "pointer", opacity: addSaving ? 0.7 : 1 }}>{addSaving ? t(lang, "enregistrement_encours") : t(lang, "enregistrer")}</button>
            </div>
          )}
          <button onClick={annulerAjout} style={{ marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 11, cursor: "pointer" }}>{t(lang, "annuler_ajout")}</button>
        </div>
      )}

      {showSearch && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t(lang, "rechercher_placeholder")} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)", marginBottom: 8 }} autoFocus />
          {searchLocalResults.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--c-text-muted)", margin: "4px 0" }}>{t(lang, "donnees_pace")}</div>
              {searchLocalResults.map((r, i) => (
                <div key={i} onClick={() => allerVers(r.lat, r.lng)} style={{ padding: "7px 4px", fontSize: 12.5, color: "var(--c-text)", cursor: "pointer", borderBottom: "1px solid var(--c-border)" }}>{r.label} <span style={{ color: "var(--c-text-muted)", fontSize: 11 }}>· {r.sub}</span></div>
              ))}
            </div>
          )}
          {searchPlaceResults.length > 0 && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--c-text-muted)", margin: "4px 0" }}>{t(lang, "lieux_osm")}</div>
              {searchPlaceResults.map((r, i) => (
                <div key={i} onClick={() => allerVers(r.lat, r.lng, 14)} style={{ padding: "7px 4px", fontSize: 12.5, color: "var(--c-text)", cursor: "pointer", borderBottom: "1px solid var(--c-border)" }}>{r.label}</div>
              ))}
            </div>
          )}
          {searchLoading && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{t(lang, "recherche_encours")}</div>}
          {!searchLoading && searchQuery.trim().length >= 2 && searchLocalResults.length === 0 && searchPlaceResults.length === 0 && (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{t(lang, "aucun_resultat")}</div>
          )}
        </div>
      )}

      {showOffline && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Carte hors connexion</div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Télécharge la zone actuellement affichée pour pouvoir naviguer, mesurer et collecter des données sans réseau. Les données collectées hors ligne sont conservées et envoyées automatiquement dès que la connexion revient.
          </div>
          <div style={{ fontSize: 12, marginBottom: 10 }}>{tilesCachedCount} tuile{tilesCachedCount > 1 ? "s" : ""} déjà en cache sur cet appareil.</div>
          {!satellite && (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", background: "var(--c-bg)", borderRadius: 8, padding: 8, marginBottom: 10, lineHeight: 1.5 }}>
              Le téléchargement hors-ligne n'est disponible que pour le fond satellite pour le moment. Passe en vue satellite pour pré-télécharger cette zone.
            </div>
          )}
          {offlineDownloading ? (
            <>
              <div style={{ height: 8, borderRadius: 4, background: "var(--c-bg)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${offlineProgress.total ? (offlineProgress.done / offlineProgress.total) * 100 : 0}%`, background: "var(--c-accent-dark)" }} />
              </div>
              <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 8 }}>{offlineProgress.done} / {offlineProgress.total} tuiles téléchargées</div>
              <button onClick={annulerTelechargement} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Arrêter le téléchargement</button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={telechargerZoneHorsLigne} disabled={!satellite} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: satellite ? "var(--c-accent-dark)" : "var(--c-border)", color: satellite ? "#fff" : "var(--c-text-faint)", fontSize: 12, fontWeight: 600, cursor: satellite ? "pointer" : "not-allowed" }}>
                <IconCloudDownload size={14} /> Télécharger cette zone
              </button>
              <button onClick={viderCacheHorsLigne} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Vider</button>
            </div>
          )}
          {!offlineDownloading && tilesCachedCount > 0 && (
            <button onClick={capturerImageZone} disabled={captureEnCours} style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: captureEnCours ? "default" : "pointer" }}>
              <IconCamera size={14} /> {captureEnCours ? "Génération…" : "Enregistrer une image de cette zone"}
            </button>
          )}
        </div>
      )}

      {showParcoursPanel && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Parcours GPS de terrain</div>
          {parcoursRecording ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 8 }}>⏺ Enregistrement… {formatDuree(parcoursElapsed)} · {parcoursPoints.length} points</div>
              <button onClick={() => arreterParcours(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <IconSquareStop size={13} /> Arrêter et enregistrer
              </button>
            </>
          ) : (
            <button onClick={demarrerParcours} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
              <IconPlay size={13} /> Démarrer un parcours
            </button>
          )}
          {savedParcours.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--c-text-muted)", marginBottom: 6 }}>Parcours enregistrés</div>
              {savedParcours.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--c-border)" }}>
                  <IconRoute size={13} color="var(--c-sky)" />
                  <span style={{ fontSize: 12, flex: 1 }}>{(p.distance_m / 1000).toFixed(2)} km · {formatDuree(p.duree_s)}</span>
                  <button onClick={() => supprimerParcours(p.id)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer" }}><IconX size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showTools && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Outils d'analyse géographique</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            <button onClick={() => { setCoordMode(!coordMode); setClimatMode(false); setClickedCoord(null); }} style={{ padding: "8px 6px", borderRadius: 8, border: coordMode ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)", background: coordMode ? "var(--c-accent-dark)" : "var(--c-bg)", color: coordMode ? "#fff" : "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>📍 Coordonnées GPS</button>
            <button onClick={() => startDraw("marker")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>📌 Créer un point</button>
            <button onClick={() => startDraw("polyline")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>📏 Mesurer une distance</button>
            <button onClick={() => startDraw("polygon")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>⬠ Zone / superficie</button>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
            "Zone / superficie" dessine un polygone : calcule sa surface et analyse automatiquement les données des couches actives à l'intérieur.
          </div>

          {clickedCoord && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 8 }}>
              Coordonnées : {clickedCoord[0].toFixed(5)}, {clickedCoord[1].toFixed(5)}
            </div>
          )}
          {measureResult && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, fontSize: 12, marginBottom: 8 }}>
              {measureResult.texte}
            </div>
          )}
          {zoneAnalysis && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{zoneAnalysis.total} donnée{zoneAnalysis.total > 1 ? "s" : ""} dans la zone</div>
              {Object.entries(zoneAnalysis.parType).map(([t, n]) => (
                <div key={t} style={{ fontSize: 11.5, color: "var(--c-text-secondary)" }}>{t} : {n}</div>
              ))}
              {zoneAnalysis.total === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune donnée des couches actives dans cette zone.</div>}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {(measureResult || zoneAnalysis || clickedCoord) && (
              <button onClick={clearAnalyse} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Effacer</button>
            )}
            {zoneAnalysis && zoneAnalysis.total > 0 && (
              <button onClick={exporterAnalyse} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <IconDownload size={13} /> Exporter
              </button>
            )}
          </div>
        </div>
      )}

      {showComparaison && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Comparaison satellite temporelle (Sentinel-2)</div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Compare deux mosaïques annuelles Sentinel-2 (Copernicus) sur la zone actuellement affichée — déplacez ou zoomez la carte <b>avant</b> d'activer la comparaison pour choisir la zone, car le déplacement/zoom de la carte est momentanément suspendu pendant que la comparaison est active (le glissement sur l'image sert alors à comparer, pas à déplacer la carte). Fonctionne indépendamment du fond satellite Esri.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10.5, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>Avant</label>
              <select value={compareAnnee1} onChange={e => setCompareAnnee1(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {anneesSentinel.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10.5, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>Après</label>
              <select value={compareAnnee2} onChange={e => setCompareAnnee2(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {anneesSentinel.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {anneesSentinelVerifiees === null && (
            <div style={{ fontSize: 10, color: "var(--c-text-muted)", marginBottom: 8 }}>Vérification des mosaïques réellement disponibles…</div>
          )}
          {anneesSentinelVerifiees === false && (
            <div style={{ fontSize: 10, color: "var(--c-warning)", marginBottom: 8, lineHeight: 1.4 }}>
              Liste d'années non confirmée par le service (vérification injoignable) : si une année choisie n'existe pas réellement, ce côté restera vide — essayez-en une autre le cas échéant.
            </div>
          )}
          <button onClick={() => { setCompareActif(v => !v); setCompareSwipePos(50); }} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: compareActif ? "var(--c-warning)" : "var(--c-accent-dark)", color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
            {compareActif ? "Désactiver la comparaison" : "Activer la comparaison"}
          </button>
          {compareAnnee1 === compareAnnee2 && (
            <div style={{ fontSize: 10.5, color: "var(--c-warning)", marginBottom: 8 }}>Choisissez deux années différentes pour une comparaison utile.</div>
          )}
          {compareActif && (
            <button onClick={lierComparaisonAuSignalement} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <IconMapPin size={13} /> Lier cette observation à un signalement
            </button>
          )}
          <div style={{ fontSize: 9.5, color: "var(--c-text-faint)", marginTop: 8, lineHeight: 1.4 }}>
            Source : Sentinel-2 cloudless, © EOX IT Services GmbH — contient des données Copernicus Sentinel modifiées. Mosaïques annuelles (pas une date de prise de vue exacte). Un changement visible ici n'est pas en soi une preuve d'infraction : à recouper avec une vérification de terrain.
          </div>
        </div>
      )}

      {showLayers && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>{t(lang, "donnees_pace")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {LAYER_DEFS.map(l => (
              <label key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
                <input type="checkbox" checked={layersOn[l.id]} onChange={() => toggleLayer(l.id)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
                <l.icon size={14} color={l.color} />
                <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>{t(lang, l.labelKey)}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--c-text-muted)" }}>{visibleCount[l.id]}</span>
              </label>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconMapPin size={14} color="var(--c-warning)" />
            <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>{t(lang, "zones_enregistrees_local")}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--c-text-muted)" }}>{zonesLocales.length}</span>
          </label>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            {t(lang, "projets_suivi_admin")}
          </div>

          <div style={{ height: 1, background: "var(--c-border)", margin: "12px 0" }} />

          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Sources environnementales externes</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={climatMode} onChange={() => { setClimatMode(!climatMode); setCoordMode(false); setClickedCoord(null); }} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconCloudRain size={14} color="var(--c-sky)" />
            <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>Climat (Open-Meteo)</span>
            {climatLoading && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--c-text-muted)" }}>…</span>}
          </label>
          {climatMode && (
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", padding: "2px 4px 6px", lineHeight: 1.5 }}>
              Touche n'importe où sur la carte pour voir la météo actuelle à cet endroit.
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={coucheOccupationSol} onChange={() => setCoucheOccupationSol(v => !v)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconGlobe size={14} color="var(--c-accent)" />
            <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>Occupation des sols (Esri)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={coucheHydrologie} onChange={() => setCoucheHydrologie(v => !v)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconWaves size={14} color="var(--c-sky)" />
            <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>Hydrologie (Esri)</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", opacity: 0.5 }}>
            <IconLayers size={14} color="var(--c-text-muted)" />
            <span style={{ fontSize: 12.5, color: "var(--c-text-muted)" }}>Imagerie satellite</span>
            <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 700, color: "var(--c-accent-dark)" }}>via le bouton dédié ↗</span>
          </div>
          {EXTERNAL_LAYERS_NON_CONNECTEES.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", opacity: 0.45 }}>
              <l.icon size={14} color="var(--c-text-muted)" />
              <span style={{ fontSize: 12.5, color: "var(--c-text-muted)" }}>{l.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 700, color: "var(--c-text-faint)" }}>Non connecté</span>
            </div>
          ))}
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Ces sources ne sont pas encore branchées à une donnée réelle vérifiée — elles apparaissent pour montrer où elles s'intégreront, sans rien afficher de fictif.
          </div>
        </div>
      )}

      {showFilters && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>{t(lang, "filtres_titre")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">{t(lang, "toutes_categories")}</option>
              {[...CATEGORIES, ...Object.keys(ENV_PROBLEMES_INDEX).filter(code => !CATEGORIES.some(c => c.id === code)).map(code => ({ id: code }))].map(c => <option key={c.id} value={c.id}>{categorieLabel(lang, c.id)}</option>)}
            </select>
            <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">{t(lang, "tous_statuts")}</option>
              <option value="resolu">{t(lang, "resolu")}</option>
              <option value="en_cours">{t(lang, "statut_en_cours")}</option>
              <option value="en_attente">{t(lang, "en_attente")}</option>
            </select>
            <div>
              <label style={{ fontSize: 11, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>{t(lang, "depuis_le")}</label>
              <input type="date" value={filtreDepuis} onChange={e => setFiltreDepuis(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }} />
            </div>
            {layersOn.enquetes && <select value={filtreGraviteEnquete} onChange={e => setFiltreGraviteEnquete(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">Enquêtes — toutes gravités</option>
              {ENQ_NIVEAUX.filter(n => n[0] !== "a_determiner").map(([v, l]) => <option key={v} value={v}>Enquêtes — {l}</option>)}
            </select>}
            {filtresActifs && (
              <button onClick={resetFiltres} style={{ padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t(lang, "reinitialiser_filtres")}</button>
            )}
          </div>
        </div>
      )}

      <div style={fullscreen
        ? { position: "fixed", inset: 0, zIndex: 9999, background: "#000" }
        : { position: "relative" }}>
        <div ref={mapElRef} style={fullscreen
          ? { width: "100vw", height: "100vh" }
          : { width: "100%", height: 360, borderRadius: 16, overflow: "hidden", border: "1px solid var(--c-border)" }} />

        <button onClick={() => setFullscreen(!fullscreen)} aria-label={fullscreen ? t(lang, "quitter_plein_ecran") : t(lang, "plein_ecran")} style={{
          position: "absolute", top: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10,
          background: "var(--c-surface)", border: "none", borderRadius: fullscreen ? "50%" : 10,
          width: fullscreen ? 42 : 40, height: fullscreen ? 42 : 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)", cursor: "pointer", zIndex: 10000 }}>
          {fullscreen ? <IconMinimize size={18} color="var(--c-accent-dark)" /> : <IconMaximize size={16} color="var(--c-accent-dark)" />}
        </button>

        <button onClick={() => setSatellite(!satellite)} aria-label={t(lang, "vue_satellite")} aria-pressed={satellite} style={{
          position: "absolute", top: fullscreen ? 66 : 56, right: fullscreen ? 16 : 10,
          background: satellite ? "var(--c-accent-dark)" : "var(--c-surface)", border: "none", borderRadius: fullscreen ? "50%" : 10,
          width: fullscreen ? 42 : 40, height: fullscreen ? 42 : 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)", cursor: "pointer", zIndex: 10000 }} title={t(lang, "vue_satellite")}>
          <IconLayers size={fullscreen ? 18 : 16} color={satellite ? "#fff" : "var(--c-accent-dark)"} />
        </button>

        {satellite && (
          <div style={{
            position: "absolute", bottom: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10,
            background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 10px",
            fontSize: 10.5, fontWeight: 600, zIndex: 10000, display: "flex", alignItems: "center", gap: 5, maxWidth: "70%" }}>
            <IconClock size={11} />
            {dateImagerie === undefined ? "Recherche de la date de l'imagerie…"
              : dateImagerie === null ? "Date de l'imagerie inconnue pour cette zone"
              : `Imagerie satellite datée du ${dateImagerie}`}
          </div>
        )}

        <button onClick={() => locateMe()} aria-label={t(lang, "me_geolocaliser")} disabled={locating} style={{
          position: "absolute", top: fullscreen ? 116 : 102, right: fullscreen ? 16 : 10,
          background: "var(--c-surface)", border: "none", borderRadius: fullscreen ? "50%" : 10,
          width: fullscreen ? 42 : 40, height: fullscreen ? 42 : 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)", cursor: locating ? "default" : "pointer", zIndex: 10000, opacity: locating ? 0.6 : 1 }} title={t(lang, "me_geolocaliser")}>
          <IconTarget size={fullscreen ? 18 : 16} color="var(--c-accent-dark)" />
        </button>

        <button onClick={() => setShowGps(!showGps)} aria-label={t(lang, "gps_detaille")} aria-pressed={showGps} style={{
          position: "absolute", top: fullscreen ? 166 : 148, right: fullscreen ? 16 : 10,
          background: showGps ? "var(--c-accent-dark)" : "var(--c-surface)", border: "none", borderRadius: fullscreen ? "50%" : 10,
          width: fullscreen ? 42 : 40, height: fullscreen ? 42 : 40, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)", cursor: "pointer", zIndex: 10000 }} title={t(lang, "gps_detaille")}>
          <IconGauge size={fullscreen ? 18 : 16} color={showGps ? "#fff" : "var(--c-accent-dark)"} />
        </button>

        {showGps && (
          <div style={{ position: "absolute", top: fullscreen ? 18 : 10, right: fullscreen ? 66 : 56, background: "var(--c-surface)", borderRadius: 12, padding: "10px 12px", fontSize: 11.5, color: "var(--c-text)", boxShadow: "0 2px 10px rgba(0,0,0,0.25)", zIndex: 10000, minWidth: 180 }}>
            {!gpsData ? (
              <div style={{ color: "var(--c-text-muted)" }}>{t(lang, "gps_recherche_signal")}</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: gpsQualite(gpsData.accuracy).couleur, display: "inline-block" }} />
                  <b>{t(lang, "gps_precision_label")} {gpsQualite(gpsData.accuracy).label.toLowerCase()}</b>
                </div>
                <div>Coordonnées : {formatCoordonnees(gpsData.lat, gpsData.lng, coordFormat)}</div>
                <div>{t(lang, "gps_precision_label")} : ±{gpsData.accuracy != null ? Math.round(gpsData.accuracy) : "?"} m</div>
                <div>{t(lang, "gps_altitude_label")} : {gpsData.altitude != null ? Math.round(gpsData.altitude) + " m" : "—"}</div>
                <div>{t(lang, "gps_vitesse_label")} : {formatVitesse(gpsData.speed)}</div>
                <div>{t(lang, "gps_cap_label")} : {formatCap(gpsData.heading)}</div>
                <div style={{ marginTop: 4, color: "var(--c-text-muted)", fontSize: 10.5 }}>{new Date(gpsData.timestamp).toLocaleTimeString("fr-FR")}</div>
              </>
            )}
          </div>
        )}

        {compareActif && (
          <>
            <div
              onPointerDown={(e) => {
                compareDraggingRef.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                if (!mapElRef.current) return;
                const rect = mapElRef.current.getBoundingClientRect();
                const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                setCompareSwipePos(pct);
              }}
              onPointerUp={() => { compareDraggingRef.current = false; }}
              onPointerCancel={() => { compareDraggingRef.current = false; }}
              onPointerMove={(e) => {
                if (!compareDraggingRef.current || !mapElRef.current) return;
                const rect = mapElRef.current.getBoundingClientRect();
                const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                setCompareSwipePos(pct);
              }}
              style={{ position: "absolute", inset: 0, zIndex: 9000, cursor: "ew-resize", touchAction: "none" }}
              title="Glissez n'importe où sur l'image pour comparer"
            />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${compareSwipePos}% - 1.5px)`, width: 3, background: "#fff", boxShadow: "0 0 5px rgba(0,0,0,0.6)", zIndex: 9001, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: `${compareSwipePos}%`, transform: "translate(-50%, -50%)", width: 34, height: 34, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9001, pointerEvents: "none" }}>
              <IconTrendingUp size={15} color="var(--c-accent-dark)" />
            </div>
            <div style={{ position: "absolute", top: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 9px", fontSize: 10.5, fontWeight: 600, zIndex: 10000 }}>
              {compareAnnee1}
            </div>
            <div style={{ position: "absolute", top: fullscreen ? 16 : 10, right: fullscreen ? 66 : 56, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 9px", fontSize: 10.5, fontWeight: 600, zIndex: 10000 }}>
              {compareAnnee2}
            </div>
            <div style={{ position: "absolute", bottom: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: (compareErreurAvant || compareErreurApres || compareVerif === "identiques" || compareVerif === "erreur") ? "#B5451B" : compareVerif === "distinctes" ? "rgba(22,101,52,0.85)" : "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 9.5, fontWeight: 600, zIndex: 10000, textAlign: "center" }}>
              {compareErreurAvant && compareErreurApres
                ? `Aucune des deux mosaïques (${compareAnnee1} et ${compareAnnee2}) n'a pu être chargée — vérifiez la connexion ou essayez d'autres années.`
                : compareErreurAvant
                ? `La mosaïque ${compareAnnee1} (avant) n'a pas pu être chargée pour cette zone — essayez une autre année.`
                : compareErreurApres
                ? `La mosaïque ${compareAnnee2} (après) n'a pas pu être chargée pour cette zone — essayez une autre année.`
                : compareVerif === "verification"
                ? "Vérification en cours des images réellement reçues pour cette zone…"
                : compareVerif === "identiques"
                ? `Vérifié (comparaison octet par octet) : ${compareAnnee1} et ${compareAnnee2} renvoient exactement la même image ici — aucune différence disponible à cet endroit/zoom, essayez une autre zone ou une autre paire d'années.`
                : compareVerif === "erreur"
                ? "Vérification impossible (problème réseau) — la comparaison affichée n'est pas garantie fiable ici."
                : compareVerif === "distinctes"
                ? `Vérifié : ${compareAnnee1} et ${compareAnnee2} sont bien des images distinctes ici. Glissez pour comparer.`
                : `Sentinel-2 cloudless (EOX/Copernicus) — glissez pour comparer ${compareAnnee1} et ${compareAnnee2}`}
            </div>
            {mapRef.current && mapRef.current.getZoom() > SENTINEL2_ZOOM_NATIF_MAX && (
              <div style={{ position: "absolute", bottom: fullscreen ? 46 : 40, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 9, zIndex: 10000, textAlign: "center" }}>
                Zoom au-delà de la résolution native Sentinel-2 (~10 m/pixel, zoom ≈{SENTINEL2_ZOOM_NATIF_MAX}) : l'image est interpolée pour les deux dates, ce qui peut donner une impression de flou indépendante d'un vrai changement.
              </div>
            )}
          </>
        )}

        {locating && (
          <div style={{ position: "absolute", top: fullscreen ? 18 : 10, left: fullscreen ? 16 : 10, background: "var(--c-surface)", borderRadius: 20, padding: "5px 12px", fontSize: 11.5, color: "var(--c-text-secondary)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10000 }}>
            {t(lang, "geoloc_en_cours")}
          </div>
        )}

        {locateError && !locating && (
          <div style={{ position: "absolute", bottom: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: "#B5451B", color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 11.5, boxShadow: "0 2px 8px rgba(0,0,0,0.25)", zIndex: 10000, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1 }}>{locateError}</span>
            <button onClick={() => setLocateError("")} style={{ background: "none", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
          </div>
        )}

        {aucuneCoucheActive && !locating && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--c-surface)", borderRadius: 14, padding: "12px 16px", fontSize: 12, color: "var(--c-text-secondary)", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", zIndex: 9998, textAlign: "center", maxWidth: 220 }}>
            {t(lang, "aucune_couche_active")}
          </div>
        )}

        {selected && fullscreen && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--c-surface)", borderRadius: "16px 16px 0 0", padding: 16, maxHeight: "42%", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,0.25)", zIndex: 10000 }}>
            <DetailCard s={selected} />
          </div>
        )}
      </div>

      {!fullscreen && (
        <>
          <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11.5, color: "var(--c-text-secondary)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50% 50% 50% 0", background: "#B5451B", transform: "rotate(-45deg)", display: "inline-block" }}></span> {t(lang, "type_signalement")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IconTree size={13} color="var(--c-accent)" /> {t(lang, "legend_arbre_plante")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IconSprout size={13} color="var(--c-sky)" /> {t(lang, "layer_biodiversite")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--c-sky)", display: "inline-block" }}></span> {t(lang, "legend_toi")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IconMapPin size={13} color="var(--c-warning)" /> {t(lang, "type_zone")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 14, height: 2, background: "var(--c-sky)", display: "inline-block" }}></span> {t(lang, "parcours_btn")}</div>
            {["benevole", "ong", "administration"].map(o => (
              <div key={o} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50% 50% 50% 0", background: "#fff", border: `2px solid ${ORIGINE_COULEURS[o]}`, transform: "rotate(-45deg)", display: "inline-block" }}></span> {ORIGINE_LABELS[o]}
              </div>
            ))}
          </div>

          <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-accent-dark)", marginTop: 18, marginBottom: 10 }}>{t(lang, "tableau_bord_zone")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
            <StatCard label={t(lang, "stat_donnees_affichees")} value={totalVisible} unit="" accent="var(--c-accent-dark)" />
            <StatCard label={t(lang, "layer_arbres")} value={visibleCount.arbres} unit="" accent="var(--c-accent)" />
            <StatCard label={t(lang, "stat_signalements")} value={visibleCount.dechets + visibleCount.pollution + visibleCount.signalements} unit="" accent="#B5451B" />
            <StatCard label={t(lang, "layer_biodiversite")} value={visibleCount.biodiversite} unit="" accent="var(--c-sky)" />
          </div>
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            {t(lang, "note_reboisement")}
          </div>

          {selected && (
            <div style={{ marginTop: 14, background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)" }}>
              <DetailCard s={selected} />
            </div>
          )}
        </>
      )}
    </Screen>
  );
}

const ETAT_SUIVI = { vivant: { label: "En bonne santé", color: "var(--c-accent)" }, stresse: { label: "En difficulté", color: "var(--c-warning)" }, mort: { label: "Mort", color: "#B5451B" } };

function MonArbre({ arbres, suivis, onAdd, onAddSuivi, lang, coordFormat }) {
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [photo, setPhoto] = useState(null);
  const [suiviOuvert, setSuiviOuvert] = useState(null);
  const [gpsFix, setGpsFix] = useState(null);
  const [erreur, setErreur] = useState("");

  // Surface à reboiser : même exigence que dans l'Espace Organisation — le citoyen doit
  // d'abord définir la surface qu'il compte reboiser (contour + superficie déclarée) avant
  // de pouvoir enregistrer un arbre. Persistée localement par appareil (DEVICE_ID), comme
  // pour les organisations (persistée par organisation).
  const [zoneReboisement, setZoneReboisement] = useState(undefined); // undefined = pas encore chargée
  const [showEditeurZone, setShowEditeurZone] = useState(false);
  const [pointsZoneTemp, setPointsZoneTemp] = useState([]);
  const [latPointTemp, setLatPointTemp] = useState("");
  const [lngPointTemp, setLngPointTemp] = useState("");
  const [gpsPointTemp, setGpsPointTemp] = useState(null);
  const [erreurZone, setErreurZone] = useState("");
  const [superficieSaisie, setSuperficieSaisie] = useState("");
  const [uniteSuperficieSaisie, setUniteSuperficieSaisie] = useState("m2");

  function clefZoneReboisementCitoyen() { return `pace-citoyen-zone-reboisement-${DEVICE_ID}`; }
  useEffect(() => {
    try {
      const brut = localStorage.getItem(clefZoneReboisementCitoyen());
      setZoneReboisement(brut ? JSON.parse(brut) : null);
    } catch (e) { setZoneReboisement(null); }
  }, []);
  function superficieDesPoints(points) {
    if (points.length < 3) return 0;
    try { return L.GeometryUtil.geodesicArea(points); } catch (e) { return 0; }
  }
  const superficieTempM2 = useMemo(() => superficieDesPoints(pointsZoneTemp), [pointsZoneTemp]);
  function formatSuperficie(m2) {
    return m2 >= 10000 ? `${(m2 / 10000).toFixed(2)} ha` : `${Math.round(m2)} m²`;
  }
  function ajouterPointManuel() {
    setErreurZone("");
    const lat = Number(latPointTemp), lng = Number(lngPointTemp);
    if (!latPointTemp.trim() || !lngPointTemp.trim() || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErreurZone("Coordonnées invalides."); return;
    }
    setPointsZoneTemp(prev => [...prev, { lat, lng }]);
    setLatPointTemp(""); setLngPointTemp("");
  }
  function ajouterPointDepuisGps() {
    if (!gpsPointTemp) { setErreurZone("En attente d'un signal GPS."); return; }
    setErreurZone("");
    setPointsZoneTemp(prev => [...prev, { lat: gpsPointTemp.lat, lng: gpsPointTemp.lng }]);
  }
  function retirerPoint(index) {
    setPointsZoneTemp(prev => prev.filter((_, i) => i !== index));
  }
  function superficieSaisieEnM2() {
    const val = Number(String(superficieSaisie).replace(",", "."));
    if (!superficieSaisie.trim() || Number.isNaN(val) || val <= 0) return null;
    return uniteSuperficieSaisie === "ha" ? val * 10000 : val;
  }
  function ouvrirEditeurZone() {
    setPointsZoneTemp(zoneReboisement ? zoneReboisement.points : []);
    setErreurZone("");
    if (zoneReboisement && zoneReboisement.superficie_m2) {
      const unite = zoneReboisement.unite_saisie || "m2";
      const valeur = unite === "ha" ? zoneReboisement.superficie_m2 / 10000 : zoneReboisement.superficie_m2;
      setUniteSuperficieSaisie(unite);
      setSuperficieSaisie(String(Number(valeur.toFixed(2))));
    } else {
      setUniteSuperficieSaisie("m2");
      setSuperficieSaisie("");
    }
    setShowEditeurZone(true);
  }
  function enregistrerZoneReboisement() {
    setErreurZone("");
    if (pointsZoneTemp.length < 4) { setErreurZone("Il faut au moins 4 points pour délimiter une surface."); return; }
    const superficieM2 = superficieSaisieEnM2();
    if (superficieM2 === null) { setErreurZone("Merci de renseigner la superficie à reboiser (m² ou ha)."); return; }
    const zone = { points: pointsZoneTemp, superficie_m2: superficieM2, superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie, defini_par: DEVICE_ID, date: new Date().toISOString() };
    try { localStorage.setItem(clefZoneReboisementCitoyen(), JSON.stringify(zone)); } catch (e) {}
    setZoneReboisement(zone);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_definie", "citoyen", DEVICE_ID, `${pointsZoneTemp.length} points, ${formatSuperficie(superficieM2)}`);
  }
  function supprimerZoneReboisementCitoyen() {
    if (!confirm("Supprimer définitivement la surface à reboiser ? Elle ne réapparaîtra pas tant que tu ne la redéfiniras pas, et il faudra la redéfinir avant de pouvoir planter de nouveaux arbres.")) return;
    try { localStorage.removeItem(clefZoneReboisementCitoyen()); } catch (e) {}
    setZoneReboisement(null);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_supprimee", "citoyen", DEVICE_ID, "");
  }

  function submit() {
    if (!nom.trim()) {
      setErreur("Merci d'indiquer l'espèce de l'arbre avant d'enregistrer.");
      return;
    }
    if (!gpsFix || gpsFix.lat == null || gpsFix.lng == null) {
      setErreur("Position GPS requise — attends que le signal soit trouvé avant d'enregistrer.");
      return;
    }
    setErreur("");
    onAdd({ nom, photo, lat: gpsFix.lat, lng: gpsFix.lng });
    setNom(""); setPhoto(null); setShowForm(false); setGpsFix(null); setErreur("");
  }

  function growth(a) {
    const days = (Date.now() - a.plantedAt) / 86400000;
    return Math.min(100, Math.round((days / 180) * 100));
  }

  function dernierSuivi(arbreId) {
    return (suivis || []).filter(s => s.arbre_id === arbreId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
  }

  function joursDepuis(dateStr) {
    return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }

  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_arbre")}>{t(lang, "title_arbre")}</SectionTitle>

      {/* Étape préalable obligatoire : la surface à reboiser doit être définie (au moins 4 points
          de coordonnées formant un polygone) avant de pouvoir enregistrer des arbres — même
          exigence que dans l'Espace Organisation. */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconLayers size={15} color="var(--c-accent-dark)" />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Surface à reboiser</div>
        </div>

        {zoneReboisement === undefined ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : !showEditeurZone && zoneReboisement ? (
          <div>
            <div style={{ fontSize: 12.5, marginBottom: 4 }}>
              Superficie déclarée : <b>{formatSuperficie(zoneReboisement.superficie_m2)}</b> ({zoneReboisement.points.length} points)
            </div>
            {typeof zoneReboisement.superficie_estimee_m2 === "number" && (
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 2 }}>
                Estimation d'après le contour : {formatSuperficie(zoneReboisement.superficie_estimee_m2)}
              </div>
            )}
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10 }}>
              Définie le {new Date(zoneReboisement.date).toLocaleDateString("fr-FR")}
            </div>
            <ZoneReboisementMap points={zoneReboisement.points} superficieAffichee={formatSuperficie(zoneReboisement.superficie_m2)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={ouvrirEditeurZone} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                Redéfinir la surface
              </button>
              <button onClick={supprimerZoneReboisementCitoyen} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        ) : !showEditeurZone && !zoneReboisement ? (
          <div>
            <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Avant d'enregistrer des arbres, définissez la surface à reboiser en plaçant au moins 4 points de coordonnées délimitant son contour, puis renseignez la superficie réelle du terrain (m² ou ha).
            </div>
            <button onClick={ouvrirEditeurZone} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              <IconPlus size={15} /> Définir la surface à reboiser
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Ajoutez au moins 4 points de coordonnées pour délimiter le contour de la surface.
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={latPointTemp} onChange={e => setLatPointTemp(e.target.value)} placeholder="Latitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <input value={lngPointTemp} onChange={e => setLngPointTemp(e.target.value)} placeholder="Longitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <button onClick={ajouterPointManuel} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                Ajouter
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsPointTemp} compact />
              <button onClick={ajouterPointDepuisGps} disabled={!gpsPointTemp} style={{ marginTop: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: gpsPointTemp ? "var(--c-text)" : "var(--c-text-faint)", fontWeight: 600, fontSize: 11.5, cursor: gpsPointTemp ? "pointer" : "default" }}>
                Ajouter ma position actuelle comme point
              </button>
            </div>

            {erreurZone && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreurZone}</div>}

            {pointsZoneTemp.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {pointsZoneTemp.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg)", borderRadius: 8, padding: "6px 10px", fontSize: 11.5 }}>
                    <span>Point {i + 1} — {formatCoordonnees(p.lat, p.lng, coordFormat)}</span>
                    <button onClick={() => retirerPoint(i)} aria-label="Retirer" style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 2 }}><IconTrash size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            {pointsZoneTemp.length >= 3 && (
              <ZoneReboisementMap
                points={pointsZoneTemp}
                superficieAffichee={formatSuperficie(superficieSaisieEnM2() ?? superficieTempM2)}
              />
            )}

            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 8 }}>
              Estimation d'après le contour {pointsZoneTemp.length < 4 ? "(ajoutez au moins 4 points)" : ""} : {formatSuperficie(superficieTempM2)}
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              Superficie à reboiser (obligatoire)
            </div>
            <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
              Renseignez la superficie réelle du terrain (ex. relevé topographique ou titre foncier) ; l'estimation ci-dessus n'est qu'indicative.
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={superficieSaisie} onChange={e => setSuperficieSaisie(e.target.value)} placeholder="Superficie" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <select value={uniteSuperficieSaisie} onChange={e => setUniteSuperficieSaisie(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-surface)", color: "var(--c-text)" }}>
                <option value="m2">m²</option>
                <option value="ha">ha</option>
              </select>
            </div>

            <button onClick={enregistrerZoneReboisement} disabled={pointsZoneTemp.length < 4 || !superficieSaisie.trim()} style={{
              padding: "9px 14px", borderRadius: 10, border: "none",
              background: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
              cursor: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "default" : "pointer", marginRight: 8 }}>
              Enregistrer la surface
            </button>
            <button onClick={() => setShowEditeurZone(false)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {!showForm && zoneReboisement && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> {t(lang, "btn_planter")}
        </button>
      )}
      {showForm && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label="Photo de l'arbre" previewMaxHeight={130} />
          <input value={nom} onChange={e => { setNom(e.target.value); if (erreur) setErreur(""); }} placeholder="Espèce (ex : Manguier, Teck...)" style={{ width: "100%", padding: 10, borderRadius: 10, border: erreur ? "1px solid var(--c-danger)" : "1px solid var(--c-border)", fontSize: 13, marginBottom: erreur ? 4 : 10, boxSizing: "border-box" }} />
          {erreur && <div style={{ color: "var(--c-danger)", fontSize: 11.5, marginBottom: 10 }}>{erreur}</div>}
          <LocationPrecision coordFormat={coordFormat} onUpdate={(fix) => { setGpsFix(fix); if (erreur) setErreur(""); }} compact />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowForm(false); setErreur(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Enregistrer</button>
          </div>
        </div>
      )}
      {arbres.length === 0 && !showForm && (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13.5, background: "var(--c-surface)", padding: 16, borderRadius: 12, border: "1px dashed var(--c-border-soft)", textAlign: "center" }}>
          <IconSprout size={22} /><div style={{marginTop: 6}}>Aucun arbre enregistré pour le moment.</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...arbres].reverse().map(a => {
          const ds = dernierSuivi(a.id);
          const refDate = ds ? ds.created_at : a.plantedAt;
          const jours = joursDepuis(refDate);
          const rappel = jours >= 90;
          const etatInfo = ds ? ETAT_SUIVI[ds.etat] || ETAT_SUIVI.vivant : null;
          return (
          <div key={a.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                {a.photo_url ? (
                  <MediaThumbSmall src={a.photo_url} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--c-bg)" }} />
                ) : (
                  <>
                    <TreeRing pct={growth(a)} />
                    <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}><IconTree size={18} color="var(--c-accent)" /></span>
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--c-text)" }}>{a.nom}</div>
                <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Planté le {a.date}</div>
                {etatInfo && <div style={{ fontSize: 10.5, fontWeight: 600, color: etatInfo.color, marginTop: 2 }}>{etatInfo.label} · suivi il y a {jours} j</div>}
              </div>
              <button onClick={() => shareContent("Mon arbre sur EcoVigil", `Je viens d'enregistrer un ${a.nom} sur EcoVigil 🌱 Ensemble pour un avenir durable.`)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)", padding: 6 }}><IconShare size={16} /></button>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "var(--c-accent)", fontWeight: 600 }}>{growth(a)}%</div>
            </div>

            {rappel && suiviOuvert !== a.id && (
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: "var(--c-warning)", background: "var(--c-warning-bg)", borderRadius: 8, padding: "6px 8px" }}>
                🔔 Suivi recommandé — dernière preuve de croissance il y a {jours} jours
              </div>
            )}

            {suiviOuvert === a.id ? (
              <SuiviForm arbre={a} onCancel={() => setSuiviOuvert(null)} onSave={async (payload) => { await onAddSuivi(a.id, payload); setSuiviOuvert(null); }} />
            ) : (
              <button onClick={() => setSuiviOuvert(a.id)} style={{ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 8, border: "1px dashed var(--c-text-faint)", background: "var(--c-surface-dashed)", color: "var(--c-text-secondary)", fontSize: 12, cursor: "pointer" }}>
                + Ajouter une preuve de suivi (photo récente)
              </button>
            )}
          </div>
          );
        })}
      </div>
    </Screen>
  );
}

function SuiviForm({ onSave, onCancel }) {
  const [photo, setPhoto] = useState(null);
  const [etat, setEtat] = useState("vivant");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border-soft)" }}>
      <PhotoCaptureButton photo={photo} onChange={setPhoto} label="Photo de suivi" previewMaxHeight={120} compact />
      <select value={etat} onChange={e => setEtat(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 8, boxSizing: "border-box" }}>
        {Object.entries(ETAT_SUIVI).map(([id, v]) => <option key={id} value={id}>{v.label}</option>)}
      </select>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optionnel)" style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 8, boxSizing: "border-box" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5 }}>Annuler</button>
        <button disabled={busy} onClick={async () => { setBusy(true); await onSave({ photo, etat, note }); setBusy(false); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12.5 }}>
          {busy ? "Envoi…" : "Enregistrer le suivi"}
        </button>
      </div>
    </div>
  );
}

const PAYS_INDICATIFS = [
  // Afrique
  { region: "Afrique", pays: "Afrique du Sud", indicatif: "+27" },
  { region: "Afrique", pays: "Algérie", indicatif: "+213" },
  { region: "Afrique", pays: "Angola", indicatif: "+244" },
  { region: "Afrique", pays: "Bénin", indicatif: "+229" },
  { region: "Afrique", pays: "Botswana", indicatif: "+267" },
  { region: "Afrique", pays: "Burkina Faso", indicatif: "+226" },
  { region: "Afrique", pays: "Burundi", indicatif: "+257" },
  { region: "Afrique", pays: "Cameroun", indicatif: "+237" },
  { region: "Afrique", pays: "Cap-Vert", indicatif: "+238" },
  { region: "Afrique", pays: "Comores", indicatif: "+269" },
  { region: "Afrique", pays: "Congo-Brazzaville", indicatif: "+242" },
  { region: "Afrique", pays: "Côte d'Ivoire", indicatif: "+225" },
  { region: "Afrique", pays: "Djibouti", indicatif: "+253" },
  { region: "Afrique", pays: "Égypte", indicatif: "+20" },
  { region: "Afrique", pays: "Érythrée", indicatif: "+291" },
  { region: "Afrique", pays: "Eswatini", indicatif: "+268" },
  { region: "Afrique", pays: "Éthiopie", indicatif: "+251" },
  { region: "Afrique", pays: "Gabon", indicatif: "+241" },
  { region: "Afrique", pays: "Gambie", indicatif: "+220" },
  { region: "Afrique", pays: "Ghana", indicatif: "+233" },
  { region: "Afrique", pays: "Guinée", indicatif: "+224" },
  { region: "Afrique", pays: "Guinée-Bissau", indicatif: "+245" },
  { region: "Afrique", pays: "Guinée équatoriale", indicatif: "+240" },
  { region: "Afrique", pays: "Kenya", indicatif: "+254" },
  { region: "Afrique", pays: "Lesotho", indicatif: "+266" },
  { region: "Afrique", pays: "Liberia", indicatif: "+231" },
  { region: "Afrique", pays: "Libye", indicatif: "+218" },
  { region: "Afrique", pays: "Madagascar", indicatif: "+261" },
  { region: "Afrique", pays: "Malawi", indicatif: "+265" },
  { region: "Afrique", pays: "Mali", indicatif: "+223" },
  { region: "Afrique", pays: "Maroc", indicatif: "+212" },
  { region: "Afrique", pays: "Maurice", indicatif: "+230" },
  { region: "Afrique", pays: "Mauritanie", indicatif: "+222" },
  { region: "Afrique", pays: "Mozambique", indicatif: "+258" },
  { region: "Afrique", pays: "Namibie", indicatif: "+264" },
  { region: "Afrique", pays: "Niger", indicatif: "+227" },
  { region: "Afrique", pays: "Nigeria", indicatif: "+234" },
  { region: "Afrique", pays: "Ouganda", indicatif: "+256" },
  { region: "Afrique", pays: "République centrafricaine", indicatif: "+236" },
  { region: "Afrique", pays: "République démocratique du Congo", indicatif: "+243" },
  { region: "Afrique", pays: "Rwanda", indicatif: "+250" },
  { region: "Afrique", pays: "Sao Tomé-et-Principe", indicatif: "+239" },
  { region: "Afrique", pays: "Sénégal", indicatif: "+221" },
  { region: "Afrique", pays: "Seychelles", indicatif: "+248" },
  { region: "Afrique", pays: "Sierra Leone", indicatif: "+232" },
  { region: "Afrique", pays: "Somalie", indicatif: "+252" },
  { region: "Afrique", pays: "Soudan", indicatif: "+249" },
  { region: "Afrique", pays: "Soudan du Sud", indicatif: "+211" },
  { region: "Afrique", pays: "Tanzanie", indicatif: "+255" },
  { region: "Afrique", pays: "Tchad", indicatif: "+235" },
  { region: "Afrique", pays: "Togo", indicatif: "+228" },
  { region: "Afrique", pays: "Tunisie", indicatif: "+216" },
  { region: "Afrique", pays: "Zambie", indicatif: "+260" },
  { region: "Afrique", pays: "Zimbabwe", indicatif: "+263" },
  // Europe
  { region: "Europe", pays: "Allemagne", indicatif: "+49" },
  { region: "Europe", pays: "Autriche", indicatif: "+43" },
  { region: "Europe", pays: "Belgique", indicatif: "+32" },
  { region: "Europe", pays: "Danemark", indicatif: "+45" },
  { region: "Europe", pays: "Espagne", indicatif: "+34" },
  { region: "Europe", pays: "Finlande", indicatif: "+358" },
  { region: "Europe", pays: "France", indicatif: "+33" },
  { region: "Europe", pays: "Grèce", indicatif: "+30" },
  { region: "Europe", pays: "Irlande", indicatif: "+353" },
  { region: "Europe", pays: "Italie", indicatif: "+39" },
  { region: "Europe", pays: "Luxembourg", indicatif: "+352" },
  { region: "Europe", pays: "Norvège", indicatif: "+47" },
  { region: "Europe", pays: "Pays-Bas", indicatif: "+31" },
  { region: "Europe", pays: "Pologne", indicatif: "+48" },
  { region: "Europe", pays: "Portugal", indicatif: "+351" },
  { region: "Europe", pays: "Roumanie", indicatif: "+40" },
  { region: "Europe", pays: "Royaume-Uni", indicatif: "+44" },
  { region: "Europe", pays: "Russie", indicatif: "+7" },
  { region: "Europe", pays: "Suède", indicatif: "+46" },
  { region: "Europe", pays: "Suisse", indicatif: "+41" },
  { region: "Europe", pays: "Turquie", indicatif: "+90" },
  { region: "Europe", pays: "Ukraine", indicatif: "+380" },
  // Amérique du Nord
  { region: "Amérique du Nord", pays: "Canada", indicatif: "+1" },
  { region: "Amérique du Nord", pays: "États-Unis", indicatif: "+1" },
  { region: "Amérique du Nord", pays: "Mexique", indicatif: "+52" },
  // Amérique centrale et Caraïbes
  { region: "Amérique centrale et Caraïbes", pays: "Cuba", indicatif: "+53" },
  { region: "Amérique centrale et Caraïbes", pays: "Guatemala", indicatif: "+502" },
  { region: "Amérique centrale et Caraïbes", pays: "Haïti", indicatif: "+509" },
  { region: "Amérique centrale et Caraïbes", pays: "Jamaïque", indicatif: "+1" },
  { region: "Amérique centrale et Caraïbes", pays: "Panama", indicatif: "+507" },
  { region: "Amérique centrale et Caraïbes", pays: "République dominicaine", indicatif: "+1" },
  // Amérique du Sud
  { region: "Amérique du Sud", pays: "Argentine", indicatif: "+54" },
  { region: "Amérique du Sud", pays: "Bolivie", indicatif: "+591" },
  { region: "Amérique du Sud", pays: "Brésil", indicatif: "+55" },
  { region: "Amérique du Sud", pays: "Chili", indicatif: "+56" },
  { region: "Amérique du Sud", pays: "Colombie", indicatif: "+57" },
  { region: "Amérique du Sud", pays: "Équateur", indicatif: "+593" },
  { region: "Amérique du Sud", pays: "Paraguay", indicatif: "+595" },
  { region: "Amérique du Sud", pays: "Pérou", indicatif: "+51" },
  { region: "Amérique du Sud", pays: "Uruguay", indicatif: "+598" },
  { region: "Amérique du Sud", pays: "Venezuela", indicatif: "+58" },
  // Moyen-Orient
  { region: "Moyen-Orient", pays: "Arabie saoudite", indicatif: "+966" },
  { region: "Moyen-Orient", pays: "Bahreïn", indicatif: "+973" },
  { region: "Moyen-Orient", pays: "Émirats arabes unis", indicatif: "+971" },
  { region: "Moyen-Orient", pays: "Irak", indicatif: "+964" },
  { region: "Moyen-Orient", pays: "Iran", indicatif: "+98" },
  { region: "Moyen-Orient", pays: "Israël", indicatif: "+972" },
  { region: "Moyen-Orient", pays: "Jordanie", indicatif: "+962" },
  { region: "Moyen-Orient", pays: "Koweït", indicatif: "+965" },
  { region: "Moyen-Orient", pays: "Liban", indicatif: "+961" },
  { region: "Moyen-Orient", pays: "Oman", indicatif: "+968" },
  { region: "Moyen-Orient", pays: "Palestine", indicatif: "+970" },
  { region: "Moyen-Orient", pays: "Qatar", indicatif: "+974" },
  { region: "Moyen-Orient", pays: "Syrie", indicatif: "+963" },
  { region: "Moyen-Orient", pays: "Yémen", indicatif: "+967" },
  // Asie
  { region: "Asie", pays: "Bangladesh", indicatif: "+880" },
  { region: "Asie", pays: "Chine", indicatif: "+86" },
  { region: "Asie", pays: "Corée du Sud", indicatif: "+82" },
  { region: "Asie", pays: "Inde", indicatif: "+91" },
  { region: "Asie", pays: "Indonésie", indicatif: "+62" },
  { region: "Asie", pays: "Japon", indicatif: "+81" },
  { region: "Asie", pays: "Malaisie", indicatif: "+60" },
  { region: "Asie", pays: "Népal", indicatif: "+977" },
  { region: "Asie", pays: "Pakistan", indicatif: "+92" },
  { region: "Asie", pays: "Philippines", indicatif: "+63" },
  { region: "Asie", pays: "Singapour", indicatif: "+65" },
  { region: "Asie", pays: "Sri Lanka", indicatif: "+94" },
  { region: "Asie", pays: "Thaïlande", indicatif: "+66" },
  { region: "Asie", pays: "Vietnam", indicatif: "+84" },
  // Océanie
  { region: "Océanie", pays: "Australie", indicatif: "+61" },
  { region: "Océanie", pays: "Nouvelle-Zélande", indicatif: "+64" },
  // Autre
  { region: "Autre", pays: "Autre", indicatif: "" },
];

const BENEVOLE_STATUT_INFO = {
  en_attente: { label: "Inscription envoyée", texte: "Ton inscription a été reçue et est en attente de validation par l'équipe EcoVigil.", couleur: "var(--c-warning)" },
  valide: { label: "Bénévole validé", texte: "Ton inscription est validée. Tu as accès à toutes les fonctionnalités d'EcoVigil.", couleur: "var(--c-accent)" },
  suspendu: { label: "Compte suspendu", texte: "Ton statut de bénévole a été suspendu par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations.", couleur: "#B5451B" },
  rejete: { label: "Inscription refusée", texte: "Ta demande n'a pas été retenue par l'équipe EcoVigil. Contacte l'équipe si tu penses qu'il s'agit d'une erreur.", couleur: "var(--c-text-muted)" },
};

// Préalable requis avant de devenir bénévole ou de créer un compte organisation : un profil
// de base (nom, e-mail/mot de passe, pays, ville). Tant qu'aucun profil actif n'est détecté
// (profilInfo), affiche le formulaire de création/connexion à la place du contenu ; une fois
// le profil actif, affiche simplement ses enfants (children).
// Modification d'un profil déjà créé (nom, pays, ville, photo). Distinct de ProfilGate, qui
// ne gère que la création/connexion initiale.
// Onglet "Profil" dédié — inspiré des grandes plateformes (photo circulaire en tête façon
// WhatsApp, nom en évidence, liste de réglages en dessous). Tant qu'aucun profil n'est créé,
// affiche directement ProfilGate : c'est le point d'entrée pour créer son compte avant
// d'accéder au reste d'EcoVigil.
function ProfilTab({ profilInfo, onProfilChange, lang }) {
  const [showEdit, setShowEdit] = useState(false);

  if (profilInfo === undefined) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;
  }

  if (!profilInfo) {
    return (
      <div>
        <SectionTitle sub="Crée ton compte pour accéder à EcoVigil">Mon profil</SectionTitle>
        <ProfilGate profilInfo={profilInfo}><div /></ProfilGate>
      </div>
    );
  }

  if (showEdit) {
    return (
      <div>
        <SectionTitle sub="Modifie tes informations">Mon profil</SectionTitle>
        <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEdit(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEdit(false)} />
      </div>
    );
  }

  async function seDeconnecter() {
    if (!confirm("Se déconnecter de ce profil ?")) return;
    await supabase.auth.signOut();
    onProfilChange && onProfilChange();
  }

  const ligne = { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 4px", border: "none", background: "none", borderBottom: "1px solid var(--c-border)", cursor: "pointer", textAlign: "left", fontSize: 13.5 };

  return (
    <div>
      {/* En-tête façon WhatsApp : avatar circulaire, badge appareil photo, nom en évidence. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 24px" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: profilInfo.photo_url ? `url(${profilInfo.photo_url}) center/cover` : "var(--c-surface)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!profilInfo.photo_url && <IconUserCircle size={48} color="var(--c-text-faint)" />}
          </div>
          <button onClick={() => setShowEdit(true)} aria-label="Changer la photo de profil" style={{
            position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "var(--c-accent-dark)",
            border: "2px solid var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <IconCamera size={14} />
          </button>
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 700, color: "var(--c-text)" }}>{profilInfo.nom}</div>
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 2 }}>{[profilInfo.ville, profilInfo.pays].filter(Boolean).join(" · ") || profilInfo.email}</div>
      </div>

      {/* Liste de réglages, façon menu WhatsApp/Facebook. */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, border: "1px solid var(--c-border)", padding: "0 14px", marginBottom: 16 }}>
        <button onClick={() => setShowEdit(true)} style={ligne}>
          <IconEdit size={17} color="var(--c-text-secondary)" />
          <span style={{ flex: 1 }}>Modifier mes informations</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px", fontSize: 13.5, color: "var(--c-text-secondary)" }}>
          <IconMailPlus size={17} color="var(--c-text-secondary)" />
          <span style={{ flex: 1 }}>{profilInfo.email}</span>
        </div>
        <button onClick={seDeconnecter} style={{ ...ligne, borderBottom: "none", color: "#B5451B" }}>
          <IconLogOut size={17} color="#B5451B" />
          <span style={{ flex: 1 }}>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}

// Mur d'accès obligatoire, façon Facebook/WhatsApp : aucun contenu d'EcoVigil (pas même
// l'accueil) n'est accessible tant qu'un profil n'a pas été créé ou qu'on ne s'est pas
// reconnecté. Remplace tout l'habillage habituel (barre de navigation incluse).
function MurProfilObligatoire({ profilInfo, lang }) {
  return (
    <div style={{ padding: "12px 4px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--c-surface)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--c-border)" }}>
          <img src={LOGO_DATA_URL} alt={t(lang, "logo_pace_alt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19 }}>Bienvenue sur EcoVigil</div>
      </div>
      <ProfilGate profilInfo={profilInfo}><div /></ProfilGate>
    </div>
  );
}

function ProfilEditeur({ profilInfo, onSaved, onCancel }) {
  const [nom, setNom] = useState((profilInfo && profilInfo.nom) || "");
  const [pays, setPays] = useState((profilInfo && profilInfo.pays) || "");
  const [ville, setVille] = useState((profilInfo && profilInfo.ville) || "");
  const [photo, setPhoto] = useState((profilInfo && profilInfo.photo_url) || null);
  const [photoModifiee, setPhotoModifiee] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const fileRef = useRef(null);

  const champ = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };

  async function choisirPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => { setPhoto(await compressImage(reader.result, 512, 0.75)); setPhotoModifiee(true); };
    reader.readAsDataURL(f);
  }

  async function enregistrer(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    if (!nom.trim()) { setErreur("Le nom est requis."); return; }
    setBusy(true);
    // Ré-uploade seulement si la photo a changé (une chaîne data: en attente, sinon l'URL déjà
    // en ligne reste inchangée).
    const photoUrl = photoModifiee && photo ? await uploadPhotoGeneric(photo, "profils") : (photo || null);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData && sessionData.session && sessionData.session.user && sessionData.session.user.id;
    const { error } = await supabase.from("profils_comptes").update({ nom: nom.trim(), pays: pays || null, ville: ville || null, photo_url: photoUrl }).eq("id", userId);
    setBusy(false);
    if (error) { setErreur("Impossible d'enregistrer les modifications pour le moment."); return; }
    onSaved();
  }

  return (
    <div style={{ background: "var(--c-bg)", borderRadius: 12, padding: 14 }}>
      <form onSubmit={enregistrer}>
        <input ref={fileRef} type="file" accept="image/*" onChange={choisirPhoto} style={{ display: "none" }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={{
            width: 72, height: 72, borderRadius: "50%", border: "1px dashed var(--c-border)", background: photo ? `url(${photo}) center/cover` : "var(--c-surface)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, overflow: "hidden" }} aria-label="Changer la photo de profil">
            {!photo && <IconCamera size={20} color="var(--c-text-muted)" />}
          </button>
        </div>
        <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom complet" style={champ} />
        <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville (optionnel)" style={champ} />
        <select value={pays} onChange={e => setPays(e.target.value)}
          style={{ ...champ, background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
          <option value="">Pays (optionnel)</option>
          {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
            <optgroup key={region} label={region}>
              {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}</option>)}
            </optgroup>
          ))}
        </select>
        {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
        <button type="button" onClick={enregistrer} disabled={busy} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
          {busy ? "…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} style={{ width: "100%", padding: "6px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer" }}>
          Annuler
        </button>
      </form>
    </div>
  );
}

const ETAPES_PROFIL = [
  { titre: "Qui es-tu ?", icone: IconUserCircle },
  { titre: "Ton compte", icone: IconLock },
  { titre: "Dernière touche", icone: IconMapPin },
];

function ProfilGate({ profilInfo, children }) {
  const [modeProfil, setModeProfil] = useState("signup"); // signup | login
  const [etape, setEtape] = useState(0);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [photo, setPhoto] = useState(null); // dataUrl compressée, en attente d'upload
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [messageConfirmation, setMessageConfirmation] = useState(null); // { compteExistant: bool, texte } | null
  const fileRef = useRef(null);
  const nomRef = useRef(null);
  const emailRef = useRef(null);
  const emailLoginRef = useRef(null);

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const etape0Ok = nom.trim().length > 0;
  const etape1Ok = emailValide && password.length >= 6;

  // Focus automatique sur le champ principal de l'étape affichée, pour ne jamais faire chercher
  // le curseur : ça fait gagner un tap et rend l'enchaînement des étapes plus naturel.
  useEffect(() => {
    if (profilInfo || messageConfirmation) return;
    const t = setTimeout(() => {
      if (modeProfil === "login") { emailLoginRef.current && emailLoginRef.current.focus(); return; }
      if (etape === 0) nomRef.current && nomRef.current.focus();
      if (etape === 1) emailRef.current && emailRef.current.focus();
    }, 260); // laisse l'animation d'entrée se terminer avant de faire apparaître le clavier mobile
    return () => clearTimeout(t);
  }, [etape, modeProfil, profilInfo, messageConfirmation]);

  if (profilInfo === undefined) {
    return <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>;
  }
  if (profilInfo) {
    return children;
  }

  const champ = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13.5, marginBottom: 8, boxSizing: "border-box", transition: "border-color .15s ease" };
  const champErreur = { ...champ, borderColor: "#C0522A" };

  async function choisirPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => setPhoto(await compressImage(reader.result, 512, 0.75));
    reader.readAsDataURL(f);
  }

  function allerEtape(suivante) {
    setErreur("");
    setEtape(suivante);
  }

  function suivant(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (etape === 0) {
      if (!etape0Ok) { setErreur("Merci d'indiquer ton nom."); return; }
      allerEtape(1);
    } else if (etape === 1) {
      if (!emailValide) { setErreur("Cette adresse e-mail ne semble pas valide."); return; }
      if (password.length < 6) { setErreur("6 caractères minimum pour le mot de passe."); return; }
      allerEtape(2);
    }
  }

  function precedent() {
    setErreur("");
    setEtape(e => Math.max(0, e - 1));
  }

  async function creerProfil(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (etape < 2) { suivant(e); return; }
    setErreur("");
    setBusy(true);
    // La photo est envoyée dans le stockage AVANT la création du compte (l'upload ne nécessite
    // pas d'être connecté), pour que son URL puisse être incluse dans les métadonnées et reprise
    // par le déclencheur qui crée la ligne "profils_comptes" en une seule opération atomique.
    const photoUrl = photo ? await uploadPhotoGeneric(photo, "profils") : null;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: urlRedirectionAuth(), data: { type_compte: "profil", nom: nom.trim(), pays: pays || null, ville: ville || null, photo_url: photoUrl } },
    });
    setBusy(false);
    if (error) { setErreur(error.message || "Impossible de créer le profil pour le moment."); return; }
    if (!data || !data.session) {
      // GoTrue répond sans erreur même si le compte existe déjà (pour ne pas permettre de deviner
      // les e-mails inscrits) : dans ce cas "identities" est vide et AUCUN e-mail n'est envoyé.
      // Sans ce contrôle, on affichait à tort "vérifie ta boîte mail" alors que rien ne partait.
      const compteExisteDeja = data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
      setMessageConfirmation(compteExisteDeja
        ? { compteExistant: true, texte: "Un profil existe déjà avec cette adresse e-mail." }
        : { compteExistant: false, texte: "Vérifie ta boîte mail (et tes courriers indésirables) pour confirmer ton adresse, puis reviens ici." });
    }
    // Si une session est renvoyée directement, l'écran bascule seul (citoyenSession changé).
  }

  async function connecterProfil(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    if (!email.trim() || !password) { setErreur("Merci de renseigner l'e-mail et le mot de passe."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setErreur("E-mail ou mot de passe incorrect."); return; }
  }

  const boutonPrincipal = { width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "opacity .15s ease" };
  const boutonLien = { width: "100%", padding: "6px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer" };

  // --- Écran de confirmation (après inscription) ---
  if (messageConfirmation) {
    const OkIcon = messageConfirmation.compteExistant ? IconInfo : IconCheck;
    return (
      <div className="pace-fade-in" style={{ background: "var(--c-bg)", borderRadius: 12, padding: 18, textAlign: "center" }}>
        <div className="pace-scale-in" style={{
          width: 52, height: 52, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center",
          background: messageConfirmation.compteExistant ? "var(--c-surface-soft)" : "var(--c-accent-dark)" }}>
          <OkIcon size={24} color={messageConfirmation.compteExistant ? "var(--c-accent-dark)" : "#fff"} />
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>
          {messageConfirmation.compteExistant ? "Déjà inscrit·e" : "Presque prêt·e"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>{messageConfirmation.texte}</div>
        <button type="button" onClick={() => { setMessageConfirmation(null); setModeProfil("login"); setPassword(""); allerEtape(0); }} style={boutonPrincipal}>
          {messageConfirmation.compteExistant ? "Se connecter" : "J'ai confirmé, me connecter"}
        </button>
        {!messageConfirmation.compteExistant && (
          <button type="button" onClick={() => setMessageConfirmation(null)} style={boutonLien}>Corriger l'adresse e-mail</button>
        )}
      </div>
    );
  }

  return (
    <div className="pace-fade-in" style={{ background: "var(--c-bg)", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
        Un profil de base est nécessaire avant de continuer — il te servira aussi bien pour devenir bénévole que pour créer un compte organisation.
      </div>

      {modeProfil === "signup" ? (
        <>
          {/* Barre de progression + en-tête d'étape : rendent visible où on en est et ce qu'il reste. */}
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            {ETAPES_PROFIL.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= etape ? "var(--c-accent-dark)" : "var(--c-border)", transition: "background-color .3s ease" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {etape > 0 && (
                <button type="button" onClick={precedent} aria-label="Étape précédente" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)", display: "flex", padding: 2 }}>
                  <IconArrowLeft size={16} />
                </button>
              )}
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "var(--c-surface-soft)", color: "var(--c-accent-dark)" }}>
                {React.createElement(ETAPES_PROFIL[etape].icone, { size: 14 })}
              </span>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-text)" }}>{ETAPES_PROFIL[etape].titre}</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--c-text-faint)" }}>{etape + 1}/{ETAPES_PROFIL.length}</span>
          </div>

          <form onSubmit={creerProfil}>
            <div key={etape} className="pace-fade-in">
              {etape === 0 && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" onChange={choisirPhoto} style={{ display: "none" }} />
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                    <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={{
                      width: 76, height: 76, borderRadius: "50%", border: "1px dashed var(--c-border)", background: photo ? `url(${photo}) center/cover` : "var(--c-surface)",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, overflow: "hidden" }} aria-label="Choisir une photo de profil">
                      {!photo && <IconCamera size={21} color="var(--c-text-muted)" />}
                    </button>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", textAlign: "center", marginBottom: 12 }}>Photo de profil (optionnel)</div>
                  <input ref={nomRef} required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom complet" style={champ} />
                </>
              )}
              {etape === 1 && (
                <>
                  <input ref={emailRef} required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail"
                    style={email && !emailValide ? champErreur : champ} />
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: -4, marginBottom: 8, lineHeight: 1.4 }}>
                    Conseil : évite une adresse e-mail contenant des informations confidentielles ou sensibles (nom d'employeur, etc.).
                  </div>
                  <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (6 caractères min.)" style={champ} />
                  {password.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: password.length >= 6 ? "var(--c-accent-dark)" : "var(--c-text-muted)", marginTop: -3, marginBottom: 8 }}>
                      {password.length >= 6 ? <IconCheck size={11} /> : null}
                      {password.length >= 6 ? "Longueur suffisante" : `Encore ${6 - password.length} caractère${6 - password.length > 1 ? "s" : ""}`}
                    </div>
                  )}
                </>
              )}
              {etape === 2 && (
                <>
                  <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville (optionnel)" style={champ} />
                  <select value={pays} onChange={e => setPays(e.target.value)}
                    style={{ ...champ, background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
                    <option value="">Pays (optionnel)</option>
                    {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                      <optgroup key={region} label={region}>
                        {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </>
              )}
            </div>

            {erreur && (
              <div role="alert" className="pace-fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
                <IconAlert size={13} color="#B5451B" />
                <span>{erreur}</span>
              </div>
            )}

            {etape < 2 ? (
              <button type="button" onClick={suivant} disabled={etape === 0 ? !etape0Ok : !etape1Ok} style={{ ...boutonPrincipal, opacity: (etape === 0 ? !etape0Ok : !etape1Ok) ? 0.55 : 1 }}>
                Continuer
              </button>
            ) : (
              <button type="button" onClick={creerProfil} disabled={busy} style={{ ...boutonPrincipal, opacity: busy ? 0.75 : 1 }}>
                {busy ? <IconClock size={14} /> : <IconSprout size={14} />}
                {busy ? "Création…" : "Créer mon profil"}
              </button>
            )}
            {etape === 0 && (
              <button type="button" onClick={() => { setModeProfil("login"); setErreur(""); allerEtape(0); }} style={boutonLien}>
                Déjà un profil ? Se connecter
              </button>
            )}
          </form>
        </>
      ) : (
        <form onSubmit={connecterProfil} className="pace-fade-in">
          <input ref={emailLoginRef} required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" style={champ} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" style={champ} />
          {erreur && (
            <div role="alert" className="pace-fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
              <IconAlert size={13} color="#B5451B" />
              <span>{erreur}</span>
            </div>
          )}
          <button type="button" onClick={connecterProfil} disabled={busy} style={{ ...boutonPrincipal, opacity: busy ? 0.75 : 1 }}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
          <button type="button" onClick={() => { setModeProfil("signup"); setErreur(""); allerEtape(0); }} style={boutonLien}>
            Pas encore de profil ? En créer un
          </button>
        </form>
      )}
    </div>
  );
}

function VolunteerCard({ lang, benevoleStatut, onInscrit, profilInfo, onProfilChange }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [contact, setContact] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [zone, setZone] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [code, setCode] = useState("");
  const [showEditProfil, setShowEditProfil] = useState(false);

  const indicatif = (PAYS_INDICATIFS.find(p => p.pays === pays) || {}).indicatif || "";

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    setBusy(true);
    // Associe automatiquement l'indicatif téléphonique du pays choisi devant le numéro,
    // sauf si le champ contient une adresse e-mail ou un indicatif déjà saisi manuellement.
    let contactFinal = contact.trim();
    if (indicatif && contactFinal && !contactFinal.includes("@") && !contactFinal.startsWith("+")) {
      contactFinal = `${indicatif} ${contactFinal}`;
    }
    // Un id est généré côté client (repris tel quel par la colonne "id" par défaut de type uuid)
    // pour pouvoir le mettre en cache sans avoir besoin de relire la ligne après insertion —
    // la table "benevoles" n'étant pas lisible publiquement, un select-after-insert échouerait.
    const benevoleId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid() + "-" + uid());
    // L'insertion passe par une fonction serveur (RPC) plutôt qu'un insert direct : c'est elle
    // qui vérifie le code d'organisation (si saisi) et résout l'organisation correspondante —
    // jamais le client, pour qu'il soit impossible de s'auto-assigner à une organisation en
    // devinant/forgeant un id sans connaître son vrai code. Le nom vient du profil (auth.uid()),
    // plus besoin de le ressaisir ici.
    const { queued, error } = await inscrireBenevole({
      benevoleId, contactFinal, pays: pays || null, ville: ville || null, zone: zone || null, code: code.trim() || null,
    });
    if (error) {
      setBusy(false);
      if (error.message && error.message.includes("code_invalide")) {
        setErreur("Le code saisi est incorrect ou n'est pas lié à une organisation.");
      } else if (error.message && error.message.includes("profil_requis")) {
        setErreur("Un profil actif est requis pour t'inscrire comme bénévole.");
      } else {
        setErreur(t(lang, "inscription_echec") + (error.message ? "\n(" + error.message + ")" : ""));
      }
      return;
    }
    // Mis en cache localement : permet d'accompagner automatiquement chaque signalement fait
    // depuis cet appareil des renseignements du bénévole (et son id, pour qu'une organisation
    // puisse l'assigner à elle-même), sans avoir à les redemander ni à relire la table
    // "benevoles" (qui n'est pas lisible publiquement).
    try { localStorage.setItem("pace-benevole-info", JSON.stringify({ id: benevoleId, nom: profilInfo && profilInfo.nom, contact: contactFinal, pays: pays || null, ville: ville || null, quartier: zone || null })); } catch (e) {}
    setBusy(false);
    setDone(true); setContact(""); setPays(""); setVille(""); setZone(""); setCode("");
    if (onInscrit) onInscrit();
    if (queued) setErreur(""); // pas d'erreur : simplement mis en attente, le statut "en_attente" s'affiche déjà
  }

  // Cet appareil a déjà une inscription (peu importe son statut) : on ne montre jamais le
  // formulaire à nouveau, pour éviter les doublons dans le Centre d'EcoVigil. L'app
  // se "souvient" via device_id (persisté en localStorage), donc pas besoin de compte.
  if (benevoleStatut) {
    const info = BENEVOLE_STATUT_INFO[benevoleStatut] || { label: benevoleStatut, texte: "", couleur: "var(--c-text-muted)" };
    return (
      <div style={{ marginTop: 22, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconUsers size={17} color="var(--c-accent-dark)" />
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "devenir_benevole")}</div>
        </div>
        <div style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, color: "#fff", background: info.couleur, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>{info.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>{info.texte}</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 22, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconUsers size={17} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "devenir_benevole")}</div>
      </div>
      {done ? (
        <div style={{ fontSize: 12.5, color: "var(--c-accent)", display: "flex", alignItems: "center", gap: 6 }}><IconCheck size={14} /> {t(lang, "inscription_recue")}</div>
      ) : !open ? (
        <>
          <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>{t(lang, "rejoindre_equipe")}</div>
          <button onClick={() => setOpen(true)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{t(lang, "sinscrire")}</button>
        </>
      ) : (
        <ProfilGate profilInfo={profilInfo}>
          {showEditProfil ? (
            <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEditProfil(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEditProfil(false)} />
          ) : (
          <form onSubmit={submit}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 8 }}>
              {profilInfo && profilInfo.photo_url && (
                <img src={profilInfo.photo_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <span>Inscription au nom de {profilInfo && profilInfo.nom} (profil connecté).</span>
              <button type="button" onClick={() => setShowEditProfil(true)} aria-label="Modifier mon profil" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 2, marginLeft: "auto" }}>
                <IconEdit size={13} />
              </button>
            </div>
            <input required value={contact} onChange={e => setContact(e.target.value)} placeholder={indicatif ? `${t(lang, "telephone_email")} (${indicatif})` : t(lang, "telephone_email")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <select required value={pays} onChange={e => setPays(e.target.value)}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 4, boxSizing: "border-box", background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
              <option value="" disabled>{t(lang, "pays_label")}</option>
              {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                <optgroup key={region} label={region}>
                  {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}{p.indicatif ? ` (${p.indicatif})` : ""}</option>)}
                </optgroup>
              ))}
            </select>
            {indicatif && (
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>{t(lang, "indicatif_associe")}{indicatif}</div>
            )}
            <input required value={ville} onChange={e => setVille(e.target.value)} placeholder={t(lang, "ville_label")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <input value={zone} onChange={e => setZone(e.target.value)} placeholder={t(lang, "quartier_zone")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code d'une organisation (optionnel)"
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 4, boxSizing: "border-box" }} />
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10 }}>
              Si une ONG ou une administration t'a communiqué un code, saisis-le ici pour qu'elle puisse t'assigner ses signalements. Laisse vide si tu ne participes à aucune organisation.
            </div>

            {erreur && <div role="alert" style={{ fontSize: 12.5, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

            <button type="button" onClick={submit} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {busy ? t(lang, "envoi_en_cours") : t(lang, "confirmer_inscription")}
            </button>
          </form>
          )}
        </ProfilGate>
      )}
    </div>
  );
}

const VERIF_DOC_TYPE_AGREMENT = "Récépissé / agrément officiel";
const VERIF_DOC_TYPE_STATUTS = "Statuts / enregistrement légal";
const VERIF_DOC_TYPE_IDENTITE = "Pièce d'identité du responsable";

// Statuts fins du dossier d'admission (section 7 du cahier des charges).
// "statut" (en_attente/valide/suspendu/bloque/rejete) reste le seul verrou
// d'accès aux fonctionnalités ; ceci ne fait qu'enrichir le message affiché.
const ETAPE_DOSSIER_INFO = {
  en_attente_verification: { label: "Dossier en attente de vérification", couleur: "var(--c-warning)",
    texte: "Votre dossier a été transmis avec succès et est actuellement en attente de vérification par l'équipe EcoVigil." },
  en_cours_verification: { label: "Dossier en cours de vérification", couleur: "var(--c-warning)",
    texte: "L'équipe EcoVigil examine actuellement votre dossier et les documents fournis." },
  informations_a_completer: { label: "Informations à compléter", couleur: "#E3A73B",
    texte: "Des informations manquent pour poursuivre l'examen de votre dossier. Contactez l'équipe EcoVigil pour savoir lesquelles." },
  document_non_conforme: { label: "Document non conforme", couleur: "#B5451B",
    texte: "Un ou plusieurs documents fournis ne sont pas conformes. Contactez l'équipe EcoVigil pour les corriger." },
  agrement_invalide: { label: "Agrément invalide", couleur: "#B5451B",
    texte: "L'agrément fourni n'a pas pu être validé par l'équipe EcoVigil." },
  agrement_expire: { label: "Agrément expiré", couleur: "#B5451B",
    texte: "L'agrément fourni est expiré. Contactez l'équipe EcoVigil pour régulariser votre dossier." },
  valide: { label: "Organisation vérifiée", couleur: "var(--c-accent)",
    texte: "Ce statut reflète les éléments vérifiés par l'équipe EcoVigil sur la base des documents et informations soumis. Il ne constitue pas un agrément délivré par EcoVigil." },
  refuse: { label: "Dossier refusé", couleur: "var(--c-text-muted)",
    texte: "Cette demande n'a pas été retenue par l'équipe EcoVigil. Contactez l'équipe si vous pensez qu'il s'agit d'une erreur." },
};

function OrganisationCard({ lang, organisationStatut, organisationEtapeDossier, organisationEtapeMotif, profilInfo, onProfilChange }) {
  // Lien WhatsApp pré-rempli (option B) : ?membre_code=XXXX ouvre directement l'écran de
  // jonction par code, code déjà renseigné.
  const codeMembrePrefill = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get("membre_code") || ""; } catch (e) { return ""; }
  }, []);
  const [mode, setMode] = useState(codeMembrePrefill ? "membre" : "choix"); // choix | inscription | recapitulatif | connexion | membre | profil_requis
  const [showEditProfil, setShowEditProfil] = useState(false);
  const [type, setType] = useState("ong");
  const [typeOng, setTypeOng] = useState("nationale");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [description, setDescription] = useState("");

  const [numeroAgrement, setNumeroAgrement] = useState("");
  const [dateDelivranceAgrement, setDateDelivranceAgrement] = useState("");
  const [dateExpirationAgrement, setDateExpirationAgrement] = useState("");
  const [autoriteDelivrance, setAutoriteDelivrance] = useState("");
  const [docAgrementUrl, setDocAgrementUrl] = useState(null);
  const [docStatutsUrl, setDocStatutsUrl] = useState(null);
  const [docIdentiteUrl, setDocIdentiteUrl] = useState(null);
  const [representantNom, setRepresentantNom] = useState("");
  const [representantFonction, setRepresentantFonction] = useState("");

  const [adresseOfficielle, setAdresseOfficielle] = useState("");
  const [telephoneOfficiel, setTelephoneOfficiel] = useState("");
  const [emailProfessionnel, setEmailProfessionnel] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  const [codeInscription, setCodeInscription] = useState("");
  const [defisChoisis, setDefisChoisis] = useState([]);
  const [defisDisponibles, setDefisDisponibles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [done, setDone] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErreur, setLoginErreur] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [oublieBusy, setOublieBusy] = useState(false);
  const [oublieMessage, setOublieMessage] = useState("");

  // Rejoindre une organisation avec un code d'invitation (option A) — reçu à la main, ou via
  // un lien WhatsApp pré-rempli du type ?membre_code=XXXX (option B, cf. codeMembrePrefill
  // ci-dessus). Utilise une session Supabase anonyme comme identité stable (auth.uid()) :
  // ni e-mail, ni téléphone, ni SMS.
  const [codeMembre, setCodeMembre] = useState(codeMembrePrefill);
  const [membreBusy, setMembreBusy] = useState(false);
  const [membreErreur, setMembreErreur] = useState("");
  const [membreRejoint, setMembreRejoint] = useState(null); // nom de l'organisation rejointe

  async function rejoindreParCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    setMembreErreur("");
    const code = codeMembre.trim();
    if (!code) { setMembreErreur("Saisis le code d'invitation reçu."); return; }
    setMembreBusy(true);
    let session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { setMembreBusy(false); setMembreErreur("Connexion impossible pour le moment."); return; }
      session = data.session;
    }
    const { data: res, error } = await supabase.rpc("org_membre_rejoindre", { p_code: code });
    setMembreBusy(false);
    if (error) {
      const msg = error.message || "";
      setMembreErreur(
        /code_invalide/.test(msg) ? "Ce code d'invitation est invalide." :
        /code_deja_utilise/.test(msg) ? "Ce code a déjà été utilisé sur un autre appareil." :
        "Impossible de valider ce code pour le moment."
      );
      return;
    }
    setMembreRejoint((res && res[0] && res[0].organisation_nom) || "l'organisation");
    // Force une nouvelle notification de session (même contenu, nouvelle référence) pour que
    // l'écran d'accueil, qui écoute les changements de session, relise immédiatement
    // l'appartenance à l'organisation — sans quoi il faudrait recharger la page.
    persistSession({ ...session });
  }
  useEffect(() => {
    if (codeMembrePrefill && codeMembrePrefill.trim()) { rejoindreParCode(); }
  }, []);

  useEffect(() => {
    supabase.from("env_defis").select("id, nom").eq("statut", "publie").order("ordre", { ascending: true })
      .then(({ data }) => setDefisDisponibles(data || []));
  }, []);

  function toggleDefi(id) {
    setDefisChoisis(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  // Contrôles obligatoires (section 12) : appliqués avant le récapitulatif ET avant
  // la soumission finale — un champ rempli n'est jamais considéré valide par défaut.
  function validerDossier() {
    if (!nom.trim()) return "Le nom officiel de l'organisation est requis.";
    if (type === "ong") {
      if (!numeroAgrement.trim()) return "Le numéro de l'agrément ou de l'acte légal est requis.";
      if (!dateDelivranceAgrement) return "La date de délivrance de l'agrément est requise.";
      if (!autoriteDelivrance.trim()) return "L'autorité ayant délivré l'agrément ou l'acte légal est requise.";
      if (!docAgrementUrl) return "Le document de l'acte d'agrément (ou document légal) est obligatoire.";
      if (!docStatutsUrl) return "Le document des statuts de l'organisation est obligatoire.";
      if (!representantNom.trim() || !representantFonction.trim()) return "L'identité et la fonction du représentant légal sont requises.";
    }
    if (defisChoisis.length === 0) return "Choisis au moins un domaine d'activité.";
    if (!adresseOfficielle.trim() || !telephoneOfficiel.trim() || !emailProfessionnel.trim()) return "L'adresse, le téléphone et l'e-mail professionnel officiels sont requis.";
    if (!emailProfessionnel.includes("@")) return "L'e-mail professionnel indiqué n'est pas valide.";
    if (!codeInscription.trim()) return "Le code d'inscription des bénévoles est requis (ex : sigle de l'organisation + un numéro, comme \"ECO01\").";
    if (!email.trim() || !email.includes("@")) return "Adresse e-mail de connexion invalide.";
    if (!password || password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== confirmPassword) return "Les deux mots de passe ne correspondent pas.";
    return null;
  }

  function allerAuRecapitulatif(e) {
    if (e && e.preventDefault) e.preventDefault();
    const err = validerDossier();
    if (err) { setErreur(err); return; }
    setErreur("");
    setMode("recapitulatif");
  }

  async function soumettre() {
    const err = validerDossier();
    if (err) { setErreur(err); setMode("inscription"); return; }
    setErreur("");
    setBusy(true);
    // Vérification préalable du code AVANT toute tentative de création de compte : GoTrue ne
    // renvoie pas le message précis d'une exception levée par le déclencheur (juste un "Database
    // error saving new user" générique), donc on préfère détecter un code déjà pris ici, avec un
    // message clair, plutôt que de laisser échouer l'inscription pour s'en apercevoir après coup.
    const { data: dispo, error: errCode } = await supabase.rpc("organisation_code_disponible", { p_code: codeInscription.trim() });
    if (errCode) { setBusy(false); setErreur("Impossible de vérifier le code pour le moment. Vérifie ta connexion et réessaie."); return; }
    if (dispo === false) { setBusy(false); setErreur("Ce code d'inscription est déjà utilisé par une autre organisation. Choisis-en un autre."); setMode("inscription"); return; }

    const documents = [];
    if (docAgrementUrl) documents.push({ type: VERIF_DOC_TYPE_AGREMENT, url: docAgrementUrl });
    if (docStatutsUrl) documents.push({ type: VERIF_DOC_TYPE_STATUTS, url: docStatutsUrl });
    if (docIdentiteUrl) documents.push({ type: VERIF_DOC_TYPE_IDENTITE, url: docIdentiteUrl });

    // Le compte Auth et le dossier complet ("organisations" + documents + historique) sont créés
    // dans LA MÊME opération côté serveur (déclencheur sur auth.users), qui revalide aussi les
    // champs obligatoires indépendamment de ce contrôle côté client (section 13). profil_id est
    // capturé maintenant, avant que ce signUp ne remplace la session profil active par la
    // nouvelle session du compte organisation.
    const sessionProfilActuelle = (await supabase.auth.getSession()).data.session;
    const { error: errSignUp } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: urlRedirectionAuth(), data: {
        type_compte: "organisation", nom: nom.trim(), type, pays: pays || null, ville: ville || null,
        description: description.trim() || null, numero_agrement: numeroAgrement.trim() || null,
        code_inscription: codeInscription.trim().toUpperCase(), defis: defisChoisis,
        type_ong: type === "ong" ? typeOng : null,
        profil_id: (sessionProfilActuelle && sessionProfilActuelle.user && sessionProfilActuelle.user.id) || null,
        date_delivrance_agrement: dateDelivranceAgrement || null,
        date_expiration_agrement: dateExpirationAgrement || null,
        autorite_delivrance: autoriteDelivrance.trim() || null,
        representant_nom: representantNom.trim() || null,
        representant_fonction: representantFonction.trim() || null,
        adresse_officielle: adresseOfficielle.trim() || null,
        telephone_officiel: telephoneOfficiel.trim() || null,
        email_professionnel: emailProfessionnel.trim() || null,
        site_web: siteWeb.trim() || null,
        documents,
      } },
    });
    if (errSignUp) {
      setBusy(false);
      const msg = errSignUp.message || "";
      const dup = /duplicate|unique|code_deja_utilise/i.test(msg);
      const dejaInscrit = /already registered|already exists|user_already_exists/i.test(msg);
      setErreur(dup
        ? "Ce code d'inscription est déjà utilisé par une autre organisation. Choisis-en un autre."
        : dejaInscrit
        ? "Cette adresse e-mail est déjà associée à un compte. Connecte-toi plutôt, ou utilise une autre adresse."
        : (msg || "Impossible de soumettre le dossier d'inscription."));
      setMode("inscription");
      return;
    }

    // Filet de sécurité : le compte Auth vient d'être créé, mais le dossier "organisations"
    // dépend d'un déclencheur serveur qui peut échouer indépendamment (ex. contrainte non
    // prévue). On vérifie donc explicitement qu'il existe bien plutôt que d'afficher un
    // succès qui laisserait le dossier invisible côté admin sans que personne ne s'en aperçoive.
    const { data: dossierCree, error: errVerif } = await supabase.rpc("organisation_dossier_existe", { p_email: email.trim() });
    setBusy(false);
    if (!errVerif && dossierCree === false) {
      setErreur("Ton compte a été créé, mais le dossier n'a pas pu être enregistré. Contacte l'équipe EcoVigil avec ton adresse e-mail pour qu'elle régularise ton dossier — ne recrée pas de compte.");
      setMode("inscription");
      return;
    }
    setDone(true);
  }

  async function seConnecter(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLoginErreur(""); setLoginBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
    setLoginBusy(false);
    if (error) { setLoginErreur("E-mail ou mot de passe incorrect."); return; }
  }

  async function motDePasseOublie(e) {
    if (e && e.preventDefault) e.preventDefault();
    setOublieMessage("");
    if (!loginEmail.trim() || !loginEmail.includes("@")) { setOublieMessage("Entre d'abord ton adresse e-mail ci-dessus."); return; }
    setOublieBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), { redirectTo: urlRedirectionAuth() });
    setOublieBusy(false);
    setOublieMessage(error ? (error.message || "Impossible d'envoyer l'e-mail pour le moment.") : "Un e-mail de réinitialisation a été envoyé si ce compte existe.");
  }

  // Un compte existe déjà : afficher son statut, pas le formulaire d'admission.
  if (organisationStatut) {
    let info;
    if (organisationStatut === "suspendu") info = { label: "Compte suspendu", couleur: "#B5451B", texte: "Le compte de ton organisation a été suspendu par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations." };
    else if (organisationStatut === "bloque") info = { label: "Compte bloqué", couleur: "#7A1F1F", texte: "Le compte de ton organisation a été bloqué par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations." };
    else if (organisationStatut === "rejete") info = ETAPE_DOSSIER_INFO.refuse;
    else if (organisationStatut === "valide") info = ETAPE_DOSSIER_INFO.valide;
    else info = ETAPE_DOSSIER_INFO[organisationEtapeDossier] || ETAPE_DOSSIER_INFO.en_attente_verification;

    return (
      <div style={{ marginTop: 14, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconShield size={17} color="var(--c-accent-dark)" />
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>Compte Organisation</div>
        </div>
        <div style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, color: "#fff", background: info.couleur, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>{info.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>{info.texte}</div>
        {organisationEtapeMotif && organisationStatut === "en_attente" && (
          <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", lineHeight: 1.5, marginTop: 6, fontStyle: "italic" }}>{organisationEtapeMotif}</div>
        )}
      </div>
    );
  }

  const champStyle = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 4 };
  const sectionTitre = (n, titre) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--c-accent-dark)", color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
      <span style={{ fontFamily: "Fraunces, serif", fontSize: 13.5, fontWeight: 600, color: "var(--c-text)" }}>{titre}</span>
    </div>
  );

  return (
    <div style={{ marginTop: 14, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconShield size={17} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>Compte Organisation</div>
      </div>

      {done ? (
        <div style={{ fontSize: 12.5, color: "var(--c-accent)", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5 }}>
          <IconCheck size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>Votre dossier a été transmis avec succès et est actuellement en attente de vérification. Confirme d'abord ton e-mail, puis attends la vérification par l'équipe EcoVigil.</span>
        </div>
      ) : mode === "choix" ? (
        <>
          <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>Pour une ONG ou une administration publique intervenant dans un ou plusieurs domaines environnementaux.</div>
          <button onClick={() => setMode(profilInfo ? "inscription" : "profil_requis")} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginRight: 8, marginBottom: 8 }}>Constituer un dossier</button>
          <button onClick={() => setMode("connexion")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginBottom: 8 }}>Déjà inscrit ? Se connecter</button>
          <div>
            <button onClick={() => setMode("membre")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Membre invité par une organisation ? Saisir mon code</button>
          </div>
        </>
      ) : mode === "connexion" ? (
        <form onSubmit={seConnecter}>
          <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Adresse e-mail de l'organisation" style={champStyle} />
          <PasswordInput value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Mot de passe"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6 }} />
          <button type="button" onClick={motDePasseOublie} disabled={oublieBusy} style={{ display: "block", marginLeft: "auto", background: "none", border: "none", color: "var(--c-accent-dark)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "2px 0 8px" }}>
            {oublieBusy ? "…" : "Mot de passe oublié ?"}
          </button>
          {oublieMessage && <div role="status" style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10 }}>{oublieMessage}</div>}
          {loginErreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{loginErreur}</div>}
          <button type="button" onClick={seConnecter} disabled={loginBusy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
            {loginBusy ? "…" : "Se connecter"}
          </button>
          <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>Retour</button>
        </form>
      ) : mode === "membre" ? (
        <div>
          <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Si le compte principal de ton organisation t'a donné un code d'invitation (ou te l'a envoyé sur WhatsApp), saisis-le ici pour accéder à l'Espace Organisation.
          </div>
          {membreRejoint ? (
            <div style={{ fontSize: 12.5, color: "var(--c-accent)", fontWeight: 600 }}>
              Tu as bien rejoint « {membreRejoint} ». L'Espace Organisation est accessible depuis l'accueil.
            </div>
          ) : (
            <form onSubmit={rejoindreParCode}>
              <input required value={codeMembre} onChange={e => setCodeMembre(e.target.value.toUpperCase())} placeholder="Code d'invitation (ex. A1B2C3D4)"
                style={{ ...champStyle, textTransform: "uppercase", letterSpacing: 1 }} />
              {membreErreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{membreErreur}</div>}
              <button type="button" onClick={rejoindreParCode} disabled={membreBusy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
                {membreBusy ? "…" : "Valider le code"}
              </button>
              <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>Retour</button>
            </form>
          )}
        </div>
      ) : mode === "recapitulatif" ? (
        <div>
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>Vérifie les informations avant de soumettre ton dossier. Tu peux revenir en arrière pour corriger.</div>
          {[
            ["Type d'organisation", type === "ong" ? `ONG${typeOng ? " · " + ({ nationale: "nationale", etrangere: "étrangère", autre: "autre catégorie" })[typeOng] : ""}` : "Gouvernement"],
            ["Nom officiel", nom],
            ["Pays / Ville", [pays, ville].filter(Boolean).join(" · ") || "—"],
            ...(type === "ong" ? [
              ["N° d'agrément / acte légal", numeroAgrement],
              ["Délivré le", dateDelivranceAgrement || "—"],
              ["Expire le", dateExpirationAgrement || "non applicable"],
              ["Autorité de délivrance", autoriteDelivrance],
              ["Acte d'agrément joint", docAgrementUrl ? "✓ oui" : "—"],
              ["Statuts joints", docStatutsUrl ? "✓ oui" : "—"],
              ["Représentant légal", `${representantNom} — ${representantFonction}`],
            ] : []),
            ["Domaines d'activité", defisChoisis.map(id => champTexte((defisDisponibles.find(d => d.id === id) || {}).nom) || id).join(", ") || "—"],
            ["Adresse officielle", adresseOfficielle],
            ["Téléphone officiel", telephoneOfficiel],
            ["E-mail professionnel", emailProfessionnel],
            ["Site web", siteWeb || "—"],
            ["Code d'inscription bénévoles", codeInscription.toUpperCase()],
            ["E-mail de connexion", email],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, padding: "6px 0", borderBottom: "1px solid var(--c-border)" }}>
              <span style={{ color: "var(--c-text-muted)", flexShrink: 0 }}>{k}</span>
              <span style={{ color: "var(--c-text)", textAlign: "right" }}>{v}</span>
            </div>
          ))}

          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", lineHeight: 1.5, margin: "12px 0" }}>
            En soumettant ce dossier, tu confirmes l'exactitude des informations fournies. EcoVigil ne délivre, ne renouvelle ni ne remplace aucun agrément légal : la vérification effectuée porte uniquement sur la cohérence du dossier soumis sur la plateforme.
          </div>

          {erreur && <div role="alert" style={{ fontSize: 12.5, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

          <button type="button" onClick={soumettre} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
            {busy ? "…" : "Soumettre le dossier d'inscription"}
          </button>
          <button type="button" onClick={() => setMode("inscription")} disabled={busy} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>Modifier le dossier</button>
        </div>
      ) : mode === "profil_requis" ? (
        <ProfilGate profilInfo={profilInfo}>
          {showEditProfil ? (
            <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEditProfil(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEditProfil(false)} />
          ) : (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--c-accent)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {profilInfo && profilInfo.photo_url ? (
                <img src={profilInfo.photo_url} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <IconCheck size={14} />
              )}
              Profil actif — {profilInfo && profilInfo.nom}
              <button type="button" onClick={() => setShowEditProfil(true)} aria-label="Modifier mon profil" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 2, marginLeft: "auto" }}>
                <IconEdit size={13} />
              </button>
            </div>
            <button type="button" onClick={() => setMode("inscription")} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Continuer vers le dossier d'organisation
            </button>
          </div>
          )}
        </ProfilGate>
      ) : (
        <form onSubmit={allerAuRecapitulatif}>
          {sectionTitre(1, "Type d'organisation")}
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            {[["ong", "ONG"], ["gouvernement", "Gouvernement"]].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setType(id)} style={{
                flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: type === id ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: type === id ? "var(--c-surface-soft)" : "var(--c-surface)", color: type === id ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{label}</button>
            ))}
          </div>
          {type === "ong" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, marginTop: 6 }}>
              {[["nationale", "ONG nationale"], ["etrangere", "ONG étrangère"], ["autre", "Autre catégorie"]].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTypeOng(id)} style={{
                  flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: 10.5, fontWeight: 600, cursor: "pointer",
                  border: typeOng === id ? "1.5px solid var(--c-accent)" : "1px solid var(--c-border)",
                  background: typeOng === id ? "var(--c-surface-soft)" : "var(--c-surface)", color: typeOng === id ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{label}</button>
              ))}
            </div>
          )}

          {sectionTitre(2, "Identification officielle")}
          <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom officiel de l'organisation" style={champStyle} />
          <input value={pays} onChange={e => setPays(e.target.value)} placeholder="Pays" style={champStyle} />
          <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville" style={champStyle} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brève description (optionnel)"
            style={{ ...champStyle, fontFamily: "Work Sans, sans-serif", resize: "none" }} />

          {type === "ong" && (
            <>
              {sectionTitre(3, "Statut légal et agrément")}
              <input required value={numeroAgrement} onChange={e => setNumeroAgrement(e.target.value)} placeholder="Numéro de l'agrément ou de l'acte légal" style={champStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Date de délivrance</div>
                  <input required type="date" value={dateDelivranceAgrement} onChange={e => setDateDelivranceAgrement(e.target.value)} style={champStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Date d'expiration (si applicable)</div>
                  <input type="date" value={dateExpirationAgrement} onChange={e => setDateExpirationAgrement(e.target.value)} style={champStyle} />
                </div>
              </div>
              <input required value={autoriteDelivrance} onChange={e => setAutoriteDelivrance(e.target.value)} placeholder="Autorité ayant délivré l'agrément ou l'acte légal" style={champStyle} />

              {sectionTitre(4, "Documents justificatifs")}
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>Formats acceptés : PDF, JPG, PNG. 10 Mo maximum par document.</div>
              <VerifFileInput value={docAgrementUrl} onChange={setDocAgrementUrl} label="Acte d'agrément ou document légal (obligatoire)" />
              <VerifFileInput value={docStatutsUrl} onChange={setDocStatutsUrl} label="Statuts de l'organisation (obligatoire)" />
              <VerifFileInput value={docIdentiteUrl} onChange={setDocIdentiteUrl} label="Pièce d'identité du représentant légal (optionnel)" />

              {sectionTitre(5, "Représentant légal")}
              <input required value={representantNom} onChange={e => setRepresentantNom(e.target.value)} placeholder="Nom complet du représentant légal" style={champStyle} />
              <input required value={representantFonction} onChange={e => setRepresentantFonction(e.target.value)} placeholder="Fonction du représentant légal" style={champStyle} />
            </>
          )}

          {sectionTitre(6, "Domaines d'activité")}
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>Domaine(s) d'activité *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {defisDisponibles.map(d => {
              const actif = defisChoisis.includes(d.id);
              return (
                <button key={d.id} type="button" onClick={() => toggleDefi(d.id)} style={{
                  padding: "6px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                  border: actif ? "1.5px solid var(--c-accent)" : "1px solid var(--c-border)",
                  background: actif ? "var(--c-surface-soft)" : "var(--c-surface)", color: actif ? "var(--c-accent)" : "var(--c-text-secondary)" }}>
                  {champTexte(d.nom) || d.id}
                </button>
              );
            })}
            {defisDisponibles.length === 0 && <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>Aucun défi publié pour le moment.</div>}
          </div>

          {sectionTitre(7, "Coordonnées officielles")}
          <input required value={adresseOfficielle} onChange={e => setAdresseOfficielle(e.target.value)} placeholder="Adresse officielle" style={champStyle} />
          <input required value={telephoneOfficiel} onChange={e => setTelephoneOfficiel(e.target.value)} placeholder="Téléphone officiel" style={champStyle} />
          <input required type="email" value={emailProfessionnel} onChange={e => setEmailProfessionnel(e.target.value)} placeholder="E-mail professionnel" style={champStyle} />
          <input value={siteWeb} onChange={e => setSiteWeb(e.target.value)} placeholder="Site web (optionnel)" style={champStyle} />

          {sectionTitre(8, "Code d'inscription des bénévoles")}
          <input required value={codeInscription} onChange={e => setCodeInscription(e.target.value)} placeholder="Code d'inscription de l'organisation (ex : ECO01)" style={{ ...champStyle, marginBottom: 4 }} />
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
            Créez un code unique permettant à vos bénévoles d'identifier votre organisation lors de leur inscription sur Pace Connect. Communiquez ce code uniquement aux bénévoles que vous souhaitez rattacher à votre organisation. Ce code ne constitue pas une preuve d'agrément, de reconnaissance légale ou de conformité.
          </div>

          {sectionTitre(9, "Identifiants de connexion")}
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", margin: "2px 0 8px" }}>Un compte réel (e-mail + mot de passe) permet à plusieurs membres de ton équipe de se connecter. Conseil : évite une adresse contenant des informations confidentielles ou sensibles.</div>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail de connexion" style={champStyle} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (8 caractères minimum)"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8 }} />
          <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme le mot de passe"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10 }} />

          {erreur && <div role="alert" style={{ fontSize: 12.5, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

          <button type="button" onClick={allerAuRecapitulatif} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
            Vérifier et continuer
          </button>
          <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>Retour</button>
        </form>
      )}
    </div>
  );
}

function BenevoleAccesBloque({ statut }) {
  const infos = {
    en_attente: {
      icon: <IconClock size={30} color="var(--c-warning)" />,
      titre: "Inscription en cours de validation",
      texte: "Ton inscription comme bénévole a bien été reçue. L'accès à EcoVigil s'ouvrira automatiquement dès qu'un administrateur du Centre d'EcoVigil aura validé ton compte.",
    },
    suspendu: {
      icon: <IconAlert size={30} color="#B5451B" />,
      titre: "Accès suspendu",
      texte: "Ton accès bénévole à EcoVigil a été suspendu par un administrateur. Contacte l'équipe EcoVigil si tu penses qu'il s'agit d'une erreur.",
    },
    rejete: {
      icon: <IconAlert size={30} color="var(--c-text-muted)" />,
      titre: "Demande non retenue",
      texte: "Ta demande d'inscription comme bénévole n'a pas été validée par l'équipe EcoVigil. Contacte l'équipe EcoVigil pour plus d'informations.",
    },
  };
  const info = infos[statut] || infos.en_attente;
  return (
    <div style={{ padding: "60px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ background: "var(--c-surface-soft)", borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {info.icon}
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "var(--c-text)" }}>{info.titre}</div>
      <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.6, maxWidth: 320 }}>{info.texte}</div>
    </div>
  );
}

function Biodiversite({ observations, onAdd, onBack, lang, coordFormat }) {
  const [showForm, setShowForm] = useState(false);
  const [espece, setEspece] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gpsFix, setGpsFix] = useState(null);

  function submit() {
    if (!espece.trim()) return;
    setBusy(true);
    const finalize = (lat, lng) => {
      onAdd({ espece, description, photo, lat, lng }).finally(() => {
        setBusy(false); setEspece(""); setDescription(""); setPhoto(null); setShowForm(false); setGpsFix(null);
      });
    };
    if (gpsFix && gpsFix.lat != null && gpsFix.lng != null) {
      finalize(gpsFix.lat, gpsFix.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>{t(lang, "retour")}</button>
      <SectionTitle sub={t(lang, "sub_biodiv2")}>{t(lang, "title_biodiversite")}</SectionTitle>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> {t(lang, "signaler_observation")}
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label={t(lang, "photo_espece")} previewMaxHeight={130} />
          <input value={espece} onChange={e => setEspece(e.target.value)} placeholder={t(lang, "espece_placeholder")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t(lang, "remarques_placeholder")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" }} />
          <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFix} compact />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>{t(lang, "annuler")}</button>
            <button onClick={submit} disabled={busy} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{busy ? t(lang, "envoi_en_cours") : t(lang, "enregistrer")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {observations.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>{t(lang, "aucune_observation_partagee")}</div>}
        {[...observations].reverse().map(o => (
          <div key={o.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
            <MediaThumb src={o.photo_url} style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <IconPaw size={14} color="var(--c-accent)" />
              <div style={{ fontWeight: 600, fontSize: 13 }}>{o.espece}</div>
            </div>
            {o.description && <div style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>{o.description}</div>}
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}


const ASSISTANT_KB = [
  { id: "dechets", keywords: ["déchet", "dechets", "recycl", "tri", "plastique", "poubelle", "ordure", "compost"],
    reply: "Pour le tri des déchets : sépare au minimum le plastique/métal, le papier/carton, et les déchets organiques (compostables). Les déchets organiques peuvent devenir du compost pour tes cultures ou ton jardin en 2 à 3 mois. Pour le plastique, vérifie s'il existe un point de collecte ou un recycleur près de chez toi — signale une décharge sauvage directement depuis l'onglet \"Signaler\" de l'app, avec une photo et la localisation." },
  { id: "arbres", keywords: ["arbre", "reboisement", "planter", "plantation", "pépinière", "pepiniere", "essence", "espèces d'arbres"],
    reply: "Pour bien planter un arbre : choisis une espèce locale adaptée au climat de ta région (elle demande moins d'eau et s'intègre mieux à l'écosystème), creuse un trou deux fois plus large que la motte, arrose abondamment les 2 premières semaines puis régulièrement les 3 premiers mois. Utilise l'onglet \"Mon Arbre\" pour enregistrer ta plantation avec une photo et sa position GPS — ça compte aussi dans le calcul de CO₂ absorbé par la communauté." },
  { id: "biodiversite", keywords: ["biodiversité", "biodiversite", "animal", "oiseau", "insecte", "faune", "espèce", "identifier"],
    reply: "Je ne peux pas analyser de photo dans ce mode simplifié (sans IA), mais tu peux quand même enregistrer ton observation dans l'onglet \"Biodiversité\" avec une photo et une description — ça reste utile pour construire la base de données écologique locale. Pour une identification précise, décris la taille, la couleur, l'habitat et le comportement de l'espèce observée, ça aide déjà beaucoup." },
  { id: "climat", keywords: ["climat", "réchauffement", "rechauffement", "sécheresse", "secheresse", "chaleur", "pluie", "co2", "carbone"],
    reply: "Le réchauffement climatique en Afrique se traduit surtout par des sécheresses plus fréquentes, des pluies plus irrégulières et intenses, et une pression accrue sur les ressources en eau. Les gestes qui comptent à l'échelle individuelle : planter des arbres locaux, réduire les déchets brûlés à l'air libre, et économiser l'eau. Chaque arbre enregistré dans l'app contribue à l'estimation collective de CO₂ absorbé, visible sur ton profil." },
  { id: "signalement", keywords: ["signal", "pollution", "décharge", "decharge", "problème", "probleme"],
    reply: "Pour signaler un problème environnemental (décharge sauvage, pollution, arbre coupé illégalement...), utilise l'onglet \"Signaler\" : prends une photo, précise la catégorie et l'urgence, ta position GPS est enregistrée automatiquement. Un administrateur EcoVigil examine chaque signalement." },
  { id: "salutation", keywords: ["bonjour", "salut", "bonsoir", "bjr", "cc", "hello"],
    reply: "Bonjour ! Je peux te renseigner sur le tri des déchets, le reboisement, la biodiversité ou le climat. Pose-moi une question sur l'un de ces sujets." },
  { id: "merci", keywords: ["merci", "ok merci", "d'accord merci"],
    reply: "Avec plaisir ! N'hésite pas si tu as d'autres questions." },
  { id: "stats", keywords: ["statistique", "statistiques", "combien", "chiffre", "chiffres", "total"], dynamic: "stats" },
  { id: "impact", keywords: ["mon impact", "ma progression", "mes arbres plantés", "mes signalements"], dynamic: "impact" },
  { id: "especes", keywords: ["quelle espèce", "quelles espèces", "espèce plantée", "arbre le plus planté"], dynamic: "especes" },
  { id: "categorie", keywords: ["type de signalement", "problème le plus", "probleme le plus", "catégorie de signalement"], dynamic: "categorieTop" },
  { id: "actus", keywords: ["actualité", "actualités", "actu", "actus", "quoi de neuf"], dynamic: "actualites" },
];
const ASSISTANT_FALLBACK = "Je fonctionne en mode simplifié (sans connexion à une IA) et je ne comprends que quelques grands sujets : déchets et recyclage, reboisement, biodiversité, climat, et signalement de problèmes. Essaie de reformuler avec l'un de ces mots-clés, ou utilise directement les onglets \"Signaler\", \"Mon Arbre\" ou \"Biodiversité\" de l'app.";

function findAssistantReply(text, paceStats) {
  const lower = (text || "").toLowerCase();
  const match = ASSISTANT_KB.find(k => k.keywords.some(kw => lower.includes(kw)));
  if (!match) return ASSISTANT_FALLBACK;
  if (match.dynamic) return paceStats[match.dynamic] || ASSISTANT_FALLBACK;
  return match.reply;
}

function buildPaceStatsReplies(signalements, arbres, observations, actualites) {
  const sig = signalements || [];
  const arb = arbres || [];
  const obs = observations || [];
  const news = actualites || [];

  const resolus = sig.filter(s => s.statut === "resolu").length;
  const enAttente = sig.length - resolus;
  const co2 = arb.reduce((sum, a) => sum + co2EstimeParArbre(a), 0);
  const espacesCount = {};
  arb.forEach(a => { if (a.nom) espacesCount[a.nom] = (espacesCount[a.nom] || 0) + 1; });
  const especeTop = Object.entries(espacesCount).sort((a, b) => b[1] - a[1])[0];
  const categorieCount = {};
  sig.forEach(s => { if (s.categorie) categorieCount[s.categorie] = (categorieCount[s.categorie] || 0) + 1; });
  const categorieTop = Object.entries(categorieCount).sort((a, b) => b[1] - a[1])[0];
  const categorieTopLabel = categorieTop ? categorieMeta(categorieTop[0]).label : null;

  return {
    stats: `Sur EcoVigil en ce moment : ${sig.length} signalement${sig.length > 1 ? "s" : ""} (${resolus} résolu${resolus > 1 ? "s" : ""}, ${enAttente} en attente), ${arb.length} arbre${arb.length > 1 ? "s" : ""} planté${arb.length > 1 ? "s" : ""} (environ ${co2} kg de CO₂ absorbé, estimation), et ${obs.length} observation${obs.length > 1 ? "s" : ""} de biodiversité enregistrée${obs.length > 1 ? "s" : ""}.`,
    impact: `Ton impact sur EcoVigil : ${arb.length} arbre${arb.length > 1 ? "s" : ""} planté${arb.length > 1 ? "s" : ""} (environ ${co2} kg de CO₂ absorbé, estimation) et ${sig.length} signalement${sig.length > 1 ? "s" : ""} envoyé${sig.length > 1 ? "s" : ""}. Continue à planter des arbres et signaler des problèmes pour faire grandir cet impact.`,
    especes: especeTop ? `L'espèce d'arbre la plus plantée sur EcoVigil actuellement est "${especeTop[0]}" (${especeTop[1]} plantation${especeTop[1] > 1 ? "s" : ""} enregistrée${especeTop[1] > 1 ? "s" : ""}).` : "Aucun arbre n'a encore été enregistré sur l'app pour le moment.",
    categorieTop: categorieTopLabel ? `Le type de signalement le plus fréquent en ce moment est : "${categorieTopLabel}" (${categorieTop[1]} signalement${categorieTop[1] > 1 ? "s" : ""}).` : "Aucun signalement n'a encore été enregistré sur l'app.",
    actualites: news.length ? `Dernière actualité EcoVigil : "${news[0].titre || news[0].contenu || ""}".` : "Aucune actualité n'est publiée pour le moment — consulte l'onglet Actualités régulièrement.",
  };
}

// Aperçu cartographique de la surface à reboiser : dessine un polygone qui suit exactement
// l'ordre des points saisis par l'organisation (et non une enveloppe convexe), avec une
// étiquette "S = x ha / m²" centrée sur la surface colorée.
function ZoneReboisementMap({ points, superficieAffichee, hauteur = 210 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { attributionControl: false, zoomControl: true }).setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapRef.current);
      layerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const map = mapRef.current;
    layerRef.current.clearLayers();
    map.invalidateSize();

    const pts = (points || []).filter(p => typeof p.lat === "number" && typeof p.lng === "number");
    if (pts.length === 0) { map.setView([0, 0], 2); return; }

    // Un point par marqueur, numéroté selon l'ordre de saisie (utile pour vérifier le contour).
    pts.forEach((p, i) => {
      L.circleMarker([p.lat, p.lng], { radius: 5, color: "#007A3D", weight: 2, fillColor: "#4CAF50", fillOpacity: 1 })
        .bindTooltip(String(i + 1), { permanent: false, direction: "top" })
        .addTo(layerRef.current);
    });

    if (pts.length >= 3) {
      // Le polygone relie les points STRICTEMENT dans l'ordre saisi, pour représenter la figure
      // géométrique réellement délimitée par l'organisation (pas une forme recalculée).
      const latlngs = pts.map(p => [p.lat, p.lng]);
      const polygone = L.polygon(latlngs, { color: "#007A3D", weight: 2, fillColor: "#4CAF50", fillOpacity: 0.35 }).addTo(layerRef.current);
      const centre = polygone.getBounds().getCenter();
      L.marker(centre, {
        interactive: false,
        icon: L.divIcon({
          className: "pace-zone-label",
          html: `<div style="background:#fff;border:1px solid #007A3D;border-radius:8px;padding:3px 9px;font-size:12px;font-weight:700;color:#007A3D;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);">S = ${superficieAffichee}</div>`,
          iconSize: [0, 0],
        }),
      }).addTo(layerRef.current);
      map.fitBounds(polygone.getBounds(), { padding: [26, 26] });
    } else {
      const bounds = L.latLngBounds(pts.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, superficieAffichee]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  return <div ref={containerRef} style={{ width: "100%", height: hauteur, borderRadius: 12, overflow: "hidden", border: "1px solid var(--c-border)", marginBottom: 10 }} />;
}

function EspaceOrganisation({ organisationEmail, organisationUserId, onBack, coordFormat, peutBasculerBenevole }) {
  const [org, setOrg] = useState(null);
  const [signalements, setSignalements] = useState(null);
  const [defisNoms, setDefisNoms] = useState({});
  const [titreActu, setTitreActu] = useState("");
  const [contenuActu, setContenuActu] = useState("");
  const [urgentActu, setUrgentActu] = useState(false);
  const [busyActu, setBusyActu] = useState(false);
  const [messageActu, setMessageActu] = useState("");
  const [mesBenevoles, setMesBenevoles] = useState(null);
  const [benevolesDisponibles, setBenevolesDisponibles] = useState(null);
  const [benevolesAutresOrg, setBenevolesAutresOrg] = useState(null);
  const [busyAssign, setBusyAssign] = useState(null);
  const [mesArbres, setMesArbres] = useState(null);
  const [showFormArbre, setShowFormArbre] = useState(false);
  const [nomArbre, setNomArbre] = useState("");
  const [photoArbre, setPhotoArbre] = useState(null);
  const [busyArbre, setBusyArbre] = useState(false);
  const [erreurArbre, setErreurArbre] = useState("");
  const [gpsFixArbre, setGpsFixArbre] = useState(null);
  // Membres de l'organisation : le compte principal génère un code d'invitation (partageable
  // à la main ou via un lien WhatsApp pré-rempli). La personne invitée le saisit dans l'app,
  // ce qui la fait passer au statut 'actif' et lui donne accès à l'Espace Organisation, via
  // une session Supabase (éventuellement anonyme) — sans e-mail ni téléphone ni SMS.
  const [estProprietaire, setEstProprietaire] = useState(true);
  const [membresOrg, setMembresOrg] = useState(null);
  const [showFormMembre, setShowFormMembre] = useState(false);
  const [paysMembre, setPaysMembre] = useState("");
  const [telephoneMembre, setTelephoneMembre] = useState("");
  const [busyMembre, setBusyMembre] = useState(false);
  const [erreurMembre, setErreurMembre] = useState("");
  const [dernierMembreInvite, setDernierMembreInvite] = useState(null); // { code, telephone }
  const [busyRetraitMembreId, setBusyRetraitMembreId] = useState(null);
  // Zone à reboiser : l'organisation doit d'abord la définir (points de coordonnées formant un
  // polygone) avant de pouvoir enregistrer des arbres pour ses projets de reboisement. Persistée
  // localement par organisation (même logique que les zones dessinées sur la carte citoyenne :
  // "prêt pour la synchro serveur" plus tard, sans dépendre d'une table Supabase qui n'existe pas
  // encore pour cet usage précis).
  const [zoneReboisement, setZoneReboisement] = useState(undefined); // undefined = pas encore chargée
  const [showEditeurZone, setShowEditeurZone] = useState(false);
  const [pointsZoneTemp, setPointsZoneTemp] = useState([]);
  const [latPointTemp, setLatPointTemp] = useState("");
  const [lngPointTemp, setLngPointTemp] = useState("");
  const [gpsPointTemp, setGpsPointTemp] = useState(null);
  const [erreurZone, setErreurZone] = useState("");
  // Superficie renseignée manuellement par l'organisation (en plus des points de coordonnées) :
  // le contour donne une estimation, mais l'organisation doit déclarer la superficie réelle
  // (m² ou ha), par exemple issue d'un relevé topographique ou d'un titre foncier.
  const [superficieSaisie, setSuperficieSaisie] = useState("");
  const [uniteSuperficieSaisie, setUniteSuperficieSaisie] = useState("m2");
  // Projets & activités de l'organisation
  const [mesProjets, setMesProjets] = useState(null);
  const [showFormProjet, setShowFormProjet] = useState(false);
  const [nomProjet, setNomProjet] = useState("");
  const [descProjet, setDescProjet] = useState("");
  const [lieuProjet, setLieuProjet] = useState("");
  const [budgetProjet, setBudgetProjet] = useState("");
  const [dateDebutProjet, setDateDebutProjet] = useState("");
  const [dateFinProjet, setDateFinProjet] = useState("");
  const [busyProjet, setBusyProjet] = useState(false);
  const [erreurProjet, setErreurProjet] = useState("");
  const [projetOuvert, setProjetOuvert] = useState(null); // id du projet dont on affiche les activités
  const [activitesParProjet, setActivitesParProjet] = useState({}); // { [projet_id]: [...] }
  const [showFormActivite, setShowFormActivite] = useState(null); // id du projet pour lequel le formulaire est ouvert
  const [titreActivite, setTitreActivite] = useState("");
  const [descActivite, setDescActivite] = useState("");
  const [typeActivite, setTypeActivite] = useState("activite");
  const [dateActivite, setDateActivite] = useState("");
  const [busyActivite, setBusyActivite] = useState(false);
  // Groupes de terrain affiliés — un groupe demande l'affiliation en saisissant le code
  // d'inscription de l'organisation à sa création ; l'organisation n'a plus qu'à confirmer.
  const [demandesAffiliation, setDemandesAffiliation] = useState(null);
  const [groupesAffilies, setGroupesAffilies] = useState(null);
  const [busyAffiliationId, setBusyAffiliationId] = useState(null);
  const [erreurAffiliation, setErreurAffiliation] = useState("");
  const [groupeOuvertOrg, setGroupeOuvertOrg] = useState(null);
  const [detailGroupeOrg, setDetailGroupeOrg] = useState(null);
  const [showCreerGroupeOrg, setShowCreerGroupeOrg] = useState(false);
  const [nomGroupeOrg, setNomGroupeOrg] = useState("");
  const [descGroupeOrg, setDescGroupeOrg] = useState("");
  const [objectifGroupeOrg, setObjectifGroupeOrg] = useState("");
  const [busyCreerGroupeOrg, setBusyCreerGroupeOrg] = useState(false);
  const [erreurCreerGroupeOrg, setErreurCreerGroupeOrg] = useState("");
  const [assignationGroupe, setAssignationGroupe] = useState({}); // { [benevoleId]: groupeId }

  function creerGroupeOrg() {
    setErreurCreerGroupeOrg("");
    if (!nomGroupeOrg.trim()) { setErreurCreerGroupeOrg("Le nom du groupe est requis."); return; }
    setBusyCreerGroupeOrg(true);
    const groupeId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid());
    supabase.rpc("gt_groupe_creer_par_organisation", {
      p_id: groupeId, p_nom: nomGroupeOrg.trim(), p_description: descGroupeOrg.trim() || null, p_objectif: objectifGroupeOrg.trim() || null,
    }).then(({ error }) => {
      setBusyCreerGroupeOrg(false);
      if (error) { setErreurCreerGroupeOrg("Échec : " + (error.message || "erreur inconnue")); return; }
      setNomGroupeOrg(""); setDescGroupeOrg(""); setObjectifGroupeOrg(""); setShowCreerGroupeOrg(false);
      chargerGroupesAffilies(org);
    });
  }

  async function chargerDetailGroupeOrg(groupeId) {
    const [{ data: mi }, { data: log }] = await Promise.all([
      supabase.from("gt_missions").select("*").eq("groupe_id", groupeId).order("created_at", { ascending: false }).limit(10),
      supabase.from("gt_audit_log").select("*").eq("groupe_id", groupeId).order("created_at", { ascending: false }).limit(10),
    ]);
    setDetailGroupeOrg({ missions: mi || [], log: log || [] });
  }
  async function ouvrirGroupeOrg(groupeId) {
    if (groupeOuvertOrg === groupeId) { setGroupeOuvertOrg(null); return; }
    setGroupeOuvertOrg(groupeId);
    setDetailGroupeOrg(null);
    await chargerDetailGroupeOrg(groupeId);
  }
  // Même logique de rafraîchissement que côté groupe (toutes les 15s) : sans ça, une organisation
  // qui garde un groupe ouvert à l'écran ne verrait une mission terminée qu'en le refermant puis
  // le rouvrant.
  useEffect(() => {
    if (!groupeOuvertOrg) return;
    const t = setInterval(() => chargerDetailGroupeOrg(groupeOuvertOrg), 15000);
    return () => clearInterval(t);
  }, [groupeOuvertOrg]);

  // Un gouvernement garde ses pleins droits (accès non restreint, comme avant cette
  // fonctionnalité) ; une ONG doit d'abord s'assigner des bénévoles pour voir leurs signalements.
  const estGouvernement = org && org.type === "gouvernement";

  async function chargerBenevoles(orgData) {
    if (!orgData) return;
    // Seuls les bénévoles éligibles (ayant saisi le code de cette organisation à leur
    // inscription) apparaissent ici — jamais un bénévole indépendant. Un gouvernement garde
    // ses pleins droits et voit tous les bénévoles.
    const req = orgData.type === "gouvernement"
      ? supabase.from("benevoles").select("*").eq("is_deleted", false).order("created_at", { ascending: false })
      : supabase.from("benevoles").select("*").eq("is_deleted", false).eq("organisation_code_id", orgData.id).order("created_at", { ascending: false });
    const { data } = await req;
    const tous = data || [];
    // "Disponibles" = réellement non assignés (organisation_id vide) : on ne propose jamais
    // à une organisation d'assigner un bénévole déjà rattaché à une autre — cohérent avec la
    // garde posée côté base de données, qui refuserait de toute façon un tel transfert.
    setMesBenevoles(tous.filter(b => b.organisation_id === orgData.id));
    setBenevolesDisponibles(tous.filter(b => !b.organisation_id));
    setBenevolesAutresOrg(tous.filter(b => b.organisation_id && b.organisation_id !== orgData.id));
  }

  async function chargerArbres(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("arbres").select("*").eq("organisation_id", orgData.id).order("created_at", { ascending: false });
    setMesArbres(data || []);
  }

  async function chargerProjets(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("org_projets").select("*").eq("organisation_id", orgData.id).eq("is_archived", false).order("created_at", { ascending: false });
    setMesProjets(data || []);
  }

  async function chargerGroupesAffilies(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("gt_groupes").select("*").eq("organisation_id", orgData.id).eq("is_deleted", false).order("created_at", { ascending: false });
    const tous = data || [];
    setDemandesAffiliation(tous.filter(g => !g.organisation_confirmee));
    setGroupesAffilies(tous.filter(g => g.organisation_confirmee));
  }

  function confirmerAffiliation(groupeId) {
    setErreurAffiliation("");
    setBusyAffiliationId(groupeId);
    supabase.from("gt_groupes").update({ organisation_confirmee: true }).eq("id", groupeId).eq("organisation_id", org.id)
      .then(({ error }) => {
        setBusyAffiliationId(null);
        if (error) { setErreurAffiliation("Échec : " + (error.message || "erreur inconnue")); return; }
        logGroupeAudit(groupeId, "affiliation_confirmee", "organisations", org.id, org.nom);
        chargerGroupesAffilies(org);
      });
  }

  async function refuserAffiliation(groupeId) {
    if (!confirm("Refuser cette demande d'affiliation ?")) return;
    // On journalise avant de retirer organisation_id : une fois le lien coupé, l'organisation
    // n'a plus le droit d'écrire dans le journal de ce groupe (cohérent avec la policy RLS).
    await logGroupeAudit(groupeId, "affiliation_refusee", "organisations", org.id, org.nom);
    await supabase.from("gt_groupes").update({ organisation_id: null, organisation_confirmee: false }).eq("id", groupeId);
    chargerGroupesAffilies(org);
  }

  async function retirerAffiliation(groupeId) {
    if (!confirm("Retirer l'affiliation de ce groupe ?")) return;
    await logGroupeAudit(groupeId, "affiliation_retiree", "organisations", org.id, org.nom);
    await supabase.from("gt_groupes").update({ organisation_id: null, organisation_confirmee: false }).eq("id", groupeId);
    chargerGroupesAffilies(org);
  }

  async function chargerActivites(projetId) {
    const { data } = await supabase.from("org_activites").select("*").eq("projet_id", projetId).order("date_debut", { ascending: false });
    setActivitesParProjet(prev => ({ ...prev, [projetId]: data || [] }));
  }

  function creerProjet() {
    setErreurProjet("");
    if (!nomProjet.trim()) { setErreurProjet("Le nom du projet est requis."); return; }
    setBusyProjet(true);
    supabase.from("org_projets").insert({
      organisation_id: org.id, nom: nomProjet.trim(), description: descProjet.trim() || null,
      localisation_texte: lieuProjet.trim() || null,
      budget: budgetProjet.trim() ? Number(budgetProjet.trim()) : null,
      date_debut: dateDebutProjet || null, date_fin: dateFinProjet || null,
      responsable: organisationEmail, created_by: organisationEmail,
    }).then(({ error }) => {
      setBusyProjet(false);
      if (error) { setErreurProjet("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setNomProjet(""); setDescProjet(""); setLieuProjet(""); setBudgetProjet(""); setDateDebutProjet(""); setDateFinProjet("");
      setShowFormProjet(false);
      chargerProjets(org);
    });
  }

  function ouvrirProjet(projetId) {
    if (projetOuvert === projetId) { setProjetOuvert(null); return; }
    setProjetOuvert(projetId);
    if (!activitesParProjet[projetId]) chargerActivites(projetId);
  }

  function creerActivite(projetId) {
    if (!titreActivite.trim() || !dateActivite) return;
    setBusyActivite(true);
    supabase.from("org_activites").insert({
      organisation_id: org.id, projet_id: projetId, titre: titreActivite.trim(),
      description: descActivite.trim() || null, type: typeActivite,
      date_debut: new Date(dateActivite).toISOString(), created_by: organisationEmail,
    }).then(({ error }) => {
      setBusyActivite(false);
      if (error) { alert("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setTitreActivite(""); setDescActivite(""); setTypeActivite("activite"); setDateActivite("");
      setShowFormActivite(null);
      chargerActivites(projetId);
    });
  }

  async function changerStatutProjet(p, statut) {
    const { error } = await supabase.from("org_projets").update({ statut }).eq("id", p.id);
    if (error) { alert("Action refusée par le serveur."); return; }
    chargerProjets(org);
  }

  // ===== Zone à reboiser (superficie définie par des points de coordonnées) =====
  // Partagée entre tous les membres actifs de l'organisation (table org_zone_reboisement) :
  // une fois définie par le créateur du compte, les autres membres n'ont plus à la redéfinir.
  async function chargerZoneReboisement(orgData) {
    const { data, error } = await supabase.from("org_zone_reboisement").select("*").eq("organisation_id", orgData.id).maybeSingle();
    if (error) { setZoneReboisement(null); return; }
    setZoneReboisement(data ? { points: data.points, superficie_m2: data.superficie_m2, superficie_estimee_m2: data.superficie_estimee_m2, unite_saisie: data.unite_saisie, defini_par: data.defini_par, date: data.updated_at } : null);
  }
  function superficieDesPoints(points) {
    if (points.length < 3) return 0;
    try { return L.GeometryUtil.geodesicArea(points); } catch (e) { return 0; }
  }
  const superficieTempM2 = useMemo(() => superficieDesPoints(pointsZoneTemp), [pointsZoneTemp]);
  function formatSuperficie(m2) {
    return m2 >= 10000 ? `${(m2 / 10000).toFixed(2)} ha` : `${Math.round(m2)} m²`;
  }
  function ajouterPointManuel() {
    setErreurZone("");
    const lat = Number(latPointTemp), lng = Number(lngPointTemp);
    if (!latPointTemp.trim() || !lngPointTemp.trim() || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErreurZone("Coordonnées invalides."); return;
    }
    setPointsZoneTemp(prev => [...prev, { lat, lng }]);
    setLatPointTemp(""); setLngPointTemp("");
  }
  function ajouterPointDepuisGps() {
    if (!gpsPointTemp) { setErreurZone("En attente d'un signal GPS."); return; }
    setErreurZone("");
    setPointsZoneTemp(prev => [...prev, { lat: gpsPointTemp.lat, lng: gpsPointTemp.lng }]);
  }
  function retirerPoint(index) {
    setPointsZoneTemp(prev => prev.filter((_, i) => i !== index));
  }
  function superficieSaisieEnM2() {
    const val = Number(String(superficieSaisie).replace(",", "."));
    if (!superficieSaisie.trim() || Number.isNaN(val) || val <= 0) return null;
    return uniteSuperficieSaisie === "ha" ? val * 10000 : val;
  }
  function ouvrirEditeurZone() {
    setPointsZoneTemp(zoneReboisement ? zoneReboisement.points : []);
    setErreurZone("");
    if (zoneReboisement && zoneReboisement.superficie_m2) {
      const unite = zoneReboisement.unite_saisie || "m2";
      const valeur = unite === "ha" ? zoneReboisement.superficie_m2 / 10000 : zoneReboisement.superficie_m2;
      setUniteSuperficieSaisie(unite);
      setSuperficieSaisie(String(Number(valeur.toFixed(2))));
    } else {
      setUniteSuperficieSaisie("m2");
      setSuperficieSaisie("");
    }
    setShowEditeurZone(true);
  }
  async function enregistrerZoneReboisement() {
    setErreurZone("");
    if (pointsZoneTemp.length < 4) { setErreurZone("Il faut au moins 4 points pour délimiter une surface."); return; }
    const superficieM2 = superficieSaisieEnM2();
    if (superficieM2 === null) { setErreurZone("Merci de renseigner la superficie à reboiser (m² ou ha)."); return; }
    const { error } = await supabase.from("org_zone_reboisement").upsert({
      organisation_id: org.id, points: pointsZoneTemp, superficie_m2: superficieM2,
      superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie,
      defini_par: organisationEmail, updated_at: new Date().toISOString(),
    }, { onConflict: "organisation_id" });
    if (error) { setErreurZone("Impossible d'enregistrer la surface pour le moment : " + (error.message || "erreur inconnue")); return; }
    setZoneReboisement({ points: pointsZoneTemp, superficie_m2: superficieM2, superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie, defini_par: organisationEmail, date: new Date().toISOString() });
    setShowEditeurZone(false);
    logActivity("zone_reboisement_definie", "organisations", org.id, `${pointsZoneTemp.length} points, ${formatSuperficie(superficieM2)}`);
  }

  async function supprimerZoneReboisement() {
    if (!confirm("Supprimer définitivement la surface à reboiser ? Elle ne réapparaîtra pas tant qu'un membre ne la redéfinira pas, et il faudra la redéfinir avant de pouvoir enregistrer de nouveaux arbres.")) return;
    setErreurZone("");
    const { error } = await supabase.from("org_zone_reboisement").delete().eq("organisation_id", org.id);
    if (error) { setErreurZone("Impossible de supprimer la surface pour le moment : " + (error.message || "erreur inconnue")); return; }
    setZoneReboisement(null);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_supprimee", "organisations", org.id, organisationEmail);
  }

  async function chargerMembres(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("org_membres").select("*").eq("organisation_id", orgData.id).neq("statut", "retire").order("created_at", { ascending: false });
    setMembresOrg(data || []);
  }

  async function inviterMembre() {
    setErreurMembre(""); setDernierMembreInvite(null);
    const indicatif = (PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif || "";
    let telephone = telephoneMembre.trim().replace(/\s+/g, "");
    if (telephone && !telephone.startsWith("+")) telephone = indicatif ? `${indicatif}${telephone}` : telephone;
    // Le téléphone est optionnel : il ne sert qu'à construire le lien WhatsApp ci-dessous, pas
    // à authentifier le membre — c'est le code d'invitation qui joue ce rôle.
    setBusyMembre(true);
    const { data, error } = await supabase.rpc("org_membre_inviter", { p_libelle: telephone || null });
    setBusyMembre(false);
    if (error) {
      const msg = error.message || "";
      setErreurMembre(
        /organisation_non_validee/.test(msg) ? "Seule une organisation validée peut ajouter des membres." :
        "Impossible d'ajouter ce membre pour le moment."
      );
      return;
    }
    const code = data && data[0] && data[0].code;
    setPaysMembre(""); setTelephoneMembre("");
    setDernierMembreInvite({ code, telephone });
    logActivity("membre_organisation_invite", "organisations", org.id, code);
    chargerMembres(org);
  }

  function lienInvitationMembre(code) {
    return `${window.location.origin}${window.location.pathname}?membre_code=${encodeURIComponent(code)}`;
  }
  function ouvrirWhatsappInvitation(code, telephone) {
    const texte = `Tu es invité(e) à rejoindre notre organisation sur EcoVigil. Ouvre ce lien et connecte-toi avec ton code d'invitation : ${lienInvitationMembre(code)} (code : ${code})`;
    const numero = (telephone || "").replace(/[^0-9]/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texte)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function retirerMembre(m) {
    setBusyRetraitMembreId(m.id);
    const { error } = await supabase.rpc("org_membre_retirer", { p_membre_id: m.id });
    setBusyRetraitMembreId(null);
    if (!error) {
      logActivity("membre_organisation_retire", "organisations", org.id, m.telephone || m.email || m.code || m.id);
      chargerMembres(org);
    }
  }

  async function charger() {
    // Le compte principal se connecte toujours par e-mail ; sans e-mail de session (cas d'un
    // membre confirmé par code d'invitation, identifié par user_id — session possiblement
    // anonyme), on saute directement à la recherche via org_membres.
    let orgData = null;
    if (organisationEmail) {
      const res = await supabase.from("organisations").select("*").eq("email", organisationEmail).eq("is_deleted", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
      orgData = res.data;
    }
    let proprietaire = true;
    if (!orgData) {
      // Pas le compte principal : vérifie s'il s'agit d'un membre confirmé (statut 'actif'),
      // identifié par e-mail (tout premiers membres) ou par user_id (membres par code).
      let membreQuery = supabase.from("org_membres").select("organisation_id").eq("statut", "actif").limit(1);
      membreQuery = organisationEmail ? membreQuery.eq("email", organisationEmail) : membreQuery.eq("user_id", organisationUserId);
      const { data: membreData } = organisationEmail || organisationUserId ? await membreQuery.maybeSingle() : { data: null };
      if (membreData) {
        const { data: orgViaMembre } = await supabase.from("organisations").select("*").eq("id", membreData.organisation_id).eq("is_deleted", false).maybeSingle();
        orgData = orgViaMembre;
        proprietaire = false;
      }
    }
    if (!orgData) return;
    setEstProprietaire(proprietaire);
    setOrg(orgData);
    chargerBenevoles(orgData);
    chargerArbres(orgData);
    chargerProjets(orgData);
    chargerGroupesAffilies(orgData);
    chargerZoneReboisement(orgData);
    chargerMembres(orgData);
    const [{ data: problemes }, { data: defis }] = await Promise.all([
      supabase.from("env_problemes").select("code, defi_id"),
      supabase.from("env_defis").select("id, nom").in("id", orgData.defis && orgData.defis.length ? orgData.defis : ["00000000-0000-0000-0000-000000000000"]),
    ]);
    const idxNoms = {};
    (defis || []).forEach(d => { idxNoms[d.id] = champTexte(d.nom) || d.id; });
    setDefisNoms(idxNoms);
    const codesDomaine = (problemes || []).filter(p => (orgData.defis || []).includes(p.defi_id)).map(p => p.code);
    if (codesDomaine.length === 0) { setSignalements([]); return; }
    let requete = supabase.from("signalements").select("*").in("categorie", codesDomaine).eq("is_deleted", false).order("created_at", { ascending: false }).limit(300);
    // Un citoyen bénévole indépendant (non assigné à une organisation) reste hors de la vue
    // "Espace organisation" d'une ONG — ses signalements restent les siens. Le gouvernement,
    // lui, garde ses pleins droits et voit tout, comme avant cette fonctionnalité.
    if (orgData.type !== "gouvernement") {
      const { data: mesB } = await supabase.from("benevoles").select("id").eq("organisation_id", orgData.id).eq("is_deleted", false);
      const ids = (mesB || []).map(b => b.id);
      if (ids.length === 0) { setSignalements([]); return; }
      requete = requete.in("benevole_id", ids);
    }
    const { data: sigs } = await requete;
    setSignalements(sigs || []);
  }
  useEffect(() => { charger(); }, [organisationEmail, organisationUserId]);

  async function assignerBenevole(b) {
    const groupeId = assignationGroupe[b.id];
    if (!groupeId) { alert("Choisis d'abord un groupe de terrain pour ce bénévole."); return; }
    setBusyAssign(b.id);
    const { error } = await supabase.rpc("benevole_assigner_groupe", { p_benevole_id: b.id, p_groupe_id: groupeId });
    setBusyAssign(null);
    if (!error) {
      setAssignationGroupe(prev => { const next = { ...prev }; delete next[b.id]; return next; });
      charger();
      chargerGroupesAffilies(org);
    } else {
      alert("Action refusée par le serveur (ce bénévole est peut-être déjà assigné ailleurs, ou le groupe choisi n'existe plus).");
    }
  }
  async function retirerBenevole(b) {
    setBusyAssign(b.id);
    // Retire aussi le bénévole des groupes de cette organisation : l'appartenance au groupe
    // découlait de l'affiliation, elle ne doit pas y survivre.
    const { error } = await supabase.rpc("benevole_retirer_organisation", { p_benevole_id: b.id });
    setBusyAssign(null);
    if (!error) { charger(); chargerGroupesAffilies(org); } else { alert("Action refusée par le serveur."); }
  }

  async function resoudre(s) {
    const { error } = await supabase.from("signalements").update({ statut: "resolu" }).eq("id", s.id);
    if (!error) {
      charger();
      if (s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: `Ton signalement a été résolu par ${org.nom || "une organisation partenaire"}.`,
          lien: "carte",
        }).catch(() => {});
      }
    } else alert("Action refusée par le serveur.");
  }
  async function valider(s) {
    const { error } = await supabase.from("signalements").update({ valide: true }).eq("id", s.id);
    if (!error) {
      charger();
      if (s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: "Ton signalement a été validé et pris en compte par l'équipe.",
          lien: "carte",
        }).catch(() => {});
      }
    } else alert("Action refusée par le serveur.");
  }

  async function publierActualite(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!titreActu.trim() || !contenuActu.trim()) return;
    setBusyActu(true); setMessageActu("");
    const { error } = await supabase.from("actualites").insert({
      titre: titreActu.trim(), contenu: contenuActu.trim(), urgent: urgentActu,
      auteur_organisation_id: org.id, auteur_nom: org.nom,
    }).returning(false);
    setBusyActu(false);
    if (error) { setMessageActu("Échec : " + (error.message || "erreur inconnue")); return; }
    setTitreActu(""); setContenuActu(""); setUrgentActu(false);
    setMessageActu("Actualité publiée.");
  }

  async function toggleSuppressionArbreOrg(a) {
    if (a.is_deleted) {
      const { error } = await supabase.from("arbres").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", a.id);
      if (error) { alert("Restauration refusée par le serveur."); return; }
    } else {
      if (!confirm(`Retirer "${a.nom || "cet arbre"}" de vos plantations (ex. faux arbre planté par erreur) ? Il pourra être restauré ensuite.`)) return;
      const { error } = await supabase.from("arbres").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: organisationEmail }).eq("id", a.id);
      if (error) { alert("Suppression refusée par le serveur."); return; }
    }
    chargerArbres(org);
  }
  function planterArbreOrganisation() {
    setErreurArbre("");
    if (!nomArbre.trim()) { setErreurArbre("Le nom/l'essence de l'arbre est requis."); return; }
    const finalize = async (lat, lng) => {
      setBusyArbre(true);
      try {
        const photo_url = await uploadPhotoGeneric(photoArbre, "arbres");
        const { error } = await supabase.from("arbres").insert({
          nom: nomArbre.trim(), photo_url, lat, lng,
          organisation_id: org.id, device_id: DEVICE_ID,
          valide: false, publie: false, is_deleted: false,
        });
        if (error) throw error;
        setNomArbre(""); setPhotoArbre(null); setShowFormArbre(false); setGpsFixArbre(null);
        chargerArbres(org);
      } catch (err) {
        setErreurArbre("Échec de l'enregistrement : " + (err.message || "erreur inconnue"));
      } finally {
        setBusyArbre(false);
      }
    };
    if (gpsFixArbre && gpsFixArbre.lat != null && gpsFixArbre.lng != null) {
      finalize(gpsFixArbre.lat, gpsFixArbre.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
    }
  }

  if (!org) return <Screen><div style={{ textAlign: "center", padding: 40, color: "var(--c-text-muted)" }}>Chargement…</div></Screen>;

  const colonnes = [
    { key: "id", label: "ID" }, { key: "categorie", label: "Catégorie" }, { key: "urgence", label: "Urgence" },
    { key: "statut", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" }, { key: "date", label: "Date" },
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" },
    { key: "benevole_quartier", label: "Bénévole — Quartier" },
  ];
  const rowsExport = (signalements || []).map(s => ({ ...s, date: new Date(s.created_at).toLocaleDateString("fr-FR") }));

  return (
    <Screen>
      {peutBasculerBenevole && <EspaceSwitch actif="organisation" onBenevole={onBack} onOrganisation={() => {}} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <button onClick={onBack} style={{ padding: 8, borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>
        <SectionTitle sub={org.type === "ong" ? "Espace ONG" : "Espace Gouvernement"}>{org.nom}</SectionTitle>
      </div>

      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 14 }}>
        Domaine(s) : {(org.defis || []).map(id => defisNoms[id] || id).join(", ") || "aucun"}
      </div>

      {estProprietaire && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconUsers size={15} color="var(--c-accent-dark)" />
              <div style={{ fontSize: 13, fontWeight: 600 }}>Membres de l'organisation</div>
            </div>
            {!showFormMembre && (
              <button onClick={() => { setShowFormMembre(true); setErreurMembre(""); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                <IconPlus size={13} /> Ajouter un membre
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Génère un code d'invitation pour un membre : il le saisit dans l'app (« Membre invité par une organisation ? Saisir mon code ») pour accéder à cet Espace Organisation — aucun e-mail ni SMS requis. Le numéro de téléphone est optionnel, il sert juste à préremplir un message WhatsApp.
          </div>

          {showFormMembre && (
            <div style={{ marginBottom: 10 }}>
              {!dernierMembreInvite ? (
                <>
                  <select value={paysMembre} onChange={e => setPaysMembre(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box", background: "var(--c-surface)", color: paysMembre ? "var(--c-text)" : "var(--c-text-muted)" }}>
                    <option value="">Pays (optionnel, pour l'indicatif)</option>
                    {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                      <optgroup key={region} label={region}>
                        {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}{p.indicatif ? ` (${p.indicatif})` : ""}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input value={telephoneMembre} onChange={e => setTelephoneMembre(e.target.value)} inputMode="tel"
                      placeholder={(PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif ? `Téléphone du membre (${(PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif}) — optionnel` : "Téléphone du membre — optionnel"}
                      style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
                    <button onClick={inviterMembre} disabled={busyMembre} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {busyMembre ? "…" : "Générer le code"}
                    </button>
                  </div>
                  <button onClick={() => { setShowFormMembre(false); setErreurMembre(""); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0 }}>
                    Annuler
                  </button>
                  {erreurMembre && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginTop: 6 }}>{erreurMembre}</div>}
                </>
              ) : (
                <div style={{ background: "var(--c-bg)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 6 }}>Code d'invitation généré :</div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 10, fontFamily: "monospace" }}>{dernierMembreInvite.code}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(dernierMembreInvite.code); }} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                      Copier le code
                    </button>
                    {dernierMembreInvite.telephone && (
                      <button onClick={() => ouvrirWhatsappInvitation(dernierMembreInvite.code, dernierMembreInvite.telephone)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                        Envoyer sur WhatsApp
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10 }}>
                    Transmets ce code au membre par le canal de ton choix s'il ne le reçoit pas directement via WhatsApp.
                  </div>
                  <button onClick={() => { setShowFormMembre(false); setDernierMembreInvite(null); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0 }}>
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}

          {membresOrg === null ? (
            <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
          ) : membresOrg.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Aucun membre ajouté pour le moment.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {membresOrg.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg)", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: 12 }}>
                    {m.telephone || m.email || <span style={{ fontFamily: "monospace" }}>{m.code}</span>}
                    <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, color: "#fff", background: m.statut === "actif" ? "var(--c-accent)" : "var(--c-warning)" }}>
                      {m.statut === "actif" ? "Actif" : "En attente"}
                    </span>
                  </div>
                  <button onClick={() => retirerMembre(m)} disabled={busyRetraitMembreId === m.id} aria-label="Retirer" style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}>
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <IconTree size={16} /> Reboisement — Mon Arbre
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Enregistre les arbres plantés dans le cadre de vos projets de reboisement. Chaque arbre est
        associé à {org.nom} et passe en attente de validation par l'administration EcoVigil, comme pour
        les plantations citoyennes.
      </div>

      {/* Étape préalable obligatoire : la surface à reboiser doit être définie (au moins 4 points
          de coordonnées formant un polygone) avant de pouvoir enregistrer des arbres. */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconLayers size={15} color="var(--c-accent-dark)" />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Surface à reboiser</div>
        </div>

        {zoneReboisement === undefined ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : !showEditeurZone && zoneReboisement ? (
          <div>
            <div style={{ fontSize: 12.5, marginBottom: 4 }}>
              Superficie déclarée : <b>{formatSuperficie(zoneReboisement.superficie_m2)}</b> ({zoneReboisement.points.length} points)
            </div>
            {typeof zoneReboisement.superficie_estimee_m2 === "number" && (
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 2 }}>
                Estimation d'après le contour : {formatSuperficie(zoneReboisement.superficie_estimee_m2)}
              </div>
            )}
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10 }}>
              Définie le {new Date(zoneReboisement.date).toLocaleDateString("fr-FR")}
            </div>
            <ZoneReboisementMap points={zoneReboisement.points} superficieAffichee={formatSuperficie(zoneReboisement.superficie_m2)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={ouvrirEditeurZone} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                Redéfinir la surface
              </button>
              <button onClick={supprimerZoneReboisement} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        ) : !showEditeurZone && !zoneReboisement ? (
          <div>
            <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Avant d'enregistrer des arbres, définissez la surface à reboiser en plaçant au moins 4 points de coordonnées délimitant son contour, puis renseignez la superficie réelle du terrain (m² ou ha).
            </div>
            <button onClick={ouvrirEditeurZone} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              <IconPlus size={15} /> Définir la surface à reboiser
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Ajoutez au moins 4 points de coordonnées pour délimiter le contour de la surface.
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={latPointTemp} onChange={e => setLatPointTemp(e.target.value)} placeholder="Latitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <input value={lngPointTemp} onChange={e => setLngPointTemp(e.target.value)} placeholder="Longitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <button onClick={ajouterPointManuel} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                Ajouter
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsPointTemp} compact />
              <button onClick={ajouterPointDepuisGps} disabled={!gpsPointTemp} style={{ marginTop: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: gpsPointTemp ? "var(--c-text)" : "var(--c-text-faint)", fontWeight: 600, fontSize: 11.5, cursor: gpsPointTemp ? "pointer" : "default" }}>
                Ajouter ma position actuelle comme point
              </button>
            </div>

            {erreurZone && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreurZone}</div>}

            {pointsZoneTemp.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {pointsZoneTemp.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg)", borderRadius: 8, padding: "6px 10px", fontSize: 11.5 }}>
                    <span>Point {i + 1} — {formatCoordonnees(p.lat, p.lng, coordFormat)}</span>
                    <button onClick={() => retirerPoint(i)} aria-label="Retirer" style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 2 }}><IconTrash size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            {pointsZoneTemp.length >= 3 && (
              <ZoneReboisementMap
                points={pointsZoneTemp}
                superficieAffichee={formatSuperficie(superficieSaisieEnM2() ?? superficieTempM2)}
              />
            )}

            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 8 }}>
              Estimation d'après le contour {pointsZoneTemp.length < 4 ? "(ajoutez au moins 4 points)" : ""} : {formatSuperficie(superficieTempM2)}
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
              Superficie à reboiser (obligatoire)
            </div>
            <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
              Renseignez la superficie réelle du terrain (ex. relevé topographique ou titre foncier) ; l'estimation ci-dessus n'est qu'indicative.
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={superficieSaisie} onChange={e => setSuperficieSaisie(e.target.value)} placeholder="Superficie" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
              <select value={uniteSuperficieSaisie} onChange={e => setUniteSuperficieSaisie(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, background: "var(--c-surface)", color: "var(--c-text)" }}>
                <option value="m2">m²</option>
                <option value="ha">ha</option>
              </select>
            </div>

            <button onClick={enregistrerZoneReboisement} disabled={pointsZoneTemp.length < 4 || !superficieSaisie.trim()} style={{
              padding: "9px 14px", borderRadius: 10, border: "none",
              background: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
              cursor: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "default" : "pointer", marginRight: 8 }}>
              Enregistrer la surface
            </button>
            <button onClick={() => setShowEditeurZone(false)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {!showFormArbre && zoneReboisement && (
        <button onClick={() => setShowFormArbre(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
          <IconPlus size={16} /> Enregistrer un arbre planté
        </button>
      )}

      {showFormArbre && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <PhotoCaptureButton photo={photoArbre} onChange={setPhotoArbre} label="Ajouter une photo (optionnel)" previewMaxHeight={130} />
          <input value={nomArbre} onChange={e => setNomArbre(e.target.value)} placeholder="Essence / nom de l'arbre (ex : Manguier, Teck…)"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
          {erreurArbre && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{erreurArbre}</div>}
          <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFixArbre} compact />
          <button onClick={planterArbreOrganisation} disabled={busyArbre || !nomArbre.trim()} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: (!nomArbre.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
            cursor: (!nomArbre.trim()) ? "default" : "pointer", marginRight: 8 }}>
            {busyArbre ? "…" : "Enregistrer"}
          </button>
          <button onClick={() => { setShowFormArbre(false); setErreurArbre(""); setNomArbre(""); setPhotoArbre(null); setGpsFixArbre(null); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {mesArbres === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, marginBottom: 20 }}>Chargement…</div>
      ) : mesArbres.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 16, marginBottom: 20 }}>Aucun arbre enregistré pour vos projets de reboisement pour le moment.</div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 8 }}>
            {mesArbres.length} arbre(s) — {mesArbres.filter(a => a.valide).length} validé(s), {mesArbres.filter(a => !a.valide).length} en attente
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mesArbres.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-surface)", borderRadius: 10, padding: "8px 10px", border: "1px solid var(--c-border)", opacity: a.is_deleted ? 0.55 : 1 }}>
                {a.photo_url ? <MediaThumbSmall src={a.photo_url} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--c-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconTree size={16} color="var(--c-text-muted)" /></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.nom}</div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: a.is_deleted ? "#B5451B" : (a.valide ? "#fff" : "var(--c-text-muted)"), background: a.is_deleted ? "var(--c-danger-bg-soft, #fbe4de)" : (a.valide ? "var(--c-accent)" : "var(--c-surface-soft)"), borderRadius: 999, padding: "3px 8px", flexShrink: 0 }}>
                  {a.is_deleted ? "Supprimé" : (a.valide ? "Validé" : "En attente")}
                </span>
                <button onClick={() => toggleSuppressionArbreOrg(a)} aria-label={a.is_deleted ? "Restaurer" : "Supprimer"} title={a.is_deleted ? "Restaurer" : "Retirer (faux arbre)"} style={{ background: "none", border: `1px solid ${a.is_deleted ? "var(--c-border)" : "var(--c-danger-border-soft)"}`, borderRadius: 8, color: a.is_deleted ? "var(--c-accent-dark)" : "#B5451B", cursor: "pointer", padding: 6, flexShrink: 0 }}>
                  {a.is_deleted ? <IconRotateCcw size={14} /> : <IconTrash size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <IconLayers size={16} /> Projets & activités
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Structurez le travail de {org.nom} en projets (ex. reboisement d'un site, campagne de sensibilisation)
        et consignez les activités menées sous chacun — utile pour vos rapports internes et vos partenaires.
      </div>

      {!showFormProjet && (
        <button onClick={() => setShowFormProjet(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
          <IconPlus size={16} /> Nouveau projet
        </button>
      )}

      {showFormProjet && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <input value={nomProjet} onChange={e => setNomProjet(e.target.value)} placeholder="Nom du projet"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={descProjet} onChange={e => setDescProjet(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={lieuProjet} onChange={e => setLieuProjet(e.target.value)} placeholder="Lieu (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={dateDebutProjet} onChange={e => setDateDebutProjet(e.target.value)} type="date" placeholder="Début"
              style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
            <input value={dateFinProjet} onChange={e => setDateFinProjet(e.target.value)} type="date" placeholder="Fin"
              style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 12.5, boxSizing: "border-box" }} />
          </div>
          <input value={budgetProjet} onChange={e => setBudgetProjet(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Budget estimé (optionnel)" inputMode="decimal"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          {erreurProjet && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>{erreurProjet}</div>}
          <button onClick={creerProjet} disabled={busyProjet || !nomProjet.trim()} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: !nomProjet.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
            cursor: !nomProjet.trim() ? "default" : "pointer", marginRight: 8 }}>
            {busyProjet ? "…" : "Créer le projet"}
          </button>
          <button onClick={() => { setShowFormProjet(false); setErreurProjet(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {mesProjets === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, marginBottom: 20 }}>Chargement…</div>
      ) : mesProjets.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 16, marginBottom: 20 }}>Aucun projet créé pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {mesProjets.map(p => {
            const statutLabel = { planifie: "Planifié", en_cours: "En cours", termine: "Terminé", suspendu: "Suspendu" }[p.statut] || p.statut;
            const statutColor = p.statut === "en_cours" ? "var(--c-accent)" : p.statut === "termine" ? "var(--c-text-muted)" : p.statut === "suspendu" ? "#B5451B" : "var(--c-text-secondary)";
            const activites = activitesParProjet[p.id];
            return (
              <div key={p.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div onClick={() => ouvrirProjet(p.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</div>
                    {p.description && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 3 }}>{p.description}</div>}
                    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>
                      {[p.localisation_texte, p.date_debut && new Date(p.date_debut).toLocaleDateString("fr-FR")].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: statutColor === "var(--c-accent)" ? "#fff" : statutColor, background: statutColor === "var(--c-accent)" ? "var(--c-accent)" : "var(--c-surface-soft)", borderRadius: 999, padding: "3px 8px", flexShrink: 0, marginLeft: 8 }}>
                    {statutLabel}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {["planifie", "en_cours", "termine", "suspendu"].filter(s => s !== p.statut).map(s => (
                    <button key={s} onClick={() => changerStatutProjet(p, s)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                      → {{ planifie: "Planifié", en_cours: "En cours", termine: "Terminé", suspendu: "Suspendu" }[s]}
                    </button>
                  ))}
                  <button onClick={() => ouvrirProjet(p.id)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                    {projetOuvert === p.id ? "Masquer les activités" : "Voir les activités"}
                  </button>
                </div>

                {projetOuvert === p.id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border)" }}>
                    {activites === undefined ? (
                      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>
                    ) : activites.length === 0 ? (
                      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 8 }}>Aucune activité consignée.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                        {activites.map(a => (
                          <div key={a.id} style={{ background: "var(--c-bg)", borderRadius: 8, padding: "6px 8px" }}>
                            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{a.titre}</div>
                            <div style={{ fontSize: 10, color: "var(--c-text-muted)" }}>{new Date(a.date_debut).toLocaleDateString("fr-FR")}{a.type ? ` · ${a.type}` : ""}</div>
                            {a.description && <div style={{ fontSize: 10.5, color: "var(--c-text-secondary)", marginTop: 2 }}>{a.description}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {showFormActivite === p.id ? (
                      <div style={{ background: "var(--c-bg)", borderRadius: 10, padding: 10 }}>
                        <input value={titreActivite} onChange={e => setTitreActivite(e.target.value)} placeholder="Titre de l'activité"
                          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <select value={typeActivite} onChange={e => setTypeActivite(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12 }}>
                            <option value="activite">Activité</option>
                            <option value="formation">Formation</option>
                            <option value="sensibilisation">Sensibilisation</option>
                            <option value="plantation">Plantation</option>
                            <option value="reunion">Réunion</option>
                          </select>
                          <input value={dateActivite} onChange={e => setDateActivite(e.target.value)} type="date"
                            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12 }} />
                        </div>
                        <textarea value={descActivite} onChange={e => setDescActivite(e.target.value)} rows={2} placeholder="Détails (optionnel)"
                          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
                        <button onClick={() => creerActivite(p.id)} disabled={busyActivite || !titreActivite.trim() || !dateActivite} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: (!titreActivite.trim() || !dateActivite) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer", marginRight: 6 }}>
                          {busyActivite ? "…" : "Ajouter"}
                        </button>
                        <button onClick={() => setShowFormActivite(null)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 11.5, cursor: "pointer" }}>Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowFormActivite(p.id)} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-muted)", cursor: "pointer" }}>
                        + Consigner une activité
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IconUsers size={16} /> Groupes de terrain</span>
        <button onClick={() => setShowCreerGroupeOrg(v => !v)} style={{ fontSize: 11.5, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: showCreerGroupeOrg ? "var(--c-surface-soft)" : "var(--c-accent-dark)", color: showCreerGroupeOrg ? "var(--c-text-secondary)" : "#fff", fontWeight: 600, cursor: "pointer" }}>
          {showCreerGroupeOrg ? "Annuler" : "+ Créer un groupe"}
        </button>
      </div>
      {showCreerGroupeOrg && (
        <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <input value={nomGroupeOrg} onChange={e => setNomGroupeOrg(e.target.value)} placeholder="Nom du groupe (ex : Équipe reboisement Nord)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }} />
          <input value={objectifGroupeOrg} onChange={e => setObjectifGroupeOrg(e.target.value)} placeholder="Objectif (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6, boxSizing: "border-box" }} />
          <textarea value={descGroupeOrg} onChange={e => setDescGroupeOrg(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          {erreurCreerGroupeOrg && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>{erreurCreerGroupeOrg}</div>}
          <button onClick={creerGroupeOrg} disabled={busyCreerGroupeOrg || !nomGroupeOrg.trim()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: !nomGroupeOrg.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {busyCreerGroupeOrg ? "…" : "Créer le groupe"}
          </button>
        </div>
      )}
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Les groupes que tu crées sont automatiquement affiliés. Un bénévole de {org.nom} qui rejoint
        un groupe existant peut aussi t'être proposé via un groupe qu'il crée lui-même et affilie par code.
      </div>
      {erreurAffiliation && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{erreurAffiliation}</div>}

      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Demandes en attente ({(demandesAffiliation || []).length})</div>
      {demandesAffiliation === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, marginBottom: 16 }}>Chargement…</div>
      ) : demandesAffiliation.length === 0 ? (
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", padding: "4px 0 12px" }}>Aucune demande en attente.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {demandesAffiliation.map(g => (
            <div key={g.id} style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 12, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nom}</div>
                {g.objectif && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => confirmerAffiliation(g.id)} disabled={busyAffiliationId === g.id} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  {busyAffiliationId === g.id ? "…" : "Affilier"}
                </button>
                <button onClick={() => refuserAffiliation(g.id)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 4 }}><IconTrash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Groupes affiliés ({(groupesAffilies || []).length})</div>
      {groupesAffilies === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, marginBottom: 20 }}>Chargement…</div>
      ) : groupesAffilies.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 12, marginBottom: 20 }}>Aucun groupe affilié pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {groupesAffilies.map(g => (
            <div key={g.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => ouvrirGroupeOrg(g.id)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nom}</div>
                  {g.objectif && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
                  {g.objectifs_atteints && <div style={{ fontSize: 10.5, color: "var(--c-accent-dark)", fontWeight: 600, marginTop: 4 }}>✓ Objectifs atteints</div>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); retirerAffiliation(g.id); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}><IconTrash size={13} /></button>
              </div>
              {groupeOuvertOrg === g.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border)" }}>
                  {detailGroupeOrg === null ? (
                    <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 4 }}>Missions récentes</div>
                      {detailGroupeOrg.missions.length === 0 ? (
                        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>Aucune mission enregistrée.</div>
                      ) : detailGroupeOrg.missions.map(m => (
                        <div key={m.id} style={{ fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
                          <span>{m.titre}</span>
                          <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>{{ a_faire: "À faire", en_cours: "En cours", termine: "Terminé" }[m.statut] || m.statut}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--c-text-secondary)", margin: "8px 0 4px" }}>Journal d'activité</div>
                      {detailGroupeOrg.log.length === 0 ? (
                        <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>Aucune action enregistrée.</div>
                      ) : detailGroupeOrg.log.map(a => (
                        <div key={a.id} style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 2 }}>
                          {new Date(a.created_at).toLocaleDateString("fr-FR")} — {AUDIT_LABELS[a.action] || a.action}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Signalements de votre domaine</div>
      {signalements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : signalements.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 20 }}>Aucun signalement dans votre domaine pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {signalements.map(s => {
            const cat = categorieMeta(s.categorie);
            return (
              <div key={s.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{cat.label}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: s.statut === "resolu" ? "var(--c-accent)" : "#B5451B" }}>{s.statut === "resolu" ? "Résolu" : "En attente"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 4 }}>{s.description}</div>
                {s.benevole_nom && (
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>
                    Signalé par <strong>{s.benevole_nom}</strong>
                    {(s.benevole_ville || s.benevole_pays) && <> — {[s.benevole_ville, s.benevole_pays].filter(Boolean).join(", ")}</>}
                    {s.benevole_quartier && <> ({s.benevole_quartier})</>}
                    {s.benevole_contact && <> · {s.benevole_contact}</>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {!s.valide && <button onClick={() => valider(s)} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}>Valider</button>}
                  {s.statut !== "resolu" && <button onClick={() => resoudre(s)} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer" }}>Marquer résolu</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>Mes bénévoles{estGouvernement ? " (tous — droits gouvernementaux)" : ""}</div>
      {!estGouvernement && org.code_inscription && (
        <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
          Votre code d'inscription : <strong>{org.code_inscription}</strong> — communiquez-le à vos bénévoles pour qu'ils le saisissent à leur inscription.
        </div>
      )}
      <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>
        {estGouvernement
          ? "En tant qu'organisation gouvernementale, vous voyez tous les signalements sans restriction."
          : "Seuls les bénévoles ayant saisi votre code d'inscription apparaissent ici. Un bénévole indépendant (sans code, ou avec le code d'une autre organisation) reste invisible dans votre espace."}
      </div>
      {mesBenevoles === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {mesBenevoles.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Assignés ({mesBenevoles.length})</div>
              {mesBenevoles.map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{b.nom}</div>
                    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
                  </div>
                  <button onClick={() => retirerBenevole(b)} disabled={busyAssign === b.id} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>{estGouvernement ? "Non assignés" : "Éligibles par votre code, à assigner"} ({(benevolesDisponibles || []).length})</div>
          {(benevolesDisponibles || []).length === 0 ? (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{estGouvernement ? "Aucun bénévole non assigné pour le moment." : "Aucun bénévole n'a encore utilisé votre code."}</div>
          ) : (groupesAffilies || []).length === 0 ? (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Crée d'abord un groupe de terrain ci-dessus pour pouvoir y assigner des bénévoles.</div>
          ) : (benevolesDisponibles || []).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{b.nom}</div>
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <select value={assignationGroupe[b.id] || ""} onChange={e => setAssignationGroupe(prev => ({ ...prev, [b.id]: e.target.value }))}
                  style={{ fontSize: 10.5, padding: "5px 6px", borderRadius: 8, border: "1px solid var(--c-border)", maxWidth: 120 }}>
                  <option value="">Groupe…</option>
                  {groupesAffilies.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                </select>
                <button onClick={() => assignerBenevole(b)} disabled={busyAssign === b.id || !assignationGroupe[b.id]} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "none", background: !assignationGroupe[b.id] ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", cursor: "pointer" }}>
                  {busyAssign === b.id ? "…" : "Assigner"}
                </button>
              </div>
            </div>
          ))}
          {estGouvernement && benevolesAutresOrg && benevolesAutresOrg.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Déjà assignés à une autre organisation ({benevolesAutresOrg.length})</div>
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 6 }}>Visibles pour information — un bénévole déjà rattaché à une ONG ne peut pas être réassigné.</div>
              {benevolesAutresOrg.map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, opacity: 0.8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{b.nom}</div>
                    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Rapport de votre organisation</div>
      <ExportRow label="Signalements de votre domaine" count={rowsExport.length} columns={colonnes} filenamePrefix={`pace-${org.type}-${(org.nom || "org").replace(/\s+/g, "-")}`} title={`Rapport ${org.nom}`} getRows={() => rowsExport} />

      <div style={{ margin: "20px 0" }}>
        <OrgEnquetes organisationId={org.id} email={organisationEmail} />
      </div>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", margin: "20px 0 10px" }}>Publier une actualité officielle</div>
      <form onSubmit={publierActualite} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14 }}>
        <input required value={titreActu} onChange={e => setTitreActu(e.target.value)} placeholder="Titre"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
        <textarea required value={contenuActu} onChange={e => setContenuActu(e.target.value)} rows={3} placeholder="Contenu"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10 }}>
          <input type="checkbox" checked={urgentActu} onChange={e => setUrgentActu(e.target.checked)} /> Marquer comme urgent
        </label>
        {messageActu && <div style={{ fontSize: 11.5, color: messageActu.startsWith("Échec") ? "#B5451B" : "var(--c-accent)", marginBottom: 8 }}>{messageActu}</div>}
        <button type="button" onClick={publierActualite} disabled={busyActu} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          {busyActu ? "…" : "Publier"}
        </button>
      </form>
    </Screen>
  );
}

function Evenements({ onBack }) {
  const [evenements, setEvenements] = useState(null);
  const [participations, setParticipations] = useState({});
  const [mesParticipations, setMesParticipations] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [lieu, setLieu] = useState("");
  const [dateEv, setDateEv] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [busyParticip, setBusyParticip] = useState(null);

  async function charger() {
    const hier = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("evenements").select("*").gte("date_debut", hier).order("date_debut", { ascending: true });
    setEvenements(data || []);
    const { data: parts } = await supabase.from("evenement_participants").select("evenement_id, device_id");
    const counts = {}; const mine = new Set();
    (parts || []).forEach(p => {
      counts[p.evenement_id] = (counts[p.evenement_id] || 0) + 1;
      if (p.device_id === DEVICE_ID) mine.add(p.evenement_id);
    });
    setParticipations(counts);
    setMesParticipations(mine);
  }
  useEffect(() => { charger(); }, []);

  function creerEvenement() {
    setErreur("");
    if (!titre.trim() || !dateEv) { setErreur("Le titre et la date sont requis."); return; }
    setBusy(true);
    supabase.from("evenements").insert({
      titre: titre.trim(), description: description.trim() || null, lieu: lieu.trim() || null,
      date_debut: new Date(dateEv).toISOString(), device_id: DEVICE_ID,
    }).then(({ error }) => {
      setBusy(false);
      if (error) { setErreur("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setTitre(""); setDescription(""); setLieu(""); setDateEv(""); setShowForm(false);
      charger();
    });
  }

  async function participer(ev) {
    setBusyParticip(ev.id);
    const { error } = await supabase.from("evenement_participants").insert({ evenement_id: ev.id, device_id: DEVICE_ID });
    setBusyParticip(null);
    if (!error) charger(); else alert("Action refusée par le serveur.");
  }
  async function seDesister(ev) {
    setBusyParticip(ev.id);
    const { error } = await supabase.from("evenement_participants").delete().eq("evenement_id", ev.id).eq("device_id", DEVICE_ID);
    setBusyParticip(null);
    if (!error) charger(); else alert("Action refusée par le serveur.");
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconCalendar size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Journées de plantation, sensibilisation, nettoyage… proposées par la communauté.">Événements</SectionTitle>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> Proposer un événement
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre (ex : Journée de plantation au parc X)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Lieu"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <input value={dateEv} onChange={e => setDateEv(e.target.value)} type="datetime-local"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          {erreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
          <button onClick={creerEvenement} disabled={busy || !titre.trim() || !dateEv} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: (!titre.trim() || !dateEv) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
            cursor: (!titre.trim() || !dateEv) ? "default" : "pointer", marginRight: 8 }}>
            {busy ? "…" : "Publier l'événement"}
          </button>
          <button onClick={() => { setShowForm(false); setErreur(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {evenements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : evenements.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 20 }}>Aucun événement à venir pour le moment — sois le premier à en proposer un !</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {evenements.map(ev => {
            const inscrit = mesParticipations.has(ev.id);
            return (
              <div key={ev.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.titre}</div>
                <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 3 }}>
                  {new Date(ev.date_debut).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}{ev.lieu ? ` · ${ev.lieu}` : ""}
                </div>
                {ev.description && <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginTop: 6 }}>{ev.description}</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--c-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <IconUsers size={13} /> {participations[ev.id] || 0} participant(s)
                  </div>
                  <button onClick={() => inscrit ? seDesister(ev) : participer(ev)} disabled={busyParticip === ev.id} style={{
                    fontSize: 11.5, padding: "6px 12px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                    border: inscrit ? "1px solid var(--c-border)" : "none",
                    background: inscrit ? "var(--c-surface)" : "var(--c-accent-dark)",
                    color: inscrit ? "var(--c-text-secondary)" : "#fff" }}>
                    {busyParticip === ev.id ? "…" : inscrit ? "Se désister" : "Participer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

function GroupesTerrain({ onBack, estBenevoleValide }) {
  const [groupes, setGroupes] = useState(null);
  const [groupeSelectionne, setGroupeSelectionne] = useState(null);
  const [membres, setMembres] = useState(null);
  const [missions, setMissions] = useState(null);
  const [auditLog, setAuditLog] = useState(null);

  const [showCreer, setShowCreer] = useState(false);
  const [nomGroupe, setNomGroupe] = useState("");
  const [descGroupe, setDescGroupe] = useState("");
  const [objectifGroupe, setObjectifGroupe] = useState("");
  const [codeOrgGroupe, setCodeOrgGroupe] = useState("");
  const [busyCreer, setBusyCreer] = useState(false);
  const [erreurCreer, setErreurCreer] = useState("");

  const [codeRejoindre, setCodeRejoindre] = useState("");
  const [busyRejoindre, setBusyRejoindre] = useState(false);
  const [erreurRejoindre, setErreurRejoindre] = useState("");

  const [showCreerMission, setShowCreerMission] = useState(false);
  const [titreMission, setTitreMission] = useState("");
  const [descMission, setDescMission] = useState("");
  const [echeanceMission, setEcheanceMission] = useState("");
  const [assigneMission, setAssigneMission] = useState("");
  const [busyMission, setBusyMission] = useState(false);

  async function chargerGroupes() {
    const { data: adhesions } = await supabase.from("gt_membres").select("groupe_id").eq("device_id", DEVICE_ID).eq("statut", "actif");
    const ids = (adhesions || []).map(a => a.groupe_id);
    if (ids.length === 0) { setGroupes([]); return; }
    const { data } = await supabase.from("gt_groupes").select("*, organisations(nom)").in("id", ids).eq("is_deleted", false).order("created_at", { ascending: false });
    setGroupes(data || []);
  }
  useEffect(() => { chargerGroupes(); }, []);

  // Rafraîchissement automatique pendant qu'un groupe est ouvert : sans ça, l'action d'un autre
  // membre (mission terminée, nouveau membre...) ne serait visible qu'en quittant puis rouvrant
  // le groupe. Simple sondage (comme la cloche de notifications) plutôt qu'un abonnement temps
  // réel — suffisant à cette fréquence et cohérent avec le reste de l'app.
  useEffect(() => {
    if (!groupeSelectionne) return;
    const t = setInterval(() => selectionnerGroupe(groupeSelectionne), 15000);
    return () => clearInterval(t);
  }, [groupeSelectionne]);

  async function selectionnerGroupe(id) {
    setGroupeSelectionne(id);
    setMembres(null); setMissions(null); setAuditLog(null);
    const [{ data: m }, { data: mi }, { data: log }] = await Promise.all([
      supabase.from("gt_membres").select("*").eq("groupe_id", id).eq("statut", "actif").order("joined_at", { ascending: true }),
      supabase.from("gt_missions").select("*").eq("groupe_id", id).order("created_at", { ascending: false }),
      supabase.from("gt_audit_log").select("*").eq("groupe_id", id).order("created_at", { ascending: false }).limit(20),
    ]);
    setMembres(m || []);
    setMissions(mi || []);
    setAuditLog(log || []);
  }

  function creerGroupe() {
    setErreurCreer("");
    if (!estBenevoleValide) { setErreurCreer("Il faut être bénévole validé pour créer un groupe — inscris-toi depuis l'accueil, puis reviens une fois ton compte validé."); return; }
    if (!nomGroupe.trim()) { setErreurCreer("Le nom du groupe est requis."); return; }
    setBusyCreer(true);
    // La création passe par une fonction serveur (RPC) qui résout le code d'organisation
    // (si saisi) et crée le groupe + l'adhésion du créateur en une seule opération atomique —
    // jamais le client, pour qu'il soit impossible de s'auto-affilier en devinant/forgeant
    // un organisation_id. L'affiliation reste en attente jusqu'à confirmation de l'organisation.
    const groupeId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid() + "-" + uid());
    supabase.rpc("gt_groupe_creer", {
      p_id: groupeId, p_nom: nomGroupe.trim(), p_description: descGroupe.trim() || null,
      p_objectif: objectifGroupe.trim() || null, p_device_id: DEVICE_ID, p_code: codeOrgGroupe.trim() || null,
    }).then(({ error }) => {
      setBusyCreer(false);
      if (error) {
        if (error.message && error.message.includes("code_invalide")) {
          setErreurCreer("Le code d'organisation saisi est incorrect ou n'est lié à aucune organisation.");
        } else {
          setErreurCreer("Échec : " + (error.message || "erreur inconnue"));
        }
        return;
      }
      setNomGroupe(""); setDescGroupe(""); setObjectifGroupe(""); setCodeOrgGroupe(""); setShowCreer(false);
      chargerGroupes();
    });
  }

  function rejoindreGroupe() {
    setErreurRejoindre("");
    if (!estBenevoleValide) { setErreurRejoindre("Il faut être bénévole validé pour rejoindre un groupe — inscris-toi depuis l'accueil, puis reviens une fois ton compte validé."); return; }
    if (!codeRejoindre.trim()) return;
    setBusyRejoindre(true);
    supabase.from("gt_groupes").select("id, nom").eq("code_groupe", codeRejoindre.trim().toUpperCase()).eq("is_deleted", false).eq("statut", "actif").maybeSingle()
      .then(({ data: grp, error }) => {
        if (error || !grp) { setBusyRejoindre(false); setErreurRejoindre("Code introuvable. Vérifie-le auprès du responsable du groupe."); return; }
        supabase.from("gt_membres").insert({
          groupe_id: grp.id, device_id: DEVICE_ID, role: "membre", statut: "actif", joined_at: new Date().toISOString(),
        }).then(({ error: errM }) => {
          setBusyRejoindre(false);
          if (errM) { setErreurRejoindre(errM.code === "23505" ? "Tu es déjà membre de ce groupe." : "Échec : " + errM.message); return; }
          logGroupeAudit(grp.id, "membre_rejoint", "gt_membres", DEVICE_ID);
          setCodeRejoindre("");
          chargerGroupes();
          // Avertit les membres déjà présents — sans ça, l'arrivée de quelqu'un ne se remarquerait
          // qu'en rouvrant le groupe par hasard.
          supabase.from("gt_membres").select("device_id").eq("groupe_id", grp.id).eq("statut", "actif").then(({ data: existants }) => {
            (existants || []).filter(e => e.device_id !== DEVICE_ID).forEach(e => {
              supabase.from("notifications").insert({
                destinataire: e.device_id,
                message: `Un nouveau membre a rejoint le groupe "${grp.nom}".`,
                lien: "groupes_terrain",
              }).catch(() => {});
            });
          });
        });
      });
  }

  function creerMission() {
    if (!titreMission.trim()) return;
    setBusyMission(true);
    supabase.from("gt_missions").insert({
      groupe_id: groupeSelectionne, titre: titreMission.trim(), description: descMission.trim() || null,
      echeance: echeanceMission || null, assigne_a: assigneMission || null, cree_par: DEVICE_ID,
    }).select().single().then(({ data, error }) => {
      setBusyMission(false);
      if (error) { alert("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      const detail = assigneMission ? `"${titreMission.trim()}" assignée à ${assigneMission === DEVICE_ID ? "soi-même" : assigneMission.slice(0, 6)}` : `"${titreMission.trim()}" (non assignée)`;
      logGroupeAudit(groupeSelectionne, "mission_creee", "gt_missions", data.id, detail);
      if (assigneMission && assigneMission !== DEVICE_ID) {
        supabase.from("notifications").insert({
          destinataire: assigneMission,
          message: `Nouvelle mission assignée : "${titreMission.trim()}"`,
          lien: "groupes_terrain",
        }).catch(() => {});
      }
      setTitreMission(""); setDescMission(""); setEcheanceMission(""); setAssigneMission(""); setShowCreerMission(false);
      selectionnerGroupe(groupeSelectionne);
    });
  }

  async function changerStatutMission(m, statut) {
    const { error } = await supabase.from("gt_missions").update({ statut, updated_at: new Date().toISOString() }).eq("id", m.id);
    if (error) { alert("Action refusée par le serveur."); return; }
    logGroupeAudit(groupeSelectionne, `mission_${statut}`, "gt_missions", m.id, m.titre);
    // Notifie les autres membres uniquement pour l'étape qui compte vraiment ("terminé") — pas
    // à chaque changement de statut, pour ne pas noyer le groupe de notifications.
    if (statut === "termine" && membres) {
      membres.filter(mem => mem.device_id !== DEVICE_ID).forEach(mem => {
        supabase.from("notifications").insert({
          destinataire: mem.device_id,
          message: `Mission "${m.titre}" marquée terminée par un membre du groupe.`,
          lien: "groupes_terrain",
        }).catch(() => {});
      });
    }
    selectionnerGroupe(groupeSelectionne);
  }

  const groupeInfo = groupes && groupes.find(g => g.id === groupeSelectionne);

  // Vue détail d'un groupe (membres + missions)
  if (groupeSelectionne && groupeInfo) {
    const statutLabel = { a_faire: "À faire", en_cours: "En cours", termine: "Terminé" };
    return (
      <Screen>
        <button onClick={() => setGroupeSelectionne(null)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Mes groupes</button>
        <SectionTitle sub={groupeInfo.objectif || "Groupe de terrain"}>{groupeInfo.nom}</SectionTitle>
        <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", margin: "10px 0" }}>
          Code du groupe : <strong>{groupeInfo.code_groupe}</strong> — partage-le pour inviter d'autres bénévoles.
        </div>
        {groupeInfo.organisation_id && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: groupeInfo.organisation_confirmee ? "var(--c-text-secondary)" : "var(--c-warning-text)", marginBottom: 10 }}>
            <IconShield size={13} color={groupeInfo.organisation_confirmee ? "var(--c-accent)" : "var(--c-warning)"} />
            {groupeInfo.organisation_confirmee
              ? <>Affilié à <strong>{groupeInfo.organisations ? groupeInfo.organisations.nom : "l'organisation"}</strong></>
              : <>Affiliation à <strong>{groupeInfo.organisations ? groupeInfo.organisations.nom : "l'organisation"}</strong> en attente de confirmation</>}
          </div>
        )}

        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)", margin: "14px 0 8px" }}>Membres ({(membres || []).length})</div>
        {membres === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {membres.map(m => (
              <span key={m.id} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                {m.device_id === DEVICE_ID ? "Toi" : `Membre ${m.device_id.slice(0, 6)}`}{m.role === "admin" ? " · responsable" : ""}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 8px" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)" }}>Missions</div>
          {!showCreerMission && (
            <button onClick={() => setShowCreerMission(true)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Nouvelle</button>
          )}
        </div>

        {showCreerMission && (
          <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 12 }}>
            <input value={titreMission} onChange={e => setTitreMission(e.target.value)} placeholder="Titre de la mission"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box" }} />
            <textarea value={descMission} onChange={e => setDescMission(e.target.value)} rows={2} placeholder="Détails (optionnel)"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <select value={assigneMission} onChange={e => setAssigneMission(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5 }}>
                <option value="">Non assignée</option>
                {(membres || []).map(m => <option key={m.id} value={m.device_id}>{m.device_id === DEVICE_ID ? "Toi" : `Membre ${m.device_id.slice(0, 6)}`}</option>)}
              </select>
              <input value={echeanceMission} onChange={e => setEcheanceMission(e.target.value)} type="date"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5 }} />
            </div>
            <button onClick={creerMission} disabled={busyMission || !titreMission.trim()} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: !titreMission.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer", marginRight: 6 }}>
              {busyMission ? "…" : "Créer"}
            </button>
            <button onClick={() => setShowCreerMission(false)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 11.5, cursor: "pointer" }}>Annuler</button>
          </div>
        )}

        {missions === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : missions.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", padding: 12, textAlign: "center" }}>Aucune mission pour ce groupe.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missions.map(m => (
              <div key={m.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.titre}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.statut === "termine" ? "var(--c-text-muted)" : m.statut === "en_cours" ? "#fff" : "var(--c-text-secondary)", background: m.statut === "en_cours" ? "var(--c-accent)" : "var(--c-surface-soft)", borderRadius: 999, padding: "3px 8px", flexShrink: 0, marginLeft: 8 }}>
                    {statutLabel[m.statut] || m.statut}
                  </span>
                </div>
                {m.description && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 4 }}>{m.description}</div>}
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>
                  {m.assigne_a && (m.assigne_a === DEVICE_ID ? "Assignée à toi" : `Assignée à ${m.assigne_a.slice(0, 6)}`)}
                  {m.echeance && ` · échéance ${new Date(m.echeance).toLocaleDateString("fr-FR")}`}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {["a_faire", "en_cours", "termine"].filter(s => s !== m.statut).map(s => (
                    <button key={s} onClick={() => changerStatutMission(m, s)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                      → {statutLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)", margin: "18px 0 8px" }}>Journal d'activité</div>
        {auditLog === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : auditLog.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune action enregistrée pour le moment.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {auditLog.map(a => (
              <div key={a.id} style={{ fontSize: 11, color: "var(--c-text-secondary)", borderLeft: "2px solid var(--c-border)", paddingLeft: 8 }}>
                <span style={{ fontWeight: 600 }}>{AUDIT_LABELS[a.action] || a.action}</span>
                {a.detail ? ` — ${a.detail}` : ""}
                <div style={{ fontSize: 10, color: "var(--c-text-muted)" }}>{new Date(a.created_at).toLocaleString("fr-FR")} · {a.acteur === DEVICE_ID ? "toi" : a.acteur.includes("@") ? a.acteur : a.acteur.slice(0, 6)}</div>
              </div>
            ))}
          </div>
        )}
      </Screen>
    );
  }

  // Vue liste "Mes groupes"
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconUsers size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Coordonne des missions de terrain avec d'autres bénévoles.">Groupes de terrain</SectionTitle>
      </div>

      {!estBenevoleValide && (
        <div style={{ fontSize: 12, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
          Il faut être <strong>bénévole validé</strong> pour créer ou rejoindre un groupe. Inscris-toi depuis l'écran d'accueil, puis reviens ici une fois ton compte validé par un admin.
        </div>
      )}

      <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Rejoindre avec un code</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={codeRejoindre} onChange={e => setCodeRejoindre(e.target.value.toUpperCase())} placeholder="CODE"
            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 13, letterSpacing: 1, boxSizing: "border-box" }} />
          <button onClick={rejoindreGroupe} disabled={busyRejoindre || !codeRejoindre.trim()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: !codeRejoindre.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {busyRejoindre ? "…" : "Rejoindre"}
          </button>
        </div>
        {erreurRejoindre && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginTop: 6 }}>{erreurRejoindre}</div>}
      </div>

      {!showCreer ? (
        <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> Créer un nouveau groupe
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <input value={nomGroupe} onChange={e => setNomGroupe(e.target.value)} placeholder="Nom du groupe"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <input value={objectifGroupe} onChange={e => setObjectifGroupe(e.target.value)} placeholder="Objectif (ex : Nettoyage du littoral de X)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={descGroupe} onChange={e => setDescGroupe(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={codeOrgGroupe} onChange={e => setCodeOrgGroupe(e.target.value.toUpperCase())} placeholder="Code d'organisation (optionnel, ex : ECO01)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, letterSpacing: 0.5, marginBottom: 4, boxSizing: "border-box" }} />
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>
            Si votre groupe travaille avec une organisation, saisissez son code d'inscription : elle pourra suivre vos activités une fois qu'elle aura confirmé l'affiliation.
          </div>
          {erreurCreer && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>{erreurCreer}</div>}
          <button onClick={creerGroupe} disabled={busyCreer || !nomGroupe.trim()} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: !nomGroupe.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginRight: 8 }}>
            {busyCreer ? "…" : "Créer le groupe"}
          </button>
          <button onClick={() => { setShowCreer(false); setErreurCreer(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {groupes === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : groupes.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 16 }}>Tu ne fais partie d'aucun groupe pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groupes.map(g => (
            <button key={g.id} onClick={() => selectionnerGroupe(g.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nom}</div>
              {g.objectif && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
              {g.organisations && <div style={{ fontSize: 10, color: "var(--c-accent-dark)", marginTop: 4, fontWeight: 600 }}>Affilié à {g.organisations.nom}</div>}
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}

// Module dédié aux bénévoles : formulaires "terrain" que les organisations auxquelles ils sont
// affiliés leur ont confiés (créés depuis OrgEnquetes, mode_collecte "terrain"). Distinct du
// module citoyen supprimé — jamais auto-déclaratif, et rempli à répétition (un bénévole interroge
// de nombreux citoyens successivement, une ligne de participation par interview).
function EnquetesTerrain({ onBack }) {
  const [terrainListe, setTerrainListe] = useState(null);
  const [terrainSelection, setTerrainSelection] = useState(null);
  const [terrainQuestions, setTerrainQuestions] = useState(null);
  const [terrainReponses, setTerrainReponses] = useState({});
  const [terrainInstances, setTerrainInstances] = useState({});
  const [terrainCompte, setTerrainCompte] = useState(0);
  const [terrainMerci, setTerrainMerci] = useState(false);
  const [terrainBusy, setTerrainBusy] = useState(false);
  const [terrainErreur, setTerrainErreur] = useState("");
  const suggestionsRef = useRef({});

  // Clé composite question+occurrence : une question simple n'a qu'une occurrence (0) ; une
  // question d'un groupe répétable (ex. "Point de pollution") en a une par répétition ajoutée
  // par le répondant — comme les "repeat groups" de KoboToolbox.
  function cle(qId, instance) { return `${qId}::${instance}`; }

  useEffect(() => {
    (async () => {
      const { data: mesAffiliations } = await supabase.from("benevoles").select("organisation_id").eq("device_id", DEVICE_ID).eq("is_deleted", false).not("organisation_id", "is", null);
      const orgIds = [...new Set((mesAffiliations || []).map(b => b.organisation_id))];
      if (orgIds.length === 0) { setTerrainListe([]); return; }
      const { data } = await supabase.from("enquetes").select("*").eq("mode_collecte", "terrain").eq("statut", "ouverte").in("organisation_id", orgIds).order("created_at", { ascending: false });
      setTerrainListe(data || []);
    })();
  }, []);

  async function ouvrirTerrain(enq) {
    setTerrainSelection(enq);
    setTerrainReponses({});
    setTerrainInstances({});
    setTerrainErreur("");
    setTerrainMerci(false);
    setTerrainCompte(0);
    setTerrainQuestions(null);
    const { data } = await supabase.from("enquete_questions").select("*").eq("enquete_id", enq.id).order("ordre", { ascending: true });
    // Une question "texte" peut porter une réponse suggérée par l'organisation (stockée dans
    // options[0]) : on pré-remplit le champ avec, mais le bénévole reste libre de la corriger
    // si le citoyen interrogé répond différemment. La suggestion ne préremplit que la première
    // occurrence d'un groupe répétable ; les occurrences ajoutées ensuite démarrent vides.
    const suggestions = {};
    (data || []).forEach(q => {
      if (q.type_reponse === "texte" && Array.isArray(q.options) && q.options[0]) suggestions[cle(q.id, 0)] = q.options[0];
    });
    suggestionsRef.current = suggestions;
    setTerrainReponses(suggestions);
    setTerrainQuestions(data || []);
  }
  function setReponseTerrain(qId, instance, val) { setTerrainReponses(prev => ({ ...prev, [cle(qId, instance)]: val })); }
  function toggleChoixMultipleTerrain(qId, instance, opt) {
    setTerrainReponses(prev => {
      const k = cle(qId, instance);
      const cur = Array.isArray(prev[k]) ? prev[k] : [];
      return { ...prev, [k]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
    });
  }
  function ajouterOccurrence(groupe) { setTerrainInstances(prev => ({ ...prev, [groupe]: (prev[groupe] || 1) + 1 })); }
  function retirerDerniereOccurrence(groupe) {
    const count = terrainInstances[groupe] || 1;
    if (count <= 1) return;
    const dernier = count - 1;
    const qIds = (terrainQuestions || []).filter(q => q.groupe_repetable === groupe).map(q => q.id);
    setTerrainReponses(prev => { const next = { ...prev }; qIds.forEach(qid => { delete next[cle(qid, dernier)]; }); return next; });
    setTerrainInstances(prev => ({ ...prev, [groupe]: dernier }));
  }
  // Une question conditionnelle ne s'affiche (et ne compte dans les réponses envoyées) que si la
  // réponse attendue a été donnée à la question dont elle dépend — comme la logique conditionnelle
  // de KoboToolbox. Quand la source de la condition appartient au même groupe répétable, on compare
  // à la réponse de la même occurrence ; sinon (question simple hors groupe) on prend l'occurrence 0.
  function questionVisible(q, instance, valeurs) {
    if (!q.condition_question_id) return true;
    const source = (terrainQuestions || []).find(x => x.id === q.condition_question_id);
    const instanceSource = (source && source.groupe_repetable === q.groupe_repetable) ? instance : 0;
    const rep = valeurs[cle(q.condition_question_id, instanceSource)];
    if (rep === undefined) return false;
    return Array.isArray(rep) ? rep.includes(q.condition_valeur) : String(rep) === q.condition_valeur;
  }
  // Contraintes de validation d'une question (plage numérique ou longueur de texte). Une réponse
  // vide n'est pas vérifiée ici : les contraintes ne s'appliquent qu'à ce qui a été saisi.
  function erreurValidation(q, v) {
    const val = q.validation;
    if (!val || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return null;
    if (val.kind === "nombre") {
      const n = Number(v);
      if (isNaN(n)) return "Saisis un nombre.";
      if (val.min != null && n < val.min) return `Valeur minimale : ${val.min}.`;
      if (val.max != null && n > val.max) return `Valeur maximale : ${val.max}.`;
    } else if (val.kind === "texte") {
      const len = String(v).trim().length;
      if (val.min_len != null && len < val.min_len) return `Au moins ${val.min_len} caractères (${len} saisis).`;
      if (val.max_len != null && len > val.max_len) return `Au plus ${val.max_len} caractères (${len} saisis).`;
    }
    return null;
  }
  async function envoyerInterviewTerrain() {
    if (!terrainSelection) return;
    const violations = [];
    (terrainQuestions || []).forEach(q => {
      if (!q.validation) return;
      const nb = q.groupe_repetable ? (terrainInstances[q.groupe_repetable] || 1) : 1;
      for (let inst = 0; inst < nb; inst++) {
        if (!questionVisible(q, inst, terrainReponses)) continue;
        const err = erreurValidation(q, terrainReponses[cle(q.id, inst)]);
        if (err) violations.push(`« ${q.texte} »${nb > 1 ? " (#" + (inst + 1) + ")" : ""} : ${err}`);
      }
    });
    if (violations.length > 0) { setTerrainErreur("Réponses à corriger avant l'envoi — " + violations.join(" ; ")); return; }
    setTerrainBusy(true);
    setTerrainErreur("");
    // Le bénévole réalise de nombreuses interviews depuis le même appareil : la contrainte
    // d'unicité (une participation par appareil et par enquête) est faite pour le mode citoyen
    // auto-déclaratif, pas pour ça. On donne donc à chaque interview un identifiant synthétique
    // propre, tout en traçant le véritable appareil du bénévole via benevole_device_id — c'est ce
    // qui permet à l'organisation de voir la contribution de chacun de ses bénévoles.
    const idInterview = `${DEVICE_ID}-terrain-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: part, error: errPart } = await supabase.from("enquete_participations")
      .insert({ enquete_id: terrainSelection.id, device_id: idInterview, benevole_device_id: DEVICE_ID }).select().single();
    if (errPart || !part) {
      setTerrainBusy(false);
      setTerrainErreur("Impossible d'enregistrer cette interview. Réessaie.");
      return;
    }
    const questionsById = {}; (terrainQuestions || []).forEach(q => { questionsById[q.id] = q; });
    const lignes = Object.entries(terrainReponses)
      .filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, valeur]) => { const [qId, inst] = k.split("::"); return { qId, instance: Number(inst), valeur }; })
      .filter(({ qId, instance }) => { const q = questionsById[qId]; return !q || questionVisible(q, instance, terrainReponses); })
      .map(({ qId, instance, valeur }) => ({ participation_id: part.id, question_id: qId, instance, valeur: Array.isArray(valeur) ? valeur.join(", ") : String(valeur) }));
    if (lignes.length) await supabase.from("enquete_reponses").insert(lignes);
    setTerrainBusy(false);
    setTerrainCompte(c => c + 1);
    setTerrainMerci(true);
    setTerrainReponses(suggestionsRef.current);
    setTerrainInstances({});
  }

  const champBtn = (actif) => ({
    padding: "8px 12px", borderRadius: 10, border: `1px solid ${actif ? "var(--c-accent-dark)" : "var(--c-border)"}`,
    background: actif ? "var(--c-accent-dark)" : "var(--c-surface)", color: actif ? "#fff" : "var(--c-text)",
    fontSize: 12.5, cursor: "pointer", marginRight: 6, marginBottom: 6,
  });

  function renderChamp(q, instance, valeurs, onSet, onToggle) {
    const v = valeurs[cle(q.id, instance)];
    return (
      <div key={cle(q.id, instance)} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.texte}</div>
        {q.type_reponse === "texte" && (
          <div>
            {instance === 0 && Array.isArray(q.options) && q.options[0] && (
              <div style={{ fontSize: 10.5, color: "var(--c-accent-dark)", marginBottom: 4 }}>Réponse suggérée — modifie-la si le citoyen répond autre chose</div>
            )}
            {q.validation && q.validation.kind === "nombre"
              ? <input type="number" inputMode="decimal" value={v ?? ""} onChange={e => onSet(q.id, instance, e.target.value)}
                  style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif" }} />
              : <textarea value={v || ""} onChange={e => onSet(q.id, instance, e.target.value)} rows={3}
                  style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />}
            {q.validation && (
              <div style={{ fontSize: 10.5, marginTop: 4, color: erreurValidation(q, v) ? "#B5451B" : "var(--c-text-muted)" }}>
                {erreurValidation(q, v) || (q.validation.kind === "nombre"
                  ? `Nombre${q.validation.min != null ? " ≥ " + q.validation.min : ""}${q.validation.max != null ? " ≤ " + q.validation.max : ""}`
                  : `${q.validation.min_len != null ? "Min " + q.validation.min_len : ""}${q.validation.min_len != null && q.validation.max_len != null ? " · " : ""}${q.validation.max_len != null ? "Max " + q.validation.max_len : ""} caractères`)}
              </div>
            )}
          </div>
        )}
        {q.type_reponse === "oui_non" && (
          <div>{["Oui", "Non"].map(opt => (
            <button key={opt} type="button" onClick={() => onSet(q.id, instance, opt)} style={champBtn(v === opt)}>{opt}</button>
          ))}</div>
        )}
        {q.type_reponse === "echelle" && (
          <div>{[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onSet(q.id, instance, n)} style={champBtn(v === n)}>{n}</button>
          ))}</div>
        )}
        {q.type_reponse === "choix_unique" && (
          <div>{(q.options || []).map(opt => (
            <button key={opt} type="button" onClick={() => onSet(q.id, instance, opt)} style={champBtn(v === opt)}>{opt}</button>
          ))}</div>
        )}
        {q.type_reponse === "choix_multiple" && (
          <div>{(q.options || []).map(opt => (
            <button key={opt} type="button" onClick={() => onToggle(q.id, instance, opt)} style={champBtn(Array.isArray(v) && v.includes(opt))}>{opt}</button>
          ))}</div>
        )}
      </div>
    );
  }
  // Regroupe les questions consécutives partageant le même groupe_repetable en un seul bloc
  // répétable ; une question sans groupe reste un bloc "simple" à occurrence unique.
  function partitionnerGroupes(liste) {
    const blocs = []; let i = 0;
    while (i < liste.length) {
      const q = liste[i];
      if (!q.groupe_repetable) { blocs.push({ type: "simple", q }); i++; continue; }
      const nom = q.groupe_repetable, questions = [];
      while (i < liste.length && liste[i].groupe_repetable === nom) { questions.push(liste[i]); i++; }
      blocs.push({ type: "groupe", nom, questions });
    }
    return blocs;
  }
  function ChampsQuestions({ liste, valeurs, onSet, onToggle, instances, onAjouter, onRetirer }) {
    return partitionnerGroupes(liste).map(bloc => {
      if (bloc.type === "simple") {
        return questionVisible(bloc.q, 0, valeurs) ? renderChamp(bloc.q, 0, valeurs, onSet, onToggle) : null;
      }
      const count = instances[bloc.nom] || 1;
      return (
        <div key={bloc.nom} style={{ marginBottom: 16, padding: 12, border: "1px dashed var(--c-border)", borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--c-accent-dark)", marginBottom: 10 }}>{bloc.nom}</div>
          {Array.from({ length: count }).map((_, inst) => (
            <div key={inst} style={{ marginBottom: inst < count - 1 ? 14 : 0, paddingBottom: inst < count - 1 ? 14 : 0, borderBottom: inst < count - 1 ? "1px solid var(--c-border)" : "none" }}>
              {count > 1 && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>{bloc.nom} #{inst + 1}</div>}
              {bloc.questions.filter(q => questionVisible(q, inst, valeurs)).map(q => renderChamp(q, inst, valeurs, onSet, onToggle))}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => onAjouter(bloc.nom)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-accent-dark)", background: "none", color: "var(--c-accent-dark)", fontSize: 12, cursor: "pointer" }}>+ Ajouter « {bloc.nom} »</button>
            {count > 1 && <button type="button" onClick={() => onRetirer(bloc.nom)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>− Retirer la dernière occurrence</button>}
          </div>
        </div>
      );
    });
  }

  if (terrainSelection) {
    return (
      <Screen>
        <button onClick={() => setTerrainSelection(null)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Enquêtes terrain</button>
        <SectionTitle sub="Interview de terrain — à remplir avec le citoyen que tu interroges.">{terrainSelection.titre}</SectionTitle>
        {terrainCompte > 0 && (
          <div style={{ fontSize: 11.5, color: "var(--c-accent-dark)", fontWeight: 600, marginBottom: 12 }}>{terrainCompte} interview{terrainCompte > 1 ? "s" : ""} réalisée{terrainCompte > 1 ? "s" : ""} pour l'instant</div>
        )}
        {terrainMerci ? (
          <div className="pace-fade-in" style={{ textAlign: "center", padding: 20 }}>
            <IconCheck size={20} color="var(--c-accent-dark)" />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-accent-dark)", margin: "8px 0 16px" }}>Interview enregistrée !</div>
            <button onClick={() => setTerrainMerci(false)} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
              Interroger un(e) autre citoyen(ne)
            </button>
          </div>
        ) : terrainQuestions === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement du questionnaire…</div>
        ) : (
          <div>
            <ChampsQuestions liste={terrainQuestions} valeurs={terrainReponses} onSet={setReponseTerrain} onToggle={toggleChoixMultipleTerrain} instances={terrainInstances} onAjouter={ajouterOccurrence} onRetirer={retirerDerniereOccurrence} />
            {terrainErreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 10 }}>{terrainErreur}</div>}
            <button onClick={envoyerInterviewTerrain} disabled={terrainBusy} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", opacity: terrainBusy ? 0.7 : 1 }}>
              {terrainBusy ? "Envoi…" : "Enregistrer cette interview"}
            </button>
          </div>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconSearch size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Formulaires confiés par les organisations auxquelles tu es affilié comme bénévole.">Enquêtes terrain</SectionTitle>
      </div>

      <EnquetesStandard email="" organisationId={null} source="benevole" deviceId={DEVICE_ID} />

      {terrainListe === null ? (
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Chargement…</div>
      ) : terrainListe.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Aucune enquête terrain à réaliser pour le moment.</div>
      ) : (
        terrainListe.map(e => (
          <button key={e.id} onClick={() => ouvrirTerrain(e)} style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: 12, borderRadius: 12,
            border: "1px solid var(--c-accent-dark)", background: "var(--c-surface-soft)", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{e.titre}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-accent-dark)" }}>À réaliser sur le terrain, auprès des citoyens</div>
          </button>
        ))
      )}
    </Screen>
  );
}

function AssistantIA({ onBack, signalements, arbres, observations, actualites }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis l'assistant environnemental d'EcoVigil (mode simplifié, sans IA). Pose-moi une question sur le tri des déchets, le reboisement, la biodiversité, le climat, ou sur les chiffres de l'app (statistiques, ton impact, les actualités)." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const paceStats = useMemo(
    () => buildPaceStatsReplies(signalements, arbres, observations, actualites),
    [signalements, arbres, observations, actualites]
  );

  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", text: findAssistantReply(userText, paceStats) }]);
      setBusy(false);
    }, 400);
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconSparkles size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Mode simplifié, sans IA — réponses par mots-clés.">Assistant de Décisions Environnementales</SectionTitle>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "10px 13px", borderRadius: 14,
              background: m.role === "user" ? "var(--c-accent-dark)" : "var(--c-surface)",
              color: m.role === "user" ? "#fff" : "var(--c-text)",
              border: m.role === "user" ? "none" : "1px solid var(--c-border)", fontSize: 13, lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 13px", borderRadius: 14, background: "var(--c-surface)", border: "1px solid var(--c-border)", fontSize: 13, color: "var(--c-text-muted)" }}>
              …
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ position: "sticky", bottom: 8, background: "var(--c-surface)", borderRadius: 14, padding: 10, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Pose ta question…" rows={1}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 13, fontFamily: "Work Sans, sans-serif", maxHeight: 80 }} />
          <button onClick={send} disabled={busy || !input.trim()} style={{
            background: (busy || !input.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconSend size={14} color="#fff" />
          </button>
        </div>
      </div>
    </Screen>
  );
}


function Confidentialite({ onBack }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <SectionTitle sub="Dernière mise à jour : 27 septembre 2026">À propos & Informations légales</SectionTitle>

      <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 18 }}>
        <IconLogOut size={15} /> Se déconnecter de mon compte
      </button>

      <Section title="À propos d'EcoVigil">
        EcoVigil est une application citoyenne pour l'environnement en Afrique — observer, signaler et protéger, au service de la Plateforme Africaine d'Actions et de Contrôle Environnemental.<br/><br/>
        Conçu par Mansa Diallo.
      </Section>

      <Section title="Responsable du traitement">
        EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental — Conakry, Guinée.<br/>Contact : wassolonmansa97@gmail.com
      </Section>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 4, marginTop: 4 }}>Politique de confidentialité</div>

      <Section title="Données collectées">
        Selon ta façon d'utiliser EcoVigil :<br/><br/>
        <b>En tant que citoyen</b> (identifiant anonyme propre à ton appareil, sans lien avec ton identité civile) : signalements (catégorie, urgence, description, photo, position GPS) ; arbres plantés et observations de biodiversité (espèce, photo, position) ; publications communautaires.<br/><br/>
        <b>En tant que bénévole ou organisation</b> (compte identifié — nom, adresse e-mail, mot de passe, et pour une organisation ses informations d'inscription) : les mêmes contributions que ci-dessus, ainsi que les dossiers d'enquête environnementale que tu crées ou modifies (identification, localisation précise, description du constat, niveau de gravité, impacts évalués, personnes ou structures mentionnées) et les preuves associées (photo, vidéo, document, témoignage écrit, relevé GPS), horodatées et géolocalisées.<br/><br/>
        Dans tous les cas : les brouillons non encore envoyés (enquêtes, signalements) peuvent être conservés temporairement sur ton appareil le temps de retrouver une connexion, avant d'être transmis à nos serveurs.
      </Section>

      <Section title="Pourquoi">
        Faire fonctionner la carte communautaire, calculer tes statistiques et badges, permettre l'instruction et le suivi des dossiers d'enquête, assurer la modération, prévenir les abus. Aucune donnée n'est utilisée à des fins publicitaires ni vendue à un tiers.
      </Section>

      <Section title="Ce qui est public">
        Les signalements validés, les arbres, observations et publications sont visibles par tous les utilisateurs de l'app. Les dossiers d'enquête, une fois terminés et vérifiés par l'équipe EcoVigil, apparaissent sur la carte avec leur catégorie et leur niveau de gravité — sans jamais révéler l'identité de l'enquêteur, les preuves détaillées ou les personnes mentionnées dans le dossier. Les inscriptions bénévoles et les dossiers en cours restent réservés à l'organisation concernée et à l'équipe d'administration.
      </Section>

      <Section title="Prestataires techniques">
        Supabase (hébergement UE), OpenStreetMap/Esri (fonds de carte), Open-Meteo (météo locale), GitHub Pages (hébergement web).
      </Section>

      <Section title="Sécurité">
        Connexions chiffrées (HTTPS), accès aux données restreint par appareil, par rôle et par organisation, mots de passe chiffrés, limites automatiques contre les abus. Toute suppression d'un dossier d'enquête est tracée (auteur, date), et sa restauration réservée à l'équipe EcoVigil.
      </Section>

      <Section title="Tes droits">
        Pour toute demande d'accès ou de rectification concernant tes données ou une contribution, écris-nous à wassolonmansa97@gmail.com en précisant la date, le lieu et le contenu concerné.
      </Section>

      <Section title="Supprimer mes données">
        Tu peux demander la suppression de toutes les données associées à ton appareil (signalements, arbres, observations, publications). Cette demande est traitée sous 30 jours maximum. Pour un compte bénévole ou organisation, écris-nous à l'adresse ci-dessus.
      </Section>
      <SuppressionDonneesCitoyen />

      <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 4 }}>
        Document complet disponible sur demande auprès du responsable du traitement.
      </div>
    </Screen>
  );
}

function SuppressionDonneesCitoyen() {
  const [step, setStep] = useState("idle"); // idle | confirm | sent
  async function envoyerDemande() {
    await envoyerDemandeSuppression();
    setStep("sent");
  }
  if (step === "sent") {
    return (
      <div style={{ background: "var(--c-surface-soft)", borderRadius: 12, padding: 14, fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 18 }}>
        {navigator.onLine
          ? "Ta demande a été enregistrée. Tes données seront supprimées sous 30 jours."
          : "Ta demande a été mise en attente sur l'appareil (pas de connexion) et sera envoyée automatiquement dès le retour du réseau. Le délai de 30 jours démarrera à ce moment-là."}
      </div>
    );
  }
  if (step === "confirm") {
    return (
      <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: "var(--c-warning-text)", lineHeight: 1.5, marginBottom: 10 }}>
          Toutes les données liées à cet appareil seront définitivement supprimées sous 30 jours. Confirmer ?
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep("idle")} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Annuler</button>
          <button onClick={envoyerDemande} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Confirmer</button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => setStep("confirm")} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid #B5451B", background: "none", color: "#B5451B", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 18 }}>
      Demander la suppression de mes données
    </button>
  );
}

const TABS = [
  { id: "accueil", label: "Accueil", icon: IconHome },
  { id: "carte", label: "Carte", icon: IconMapPin },
  { id: "signaler", label: "Signaler", icon: IconAlert, cta: true },
  { id: "arbre", label: "Mon Arbre", icon: IconTree },
  { id: "profil", label: "Profil", icon: IconUserCircle },
];

function NotifBell({ email, onNavigate, color }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  // "email" porte soit une vraie adresse (session org/admin), soit le DEVICE_ID
  // (citoyen/bénévole) : dans ce second cas, destinataire n'est pas dans le JWT,
  // donc la lecture/le marquage passent par des RPC dédiées (voir migration RLS
  // notifications) plutôt que par un select/update direct sur la table.
  const isDevice = !email.includes("@");

  async function load() {
    const { data } = isDevice
      ? await supabase.rpc("mes_notifications", { p_device: email })
      : await supabase.from("notifications").select("*").eq("destinataire", email).order("created_at", { ascending: false }).limit(30);
    setNotifs(data || []);
  }
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [email]);

  const unread = notifs.filter(n => !n.lu).length;

  async function openPanel() {
    setOpen(!open);
    if (!open && unread > 0) {
      const ids = notifs.filter(n => !n.lu).map(n => n.id);
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
      for (const id of ids) {
        if (isDevice) supabase.rpc("marquer_notification_lue", { p_device: email, p_id: id }).then(() => {});
        else supabase.from("notifications").update({ lu: true }).eq("id", id).then(() => {});
      }
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={openPanel} style={{ background: "none", border: "none", color: color || "var(--c-text-muted)", cursor: "pointer", padding: 6, position: "relative" }}>
        <IconBell size={18} />
        {unread > 0 && <span style={{ position: "absolute", top: 2, right: 2, background: "#B5451B", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", top: 34, right: 0, width: 260, background: "var(--c-surface)", borderRadius: 12, border: "1px solid var(--c-border)", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", zIndex: 100, maxHeight: 320, overflowY: "auto" }}>
          {notifs.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12.5, color: "var(--c-text-muted)", textAlign: "center" }}>Aucune notification.</div>
          ) : notifs.map(n => (
            <button key={n.id} onClick={() => { if (n.lien) onNavigate(n.lien); setOpen(false); }} style={{
              display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "none", borderBottom: "1px solid var(--c-surface-soft)",
              background: "var(--c-surface)", cursor: "pointer" }}>
              <div style={{ fontSize: 12, color: "var(--c-text)" }}>{n.message}</div>
              <div style={{ fontSize: 10, color: "var(--c-text-muted)", marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, ariaLabel, style, disabled }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} aria-label={ariaLabel || placeholder} disabled={disabled}
        style={{ ...style, width: "100%", paddingRight: 40, boxSizing: "border-box", opacity: disabled ? 0.6 : 1 }} />
      <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} disabled={disabled} style={{
        position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none",
        cursor: "pointer", color: "var(--c-text-muted)", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}

// ===== Politique de mot de passe renforcée (comptes du Centre d'EcoVigil uniquement) =====
// Le Centre d'EcoVigil donne accès à des données sensibles (identifiants d'appareils, notes de
// modération, gestion des comptes bénévoles/organisations) : on exige donc ici un mot de passe
// nettement plus robuste que celui des comptes citoyens/organisations (8 caractères). Cette
// validation est côté client (UX + premier filtre) ; elle ne remplace pas une politique équivalente
// configurée côté serveur (Supabase Auth → Authentication → Policies / mot de passe minimal, qui
// doit être alignée sur ces mêmes règles pour empêcher un contournement via un appel direct à l'API).
function evaluerForceMotDePasseAdmin(pw) {
  const val = pw || "";
  const regles = [
    { id: "longueur", label: "12 caractères minimum", ok: val.length >= 12 },
    { id: "maj", label: "Une majuscule", ok: /[A-Z]/.test(val) },
    { id: "min", label: "Une minuscule", ok: /[a-z]/.test(val) },
    { id: "chiffre", label: "Un chiffre", ok: /[0-9]/.test(val) },
    { id: "special", label: "Un caractère spécial (!?#$%…)", ok: /[^A-Za-z0-9]/.test(val) },
  ];
  return { regles, valide: regles.every(r => r.ok) };
}

function ExigencesMotDePasseAdmin({ password }) {
  const { regles } = evaluerForceMotDePasseAdmin(password);
  return (
    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10, display: "flex", flexDirection: "column", gap: 3 }}>
      {regles.map(r => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, color: r.ok ? "var(--c-accent)" : "var(--c-text-muted)" }}>
          {r.ok ? <IconCheck size={11} /> : <span style={{ width: 11, display: "inline-block", textAlign: "center" }}>•</span>} {r.label}
        </div>
      ))}
    </div>
  );
}

// Nombre maximal de tentatives de connexion échouées avant verrouillage temporaire côté client,
// et durée du verrouillage. Ceci décourage un enchaînement rapide de tentatives locales mais ne
// remplace pas une limitation réelle côté serveur (Supabase applique déjà ses propres limites de
// débit sur /auth/v1/token, indépendantes de ce compteur).
const ADMIN_LOGIN_MAX_TENTATIVES = 5;
const ADMIN_LOGIN_VERROUILLAGE_MS = 60000;

// Exception explicitement demandée par le propriétaire du projet, pour ce compte uniquement :
// exempté de l'obligation d'activer la 2FA pour accéder au Centre d'EcoVigil. À retirer de cette
// liste si l'exigence de 2FA obligatoire doit s'appliquer à nouveau à cette adresse.
// Exception à l'obligation de 2FA : aucune actuellement (liste laissée vide intentionnellement,
// après retour en arrière du propriétaire du projet — voir historique de la conversation).
const EMAILS_EXEMPTES_2FA_OBLIGATOIRE = [];

const MOTIF_LABELS_ADMIN = { faux: "Faux signalement", doublon: "Doublon", spam: "Spam", erreur_localisation: "Erreur de localisation" };
const AUDIT_LABELS = {
  membre_rejoint: "Nouveau membre",
  mission_creee: "Mission créée",
  mission_a_faire: "Mission repassée à faire",
  mission_en_cours: "Mission démarrée",
  mission_termine: "Mission terminée",
  reconnaissance_demandee: "Reconnaissance demandée",
  reconnaissance_approuvee: "Reconnaissance approuvée",
  reconnaissance_refusee: "Reconnaissance refusée",
  affiliation_confirmee: "Affiliation confirmée par l'organisation",
  affiliation_refusee: "Demande d'affiliation refusée par l'organisation",
  affiliation_retiree: "Affiliation retirée par l'organisation",
};
const MOTIF_OPTIONS_ADMIN = [
  { id: "faux", label: "Faux signalement" },
  { id: "doublon", label: "Doublon" },
  { id: "spam", label: "Spam" },
  { id: "erreur_localisation", label: "Erreur de localisation" },
];

// Point 5 : ancrage institutionnel — organismes responsables pouvant être crédités d'une résolution
const ORGANISME_OPTIONS = [
  { id: "mairie", label: "Mairie / collectivité locale" },
  { id: "service_environnement", label: "Service de l'environnement" },
  { id: "ong_partenaire", label: "ONG partenaire" },
  { id: "benevoles_pace", label: "Bénévoles EcoVigil" },
  { id: "autre", label: "Autre organisme" },
];
const ORGANISME_LABELS = Object.fromEntries(ORGANISME_OPTIONS.map(o => [o.id, o.label]));

// Regroupement des 14 panneaux du Centre d'EcoVigil en 4 catégories thématiques, pour une
// navigation à deux niveaux plus lisible qu'une seule rangée de 14 pastilles (hiérarchie de
// l'information, réduction de la charge cognitive — cf. réorganisation UI/UX du panneau admin).
const CATEGORIES_ADMIN = [
  { id: "terrain", label: "Terrain", icon: IconAlert, panels: [
    ["signalements", "Signalements", IconAlert], ["arbres", "Arbres", IconTree], ["abus", "Abus/doublons", IconAlert],
    ["enquetes", "Enquêtes", IconSearch],
  ] },
  { id: "communaute", label: "Communauté", icon: IconUsers, panels: [
    ["benevoles", "Bénévoles", IconUsers], ["organisations", "Organisations", IconShield],
    ["publications", "Vérification", IconCheck], ["connexions", "Connexions", IconTarget],
  ] },
  { id: "contenu", label: "Contenu", icon: IconNewspaper, panels: [
    ["actualites", "Actualités", IconNewspaper], ["evenements", "Événements", IconCalendar], ["contenu_env", "Taxonomie", IconLayers],
  ] },
  { id: "systeme", label: "Système", icon: IconLock, panels: [
    ["historique", "Historique", IconClock], ["securite", "Sécurité", IconShield],
    ["rapports", "Rapports", IconDownload], ["suppressions", "Suppressions", IconUserCircle],
  ] },
];
function categorieDuPanel(panelId) {
  const cat = CATEGORIES_ADMIN.find(c => c.panels.some(([id]) => id === panelId));
  return cat ? cat.id : CATEGORIES_ADMIN[0].id;
}

function AdminSpace({ signalements: signalementsProp, arbres, onUpdateStatut, onResolve, onValidate, onValidateArbre, onDelete, onSoftDeleteArbre, onRevertModeration, onSoftDeleteSignalement, onRestaurerItem, onRafraichir, rafraichissementEnCours, onExit }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // null = en cours de vérification
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("attente");
  const [panel, setPanel] = useState("signalements");
  const [moderationModal, setModerationModal] = useState(null);
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [welcomeSession, setWelcomeSession] = useState(false); // true = vient de cliquer le lien reçu par e-mail
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // Verrouillage local après plusieurs échecs de connexion successifs (voir constantes
  // ADMIN_LOGIN_MAX_TENTATIVES / ADMIN_LOGIN_VERROUILLAGE_MS ci-dessus).
  const [tentativesEchouees, setTentativesEchouees] = useState(0);
  const [verrouJusqua, setVerrouJusqua] = useState(null);
  const [maintenant, setMaintenant] = useState(Date.now());
  useEffect(() => {
    if (!verrouJusqua) return;
    const id = setInterval(() => setMaintenant(Date.now()), 500);
    return () => clearInterval(id);
  }, [verrouJusqua]);
  const secondesRestantes = verrouJusqua ? Math.max(0, Math.ceil((verrouJusqua - maintenant) / 1000)) : 0;
  const estVerrouille = verrouJusqua !== null && secondesRestantes > 0;
  useEffect(() => { if (verrouJusqua && secondesRestantes === 0) { setVerrouJusqua(null); setTentativesEchouees(0); } }, [secondesRestantes, verrouJusqua]);

  // ===== Double authentification (2FA) : step-up post-connexion =====
  // Après un signInWithPassword réussi, la session est au niveau aal1. Si le compte a déjà un
  // facteur TOTP vérifié, on exige un code avant de laisser passer vers le tableau de bord (accès
  // à des données sensibles). "session" ci-dessous n'est pas encore déclaré à cet endroit du
  // composant (défini plus bas) : ces états seront réutilisés depuis le rendu, où "session" existe.
  const [mfaChallenge, setMfaChallenge] = useState(null); // { factorId, challengeId }
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState("");
  // Le flux public/partagé (carte, accueil) passe désormais par une vue restreinte qui masque
  // des champs sensibles (citoyen_id, coordonnées de bénévoles, notes de modération...). L'admin,
  // authentifié, a le droit de tout voir : on recharge donc ici sa propre copie complète depuis la
  // table brute plutôt que de dépendre du flux public déjà filtré en amont.
  const [signalementsAdmin, setSignalementsAdmin] = useState(null);
  async function chargerSignalementsAdmin() {
    const { data } = await supabase.from("signalements").select("*").eq("is_deleted", false).order("created_at", { ascending: false }).limit(2000);
    if (data) setSignalementsAdmin(data);
  }
  useEffect(() => { if (isAdmin) chargerSignalementsAdmin(); }, [isAdmin]);
  // Les actions admin (valider/résoudre/supprimer…) mettent à jour l'état partagé de l'app de
  // façon optimiste (setSignalements côté App). On répercute ces changements dans notre propre
  // copie ici, en ne touchant que les champs communs — les champs admin-only (modération,
  // bénévole, citoyen_id) absents de la vue publique restreinte sont préservés tels quels.
  useEffect(() => {
    if (signalementsAdmin === null || !signalementsProp) return;
    setSignalementsAdmin(prev => {
      const byId = new Map(prev.map(s => [s.id, s]));
      signalementsProp.forEach(sp => {
        const existing = byId.get(sp.id);
        byId.set(sp.id, existing ? { ...existing, ...sp } : sp);
      });
      return Array.from(byId.values());
    });
  }, [signalementsProp]);
  const signalements = signalementsAdmin !== null ? signalementsAdmin : (signalementsProp || []);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!token) return;

    if (type === "recovery") {
      setRecoveryToken(token);
      return;
    }
    // Lien de création de compte (signup / magiclink / invite) : on connecte directement
    // puis on demande de choisir un mot de passe.
    (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/user`, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
        const user = await res.json().catch(() => null);
        persistActiveSession({ access_token: token, refresh_token: refreshToken, user });
        setSession({ access_token: token, refresh_token: refreshToken, user });
        setWelcomeSession(true);
        window.location.hash = "";
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Niveau d'assurance de la session courante et présence d'un facteur TOTP déjà vérifié sur le
  // compte. Tant que aal2 n'est pas atteint alors qu'un facteur existe, on bloque l'accès au
  // tableau de bord (voir écran de step-up plus bas) — y compris la vérification des droits admin,
  // qui ne doit pas s'exécuter avant que la double authentification soit validée.
  const aal = session && session.access_token ? (decoderJwtPayload(session.access_token) || {}).aal : null;
  const facteursTotpVerifies = (session && session.user && session.user.factors) ? session.user.factors.filter(f => f.factor_type === "totp" && f.status === "verified") : [];
  // Exemption explicite (voir EMAILS_EXEMPTES_2FA_OBLIGATOIRE) : calculée ici pour couvrir aussi
  // bien le step-up (facteur déjà activé) que l'obligation d'inscription plus bas.
  const emailSession = (session && session.user && session.user.email || "").toLowerCase();
  const exempte2fa = EMAILS_EXEMPTES_2FA_OBLIGATOIRE.includes(emailSession);
  const mfaStepUpRequis = !!session && aal === "aal1" && facteursTotpVerifies.length > 0 && !exempte2fa;

  useEffect(() => {
    if (!mfaStepUpRequis || mfaChallenge) return;
    const factorId = facteursTotpVerifies[0].id;
    setMfaError("");
    supabase.auth.mfa.challenge({ factorId }).then(({ data, error }) => {
      if (error) { setMfaError(error.message); return; }
      setMfaChallenge({ factorId, challengeId: data.id });
    });
  }, [mfaStepUpRequis]);

  async function verifierCodeMfa(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!mfaChallenge) return;
    setMfaError(""); setMfaBusy(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaChallenge.factorId, challengeId: mfaChallenge.challengeId, code: mfaCode.trim(), accessToken: session.access_token });
    setMfaBusy(false);
    if (error) { setMfaError("Code incorrect ou expiré."); return; }
    setMfaCode(""); setMfaChallenge(null);
  }

  useEffect(() => {
    if (!session) { setIsAdmin(null); setIsSuperAdmin(false); return; }
    supabase.from("admins").select("email, role").eq("email", session.user.email).maybeSingle()
      .then(({ data }) => { setIsAdmin(!!data); setIsSuperAdmin(!!data && data.role === "super_admin"); });
  }, [session]);

  // État de verrouillage global du Centre d'EcoVigil, chargé une fois les droits admin confirmés.
  const [centreVerrouille, setCentreVerrouille] = useState(null);
  async function chargerCentreVerrouille() {
    const { data } = await supabase.from("centre_controle_etat").select("*").eq("id", true).maybeSingle();
    setCentreVerrouille(data || { verrouille: false });
  }
  useEffect(() => {
    if (isAdmin) chargerCentreVerrouille();
  }, [isAdmin]);

  async function handleSetNewPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!evaluerForceMotDePasseAdmin(newPassword).valide) { setError("Le mot de passe ne respecte pas toutes les exigences ci-dessous."); return; }
    if (newPassword !== confirmNewPassword) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword }, recoveryToken);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setRecoveryToken(null);
    setNewPassword(""); setConfirmNewPassword("");
    window.location.hash = "";
    setError("Mot de passe mis à jour. Connecte-toi avec ton nouveau mot de passe.");
  }

  async function handleChooseWelcomePassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!evaluerForceMotDePasseAdmin(newPassword).valide) { setError("Le mot de passe ne respecte pas toutes les exigences ci-dessous."); return; }
    if (newPassword !== confirmNewPassword) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword }, session.access_token);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setWelcomeSession(false);
    setNewPassword(""); setConfirmNewPassword("");
  }

  async function handleForgot(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: urlRedirectionAuth(true) });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setError("Un e-mail de réinitialisation a été envoyé si ce compte existe.");
  }

  async function handleSignupOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) { setError("Entre une adresse e-mail valide."); return; }
    setBusy(true);
    // Pré-vérification : n'envoie un lien de création de compte que si l'email a été
    // pré-approuvé par un admin existant (table admins). Empêche n'importe quel visiteur
    // de déclencher l'envoi d'un e-mail "EcoVigil" pour une adresse non autorisée.
    const { data: preapprouve, error: errCheck } = await supabase.rpc("email_est_admin_preapprouve", { p_email: email.trim().toLowerCase() });
    if (errCheck) { setBusy(false); setError("Impossible de vérifier cette adresse pour l'instant. Réessaie."); return; }
    if (!preapprouve) {
      setBusy(false);
      setError("Cette adresse n'a pas été autorisée par un administrateur. Demande à un membre de l'équipe de t'ajouter d'abord dans \"Équipe administrateurs\".");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: urlRedirectionAuth(true) } });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setError("E-mail envoyé ! Ouvre le lien reçu pour choisir ton mot de passe et activer ton compte.");
  }

  async function handleAuth(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (mode === "login" && estVerrouille) {
      setError(`Trop de tentatives échouées. Réessaie dans ${secondesRestantes}s.`);
      return;
    }
    if (!email.trim() || !email.includes("@")) { setError("Entre une adresse e-mail valide."); return; }
    if (!password) { setError("Entre ton mot de passe."); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Connexion réussie : on réinitialise le compteur d'échecs.
        setTentativesEchouees(0);
        setVerrouJusqua(null);
        try {
          if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
            const perm = await Notification.requestPermission();
            if (perm === "granted") subscribeToPush();
          }
        } catch (notifErr) {
          console.error("Notifications indisponibles dans ce contexte :", notifErr);
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: urlRedirectionAuth(true) } });
        if (error) throw error;
        setError("Compte créé. Vérifie ta boîte mail pour confirmer l'adresse, puis connecte-toi.");
      }
    } catch (err) {
      const msg = (err && err.message) ? err.message : "Une erreur est survenue. Réessaie.";
      if (mode === "login" && (msg === "Invalid login credentials" || /invalid/i.test(msg))) {
        // Verrouillage local temporaire après plusieurs échecs successifs, en plus de la limite
        // de débit déjà appliquée côté serveur par Supabase sur cet endpoint.
        const n = tentativesEchouees + 1;
        setTentativesEchouees(n);
        if (n >= ADMIN_LOGIN_MAX_TENTATIVES) {
          setVerrouJusqua(Date.now() + ADMIN_LOGIN_VERROUILLAGE_MS);
          setError(`Trop de tentatives échouées. Réessaie dans ${Math.ceil(ADMIN_LOGIN_VERROUILLAGE_MS / 1000)}s.`);
        } else {
          setError(`Identifiants incorrects. (${ADMIN_LOGIN_MAX_TENTATIVES - n} tentative(s) avant verrouillage temporaire)`);
        }
      } else {
        setError(msg === "Invalid login credentials" ? "Identifiants incorrects." : msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function toggleCentreVerrouille(motif) {
    const nouveauEtat = !(centreVerrouille && centreVerrouille.verrouille);
    const { error } = await supabase.from("centre_controle_etat").update({
      verrouille: nouveauEtat,
      verrouille_par: nouveauEtat ? session.user.email : null,
      verrouille_le: nouveauEtat ? new Date().toISOString() : null,
      motif: nouveauEtat ? (motif || null) : null,
    }).eq("id", true);
    if (!error) {
      logAudit(nouveauEtat ? "verrouillage_centre" : "deverrouillage_centre", "centre_controle", "global", motif || null);
      chargerCentreVerrouille();
    }
    return { error };
  }

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);
  async function handleDeleteAccount() {
    await supabase.from("demandes_suppression").insert({ email: session.user.email, motif: "Demande depuis l'espace administrateur" });
    setDeleteSent(true);
    setTimeout(async () => { await supabase.auth.signOut(); setSession(null); }, 2500);
  }

  if (recoveryToken) {
    return (
      <Screen>
        <SectionTitle sub="Choisis un nouveau mot de passe.">Réinitialisation</SectionTitle>
        <form onSubmit={handleSetNewPassword} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8 }} />
          <PasswordInput value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirme le nouveau mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8 }} />
          <ExigencesMotDePasseAdmin password={newPassword} />
          {error && <div role="alert" style={{ fontSize: 12, color: error.startsWith("Mot de passe mis") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || !evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "var(--c-text-faint)" : "var(--c-accent-dark)",
            color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "default" : "pointer" }}>
            {busy ? "..." : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </Screen>
    );
  }

  if (welcomeSession && session) {
    return (
      <Screen>
        <SectionTitle sub={session.user ? session.user.email : ""}>Bienvenue sur EcoVigil</SectionTitle>
        <form onSubmit={handleChooseWelcomePassword} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <div style={{ fontSize: 13, color: "var(--c-text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
            Ton adresse est confirmée. Choisis maintenant un mot de passe pour ton compte administrateur.
          </div>
          <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Choisis un mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8 }} />
          <PasswordInput value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirme le mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8 }} />
          <ExigencesMotDePasseAdmin password={newPassword} />
          {error && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || !evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "var(--c-text-faint)" : "var(--c-accent-dark)",
            color: "#fff", fontWeight: 600, fontSize: 13.5,
            cursor: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "default" : "pointer" }}>
            {busy ? "..." : "Activer mon compte"}
          </button>
        </form>
      </Screen>
    );
  }

  if (mfaStepUpRequis) {
    return (
      <Screen>
        <SectionTitle sub="Entre le code généré par ton application d'authentification.">Double authentification</SectionTitle>
        <form onSubmit={verifierCodeMfa} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code à 6 chiffres" aria-label="Code de double authentification"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 18, letterSpacing: 4, textAlign: "center", marginBottom: 10, boxSizing: "border-box" }} />
          {mfaError && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{mfaError}</div>}
          <button type="submit" disabled={mfaBusy || mfaCode.length !== 6 || !mfaChallenge} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (mfaCode.length !== 6 || !mfaChallenge) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5,
            cursor: (mfaCode.length !== 6 || !mfaChallenge) ? "default" : "pointer", marginBottom: 8 }}>
            {mfaBusy ? "..." : "Valider"}
          </button>
          <button type="button" onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: 12, cursor: "pointer", padding: 6 }}>← Annuler et se déconnecter</button>
        </form>
      </Screen>
    );
  }

  if (!session) {
    if (mode === "forgot") {
      return (
        <Screen>
          <SectionTitle sub="Reçois un lien pour réinitialiser ton mot de passe.">Mot de passe oublié</SectionTitle>
          <form onSubmit={handleForgot} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Ton adresse e-mail admin" aria-label="Adresse e-mail"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
            {error && <div role="alert" style={{ fontSize: 12, color: error.startsWith("Un e-mail") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 8 }}>
              {busy ? "..." : "Envoyer le lien"}
            </button>
            <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: 12, cursor: "pointer", padding: 6 }}>← Retour à la connexion</button>
          </form>
          <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer" }}>← Retour à l'app</button>
        </Screen>
      );
    }
    if (mode === "signup") {
      return (
        <Screen>
          <SectionTitle sub="Un lien te sera envoyé pour activer ton compte.">Créer un compte admin</SectionTitle>
          <form onSubmit={handleSignupOtp} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" aria-label="Adresse e-mail"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 4, boxSizing: "border-box" }} />
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.4 }}>
              Conseil : évite une adresse e-mail contenant des informations confidentielles ou sensibles.
            </div>
            {error && <div role="alert" style={{ fontSize: 12, color: error.startsWith("E-mail envoyé") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 8 }}>
              {busy ? "..." : "Envoyer le lien de création"}
            </button>
            <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: 12, cursor: "pointer", padding: 6 }}>
              Déjà un compte ? Se connecter
            </button>
          </form>
          <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer" }}>← Retour à l'app</button>
        </Screen>
      );
    }
    return (
      <Screen>
        <SectionTitle sub="Réservé à l'équipe de modération.">Centre d'EcoVigil</SectionTitle>
        <form onSubmit={handleAuth} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" aria-label="Adresse e-mail"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" disabled={estVerrouille}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6 }} />
          <button type="button" onClick={() => { setMode("forgot"); setError(""); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0, marginBottom: 10, display: "block" }}>
            Mot de passe oublié ?
          </button>
          {estVerrouille && (
            <div role="alert" style={{ fontSize: 12, color: "var(--c-warning-text)", background: "var(--c-warning-bg)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>
              Trop de tentatives échouées. Réessaie dans {secondesRestantes}s.
            </div>
          )}
          {!estVerrouille && error && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || estVerrouille} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: estVerrouille ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5,
            cursor: estVerrouille ? "default" : "pointer", marginBottom: 8 }}>
            {busy ? "..." : estVerrouille ? `Réessaie dans ${secondesRestantes}s` : "Se connecter"}
          </button>
          <button type="button" onClick={() => { setMode("signup"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: 12, cursor: "pointer", padding: 6 }}>
            Pas encore de compte admin ? En créer un
          </button>
        </form>
        <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer" }}>← Retour à l'app</button>
      </Screen>
    );
  }

  if (isAdmin === null) {
    return <Screen><div style={{ textAlign: "center", color: "var(--c-text-muted)", marginTop: 60, fontSize: 13 }}>Vérification des droits…</div></Screen>;
  }

  if (!isAdmin) {
    return (
      <Screen>
        <SectionTitle>Accès refusé</SectionTitle>
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)", fontSize: 13, color: "var(--c-text-secondary)" }}>
          Le compte <b>{session.user.email}</b> n'a pas les droits administrateur.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={handleLogout} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>Se déconnecter</button>
          <button onClick={onExit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer", fontSize: 13 }}>Retour à l'app</button>
        </div>
      </Screen>
    );
  }

  // Écran bloquant pour tout admin qui n'est pas super_admin quand le Centre d'EcoVigil
  // est verrouillé. Le super_admin, lui, garde toujours l'accès (sinon plus personne ne
  // pourrait déverrouiller).
  if (centreVerrouille && centreVerrouille.verrouille && !isSuperAdmin) {
    return (
      <Screen>
        <SectionTitle>Centre d'EcoVigil verrouillé</SectionTitle>
        <div style={{ background: "var(--c-danger-border-soft)", border: "1px solid #B5451B", borderRadius: 14, padding: 16, fontSize: 13, color: "var(--c-text)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <IconLock size={16} color="#B5451B" />
            <div style={{ fontWeight: 700, color: "#B5451B" }}>Accès temporairement suspendu</div>
          </div>
          <div style={{ color: "var(--c-text-secondary)", lineHeight: 1.5 }}>
            L'accès admin a été verrouillé par le super-administrateur{centreVerrouille.verrouille_par ? ` (${centreVerrouille.verrouille_par})` : ""}
            {centreVerrouille.verrouille_le ? ` le ${new Date(centreVerrouille.verrouille_le).toLocaleString("fr-FR")}` : ""}.
            {centreVerrouille.motif ? ` Motif : ${centreVerrouille.motif}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={handleLogout} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>Se déconnecter</button>
          <button onClick={onExit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer", fontSize: 13 }}>Retour à l'app</button>
        </div>
      </Screen>
    );
  }

  // Double authentification obligatoire pour tout compte admin (sauf exemption explicite
  // ci-dessus) : tant qu'aucun facteur TOTP vérifié n'est associé au compte, l'accès au tableau
  // de bord est bloqué et l'activation est forcée ici — un mot de passe seul (deviné, réutilisé
  // ailleurs, ou compromis dans une fuite de données externe) ne doit jamais suffire à entrer
  // dans le Centre d'EcoVigil.
  if (isAdmin && facteursTotpVerifies.length === 0 && !exempte2fa) {
    return (
      <Screen>
        <SectionTitle sub="Obligatoire pour tout compte administrateur avant de continuer.">Sécurise ton compte</SectionTitle>
        <AdminMfaPanel session={session} />
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 4, marginBottom: 14 }}>
          Une fois le code confirmé, reconnecte-toi pour accéder au Centre d'EcoVigil.
        </div>
        <button onClick={handleLogout} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>Se déconnecter</button>
      </Screen>
    );
  }

  const resolus = signalements.filter(s => s.statut === "resolu").length;
  const attente = signalements.filter(s => s.statut !== "resolu").length;
  const filtered = signalements.filter(s => filter === "tous" || (filter === "resolu" ? s.statut === "resolu" : s.statut !== "resolu"));

  return (
    <Screen>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <SectionTitle sub={session.user.email}>Centre d'EcoVigil</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NotifBell email={session.user.email} onNavigate={setPanel} />
          <button onClick={() => setConfirmDelete(true)} title="Supprimer mon compte" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 6 }}><IconUserCircle size={18} /></button>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 6 }}><IconLogOut size={18} /></button>
        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: 20 }} onClick={() => !deleteSent && setConfirmDelete(false)}>
          <div style={{ background: "var(--c-surface)", borderRadius: 16, padding: 20, maxWidth: 340, width: "100%" }} onClick={e => e.stopPropagation()}>
            {deleteSent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Demande enregistrée</div>
                <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>Ton compte et tes données seront supprimés sous 30 jours. Tu vas être déconnecté.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Supprimer ton compte ?</div>
                <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                  Ton compte ({session.user.email}) et les données qui y sont liées seront définitivement supprimés sous 30 jours. Cette action est irréversible.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Annuler</button>
                  <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Supprimer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard label="En attente" value={attente} unit="" accent="#B5451B" />
        <StatCard label="Résolus" value={resolus} unit="" accent="var(--c-accent)" />
      </div>

      {/* Niveau 1 : catégories thématiques — segmented control pleine largeur, 4 choix max,
          plus lisible qu'une seule rangée de 14 items à faire défiler. Dérivée du panneau actif
          (pas d'état séparé) pour rester synchronisée même en cas d'accès direct à un panneau
          (ex. depuis une notification). */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "var(--c-bg)", borderRadius: 12, padding: 4 }}>
        {CATEGORIES_ADMIN.map(cat => (
          <button key={cat.id} onClick={() => setPanel(cat.panels[0][0])} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 4px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
            border: "none", background: categorieDuPanel(panel) === cat.id ? "var(--c-surface)" : "transparent",
            color: categorieDuPanel(panel) === cat.id ? "var(--c-accent-dark)" : "var(--c-text-muted)",
            boxShadow: categorieDuPanel(panel) === cat.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
            <cat.icon size={13} />{cat.label}
          </button>
        ))}
      </div>

      {/* Niveau 2 : panneaux de la catégorie du panneau actif (3 à 4 items, jamais 14). */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto" }}>
        {(CATEGORIES_ADMIN.find(c => c.id === categorieDuPanel(panel)) || CATEGORIES_ADMIN[0]).panels.map(([id, label, Ic]) => (
          <button key={id} onClick={() => setPanel(id)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: panel === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: panel === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: panel === id ? "#fff" : "var(--c-text-secondary)" }}><Ic size={13} />{label}</button>
        ))}
      </div>

      {panel === "signalements" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={() => { onRafraichir(); chargerSignalementsAdmin(); }} disabled={rafraichissementEnCours} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
              border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", cursor: rafraichissementEnCours ? "default" : "pointer" }}>
              <IconClock size={13} /> {rafraichissementEnCours ? "Actualisation…" : "Actualiser"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["attente", "En attente"], ["resolu", "Résolus"], ["tous", "Tous"]].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                border: filter === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
                background: filter === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: filter === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
            ))}
          </div>

          <div className="pace-grid-cards" style={{ gap: 10 }}>
            {filtered.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucun signalement ici.</div>}
            {[...filtered].sort((a, b) => PRIORITE_ORDRE[calculerPriorite(b, signalements)] - PRIORITE_ORDRE[calculerPriorite(a, signalements)]).map(s => {
              const cat = categorieMeta(s.categorie);
              const u = URGENCE.find(x => x.id === s.urgence);
              const priorite = calculerPriorite(s, signalements);
              const pInfo = PRIORITE_INFO[priorite];
              return (
                <div key={s.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
                  <MediaThumb src={s.photo_url} style={{ width: "100%", maxHeight: 130, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cat.label}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: u ? u.color : "#B5451B" }}>{u ? u.label : s.urgence}</span>
                  </div>
                  <div style={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, color: "#fff", background: pInfo.color, borderRadius: 999, padding: "2px 8px", marginBottom: 6 }}>{pInfo.label}</div>
                  <FicheEnvironnementale code={s.categorie} />
                  {!s.valide && (
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "#B5451B", marginBottom: 4 }}>⏳ Non validé — invisible du public</div>
                  )}
                  {s.moderation_motif && (
                    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 4 }}>Dernière modération : {MOTIF_LABELS_ADMIN[s.moderation_motif] || s.moderation_motif}</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>{s.date} · appareil {s.device_id ? s.device_id.slice(0, 6) : "?"}</div>
                  {s.benevole_nom && (
                    <div style={{ fontSize: 11, color: "var(--c-text-secondary)", background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
                      <IconUsers size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                      Signalé par <strong>{s.benevole_nom}</strong>
                      {(s.benevole_ville || s.benevole_pays) && <> — {[s.benevole_ville, s.benevole_pays].filter(Boolean).join(", ")}</>}
                      {s.benevole_quartier && <> ({s.benevole_quartier})</>}
                      {s.benevole_contact && <div>{s.benevole_contact}</div>}
                    </div>
                  )}
                  {s.description && <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 8 }}>{s.description}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!s.valide && (
                      <button onClick={() => { onValidate(s.id); setSignalementsAdmin(prev => prev ? prev.map(x => x.id === s.id ? { ...x, valide: true } : x) : prev); }} style={{
                        flex: "1 1 100%", fontSize: 11.5, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                        background: "var(--c-accent-dark)", color: "#fff" }}>
                        ✓ Valider et publier
                      </button>
                    )}
                    {s.valide && (
                      <button onClick={() => setModerationModal({ type: "revert", signalement: s })} style={{
                        flex: "1 1 100%", fontSize: 11, padding: "7px 0", borderRadius: 8, border: "1px solid var(--c-warning)", cursor: "pointer", fontWeight: 600,
                        background: "var(--c-warning-bg)", color: "var(--c-warning-text)" }}>
                        ↺ Repasser en vérification
                      </button>
                    )}
                    <button onClick={() => {
                      if (s.statut === "resolu") {
                        onUpdateStatut(s.id, "attente");
                        setSignalementsAdmin(prev => prev ? prev.map(x => x.id === s.id ? { ...x, statut: "attente", resolution_organisme: null, resolution_action: null, resolved_at: null } : x) : prev);
                      } else {
                        setModerationModal({ type: "resolve", signalement: s });
                      }
                    }} style={{
                      flex: 1, fontSize: 11.5, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                      background: s.statut === "resolu" ? "var(--c-bg)" : "var(--c-accent)", color: s.statut === "resolu" ? "var(--c-text-secondary)" : "#fff" }}>
                      {s.statut === "resolu" ? "Remettre en attente" : "Marquer résolu"}
                    </button>
                    <button onClick={() => setModerationModal({ type: "delete", signalement: s })} style={{
                      padding: "7px 10px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", cursor: "pointer" }}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                  {s.statut === "resolu" && s.resolution_organisme && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--c-text-secondary)", background: "var(--c-success-bg)", borderRadius: 8, padding: "6px 8px" }}>
                      ✓ Résolu par {ORGANISME_LABELS[s.resolution_organisme] || s.resolution_organisme}{s.resolution_action ? ` — ${s.resolution_action}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {moderationModal && moderationModal.type === "revert" && (
        <ConfirmActionModal
          title="Repasser en vérification"
          description="Le signalement redevient invisible du public jusqu'à nouvelle validation. L'auteur sera notifié de cette décision."
          reasonLabel="Détail pour le journal d'audit (obligatoire)"
          confirmLabel="Repasser ce signalement en vérification"
          motifOptions={MOTIF_OPTIONS_ADMIN}
          danger
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onRevertModeration(moderationModal.signalement, payload);
            setSignalementsAdmin(prev => prev ? prev.map(x => x.id === moderationModal.signalement.id ? { ...x, valide: false, statut: "attente", moderation_motif: payload.motif } : x) : prev);
            setModerationModal(null);
          }}
        />
      )}
      {moderationModal && moderationModal.type === "delete" && (
        <ConfirmActionModal
          title="Mettre ce signalement à la corbeille"
          description="Il disparaît immédiatement de l'app et de la carte, mais reste archivé et restaurable par un super-administrateur."
          reasonLabel="Motif de la suppression (obligatoire)"
          confirmLabel="Mettre à la corbeille"
          danger
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onSoftDeleteSignalement(moderationModal.signalement, payload);
            setSignalementsAdmin(prev => prev ? prev.filter(s => s.id !== moderationModal.signalement.id) : prev);
            setModerationModal(null);
          }}
        />
      )}
      {moderationModal && moderationModal.type === "resolve" && (
        <ConfirmActionModal
          title="Marquer comme résolu"
          description="Indique l'organisme responsable de l'action et ce qui a été fait. Ces informations seront visibles publiquement, pour que les citoyens voient l'impact réel de leur signalement."
          reasonLabel="Action réalisée (obligatoire)"
          confirmLabel="Marquer résolu"
          motifOptions={ORGANISME_OPTIONS}
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onResolve(moderationModal.signalement, { organisme: payload.motif, action: payload.reason });
            setSignalementsAdmin(prev => prev ? prev.map(x => x.id === moderationModal.signalement.id ? { ...x, statut: "resolu", resolution_organisme: payload.motif, resolution_action: payload.reason, resolved_at: new Date().toISOString() } : x) : prev);
            setModerationModal(null);
          }}
        />
      )}

      {panel === "arbres" && (
        <div className="pace-grid-cards" style={{ gap: 10 }}>
          {arbres.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucun arbre enregistré.</div>}
          {[...arbres].reverse().map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-surface)", borderRadius: 12, padding: 10, border: "1px solid var(--c-border)" }}>
              {a.photo_url ? (
                <MediaThumbSmall src={a.photo_url} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-surface-soft)" }}>
                  <IconTree size={18} color="var(--c-accent)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: "var(--c-text)" }}>{a.nom || "Arbre"}</div>
                {!a.valide && (
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "#B5451B" }}>⏳ Non validé — invisible du public</div>
                )}
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{a.date} · appareil {a.device_id ? a.device_id.slice(0, 6) : "?"}</div>
                {!a.valide && (
                  <button onClick={() => onValidateArbre(a.id)} style={{
                    marginTop: 6, fontSize: 11, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                    background: "var(--c-accent-dark)", color: "#fff" }}>
                    ✓ Valider et publier
                  </button>
                )}
              </div>
              <button onClick={() => { if (confirm(`Mettre "${a.nom || "cet arbre"}" à la corbeille ? Il sera restaurable depuis Historique.`)) onSoftDeleteArbre(a); }} aria-label="Supprimer" style={{ background: "none", border: "1px solid var(--c-danger-border-soft)", borderRadius: 8, color: "#B5451B", cursor: "pointer", padding: 7, flexShrink: 0, alignSelf: "flex-start" }}>
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {panel === "actualites" && <AdminActualites />}
      {panel === "evenements" && <AdminEvenements />}
      {panel === "benevoles" && <AdminBenevoles />}

      {panel === "historique" && <AdminHistorique isSuperAdmin={isSuperAdmin} onRestaurerItem={onRestaurerItem} />}
      {panel === "connexions" && <AdminConnexions />}
      {panel === "abus" && <AdminAbusSignalements signalements={signalementsAdmin} />}
      {panel === "securite" && <AdminSecurite session={session} />}
      {panel === "contenu_env" && <AdminContenuEnv isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "organisations" && <AdminOrganisations isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "publications" && <AdminVerification isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "rapports" && <AdminRapports signalements={signalements} arbres={arbres} isSuperAdmin={isSuperAdmin} centreVerrouille={centreVerrouille} onToggleCentre={toggleCentreVerrouille} />}
      {panel === "suppressions" && <AdminSuppressions isSuperAdmin={isSuperAdmin} />}
      {panel === "enquetes" && <AdminEnquetes session={session} />}

      <button onClick={onExit} style={{ marginTop: 18, width: "100%", background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", padding: 8 }}>← Retour à l'app</button>
    </Screen>
  );
}

function AdminActualites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("actualites").select("*").order("created_at", { ascending: false }).limit(100);
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function publish(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!titre.trim() || !contenu.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("actualites").insert({ titre, contenu, urgent });
    setBusy(false);
    if (error) { alert("Publication refusée par le serveur."); return; }
    setTitre(""); setContenu(""); setUrgent(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette actualité ?")) return;
    await supabase.from("actualites").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <form onSubmit={publish} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
        <input required value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
        <textarea required value={contenu} onChange={e => setContenu(e.target.value)} placeholder="Contenu" rows={3}
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} /> Marquer comme alerte urgente
        </label>
        <button type="button" onClick={publish} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          {busy ? "Publication..." : "Publier"}
        </button>
      </form>

      {loading ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> : (
        <div className="pace-grid-cards">
          {items.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 12 }}>Aucune actualité publiée.</div>}
          {items.map(n => (
            <div key={n.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {n.urgent && <span style={{ fontSize: 10, fontWeight: 700, color: "#B5451B" }}>⚠ ALERTE — </span>}
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{n.titre}</span>
                </div>
                <button onClick={() => remove(n.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}><IconTrash size={14} /></button>
              </div>
              <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginTop: 4 }}>{n.contenu}</div>
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 5 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminEvenements() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("evenements").select("*").order("date_debut", { ascending: false }).limit(200);
    setItems(data || []);
    const { data: parts } = await supabase.from("evenement_participants").select("evenement_id");
    const c = {};
    (parts || []).forEach(p => { c[p.evenement_id] = (c[p.evenement_id] || 0) + 1; });
    setCounts(c);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Supprimer cet événement (ex. contenu inapproprié ou doublon) ? Les inscriptions associées seront aussi retirées.")) return;
    await supabase.from("evenement_participants").delete().eq("evenement_id", id);
    await supabase.from("evenements").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 12 }}>
        Les événements sont proposés librement par les citoyens et bénévoles depuis l'app. Cette liste sert à
        retirer un contenu inapproprié ou un doublon — la création se fait côté public, pas ici.
      </div>
      {loading ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> : (
        <div className="pace-grid-cards">
          {items.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 12 }}>Aucun événement proposé.</div>}
          {items.map(ev => (
            <div key={ev.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{ev.titre}</span>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 2 }}>
                    {new Date(ev.date_debut).toLocaleString("fr-FR")}{ev.lieu ? ` · ${ev.lieu}` : ""} · {counts[ev.id] || 0} participant(s)
                  </div>
                </div>
                <button onClick={() => remove(ev.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}><IconTrash size={14} /></button>
              </div>
              {ev.description && <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginTop: 4 }}>{ev.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Module VÉRIFICATION — Centre d'EcoVigil
// ------------------------------------------------------------
// Vérifie l'ORGANISATION, jamais le groupe de terrain.
// ORGANISATION → GROUPES DE TERRAIN → ACTIONS → SIGNALEMENTS
// La vérification de l'organisation et la vérification des
// signalements restent deux processus strictement distincts.
// ============================================================

const VERIF_NIVEAUX = [
  { id: 0, label: "Non vérifié", court: "N0", desc: "Aucune vérification suffisante.", color: "var(--c-text-muted)" },
  { id: 1, label: "Identifié", court: "N1", desc: "Identité et informations essentielles vérifiées.", color: "#6B7A8F" },
  { id: 2, label: "Vérifié", court: "N2", desc: "Identité vérifiée et premières activités ou preuves confirmées.", color: "#2E6E86" },
  { id: 3, label: "Vérifié", court: "N3", desc: "Critères principaux satisfaits ; preuves suffisantes et cohérentes.", color: "var(--c-accent-dark)" },
  { id: 4, label: "Vérifié — historique confirmé", court: "N4", desc: "Historique solide, activités régulières, preuves nombreuses et cohérentes.", color: "#1F7A4D" },
  { id: 5, label: "Organisation de référence sur la plateforme", court: "N5", desc: "Niveau maximal : fiabilité, transparence, régularité et qualité durables.", color: "#8A6318" },
];
function verifNiveauInfo(n) { return VERIF_NIVEAUX[Math.max(0, Math.min(5, n || 0))]; }

const VERIF_STATUTS = {
  aucune: { label: "Aucune vérification", color: "var(--c-text-muted)" },
  active: { label: "Active", color: "var(--c-accent-dark)" },
  en_reevaluation: { label: "En réévaluation", color: "#E3A73B" },
  suspendue: { label: "Suspendue", color: "#B5451B" },
  revoquee: { label: "Révoquée", color: "#7A1F1F" },
  expiree: { label: "Expirée", color: "var(--c-text-faint)" },
};

const VERIF_DOC_TYPES = ["Statuts / enregistrement légal", "Récépissé / agrément officiel", "Pièce d'identité du responsable", "Rapport d'activité", "Attestation de partenariat", "Justificatif financier", "Autre document"];

const VERIF_PREUVE_TYPES = [
  { id: "photo", label: "Photographie" },
  { id: "video", label: "Vidéo" },
  { id: "rapport", label: "Rapport" },
  { id: "document", label: "Document" },
  { id: "gps", label: "Coordonnées GPS" },
  { id: "temoignage", label: "Témoignage" },
  { id: "validation_externe", label: "Validation externe" },
];

const VERIF_MOTIFS_REJET = [
  { id: "preuve_insuffisante", label: "Preuve insuffisante" },
  { id: "document_invalide", label: "Document invalide" },
  { id: "information_incoherente", label: "Information incohérente" },
  { id: "localisation_non_verifiable", label: "Localisation non vérifiable" },
  { id: "date_incoherente", label: "Date incohérente" },
  { id: "doublon", label: "Doublon" },
  { id: "ne_correspond_pas_activite", label: "Ne correspond pas à l'activité" },
  { id: "origine_non_verifiable", label: "Origine non vérifiable" },
  { id: "autre", label: "Autre" },
];

const VERIF_HISTORIQUE_LABELS = {
  demande_creee: "Demande créée",
  document_ajoute: "Document ajouté",
  document_accepte: "Document accepté",
  document_rejete: "Document rejeté",
  preuve_ajoutee: "Preuve ajoutée",
  preuve_acceptee: "Preuve acceptée",
  preuve_rejetee: "Preuve rejetée",
  informations_demandees: "Informations complémentaires demandées",
  verification_approuvee: "Vérification approuvée",
  verification_refusee: "Vérification refusée",
  niveau_modifie: "Niveau modifié",
  score_modifie: "Score modifié",
  verification_suspendue: "Vérification suspendue",
  verification_revoquee: "Vérification révoquée",
  verification_renouvelee: "Vérification renouvelée",
  statut_verification_modifie: "Statut de vérification modifié",
  dossier_soumis: "Dossier d'inscription soumis",
  etape_dossier_modifiee: "Étape du dossier modifiée",
};

async function logVerifHistorique(organisationId, evenement, acteur, detail) {
  try {
    await supabase.from("org_verification_historique").insert({
      organisation_id: organisationId, evenement, acteur, detail: detail || null,
    });
  } catch (e) { /* journal best-effort */ }
}

function VerifBadge({ color, children }) {
  return <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: color, color: "#fff", whiteSpace: "nowrap" }}>{children}</span>;
}

// Petit champ fichier générique (image ou document) réutilisé pour les
// pièces justificatives et les preuves du dossier de vérification.
function VerifFileInput({ value, onChange, label }) {
  const [busy, setBusy] = useState(false);
  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
      const isImg = f.type && f.type.startsWith("image/");
      const finalDataUrl = isImg ? await compressImage(dataUrl) : dataUrl;
      const url = await uploadPhotoGeneric(finalDataUrl, "verifications");
      if (url) onChange(url);
      else alert("Échec de l'envoi du fichier. Réessaie.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>{label || "Fichier"}</div>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: "var(--c-accent-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>Voir le fichier joint</a>
          <button type="button" onClick={() => onChange(null)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "3px 8px", fontSize: 10.5, cursor: "pointer", color: "var(--c-text-muted)" }}>Retirer</button>
        </div>
      ) : (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1.5px dashed var(--c-text-faint)", fontSize: 11.5, color: "var(--c-text-secondary)", cursor: "pointer" }}>
          <input type="file" onChange={handleFile} style={{ display: "none" }} />
          {busy ? "Envoi…" : "Joindre un fichier"}
        </label>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Vue liste : toutes les organisations avec leur état de vérification
// ------------------------------------------------------------
function AdminVerification({ isSuperAdmin, adminEmail }) {
  const [organisations, setOrganisations] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filtre, setFiltre] = useState("toutes");

  async function charger() {
    const { data } = await supabase.from("organisations").select("*").eq("is_deleted", false).order("created_at", { ascending: false });
    setOrganisations(data || []);
  }
  useEffect(() => { charger(); }, []);

  if (selected) {
    return (
      <VerificationDossier
        organisationId={selected}
        adminEmail={adminEmail}
        isSuperAdmin={isSuperAdmin}
        onBack={() => { setSelected(null); charger(); }}
      />
    );
  }

  if (organisations === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;

  const filtered = organisations.filter(o => {
    if (filtre === "toutes") return true;
    if (filtre === "a_traiter") return o.statut_verification === "aucune" || o.statut_verification === "en_reevaluation";
    return o.statut_verification === filtre;
  });

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
        Vérification interne des <strong>organisations</strong> par l'équipe EcoVigil, sur la base des documents et preuves soumis sur la plateforme. Ce niveau ne constitue pas une certification légale, réglementaire ou institutionnelle. Il ne certifie pas non plus les groupes de terrain de l'organisation, ni ses signalements.
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {[["toutes", "Toutes"], ["a_traiter", "À traiter"], ["active", "Actives"], ["suspendue", "Suspendues"], ["revoquee", "Révoquées"]].map(([id, label]) => (
          <button key={id} onClick={() => setFiltre(id)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: filtre === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: filtre === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: filtre === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 20 }}>Aucune organisation ici.</div>}

      <div className="pace-grid-cards" style={{ gap: 10 }}>
        {filtered.map(o => {
          const niv = verifNiveauInfo(o.niveau_verification);
          const st = VERIF_STATUTS[o.statut_verification] || VERIF_STATUTS.aucune;
          return (
            <button key={o.id} onClick={() => setSelected(o.id)} style={{
              textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>{o.nom}</div>
                  <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{o.type === "ong" ? "ONG" : "Gouvernement"} · {[o.ville, o.pays].filter(Boolean).join(", ") || "zone non précisée"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                  <VerifBadge color={niv.color}>{niv.court} · {niv.label}</VerifBadge>
                  <VerifBadge color={st.color}>{st.label}</VerifBadge>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 8 }}>Score de confiance : <strong>{o.score_confiance || 0}/100</strong></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Dossier de vérification d'une organisation
// ------------------------------------------------------------
function VerificationDossier({ organisationId, adminEmail, isSuperAdmin, onBack }) {
  const [org, setOrg] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [preuves, setPreuves] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [activites, setActivites] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [defisIndex, setDefisIndex] = useState({});
  const [busy, setBusy] = useState(false);

  const [niveauEdit, setNiveauEdit] = useState(0);
  const [scoreEdit, setScoreEdit] = useState(0);

  const [showDocForm, setShowDocForm] = useState(false);
  const [showPreuveForm, setShowPreuveForm] = useState(false);
  const [decisionEnCours, setDecisionEnCours] = useState(null); // "approuver" | "demander_informations" | "refuser"
  const [justification, setJustification] = useState("");
  const [observations, setObservations] = useState("");

  async function charger() {
    const [{ data: o }, { data: docs }, { data: pv }, { data: gr }, { data: act }, { data: dec }, { data: hist }, { data: defis }] = await Promise.all([
      supabase.from("organisations").select("*").eq("id", organisationId).single(),
      supabase.from("org_verification_documents").select("*").eq("organisation_id", organisationId).order("created_at", { ascending: false }),
      supabase.from("org_verification_preuves").select("*").eq("organisation_id", organisationId).order("created_at", { ascending: false }),
      supabase.from("gt_groupes").select("*").eq("organisation_id", organisationId).eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("org_activites").select("*").eq("organisation_id", organisationId).order("date_debut", { ascending: false }),
      supabase.from("org_verification_decisions").select("*").eq("organisation_id", organisationId).order("decided_at", { ascending: false }),
      supabase.from("org_verification_historique").select("*").eq("organisation_id", organisationId).order("created_at", { ascending: false }),
      supabase.from("env_defis").select("id, nom"),
    ]);
    setOrg(o || null);
    setDocuments(docs || []);
    setPreuves(pv || []);
    setGroupes(gr || []);
    setActivites(act || []);
    setDecisions(dec || []);
    setHistorique(hist || []);
    const idx = {}; (defis || []).forEach(d => { idx[d.id] = champTexte(d.nom) || d.id; });
    setDefisIndex(idx);
    if (o) { setNiveauEdit(o.niveau_verification || 0); setScoreEdit(o.score_confiance || 0); }
  }
  useEffect(() => { charger(); }, [organisationId]);

  async function actorLog(action, detail) {
    await logAudit(`verification_${action}`, "organisations", organisationId, detail || null, { organisation: org ? org.nom : null });
    await logVerifHistorique(organisationId, action, adminEmail, detail || null);
  }

  // -- Documents --------------------------------------------------
  async function ajouterDocument(payload) {
    setBusy(true);
    await supabase.from("org_verification_documents").insert({ organisation_id: organisationId, ...payload, created_by: adminEmail });
    await actorLog("document_ajoute", payload.type);
    setShowDocForm(false);
    setBusy(false);
    charger();
  }
  async function statuerDocument(doc, statut) {
    let motif = null;
    if (statut === "rejete") { motif = prompt("Motif du rejet du document (obligatoire) :"); if (!motif) return; }
    setBusy(true);
    await supabase.from("org_verification_documents").update({
      statut, motif_rejet: motif, verifie_par: adminEmail, verifie_le: new Date().toISOString(),
    }).eq("id", doc.id);
    await actorLog(statut === "accepte" ? "document_accepte" : "document_rejete", motif || doc.type);
    setBusy(false);
    charger();
  }

  // -- Preuves ------------------------------------------------------
  async function ajouterPreuve(payload) {
    setBusy(true);
    await supabase.from("org_verification_preuves").insert({ organisation_id: organisationId, ...payload, created_by: adminEmail });
    await actorLog("preuve_ajoutee", payload.type);
    setShowPreuveForm(false);
    setBusy(false);
    charger();
  }
  async function statuerPreuve(preuve, statut, motifRejet, motifDetail) {
    setBusy(true);
    await supabase.from("org_verification_preuves").update({
      statut, motif_rejet: statut === "rejetee" ? motifRejet : null, motif_detail: statut === "rejetee" ? (motifDetail || null) : null,
      verifie_par: adminEmail, verifie_le: new Date().toISOString(),
    }).eq("id", preuve.id);
    await actorLog(statut === "acceptee" ? "preuve_acceptee" : "preuve_rejetee", statut === "rejetee" ? (VERIF_MOTIFS_REJET.find(m => m.id === motifRejet) || {}).label : preuve.type);
    setBusy(false);
    charger();
  }

  // -- Niveau / score -------------------------------------------------
  async function enregistrerNiveauScore() {
    setBusy(true);
    const changements = [];
    if (org && niveauEdit !== org.niveau_verification) changements.push(actorLog("niveau_modifie", `${verifNiveauInfo(org.niveau_verification).label} → ${verifNiveauInfo(niveauEdit).label}`));
    if (org && scoreEdit !== org.score_confiance) changements.push(actorLog("score_modifie", `${org.score_confiance || 0}/100 → ${scoreEdit}/100`));
    await supabase.from("organisations").update({
      niveau_verification: niveauEdit, score_confiance: scoreEdit, derniere_verification: new Date().toISOString(),
    }).eq("id", organisationId);
    await Promise.all(changements);
    setBusy(false);
    charger();
  }

  // -- Décision du Centre d'EcoVigil ----------------------------------
  async function soumettreDecision() {
    if (!justification.trim()) { alert("La justification est obligatoire."); return; }
    setBusy(true);
    const elementsExamines = {
      documents_acceptes: documents.filter(d => d.statut === "accepte").length,
      documents_rejetes: documents.filter(d => d.statut === "rejete").length,
      preuves_acceptees: preuves.filter(p => p.statut === "acceptee").length,
      preuves_rejetees: preuves.filter(p => p.statut === "rejetee").length,
      groupes_rattaches: groupes.length,
      activites_declarees: activites.length,
    };
    await supabase.from("org_verification_decisions").insert({
      organisation_id: organisationId, decision: decisionEnCours,
      niveau_attribue: niveauEdit, score_confiance: scoreEdit,
      justification: justification.trim(), observations: observations.trim() || null,
      elements_examines: elementsExamines, decide_par: adminEmail,
    });

    const patch = { derniere_verification: new Date().toISOString() };
    if (decisionEnCours === "approuver") {
      patch.niveau_verification = niveauEdit;
      patch.score_confiance = scoreEdit;
      patch.statut_verification = "active";
      patch.date_verification = new Date().toISOString();
      const prochaine = new Date(); prochaine.setDate(prochaine.getDate() + 180);
      patch.prochaine_reevaluation = prochaine.toISOString();
    } else if (decisionEnCours === "refuser") {
      patch.statut_verification = "aucune";
      patch.score_confiance = scoreEdit;
    } else {
      patch.statut_verification = org.statut_verification === "aucune" ? "aucune" : "en_reevaluation";
    }
    await supabase.from("organisations").update(patch).eq("id", organisationId);

    const evt = decisionEnCours === "approuver" ? "verification_approuvee" : decisionEnCours === "refuser" ? "verification_refusee" : "informations_demandees";
    await actorLog(evt, justification.trim());

    setDecisionEnCours(null); setJustification(""); setObservations("");
    setBusy(false);
    charger();
  }

  // -- Cycle de vie -----------------------------------------------------
  async function changerStatutVerification(nouveauStatut) {
    const motif = prompt(`Motif du passage au statut « ${VERIF_STATUTS[nouveauStatut].label} » (obligatoire) :`);
    if (!motif) return;
    setBusy(true);
    await supabase.from("organisations").update({ statut_verification: nouveauStatut }).eq("id", organisationId);
    const evt = nouveauStatut === "suspendue" ? "verification_suspendue" : nouveauStatut === "revoquee" ? "verification_revoquee" : nouveauStatut === "active" ? "verification_renouvelee" : "statut_verification_modifie";
    await actorLog(evt, motif);
    setBusy(false);
    charger();
  }

  if (!org) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement du dossier…</div>;

  const niv = verifNiveauInfo(org.niveau_verification);
  const st = VERIF_STATUTS[org.statut_verification] || VERIF_STATUTS.aucune;

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer", marginBottom: 12, padding: 0 }}>
        <IconChevronLeft size={14} /> Toutes les organisations
      </button>

      {/* A — Identité */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600 }}>{org.nom}</div>
            <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{org.type === "ong" ? "ONG" : "Gouvernement"} · {org.email}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
            <VerifBadge color={niv.color}>{niv.court} · {niv.label}</VerifBadge>
            <VerifBadge color={st.color}>{st.label}</VerifBadge>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", lineHeight: 1.6 }}>
          <div><strong>Zone d'intervention :</strong> {[org.ville, org.pays].filter(Boolean).join(", ") || "non précisée"}</div>
          <div><strong>Domaine(s) :</strong> {(org.defis || []).map(id => defisIndex[id] || id).join(", ") || "aucun"}</div>
          {org.numero_agrement && <div><strong>N° d'agrément / acte légal :</strong> {org.numero_agrement}</div>}
          {org.representant_nom && <div><strong>Représentant légal :</strong> {org.representant_nom}{org.representant_fonction ? ` (${org.representant_fonction})` : ""}</div>}
          {org.adresse_officielle && <div><strong>Adresse officielle :</strong> {org.adresse_officielle}</div>}
          <div><strong>Compte plateforme :</strong> {(ORG_ADMIN_STATUTS[org.statut] || { label: org.statut }).label}</div>
          <div><strong>Étape du dossier d'admission :</strong> {(ETAPE_DOSSIER_INFO[org.etape_dossier] || {}).label || org.etape_dossier}</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 10.5, color: "var(--c-text-muted)" }}>
          <span>{groupes.length} groupe(s) de terrain</span>
          <span>{activites.length} activité(s)</span>
          <span>{preuves.filter(p => p.statut === "acceptee").length} preuve(s) acceptée(s)</span>
          <span>{preuves.filter(p => p.statut === "rejetee").length} preuve(s) rejetée(s)</span>
        </div>
        {org.date_verification && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>Vérifiée le {new Date(org.date_verification).toLocaleDateString("fr-FR")} · Dernière vérification {org.derniere_verification ? new Date(org.derniere_verification).toLocaleDateString("fr-FR") : "—"} · Prochaine réévaluation {org.prochaine_reevaluation ? new Date(org.prochaine_reevaluation).toLocaleDateString("fr-FR") : "—"}</div>}
      </div>

      {/* B — Documents justificatifs */}
      <DossierSection title="Documents justificatifs" count={documents.length} action={<button onClick={() => setShowDocForm(v => !v)} style={miniBtnStyle}>{showDocForm ? "Annuler" : "+ Ajouter"}</button>}>
        {showDocForm && <DocumentForm onSubmit={ajouterDocument} busy={busy} />}
        {documents.length === 0 && <EmptyNote>Aucun document soumis.</EmptyNote>}
        {documents.map(d => (
          <div key={d.id} style={itemCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{d.type}</div>
                {d.reference && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Réf. {d.reference}</div>}
                {d.date_document && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Daté du {new Date(d.date_document).toLocaleDateString("fr-FR")}</div>}
              </div>
              <StatutBadge statut={d.statut} labels={{ a_examiner: "À examiner", accepte: "Accepté", rejete: "Rejeté" }} colors={{ a_examiner: "#E3A73B", accepte: "var(--c-accent-dark)", rejete: "#B5451B" }} />
            </div>
            {d.fichier_url && <a href={d.fichier_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--c-accent-dark)" }}>Voir le fichier</a>}
            {d.motif_rejet && <div style={{ fontSize: 10.5, color: "#B5451B", marginTop: 4 }}>Motif : {d.motif_rejet}</div>}
            {d.statut === "a_examiner" && (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button disabled={busy} onClick={() => statuerDocument(d, "accepte")} style={acceptBtnStyle}>Accepter</button>
                <button disabled={busy} onClick={() => statuerDocument(d, "rejete")} style={rejectBtnStyle}>Rejeter</button>
              </div>
            )}
          </div>
        ))}
      </DossierSection>

      {/* C — Activités (lecture seule) */}
      <DossierSection title="Activités déclarées" count={activites.length}>
        {activites.length === 0 && <EmptyNote>Aucune activité enregistrée sur la plateforme.</EmptyNote>}
        {activites.map(a => (
          <div key={a.id} style={itemCardStyle}>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>{a.titre}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>
              {a.type || "activité"} · {a.lieu || "lieu non précisé"} · {a.date_debut ? new Date(a.date_debut).toLocaleDateString("fr-FR") : "date inconnue"} · {a.statut}
            </div>
          </div>
        ))}
      </DossierSection>

      {/* D — Preuves */}
      <DossierSection title="Preuves" count={preuves.length} action={<button onClick={() => setShowPreuveForm(v => !v)} style={miniBtnStyle}>{showPreuveForm ? "Annuler" : "+ Ajouter"}</button>}>
        {showPreuveForm && <PreuveForm activites={activites} onSubmit={ajouterPreuve} busy={busy} />}
        {preuves.length === 0 && <EmptyNote>Aucune preuve fournie. Une preuve n'est jamais valide du seul fait qu'elle a été fournie : chacune doit être examinée.</EmptyNote>}
        {preuves.map(p => (
          <PreuveItem key={p.id} preuve={p} onStatuer={statuerPreuve} busy={busy} />
        ))}
      </DossierSection>

      {/* E — Groupes de terrain (lecture seule, distincts de la vérification) */}
      <DossierSection title="Groupes de terrain rattachés" count={groupes.length}>
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
          Un groupe n'est jamais vérifié individuellement : il hérite seulement de l'affichage du niveau de son organisation de rattachement.
        </div>
        {groupes.length === 0 && <EmptyNote>Aucun groupe de terrain rattaché.</EmptyNote>}
        {groupes.map(g => (
          <div key={g.id} style={itemCardStyle}>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>{g.nom} <span style={{ fontWeight: 400, color: "var(--c-text-muted)", fontSize: 10.5 }}>· {g.code_groupe}</span></div>
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{g.objectif || "sans objectif déclaré"} · statut : {g.statut}</div>
          </div>
        ))}
      </DossierSection>

      {/* F — Score de confiance & niveau */}
      <DossierSection title="Niveau &amp; score de confiance">
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
          Le score de confiance de l'organisation ne détermine jamais la fiabilité d'un signalement : chaque signalement garde sa propre vérification.
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Niveau de vérification</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
          {VERIF_NIVEAUX.map(n => (
            <button key={n.id} onClick={() => setNiveauEdit(n.id)} style={{
              padding: "8px 4px", borderRadius: 10, fontSize: 10.5, fontWeight: 600, cursor: "pointer", textAlign: "center",
              border: niveauEdit === n.id ? `2px solid ${n.color}` : "1px solid var(--c-border)",
              background: niveauEdit === n.id ? "var(--c-surface-soft)" : "var(--c-surface)", color: niveauEdit === n.id ? n.color : "var(--c-text-secondary)" }}>
              {n.court}<br />{n.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 12 }}>{verifNiveauInfo(niveauEdit).desc}</div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Score de confiance : {scoreEdit}/100</div>
        <input type="range" min="0" max="100" value={scoreEdit} onChange={e => setScoreEdit(parseInt(e.target.value, 10))} style={{ width: "100%", marginBottom: 12 }} />

        <button disabled={busy} onClick={enregistrerNiveauScore} style={{ ...primaryBtnStyle, width: "100%" }}>Enregistrer le niveau et le score</button>
      </DossierSection>

      {/* G — Décision du Centre d'EcoVigil */}
      <DossierSection title="Décision du Centre d'EcoVigil">
        {!decisionEnCours ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button disabled={busy} onClick={() => setDecisionEnCours("approuver")} style={{ ...primaryBtnStyle, width: "100%" }}>✓ Approuver la vérification</button>
            <button disabled={busy} onClick={() => setDecisionEnCours("demander_informations")} style={{ ...secondaryBtnStyle, width: "100%" }}>Demander des informations complémentaires</button>
            <button disabled={busy} onClick={() => setDecisionEnCours("refuser")} style={{ ...rejectBtnStyle, width: "100%", padding: "10px 0" }}>✕ Refuser</button>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8 }}>
              {decisionEnCours === "approuver" ? "Approuver la vérification" : decisionEnCours === "refuser" ? "Refuser la vérification" : "Demander des informations complémentaires"}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Justification (obligatoire)</div>
            <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3} style={textareaStyle} placeholder="Éléments examinés, motif de la décision…" />
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", margin: "8px 0 5px" }}>Observations (optionnel)</div>
            <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={2} style={textareaStyle} placeholder="Notes internes…" />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => { setDecisionEnCours(null); setJustification(""); setObservations(""); }} style={{ ...secondaryBtnStyle, flex: 1 }}>Annuler</button>
              <button disabled={busy || !justification.trim()} onClick={soumettreDecision} style={{ ...primaryBtnStyle, flex: 1 }}>Confirmer</button>
            </div>
          </div>
        )}

        {decisions.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Décisions précédentes</div>
            {decisions.map(d => (
              <div key={d.id} style={{ ...itemCardStyle, marginBottom: 6 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600 }}>{d.decision === "approuver" ? "Approuvée" : d.decision === "refuser" ? "Refusée" : "Informations demandées"} — niveau {d.niveau_attribue} · score {d.score_confiance}/100</div>
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{d.decide_par} · {new Date(d.decided_at).toLocaleString("fr-FR")}</div>
                <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 3 }}>{d.justification}</div>
              </div>
            ))}
          </div>
        )}
      </DossierSection>

      {/* H — Cycle de vie */}
      <DossierSection title="Cycle de vie de la vérification">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.keys(VERIF_STATUTS).filter(s => s !== "aucune" && s !== org.statut_verification).map(s => (
            <button key={s} disabled={busy} onClick={() => changerStatutVerification(s)} style={{
              fontSize: 10.5, padding: "6px 11px", borderRadius: 8, cursor: "pointer", fontWeight: 600,
              border: `1px solid ${VERIF_STATUTS[s].color}`, background: "var(--c-surface)", color: VERIF_STATUTS[s].color }}>
              Passer à « {VERIF_STATUTS[s].label} »
            </button>
          ))}
        </div>
      </DossierSection>

      {/* I — Traçabilité */}
      <DossierSection title="Historique &amp; traçabilité" count={historique.length}>
        {historique.length === 0 && <EmptyNote>Aucun évènement enregistré.</EmptyNote>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
          {historique.map(h => (
            <div key={h.id} style={{ fontSize: 11, borderLeft: "2px solid var(--c-border)", paddingLeft: 10 }}>
              <div style={{ fontWeight: 600 }}>{VERIF_HISTORIQUE_LABELS[h.evenement] || h.evenement}</div>
              <div style={{ color: "var(--c-text-muted)", fontSize: 10.5 }}>{h.acteur} · {new Date(h.created_at).toLocaleString("fr-FR")}</div>
              {h.detail && <div style={{ color: "var(--c-text-secondary)", fontSize: 10.5 }}>{h.detail}</div>}
            </div>
          ))}
        </div>
      </DossierSection>
    </div>
  );
}

function DossierSection({ title, count, action, children }) {
  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--c-text)" }}>{title}{typeof count === "number" && <span style={{ color: "var(--c-text-muted)", fontWeight: 400 }}> ({count})</span>}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ children }) { return <div style={{ fontSize: 11, color: "var(--c-text-muted)", padding: "6px 0" }}>{children}</div>; }

function StatutBadge({ statut, labels, colors }) {
  return <VerifBadge color={colors[statut] || "var(--c-text-muted)"}>{labels[statut] || statut}</VerifBadge>;
}

const itemCardStyle = { background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 10, marginBottom: 8 };
const miniBtnStyle = { fontSize: 10.5, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", cursor: "pointer" };
const acceptBtnStyle = { flex: 1, fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer" };
const rejectBtnStyle = { flex: 1, fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", cursor: "pointer" };
const primaryBtnStyle = { padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const secondaryBtnStyle = { padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const textareaStyle = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" };

function DocumentForm({ onSubmit, busy }) {
  const [type, setType] = useState(VERIF_DOC_TYPES[0]);
  const [reference, setReference] = useState("");
  const [dateDocument, setDateDocument] = useState("");
  const [fichierUrl, setFichierUrl] = useState(null);
  return (
    <div style={{ ...itemCardStyle, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Type de document</div>
      <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
        {VERIF_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Référence (optionnel)</div>
      <input value={reference} onChange={e => setReference(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Date du document (optionnel)</div>
      <input type="date" value={dateDocument} onChange={e => setDateDocument(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <VerifFileInput value={fichierUrl} onChange={setFichierUrl} label="Fichier joint" />
      <button disabled={busy} onClick={() => onSubmit({ type, reference: reference || null, date_document: dateDocument || null, fichier_url: fichierUrl })} style={{ ...primaryBtnStyle, width: "100%" }}>Ajouter le document</button>
    </div>
  );
}

function PreuveForm({ activites, onSubmit, busy }) {
  const [type, setType] = useState("photo");
  const [activiteId, setActiviteId] = useState("");
  const [description, setDescription] = useState("");
  const [datePreuve, setDatePreuve] = useState("");
  const [url, setUrl] = useState(null);
  return (
    <div style={{ ...itemCardStyle, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Type de preuve</div>
      <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
        {VERIF_PREUVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      {activites.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Activité liée (optionnel)</div>
          <select value={activiteId} onChange={e => setActiviteId(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
            <option value="">Aucune activité liée</option>
            {activites.map(a => <option key={a.id} value={a.id}>{a.titre}</option>)}
          </select>
        </>
      )}
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Description</div>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 10 }} placeholder="Ce que cette preuve démontre…" />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Date de la preuve (optionnel)</div>
      <input type="date" value={datePreuve} onChange={e => setDatePreuve(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <VerifFileInput value={url} onChange={setUrl} label="Photo, vidéo ou document" />
      <button disabled={busy} onClick={() => onSubmit({ type, activite_id: activiteId || null, description: description || null, date_preuve: datePreuve ? new Date(datePreuve).toISOString() : null, url })} style={{ ...primaryBtnStyle, width: "100%" }}>Ajouter la preuve</button>
    </div>
  );
}

function PreuveItem({ preuve, onStatuer, busy }) {
  const [showRejet, setShowRejet] = useState(false);
  const [motifRejet, setMotifRejet] = useState(VERIF_MOTIFS_REJET[0].id);
  const [motifDetail, setMotifDetail] = useState("");
  const typeLabel = (VERIF_PREUVE_TYPES.find(t => t.id === preuve.type) || {}).label || preuve.type;
  return (
    <div style={itemCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{typeLabel}</div>
        <StatutBadge statut={preuve.statut} labels={{ a_examiner: "À examiner", acceptee: "Acceptée", rejetee: "Rejetée" }} colors={{ a_examiner: "#E3A73B", acceptee: "var(--c-accent-dark)", rejetee: "#B5451B" }} />
      </div>
      {preuve.description && <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 3 }}>{preuve.description}</div>}
      {preuve.url && <a href={preuve.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--c-accent-dark)" }}>Voir le fichier</a>}
      {preuve.date_preuve && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Datée du {new Date(preuve.date_preuve).toLocaleDateString("fr-FR")}</div>}
      {preuve.motif_rejet && (
        <div style={{ fontSize: 10.5, color: "#B5451B", marginTop: 4 }}>
          Motif : {(VERIF_MOTIFS_REJET.find(m => m.id === preuve.motif_rejet) || {}).label || preuve.motif_rejet}{preuve.motif_detail ? ` — ${preuve.motif_detail}` : ""}
        </div>
      )}
      {preuve.statut === "a_examiner" && !showRejet && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button disabled={busy} onClick={() => onStatuer(preuve, "acceptee")} style={acceptBtnStyle}>Accepter</button>
          <button disabled={busy} onClick={() => setShowRejet(true)} style={rejectBtnStyle}>Rejeter</button>
        </div>
      )}
      {showRejet && (
        <div style={{ marginTop: 8 }}>
          <select value={motifRejet} onChange={e => setMotifRejet(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12, marginBottom: 6, boxSizing: "border-box" }}>
            {VERIF_MOTIFS_REJET.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <textarea value={motifDetail} onChange={e => setMotifDetail(e.target.value)} rows={2} placeholder="Détail (optionnel)…" style={{ ...textareaStyle, marginBottom: 6 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowRejet(false)} style={{ ...secondaryBtnStyle, flex: 1, padding: "7px 0", fontSize: 11.5 }}>Annuler</button>
            <button disabled={busy} onClick={() => { onStatuer(preuve, "rejetee", motifRejet, motifDetail); setShowRejet(false); }} style={{ ...rejectBtnStyle, flex: 1 }}>Confirmer le rejet</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Enquête environnementale standard (dossiers) — s'ajoute au constructeur libre, ne le remplace pas =====
const ENQ_TYPE_ENQUETE = [["observation","Observation environnementale"],["communautaire","Enquête communautaire"],["controle","Contrôle environnemental"],["suivi_signalement","Suivi d'un signalement"],["evaluation_site","Évaluation d'un site"],["suivi_enquete","Suivi d'une enquête précédente"],["autre","Autre"]];
const ENQ_CATEGORIES = [
  ["dechets", "Déchets et pollution", [["dechets_menagers","Déchets ménagers"],["plastiques","Plastiques"],["dechets_electroniques","Déchets électroniques"],["dechets_medicaux","Déchets médicaux"],["dechets_dangereux","Déchets dangereux"],["decharge_sauvage","Décharge sauvage"],["brulage_dechets","Brûlage de déchets"],["deversement_dechets","Déversement de déchets"]]],
  ["eau", "Eau", [["pollution_riviere","Pollution de rivière"],["pollution_lac","Pollution de lac"],["pollution_source","Pollution de source"],["pollution_puits","Pollution de puits"],["pollution_eaux_souterraines","Pollution des eaux souterraines"],["deversement_eau","Déversement dans l'eau"],["assechement","Assèchement d'un point d'eau"],["eutrophisation","Eutrophisation"],["mortalite_poissons","Mortalité de poissons"],["degradation_zones_humides","Dégradation des zones humides"]]],
  ["forets", "Forêts et végétation", [["deforestation","Déforestation"],["coupe_abusive","Coupe abusive de bois"],["defrichement","Défrichement"],["feu_brousse","Feu de brousse"],["destruction_mangrove","Destruction de mangrove"],["destruction_vegetation","Destruction de végétation"]]],
  ["sols", "Sols et terres", [["erosion","Érosion"],["pollution_sols","Pollution des sols"],["degradation_terres","Dégradation des terres"],["extraction_sable","Extraction de sable"],["carriere","Carrière"],["desertification","Désertification"]]],
  ["mines", "Mines et ressources naturelles", [["exploitation_miniere","Exploitation minière"],["orpaillage","Orpaillage"],["exploitation_carriere","Exploitation de carrière"],["pollution_miniere","Pollution minière"],["degradation_site_minier","Dégradation d'un site minier"],["substances_dangereuses","Utilisation de substances dangereuses"]]],
  ["biodiversite", "Biodiversité", [["destruction_habitat","Destruction d'habitat"],["braconnage","Braconnage"],["capture_especes","Capture d'espèces"],["mortalite_animale","Mortalité animale"],["menace_espece","Menace sur une espèce"],["destruction_zone_reproduction","Destruction de zone de reproduction"]]],
  ["air", "Air", [["pollution_atmospherique","Pollution atmosphérique"],["fumees","Fumées"],["poussieres","Poussières"],["emissions_industrielles","Émissions industrielles"],["odeurs_polluantes","Odeurs polluantes"],["brulage_ciel_ouvert","Brûlage à ciel ouvert"]]],
  ["risques", "Risques industriels et chimiques", [["fuite_chimique","Fuite chimique"],["deversement_hydrocarbures","Déversement d'hydrocarbures"],["fuite_carburant","Fuite de carburant"],["accident_industriel","Accident industriel"],["stockage_dangereux","Stockage dangereux"],["incendie_impact","Incendie à impact environnemental"]]],
  ["littoral", "Littoral et milieux marins", [["pollution_marine","Pollution marine"],["dechets_littoral","Déchets sur le littoral"],["erosion_cotiere","Érosion côtière"],["degradation_mangrove_littoral","Dégradation de mangrove"],["destruction_habitat_marin","Destruction d'habitat marin"]]],
  ["climat", "Climat et phénomènes extrêmes", [["secheresse","Sécheresse"],["inondation","Inondation"],["evenement_climatique","Événement climatique extrême"],["degradation_climatique","Dégradation liée au changement climatique"]]],
  ["urbanisation", "Urbanisation", [["occupation_zone_sensible","Occupation d'une zone sensible"],["construction_zone_naturelle","Construction dans une zone naturelle"],["destruction_espace_vert","Destruction d'espace vert"],["artificialisation_sols","Artificialisation des sols"]]],
  ["autre_groupe", "Autre problème environnemental", [["autre","Autre (préciser)"]]],
];
const ENQ_CAT_FLAT = ENQ_CATEGORIES.flatMap(([gk, gl, subs]) => subs.map(([sk, sl]) => [sk, sl, gk, gl]));
const ENQ_ACTIONS = ["Aucune","Sensibilisation","Signalement","Intervention","Mise en sécurité","Autre"];
const ENQ_NIVEAUX = [
  ["mineur","Mineur","Impact limité et réversible rapidement, sans risque pour la population."],
  ["modere","Modéré","Impact localisé et réversible, risque limité."],
  ["majeur","Majeur","Impact significatif, zone étendue ou risque notable pour les ressources naturelles."],
  ["grave","Grave","Impact important, dégradation durable ou risque réel pour la population."],
  ["tres_grave","Très grave","Impact sévère et étendu, ou risque important et immédiat."],
  ["critique","Critique","Danger immédiat pour la population, les écosystèmes ou les ressources naturelles ; intervention urgente."],
  ["a_determiner","À déterminer",""],
];
const ENQ_GRAVITE_PREUVE_OBLIGATOIRE = ["grave","tres_grave","critique"];
// Couleurs pour la cartographie EcoVigil (marqueurs des dossiers d'enquête validés), du moins
// grave au plus grave — cohérent avec les teintes déjà utilisées ailleurs pour l'urgence.
const ENQ_NIVEAU_COULEUR = { mineur: "#4CAF50", modere: "#8A9A1B", majeur: "#D4A017", grave: "#E3A73B", tres_grave: "#B5451B", critique: "#7A1F1F", a_determiner: "#6B7A8F" };
function nomTypeEnqueteCarte(id) { return (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[1] || "—"; }
const ENQ_IMPACT_DOMAINES = ["Eau","Sols","Air","Végétation","Faune","Biodiversité","Habitats naturels","Population","Activités économiques locales"];
const ENQ_IMPACT_NIVEAUX = [["aucun","Aucun"],["faible","Faible"],["moyen","Moyen"],["eleve","Élevé"],["critique","Critique"]];
const ENQ_IMPACT_JUSTIF_REQUISE = ["eleve","critique"];
const ENQ_NATURES = [["observe","Observé"],["declare","Déclaré par un tiers"],["suppose","Supposé"],["a_verifier","À vérifier"]];
const ENQ_STATUTS = { brouillon: "Brouillon", en_cours: "En cours", terminee: "Terminée", verifiee: "Vérifiée", a_revoir: "À revoir", rejetee: "Rejetée" };
const ENQ_ETAPES = ["Identification", "Localisation", "Constat", "Impacts & acteurs", "Preuves", "Niveau & actions", "Aperçu"];
const ENQ_PREUVES = [["photo","Photo"],["audio","Enregistrement audio"],["video","Vidéo"],["document","Document"],["temoignage","Témoignage"],["releve_gps","Relevé GPS"],["mesure","Mesure"],["materiel","Matériel utilisé"],["autre","Autre"]];

// Statuts du cycle de vie d'une transcription manuelle d'enregistrement audio (voir
// TranscriptionAudio) — mêmes noms que côté base (contrainte CHECK sur la table
// enquete_preuve_transcriptions), pour éviter toute divergence entre client et serveur.
const TRANSCRIPTION_STATUTS = { brouillon: "Brouillon", soumise: "Soumise", a_revoir: "À revoir", verifiee: "Vérifiée", validee: "Validée", rejetee: "Rejetée" };

// Carte cliquable : toucher la carte place ou corrige la position du constat
function PositionPicker({ lat, lng, onPick }) {
  const el = useRef(null), map = useRef(null), mk = useRef(null), cb = useRef(onPick); cb.current = onPick;
  useEffect(() => {
    if (!el.current || !window.L) return;
    const ok = lat !== "" && lng !== "" && !isNaN(Number(lat)) && !isNaN(Number(lng));
    map.current = L.map(el.current, { maxZoom: 19 }).setView(ok ? [Number(lat), Number(lng)] : [9.5, -12], ok ? 16 : 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map.current);
    map.current.on("click", ev => cb.current(ev.latlng.lat.toFixed(6), ev.latlng.lng.toFixed(6)));
    setTimeout(() => map.current && map.current.invalidateSize(), 200);
    return () => { map.current && map.current.remove(); map.current = null; mk.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current || lat === "" || lng === "" || isNaN(Number(lat)) || isNaN(Number(lng))) return;
    const pt = [Number(lat), Number(lng)];
    if (mk.current) mk.current.setLatLng(pt); else mk.current = L.circleMarker(pt, { radius: 9, color: "#fff", weight: 2, fillColor: "#B5451B", fillOpacity: 1 }).addTo(map.current);
    map.current.setView(pt, Math.max(map.current.getZoom(), 15));
  }, [lat, lng]);
  return <div ref={el} style={{ width: "100%", height: 240, borderRadius: 10, border: "1px solid var(--c-border)", marginBottom: 6 }} />;
}

// Indicateur de connexion et de synchronisation pour les enquêtes hors-ligne (🟢/🔴/🟠/🔵),
// alimenté par les mêmes événements que la file d'attente générique de l'application.
function IndicateurConnexionEnquetes({ email, deviceId }) {
  const [, force] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const maj = () => force(t => t + 1);
    const onSync = (ev) => setSyncing(!!(ev && ev.detail && ev.detail.syncing));
    const onOff = () => setOnline(navigator.onLine);
    window.addEventListener("pace-enquetes-offline-updated", maj);
    window.addEventListener("pace-queue-updated", maj);
    window.addEventListener("pace-queue-syncing", onSync);
    window.addEventListener("online", onOff); window.addEventListener("offline", onOff);
    const t = setInterval(maj, 5000);
    return () => { window.removeEventListener("pace-enquetes-offline-updated", maj); window.removeEventListener("pace-queue-updated", maj); window.removeEventListener("pace-queue-syncing", onSync); window.removeEventListener("online", onOff); window.removeEventListener("offline", onOff); clearInterval(t); };
  }, []);
  const mine = Object.values(loadOfflineEnquetes()).filter(r => (deviceId ? r.deviceId === deviceId : r.creePar === email));
  const enAttente = mine.filter(r => r.statutSync !== "conflit").length;
  const conflits = mine.filter(r => r.statutSync === "conflit").length;
  const echecs = loadPendingQueue().filter(it => it.type === "enquete" && it._failed).length;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11.5, marginBottom: 10, color: "var(--c-text-muted)" }}>
      <span>{online ? "🟢 En ligne" : "🔴 Hors connexion"}</span>
      {syncing && <span>🟠 Synchronisation en cours…</span>}
      {enAttente > 0 && <span>🔵 {enAttente} enquête(s) en attente de synchronisation</span>}
      {conflits > 0 && <span style={{ color: "#B5451B" }}>⚠️ {conflits} conflit(s) à résoudre</span>}
      {echecs > 0 && <span style={{ color: "#B5451B" }}>🔴 {echecs} échec(s) — nouvelle tentative automatique</span>}
    </div>
  );
}

// Lecture de l'audio (natif : pause/reprise via les contrôles du navigateur) + saisie,
// modification et suivi du cycle de vie d'une transcription manuelle. Les actions de
// vérification/validation sont proposées côté client selon le statut et le rôle (estAdmin),
// mais l'autorisation réelle est toujours vérifiée côté serveur (voir la migration RLS) :
// un refus serveur remonte simplement comme message d'erreur, jamais de contournement ici.
function TranscriptionAudio({ preuve, transcription, brouillonLocal, estAdmin, onCommencer, onSauver, onSoumettre, onExaminer, onRouvrir }) {
  const valeurInitiale = (brouillonLocal ? brouillonLocal.texte : (transcription ? transcription.texte : "")) || "";
  const [texte, setTexte] = useState(valeurInitiale);
  const idRef = useRef(transcription && transcription.id);
  useEffect(() => {
    // Le champ n'est réinitialisé que lorsque la transcription change réellement (nouvelle
    // transcription, ou statut mis à jour côté serveur après une action) — jamais à chaque
    // frappe, pour ne pas effacer une saisie en cours.
    const idCourant = transcription && transcription.id;
    if (idCourant !== idRef.current) { idRef.current = idCourant; setTexte(valeurInitiale); }
  }, [transcription && transcription.id, transcription && transcription.statut]); // eslint-disable-line

  const dejaCommencee = !!transcription || !!brouillonLocal;
  const modifiable = !transcription || transcription.statut === "brouillon" || transcription.statut === "a_revoir";
  const statutAffiche = transcription ? transcription.statut : "brouillon";

  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--c-border)" }}>
      <audio src={preuve.url} controls style={{ width: "100%", marginBottom: 8 }} />
      {!dejaCommencee && (
        <button type="button" onClick={onCommencer} style={{ ...miniBtnStyle, borderColor: "var(--c-accent-dark)", color: "var(--c-accent-dark)" }}>Commencer la transcription</button>
      )}
      {dejaCommencee && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11.5, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(0,0,0,0.06)", fontWeight: 600 }}>{TRANSCRIPTION_STATUTS[statutAffiche] || statutAffiche}</span>
            {transcription && <span style={{ color: "var(--c-text-muted)" }}>{transcription.cree_par}</span>}
            {brouillonLocal && <span style={{ color: "var(--c-text-muted)" }}> · 🔵 {transcription ? "modification" : "brouillon"} en attente de synchronisation</span>}
          </div>
          {transcription && transcription.commentaire_revision && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 6 }}>Commentaire : {transcription.commentaire_revision}</div>}
          <textarea value={texte} onChange={e => setTexte(e.target.value)} disabled={!modifiable} rows={4} placeholder="Saisir ici la transcription manuelle de l'enregistrement…"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 13, resize: "vertical", marginBottom: 6, background: modifiable ? undefined : "rgba(0,0,0,0.04)" }} />
          {modifiable && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onSauver(texte)} style={miniBtnStyle}>Enregistrer le brouillon</button>
              <button type="button" onClick={() => onSoumettre(texte)} disabled={!texte.trim() || !transcription}
                title={!transcription ? "En attente de synchronisation avant de pouvoir soumettre" : undefined}
                style={{ ...miniBtnStyle, borderColor: "var(--c-accent-dark)", color: "var(--c-accent-dark)" }}>Soumettre à vérification</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "soumise" && (
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onExaminer("verifiee")} style={{ ...miniBtnStyle, borderColor: "#2F6B3A", color: "#2F6B3A" }}>Vérifier</button>
              <button type="button" onClick={() => onExaminer("a_revoir")} style={miniBtnStyle}>Renvoyer pour correction</button>
              <button type="button" onClick={() => onExaminer("rejetee")} style={{ ...miniBtnStyle, borderColor: "#B5451B", color: "#B5451B" }}>Rejeter</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "verifiee" && (
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onExaminer("validee")} style={{ ...miniBtnStyle, borderColor: "#2F6B3A", color: "#2F6B3A" }}>Valider</button>
              <button type="button" onClick={() => onExaminer("a_revoir")} style={miniBtnStyle}>Renvoyer pour correction</button>
              <button type="button" onClick={() => onExaminer("rejetee")} style={{ ...miniBtnStyle, borderColor: "#B5451B", color: "#B5451B" }}>Rejeter</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "rejetee" && (
            <button type="button" onClick={onRouvrir} style={{ ...miniBtnStyle, marginTop: 6 }}>Rouvrir (revenir en brouillon)</button>
          )}
          {transcription && transcription.statut === "validee" && (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 4 }}>
              Vérifiée par {transcription.verifie_par} · Validée par {transcription.valide_par} le {transcription.valide_at ? new Date(transcription.valide_at).toLocaleString("fr-FR") : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EnquetesStandard({ email, organisationId, source, deviceId }) {
  const [liste, setListe] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [ouvert, setOuvert] = useState(false);
  const [d, setD] = useState({});
  const [f, setF] = useState({ titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" });
  const [etape, setEtape] = useState(0);
  const [localId, setLocalId] = useState(null);
  const [conflit, setConflit] = useState(null); // instantané distant quand une modification concurrente est détectée
  const [preuvesLocales, setPreuvesLocales] = useState([]); // preuves ajoutées hors connexion, pas encore sur le serveur
  const [preuves, setPreuves] = useState([]);
  const [transcriptions, setTranscriptions] = useState({}); // par preuve_id, transcriptions connues du serveur
  const [transcriptionsLocales, setTranscriptionsLocales] = useState({}); // par preuve_id, brouillon en attente de synchronisation (même principe que preuvesLocales)
  const [np, setNp] = useState({ type: "photo", description: "", nature: "observe", fichier: null });
  const [sync, setSync] = useState("");
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const [filtreListeGroupe, setFiltreListeGroupe] = useState("");
  const [filtreListeGravite, setFiltreListeGravite] = useState("");
  const [filtreListeStatut, setFiltreListeStatut] = useState("");
  const [signalementLie, setSignalementLie] = useState(null);
  const [rechSignalement, setRechSignalement] = useState("");
  const [resultatsSignalement, setResultatsSignalement] = useState(null);
  const [rechBusy, setRechBusy] = useState(false);
  const latest = useRef({}); latest.current = { d, f, localId };

  const champStyle = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 14, marginBottom: 10, boxSizing: "border-box", background: "var(--c-surface)", color: "var(--c-text)", fontFamily: "Work Sans, sans-serif" };
  const label = { fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" };
  const btn = (bg) => ({ flex: 1, padding: "12px 0", borderRadius: 10, border: bg ? "none" : "1px solid var(--c-border)", background: bg || "none", color: bg ? "#fff" : "var(--c-text)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" });

  async function charger() {
    if (deviceId) { const r = await supabase.rpc("benevole_dossiers_assignes", { p_device: deviceId }); setListe(r.data || []); return; }
    const { data } = await supabase.from("enquete_dossiers").select("id, numero, titre, statut, categorie, niveau_constat, donnees, created_at").eq("is_deleted", false).order("created_at", { ascending: false }).limit(50);
    setListe(data || []);
  }
  useEffect(() => { charger(); }, []);

  const [commentaireRevision, setCommentaireRevision] = useState("");
  // Examen d'un dossier par l'équipe EcoVigil (inspiré des statuts de validation de KoboToolbox) :
  // Vérifié, À revoir (renvoyé à l'enquêteur avec un commentaire) ou Rejeté. Fait directement en
  // ligne, hors file d'attente : c'est une décision immédiate du réviseur.
  async function examiner(nouveauStatut) {
    if (!dossier || !dossier.id) return;
    setErreur("");
    if (nouveauStatut !== "verifiee" && !commentaireRevision.trim()) { setErreur("Un commentaire est requis pour renvoyer un dossier à revoir ou le rejeter."); return; }
    const { data, error } = await supabase.from("enquete_dossiers").update({ statut: nouveauStatut, revision_commentaire: commentaireRevision.trim() || null }).eq("id", dossier.id).select().single();
    if (error) { setErreur("Examen impossible : " + error.message); return; }
    const rec = getOfflineEnquete(localId);
    if (rec) putOfflineEnquete({ ...rec, baseUpdatedAt: data.updated_at, cols: { ...rec.cols, statut: data.statut } });
    setDossier(data); setF(x => ({ ...x, statut: data.statut })); setCommentaireRevision(""); setSync("Examen enregistré ✓"); charger();
  }
  const [corbeille, setCorbeille] = useState(null);
  const [showCorbeille, setShowCorbeille] = useState(false);
  async function chargerCorbeille() {
    const { data } = await supabase.from("enquete_dossiers").select("id, numero, titre, statut, deleted_at, deleted_by").eq("is_deleted", true).order("deleted_at", { ascending: false }).limit(50);
    setCorbeille(data || []);
  }
  async function supprimerDossier() {
    if (!dossier || !dossier.id) return;
    if (!window.confirm("Supprimer ce dossier d'enquête ? " + (source === "admin" ? "" : "Il pourra être restauré par le Centre d'EcoVigil si besoin."))) return;
    const { error } = await supabase.from("enquete_dossiers").update({ is_deleted: true }).eq("id", dossier.id);
    if (error) { setErreur("Suppression impossible : " + error.message); return; }
    if (localId) removeOfflineEnquete(localId);
    setOuvert(false); charger();
  }
  async function restaurerDossier(id) {
    const { error } = await supabase.from("enquete_dossiers").update({ is_deleted: false }).eq("id", id);
    if (!error) chargerCorbeille();
  }
  async function supprimerDefinitivement(id) {
    if (!window.confirm("Supprimer définitivement ce dossier ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("enquete_dossiers").delete().eq("id", id);
    if (!error) chargerCorbeille();
  }

  // Sauvegarde : toujours écrite d'abord dans la file d'attente locale (persiste hors connexion,
  // survit à la fermeture de l'app), puis synchronisée immédiatement si une connexion est
  // disponible — sinon elle attendra le retour du réseau (voir flushPendingQueue dans App).
  function sauverLocal() {
    const { d: dd, f: ff, localId: lid } = latest.current;
    if (!lid || !ff.titre.trim()) return;
    const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));
    const existant = getOfflineEnquete(lid);
    if (!existant) return; // dossier déjà entièrement synchronisé et retiré de la file locale
    const rec = { ...existant, cols: { titre: ff.titre.trim(), type_enquete: ff.type_enquete || null, categorie: ff.categorie || null, profil_enqueteur: ff.profil_enqueteur || null,
      lat: num(ff.lat), lng: num(ff.lng), precision_gps_m: num(ff.precision_gps_m), niveau_constat: ff.niveau_constat, statut: ff.statut, signalement_id: ff.signalement_id || null }, donnees: dd,
      statutSync: existant.statutSync === "conflit" ? "conflit" : "attente", updatedLocalAt: Date.now() };
    putOfflineEnquete(rec);
    declencherSync(lid);
  }
  async function declencherSync(lid) {
    if (!navigator.onLine) { enqueuePendingEnquete(lid); setSync("Hors ligne — dossier conservé sur l'appareil"); return; }
    try {
      const res = await syncOneDossierEnquete(lid);
      if (res && res.conflict) { const r = getOfflineEnquete(lid); setConflit(r ? r.conflitDistant : null); setSync("Conflit détecté — résolution nécessaire"); return; }
      if (res && res.remoteId) setDossier(d0 => ({ ...(d0 || {}), id: res.remoteId, numero: res.numero || (d0 && d0.numero), created_at: (d0 && d0.created_at) || new Date().toISOString() }));
      setSync("Enregistré ✓");
    } catch (e) {
      enqueuePendingEnquete(lid);
      setSync("Synchronisation impossible pour l'instant — nouvelle tentative automatique dès que possible");
    }
  }
  // Dossier en lecture seule pour cet utilisateur : vérifié ou rejeté (sauf pour l'équipe EcoVigil),
  // ou terminé pour un bénévole. On ne lance alors aucune sauvegarde automatique : le serveur la
  // refuserait et le dossier resterait indéfiniment "en attente de synchronisation".
  function estVerrouille() {
    const ferme = f.statut === "verifiee" || f.statut === "rejetee";
    return ferme ? source !== "admin" : !!(deviceId && f.statut === "terminee");
  }
  useEffect(() => { if (!ouvert || !localId || estVerrouille()) return; const t = setTimeout(sauverLocal, 1500); return () => clearTimeout(t); }, [d, f, ouvert, localId]);
  useEffect(() => {
    const onConflit = (ev) => { if (ev && ev.detail && ev.detail.localId === localId) { const r = getOfflineEnquete(localId); if (r) setConflit(r.conflitDistant); } };
    window.addEventListener("pace-enquete-conflit", onConflit);
    return () => window.removeEventListener("pace-enquete-conflit", onConflit);
  }, [localId]);

  function nouveau() {
    const lid = uid() + uid();
    putOfflineEnquete({ localId: lid, remoteId: null, cols: { titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" },
      donnees: { date_heure: new Date().toISOString().slice(0, 16) }, preuvesLocales: [], transcriptionsLocales: {}, baseUpdatedAt: null, statutSync: "attente", creePar: email, source, organisationId: organisationId || null, deviceId: deviceId || null, updatedLocalAt: Date.now() });
    setLocalId(lid); setDossier(null); setPreuves([]); setPreuvesLocales([]); setTranscriptions({}); setTranscriptionsLocales({}); setConflit(null); setEtape(0); setErreur(""); setSync("");
    setD({ date_heure: new Date().toISOString().slice(0, 16) });
    setF({ titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  async function ouvrir(id) {
    const data = deviceId ? (liste || []).find(x => x.id === id) : (await supabase.from("enquete_dossiers").select("*").eq("id", id).single()).data;
    if (!data) return;
    const { data: pr } = deviceId ? await supabase.rpc("benevole_dossier_preuves", { p_device: deviceId, p_dossier: id })
      : await supabase.from("enquete_dossier_preuves").select("*").eq("dossier_id", id).order("created_at");
    const { data: tr } = deviceId ? await supabase.rpc("benevole_dossier_transcriptions", { p_device: deviceId, p_dossier: id })
      : await supabase.from("enquete_preuve_transcriptions").select("*").eq("dossier_id", id);
    const trMap = {}; (tr || []).forEach(t => { trMap[t.preuve_id] = t; });
    // On rejoue l'édition sur une copie locale (même mécanisme que hors connexion) : si le réseau
    // coupe pendant la modification, rien n'est perdu et la synchronisation reprendra automatiquement.
    const existant = getOfflineEnquete(id);
    putOfflineEnquete({ localId: id, remoteId: id, cols: { titre: data.titre, type_enquete: data.type_enquete || "", categorie: data.categorie || "", profil_enqueteur: data.profil_enqueteur || "",
      lat: data.lat ?? "", lng: data.lng ?? "", precision_gps_m: data.precision_gps_m ?? "", niveau_constat: data.niveau_constat, statut: data.statut, signalement_id: data.signalement_id || "" },
      donnees: data.donnees || {}, preuvesLocales: (existant && existant.preuvesLocales) || [], transcriptionsLocales: (existant && existant.transcriptionsLocales) || {}, baseUpdatedAt: data.updated_at, numero: data.numero,
      statutSync: (existant && existant.statutSync === "conflit") ? "conflit" : "synced", conflitDistant: existant && existant.conflitDistant,
      creePar: data.cree_par, source, organisationId: data.organisation_id, deviceId: deviceId || null, updatedLocalAt: Date.now() });
    setLocalId(id); setDossier(data); setD(data.donnees || {}); setPreuves(pr || []); setPreuvesLocales((existant && existant.preuvesLocales) || []);
    setTranscriptions(trMap); setTranscriptionsLocales((existant && existant.transcriptionsLocales) || {});
    setConflit(existant && existant.statutSync === "conflit" ? existant.conflitDistant : null); setEtape(0); setErreur(""); setSync("");
    setF({ titre: data.titre, type_enquete: data.type_enquete || "", categorie: data.categorie || "", profil_enqueteur: data.profil_enqueteur || "", lat: data.lat ?? "", lng: data.lng ?? "", precision_gps_m: data.precision_gps_m ?? "", niveau_constat: data.niveau_constat, statut: data.statut, signalement_id: data.signalement_id || "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  function reprendreLocal(lid) {
    const r = getOfflineEnquete(lid);
    if (!r) return;
    setLocalId(lid); setDossier(r.remoteId ? { id: r.remoteId, numero: r.numero } : null); setD(r.donnees || {}); setPreuves([]); setPreuvesLocales(r.preuvesLocales || []);
    // Comme pour les preuves, la reprise hors connexion ne recharge pas les transcriptions déjà
    // sur le serveur (aucun accès réseau ici) : seuls les brouillons locaux en attente sont restitués.
    setTranscriptions({}); setTranscriptionsLocales(r.transcriptionsLocales || {});
    setConflit(r.statutSync === "conflit" ? r.conflitDistant : null); setEtape(0); setErreur(""); setSync("");
    setF({ titre: r.cols.titre, type_enquete: r.cols.type_enquete || "", categorie: r.cols.categorie || "", profil_enqueteur: r.cols.profil_enqueteur || "", lat: r.cols.lat ?? "", lng: r.cols.lng ?? "", precision_gps_m: r.cols.precision_gps_m ?? "", niveau_constat: r.cols.niveau_constat, statut: r.cols.statut, signalement_id: r.cols.signalement_id || "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  // Recherche puis liaison/déliaison d'un signalement citoyen à l'origine du dossier — la relation
  // est facultative dans les deux sens : un dossier fonctionne très bien sans signalement, et
  // inversement.
  async function rechercherSignalements() {
    const q = rechSignalement.trim();
    if (!q) { setResultatsSignalement([]); return; }
    setRechBusy(true);
    let query = supabase.from("signalements").select("id, categorie, description, urgence, lat, lng, statut, created_at").eq("is_deleted", false).order("created_at", { ascending: false }).limit(6);
    query = /^[0-9a-f-]{6,}$/i.test(q) ? query.ilike("id", q + "%") : query.ilike("description", "%" + q + "%");
    const { data, error } = await query;
    setRechBusy(false);
    setResultatsSignalement(error ? [] : (data || []));
  }
  function lierSignalement(s) {
    setF(x => ({ ...x, signalement_id: s.id })); setSignalementLie(s); setResultatsSignalement(null); setRechSignalement("");
  }
  function delierSignalement() { setF(x => ({ ...x, signalement_id: "" })); setSignalementLie(null); }
  function reprendrePositionSignalement() {
    if (!signalementLie || signalementLie.lat == null) return;
    setF(x => ({ ...x, lat: signalementLie.lat, lng: signalementLie.lng, precision_gps_m: "" }));
  }
  useEffect(() => {
    if (!f.signalement_id) { setSignalementLie(null); return; }
    if (signalementLie && signalementLie.id === f.signalement_id) return;
    supabase.from("signalements").select("id, categorie, description, urgence, lat, lng, statut, created_at").eq("id", f.signalement_id).single()
      .then(({ data }) => setSignalementLie(data || null));
  }, [f.signalement_id]);
  // Résolution de conflit : soit on impose la version locale (écrase la version serveur), soit on
  // adopte la version serveur (la modification locale concurrente est abandonnée, mais reste dans
  // l'historique du serveur puisque quelqu'un d'autre l'a bien enregistrée).
  function resoudreGarderMaVersion() {
    const r = getOfflineEnquete(localId); if (!r) return;
    putOfflineEnquete({ ...r, baseUpdatedAt: conflit ? conflit.updated_at : r.baseUpdatedAt, statutSync: "attente", conflitDistant: null });
    setConflit(null); declencherSync(localId);
  }
  function resoudreGarderVersionServeur() {
    if (!conflit) return;
    setD(conflit.donnees || {}); setF({ titre: conflit.titre, type_enquete: conflit.type_enquete || "", categorie: conflit.categorie || "", profil_enqueteur: conflit.profil_enqueteur || "",
      lat: conflit.lat ?? "", lng: conflit.lng ?? "", precision_gps_m: conflit.precision_gps_m ?? "", niveau_constat: conflit.niveau_constat, statut: conflit.statut });
    const r = getOfflineEnquete(localId);
    if (r) putOfflineEnquete({ ...r, cols: { titre: conflit.titre, type_enquete: conflit.type_enquete, categorie: conflit.categorie, profil_enqueteur: conflit.profil_enqueteur, lat: conflit.lat, lng: conflit.lng, precision_gps_m: conflit.precision_gps_m, niveau_constat: conflit.niveau_constat, statut: conflit.statut }, donnees: conflit.donnees || {}, baseUpdatedAt: conflit.updated_at, statutSync: "synced", conflitDistant: null });
    setConflit(null); setSync("Version du serveur adoptée");
  }

  const val = (k) => (d[k] && d[k].valeur !== undefined ? d[k].valeur : (typeof d[k] === "string" ? d[k] : ""));
  const setVal = (k, v) => setD(p => ({ ...p, [k]: { ...(p[k] && typeof p[k] === "object" ? p[k] : {}), valeur: v, nature: (p[k] && p[k].nature) || "observe" } }));
  const setNature = (k, n) => setD(p => ({ ...p, [k]: { ...(p[k] || {}), nature: n } }));
  const setSimple = (k, v) => setD(p => ({ ...p, [k]: v }));
  const champ = (k, lab, rows, avecNature) => (
    <div key={k}>
      <label style={label}>{lab}</label>
      {rows ? <textarea value={val(k)} onChange={e => setVal(k, e.target.value)} rows={rows} style={{ ...champStyle, resize: "vertical" }} />
            : <input value={val(k)} onChange={e => setVal(k, e.target.value)} style={champStyle} />}
      {avecNature && <select value={(d[k] && d[k].nature) || "observe"} onChange={e => setNature(k, e.target.value)} style={{ ...champStyle, padding: 8, fontSize: 12, marginTop: -4 }}>
        {ENQ_NATURES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
    </div>
  );
  const multi = (k, options) => {
    const cur = d[k] || [];
    return <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>{options.map(o => {
      const on = cur.includes(o);
      return <button key={o} type="button" onClick={() => setSimple(k, on ? cur.filter(x => x !== o) : [...cur, o])}
        style={{ padding: "10px 12px", borderRadius: 20, border: `1px solid ${on ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: on ? "var(--c-accent-dark)" : "none", color: on ? "#fff" : "var(--c-text)", fontSize: 12.5, cursor: "pointer" }}>{o}</button>;
    })}</div>;
  };
  // Évaluation d'impact par domaine : niveau + justification obligatoire si Élevé/Critique
  const setImpact = (dom, patch) => setD(p => ({ ...p, impacts_eval: { ...(p.impacts_eval || {}), [dom]: { ...((p.impacts_eval || {})[dom] || {}), ...patch } } }));
  const impactsRenseignes = () => Object.values(d.impacts_eval || {}).filter(x => x && x.niveau);
  const impactsJustifManquante = () => Object.entries(d.impacts_eval || {}).filter(([, v]) => v && ENQ_IMPACT_JUSTIF_REQUISE.includes(v.niveau) && !(v.justification || "").trim()).map(([k]) => k);

  function localiser() {
    if (!navigator.geolocation) { setErreur("La géolocalisation n'est pas disponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(
      p => setF(x => ({ ...x, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6), precision_gps_m: Math.round(p.coords.accuracy) })),
      () => setErreur("Position refusée ou indisponible : saisis les coordonnées manuellement, ou coche « position GPS indisponible »."), { enableHighAccuracy: true, timeout: 15000 });
  }

  async function ajouterPreuve() {
    if (!localId) { setErreur("Le dossier doit d'abord être créé (retourne à l'étape Identification)."); return; }
    if (!np.description.trim() && !np.fichier) return;
    setBusy(true);
    let dataUrl = null;
    try { if (np.fichier) dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(np.fichier); }); } catch (e) {}
    const lat0 = f.lat === "" ? null : Number(f.lat), lng0 = f.lng === "" ? null : Number(f.lng), desc0 = np.description.trim() || null, cap0 = new Date().toISOString();
    // La preuve est d'abord posée dans la file locale (fonctionne hors connexion) ; l'envoi de la
    // photo et son association au dossier se font lors de la synchronisation (voir syncOneDossierEnquete).
    const item = { id: uid() + uid(), type: np.type, description: desc0, nature: np.nature, capture_at: cap0, lat: lat0, lng: lng0, ajoutePar: email, dataUrl: (np.type === "photo" || np.type === "audio") ? dataUrl : null, deviceId: deviceId || null };
    const rec = getOfflineEnquete(localId);
    if (rec) putOfflineEnquete({ ...rec, preuvesLocales: [...(rec.preuvesLocales || []), item], updatedLocalAt: Date.now() });
    setPreuvesLocales(p => [...p, item]);
    setBusy(false);
    setNp({ type: np.type, description: "", nature: "observe", fichier: null });
    declencherSync(localId);
  }

  // -- Transcription manuelle des enregistrements audio ------------------
  // Une transcription est un texte saisi par un utilisateur autorisé, jamais généré
  // automatiquement, rattaché à une preuve de type "audio" déjà synchronisée (l'audio
  // original n'est jamais modifié — voir syncOneDossierEnquete). Le cycle de vie
  // (brouillon → soumise → vérifiée → validée, ou renvoyée/rejetée) est appliqué et
  // tracé côté serveur (trigger + historique du dossier) ; le client se contente de
  // proposer les actions correspondant à l'étape en cours et d'afficher les refus.
  const estAdmin = source === "admin" && !deviceId;

  // Enregistre le brouillon localement puis tente la synchronisation (voir déclencherSync /
  // syncOneDossierEnquete) : fonctionne hors connexion exactement comme l'édition du dossier
  // ou l'ajout d'une preuve, sans file d'attente séparée. transcriptionId reste null tant que
  // la transcription n'a jamais été créée côté serveur — la synchronisation la créera alors ;
  // il vaut l'identifiant existant s'il s'agit de la modification d'une transcription déjà connue.
  function sauverTranscriptionLocal(preuveId, texte) {
    const existante = transcriptions[preuveId];
    const rec = getOfflineEnquete(localId);
    const entree = { transcriptionId: existante ? existante.id : null, texte, updatedLocalAt: Date.now() };
    if (rec) putOfflineEnquete({ ...rec, transcriptionsLocales: { ...(rec.transcriptionsLocales || {}), [preuveId]: entree } });
    setTranscriptionsLocales(t => ({ ...t, [preuveId]: entree }));
    declencherSync(localId);
  }

  async function creerTranscription(preuveId) {
    setErreur("");
    // Hors connexion : on ouvre un brouillon local vide, créé côté serveur à la prochaine
    // synchronisation — même mécanisme que la modification d'un brouillon existant, pour ne
    // jamais bloquer le démarrage d'une transcription faute de réseau.
    if (!navigator.onLine) { sauverTranscriptionLocal(preuveId, ""); return; }
    try {
      const r = deviceId
        ? await supabase.rpc("benevole_transcription_creer", { p_device: deviceId, p_preuve_id: preuveId, p_texte: "" })
        : await supabase.from("enquete_preuve_transcriptions").insert({ preuve_id: preuveId, dossier_id: dossier.id, texte: "" }).select().single();
      if (r.error) throw r.error;
      setTranscriptions(t => ({ ...t, [preuveId]: r.data }));
    } catch (e) { setErreur("Impossible de commencer la transcription : " + e.message); }
  }

  async function soumettreTranscription(preuveId, texteActuel) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    if (!navigator.onLine) { setErreur("Une connexion est nécessaire pour soumettre une transcription à vérification."); return; }
    const texte = (texteActuel != null ? texteActuel : existante.texte) || "";
    if (!texte.trim()) { setErreur("La transcription ne peut pas être soumise vide."); return; }
    try {
      // On pousse d'abord explicitement le texte actuellement affiché s'il diffère de la
      // dernière version connue du serveur — qu'il ait ou non déjà été enregistré comme
      // brouillon : la soumission ne doit jamais dépendre d'un délai de synchronisation en
      // arrière-plan qu'elle ne contrôle pas, ni silencieusement perdre une saisie non enregistrée.
      if (texte !== existante.texte) {
        const rMaj = deviceId
          ? await supabase.rpc("benevole_transcription_maj", { p_device: deviceId, p_transcription_id: existante.id, p_texte: texte })
          : await supabase.from("enquete_preuve_transcriptions").update({ texte }).eq("id", existante.id);
        if (rMaj.error) throw rMaj.error;
      }
      const rec = getOfflineEnquete(localId);
      if (rec && rec.transcriptionsLocales && rec.transcriptionsLocales[preuveId]) {
        const restantes = { ...rec.transcriptionsLocales }; delete restantes[preuveId];
        putOfflineEnquete({ ...rec, transcriptionsLocales: restantes });
      }
      setTranscriptionsLocales(t => { if (!t[preuveId]) return t; const s = { ...t }; delete s[preuveId]; return s; });
      const r = deviceId
        ? await supabase.rpc("benevole_transcription_soumettre", { p_device: deviceId, p_transcription_id: existante.id })
        : await supabase.from("enquete_preuve_transcriptions").update({ statut: "soumise" }).eq("id", existante.id).select().single();
      if (r.error) throw r.error;
      setTranscriptions(t => ({ ...t, [preuveId]: r.data }));
    } catch (e) { setErreur("Soumission impossible : " + e.message); }
  }

  // Vérification et validation sont réservées à l'équipe EcoVigil (voir estAdmin) ; le serveur
  // applique de toute façon la même règle. Ce contrôle côté client n'est qu'un confort
  // d'affichage — le serveur reste la seule source d'autorité.
  async function examinerTranscription(preuveId, nouveauStatut) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    let commentaire_revision = null;
    if (nouveauStatut === "a_revoir" || nouveauStatut === "rejetee") {
      commentaire_revision = window.prompt("Commentaire (obligatoire) pour " + (nouveauStatut === "rejetee" ? "rejeter" : "renvoyer pour correction") + " cette transcription :");
      if (!commentaire_revision || !commentaire_revision.trim()) return;
    }
    const { data, error } = await supabase.from("enquete_preuve_transcriptions").update({ statut: nouveauStatut, commentaire_revision }).eq("id", existante.id).select().single();
    if (error) { setErreur("Examen impossible : " + error.message); return; }
    setTranscriptions(t => ({ ...t, [preuveId]: data }));
  }

  async function rouvrirTranscription(preuveId) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    const { data, error } = await supabase.from("enquete_preuve_transcriptions").update({ statut: "brouillon" }).eq("id", existante.id).select().single();
    if (error) { setErreur("Réouverture impossible : " + error.message); return; }
    setTranscriptions(t => ({ ...t, [preuveId]: data }));
  }

  // ---- Contrôle des champs obligatoires avant soumission définitive (ne bloque jamais l'enregistrement en brouillon) ----
  function champsManquants() {
    const m = [];
    if (!f.titre.trim()) m.push("le titre (étape Identification)");
    if (!f.type_enquete) m.push("le type d'enquête (étape Identification)");
    if (!f.categorie) m.push("le type de problème (étape Identification)");
    if (f.categorie === "autre" && !val("type_probleme_precision").trim()) m.push("la précision du problème « Autre » (étape Identification)");
    if (!val("localite").trim() && !val("quartier").trim() && !val("commune").trim()) m.push("la localité / zone (étape Localisation)");
    const gpsOk = (f.lat !== "" && f.lng !== "" && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng)));
    if (!gpsOk && !d.gps_indisponible) m.push("les coordonnées GPS, ou à défaut la case « position GPS indisponible » avec son motif (étape Localisation)");
    if (d.gps_indisponible && !val("gps_indisponible_motif").trim()) m.push("le motif d'indisponibilité du GPS (étape Localisation)");
    if (!val("faits_observes").trim()) m.push("la description des faits observés (étape Constat)");
    if (impactsRenseignes().length === 0) m.push("au moins une évaluation d'impact (étape Impacts)");
    if (impactsJustifManquante().length > 0) m.push("la justification des impacts Élevé/Critique : " + impactsJustifManquante().join(", ") + " (étape Impacts)");
    if (f.niveau_constat === "a_determiner") m.push("un niveau de gravité déterminé, autre que « à déterminer » (étape Niveau & actions)");
    if (ENQ_GRAVITE_PREUVE_OBLIGATOIRE.includes(f.niveau_constat) && (preuves.length + preuvesLocales.length) === 0 && !(d.preuve_absente && val("preuve_absente_motif").trim())) {
      m.push("au moins une preuve, ou à défaut la case « aucune preuve disponible » avec son motif (étape Preuves) — obligatoire pour un niveau Grave, Très grave ou Critique");
    }
    return m;
  }

  async function valider(statut) {
    setErreur("");
    if (statut === "terminee") {
      const m = champsManquants();
      if (m.length > 0) { setErreur("Impossible de valider, il manque : " + m.join(" ; ") + "."); return; }
    }
    latest.current = { ...latest.current, f: { ...latest.current.f, statut } }; setF(x => ({ ...x, statut }));
    sauverLocal(); await declencherSync(localId); charger();
  }

  const nomType = (id) => (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[1] || "—";
  const nomGroupe = (id) => (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[3] || "";
  const nomTypeEnquete = (id) => (ENQ_TYPE_ENQUETE.find(t => t[0] === id) || [])[1] || "—";
  const nomNature = (n) => (ENQ_NATURES.find(t => t[0] === n) || [])[1] || "";
  const ligne = (l, v, n) => v ? <div style={{ fontSize: 12.5, padding: "5px 0", borderTop: "1px solid var(--c-border)" }}><b>{l}</b> : {v} {n && <em style={{ color: "var(--c-text-muted)" }}>({nomNature(n)})</em>}</div> : null;
  const carte = f.lat !== "" && f.lng !== "" && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng));

  // ---- Rapport (ouvert dans un nouvel onglet, imprimable / enregistrable en PDF) ----
  async function rapport() {
    const w = window.open("", "_blank");
    if (!w) { setErreur("Autorise l'ouverture de fenêtres pour générer le rapport."); return; }
    w.document.write("<p style='font-family:sans-serif'>Génération du rapport…</p>");
    const { data: h } = await supabase.from("enquete_dossier_historique").select("*").eq("dossier_id", dossier.id).order("created_at");
    const e = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const dt = (x) => x ? new Date(x).toLocaleString("fr-FR") : "";
    const nat = (n) => n ? ` <small class="n">[${e(nomNature(n))}]</small>` : "";
    const lieu = [val("localite"), val("quartier"), val("commune"), val("sous_prefecture"), val("prefecture"), val("region")].filter(Boolean).join(", ");
    const niveauT = ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [];
    const niveau = niveauT[1] || "";
    const gps = carte ? `${f.lat}, ${f.lng}${f.precision_gps_m !== "" ? " (± " + f.precision_gps_m + " m)" : ""}` : (d.gps_indisponible ? "Non disponible — " + val("gps_indisponible_motif") : "");
    const impactsLignes = Object.entries(d.impacts_eval || {}).filter(([, v]) => v && v.niveau).map(([k, v]) => `${k} : ${(ENQ_IMPACT_NIVEAUX.find(n => n[0] === v.niveau) || [])[1]}${v.justification ? " — " + v.justification : ""}`);
    const lignes = [["Type d'enquête", nomTypeEnquete(f.type_enquete), ""], ["Type de problème", nomGroupe(f.categorie) + " > " + nomType(f.categorie), ""], ["Signalement lié", signalementLie ? ((signalementLie.categorie || "Signalement") + " du " + dt(signalementLie.created_at)) : "", ""], ["Date et heure", dt(d.date_heure), ""], ["Lieu", lieu, ""], ["Coordonnées GPS", gps, ""],
      ["Faits observés", val("faits_observes"), "observe"], ["Période d'apparition", val("periode"), ""], ["Étendue", val("etendue"), ""], ["Fréquence", val("frequence"), ""],
      ["Causes observables", val("causes_observables"), d.causes_observables && d.causes_observables.nature], ["Informations recueillies (tiers)", val("informations_recueillies"), "declare"],
      ["Analyse et recommandations de l'enquêteur", val("analyse_recommandations"), ""], ["Impacts évalués", impactsLignes.join(" ; "), ""],
      ["Personnes / structures concernées (responsabilité non établie)", val("acteurs"), d.acteurs && d.acteurs.nature], ["Niveau de gravité", niveau, ""],
      ["Actions réalisées", (d.actions || []).join(", "), ""], ["Mesures proposées", val("mesures"), ""], ["Actions prioritaires", val("priorites"), ""], ["Autorité à saisir", val("autorite"), ""], ["Besoin de suivi", val("suivi"), ""], ["Observations complémentaires", val("observations"), ""]].filter(l => l[1]);
    const events = [{ t: dossier.created_at, l: "Création du dossier" }, ...(h || []).filter(x => x.action !== "creation").map(x => ({ t: x.created_at, l: (x.action === "changement_statut" ? `Statut : ${ENQ_STATUTS[x.ancien_statut]} → ${ENQ_STATUTS[x.nouveau_statut]}` : "Modification") + (x.auteur ? " par " + x.auteur : "") })),
      ...preuves.map(p => ({ t: p.capture_at || p.created_at, l: `Preuve (${(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}) : ${p.description || ""}` })),
      ...(dossier.verifie_at ? [{ t: dossier.verifie_at, l: "Vérification par " + dossier.verificateur }] : [])].sort((a, b) => new Date(a.t) - new Date(b.t));
    const imgs = preuves.filter(p => p.url);
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${e(dossier.numero)} — ${e(f.titre)}</title><style>
body{font-family:Georgia,serif;max-width:800px;margin:24px auto;padding:0 16px;color:#1b2a1f;line-height:1.5}h1{font-size:22px;margin:0}h2{font-size:15px;border-bottom:2px solid #2E7D4F;padding-bottom:3px;margin-top:26px;color:#1F5C38}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #cfd8d2;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef4f0;width:32%}.n{color:#666}.fiche{background:#eef4f0;padding:10px 14px;border-radius:8px;font-size:13px}
.gal{display:flex;flex-wrap:wrap;gap:10px}.gal figure{margin:0;width:230px;font-size:11px}.gal img{width:100%;border-radius:6px}iframe{width:100%;height:260px;border:1px solid #cfd8d2}
button{padding:8px 14px;margin-bottom:10px}@media print{button{display:none}}</style></head><body>
<button onclick="print()">Imprimer / Enregistrer en PDF</button>
<h1>${e(f.titre)}</h1><div class="fiche"><b>${e(dossier.numero)}</b> · ${e(ENQ_STATUTS[f.statut] || "")} · ${e(nomTypeEnquete(f.type_enquete))} · Gravité : ${e(niveau)} · ${e(nomGroupe(f.categorie))} — ${e(nomType(f.categorie))}<br>${e(lieu)}${gps ? " · GPS " + e(gps) : ""}<br>Enquêteur : ${e(email)}${organisationId ? " (organisation)" : ""} · Créé le ${e(dt(dossier.created_at))}${dossier.verificateur ? " · Vérifié par " + e(dossier.verificateur) + " le " + e(dt(dossier.verifie_at)) : ""}</div>
<h2>Rapport narratif</h2>
<p>Le ${e(dt(d.date_heure) || dt(dossier.created_at))}, ${e(email)} a mené une ${e(nomTypeEnquete(f.type_enquete)).toLowerCase()} concernant un problème de type « ${e(nomType(f.categorie))} »${lieu ? " à " + e(lieu) : ""}.</p>
${val("faits_observes") ? `<p><b>Faits observés</b> <small class="n">[Observé]</small> : ${e(val("faits_observes"))}</p>` : ""}${val("causes_observables") ? `<p><b>Causes observables</b>${nat(d.causes_observables && d.causes_observables.nature)} : ${e(val("causes_observables"))}</p>` : ""}
${val("informations_recueillies") ? `<p><b>Informations recueillies auprès de tiers</b> <small class="n">[Déclaré — non vérifié directement]</small> : ${e(val("informations_recueillies"))}</p>` : ""}
${impactsLignes.length ? `<p><b>Impacts évalués</b> : ${e(impactsLignes.join(" ; "))}.</p>` : ""}
${val("acteurs") ? `<p><b>Personnes ou structures concernées</b>${nat(d.acteurs && d.acteurs.nature)} : ${e(val("acteurs"))}. Cette mention n'établit aucune responsabilité.</p>` : ""}<p>Niveau de gravité : <b>${e(niveau)}</b>${niveauT[2] ? " — " + e(niveauT[2]) : ""}</p>
${val("analyse_recommandations") ? `<p><b>Analyse et recommandations de l'enquêteur</b> : ${e(val("analyse_recommandations"))}</p>` : ""}${val("mesures") ? `<p><b>Mesures proposées</b> : ${e(val("mesures"))}</p>` : ""}
<h2>Tableau structuré</h2><table>${lignes.map(l => `<tr><th>${e(l[0])}</th><td>${e(l[1])}${nat(l[2])}</td></tr>`).join("")}</table>
${carte ? `<h2>Carte de localisation</h2><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${Number(f.lng) - 0.005}%2C${Number(f.lat) - 0.003}%2C${Number(f.lng) + 0.005}%2C${Number(f.lat) + 0.003}&layer=mapnik&marker=${f.lat}%2C${f.lng}"></iframe><p><small>${e(gps)}</small></p>` : ""}
<h2>Éléments de preuve</h2>${preuves.length ? `<table>${preuves.map(p => `<tr><th>${e((ENQ_PREUVES.find(t => t[0] === p.type) || [])[1])}</th><td>${e(p.description)}${nat(p.nature)}<br><small class="n">${e(dt(p.capture_at || p.created_at))}${p.lat != null ? " · " + p.lat + ", " + p.lng : ""}</small></td></tr>`).join("")}</table>` : `<p>Aucune preuve enregistrée.${d.preuve_absente ? " Motif : " + e(val("preuve_absente_motif")) : ""}</p>`}
${imgs.length ? `<h2>Galerie</h2><div class="gal">${imgs.map(p => `<figure><img src="${e(p.url)}"><figcaption>${e(p.description)}${nat(p.nature)}</figcaption></figure>`).join("")}</div>` : ""}
<h2>Chronologie</h2><table>${events.map(x => `<tr><th>${e(dt(x.t))}</th><td>${e(x.l)}</td></tr>`).join("")}</table>
<p><small class="n">Légende : Observé = constaté directement · Déclaré = rapporté par un tiers · Supposé = hypothèse · À vérifier = non confirmé.</small></p></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  const [hist, setHist] = useState([]);
  useEffect(() => { if (etape === 6 && dossier && !deviceId) supabase.from("enquete_dossier_historique").select("*").eq("dossier_id", dossier.id).order("created_at", { ascending: false }).limit(30).then(r => setHist(r.data || [])); }, [etape, dossier && dossier.id, sync]);
  const [bens, setBens] = useState([]); const [assignes, setAssignes] = useState([]); const [choix, setChoix] = useState("");
  async function chargerAssign() {
    if (deviceId || !dossier) return;
    const { data: a } = await supabase.from("enquete_dossier_assignations").select("id, benevole_id").eq("dossier_id", dossier.id);
    const { data: b } = await supabase.from("benevoles").select("id, nom, ville").eq("statut", "valide").eq("is_deleted", false);
    setBens(b || []); setAssignes(a || []);
  }
  useEffect(() => { chargerAssign(); }, [dossier && dossier.id, ouvert]);
  async function assigner() {
    if (!choix) return;
    const { error } = await supabase.from("enquete_dossier_assignations").insert({ dossier_id: dossier.id, benevole_id: choix, assigne_par: email });
    if (error) setErreur("Assignation impossible : " + error.message); else { setChoix(""); chargerAssign(); }
  }
  async function retirer(id) { await supabase.from("enquete_dossier_assignations").delete().eq("id", id); chargerAssign(); }

  function listeFiltree() {
    return (liste || []).filter(x => (!filtreListeGroupe || (ENQ_CAT_FLAT.find(t => t[0] === x.categorie) || [])[2] === filtreListeGroupe) && (!filtreListeGravite || x.niveau_constat === filtreListeGravite) && (!filtreListeStatut || x.statut === filtreListeStatut));
  }

  // ---- Liste ----
  if (!ouvert) {
    const enAttenteLoc = Object.values(loadOfflineEnquetes()).filter(r => (deviceId ? r.deviceId === deviceId : r.creePar === email) && r.statutSync !== "synced");
    return (
      <div style={{ margin: "14px 0" }}>
        <IndicateurConnexionEnquetes email={email} deviceId={deviceId} />
        {!deviceId && <button onClick={nouveau} style={{ ...btn("var(--c-accent-dark)"), width: "100%", flex: "none" }}>+ Enquête environnementale standard</button>}
        {deviceId && liste && liste.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Dossiers d'enquête qui vous sont assignés</div>}
        {enAttenteLoc.length > 0 && <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Enquêtes en attente de synchronisation</div>
          {enAttenteLoc.map(r => (
            <button key={r.localId} onClick={() => reprendreLocal(r.localId)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: `1px solid ${r.statutSync === "conflit" ? "#B5451B" : "var(--c-border)"}`, borderRadius: 12, padding: 12, marginBottom: 8, cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.cols.titre || "Sans titre"}</div>
              <div style={{ fontSize: 11, color: r.statutSync === "conflit" ? "#B5451B" : "var(--c-text-muted)", marginTop: 2 }}>{r.statutSync === "conflit" ? "⚠️ Conflit à résoudre" : "🔵 En attente" + (r.remoteId ? " (modifications non envoyées)" : " (jamais synchronisée)")}</div>
            </button>))}
        </div>}
        {liste && liste.length > 0 && <div style={{ marginTop: 10 }}>
          {!deviceId && <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <select value={filtreListeGroupe} onChange={e => setFiltreListeGroupe(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Toutes catégories</option>{ENQ_CATEGORIES.map(([gk, gl]) => <option key={gk} value={gk}>{gl}</option>)}
              </select>
              <select value={filtreListeGravite} onChange={e => setFiltreListeGravite(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Toutes gravités</option>{ENQ_NIVEAUX.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={filtreListeStatut} onChange={e => setFiltreListeStatut(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Tous statuts</option>{Object.entries(ENQ_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            {(() => {
              const lf = listeFiltree();
              const zoneDe = (x) => { const dd = x.donnees || {}; const v = (k) => (dd[k] && dd[k].valeur) || (typeof dd[k] === "string" ? dd[k] : ""); return v("commune") || v("quartier") || v("localite") || ""; };
              const parGroupe = {}; lf.forEach(x => { const g = nomGroupe(x.categorie) || "Non classé"; parGroupe[g] = (parGroupe[g] || 0) + 1; });
              const parZone = {}; lf.forEach(x => { const z = zoneDe(x); if (z) parZone[z] = (parZone[z] || 0) + 1; });
              const topZones = Object.entries(parZone).sort((a, b) => b[1] - a[1]).slice(0, 5);
              function exporter() {
                const cols = [{ key: "numero", label: "Numéro" }, { key: "titre", label: "Titre" }, { key: "categorie", label: "Catégorie" }, { key: "sous_categorie", label: "Sous-catégorie" }, { key: "gravite", label: "Gravité" }, { key: "statut", label: "Statut" }, { key: "zone", label: "Localité" }, { key: "date", label: "Date de création" }];
                const rows = lf.map(x => ({ numero: x.numero, titre: x.titre, categorie: nomGroupe(x.categorie), sous_categorie: nomType(x.categorie), gravite: (ENQ_NIVEAUX.find(n => n[0] === x.niveau_constat) || [])[1] || "", statut: ENQ_STATUTS[x.statut], zone: zoneDe(x), date: new Date(x.created_at).toLocaleDateString("fr-FR") }));
                exportExcel(`ecovigil-enquetes-${new Date().toISOString().slice(0, 10)}.xlsx`, rows, cols, "Tableau de suivi des enquêtes");
              }
              return (
                <>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--c-text)" }}>{lf.length} dossier(s)</span>
                    {ENQ_NIVEAUX.filter(n => n[0] !== "a_determiner").map(([v, l]) => { const n = lf.filter(x => x.niveau_constat === v).length; return n > 0 ? <span key={v}>{l} : {n}</span> : null; })}
                  </div>
                  {Object.keys(parGroupe).length > 0 && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>
                    {Object.entries(parGroupe).sort((a, b) => b[1] - a[1]).map(([g, n]) => <span key={g}>{g} : {n}</span>)}
                  </div>}
                  {topZones.length > 0 && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>
                    <span>Principales zones :</span>{topZones.map(([z, n]) => <span key={z}>{z} ({n})</span>)}
                  </div>}
                  <button type="button" onClick={exporter} style={{ ...btn(), width: "100%", flex: "none", marginBottom: 10, fontSize: 12.5, padding: "8px 0" }}>Exporter le tableau de suivi (Excel)</button>
                </>
              );
            })()}
          </>}
          {listeFiltree().map(x => (
          <button key={x.id} onClick={() => ouvrir(x.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 8, cursor: "pointer" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{x.titre}</div>
            <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{x.numero} · {ENQ_STATUTS[x.statut]}{x.categorie ? " · " + nomType(x.categorie) : ""}{x.niveau_constat && x.niveau_constat !== "a_determiner" ? " · " + (ENQ_NIVEAUX.find(n => n[0] === x.niveau_constat) || [])[1] : ""}</div>
          </button>))}
          {source === "admin" && !deviceId && <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { const next = !showCorbeille; setShowCorbeille(next); if (next) chargerCorbeille(); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0 }}>{showCorbeille ? "Masquer la corbeille" : "Voir la corbeille"}</button>
            {showCorbeille && (
              <div style={{ marginTop: 8 }}>
                {corbeille === null && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>}
                {corbeille && corbeille.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Corbeille vide.</div>}
                {corbeille && corbeille.map(x => (
                  <div key={x.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{x.titre}</div>
                    <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{x.numero} · supprimé par {x.deleted_by || "?"} le {x.deleted_at ? new Date(x.deleted_at).toLocaleDateString("fr-FR") : "?"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button type="button" onClick={() => restaurerDossier(x.id)} style={{ ...btn(), padding: "6px 10px", fontSize: 12 }}>Restaurer</button>
                      <button type="button" onClick={() => supprimerDefinitivement(x.id)} style={{ ...btn(), padding: "6px 10px", fontSize: 12, color: "#B5451B", borderColor: "#B5451B" }}>Supprimer définitivement</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}</div>}
      </div>
    );
  }

  // ---- Formulaire par étapes ----
  const verrou = estVerrouille() && !conflit;
  const grp = ENQ_CATEGORIES.find(([gk]) => (ENQ_CAT_FLAT.find(t => t[0] === f.categorie) || [])[2] === gk);
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", margin: "14px 0" }}>
      <IndicateurConnexionEnquetes email={email} deviceId={deviceId} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{dossier ? dossier.numero : "Nouveau dossier"} · {sync}</div>
        <button onClick={() => { setOuvert(false); charger(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--c-text-muted)" }}>Fermer</button>
      </div>
      {conflit && <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12 }}>
        <b>⚠️ Conflit détecté</b> — ce dossier a été modifié ailleurs (par {conflit.enqueteur || conflit.cree_par || "une autre personne"}) le {new Date(conflit.updated_at).toLocaleString("fr-FR")}, après votre dernière synchronisation. Votre modification n'a pas été écrasée : choisissez comment continuer.
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" onClick={resoudreGarderMaVersion} style={{ ...btn("var(--c-accent-dark)"), padding: "8px 0" }}>Garder ma version</button>
          <button type="button" onClick={resoudreGarderVersionServeur} style={{ ...btn(), padding: "8px 0" }}>Garder celle du serveur</button>
        </div>
      </div>}
      <div style={{ height: 6, background: "var(--c-surface-soft)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ width: `${((etape + 1) / ENQ_ETAPES.length) * 100}%`, height: "100%", background: "var(--c-accent-dark)", transition: "width .2s" }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Étape {etape + 1}/{ENQ_ETAPES.length} — {ENQ_ETAPES[etape]}</div>
      {dossier && dossier.revision_commentaire && (f.statut === "a_revoir" || f.statut === "rejetee") && (
        <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12 }}>
          <b>{f.statut === "a_revoir" ? "À revoir" : "Dossier rejeté"}</b> — commentaire du réviseur{dossier.revision_par ? " (" + dossier.revision_par + ")" : ""} : {dossier.revision_commentaire}
        </div>
      )}
      {verrou && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>Dossier {f.statut === "rejetee" ? "rejeté" : f.statut === "verifiee" ? "vérifié" : "terminé"} : lecture seule.</div>}

      <fieldset disabled={verrou} style={{ border: "none", padding: 0, margin: 0 }}>
      {etape === 0 && <div>
        <label style={label}>Titre *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{f.titre || "—"}</div>
          : <input value={f.titre} onChange={e => setF(x => ({ ...x, titre: e.target.value }))} style={champStyle} />}
        <label style={label}>Type d'enquête *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomTypeEnquete(f.type_enquete)}</div>
          : <select value={f.type_enquete} onChange={e => setF(x => ({ ...x, type_enquete: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{ENQ_TYPE_ENQUETE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
        <label style={label}>Grande catégorie du problème *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomGroupe(f.categorie)}</div>
          : <select value={grp ? grp[0] : ""} onChange={e => { const g = ENQ_CATEGORIES.find(([gk]) => gk === e.target.value); setF(x => ({ ...x, categorie: g && g[2].length === 1 ? g[2][0][0] : "" })); }} style={champStyle}>
              <option value="">Choisir…</option>{ENQ_CATEGORIES.map(([gk, gl]) => <option key={gk} value={gk}>{gl}</option>)}
            </select>}
        {!deviceId && grp && grp[2].length > 1 && <>
          <label style={label}>Sous-catégorie *</label>
          <select value={f.categorie} onChange={e => setF(x => ({ ...x, categorie: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{grp[2].map(([sk, sl]) => <option key={sk} value={sk}>{sl}</option>)}</select>
        </>}
        {deviceId && grp && grp[2].length > 1 && <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomType(f.categorie)}</div>}
        {f.categorie === "autre" && champ("type_probleme_precision", "Préciser le problème environnemental *")}
        {deviceId && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: -6, marginBottom: 10 }}>Titre, type d'enquête et type de problème sont fixés par la personne qui a créé le dossier.</div>}
        {!deviceId && <div style={{ marginBottom: 10 }}>
          <label style={label}>Signalement citoyen à l'origine (facultatif)</label>
          {signalementLie ? (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 10, fontSize: 12.5 }}>
              <div><b>{signalementLie.categorie || "Signalement"}</b> · {new Date(signalementLie.created_at).toLocaleDateString("fr-FR")}</div>
              {signalementLie.description && <div style={{ color: "var(--c-text-muted)", marginTop: 4 }}>{signalementLie.description.slice(0, 140)}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {signalementLie.lat != null && <button type="button" onClick={reprendrePositionSignalement} style={{ ...btn(), padding: "6px 10px", fontSize: 12 }}>Reprendre sa position</button>}
                <button type="button" onClick={delierSignalement} style={{ ...btn(), padding: "6px 10px", fontSize: 12, color: "#B5451B" }}>Délier</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={rechSignalement} onChange={e => setRechSignalement(e.target.value)} onKeyDown={e => e.key === "Enter" && rechercherSignalements()} placeholder="Référence ou mots-clés du signalement" style={{ ...champStyle, marginBottom: 0 }} />
                <button type="button" onClick={rechercherSignalements} disabled={rechBusy} style={{ ...btn(), flex: "none", padding: "0 14px" }}>{rechBusy ? "…" : "Chercher"}</button>
              </div>
              {resultatsSignalement && resultatsSignalement.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 6 }}>Aucun signalement trouvé.</div>}
              {resultatsSignalement && resultatsSignalement.map(s => (
                <button key={s.id} type="button" onClick={() => lierSignalement(s)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 8, marginTop: 6, fontSize: 12, cursor: "pointer" }}>
                  <b>{s.categorie || "Signalement"}</b> · {new Date(s.created_at).toLocaleDateString("fr-FR")}{s.description ? " — " + s.description.slice(0, 80) : ""}
                </button>
              ))}
              <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 4 }}>L'enquête reste utilisable sans signalement lié, et un signalement reste consultable sans enquête.</div>
            </div>
          )}
        </div>}
        <label style={label}>Date et heure</label>
        <input type="datetime-local" value={d.date_heure || ""} onChange={e => setSimple("date_heure", e.target.value)} style={champStyle} />
        {!deviceId && <>
          <label style={label}>Profil de l'enquêteur</label>
          <select value={f.profil_enqueteur} onChange={e => setF(x => ({ ...x, profil_enqueteur: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{[["benevole","Bénévole"],["ong","ONG"],["agent_public","Agent public"],["autre","Autre"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </>}
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Enquêteur : {deviceId ? "vous" : email}{organisationId ? " · rattaché à votre organisation" : ""}</div>
      </div>}

      {etape === 1 && <div>
        {champ("localite", "Localité / zone *")}
        {champ("region", "Région")}{champ("prefecture", "Préfecture")}{champ("sous_prefecture", "Sous-préfecture / Commune")}{champ("commune", "Commune")}{champ("quartier", "Quartier / village / secteur")}{champ("lieu_dit", "Lieu-dit")}
        <button type="button" onClick={localiser} style={{ ...btn("var(--c-accent-dark)"), width: "100%", flex: "none", marginBottom: 6 }}>Utiliser ma position (GPS)</button>
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>Votre appareil vous demandera votre accord avant de partager la position. Vous pouvez aussi corriger les coordonnées à la main.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Latitude" value={f.lat} onChange={e => setF(x => ({ ...x, lat: e.target.value }))} style={champStyle} inputMode="decimal" />
          <input placeholder="Longitude" value={f.lng} onChange={e => setF(x => ({ ...x, lng: e.target.value }))} style={champStyle} inputMode="decimal" />
        </div>
        {f.precision_gps_m !== "" && <div style={{ fontSize: 12, marginBottom: 8 }}>Précision GPS : ± {f.precision_gps_m} m</div>}
        <PositionPicker lat={f.lat} lng={f.lng} onPick={(la, ln) => setF(x => ({ ...x, lat: la, lng: ln, precision_gps_m: "" }))} />
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>Touchez la carte pour placer ou corriger la position (la précision GPS est alors effacée).</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 6 }}>
          <input type="checkbox" checked={!!d.gps_indisponible} onChange={e => setSimple("gps_indisponible", e.target.checked)} />
          Position GPS indisponible sur le terrain — l'enquête peut continuer sans bloquer
        </label>
        {d.gps_indisponible && champ("gps_indisponible_motif", "Motif de l'indisponibilité du GPS *", 2)}
      </div>}

      {etape === 2 && <div>
        {champ("faits_observes", "Faits observés — ce que vous avez directement constaté *", 4)}
        {champ("periode", "Date ou période présumée du début")}{champ("etendue", "Étendue estimée")}{champ("frequence", "Fréquence")}
        {champ("causes_observables", "Causes observables", 3, true)}{champ("evolution", "Évolution observée (complément)", 2, true)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 12 }}>Ces éléments sont ce que vous avez vous-même constaté sur place.</div>
        {champ("informations_recueillies", "Informations recueillies auprès de témoins ou personnes rencontrées", 4)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 12 }}>Enregistrées comme « déclaré par un tiers », non vérifiées directement par vous.</div>
        {champ("analyse_recommandations", "Analyse et recommandations — votre appréciation et mesures proposées", 4)}
      </div>}

      {etape === 3 && <div>
        <label style={label}>Impacts — au moins une évaluation requise</label>
        {ENQ_IMPACT_DOMAINES.map(dom => {
          const v = (d.impacts_eval || {})[dom] || {};
          const justifReq = ENQ_IMPACT_JUSTIF_REQUISE.includes(v.niveau);
          return (
            <div key={dom} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{dom}</span>
                <select value={v.niveau || ""} onChange={e => setImpact(dom, { niveau: e.target.value })} style={{ ...champStyle, marginBottom: 0, width: "auto", padding: "8px 10px" }}>
                  <option value="">—</option>{ENQ_IMPACT_NIVEAUX.map(([nv, nl]) => <option key={nv} value={nv}>{nl}</option>)}
                </select>
              </div>
              {justifReq && <textarea value={v.justification || ""} onChange={e => setImpact(dom, { justification: e.target.value })} rows={2} placeholder="Justification obligatoire pour un impact Élevé ou Critique" style={{ ...champStyle, resize: "vertical", marginTop: 6, marginBottom: 0, borderColor: (v.justification || "").trim() ? "var(--c-border)" : "#B5451B" }} />}
            </div>
          );
        })}
        {champ("acteurs", "Personnes ou structures concernées", 3, true)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>Leur mention n'établit aucune responsabilité.</div>
      </div>}

      {etape === 4 && <div>
        {ENQ_GRAVITE_PREUVE_OBLIGATOIRE.includes(f.niveau_constat) && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>Niveau {(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[1]} : au moins une preuve est requise, sauf motif d'absence ci-dessous.</div>}
        {preuves.map(p => <div key={p.id} style={{ fontSize: 12, padding: "6px 0", borderTop: "1px solid var(--c-border)" }}>
          {p.type === "photo" && p.url && <img src={p.url} alt="" style={{ maxWidth: 120, borderRadius: 8, display: "block", marginBottom: 4 }} />}
          <b>{(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}</b> — {p.description} <em style={{ color: "var(--c-text-muted)" }}>({nomNature(p.nature)} · {new Date(p.capture_at || p.created_at).toLocaleString("fr-FR")})</em>
          {p.type === "audio" && p.url && <TranscriptionAudio preuve={p} transcription={transcriptions[p.id]} brouillonLocal={transcriptionsLocales[p.id]} estAdmin={estAdmin}
            onCommencer={() => creerTranscription(p.id)} onSauver={texte => sauverTranscriptionLocal(p.id, texte)} onSoumettre={texte => soumettreTranscription(p.id, texte)}
            onExaminer={statut => examinerTranscription(p.id, statut)} onRouvrir={() => rouvrirTranscription(p.id)} />}
        </div>)}
        {preuvesLocales.map(p => <div key={p.id} style={{ fontSize: 12, padding: "6px 0", borderTop: "1px solid var(--c-border)" }}>
          {p.type === "photo" && p.dataUrl && <img src={p.dataUrl} alt="" style={{ maxWidth: 120, borderRadius: 8, display: "block", marginBottom: 4 }} />}
          {p.type === "audio" && p.dataUrl && <audio src={p.dataUrl} controls style={{ width: "100%", marginBottom: 4 }} />}
          <b>{(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}</b> — {p.description} <em style={{ color: "var(--c-danger, #B5451B)" }}>🔵 en attente de synchronisation</em>
          {p.type === "audio" && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>La transcription sera possible une fois cet enregistrement synchronisé.</div>}
        </div>)}
        <select value={np.type} onChange={e => setNp(x => ({ ...x, type: e.target.value }))} style={champStyle}>{ENQ_PREUVES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <textarea value={np.description} onChange={e => setNp(x => ({ ...x, description: e.target.value }))} rows={2} placeholder="Description, mesure, propos recueillis…" style={{ ...champStyle, resize: "vertical" }} />
        {np.type === "photo" && <input type="file" accept="image/*" capture="environment" onChange={e => setNp(x => ({ ...x, fichier: e.target.files[0] || null }))} style={{ marginBottom: 10, fontSize: 12 }} />}
        {np.type === "audio" && <div style={{ marginBottom: 10 }}>
          <AudioRecorder onCapture={fichier => setNp(x => ({ ...x, fichier }))} />
          <label style={{ fontSize: 11.5, color: "var(--c-text-muted)", display: "block", marginTop: 4 }}>Ou choisir un enregistrement déjà existant :
            <input type="file" accept="audio/*" onChange={e => setNp(x => ({ ...x, fichier: e.target.files[0] || null }))} style={{ display: "block", marginTop: 4, fontSize: 12 }} />
          </label>
        </div>}
        <select value={np.nature} onChange={e => setNp(x => ({ ...x, nature: e.target.value }))} style={champStyle}>{ENQ_NATURES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button type="button" onClick={ajouterPreuve} disabled={busy} style={{ ...btn(), width: "100%", flex: "none" }}>{busy ? "…" : "+ Ajouter cet élément de preuve"}</button>
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 6, marginBottom: 10 }}>Date, heure et position du dossier sont associées à chaque élément. Fonctionne aussi hors connexion : la preuve est envoyée dès que possible.</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 6 }}>
          <input type="checkbox" checked={!!d.preuve_absente} onChange={e => setSimple("preuve_absente", e.target.checked)} />
          Aucune preuve disponible pour cette enquête
        </label>
        {d.preuve_absente && champ("preuve_absente_motif", "Motif de l'absence de preuve *", 2)}
      </div>}

      {etape === 5 && <div>
        <label style={label}>Niveau de gravité (appréciation environnementale, pas une qualification juridique)</label>
        <select value={f.niveau_constat} onChange={e => setF(x => ({ ...x, niveau_constat: e.target.value }))} style={champStyle}>{ENQ_NIVEAUX.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        {(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[2] && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: -6, marginBottom: 10 }}>{(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[2]}</div>}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>La gravité tient compte de l'étendue, l'intensité, la durée, le nombre de personnes affectées, l'impact sur les ressources naturelles et les écosystèmes, le risque pour la population, et le caractère immédiat ou potentiel du danger — jamais déduite automatiquement du seul type de problème.</div>
        <label style={label}>Actions réalisées</label>{multi("actions", ENQ_ACTIONS)}
        {champ("mesures", "Mesures proposées", 3)}{champ("priorites", "Actions prioritaires", 2)}{champ("autorite", "Autorité ou organisme à saisir")}{champ("suivi", "Besoin de suivi")}{champ("observations", "Observations complémentaires", 2)}
      </div>}

      {etape === 6 && <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{f.titre || "Sans titre"}</div>
        {ligne("Type d'enquête", nomTypeEnquete(f.type_enquete))}{ligne("Type de problème", f.categorie ? nomGroupe(f.categorie) + " > " + nomType(f.categorie) : "")}
        {signalementLie && ligne("Signalement lié", (signalementLie.categorie || "Signalement") + " du " + new Date(signalementLie.created_at).toLocaleDateString("fr-FR"))}
        {f.categorie === "autre" && ligne("Précision", val("type_probleme_precision"))}
        {ligne("Date", d.date_heure ? new Date(d.date_heure).toLocaleString("fr-FR") : "")}
        {ligne("Lieu", [val("localite"), val("quartier"), val("commune"), val("sous_prefecture"), val("prefecture"), val("region")].filter(Boolean).join(", "))}
        {carte ? ligne("GPS", `${f.lat}, ${f.lng}${f.precision_gps_m !== "" ? " (± " + f.precision_gps_m + " m)" : ""}`) : (d.gps_indisponible && ligne("GPS", "Indisponible — " + val("gps_indisponible_motif")))}
        {ligne("Faits observés", val("faits_observes"), "observe")}{ligne("Causes observables", val("causes_observables"), d.causes_observables && d.causes_observables.nature)}
        {ligne("Informations recueillies", val("informations_recueillies"), "declare")}{ligne("Analyse et recommandations", val("analyse_recommandations"))}
        {impactsRenseignes().length > 0 && ligne("Impacts évalués", Object.entries(d.impacts_eval || {}).filter(([, v]) => v && v.niveau).map(([k, v]) => `${k} : ${(ENQ_IMPACT_NIVEAUX.find(n => n[0] === v.niveau) || [])[1]}`).join(" ; "))}
        {ligne("Acteurs concernés", val("acteurs"), d.acteurs && d.acteurs.nature)}
        {ligne("Niveau de gravité", (ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[1])}{ligne("Actions réalisées", (d.actions || []).join(", "))}
        {ligne("Recommandations", val("mesures"))}{ligne("Preuves", preuves.length ? preuves.length + " élément(s)" : (d.preuve_absente ? "Aucune — " + val("preuve_absente_motif") : ""))}
        {!deviceId && dossier && <div style={{ marginTop: 10 }}>
          <label style={label}>Bénévoles assignés (accès à ce dossier uniquement)</label>
          {assignes.map(a => { const b = bens.find(x => x.id === a.benevole_id); return <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}><span>{b ? b.nom : "Bénévole"}{b && b.ville ? " · " + b.ville : ""}</span><button type="button" onClick={() => retirer(a.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", fontSize: 12 }}>Retirer</button></div>; })}
          <div style={{ display: "flex", gap: 8 }}><select value={choix} onChange={e => setChoix(e.target.value)} style={{ ...champStyle, marginBottom: 0 }}><option value="">Choisir un bénévole…</option>{bens.filter(b => !assignes.some(a => a.benevole_id === b.id)).map(b => <option key={b.id} value={b.id}>{b.nom}{b.ville ? " · " + b.ville : ""}</option>)}</select>
          <button type="button" onClick={assigner} style={{ ...btn("var(--c-accent-dark)"), flex: "none", padding: "0 14px" }}>Assigner</button></div>
        </div>}
        {!deviceId && hist.length > 0 && <div style={{ marginTop: 10 }}><label style={label}>Historique des modifications</label>
          {hist.map(h => <div key={h.id} style={{ fontSize: 11.5, padding: "4px 0", borderTop: "1px solid var(--c-border)" }}>{new Date(h.created_at).toLocaleString("fr-FR")} · {h.action === "creation" ? "Création" : h.action === "changement_statut" ? `Statut : ${ENQ_STATUTS[h.ancien_statut]} → ${ENQ_STATUTS[h.nouveau_statut]}` : "Modification" + (h.champs_modifies ? " (" + h.champs_modifies.filter(c => c !== "donnees" || true).join(", ") + ")" : "")}{h.auteur ? " · " + h.auteur : ""}</div>)}</div>}
        {source === "admin" && !deviceId && dossier && dossier.id && ["terminee", "verifiee", "a_revoir", "rejetee"].includes(f.statut) && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid var(--c-border)" }}>
            <label style={label}>Examen du dossier (équipe EcoVigil)</label>
            <textarea value={commentaireRevision} onChange={e => setCommentaireRevision(e.target.value)} rows={2} placeholder="Commentaire pour l'enquêteur (obligatoire pour « À revoir » et « Rejeter »)" style={{ ...champStyle, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => examiner("verifiee")} style={{ ...btn("var(--c-accent-dark)"), padding: "9px 0", fontSize: 12.5 }}>Valider</button>
              <button type="button" onClick={() => examiner("a_revoir")} style={{ ...btn(), padding: "9px 0", fontSize: 12.5 }}>À revoir</button>
              <button type="button" onClick={() => examiner("rejetee")} style={{ ...btn(), padding: "9px 0", fontSize: 12.5, color: "#B5451B", borderColor: "#B5451B" }}>Rejeter</button>
            </div>
          </div>
        )}
        <label style={{ ...label, marginTop: 10 }}>Statut</label>
        <select value={f.statut} onChange={e => setF(x => ({ ...x, statut: e.target.value }))} style={champStyle}>{Object.entries(ENQ_STATUTS).filter(([k]) => ["brouillon", "en_cours", "terminee"].includes(k) || k === f.statut).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {dossier && dossier.verificateur && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Vérifié par {dossier.verificateur} le {new Date(dossier.verifie_at).toLocaleDateString("fr-FR")}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => valider(["terminee", "verifiee", "a_revoir", "rejetee"].includes(f.statut) ? f.statut : "brouillon")} style={btn()}>{f.statut === "a_revoir" ? "Enregistrer mes corrections" : "Enregistrer comme brouillon"}</button>
          <button type="button" onClick={() => valider("terminee")} style={btn("var(--c-accent-dark)")}>Valider (terminée)</button>
        </div>
        {dossier && dossier.id && (f.statut === "terminee" || f.statut === "verifiee") && <button type="button" onClick={rapport} style={{ ...btn("#1F5C38"), width: "100%", flex: "none", marginTop: 8 }}>Générer le rapport</button>}
        {!deviceId && dossier && dossier.id && <button type="button" onClick={supprimerDossier} style={{ ...btn(), width: "100%", flex: "none", marginTop: 8, color: "#B5451B", borderColor: "#B5451B" }}>Supprimer ce dossier</button>}
      </div>}
      </fieldset>

      {erreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginTop: 8 }}>{erreur}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button type="button" disabled={etape === 0} onClick={() => { setErreur(""); setEtape(etape - 1); }} style={{ ...btn(), opacity: etape === 0 ? 0.4 : 1 }}>Précédent</button>
        {etape < ENQ_ETAPES.length - 1 && <button type="button" onClick={() => { setErreur(""); setEtape(etape + 1); }} style={btn("var(--c-accent-dark)")}>Suivant</button>}
      </div>
    </div>
  );
}

// Bibliothèque de questions réutilisables du constructeur libre (inspirée de KoboToolbox) :
// on y garde une question du brouillon pour la réutiliser dans d'autres enquêtes, en un clic.
// Les questions du Centre d'EcoVigil (organisation_id nul) sont visibles de toutes les organisations
// mais seul le Centre peut les modifier ; chaque organisation gère les siennes.
function BibliothequeQuestions({ organisationId, email, isAdmin, draftQuestions, onAjouter }) {
  const [ouvert, setOuvert] = useState(false);
  const [items, setItems] = useState(null);
  const [aGarder, setAGarder] = useState("");
  const [msg, setMsg] = useState("");
  async function charger() {
    const { data } = await supabase.from("enquete_bibliotheque").select("*").order("created_at", { ascending: false }).limit(200);
    setItems((data || []).filter(r => isAdmin ? r.organisation_id == null : (r.organisation_id == null || r.organisation_id === organisationId)));
  }
  useEffect(() => { if (ouvert) charger(); }, [ouvert]);
  async function garder() {
    if (aGarder === "") return;
    const q = draftQuestions[Number(aGarder)]; if (!q) return;
    const { error } = await supabase.from("enquete_bibliotheque").insert({
      organisation_id: isAdmin ? null : organisationId, cree_par: email, texte: q.texte, type_reponse: q.type_reponse, options: q.options || null, validation: q.validation || null,
    });
    setMsg(error ? "Impossible d'enregistrer : " + error.message : "Question ajoutée à la bibliothèque ✓");
    setAGarder(""); if (!error && ouvert) charger();
  }
  async function supprimer(id) {
    if (!window.confirm("Retirer cette question de la bibliothèque ?")) return;
    await supabase.from("enquete_bibliotheque").delete().eq("id", id); charger();
  }
  const petit = { padding: "5px 9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" };
  return (
    <div style={{ marginBottom: 8, padding: 8, borderRadius: 10, background: "var(--c-surface-soft)" }}>
      <button type="button" onClick={() => setOuvert(o => !o)} style={{ ...petit, border: "none", padding: 0, fontWeight: 600 }}>{ouvert ? "▾" : "▸"} Bibliothèque de questions</button>
      {ouvert && (
        <div style={{ marginTop: 8 }}>
          {items === null && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>}
          {items && items.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune question enregistrée pour l'instant.</div>}
          {items && items.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 11.5, padding: "4px 0" }}>
              <span>{r.texte} <em style={{ color: "var(--c-text-muted)" }}>({r.type_reponse}{r.organisation_id == null && !isAdmin ? " · EcoVigil" : ""})</em></span>
              <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button type="button" onClick={() => onAjouter({ texte: r.texte, type_reponse: r.type_reponse, options: r.options || null, validation: r.validation || null, conditionIndex: null, conditionValeur: null, groupe: null })} style={petit}>Ajouter</button>
                {(isAdmin || r.organisation_id != null) && <button type="button" onClick={() => supprimer(r.id)} style={{ ...petit, color: "#B5451B" }}>×</button>}
              </span>
            </div>
          ))}
          {draftQuestions.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <select value={aGarder} onChange={e => { setAGarder(e.target.value); setMsg(""); }} style={{ flex: 1, padding: 6, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5, background: "var(--c-surface)" }}>
                <option value="">Garder une question du brouillon…</option>
                {draftQuestions.map((q, i) => <option key={i} value={i}>{q.texte}</option>)}
              </select>
              <button type="button" onClick={garder} disabled={aGarder === ""} style={petit}>Garder</button>
            </div>
          )}
          {msg && <div style={{ fontSize: 11, marginTop: 6, color: "var(--c-text-muted)" }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}

function AdminEnquetes({ session }) {
  const email = session && session.user ? session.user.email : "";
  const [liste, setListe] = useState(null);
  const [selection, setSelection] = useState(null);
  const [detail, setDetail] = useState(null);

  const [showCreer, setShowCreer] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("questionnaire");
  const [categorie, setCategorie] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [qTexte, setQTexte] = useState("");
  const [qType, setQType] = useState("texte");
  const [qOptions, setQOptions] = useState("");
  const [qConditionIndex, setQConditionIndex] = useState("");
  const [qConditionValeur, setQConditionValeur] = useState("");
  const [qGroupe, setQGroupe] = useState("");
  const [qFormat, setQFormat] = useState("texte");   // pour les questions "texte" : "texte" ou "nombre"
  const [qMin, setQMin] = useState("");
  const [qMax, setQMax] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  const [noteEntree, setNoteEntree] = useState("");
  const [photoEntree, setPhotoEntree] = useState(null);
  const [busyEntree, setBusyEntree] = useState(false);
  const [resultatPublic, setResultatPublic] = useState("");
  const fileRefEntree = useRef(null);

  async function charger() {
    const { data } = await supabase.from("enquetes").select("*").order("created_at", { ascending: false }).limit(100);
    setListe(data || []);
  }
  useEffect(() => { charger(); }, []);

  const optionsQuestion = (q) => q.type_reponse === "oui_non" ? ["Oui", "Non"] : q.type_reponse === "echelle" ? [1, 2, 3, 4, 5] : (q.options || []);

  function ajouterQuestionDraft() {
    if (!qTexte.trim()) return;
    const validation = qType === "texte" && qFormat === "nombre" ? { kind: "nombre", min: qMin !== "" ? Number(qMin) : null, max: qMax !== "" ? Number(qMax) : null }
      : qType === "texte" && (qMin !== "" || qMax !== "") ? { kind: "texte", min_len: qMin !== "" ? Number(qMin) : null, max_len: qMax !== "" ? Number(qMax) : null }
      : null;
    setDraftQuestions(prev => [...prev, {
      texte: qTexte.trim(), type_reponse: qType,
      options: (qType === "choix_unique" || qType === "choix_multiple") ? qOptions.split(",").map(o => o.trim()).filter(Boolean) : null,
      conditionIndex: qConditionIndex === "" ? null : Number(qConditionIndex), conditionValeur: qConditionIndex === "" ? null : qConditionValeur,
      groupe: qGroupe.trim() || null, validation,
    }]);
    setQTexte(""); setQOptions(""); setQConditionIndex(""); setQConditionValeur(""); setQGroupe(qGroupe); setQFormat("texte"); setQMin(""); setQMax("");
  }
  function retirerQuestionDraft(i) {
    setDraftQuestions(prev => prev.filter((_, idx) => idx !== i)
      .map(q => q.conditionIndex == null ? q : { ...q, conditionIndex: q.conditionIndex === i ? null : (q.conditionIndex > i ? q.conditionIndex - 1 : q.conditionIndex) }));
  }

  async function creerEnquete() {
    setErreur("");
    if (!titre.trim()) { setErreur("Le titre est requis."); return; }
    if (type !== "investigation" && draftQuestions.length === 0) { setErreur("Ajoute au moins une question pour un questionnaire."); return; }
    setBusy(true);
    const { data: enq, error } = await supabase.from("enquetes").insert({
      titre: titre.trim(), description: description.trim() || null, type, categorie: categorie.trim() || null, cree_par: email,
    }).select().single();
    if (error || !enq) { setBusy(false); setErreur("Échec de la création : " + (error ? error.message : "erreur inconnue")); return; }
    if (draftQuestions.length) {
      const { data: inserees } = await supabase.from("enquete_questions").insert(draftQuestions.map((q, i) => ({ enquete_id: enq.id, ordre: i, texte: q.texte, type_reponse: q.type_reponse, options: q.options, groupe_repetable: q.groupe, validation: q.validation }))).select();
      const idParOrdre = {}; (inserees || []).forEach(r => { idParOrdre[r.ordre] = r.id; });
      const maj = draftQuestions.map((q, i) => q.conditionIndex != null && idParOrdre[i] != null && idParOrdre[q.conditionIndex] != null
        ? supabase.from("enquete_questions").update({ condition_question_id: idParOrdre[q.conditionIndex], condition_valeur: String(q.conditionValeur) }).eq("id", idParOrdre[i]) : null).filter(Boolean);
      if (maj.length) await Promise.all(maj);
    }
    setBusy(false);
    setShowCreer(false);
    setTitre(""); setDescription(""); setCategorie(""); setType("questionnaire"); setDraftQuestions([]);
    charger();
  }

  async function ouvrirGestion(enq) {
    setSelection(enq);
    setDetail(null);
    setResultatPublic(enq.resultat_public || "");
    const [{ data: questions }, { data: participations }, { data: entrees }] = await Promise.all([
      supabase.from("enquete_questions").select("*").eq("enquete_id", enq.id).order("ordre", { ascending: true }),
      supabase.from("enquete_participations").select("id, enquete_reponses(question_id, valeur)").eq("enquete_id", enq.id),
      supabase.from("enquete_entrees").select("*").eq("enquete_id", enq.id).order("created_at", { ascending: false }),
    ]);
    setDetail({ questions: questions || [], participations: participations || [], entrees: entrees || [] });
  }

  function statsQuestion(q) {
    const valeurs = [];
    (detail.participations || []).forEach(p => {
      // Un groupe répétable peut produire plusieurs réponses à la même question pour une
      // participation (une par occurrence ajoutée) : on les compte toutes, chacune comme une
      // observation distincte.
      (p.enquete_reponses || []).filter(x => x.question_id === q.id).forEach(r => { if (r.valeur) valeurs.push(r.valeur); });
    });
    if (q.type_reponse === "texte") return { texte: valeurs };
    const comptage = {};
    valeurs.forEach(v => { v.split(", ").forEach(part => { comptage[part] = (comptage[part] || 0) + 1; }); });
    return { comptage, total: valeurs.length };
  }

  async function choisirPhotoEntree(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => setPhotoEntree(await compressImage(reader.result, 900, 0.7));
    reader.readAsDataURL(f);
  }

  async function ajouterEntree() {
    if (!noteEntree.trim() || !selection) return;
    setBusyEntree(true);
    const photoUrl = photoEntree ? await uploadPhotoGeneric(photoEntree, "enquetes") : null;
    await supabase.from("enquete_entrees").insert({ enquete_id: selection.id, auteur: email, contenu: noteEntree.trim(), photo_url: photoUrl });
    setNoteEntree(""); setPhotoEntree(null);
    setBusyEntree(false);
    ouvrirGestion(selection);
  }

  async function enregistrerResultat() {
    if (!selection) return;
    await supabase.from("enquetes").update({ resultat_public: resultatPublic.trim() || null }).eq("id", selection.id);
  }

  async function cloturer() {
    if (!selection) return;
    if (!confirm("Clôturer cette enquête ? Le résultat public (si renseigné) devient visible par tous, et plus personne ne pourra y répondre.")) return;
    await supabase.from("enquetes").update({ statut: "fermee", resultat_public: resultatPublic.trim() || null, cloturee_at: new Date().toISOString() }).eq("id", selection.id);
    charger();
    setSelection(null); setDetail(null);
  }
  async function reouvrir() {
    if (!selection) return;
    await supabase.from("enquetes").update({ statut: "ouverte", cloturee_at: null }).eq("id", selection.id);
    charger();
    ouvrirGestion({ ...selection, statut: "ouverte" });
  }
  // Suppression définitive (tout type, tout statut) — réservée au Super administrateur ici
  // (voir la policy RLS "suppression enquetes") ; efface aussi questions, participations et
  // réponses (cascade en base), et détache un dossier d'enquête éventuellement lié sans le supprimer.
  async function supprimerEnquete() {
    if (!selection) return;
    if (!confirm(`Supprimer définitivement l'enquête « ${selection.titre} » ? Cette action est irréversible : ses questions, participations et réponses seront aussi effacées.`)) return;
    setErreur("");
    const { error } = await supabase.from("enquetes").delete().eq("id", selection.id);
    if (error) { setErreur("Suppression impossible : " + error.message); return; }
    charger();
    setSelection(null); setDetail(null);
  }

  const champ = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };
  const typeLabel = { questionnaire: "Questionnaire", investigation: "Investigation", mixte: "Questionnaire + investigation" };

  // --- Vue gestion d'une enquête ---
  if (selection && detail) {
    return (
      <div>
        <button onClick={() => { setSelection(null); setDetail(null); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Enquêtes</button>
        <SectionTitle sub={typeLabel[selection.type]}>{selection.titre}</SectionTitle>
        <div style={{ fontSize: 11.5, color: selection.statut === "ouverte" ? "var(--c-accent-dark)" : "var(--c-text-muted)", marginBottom: 14 }}>
          {selection.statut === "ouverte" ? "● En cours" : "● Clôturée"}
        </div>

        {selection.type !== "questionnaire" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Journal d'investigation ({detail.entrees.length})</div>
            <input ref={fileRefEntree} type="file" accept="image/*" onChange={choisirPhotoEntree} style={{ display: "none" }} />
            <textarea value={noteEntree} onChange={e => setNoteEntree(e.target.value)} rows={2} placeholder="Ajouter une note, une preuve, une avancée…" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" onClick={() => fileRefEntree.current && fileRefEntree.current.click()} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: photoEntree ? "var(--c-surface-soft)" : "none", fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <IconCamera size={13} /> {photoEntree ? "Photo jointe" : "Ajouter une photo"}
              </button>
              <button onClick={ajouterEntree} disabled={busyEntree || !noteEntree.trim()} style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer", opacity: busyEntree ? 0.7 : 1 }}>
                {busyEntree ? "…" : "Ajouter au journal"}
              </button>
            </div>
            {detail.entrees.map(en => (
              <div key={en.id} style={{ borderTop: "1px solid var(--c-border)", padding: "8px 0", fontSize: 12 }}>
                <div style={{ color: "var(--c-text-secondary)" }}>{en.contenu}</div>
                {en.photo_url && <img src={en.photo_url} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 6 }} />}
                <div style={{ fontSize: 10, color: "var(--c-text-muted)", marginTop: 3 }}>{en.auteur} · {new Date(en.created_at).toLocaleString("fr-FR")}</div>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Résultat public (visible à la clôture)</div>
              <textarea value={resultatPublic} onChange={e => setResultatPublic(e.target.value)} rows={2} placeholder="Conclusion communicable à tous…" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={enregistrerResultat} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" }}>Enregistrer le brouillon</button>
                {selection.statut === "ouverte"
                  ? <button onClick={cloturer} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Clôturer</button>
                  : <button onClick={reouvrir} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Rouvrir</button>}
              </div>
              <button onClick={supprimerEnquete} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 8, border: "1px solid #B5451B", background: "none", color: "#B5451B", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Supprimer définitivement cette enquête</button>
            </div>
          </div>
        )}

        {selection.type !== "investigation" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Réponses ({detail.participations.length} participation{detail.participations.length > 1 ? "s" : ""})</div>
            {detail.questions.map(q => {
              const s = statsQuestion(q);
              return (
                <div key={q.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>{q.texte}</div>
                  {q.type_reponse === "texte" ? (
                    s.texte.length === 0 ? <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune réponse.</div> :
                    s.texte.slice(0, 20).map((t, i) => <div key={i} style={{ fontSize: 11.5, color: "var(--c-text-secondary)", padding: "3px 0", borderTop: i > 0 ? "1px solid var(--c-border)" : "none" }}>« {t} »</div>)
                  ) : Object.keys(s.comptage).length === 0 ? <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune réponse.</div> : (
                    Object.entries(s.comptage).map(([opt, n]) => (
                      <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, width: 90, flexShrink: 0, color: "var(--c-text-secondary)" }}>{opt}</div>
                        <div style={{ flex: 1, height: 8, background: "var(--c-surface-soft)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${(n / s.total) * 100}%`, height: "100%", background: "var(--c-accent-dark)" }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", width: 20 }}>{n}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- Vue liste ---
  return (
    <div>
      <SectionTitle sub="Questionnaires citoyens et dossiers d'investigation, créés et suivis par l'équipe.">Enquêtes</SectionTitle>

      <EnquetesStandard email={email} organisationId={null} source="admin" />
      {!showCreer ? (
        <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", margin: "14px 0" }}>
          <IconPlus size={16} /> Créer une enquête
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", margin: "14px 0" }}>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l'enquête" style={champ} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description (optionnel)" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={categorie} onChange={e => setCategorie(e.target.value)} placeholder="Catégorie liée (optionnel, ex : pollution_eau)" style={champ} />
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["questionnaire", "Questionnaire"], ["investigation", "Investigation"], ["mixte", "Les deux"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setType(v)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${type === v ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: type === v ? "var(--c-accent-dark)" : "none", color: type === v ? "#fff" : "var(--c-text)", fontSize: 11, cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          {type !== "investigation" && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Questions ({draftQuestions.length})</div>
              {draftQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, padding: "4px 0" }}>
                  <span>{q.texte} <em style={{ color: "var(--c-text-muted)" }}>({q.type_reponse}{q.conditionIndex != null && draftQuestions[q.conditionIndex] ? ` · si « ${draftQuestions[q.conditionIndex].texte} » = ${q.conditionValeur}` : ""}{q.groupe ? ` · groupe « ${q.groupe} »` : ""}{q.validation ? (q.validation.kind === "nombre" ? ` · nombre ${q.validation.min ?? "…"}–${q.validation.max ?? "…"}` : ` · ${q.validation.min_len ?? 0}–${q.validation.max_len ?? "…"} car.`) : ""})</em></span>
                  <button type="button" onClick={() => retirerQuestionDraft(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)" }}><IconX size={13} /></button>
                </div>
              ))}
              <BibliothequeQuestions organisationId={null} email={email} isAdmin={true} draftQuestions={draftQuestions} onAjouter={q => setDraftQuestions(prev => [...prev, q])} />
              <input value={qTexte} onChange={e => setQTexte(e.target.value)} placeholder="Texte de la question" style={{ ...champ, marginTop: 6 }} />
              <select value={qType} onChange={e => setQType(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                <option value="texte">Réponse libre</option>
                <option value="oui_non">Oui / Non</option>
                <option value="echelle">Échelle 1 à 5</option>
                <option value="choix_unique">Choix unique</option>
                <option value="choix_multiple">Choix multiple</option>
              </select>
              {(qType === "choix_unique" || qType === "choix_multiple") && (
                <input value={qOptions} onChange={e => setQOptions(e.target.value)} placeholder="Options séparées par des virgules" style={champ} />
              )}
              {qType === "texte" && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qFormat} onChange={e => { setQFormat(e.target.value); setQMin(""); setQMax(""); }} style={{ ...champ, marginBottom: 6, background: "var(--c-surface)" }}>
                    <option value="texte">Format : texte libre</option>
                    <option value="nombre">Format : nombre</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" value={qMin} onChange={e => setQMin(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur minimale" : "Longueur minimale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                    <input type="number" value={qMax} onChange={e => setQMax(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur maximale" : "Longueur maximale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>Optionnel : le bénévole ne pourra pas envoyer une réponse qui sort de ces limites.</div>
                </div>
              )}
              <input value={qGroupe} onChange={e => setQGroupe(e.target.value)} list="groupes-repetables-admin" placeholder="Groupe répétable (optionnel, ex : Point de pollution)" style={champ} />
              <datalist id="groupes-repetables-admin">{[...new Set(draftQuestions.map(q => q.groupe).filter(Boolean))].map(g => <option key={g} value={g} />)}</datalist>
              {qGroupe.trim() && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: -4, marginBottom: 8 }}>Cette question et les suivantes portant le même nom de groupe pourront être répétées plusieurs fois par le répondant (ex. plusieurs sites touchés).</div>}
              {draftQuestions.some(q => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse)) && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qConditionIndex} onChange={e => { setQConditionIndex(e.target.value); setQConditionValeur(""); }} style={{ ...champ, marginBottom: qConditionIndex !== "" ? 6 : 8, background: "var(--c-surface)" }}>
                    <option value="">Toujours poser cette question</option>
                    {draftQuestions.map((q, i) => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse) ? <option key={i} value={i}>Poser seulement si « {q.texte} » =…</option> : null)}
                  </select>
                  {qConditionIndex !== "" && (
                    <select value={qConditionValeur} onChange={e => setQConditionValeur(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                      <option value="">Choisir la valeur déclenchante…</option>
                      {optionsQuestion(draftQuestions[Number(qConditionIndex)]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              )}
              <button type="button" onClick={ajouterQuestionDraft} style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px dashed var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" }}>+ Ajouter cette question</button>
            </div>
          )}

          {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
          <button onClick={creerEnquete} disabled={busy} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
            {busy ? "…" : "Créer l'enquête"}
          </button>
          <button onClick={() => setShowCreer(false)} style={{ width: "100%", padding: "6px 0", background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", marginTop: 4 }}>Annuler</button>
        </div>
      )}

      {liste === null ? (
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Chargement…</div>
      ) : liste.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Aucune enquête créée pour le moment.</div>
      ) : (
        <div className="pace-grid-cards">
          {liste.map(e => (
            <button key={e.id} onClick={() => ouvrirGestion(e)} style={{
              textAlign: "left", background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{e.titre}</div>
              <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{typeLabel[e.type]} · {e.statut === "ouverte" ? "en cours" : "clôturée"}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Version "Espace Organisation" du module Enquêtes : même logique de création/gestion que côté
// admin (AdminEnquetes), mais strictement scopée à l'organisation courante — elle ne voit et ne
// gère que les enquêtes qu'elle a elle-même créées (organisation_id = son propre id), jamais
// celles créées par l'équipe EcoVigil ni par une autre organisation. S'appuie sur la colonne
// enquetes.organisation_id et les policies RLS existantes (déjà en place côté base), qui
// autorisent déjà une organisation validée à créer/lire/modifier ses propres enquêtes, questions,
// entrées de journal et réponses.
function OrgEnquetes({ organisationId, email }) {
  const [liste, setListe] = useState(null);
  const [selection, setSelection] = useState(null);
  const [detail, setDetail] = useState(null);

  const [showCreer, setShowCreer] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("questionnaire");
  const [modeCollecte, setModeCollecte] = useState("terrain");
  const [categorie, setCategorie] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [qTexte, setQTexte] = useState("");
  const [qType, setQType] = useState("texte");
  const [qOptions, setQOptions] = useState("");
  const [qReponseSuggeree, setQReponseSuggeree] = useState("");
  const [qConditionIndex, setQConditionIndex] = useState("");
  const [qConditionValeur, setQConditionValeur] = useState("");
  const [qGroupe, setQGroupe] = useState("");
  const [qFormat, setQFormat] = useState("texte");   // pour les questions "texte" : "texte" ou "nombre"
  const [qMin, setQMin] = useState("");
  const [qMax, setQMax] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  const [noteEntree, setNoteEntree] = useState("");
  const [photoEntree, setPhotoEntree] = useState(null);
  const [busyEntree, setBusyEntree] = useState(false);
  const [resultatPublic, setResultatPublic] = useState("");
  const fileRefEntree = useRef(null);

  const [benevolesOrg, setBenevolesOrg] = useState([]);
  const [partageMsg, setPartageMsg] = useState("");
  const [busyPartage, setBusyPartage] = useState(false);

  async function charger() {
    if (!organisationId) return;
    const { data } = await supabase.from("enquetes").select("*").eq("organisation_id", organisationId).order("created_at", { ascending: false }).limit(100);
    setListe(data || []);
  }
  useEffect(() => { charger(); }, [organisationId]);

  // Bénévoles affiliés (assignés) à l'organisation — sert à la fois pour le partage du
  // formulaire et pour afficher qui a réalisé quelles interviews dans les statistiques.
  useEffect(() => {
    if (!organisationId) return;
    supabase.from("benevoles").select("device_id, nom").eq("organisation_id", organisationId).eq("is_deleted", false)
      .then(({ data }) => setBenevolesOrg((data || []).filter(b => b.device_id)));
  }, [organisationId]);

  async function partagerAuxBenevoles(enq) {
    if (benevolesOrg.length === 0) { setPartageMsg("Aucun bénévole affilié pour le moment — assigne d'abord des bénévoles à ton organisation."); return; }
    setBusyPartage(true);
    setPartageMsg("");
    await Promise.all(benevolesOrg.map(b => supabase.from("notifications").insert({
      destinataire: b.device_id,
      message: `Nouveau formulaire d'enquête terrain à réaliser : « ${enq.titre} »`,
      lien: "enquetes_terrain",
    })));
    setBusyPartage(false);
    setPartageMsg(`Formulaire partagé à ${benevolesOrg.length} bénévole${benevolesOrg.length > 1 ? "s" : ""} affilié${benevolesOrg.length > 1 ? "s" : ""}.`);
  }

  const optionsQuestion = (q) => q.type_reponse === "oui_non" ? ["Oui", "Non"] : q.type_reponse === "echelle" ? [1, 2, 3, 4, 5] : (q.options || []);

  function ajouterQuestionDraft() {
    if (!qTexte.trim()) return;
    // "options" sert de conteneur générique par question : liste de choix pour choix_unique/multiple,
    // ou — nouveauté — tableau à un seul élément portant la réponse suggérée par l'organisation pour
    // une question en texte libre (accélère l'interview et limite les mauvaises interprétations côté
    // bénévole, qui peut toujours la corriger si le citoyen répond différemment).
    const options = (qType === "choix_unique" || qType === "choix_multiple")
      ? qOptions.split(",").map(o => o.trim()).filter(Boolean)
      : (qType === "texte" && qReponseSuggeree.trim() ? [qReponseSuggeree.trim()] : null);
    const validation = qType === "texte" && qFormat === "nombre" ? { kind: "nombre", min: qMin !== "" ? Number(qMin) : null, max: qMax !== "" ? Number(qMax) : null }
      : qType === "texte" && (qMin !== "" || qMax !== "") ? { kind: "texte", min_len: qMin !== "" ? Number(qMin) : null, max_len: qMax !== "" ? Number(qMax) : null }
      : null;
    setDraftQuestions(prev => [...prev, { texte: qTexte.trim(), type_reponse: qType, options,
      conditionIndex: qConditionIndex === "" ? null : Number(qConditionIndex), conditionValeur: qConditionIndex === "" ? null : qConditionValeur,
      groupe: qGroupe.trim() || null, validation }]);
    setQTexte(""); setQOptions(""); setQReponseSuggeree(""); setQConditionIndex(""); setQConditionValeur(""); setQGroupe(qGroupe); setQFormat("texte"); setQMin(""); setQMax("");
  }
  function retirerQuestionDraft(i) {
    setDraftQuestions(prev => prev.filter((_, idx) => idx !== i)
      .map(q => q.conditionIndex == null ? q : { ...q, conditionIndex: q.conditionIndex === i ? null : (q.conditionIndex > i ? q.conditionIndex - 1 : q.conditionIndex) }));
  }

  async function creerEnquete() {
    setErreur("");
    if (!titre.trim()) { setErreur("Le titre est requis."); return; }
    if (type !== "investigation" && draftQuestions.length === 0) { setErreur("Ajoute au moins une question pour un questionnaire."); return; }
    setBusy(true);
    const { data: enq, error } = await supabase.from("enquetes").insert({
      titre: titre.trim(), description: description.trim() || null, type, categorie: categorie.trim() || null, cree_par: email, organisation_id: organisationId,
      mode_collecte: type === "investigation" ? "citoyen" : modeCollecte,
    }).select().single();
    if (error || !enq) { setBusy(false); setErreur("Échec de la création : " + (error ? error.message : "erreur inconnue")); return; }
    if (draftQuestions.length) {
      const { data: inserees } = await supabase.from("enquete_questions").insert(draftQuestions.map((q, i) => ({ enquete_id: enq.id, ordre: i, texte: q.texte, type_reponse: q.type_reponse, options: q.options, groupe_repetable: q.groupe, validation: q.validation }))).select();
      const idParOrdre = {}; (inserees || []).forEach(r => { idParOrdre[r.ordre] = r.id; });
      const maj = draftQuestions.map((q, i) => q.conditionIndex != null && idParOrdre[i] != null && idParOrdre[q.conditionIndex] != null
        ? supabase.from("enquete_questions").update({ condition_question_id: idParOrdre[q.conditionIndex], condition_valeur: String(q.conditionValeur) }).eq("id", idParOrdre[i]) : null).filter(Boolean);
      if (maj.length) await Promise.all(maj);
    }
    setBusy(false);
    setShowCreer(false);
    setTitre(""); setDescription(""); setCategorie(""); setType("questionnaire"); setModeCollecte("terrain"); setDraftQuestions([]);
    charger();
  }

  async function ouvrirGestion(enq) {
    setSelection(enq);
    setDetail(null);
    setResultatPublic(enq.resultat_public || "");
    const [{ data: questions }, { data: participations }, { data: entrees }] = await Promise.all([
      supabase.from("enquete_questions").select("*").eq("enquete_id", enq.id).order("ordre", { ascending: true }),
      supabase.from("enquete_participations").select("id, benevole_device_id, enquete_reponses(question_id, valeur)").eq("enquete_id", enq.id),
      supabase.from("enquete_entrees").select("*").eq("enquete_id", enq.id).order("created_at", { ascending: false }),
    ]);
    setDetail({ questions: questions || [], participations: participations || [], entrees: entrees || [] });
  }

  function statsQuestion(q) {
    const valeurs = [];
    (detail.participations || []).forEach(p => {
      // Un groupe répétable peut produire plusieurs réponses à la même question pour une
      // participation (une par occurrence ajoutée) : on les compte toutes, chacune comme une
      // observation distincte.
      (p.enquete_reponses || []).filter(x => x.question_id === q.id).forEach(r => { if (r.valeur) valeurs.push(r.valeur); });
    });
    if (q.type_reponse === "texte") return { texte: valeurs };
    const comptage = {};
    valeurs.forEach(v => { v.split(", ").forEach(part => { comptage[part] = (comptage[part] || 0) + 1; }); });
    return { comptage, total: valeurs.length };
  }

  async function choisirPhotoEntree(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => setPhotoEntree(await compressImage(reader.result, 900, 0.7));
    reader.readAsDataURL(f);
  }

  async function ajouterEntree() {
    if (!noteEntree.trim() || !selection) return;
    setBusyEntree(true);
    const photoUrl = photoEntree ? await uploadPhotoGeneric(photoEntree, "enquetes") : null;
    await supabase.from("enquete_entrees").insert({ enquete_id: selection.id, auteur: email, contenu: noteEntree.trim(), photo_url: photoUrl });
    setNoteEntree(""); setPhotoEntree(null);
    setBusyEntree(false);
    ouvrirGestion(selection);
  }

  async function enregistrerResultat() {
    if (!selection) return;
    await supabase.from("enquetes").update({ resultat_public: resultatPublic.trim() || null }).eq("id", selection.id);
  }

  async function cloturer() {
    if (!selection) return;
    if (!confirm("Clôturer cette enquête ? Le résultat public (si renseigné) devient visible par tous, et plus personne ne pourra y répondre.")) return;
    await supabase.from("enquetes").update({ statut: "fermee", resultat_public: resultatPublic.trim() || null, cloturee_at: new Date().toISOString() }).eq("id", selection.id);
    charger();
    setSelection(null); setDetail(null);
  }
  async function reouvrir() {
    if (!selection) return;
    await supabase.from("enquetes").update({ statut: "ouverte", cloturee_at: null }).eq("id", selection.id);
    charger();
    ouvrirGestion({ ...selection, statut: "ouverte" });
  }
  // Suppression définitive (tout type, tout statut) — réservée à l'auteur du compte organisation
  // ici (voir la policy RLS "suppression enquetes") ; efface aussi questions, participations et
  // réponses (cascade en base), et détache un dossier d'enquête éventuellement lié sans le supprimer.
  async function supprimerEnquete() {
    if (!selection) return;
    if (!confirm(`Supprimer définitivement l'enquête « ${selection.titre} » ? Cette action est irréversible : ses questions, participations et réponses seront aussi effacées.`)) return;
    setErreur("");
    const { error } = await supabase.from("enquetes").delete().eq("id", selection.id);
    if (error) { setErreur("Suppression impossible : " + error.message); return; }
    charger();
    setSelection(null); setDetail(null);
  }

  const champ = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };
  const typeLabel = { questionnaire: "Questionnaire", investigation: "Investigation", mixte: "Questionnaire + investigation" };

  // --- Vue gestion d'une enquête ---
  if (selection && detail) {
    return (
      <div>
        <button onClick={() => { setSelection(null); setDetail(null); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Enquêtes</button>
        <SectionTitle sub={typeLabel[selection.type]}>{selection.titre}</SectionTitle>
        <div style={{ fontSize: 11.5, color: selection.statut === "ouverte" ? "var(--c-accent-dark)" : "var(--c-text-muted)", marginBottom: 14 }}>
          {selection.statut === "ouverte" ? "● En cours" : "● Clôturée"}
        </div>

        {selection.mode_collecte === "terrain" && selection.statut === "ouverte" && (
          <div style={{ background: "var(--c-surface-soft)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Partager ce formulaire</div>
            <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>
              Envoie une notification à tes {benevolesOrg.length} bénévole{benevolesOrg.length > 1 ? "s" : ""} affilié{benevolesOrg.length > 1 ? "s" : ""} pour qu'ils commencent à réaliser des interviews sur le terrain.
            </div>
            <button onClick={() => partagerAuxBenevoles(selection)} disabled={busyPartage} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: busyPartage ? 0.7 : 1 }}>
              {busyPartage ? "Envoi…" : "Partager aux bénévoles affiliés"}
            </button>
            {partageMsg && <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 6 }}>{partageMsg}</div>}
          </div>
        )}

        {selection.type !== "questionnaire" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Journal d'investigation ({detail.entrees.length})</div>
            <input ref={fileRefEntree} type="file" accept="image/*" onChange={choisirPhotoEntree} style={{ display: "none" }} />
            <textarea value={noteEntree} onChange={e => setNoteEntree(e.target.value)} rows={2} placeholder="Ajouter une note, une preuve, une avancée…" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" onClick={() => fileRefEntree.current && fileRefEntree.current.click()} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: photoEntree ? "var(--c-surface-soft)" : "none", fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <IconCamera size={13} /> {photoEntree ? "Photo jointe" : "Ajouter une photo"}
              </button>
              <button onClick={ajouterEntree} disabled={busyEntree || !noteEntree.trim()} style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer", opacity: busyEntree ? 0.7 : 1 }}>
                {busyEntree ? "…" : "Ajouter au journal"}
              </button>
            </div>
            {detail.entrees.map(en => (
              <div key={en.id} style={{ borderTop: "1px solid var(--c-border)", padding: "8px 0", fontSize: 12 }}>
                <div style={{ color: "var(--c-text-secondary)" }}>{en.contenu}</div>
                {en.photo_url && <img src={en.photo_url} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 6 }} />}
                <div style={{ fontSize: 10, color: "var(--c-text-muted)", marginTop: 3 }}>{en.auteur} · {new Date(en.created_at).toLocaleString("fr-FR")}</div>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Résultat public (visible à la clôture)</div>
              <textarea value={resultatPublic} onChange={e => setResultatPublic(e.target.value)} rows={2} placeholder="Conclusion communicable à tous…" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={enregistrerResultat} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" }}>Enregistrer le brouillon</button>
                {selection.statut === "ouverte"
                  ? <button onClick={cloturer} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Clôturer</button>
                  : <button onClick={reouvrir} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Rouvrir</button>}
              </div>
              <button onClick={supprimerEnquete} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 8, border: "1px solid #B5451B", background: "none", color: "#B5451B", fontWeight: 600, fontSize: 11.5, cursor: "pointer" }}>Supprimer définitivement cette enquête</button>
            </div>
          </div>
        )}

        {selection.type !== "investigation" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
            {selection.mode_collecte === "terrain" && detail.participations.length > 0 && (
              <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--c-border)" }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 6, color: "var(--c-text-secondary)" }}>Par bénévole</div>
                {Object.entries(detail.participations.reduce((acc, p) => {
                  const nomBenevole = (benevolesOrg.find(b => b.device_id === p.benevole_device_id) || {}).nom || "Bénévole non identifié";
                  acc[nomBenevole] = (acc[nomBenevole] || 0) + 1;
                  return acc;
                }, {})).map(([nom, n]) => (
                  <div key={nom} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--c-text-secondary)", padding: "2px 0" }}>
                    <span>{nom}</span><span>{n} interview{n > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Réponses ({detail.participations.length} participation{detail.participations.length > 1 ? "s" : ""})</div>
            {detail.questions.map(q => {
              const s = statsQuestion(q);
              return (
                <div key={q.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>{q.texte}</div>
                  {q.type_reponse === "texte" ? (
                    s.texte.length === 0 ? <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune réponse.</div> :
                    s.texte.slice(0, 20).map((t, i) => <div key={i} style={{ fontSize: 11.5, color: "var(--c-text-secondary)", padding: "3px 0", borderTop: i > 0 ? "1px solid var(--c-border)" : "none" }}>« {t} »</div>)
                  ) : Object.keys(s.comptage).length === 0 ? <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune réponse.</div> : (
                    Object.entries(s.comptage).map(([opt, n]) => (
                      <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 11, width: 90, flexShrink: 0, color: "var(--c-text-secondary)" }}>{opt}</div>
                        <div style={{ flex: 1, height: 8, background: "var(--c-surface-soft)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${(n / s.total) * 100}%`, height: "100%", background: "var(--c-accent-dark)" }} />
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", width: 20 }}>{n}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- Vue liste ---
  return (
    <div>
      <SectionTitle sub="Vos questionnaires citoyens et dossiers d'investigation, créés et gérés par votre organisation — visibles uniquement par vous.">Enquêtes de votre organisation</SectionTitle>

      <EnquetesStandard email={email} organisationId={organisationId} source="organisation" />
      {!showCreer ? (
        <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", margin: "14px 0" }}>
          <IconPlus size={16} /> Créer une enquête
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", margin: "14px 0" }}>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l'enquête" style={champ} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description (optionnel)" style={{ ...champ, fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={categorie} onChange={e => setCategorie(e.target.value)} placeholder="Catégorie liée (optionnel, ex : pollution_eau)" style={champ} />
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["questionnaire", "Questionnaire"], ["investigation", "Investigation"], ["mixte", "Les deux"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setType(v)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${type === v ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: type === v ? "var(--c-accent-dark)" : "none", color: type === v ? "#fff" : "var(--c-text)", fontSize: 11, cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          {type !== "investigation" && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Qui remplit le formulaire ?</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <button type="button" onClick={() => setModeCollecte("terrain")} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${modeCollecte === "terrain" ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: modeCollecte === "terrain" ? "var(--c-accent-dark)" : "none", color: modeCollecte === "terrain" ? "#fff" : "var(--c-text)", fontSize: 11, cursor: "pointer" }}>Vos bénévoles, sur le terrain</button>
                <button type="button" onClick={() => setModeCollecte("citoyen")} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${modeCollecte === "citoyen" ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: modeCollecte === "citoyen" ? "var(--c-accent-dark)" : "none", color: modeCollecte === "citoyen" ? "#fff" : "var(--c-text)", fontSize: 11, cursor: "pointer" }}>Les citoyens eux-mêmes</button>
              </div>
              <div style={{ fontSize: 11, color: "var(--c-text-muted)", lineHeight: 1.5 }}>
                {modeCollecte === "terrain"
                  ? "Vos bénévoles affiliés remplissent ce formulaire en interrogeant des citoyens sur le terrain — une fois par personne interrogée. Invisible dans le module Enquêtes public."
                  : "Le formulaire apparaît dans le module Enquêtes public ; chaque citoyen y répond lui-même une seule fois depuis son appareil."}
              </div>
            </div>
          )}

          {type !== "investigation" && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Questions ({draftQuestions.length})</div>
              {draftQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, padding: "4px 0" }}>
                  <span>{q.texte} <em style={{ color: "var(--c-text-muted)" }}>({q.type_reponse}{q.type_reponse === "texte" && q.options && q.options[0] ? ` — suggestion : « ${q.options[0]} »` : ""}{q.conditionIndex != null && draftQuestions[q.conditionIndex] ? ` · si « ${draftQuestions[q.conditionIndex].texte} » = ${q.conditionValeur}` : ""}{q.groupe ? ` · groupe « ${q.groupe} »` : ""}{q.validation ? (q.validation.kind === "nombre" ? ` · nombre ${q.validation.min ?? "…"}–${q.validation.max ?? "…"}` : ` · ${q.validation.min_len ?? 0}–${q.validation.max_len ?? "…"} car.`) : ""})</em></span>
                  <button type="button" onClick={() => retirerQuestionDraft(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)" }}><IconX size={13} /></button>
                </div>
              ))}
              <BibliothequeQuestions organisationId={organisationId} email={email} isAdmin={false} draftQuestions={draftQuestions} onAjouter={q => setDraftQuestions(prev => [...prev, q])} />
              <input value={qTexte} onChange={e => setQTexte(e.target.value)} placeholder="Texte de la question" style={{ ...champ, marginTop: 6 }} />
              <select value={qType} onChange={e => setQType(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                <option value="texte">Réponse libre</option>
                <option value="oui_non">Oui / Non</option>
                <option value="echelle">Échelle 1 à 5</option>
                <option value="choix_unique">Choix unique</option>
                <option value="choix_multiple">Choix multiple</option>
              </select>
              {(qType === "choix_unique" || qType === "choix_multiple") && (
                <input value={qOptions} onChange={e => setQOptions(e.target.value)} placeholder="Options séparées par des virgules" style={champ} />
              )}
              {qType === "texte" && (
                <div style={{ marginBottom: 8 }}>
                  <input value={qReponseSuggeree} onChange={e => setQReponseSuggeree(e.target.value)} placeholder="Réponse suggérée (optionnel)" style={{ ...champ, marginBottom: 4 }} />
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Si tu connais la réponse la plus probable, écris-la ici : le bénévole la verra déjà remplie pendant l'interview et n'aura qu'à la corriger si besoin — l'enquête va plus vite et les réponses sont plus précises.</div>
                </div>
              )}
              {qType === "texte" && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qFormat} onChange={e => { setQFormat(e.target.value); setQMin(""); setQMax(""); }} style={{ ...champ, marginBottom: 6, background: "var(--c-surface)" }}>
                    <option value="texte">Format : texte libre</option>
                    <option value="nombre">Format : nombre</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" value={qMin} onChange={e => setQMin(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur minimale" : "Longueur minimale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                    <input type="number" value={qMax} onChange={e => setQMax(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur maximale" : "Longueur maximale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>Optionnel : le bénévole ne pourra pas envoyer une réponse qui sort de ces limites.</div>
                </div>
              )}
              <input value={qGroupe} onChange={e => setQGroupe(e.target.value)} list="groupes-repetables-org" placeholder="Groupe répétable (optionnel, ex : Point de pollution)" style={champ} />
              <datalist id="groupes-repetables-org">{[...new Set(draftQuestions.map(q => q.groupe).filter(Boolean))].map(g => <option key={g} value={g} />)}</datalist>
              {qGroupe.trim() && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: -4, marginBottom: 8 }}>Cette question et les suivantes portant le même nom de groupe pourront être répétées plusieurs fois par le bénévole (ex. plusieurs sites touchés).</div>}
              {draftQuestions.some(q => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse)) && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qConditionIndex} onChange={e => { setQConditionIndex(e.target.value); setQConditionValeur(""); }} style={{ ...champ, marginBottom: qConditionIndex !== "" ? 6 : 8, background: "var(--c-surface)" }}>
                    <option value="">Toujours poser cette question</option>
                    {draftQuestions.map((q, i) => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse) ? <option key={i} value={i}>Poser seulement si « {q.texte} » =…</option> : null)}
                  </select>
                  {qConditionIndex !== "" && (
                    <select value={qConditionValeur} onChange={e => setQConditionValeur(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                      <option value="">Choisir la valeur déclenchante…</option>
                      {optionsQuestion(draftQuestions[Number(qConditionIndex)]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              )}
              <button type="button" onClick={ajouterQuestionDraft} style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px dashed var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" }}>+ Ajouter cette question</button>
            </div>
          )}

          {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
          <button onClick={creerEnquete} disabled={busy} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
            {busy ? "…" : "Créer l'enquête"}
          </button>
          <button onClick={() => setShowCreer(false)} style={{ width: "100%", padding: "6px 0", background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", marginTop: 4 }}>Annuler</button>
        </div>
      )}

      {liste === null ? (
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Chargement…</div>
      ) : liste.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Aucune enquête créée pour le moment.</div>
      ) : (
        <div className="pace-grid-cards">
          {liste.map(e => (
            <button key={e.id} onClick={() => ouvrirGestion(e)} style={{
              textAlign: "left", background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{e.titre}</div>
              <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{typeLabel[e.type]} · {e.statut === "ouverte" ? "en cours" : "clôturée"}</div>
              {e.mode_collecte === "terrain" && (
                <div style={{ fontSize: 10, color: "var(--c-accent-dark)", marginTop: 3, fontWeight: 600 }}>Rempli par vos bénévoles</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSuppressions({ isSuperAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailLibre, setEmailLibre] = useState("");
  const [busyLibre, setBusyLibre] = useState(false);
  const [msgLibre, setMsgLibre] = useState(null); // { ok: bool, texte } | null

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("demandes_suppression").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // Supprime réellement le compte auth (et tout ce qui en dépend, en cascade) via la fonction
  // admin_supprimer_compte_par_email, restreinte aux super-admins côté base. Renvoie true/false
  // pour que l'appelant sache si la suite (ex. marquer une demande traitée) doit continuer.
  async function supprimerCompteParEmail(email) {
    const { error } = await supabase.rpc("admin_supprimer_compte_par_email", { p_email: email });
    if (error) { setMsgLibre({ ok: false, texte: error.message || "Suppression impossible." }); return false; }
    return true;
  }

  async function libererAdresse(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = emailLibre.trim();
    if (!email) return;
    if (!confirm(`Supprimer définitivement le compte associé à ${email} ? Cette action est irréversible.`)) return;
    setMsgLibre(null);
    setBusyLibre(true);
    const ok = await supprimerCompteParEmail(email);
    setBusyLibre(false);
    if (ok) { setMsgLibre({ ok: true, texte: `Compte supprimé. L'adresse ${email} est de nouveau libre.` }); setEmailLibre(""); load(); }
  }

  async function marquerTraitee(d) {
    if (isSuperAdmin && d.email) {
      if (!confirm(`Supprimer définitivement le compte de ${d.email}, puis marquer cette demande comme traitée ?`)) return;
      const ok = await supprimerCompteParEmail(d.email);
      if (!ok) return; // le message d'erreur est déjà affiché par supprimerCompteParEmail
    } else {
      if (!confirm("Confirmer que le compte et les données associées ont bien été supprimés manuellement (dashboard Supabase) avant de marquer cette demande comme traitée ?")) return;
    }
    await supabase.from("demandes_suppression").update({ statut: "traitee", traitee_at: new Date().toISOString() }).eq("id", d.id);
    load();
  }

  const enAttente = items.filter(i => i.statut !== "traitee");
  const traitees = items.filter(i => i.statut === "traitee");

  if (loading) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isSuperAdmin ? (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>Libérer une adresse e-mail</div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Supprime directement le compte associé (profil, organisation ou admin) pour permettre une nouvelle inscription avec cette même adresse. Action immédiate et irréversible.
          </div>
          <form onSubmit={libererAdresse} style={{ display: "flex", gap: 8 }}>
            <input type="email" required value={emailLibre} onChange={e => setEmailLibre(e.target.value)} placeholder="adresse@exemple.com"
              style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box" }} />
            <button type="submit" disabled={busyLibre || !emailLibre.trim()} style={{ background: "var(--c-accent-dark)", border: "none", color: "#fff", fontSize: 12.5, fontWeight: 600, borderRadius: 10, padding: "0 14px", cursor: "pointer", opacity: busyLibre ? 0.7 : 1, whiteSpace: "nowrap" }}>
              {busyLibre ? "…" : "Supprimer"}
            </button>
          </form>
          {msgLibre && (
            <div className="pace-fade-in" style={{ fontSize: 12, marginTop: 8, color: msgLibre.ok ? "var(--c-accent-dark)" : "#B5451B" }}>{msgLibre.texte}</div>
          )}
        </div>
      ) : (
        <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 12, padding: 12, fontSize: 12, color: "var(--c-warning-text)", lineHeight: 1.5 }}>
          La suppression directe d'un compte est réservée au super-admin. Pour chaque demande ci-dessous, un super-admin doit la traiter (ou passer par le dashboard Supabase). Délai légal engagé : 30 jours maximum depuis la demande.
        </div>
      )}

      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>En attente ({enAttente.length})</div>
        {enAttente.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 12 }}>Aucune demande en attente.</div>}
        <div className="pace-grid-cards">
          {enAttente.map(d => (
            <div key={d.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.email || `Appareil ${(d.device_id || "").slice(0, 8)}`}</div>
                {d.motif && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)" }}>{d.motif}</div>}
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 2 }}>Demandé le {new Date(d.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
              <button onClick={() => marquerTraitee(d)} style={{ background: "var(--c-accent-dark)", border: "none", color: "#fff", fontSize: 11.5, fontWeight: 600, borderRadius: 8, padding: "7px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>
                {isSuperAdmin && d.email ? "Supprimer et marquer traitée" : "Marquer traitée"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {traitees.length > 0 && (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Traitées ({traitees.length})</div>
          <div className="pace-grid-cards">
            {traitees.map(d => (
              <div key={d.id} style={{ background: "var(--c-surface-soft)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", opacity: 0.7 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.email || `Appareil ${(d.device_id || "").slice(0, 8)}`}</div>
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 2 }}>Traitée le {new Date(d.traitee_at).toLocaleDateString("fr-FR")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminBenevoles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("en_attente");

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("benevoles").select("*").eq("is_deleted", false).order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(b) {
    if (!confirm(`Mettre "${b.nom}" à la corbeille ? Il sera restaurable depuis Historique.`)) return;
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    const { error } = await supabase.from("benevoles").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: email }).eq("id", b.id);
    if (error) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    logActivity("soft_delete", "benevoles", b.id, b.nom);
    load();
  }

  async function setStatut(b, statut, action) {
    const { error } = await supabase.from("benevoles").update({ statut }).eq("id", b.id);
    if (error) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    logActivity(action, "benevoles", b.id, b.nom);
    load();
  }

  const STATUT_LABELS = { en_attente: "En attente", valide: "Validé", suspendu: "Suspendu", rejete: "Rejeté" };
  const STATUT_COLORS = { en_attente: "var(--c-warning)", valide: "var(--c-accent)", suspendu: "#B5451B", rejete: "var(--c-text-muted)" };

  if (loading) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;

  const filtered = filtre === "tous" ? items : items.filter(b => (b.statut || "valide") === filtre);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>
        Un bénévole n'a accès au contenu d'EcoVigil qu'après validation ici.
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
        {[["en_attente", "En attente"], ["valide", "Validés"], ["suspendu", "Suspendus"], ["rejete", "Rejetés"], ["tous", "Tous"]].map(([id, label]) => (
          <button key={id} onClick={() => setFiltre(id)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            border: filtre === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: filtre === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: filtre === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>{filtered.length} bénévole{filtered.length > 1 ? "s" : ""}</div>
      {filtered.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 12 }}>Aucune inscription dans cette catégorie.</div>}
      <div className="pace-grid-cards">
      {filtered.map(b => {
        const statut = b.statut || "valide";
        return (
          <div key={b.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.nom}</div>
                <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)" }}>{b.contact}</div>
                <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)" }}>{[b.ville, b.pays, b.zone].filter(Boolean).join(" · ")}</div>
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 2 }}>Inscrit le {new Date(b.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: STATUT_COLORS[statut], border: `1px solid ${STATUT_COLORS[statut]}`, borderRadius: 20, padding: "3px 8px" }}>{STATUT_LABELS[statut]}</span>
                <button onClick={() => remove(b)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}><IconTrash size={16} /></button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {statut !== "valide" && (
                <button onClick={() => setStatut(b, "valide", "validation")} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Valider</button>
              )}
              {statut === "valide" && (
                <button onClick={() => setStatut(b, "suspendu", "suspension")} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Suspendre</button>
              )}
              {statut !== "rejete" && (
                <button onClick={() => setStatut(b, "rejete", "rejet")} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Rejeter</button>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function weeksAgo(dateStr, n) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  return Math.floor(diffDays / 7) === n;
}

function weeklyBuckets(items, weeks = 8) {
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    buckets.push({ week: i, count: items.filter(x => x.created_at && weeksAgo(x.created_at, i)).length });
  }
  return buckets;
}

function MiniBarChart({ data, color, label }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "100%", background: color, borderRadius: 3, height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.week === 0 ? 1 : 0.65 }} title={`${d.count}`} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8.5, color: "var(--c-text-muted)" }}>{d.week === 0 ? "cette sem." : `-${d.week}`}</div>
        ))}
      </div>
    </div>
  );
}

function RepartitionParDefi({ signalements }) {
  const [, setV] = useState(0);
  useEffect(() => { chargerTaxonomiePubliee().then(() => setV(x => x + 1)); }, []);
  if (Object.keys(ENV_DEFI_PAR_CODE).length === 0) return null; // taxonomie pas encore publiée : rien à ventiler
  const counts = {};
  (signalements || []).forEach(s => {
    const defi = ENV_DEFI_PAR_CODE[s.categorie] || "Non classé";
    counts[defi] = (counts[defi] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Répartition par défi environnemental</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(([nom, count]) => (
          <div key={nom}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 3 }}>
              <span>{nom}</span><span>{count}</span>
            </div>
            <div style={{ height: 6, background: "var(--c-surface-soft)", borderRadius: 999 }}>
              <div style={{ height: 6, width: `${(count / max) * 100}%`, background: "var(--c-accent-dark)", borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportRow({ label, count, getRows, columns, filenamePrefix, title }) {
  const [busy, setBusy] = useState(null);
  const formats = [
    { id: "csv", label: "CSV" },
    { id: "xlsx", label: "Excel" },
    { id: "doc", label: "Word" },
    { id: "pdf", label: "PDF" },
  ];
  async function lancer(format) {
    setBusy(format);
    try {
      const rows = await getRows();
      const base = `${filenamePrefix}-${Date.now()}`;
      if (format === "csv") downloadCSV(`${base}.csv`, toCSV(rows, columns));
      else if (format === "xlsx") exportExcel(`${base}.xlsx`, rows, columns, title);
      else if (format === "doc") exportWord(`${base}.doc`, title, rows, columns);
      else if (format === "pdf") exportPDF(`${base}.pdf`, title, rows, columns);
    } catch (e) {
      alert("Échec de l'export : " + (e && e.message ? e.message : "erreur inconnue"));
    } finally { setBusy(null); }
  }
  return (
    <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{label} ({count})</div>
      <div style={{ display: "flex", gap: 6 }}>
        {formats.map(f => (
          <button key={f.id} onClick={() => lancer(f.id)} disabled={busy !== null} style={{
            flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--c-border)",
            background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 11,
            cursor: busy !== null ? "default" : "pointer", opacity: busy && busy !== f.id ? 0.5 : 1 }}>
            {busy === f.id ? "…" : f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Permet au Centre d'EcoVigil de consulter, pour n'importe quelle organisation, le même rapport
// exportable (signalements de son domaine) que celle-ci voit dans son propre Espace Organisation —
// même logique de filtrage par défis/codesDomaine que EspaceOrganisation.charger(), dupliquée ici
// car calculée localement à partir de l'organisation choisie plutôt que de la session connectée.
function AdminRapportOrganisation() {
  const [organisations, setOrganisations] = useState(null);
  const [orgId, setOrgId] = useState("");
  const [chargement, setChargement] = useState(false);
  const [rapport, setRapport] = useState(null); // { org, rows }

  useEffect(() => {
    supabase.from("organisations").select("id, nom, type, defis, statut").eq("is_deleted", false).order("nom", { ascending: true })
      .then(({ data }) => setOrganisations(data || []));
  }, []);

  async function chargerRapport(id) {
    setOrgId(id);
    setRapport(null);
    if (!id || !organisations) return;
    const orgData = organisations.find(o => o.id === id);
    if (!orgData) return;
    setChargement(true);
    const { data: problemes } = await supabase.from("env_problemes").select("code, defi_id");
    const codesDomaine = (problemes || []).filter(p => (orgData.defis || []).includes(p.defi_id)).map(p => p.code);
    let sigs = [];
    if (codesDomaine.length > 0) {
      let requete = supabase.from("signalements").select("*").in("categorie", codesDomaine).eq("is_deleted", false).order("created_at", { ascending: false }).limit(300);
      if (orgData.type !== "gouvernement") {
        const { data: mesB } = await supabase.from("benevoles").select("id").eq("organisation_id", orgData.id).eq("is_deleted", false);
        const ids = (mesB || []).map(b => b.id);
        requete = ids.length > 0 ? requete.in("benevole_id", ids) : null;
      }
      if (requete) { const { data } = await requete; sigs = data || []; }
    }
    setRapport({ org: orgData, rows: sigs });
    setChargement(false);
  }

  const colonnes = [
    { key: "id", label: "ID" }, { key: "categorie", label: "Catégorie" }, { key: "urgence", label: "Urgence" },
    { key: "statut", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" }, { key: "date", label: "Date" },
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" },
    { key: "benevole_quartier", label: "Bénévole — Quartier" },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Rapports par organisation</div>
      <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>
        Même rapport (signalements de son domaine) que celui que l'organisation exporte depuis son propre espace.
      </div>
      <select value={orgId} onChange={e => chargerRapport(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, background: "var(--c-surface)" }}>
        <option value="">Sélectionner une organisation…</option>
        {(organisations || []).map(o => (
          <option key={o.id} value={o.id}>{o.nom} ({o.type === "gouvernement" ? "Gouvernement" : "ONG"}{o.statut !== "valide" ? " — non validée" : ""})</option>
        ))}
      </select>
      {chargement && <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 10 }}>Chargement…</div>}
      {rapport && (
        <ExportRow
          label={`Signalements du domaine de ${rapport.org.nom}`}
          count={rapport.rows.length}
          columns={colonnes}
          filenamePrefix={`pace-${rapport.org.type}-${(rapport.org.nom || "org").replace(/\s+/g, "-")}`}
          title={`Rapport ${rapport.org.nom}`}
          getRows={() => rapport.rows.map(s => ({ ...s, date: new Date(s.created_at).toLocaleDateString("fr-FR") }))}
        />
      )}
    </div>
  );
}

function AdminRapports({ signalements, arbres, isSuperAdmin, centreVerrouille, onToggleCentre }) {
  const [benevolesCount, setBenevolesCount] = useState(null);

  useEffect(() => {
    supabase.from("benevoles").select("id", { count: "exact", head: true }).eq("is_deleted", false).then(({ count }) => setBenevolesCount(count));
  }, []);

  const colonnesSignalements = [
    { key: "id", label: "ID" }, { key: "categorie", label: "Catégorie" }, { key: "defi", label: "Défi" }, { key: "urgence", label: "Urgence" }, { key: "priorite", label: "Priorité" },
    { key: "statut", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" },
    { key: "date", label: "Date" }, { key: "device_id", label: "Appareil" },
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" },
    { key: "benevole_quartier", label: "Bénévole — Quartier" },
  ];
  const colonnesArbres = [
    { key: "id", label: "ID" }, { key: "nom", label: "Espèce" }, { key: "lat", label: "Latitude" },
    { key: "lng", label: "Longitude" }, { key: "date", label: "Date de plantation" }, { key: "device_id", label: "Appareil" },
  ];
  const colonnesBenevoles = [
    { key: "nom", label: "Nom" }, { key: "contact", label: "Contact" }, { key: "zone", label: "Zone" },
    { key: "statut", label: "Statut" }, { key: "created_at", label: "Date d'inscription" },
  ];

  const resolus = signalements.filter(s => s.statut === "resolu").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <StatCard label="Signalements" value={signalements.length} unit="" accent="#B5451B" />
        <StatCard label="Résolus" value={resolus} unit="" accent="var(--c-accent)" />
        <StatCard label="Arbres plantés" value={arbres.length} unit="" accent="var(--c-accent)" />
        <StatCard label="Bénévoles" value={benevolesCount === null ? "…" : benevolesCount} unit="" accent="var(--c-accent-dark)" />
      </div>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Évolution (8 dernières semaines)</div>
      <MiniBarChart data={weeklyBuckets(signalements)} color="#B5451B" label="Signalements" />
      <MiniBarChart data={weeklyBuckets(arbres)} color="var(--c-accent)" label="Arbres plantés" />

      <RepartitionParDefi signalements={signalements} />

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Exporter le rapport</div>
      <ExportRow label="Signalements" count={signalements.length} columns={colonnesSignalements} filenamePrefix="pace-signalements" title="Rapport EcoVigil — Signalements"
        getRows={() => signalements.map(s => ({ ...s, defi: ENV_DEFI_PAR_CODE[s.categorie] || "Non classé", priorite: calculerPriorite(s, signalements) }))} />
      <ExportRow label="Arbres plantés" count={arbres.length} columns={colonnesArbres} filenamePrefix="pace-arbres" title="Rapport EcoVigil — Arbres plantés"
        getRows={() => arbres} />
      <ExportRow label="Bénévoles" count={benevolesCount === null ? 0 : benevolesCount} columns={colonnesBenevoles} filenamePrefix="pace-benevoles" title="Rapport EcoVigil — Bénévoles"
        getRows={async () => { const { data } = await supabase.from("benevoles").select("*").eq("is_deleted", false).order("created_at", { ascending: false }); return data || []; }} />

      <AdminRapportOrganisation />

      <AdminEquipe isSuperAdmin={isSuperAdmin} centreVerrouille={centreVerrouille} onToggleCentre={onToggleCentre} />
    </div>
  );
}

function AdminEquipe({ isSuperAdmin, centreVerrouille, onToggleCentre }) {
  const [admins, setAdmins] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("admins").select("email, added_at, role").order("added_at", { ascending: true });
    setAdmins(data || []);
  }
  useEffect(() => { load(); }, []);

  async function addAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setMsg("");
    const emailNormalise = email.trim().toLowerCase();
    const { error } = await supabase.from("admins").insert({ email: emailNormalise });
    setBusy(false);
    if (error) { setMsg("Échec — vérifie l'adresse ou tes droits."); return; }
    // Action la plus sensible de l'application (octroi de droits admin) : elle doit être tracée.
    logAudit("ajout_admin", "admins", emailNormalise, null, { role: "admin" });
    setMsg(`${email} peut maintenant créer un compte admin avec cette adresse.`);
    setEmail("");
    load();
  }

  async function retirerAdmin(a) {
    if (!confirm(`Retirer les droits admin de ${a.email} ? Cette action est immédiate.`)) return;
    const { data, error } = await supabase.from("admins").delete().eq("email", a.email);
    if (error) { setMsg("Échec du retrait — vérifie tes droits (réservé au super-admin)."); return; }
    // Le RLS bloque silencieusement (0 ligne supprimée, pas d'erreur) le retrait du dernier
    // admin restant, pour éviter un verrouillage total du Centre d'EcoVigil.
    if (!data || data.length === 0) { setMsg("Impossible de retirer ce compte : c'est le dernier administrateur restant."); return; }
    logAudit("retrait_admin", "admins", a.email, null, { role: a.role });
    setMsg(`${a.email} a été retiré de l'équipe administrateurs.`);
    load();
  }

  return (
    <div style={{ marginTop: 24 }}>
      {isSuperAdmin && (
        <div style={{
          background: centreVerrouille && centreVerrouille.verrouille ? "var(--c-danger-border-soft)" : "var(--c-surface)",
          border: `1px solid ${centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-border)"}`,
          borderRadius: 14, padding: 14, marginBottom: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <IconLock size={15} color={centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-text-muted)"} />
            <div style={{ fontWeight: 700, fontSize: 13, color: centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-text)" }}>
              Centre {centreVerrouille && centreVerrouille.verrouille ? "verrouillé" : "déverrouillé"}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            {centreVerrouille && centreVerrouille.verrouille
              ? `Seul toi (super-admin) as accès au Centre d'EcoVigil. Les autres admins voient un écran d'accès suspendu.${centreVerrouille.motif ? ` Motif : ${centreVerrouille.motif}` : ""}`
              : "En cas de compte admin compromis ou pour une maintenance, tu peux suspendre l'accès de tous les autres admins. Toi seul gardes l'accès."}
          </div>
          <button onClick={async () => {
            if (centreVerrouille && centreVerrouille.verrouille) {
              if (!confirm("Déverrouiller le Centre d'EcoVigil pour tous les admins ?")) return;
              await onToggleCentre();
            } else {
              const motif = prompt("Motif du verrouillage (optionnel, visible par les admins bloqués) :") || "";
              if (!confirm("Verrouiller le Centre d'EcoVigil pour tous les admins sauf toi ?")) return;
              await onToggleCentre(motif);
            }
          }} style={{
            padding: "9px 14px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
            background: centreVerrouille && centreVerrouille.verrouille ? "var(--c-accent-dark)" : "#B5451B", color: "#fff"
          }}>
            {centreVerrouille && centreVerrouille.verrouille ? "Déverrouiller" : "Verrouiller le Centre d'EcoVigil"}
          </button>
        </div>
      )}
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Équipe administrateurs</div>
      <form onSubmit={addAdmin} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com"
          style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box" }} />
        <button type="button" onClick={addAdmin} disabled={busy} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {busy ? "..." : "Ajouter"}
        </button>
      </form>
      {msg && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>{msg}</div>}
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>La personne devra créer son compte via "Centre d'EcoVigil → Créer un compte" avec cette adresse exacte.</div>
      {admins === null ? <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {admins.map(a => (
            <div key={a.email} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "var(--c-text)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, flexShrink: 0, background: a.role === "super_admin" ? "var(--c-accent-dark)" : "var(--c-surface-soft)", color: a.role === "super_admin" ? "#fff" : "var(--c-text-muted)" }}>
                  {a.role === "super_admin" ? "Super admin" : "Admin"}
                </span>
              </div>
              {isSuperAdmin && a.role !== "super_admin" && (
                <button onClick={() => retirerAdmin(a)} style={{ flexShrink: 0, fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Retirer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmActionModal({ title, description, reasonLabel, confirmLabel, confirmColor, danger, showDuration, motifOptions, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [motif, setMotif] = useState(motifOptions ? motifOptions[0].id : "");
  const [duration, setDuration] = useState("7");
  const [customDate, setCustomDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1); // double confirmation : 1 = formulaire, 2 = confirmation finale

  const reasonOk = reason.trim().length >= 5;

  function computeJusqua() {
    if (!showDuration) return null;
    if (duration === "indetermine") return null;
    if (duration === "custom") return customDate ? new Date(customDate).toISOString() : null;
    const days = parseInt(duration, 10);
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  async function handleFinalConfirm() {
    setBusy(true);
    await onConfirm({ reason: reason.trim(), motif: motifOptions ? motif : null, jusqua: computeJusqua() });
    setBusy(false);
  }

  return (
    <div role="dialog" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 26000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <button aria-label="Fermer" onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--c-surface)", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "88vh", overflowY: "auto" }}>
        {step === 1 ? (
          <>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: danger ? "#B5451B" : "var(--c-accent-dark)", marginBottom: 6 }}>{title}</div>
            {description && <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>{description}</div>}

            {motifOptions && (
              <>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Motif</div>
                <select value={motif} onChange={e => setMotif(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}>
                  {motifOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </>
            )}

            {showDuration && (
              <>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Durée</div>
                <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="custom">Date précise…</option>
                  <option value="indetermine">Indéterminée</option>
                </select>
                {duration === "custom" && (
                  <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />
                )}
              </>
            )}

            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>{reasonLabel || "Motif de l'action (obligatoire)"}</div>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explique la raison de cette action…"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" }} />
            {!reasonOk && reason.length > 0 && <div style={{ fontSize: 11, color: "#B5451B", marginBottom: 8 }}>Précise un peu plus (5 caractères minimum).</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13, color: "var(--c-text)" }}>Annuler</button>
              <button type="button" disabled={!reasonOk} onClick={() => setStep(2)} style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none", cursor: reasonOk ? "pointer" : "default",
                background: !reasonOk ? "var(--c-text-faint)" : (confirmColor || "var(--c-accent-dark)"), color: "#fff", fontWeight: 600, fontSize: 13 }}>
                Continuer
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "#B5451B", marginBottom: 10 }}>Confirmer définitivement ?</div>
            <div style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.6, marginBottom: 4 }}>
              {confirmLabel || "Cette action"} — motif : « {reason.trim()} »
            </div>
            <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginBottom: 16 }}>Cette action sera enregistrée dans le journal d'audit avec ton identité et l'horodatage.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13, color: "var(--c-text)" }}>Retour</button>
              <button type="button" disabled={busy} onClick={handleFinalConfirm} style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {busy ? "..." : "Confirmer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


const ACTION_LABELS = {
  decision: "a ajouté une mise à jour terrain",
  resolution: "a marqué résolu",
  reouverture: "a remis en attente",
  validation: "a validé",
  suppression: "a supprimé",
  suspension: "a suspendu",
  rejet: "a rejeté",
  soft_delete: "a mis à la corbeille",
  restauration: "a restauré",
  suppression_definitive: "a supprimé définitivement",
};

// Statistiques agrégées des connexions par zone géographique (ville/région/pays), résolues côté
// client à partir de l'IP à chaque ouverture de l'app (voir capturerConnexionParZone) et journalisées
// dans activity_log comme n'importe quelle autre action — pas de nouvelle table, pas de position
// individuelle affichée : uniquement des décomptes agrégés par zone, sur la période choisie.
function AdminConnexions() {
  const [logs, setLogs] = useState(null);
  const [jours, setJours] = useState(30);

  async function charger() {
    setLogs(null);
    const depuis = new Date(Date.now() - jours * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("activity_log").select("detail, created_at")
      .eq("action", "connexion").gte("created_at", depuis).order("created_at", { ascending: false }).limit(5000);
    setLogs(data || []);
  }
  useEffect(() => { charger(); }, [jours]);

  const parZone = useMemo(() => {
    if (!logs) return [];
    const compte = new Map();
    for (const l of logs) {
      let zone = "Zone inconnue";
      try {
        const d = JSON.parse(l.detail);
        zone = [d.ville, d.region, d.pays].filter(Boolean).join(", ") || zone;
      } catch (e) { /* ancienne entrée non-JSON ou service indisponible à l'époque : ignorée du détail */ }
      compte.set(zone, (compte.get(zone) || 0) + 1);
    }
    return Array.from(compte.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const total = parZone.reduce((s, [, n]) => s + n, 0);
  const max = parZone.length ? parZone[0][1] : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)" }}>Connexions par zone géographique</div>
        <select value={jours} onChange={e => setJours(Number(e.target.value))} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12, background: "var(--c-bg)", color: "var(--c-text)" }}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
        Position approximative (ville/région/pays) résolue à partir de l'adresse IP à chaque ouverture de l'app, agrégée par zone — jamais de position individuelle précise, jamais de suivi nominatif d'un utilisateur.
      </div>
      {logs === null ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : parZone.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13 }}>Aucune connexion enregistrée sur cette période.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 2 }}>{total} connexion{total > 1 ? "s" : ""} sur la période, {parZone.length} zone{parZone.length > 1 ? "s" : ""}</div>
          {parZone.map(([zone, n]) => (
            <div key={zone}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{zone}</span><span style={{ fontWeight: 600 }}>{n}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--c-border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${max ? (n / max) * 100 : 0}%`, background: "var(--c-accent-dark)", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Détection d'abus (spam, doublons) sans jamais identifier qui que ce soit : s'appuie
// uniquement sur des données déjà présentes sur chaque signalement (device_id pseudonyme,
// coordonnées, catégorie, date) — jamais sur la connexion, l'IP ou une identité réelle. Deux
// signaux : un appareil qui envoie beaucoup de signalements en peu de temps, et des grappes de
// signalements quasi-identiques (même catégorie, à moins de 25 m, à moins de 48 h d'écart).
function AdminAbusSignalements({ signalements }) {
  const analyse = useMemo(() => {
    const liste = (signalements || []).filter(s => !s._pending && s.id);
    const dateDe = s => new Date(s.created_at || s.date).getTime();

    const parAppareil = new Map();
    liste.forEach(s => {
      const id = s.device_id || "inconnu";
      if (!parAppareil.has(id)) parAppareil.set(id, []);
      parAppareil.get(id).push(s);
    });
    const maintenant = Date.now();
    const appareilsSuspects = Array.from(parAppareil.entries())
      .map(([id, items]) => {
        const recents24h = items.filter(s => maintenant - dateDe(s) < 86400000).length;
        const recents7j = items.filter(s => maintenant - dateDe(s) < 604800000).length;
        return { id, total: items.length, recents24h, recents7j, items };
      })
      .filter(a => a.recents24h >= 5 || a.recents7j >= 15)
      .sort((a, b) => b.recents24h - a.recents24h || b.recents7j - a.recents7j);

    const parCategorie = new Map();
    liste.forEach(s => {
      if (s.lat == null || s.lng == null) return;
      if (!parCategorie.has(s.categorie)) parCategorie.set(s.categorie, []);
      parCategorie.get(s.categorie).push(s);
    });
    const dejaGroupe = new Set();
    const grappes = [];
    parCategorie.forEach(items => {
      for (let i = 0; i < items.length; i++) {
        if (dejaGroupe.has(items[i].id)) continue;
        const groupe = [items[i]];
        for (let j = i + 1; j < items.length; j++) {
          if (dejaGroupe.has(items[j].id)) continue;
          const dist = distanceMetres(items[i].lat, items[i].lng, items[j].lat, items[j].lng);
          const ecartH = Math.abs(dateDe(items[i]) - dateDe(items[j])) / 3600000;
          if (dist < 25 && ecartH < 48) groupe.push(items[j]);
        }
        if (groupe.length > 1) { groupe.forEach(g => dejaGroupe.add(g.id)); grappes.push(groupe); }
      }
    });
    grappes.sort((a, b) => b.length - a.length);

    return { appareilsSuspects, grappes };
  }, [signalements]);

  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
        Détection basée uniquement sur des identifiants d'appareil pseudonymes et les coordonnées/catégorie/date déjà présentes sur chaque signalement — jamais sur une identité réelle ni sur la connexion.
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Appareils à volume inhabituel ({analyse.appareilsSuspects.length})</div>
      {analyse.appareilsSuspects.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 12.5, marginBottom: 18 }}>Aucun appareil au-dessus des seuils (5 signalements/24h ou 15/7j).</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          {analyse.appareilsSuspects.map(a => (
            <div key={a.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
              Appareil {a.id.slice(0, 8)}… — {a.recents24h} en 24h, {a.recents7j} en 7j ({a.total} au total)
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Grappes de doublons potentiels ({analyse.grappes.length})</div>
      {analyse.grappes.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 12.5 }}>Aucune grappe détectée (même catégorie, &lt;25 m, &lt;48h).</div>
      ) : (
        <div className="pace-grid-cards" style={{ gap: 10 }}>
          {analyse.grappes.map((g, i) => (
            <div key={i} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{categorieMeta(g[0].categorie).label} — {g.length} signalements groupés</div>
              {g.map(s => (
                <div key={s.id} style={{ fontSize: 11, color: "var(--c-text-secondary)" }}>
                  {s.date || new Date(s.created_at).toLocaleString("fr-FR")} — appareil {(s.device_id || "inconnu").slice(0, 8)}…
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminHistorique({ isSuperAdmin, onRestaurerItem }) {
  const [logs, setLogs] = useState(null);
  const [corbeille, setCorbeille] = useState(null);
  const [vue, setVue] = useState("journal"); // journal | corbeille

  async function loadLogs() {
    const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
    setLogs(data || []);
  }
  async function loadCorbeille() {
    const [{ data: s }, { data: a }, { data: b }, { data: o }] = await Promise.all([
      supabase.from("signalements").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("arbres").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("benevoles").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("organisations").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
    ]);
    setCorbeille({ signalements: s || [], arbres: a || [], benevoles: b || [], organisations: o || [] });
  }
  useEffect(() => { loadLogs(); loadCorbeille(); }, []);

  function nomDe(table, item) {
    if (table === "signalements") { return categorieMeta(item.categorie).label; }
    if (table === "arbres") return item.nom || "Arbre";
    if (table === "benevoles") return item.nom;
    if (table === "organisations") return `${item.nom} (${item.type === "ong" ? "ONG" : "Gouvernement"})`;
    return "élément";
  }

  async function restaurer(table, item) {
    const nom = nomDe(table, item);
    const { data, error } = await supabase.from(table).update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", item.id).select();
    if (error || !data || data.length === 0) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    logActivity("restauration", table, item.id, nom);
    if (onRestaurerItem) onRestaurerItem(table, data[0]);
    loadCorbeille(); loadLogs();
  }

  async function supprimerDefinitivement(table, item) {
    const nom = nomDe(table, item);
    if (!confirm(`Supprimer définitivement "${nom}" ? Cette action est irréversible.`)) return;
    if (!confirm("Confirme une seconde fois : il n'y a aucun moyen de revenir en arrière après ça.")) return;
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) { alert("Échec de la suppression : " + error.message); return; }
    logActivity("suppression_definitive", table, item.id, nom);
    loadCorbeille(); loadLogs();
  }

  const totalCorbeille = corbeille ? corbeille.signalements.length + corbeille.arbres.length + corbeille.benevoles.length + corbeille.organisations.length : 0;

  function CorbeilleSection({ titre, table, items }) {
    if (items.length === 0) return null;
    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 6px" }}>{titre} ({items.length})</div>
        <div className="pace-grid-cards">
          {items.map(item => (
            <div key={item.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--c-text)" }}>{nomDe(table, item)}</div>
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>Supprimé par {item.deleted_by || "?"} le {new Date(item.deleted_at).toLocaleDateString("fr-FR")}</div>
              {table === "signalements" && !isSuperAdmin ? (
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 8, fontStyle: "italic" }}>Restauration et suppression définitive réservées au super-admin.</div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => restaurer(table, item)} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Restaurer</button>
                  <button onClick={() => supprimerDefinitivement(table, item)} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Supprimer définitivement</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        {[["journal", "Journal"], ["corbeille", `Éléments supprimés${corbeille ? ` (${totalCorbeille})` : ""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setVue(id)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            border: vue === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: vue === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: vue === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
        ))}
      </div>

      {vue === "journal" && (
        logs === null ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>Les 100 dernières actions de l'équipe.</div>
          {logs.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucune action enregistrée pour l'instant.</div>}
          {logs.map(l => (
            <div key={l.id} style={{ background: "var(--c-surface)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--c-border)", fontSize: 12.5 }}>
              <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{l.acteur}</span>{" "}
              <span style={{ color: "var(--c-text-secondary)" }}>{ACTION_LABELS[l.action] || l.action}</span>{" "}
              <span style={{ color: "var(--c-text-secondary)" }}>{l.cible_table}</span>
              {l.detail && <span style={{ color: "var(--c-text-muted)" }}> — {l.detail}</span>}
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>
                {new Date(l.created_at).toLocaleDateString("fr-FR")} à {new Date(l.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {vue === "corbeille" && (
        corbeille === null ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> :
        totalCorbeille === 0 ? <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Corbeille vide.</div> :
        <div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>
            Les éléments supprimés restent ici jusqu'à restauration ou suppression définitive.
          </div>
          <CorbeilleSection titre="Signalements" table="signalements" items={corbeille.signalements} />
          <CorbeilleSection titre="Arbres" table="arbres" items={corbeille.arbres} />
          <CorbeilleSection titre="Bénévoles" table="benevoles" items={corbeille.benevoles} />
          <CorbeilleSection titre="Organisations" table="organisations" items={corbeille.organisations} />
        </div>
      )}
    </div>
  );
}

// --- Détection d'activité suspecte (heuristiques côté client sur les journaux existants) ---
// Ce n'est PAS une détection d'intrusion réseau : ni les IP, ni les tentatives de connexion
// échouées, ni le trafic ne sont visibles depuis le frontend. C'est un repérage de patterns
// anormaux dans les actions déjà journalisées (activity_log, audit_logs) pour aider un admin
// à repérer un compte compromis ou un usage abusif des droits admin. Son efficacité dépend
// entièrement des policies RLS de ces deux tables : elles doivent rester illisibles pour
// tout compte non-admin, sans quoi un attaquant pourrait aussi consulter ce panneau.
const ACTIONS_DESTRUCTRICES = /suppression|rejet|suspension|soft_delete/i;
const FENETRE_RAFALE_MS = 5 * 60 * 1000;
const SEUIL_RAFALE = 8;
const FENETRE_SUPPRESSIONS_MS = 10 * 60 * 1000;
const SEUIL_SUPPRESSIONS = 3;
const HEURE_DEBUT_INHABITUELLE = 0;
const HEURE_FIN_INHABITUELLE = 5;

function detecterActiviteSuspecte(evenements) {
  const alertes = [];
  if (!evenements || evenements.length === 0) return alertes;

  const parActeur = {};
  evenements.forEach(e => {
    const acteur = e.acteur || "inconnu";
    (parActeur[acteur] = parActeur[acteur] || []).push(e);
  });

  Object.entries(parActeur).forEach(([acteur, evts]) => {
    const tries = [...evts].filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 1) Rafale d'actions tous types confondus (compte détourné automatisant des actions)
    for (const ref of tries) {
      const fenetre = tries.filter(e => Math.abs(new Date(e.date) - new Date(ref.date)) < FENETRE_RAFALE_MS);
      if (fenetre.length >= SEUIL_RAFALE) {
        alertes.push({ niveau: "warning", acteur, date: ref.date, cle: `rafale-${acteur}`,
          titre: `${fenetre.length} actions en moins de 5 minutes` });
        break;
      }
    }

    // 2) Rafale de suppressions / rejets / suspensions (le geste le plus destructeur)
    const destructrices = tries.filter(e => ACTIONS_DESTRUCTRICES.test(e.action || ""));
    for (const ref of destructrices) {
      const fenetre = destructrices.filter(e => Math.abs(new Date(e.date) - new Date(ref.date)) < FENETRE_SUPPRESSIONS_MS);
      if (fenetre.length >= SEUIL_SUPPRESSIONS) {
        alertes.push({ niveau: "critical", acteur, date: ref.date, cle: `suppr-${acteur}`,
          titre: `${fenetre.length} suppressions/rejets/suspensions en moins de 10 minutes` });
        break;
      }
    }

    // 3) Activité hors horaires habituels (approximatif : heure locale de qui consulte ce panneau)
    tries.forEach(e => {
      const h = new Date(e.date).getHours();
      if (h >= HEURE_DEBUT_INHABITUELLE && h < HEURE_FIN_INHABITUELLE) {
        alertes.push({ niveau: "info", acteur, date: e.date, cle: `horaire-${acteur}-${e.date}-${e.action}`,
          titre: `Action à ${h}h : ${ACTION_LABELS[e.action] || e.action}${e.table ? " (" + e.table + ")" : ""}` });
      }
    });

    // 4) Premier geste connu de ce compte = action destructrice (signal fort de compte compromis)
    if (tries.length && ACTIONS_DESTRUCTRICES.test(tries[0].action || "")) {
      alertes.push({ niveau: "warning", acteur, date: tries[0].date, cle: `premier-${acteur}`,
        titre: "Première action connue de ce compte : suppression/rejet/suspension" });
    }
  });

  return alertes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function AdminMfaPanel({ session }) {
  const facteurs = (session && session.user && session.user.factors) || [];
  const facteurVerifie = facteurs.find(f => f.factor_type === "totp" && f.status === "verified");
  const [enrolement, setEnrolement] = useState(null); // { id, totp: { qr_code, secret, uri } }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);

  async function demarrerEnrolement() {
    setErreur(""); setMessage(""); setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
    setBusy(false);
    if (error) { setErreur(error.message); return; }
    setEnrolement(data);
  }

  async function confirmerEnrolement(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!enrolement) return;
    setErreur(""); setBusy(true);
    const { data: chal, error: errChal } = await supabase.auth.mfa.challenge({ factorId: enrolement.id });
    if (errChal) { setBusy(false); setErreur(errChal.message); return; }
    const { error: errVerif } = await supabase.auth.mfa.verify({ factorId: enrolement.id, challengeId: chal.id, code: code.trim() });
    setBusy(false);
    if (errVerif) { setErreur("Code incorrect. Vérifie l'heure de ton appareil et réessaie."); return; }
    setEnrolement(null); setCode("");
    setMessage("Double authentification activée. Elle sera demandée à chaque connexion.");
  }

  async function annulerEnrolement() {
    if (!enrolement) return;
    await supabase.auth.mfa.unenroll({ factorId: enrolement.id });
    setEnrolement(null); setCode(""); setErreur("");
  }

  async function supprimerFacteur() {
    if (!facteurVerifie) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: facteurVerifie.id });
    setBusy(false);
    setConfirmSuppr(false);
    if (error) { setErreur(error.message); return; }
    setMessage("Double authentification désactivée pour ce compte.");
  }

  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconLock size={16} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-accent-dark)" }}>Double authentification (2FA)</div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
        Ajoute une couche de sécurité supplémentaire : en plus du mot de passe, un code à 6 chiffres généré
        par une application d'authentification (Google Authenticator, Authy, 1Password…) sera demandé à
        chaque connexion.
      </div>

      {message && <div style={{ fontSize: 12, color: "var(--c-accent)", marginBottom: 10 }}>{message}</div>}
      {erreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{erreur}</div>}

      {facteurVerifie && !enrolement ? (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#fff", background: "var(--c-accent)", borderRadius: 999, padding: "4px 10px", marginBottom: 10 }}>
            <IconCheck size={12} /> Activée
          </div>
          {!confirmSuppr ? (
            <button onClick={() => setConfirmSuppr(true)} style={{ display: "block", padding: "8px 14px", borderRadius: 10, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              Désactiver la double authentification
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 8 }}>Confirme la désactivation : ton compte ne sera plus protégé que par le mot de passe.</div>
              <button onClick={supprimerFacteur} disabled={busy} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", marginRight: 8 }}>
                {busy ? "…" : "Confirmer la désactivation"}
              </button>
              <button onClick={() => setConfirmSuppr(false)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          )}
        </>
      ) : !enrolement ? (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--c-text-muted)", background: "var(--c-surface-soft)", borderRadius: 999, padding: "4px 10px", marginBottom: 10 }}>
          Non activée
        </div>
      ) : null}

      {!facteurVerifie && !enrolement && (
        <button onClick={demarrerEnrolement} disabled={busy} style={{ display: "block", padding: "9px 14px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {busy ? "…" : "Activer la double authentification"}
        </button>
      )}

      {enrolement && (
        <form onSubmit={confirmerEnrolement}>
          <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10 }}>
            1. Scanne ce QR code avec ton application d'authentification (ou saisis la clé manuellement).<br />
            2. Entre ensuite le code à 6 chiffres qu'elle affiche pour confirmer.
          </div>
          {enrolement.totp && enrolement.totp.qr_code && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 10, marginBottom: 10, display: "flex", justifyContent: "center" }}
              dangerouslySetInnerHTML={{ __html: enrolement.totp.qr_code }} />
          )}
          {enrolement.totp && enrolement.totp.secret && (
            <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10, wordBreak: "break-all" }}>
              Clé manuelle : <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{enrolement.totp.secret}</span>
            </div>
          )}
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code à 6 chiffres" aria-label="Code de confirmation"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 16, letterSpacing: 3, textAlign: "center", marginBottom: 10, boxSizing: "border-box" }} />
          <button type="submit" disabled={busy || code.length !== 6} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: code.length !== 6 ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
            cursor: code.length !== 6 ? "default" : "pointer", marginRight: 8 }}>
            {busy ? "…" : "Confirmer"}
          </button>
          <button type="button" onClick={annulerEnrolement} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}

function AdminSecurite({ session }) {
  const [evenements, setEvenements] = useState(null);
  const [erreur, setErreur] = useState(null);

  async function charger() {
    setErreur(null);
    const [{ data: acts, error: e1 }, { data: audits, error: e2 }] = await Promise.all([
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (e1 && e2) {
      setErreur("Impossible de charger les journaux (droits admin requis ou connexion indisponible).");
      setEvenements([]);
      return;
    }
    const fromActs = (acts || []).map(l => ({ acteur: l.acteur, action: l.action, table: l.cible_table, date: l.created_at }));
    const fromAudits = (audits || []).map(l => ({ acteur: l.admin_id, action: l.action_type, table: l.target_entity, date: l.created_at }));
    setEvenements([...fromActs, ...fromAudits]);
  }

  useEffect(() => { charger(); }, []);

  const alertes = useMemo(() => detecterActiviteSuspecte(evenements || []), [evenements]);
  const critiques = alertes.filter(a => a.niveau === "critical");
  const avertissements = alertes.filter(a => a.niveau === "warning");
  const infos = alertes.filter(a => a.niveau === "info");

  const COULEURS = {
    critical: { bg: "var(--c-danger-border-soft)", border: "#B5451B", text: "#B5451B" },
    warning: { bg: "var(--c-warning-bg)", border: "var(--c-warning-border-soft)", text: "var(--c-warning-text)" },
    info: { bg: "var(--c-surface-soft)", border: "var(--c-border)", text: "var(--c-text-secondary)" },
  };

  function AlerteCard({ a }) {
    const c = COULEURS[a.niveau];
    return (
      <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: c.text }}>{a.titre}</div>
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>
          {a.acteur} — {new Date(a.date).toLocaleDateString("fr-FR")} à {new Date(a.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AdminMfaPanel session={session} />

      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 4 }}>
        Repérage de patterns anormaux dans les 300 dernières actions journalisées : rafales d'actions,
        suppressions groupées, activité hors horaires, compte au comportement destructeur dès sa
        première action. Ceci ne remplace pas une détection d'intrusion réseau : les IP et les
        tentatives de connexion échouées ne sont pas visibles depuis l'application.
      </div>

      <button onClick={charger} style={{ alignSelf: "flex-start", fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Actualiser</button>

      {erreur && <div style={{ color: "#B5451B", fontSize: 12.5 }}>{erreur}</div>}

      {evenements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : alertes.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucune activité suspecte détectée.</div>
      ) : (
        <>
          {critiques.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#B5451B", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>Critique ({critiques.length})</div>
              <div className="pace-grid-cards">{critiques.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
          {avertissements.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-warning-text)", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>À surveiller ({avertissements.length})</div>
              <div className="pace-grid-cards">{avertissements.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
          {infos.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>Information ({infos.length})</div>
              <div className="pace-grid-cards">{infos.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ENV_STATUTS = [
  { id: "brouillon", label: "Brouillon", color: "var(--c-text-muted)" },
  { id: "en_validation", label: "En validation", color: "#E3A73B" },
  { id: "valide", label: "Validé", color: "#4A8B6F" },
  { id: "publie", label: "Publié", color: "var(--c-accent-dark)" },
  { id: "desactive", label: "Désactivé", color: "#B5451B" },
  { id: "archive", label: "Archivé", color: "var(--c-text-faint)" },
];
function statutInfo(id) { return ENV_STATUTS.find(s => s.id === id) || ENV_STATUTS[0]; }

function AdminContenuEnv({ isSuperAdmin, adminEmail }) {
  const [defis, setDefis] = useState(null);
  const [problemes, setProblemes] = useState([]);
  const [busyId, setBusyId] = useState(null);

  async function charger() {
    const [{ data: d }, { data: p }] = await Promise.all([
      supabase.from("env_defis").select("*").order("ordre", { ascending: true }),
      supabase.from("env_problemes").select("*").order("ordre", { ascending: true }),
    ]);
    setDefis(d || []);
    setProblemes(p || []);
  }
  useEffect(() => { charger(); }, []);

  async function changerStatut(table, item, nouveauStatut, motif) {
    setBusyId(item.id);
    const payload = { statut: nouveauStatut };
    if (nouveauStatut === "publie" || nouveauStatut === "valide") {
      payload.valide_par = adminEmail; payload.valide_le = new Date().toISOString(); payload.motif_refus = null;
    }
    if (nouveauStatut === "brouillon" && motif) payload.motif_refus = motif;
    const { error } = await supabase.from(table).update(payload).eq("id", item.id);
    setBusyId(null);
    if (error) { alert("Action refusée par le serveur (réservée au super-admin, ou statut de départ non autorisé)."); return; }
    logAudit(`contenu_env_${nouveauStatut}`, table, item.code, motif || null, { ancien_statut: item.statut, nouveau_statut: nouveauStatut });
    charger();
  }

  function LigneStatut({ table, item }) {
    const s = statutInfo(item.statut);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.color, color: "#fff" }}>{s.label}</span>
          {item.valide_par && <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>par {item.valide_par}</span>}
        </div>
        {item.motif_refus && <div style={{ fontSize: 10.5, color: "#B5451B" }}>Motif : {item.motif_refus}</div>}
        {isSuperAdmin && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
            {(item.statut === "brouillon" || item.statut === "en_validation") && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "publie")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Valider et publier</button>
                <button disabled={busyId === item.id} onClick={() => { const m = prompt("Motif du refus (visible dans l'historique) :") || ""; changerStatut(table, item, "brouillon", m); }} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Refuser</button>
              </>
            )}
            {item.statut === "publie" && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "desactive")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Désactiver</button>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "archive")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Archiver</button>
              </>
            )}
            {item.statut === "desactive" && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "publie")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Republier</button>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "archive")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Archiver</button>
              </>
            )}
            {item.statut === "archive" && (
              <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "brouillon")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Restaurer en brouillon</button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (defis === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Taxonomie des défis environnementaux et des problèmes rattachés au formulaire Signaler.
        Seul le contenu au statut <b>Publié</b> est visible par les citoyens.
        {!isSuperAdmin && " Les actions de validation sont réservées au super-admin."}
      </div>
      <div className="pace-grid-cards">
      {defis.map(d => (
        <div key={d.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-accent-dark)" }}>{(d.nom && d.nom.fr) || d.code}</div>
          <LigneStatut table="env_defis" item={d} />
          <div style={{ marginTop: 10, paddingLeft: 10, borderLeft: "2px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 10 }}>
            {problemes.filter(p => p.defi_id === d.id).map(p => (
              <div key={p.id}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-text)" }}>{(p.nom && p.nom.fr) || p.code}</div>
                <LigneStatut table="env_problemes" item={p} />
              </div>
            ))}
            {problemes.filter(p => p.defi_id === d.id).length === 0 && (
              <div style={{ fontSize: 11, color: "var(--c-text-faint)", fontStyle: "italic" }}>Aucun problème rattaché.</div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

const ORG_ADMIN_STATUTS = {
  en_attente: { label: "En attente", color: "#E3A73B" },
  valide: { label: "Validée", color: "var(--c-accent-dark)" },
  suspendu: { label: "Suspendue", color: "#B5451B" },
  bloque: { label: "Bloquée", color: "#7A1F1F" },
  rejete: { label: "Refusée", color: "var(--c-text-muted)" },
};

function AdminOrganisations({ isSuperAdmin, adminEmail }) {
  const [organisations, setOrganisations] = useState(null);
  const [defisIndex, setDefisIndex] = useState({});
  const [busyId, setBusyId] = useState(null);

  async function charger() {
    const [{ data: orgs }, { data: defis }] = await Promise.all([
      supabase.from("organisations").select("*").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("env_defis").select("id, nom"),
    ]);
    const idx = {};
    (defis || []).forEach(d => { idx[d.id] = champTexte(d.nom) || d.id; });
    setDefisIndex(idx);
    setOrganisations(orgs || []);
  }
  useEffect(() => { charger(); }, []);

  async function changerStatut(org, nouveauStatut, motif) {
    setBusyId(org.id);
    const payload = { statut: nouveauStatut };
    if (nouveauStatut === "valide") {
      payload.valide_par = adminEmail; payload.valide_le = new Date().toISOString(); payload.motif_refus = null;
      payload.etape_dossier = "valide"; payload.etape_dossier_motif = null;
      payload.etape_dossier_maj_le = new Date().toISOString(); payload.etape_dossier_maj_par = adminEmail;
    }
    if (nouveauStatut === "rejete") {
      payload.etape_dossier = "refuse"; payload.etape_dossier_motif = motif || null;
      payload.etape_dossier_maj_le = new Date().toISOString(); payload.etape_dossier_maj_par = adminEmail;
    }
    if (nouveauStatut === "rejete" || nouveauStatut === "suspendu" || nouveauStatut === "bloque") payload.motif_refus = motif || null;
    const { error } = await supabase.from("organisations").update(payload).eq("id", org.id);
    setBusyId(null);
    if (error) { alert("Action refusée par le serveur (réservée au super-admin)."); return; }
    logAudit(`organisation_${nouveauStatut}`, "organisations", org.email, motif || null, { nom: org.nom });
    charger();
  }

  const ETAPES_INTERMEDIAIRES = ["en_attente_verification", "en_cours_verification", "informations_a_completer", "document_non_conforme", "agrement_invalide", "agrement_expire"];
  const ETAPES_AVEC_MOTIF = ["informations_a_completer", "document_non_conforme", "agrement_invalide", "agrement_expire"];

  async function changerEtapeDossier(org, nouvelleEtape) {
    let motif = null;
    if (ETAPES_AVEC_MOTIF.includes(nouvelleEtape)) {
      motif = prompt(`Précise ce qui manque ou ce qui ne va pas (« ${ETAPE_DOSSIER_INFO[nouvelleEtape].label} ») :`);
      if (!motif) return;
    }
    setBusyId(org.id);
    const { error } = await supabase.from("organisations").update({
      etape_dossier: nouvelleEtape, etape_dossier_motif: motif,
      etape_dossier_maj_le: new Date().toISOString(), etape_dossier_maj_par: adminEmail,
    }).eq("id", org.id);
    setBusyId(null);
    if (error) { alert("Impossible de mettre à jour l'étape du dossier."); return; }
    logAudit("organisation_etape_dossier", "organisations", org.email, motif || null, { nom: org.nom, etape: nouvelleEtape });
    logVerifHistorique(org.id, "etape_dossier_modifiee", adminEmail, `${(ETAPE_DOSSIER_INFO[nouvelleEtape] || {}).label || nouvelleEtape}${motif ? " — " + motif : ""}`);
    charger();
  }

  async function supprimerOrg(org) {
    if (!confirm(`Supprimer le compte organisation "${org.nom}" ? Il sera envoyé dans la corbeille (Historique > Corbeille) et restera restaurable.`)) return;
    setBusyId(org.id);
    const { error } = await supabase.from("organisations").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: adminEmail }).eq("id", org.id);
    setBusyId(null);
    if (error) { alert("Action refusée par le serveur (réservée au super-admin)."); return; }
    logAudit("organisation_suppression", "organisations", org.email, null, { nom: org.nom });
    charger();
  }

  if (organisations === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Comptes ONG et Gouvernement. Une organisation validée peut modérer les signalements de son ou ses domaine(s) et publier des actualités officielles.
        {!isSuperAdmin && " Les actions de validation sont réservées au super-admin."}
      </div>
      {organisations.length === 0 && <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 20 }}>Aucune organisation inscrite.</div>}
      {organisations.map(o => {
        const s = ORG_ADMIN_STATUTS[o.statut] || { label: o.statut, color: "var(--c-text-muted)" };
        return (
          <div key={o.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>{o.nom}</div>
                <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{o.type === "ong" ? "ONG" : "Gouvernement"} · {o.email}</div>
                {(o.ville || o.pays) && <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{[o.ville, o.pays].filter(Boolean).join(", ")}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.color, color: "#fff" }}>{s.label}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: (ETAPE_DOSSIER_INFO[o.etape_dossier] || {}).couleur || "var(--c-text-muted)", color: "#fff" }}>
                  {(ETAPE_DOSSIER_INFO[o.etape_dossier] || {}).label || o.etape_dossier}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 8 }}>
              <b>Domaine(s) :</b> {(o.defis || []).map(id => defisIndex[id] || id).join(", ") || "aucun"}
            </div>
            {o.numero_agrement && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>N° agrément / acte légal : {o.numero_agrement}{o.date_expiration_agrement ? ` (expire le ${new Date(o.date_expiration_agrement).toLocaleDateString("fr-FR")})` : ""}</div>}
            {o.representant_nom && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Représentant légal : {o.representant_nom}{o.representant_fonction ? ` — ${o.representant_fonction}` : ""}</div>}
            {(o.adresse_officielle || o.telephone_officiel || o.email_professionnel) && (
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>{[o.adresse_officielle, o.telephone_officiel, o.email_professionnel].filter(Boolean).join(" · ")}</div>
            )}
            {o.etape_dossier_motif && <div style={{ fontSize: 10.5, color: "#B5451B", marginTop: 2 }}>Motif de l'étape : {o.etape_dossier_motif}</div>}
            {o.motif_refus && <div style={{ fontSize: 10.5, color: "#B5451B", marginTop: 4 }}>Motif du compte : {o.motif_refus}</div>}

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {ETAPES_INTERMEDIAIRES.filter(e => e !== o.etape_dossier).map(e => (
                <button key={e} disabled={busyId === o.id} onClick={() => changerEtapeDossier(o, e)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 7, border: `1px solid ${ETAPE_DOSSIER_INFO[e].couleur}`, background: "var(--c-surface)", color: ETAPE_DOSSIER_INFO[e].couleur, fontWeight: 600, cursor: "pointer" }}>
                  {ETAPE_DOSSIER_INFO[e].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "var(--c-text-muted)", marginTop: 6 }}>Documents et niveau de vérification détaillés : onglet « Vérification ».</div>
            {isSuperAdmin && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {o.statut !== "valide" && o.statut !== "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "valide")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Valider</button>
                )}
                {o.statut === "en_attente" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif du refus :") || ""; changerStatut(o, "rejete", m); }} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Refuser</button>
                )}
                {o.statut === "valide" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif de la suspension :") || ""; changerStatut(o, "suspendu", m); }} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Suspendre</button>
                )}
                {o.statut === "suspendu" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "en_attente")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Remettre en attente</button>
                )}
                {o.statut !== "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif du blocage (compte définitivement bloqué jusqu'à déblocage manuel) :") || ""; changerStatut(o, "bloque", m); }} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid #7A1F1F", background: "#2a1414", color: "#ff9b9b", fontWeight: 600, cursor: "pointer" }}>Bloquer</button>
                )}
                {o.statut === "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "en_attente")} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Débloquer</button>
                )}
                <button disabled={busyId === o.id} onClick={() => supprimerOrg(o)} style={{ fontSize: 10.5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>
                  <IconTrash size={12} style={{ verticalAlign: -1, marginRight: 3 }} /> Supprimer
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const ONBOARDING_SLIDES = [
  { icon: IconAlert, title: "Signale un problème", text: "Décharges, pollution, déforestation... prends une photo, ta position s'ajoute automatiquement." },
  { icon: IconMapPin, title: "Vois la carte communautaire", text: "Les signalements validés et les arbres plantés par tout le monde, en direct." },
  { icon: IconTree, title: "Plante et suis tes arbres", text: "Enregistre chaque arbre planté et suis sa croissance dans le temps." },
];

function ThemePanel({ themeMode, accent, lang, coordFormat, onSetMode, onSetAccent, onSetLang, onSetCoordFormat, orientation, onSetOrientation, onClose, section }) {
  const modes = [
    { id: "light", label: "Clair", icon: IconSun },
    { id: "dark", label: "Sombre", icon: IconMoon },
    { id: "system", label: "Auto", icon: IconMonitor },
  ];
  const accents = [
    { id: "green", label: "Vert", color: "#4CAF50" },
    { id: "blue", label: "Bleu", color: "#2E6E86" },
    { id: "gold", label: "Doré", color: "#8A6318" },
  ];
  const orientations = [
    { id: "auto", label: "Auto", w: 16, h: 16 },
    { id: "portrait", label: "Portrait", w: 12, h: 18 },
    { id: "paysage", label: "Paysage", w: 18, h: 12 },
  ];
  const langues = [
    { id: "fr", label: "Français" },
    { id: "en", label: "English" },
    { id: "pt", label: "Português" },
    { id: "es", label: "Español" },
    { id: "sw", label: "Kiswahili" },
    { id: "ar", label: "العربية" },
  ];
  return (
    <div role="dialog" aria-label="Réglages d'affichage" style={{ position: "fixed", inset: 0, zIndex: 25000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <button aria-label="Fermer les réglages" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--c-surface)", borderRadius: "20px 20px 0 0", padding: 20, boxShadow: "var(--shadow-md)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "var(--c-accent-dark)" }}>Affichage</div>
          <button onClick={onClose} aria-label="Fermer" style={{ background: "var(--c-surface-soft)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "var(--c-text-secondary)" }}>✕</button>
        </div>

  {section === "theme" && (<>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Thème</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {modes.map(m => {
            const MIcon = m.icon;
            const active = themeMode === m.id;
            return (
              <button key={m.id} onClick={() => onSetMode(m.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <MIcon size={18} color={active ? "var(--c-accent)" : "var(--c-text-muted)"} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
  </>)}

  {section === "accent" && (<>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Couleur d'accent</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {accents.map(a => {
            const active = accent === a.id;
            return (
              <button key={a.id} onClick={() => onSetAccent(a.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? `2px solid ${a.color}` : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: a.color, display: "block" }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)" }}>{a.label}</span>
              </button>
            );
          })}
        </div>
  </>)}

  {section === "langue" && (<>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Langue / Language</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {langues.map(l => {
            const active = lang === l.id;
            return (
              <button key={l.id} onClick={() => onSetLang(l.id)} aria-pressed={active} style={{
                padding: "12px 0", borderRadius: 12, fontSize: 12.5, fontWeight: 600,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", color: active ? "var(--c-accent)" : "var(--c-text-secondary)", cursor: "pointer" }}>
                {l.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
          La navigation principale et les titres changent de langue immédiatement. La traduction complète du contenu est en cours.
        </div>
  </>)}

  {section === "gps" && (<>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Format des coordonnées GPS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { id: "dd", label: "Degré décimal", exemple: "9.535000, -13.680000" },
            { id: "dms", label: "Deg/Min/Sec", exemple: "9°32'6.0\"N" },
            { id: "utm", label: "UTM", exemple: "28P 644879mE" },
          ].map(f => {
            const active = coordFormat === f.id;
            return (
              <button key={f.id} onClick={() => onSetCoordFormat(f.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{f.label}</span>
                <span style={{ fontSize: 9, color: "var(--c-text-faint)" }}>{f.exemple}</span>
              </button>
            );
          })}
        </div>
  </>)}

      {section === "orientation" && (<>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Orientation de l'affichage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {orientations.map(o => {
            const active = orientation === o.id;
            return (
              <button key={o.id} onClick={() => onSetOrientation(o.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ width: o.w, height: o.h, borderRadius: 3, boxSizing: "border-box", display: "block", border: `2px ${o.id === "auto" ? "dashed" : "solid"} ${active ? "var(--c-accent)" : "var(--c-text-muted)"}` }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </>)}
      </div>
    </div>
  );
}

/* Menu hamburger : ouvre, sans les dupliquer, les écrans et réglages existants (onglets, ThemePanel, notifications). */
function MenuHamburger({ items, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => { if (closeRef.current) closeRef.current.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="pace-drawer-root" style={{ zIndex: 12000 }}>
      <button aria-label="Fermer le menu" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "absolute", top: 0, bottom: 0, insetInlineEnd: 0, width: "min(320px, 86%)", overflowY: "auto", background: "var(--c-surface)", borderStartStartRadius: 20, borderEndStartRadius: 20, padding: "calc(16px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px))", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "var(--c-accent-dark)" }}>Menu</div>
          <button ref={closeRef} onClick={onClose} aria-label="Fermer" style={{ background: "var(--c-surface-soft)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "var(--c-text-secondary)" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => {
            const ItemIcon = item.icon;
            const off = item.locked || item.disabled;
            return (
              <button key={item.id} onClick={() => { onClose(); item.onSelect(); }} disabled={off} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "start", minHeight: 52, padding: "10px 14px",
                borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)",
                cursor: off ? "default" : "pointer", opacity: off ? 0.6 : 1 }}>
                <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8, display: "flex", flexShrink: 0 }}>
                  {item.locked ? <IconLock size={17} color="var(--c-text-muted)" /> : <ItemIcon size={17} color="var(--c-accent)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{item.label}</div>
                  {item.note && <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>{item.note}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SplashScreen({ lang }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 30000,
      background: "linear-gradient(160deg,#007A3D,#0077B6)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div className="pace-scale-in" style={{
        width: 96, height: 96, borderRadius: "50%", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)", overflow: "hidden", marginBottom: 18,
      }}>
        <img src={LOGO_DATA_URL} alt="Logo EcoVigil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div className="pace-fade-in" style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 24, color: "#fff", letterSpacing: 0.4 }}>
        EcoVigil
      </div>
      <div className="pace-fade-in" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, textAlign: "center", padding: "0 24px" }}>
        {t(lang, "devise_ecovigil")}
      </div>
    </div>
  );
}

function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const Icon = slide.icon;
  const last = step === ONBOARDING_SLIDES.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "linear-gradient(160deg,var(--c-accent-dark),var(--c-sky))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, color: "#fff", textAlign: "center" }}>
      <button onClick={onDone} aria-label="Fermer" style={{
        position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,0.18)", border: "none",
        borderRadius: "50%", width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 22, marginBottom: 22 }}>
        <Icon size={36} color="#fff" />
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 600, marginBottom: 10 }}>{slide.title}</div>
      <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.5, maxWidth: 280 }}>{slide.text}</div>

      <div style={{ display: "flex", gap: 6, marginTop: 28, marginBottom: 28 }}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <span key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 4, background: i === step ? "#fff" : "rgba(255,255,255,0.4)", transition: "all .3s" }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Précédent</button>
        )}
        <button onClick={() => last ? onDone() : setStep(step + 1)} style={{ flex: 2, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
          {last ? "Commencer" : "Suivant"}
        </button>
      </div>
      <button onClick={onDone} style={{ marginTop: 18, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "8px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Passer l'introduction</button>
      {last && (
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 16, maxWidth: 280 }}>
          En continuant, tu acceptes notre politique de confidentialité (consultable à tout moment depuis l'accueil → À propos & Informations légales).
        </div>
      )}
    </div>
  );
}

function CitoyenNouveauMotDePasse({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function valider() {
    if (newPassword.length < 8) return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword }, token);
    setBusy(false);
    if (error) { setError(error.message || "Erreur lors du changement de mot de passe."); return; }
    onDone();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--c-bg)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 360, width: "100%", background: "var(--c-surface)", borderRadius: 16, padding: 20, border: "1px solid var(--c-border)" }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>Nouveau mot de passe</div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 14 }}>Choisis un nouveau mot de passe pour ton compte.</div>
        <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (8 caractères min.)"
          style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10 }} />
        {error && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
        <button onClick={valider} disabled={busy || newPassword.length < 8} style={{
          width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
          background: newPassword.length < 8 ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5,
          cursor: newPassword.length < 8 ? "default" : "pointer" }}>
          {busy ? "…" : "Valider"}
        </button>
      </div>
    </div>
  );
}

function App() {
  // Deep-linking depuis la page d'accueil publique (pace-accueil.html) ou tout lien externe :
  // ?tab=carte|signaler|arbre  → ouvre directement l'onglet correspondant
  // ?admin=1                         → ouvre le Centre d'EcoVigil
  // Lecture unique au montage, ne modifie aucun comportement existant si absent de l'URL.
  const initialUrlState = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      const validTabs = ["accueil", "carte", "signaler", "arbre"];
      let initialTab = "accueil";
      if (t && validTabs.includes(t)) initialTab = t;
      return { initialTab, initialAdmin: params.get("admin") === "1" };
    } catch (e) {
      return { initialTab: "accueil", initialAdmin: false };
    }
  }, []);

  const [tab, setTab] = useState(initialUrlState.initialTab);
  const [showAdmin, setShowAdmin] = useState(initialUrlState.initialAdmin);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("pace-onboarded"); } catch (e) { return false; }
  });
  const [showSplash, setShowSplash] = useState(true);
  const [citoyenSession, setCitoyenSession] = useState(undefined); // undefined = en cours de vérification, null = pas connecté
  useEffect(() => {
    // Lit et écoute directement le store citoyen (currentSession/authListeners), plutôt que via
    // supabase.auth.getSession()/onAuthStateChange() qui suivent l'identité active du moment
    // (activeIdentity). Ce watcher tourne toujours, même quand on arrive directement sur
    // ?admin=1 (où activeIdentity démarre sur "admin") : il doit rester en permanence isolé du
    // Centre d'EcoVigil pour qu'un compte admin connecté ne "prenne" jamais la place du profil
    // citoyen, ni l'inverse.
    setCitoyenSession(currentSession || null);
    const cb = (_e, s) => setCitoyenSession(s);
    authListeners.push(cb);
    return () => { authListeners = authListeners.filter((f) => f !== cb); };
  }, []);
  // Statistiques d'usage par zone géographique pour le Centre d'EcoVigil : une seule fois par
  // ouverture de l'app, pour tout utilisateur (citoyen anonyme ou compte admin/organisation).
  useEffect(() => { capturerConnexionParZone(); }, []);

  // Charge une fois la taxonomie publiée (défis/problèmes) dans le cache global partagé par
  // categorieLabel/categorieMeta, puis force un re-render pour que tout l'affichage déjà monté
  // (accueil, carte, historique admin...) se mette à jour avec les nouveaux libellés/icônes.
  const [, forceTaxoRefresh] = useState(0);
  useEffect(() => { chargerTaxonomiePubliee().then(() => forceTaxoRefresh(v => v + 1)); }, []);

  // Traite le lien reçu par e-mail (confirmation d'inscription bénévole, magic link, ou
  // récupération de mot de passe) quand un citoyen clique dessus et arrive sur l'app côté
  // public — jusqu'ici ce hash n'était traité que dans le panneau Admin, donc un bénévole
  // qui confirmait son compte n'obtenait jamais de session côté citoyen malgré la validation
  // admin de son inscription.
  const [citoyenRecoveryToken, setCitoyenRecoveryToken] = useState(null);
  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/user`, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
        const user = await res.json().catch(() => null);
        persistSession({ access_token: token, refresh_token: refreshToken, user });
        if (type === "recovery") setCitoyenRecoveryToken(token);
        window.location.hash = "";
      } catch (e) {}
    })();
  }, []);

  // Statut bénévole de cet appareil : null tant qu'aucune inscription n'existe (accès libre en tant que citoyen).
  // Un enregistrement existant bloque l'accès au contenu tant qu'il n'est pas "valide" (voir Centre d'EcoVigil > Bénévoles).
  // Sans compte email/mot de passe (retiré), l'identité est de nouveau uniquement le device_id.
  // La lecture passe par la vue benevoles_statut_public (device_id + statut uniquement, aucune
  // donnée personnelle) plutôt que par la table benevoles directement, dont le SELECT public
  // n'existe plus depuis la correction de la fuite de vie privée.
  const [benevoleStatut, setBenevoleStatut] = useState(() => {
    try { return localStorage.getItem("pace-benevole-statut") || null; } catch (e) { return null; }
  });
  // Si un statut est déjà en cache local, l'accès est accordé immédiatement (pas d'attente
  // réseau) : un bénévole déjà validé garde son accès même hors ligne ou après une perte de
  // connexion. La vérification serveur tourne quand même en tâche de fond pour détecter un
  // changement de statut (suspension, etc.) dès que la connexion est disponible.
  const [benevoleStatutChargement, setBenevoleStatutChargement] = useState(() => {
    try { return !localStorage.getItem("pace-benevole-statut"); } catch (e) { return true; }
  });
  useEffect(() => {
    supabase.from("benevoles_statut_public").select("statut").eq("device_id", DEVICE_ID).order("statut", { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Réponse serveur claire : statut à jour, on le met en cache.
          const s = data[0].statut || "valide";
          setBenevoleStatut(s);
          try { localStorage.setItem("pace-benevole-statut", s); } catch (e) {}
        } else if (data) {
          // Réponse serveur claire mais vide : vraiment aucune inscription pour cet appareil
          // (pas une panne réseau, data est un tableau, pas null) — on efface le cache.
          setBenevoleStatut(null);
          try { localStorage.removeItem("pace-benevole-statut"); } catch (e) {}
        }
        // data === null : échec réseau. On ne touche pas au statut, on garde la valeur déjà
        // en cache (accès déjà validé précédemment) plutôt que de bloquer l'accès à tort.
        setBenevoleStatutChargement(false);
      });
  }, []);
  const accesBloque = benevoleStatut && benevoleStatut !== "valide";
  const estBenevoleValide = benevoleStatut === "valide";

  // Statut d'un compte Organisation (ONG/Gouvernement) : basé sur un vrai compte email/mot de
  // passe pour le compte principal, ou sur une session (éventuellement anonyme) ayant rejoint
  // via un code d'invitation pour un membre (citoyenSession dans les deux cas, pas device_id).
  // Nécessite une session active pour être vérifié — contrairement au bénévole, il faut se
  // connecter (ou resaisir son code) sur chaque nouvel appareil.
  const [organisationStatut, setOrganisationStatut] = useState(null);
  const [organisationEtapeDossier, setOrganisationEtapeDossier] = useState(null);
  const [organisationEtapeMotif, setOrganisationEtapeMotif] = useState(null);
  const [organisationChargement, setOrganisationChargement] = useState(true);
  useEffect(() => {
    if (citoyenSession === undefined) return; // session en cours de résolution
    if (!citoyenSession || !citoyenSession.user || !citoyenSession.user.id) {
      setOrganisationStatut(null);
      setOrganisationEtapeDossier(null); setOrganisationEtapeMotif(null);
      setOrganisationChargement(false);
      return;
    }
    const emailSession = citoyenSession.user.email || null;
    const userIdSession = citoyenSession.user.id;
    (async () => {
      // Confirme automatiquement toute invitation de membre en attente pour cet e-mail (ex.
      // après un clic sur le lien reçu il y a longtemps, pour les tout premiers membres
      // invités par e-mail) — best-effort, ne bloque jamais l'accès. Les membres par code
      // d'invitation sont confirmés directement par org_membre_rejoindre, pas ici.
      if (emailSession) { try { await supabase.rpc("org_membre_confirmer"); } catch (e) {} }

      // Le compte principal se connecte toujours par e-mail : sans e-mail sur la session
      // (cas d'un membre par code, via une session possiblement anonyme), on saute
      // directement à la recherche via org_membres.
      const data = emailSession
        ? (await supabase.from("organisations").select("statut, type, etape_dossier, etape_dossier_motif").eq("email", emailSession).eq("is_deleted", false).order("created_at", { ascending: false }).limit(1)).data
        : [];
      if (data && data.length > 0) {
        setOrganisationStatut(data[0].statut);
        setOrganisationEtapeDossier(data[0].etape_dossier); setOrganisationEtapeMotif(data[0].etape_dossier_motif);
        setOrganisationChargement(false);
        return;
      }
      if (data && data.length === 0) {
        // Pas de compte principal à cette identité : peut-être un membre confirmé d'une
        // organisation, identifié par e-mail (tout premiers membres) ou par user_id
        // (membres ayant rejoint via un code d'invitation).
        let membreQuery = supabase.from("org_membres").select("organisation_id").eq("statut", "actif").limit(1);
        membreQuery = emailSession ? membreQuery.eq("email", emailSession) : membreQuery.eq("user_id", userIdSession);
        const { data: membreData } = await membreQuery.maybeSingle();
        if (membreData) {
          const { data: orgData } = await supabase.from("organisations").select("statut, type, etape_dossier, etape_dossier_motif").eq("id", membreData.organisation_id).eq("is_deleted", false).maybeSingle();
          if (orgData) {
            setOrganisationStatut(orgData.statut);
            setOrganisationEtapeDossier(orgData.etape_dossier); setOrganisationEtapeMotif(orgData.etape_dossier_motif);
            setOrganisationChargement(false);
            return;
          }
        }
        setOrganisationStatut(null);
        setOrganisationEtapeDossier(null); setOrganisationEtapeMotif(null);
      }
      setOrganisationChargement(false);
    })();
  }, [citoyenSession]);
  const estOrganisationValidee = organisationStatut === "valide";
  const accesEtendu = estBenevoleValide || estOrganisationValidee; // bénévole validé OU organisation validée

  // Profil de base (e-mail + mot de passe) : préalable requis avant de devenir bénévole ou de
  // créer un compte organisation. Partage la même citoyenSession que le compte organisation —
  // un profil n'est pas un compte organisation, mais utilise le même mécanisme d'authentification.
  const [profilInfo, setProfilInfo] = useState(undefined); // undefined = en cours, null = aucun profil
  async function rafraichirProfil() {
    if (!citoyenSession || !citoyenSession.user || !citoyenSession.user.id) { setProfilInfo(null); return; }
    const { data } = await supabase.from("profils_comptes").select("nom, email, pays, ville, photo_url").eq("id", citoyenSession.user.id).maybeSingle();
    setProfilInfo(data || null);
  }
  useEffect(() => {
    if (citoyenSession === undefined) return;
    rafraichirProfil();
  }, [citoyenSession]);

  const statutEnCours = benevoleStatutChargement || organisationChargement;
  const ecransReserves = ["carte", "signaler", "arbre", "biodiversite", "assistant"];

  // Garde-fou : si le tab courant est réservé et que le citoyen est confirmé non-bénévole,
  // on le ramène sur Accueil. On attend que le statut soit résolu (statutEnCours) avant de
  // trancher, pour ne jamais faire d'aller-retour inutile pour un bénévole validé qui ouvre
  // un lien direct vers un onglet réservé.
  useEffect(() => {
    if (statutEnCours) return;
    if (ecransReserves.includes(tab) && !accesEtendu) setTab("accueil");
    if (tab === "espace_org" && !estOrganisationValidee) setTab("accueil");
  }, [tab, accesEtendu, estOrganisationValidee, statutEnCours]);

  const [themeSection, setThemeSection] = useState(null); // section du panneau d'affichage ouverte (null = fermé)
  const [showMenu, setShowMenu] = useState(false);

  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem("pace-theme-mode") || "system"; } catch (e) { return "system"; }
  });
  const [accent, setAccent] = useState(() => {
    try { return localStorage.getItem("pace-theme-accent") || "green"; } catch (e) { return "green"; }
  });
  const [systemDark, setSystemDark] = useState(() => {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
  });

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => setSystemDark(e.matches);
      mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
      return () => { mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler); };
    } catch (e) {}
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemDark);

  function updateThemeMode(mode) {
    setThemeMode(mode);
    try { localStorage.setItem("pace-theme-mode", mode); } catch (e) {}
  }
  function updateAccent(a) {
    setAccent(a);
    try { localStorage.setItem("pace-theme-accent", a); } catch (e) {}
  }

  // Point 3 : accessibilité — langue de l'interface (FR/EN pour commencer)
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("pace-lang") || "fr"; } catch (e) { return "fr"; }
  });
  function updateLang(l) {
    setLang(l);
    try { localStorage.setItem("pace-lang", l); } catch (e) {}
  }

  // Format d'affichage des coordonnées GPS : degré décimal, degré/minute/seconde, ou UTM.
  const [coordFormat, setCoordFormat] = useState(() => {
    try { return localStorage.getItem("pace-coord-format") || "dd"; } catch (e) { return "dd"; }
  });
  function updateCoordFormat(f) {
    setCoordFormat(f);
    try { localStorage.setItem("pace-coord-format", f); } catch (e) {}
  }

  // Orientation de l'affichage : "auto" (suit l'appareil), "portrait" ou "paysage". La disposition s'adapte
  // toujours (classe orient-* sur le conteneur) ; le verrouillage réel de l'écran n'est tenté que si
  // l'appareil l'autorise (Screen Orientation API : appli installée / plein écran sur Android, pas sur iOS).
  const [orientation, setOrientation] = useState(() => {
    try { return localStorage.getItem("pace-orientation") || "auto"; } catch (e) { return "auto"; }
  });
  function updateOrientation(o) {
    setOrientation(o);
    try { localStorage.setItem("pace-orientation", o); } catch (e) {}
  }
  useEffect(() => {
    const so = typeof screen !== "undefined" ? screen.orientation : null;
    if (!so) return;
    try {
      if (orientation === "auto") { if (so.unlock) so.unlock(); }
      else if (so.lock) { const r = so.lock(orientation === "portrait" ? "portrait" : "landscape"); if (r && r.catch) r.catch(() => {}); }
    } catch (e) {}
  }, [orientation]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      subscribeToPush();
    }
  }, []);

  useEffect(() => {
    refreshSessionIfNeeded();
    const t = setInterval(refreshSessionIfNeeded, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const [signalements, setSignalements] = useState([]);
  const [arbres, setArbres] = useState([]);
  const [enquetesCarte, setEnquetesCarte] = useState([]);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [notifState, setNotifState] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [actualites, setActualites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [suivis, setSuivis] = useState([]);
  const [pendingQueueCount, setPendingQueueCount] = useState(() => loadPendingQueue().length);
  const flushInProgressRef = useRef(false);

  useEffect(() => {
    const goOnline = () => { setOnline(true); flushPendingQueue(); };
    const goOffline = () => setOnline(false);
    const onQueueUpdated = () => setPendingQueueCount(loadPendingQueue().length);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("pace-queue-updated", onQueueUpdated);
    if (navigator.onLine) flushPendingQueue();
    const retryTimer = setInterval(() => { if (navigator.onLine) flushPendingQueue(); }, 20000);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); window.removeEventListener("pace-queue-updated", onQueueUpdated); clearInterval(retryTimer); };
  }, []);

  function enableNotif() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((perm) => {
      setNotifState(perm);
      if (perm === "granted") subscribeToPush();
    });
  }

  async function adminUpdateStatut(id, next) {
    const clear = next !== "resolu" ? { resolution_organisme: null, resolution_action: null, resolved_at: null } : {};
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, statut: next, ...clear } : s));
    const { error } = await supabase.from("signalements").update({ statut: next, ...clear }).eq("id", id);
    if (error) {
      console.error("Erreur de mise à jour du statut :", error);
      alert("Action refusée par le serveur (droits admin requis).");
    } else {
      logActivity(next === "resolu" ? "resolution" : "reouverture", "signalements", id);
      if (next === "resolu") {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try { new Notification("Signalement mis à jour", { body: "Un signalement a été marqué comme résolu.", icon: "./icon-192.png" }); } catch (e) {}
        }
        const s = signalements.find(x => x.id === id);
        if (s && s.device_id) {
          supabase.from("notifications").insert({
            destinataire: s.device_id,
            message: "Ton signalement a été marqué comme résolu.",
            lien: "carte",
          }).catch(() => {});
        }
      }
    }
  }

  // Le bénévole/citoyen à l'origine d'un signalement est sur le terrain et sait en temps réel
  // si le problème a été traité ou non : il peut donc basculer lui-même le statut de SES PROPRES
  // signalements, sans passer par l'admin.
  // Sécurité : contrairement à une première version qui ne comparait qu'un device_id (visible de
  // tous dans le flux public, donc usurpable), la mise à jour est signée avec la vraie session
  // Supabase anonyme de l'appareil (ensureDeviceSession) — la policy RLS "signalements" vérifie
  // côté serveur que citoyen_id = auth.uid() de cette session avant d'autoriser l'écriture.
  async function citoyenBasculerStatutSignalement(signalement) {
    if (!signalement || signalement.device_id !== DEVICE_ID) return;
    const session = await ensureDeviceSession();
    if (!session) {
      alert("Impossible de vérifier ton identité pour le moment (connexion, ou fonctionnalité pas encore activée côté serveur). Réessaie plus tard.");
      return;
    }
    const next = signalement.statut === "resolu" ? "attente" : "resolu";
    const clear = next === "resolu" ? { resolved_at: new Date().toISOString() } : { resolution_organisme: null, resolution_action: null, resolved_at: null };
    const precedent = signalement;
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, statut: next, ...clear } : s));
    const { data, error } = await supabase.from("signalements").update({ statut: next, ...clear }).eq("id", signalement.id).headers({ Authorization: "Bearer " + session.access_token }).select();
    if (error || !data || data.length === 0) {
      setSignalements(prev => prev.map(s => s.id === signalement.id ? precedent : s));
      alert("Action refusée par le serveur. Réessaie une fois de retour en ligne, ou contacte un administrateur si le problème persiste.");
      return;
    }
    logActivity(next === "resolu" ? "resolution_signaleur" : "reouverture_signaleur", "signalements", signalement.id);
  }

  async function adminResolve(signalement, { organisme, action }) {
    const payload = { statut: "resolu", resolution_organisme: organisme, resolution_action: action, resolved_at: new Date().toISOString() };
    const { data, error } = await supabase.from("signalements").update(payload).eq("id", signalement.id).select();
    if (error || !data || data.length === 0) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, ...payload } : s));
    logActivity("resolution", "signalements", signalement.id, `${organisme} — ${action}`);
    if (signalement.device_id) {
      supabase.from("notifications").insert({
        destinataire: signalement.device_id,
        message: `Ton signalement a été résolu par ${organisme}.`,
        lien: "carte",
      }).catch(() => {});
    }
  }

  async function adminValidate(id) {
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, valide: true } : s));
    const { error } = await supabase.from("signalements").update({ valide: true }).eq("id", id);
    if (error) { console.error("Erreur de validation :", error); alert("Action refusée par le serveur (droits admin requis)."); }
    else {
      logActivity("validation", "signalements", id);
      const s = signalements.find(x => x.id === id);
      if (s && s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: "Ton signalement a été validé et pris en compte par l'équipe.",
          lien: "carte",
        }).catch(() => {});
      }
    }
  }

  async function adminValidateArbre(id) {
    setArbres(prev => prev.map(a => a.id === id ? { ...a, valide: true } : a));
    const { error } = await supabase.from("arbres").update({ valide: true }).eq("id", id);
    if (error) { console.error("Erreur de validation :", error); alert("Action refusée par le serveur (droits admin requis)."); }
    else logActivity("validation", "arbres", id);
  }

  const MOTIF_LABELS = { faux: "Faux signalement", doublon: "Doublon", spam: "Spam", erreur_localisation: "Erreur de localisation" };

  async function adminRevertModeration(signalement, { reason, motif }) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, valide: false, statut: "attente", moderation_motif: motif, moderation_par: email } : s));
    await supabase.from("signalements").update({
      valide: false, statut: "attente", moderation_motif: motif, moderation_par: email, moderation_le: new Date().toISOString(),
    }).eq("id", signalement.id);
    await logAudit("revert_statut", "signalement", signalement.id, reason, { motif });
    // Notifie l'auteur du signalement (citoyen, identifié par device_id)
    supabase.from("notifications").insert({
      destinataire: signalement.device_id,
      message: `Ton signalement a été repassé en vérification. Motif : ${MOTIF_LABELS[motif] || motif}.`,
      lien: "carte",
    }).catch(() => {});
  }

  async function adminSoftDeleteSignalement(signalement, { reason }) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    const { data, error } = await supabase.from("signalements").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: email }).eq("id", signalement.id).select();
    if (error || !data || data.length === 0) { alert("Suppression refusée par le serveur (droits admin requis) : le signalement n'a pas été modifié et réapparaîtra."); return; }
    await logAudit("soft_delete", "signalement", signalement.id, reason);
    logActivity("soft_delete", "signalements", signalement.id, reason);
    setSignalements(prev => prev.filter(s => s.id !== signalement.id));
  }

  async function adminDelete(table, id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { alert("Suppression refusée par le serveur."); return; }
    logActivity("suppression", table, id);
    if (table === "signalements") setSignalements(prev => prev.filter(s => s.id !== id));
    if (table === "arbres") setArbres(prev => prev.filter(a => a.id !== id));
  }

  async function adminSoftDeleteArbre(arbre) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    const { data, error } = await supabase.from("arbres").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: email }).eq("id", arbre.id).select();
    if (error) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    if (!data || data.length === 0) { alert("Suppression refusée par le serveur (droits admin requis) : l'arbre n'a pas été modifié et réapparaîtra."); return; }
    logActivity("soft_delete", "arbres", arbre.id, arbre.nom || "Arbre");
    setArbres(prev => prev.filter(a => a.id !== arbre.id));
  }

  // Le panneau "Historique" (corbeille) gère sa propre liste indépendamment de l'état
  // signalements/arbres chargé une fois au démarrage de App(). Sans ce callback, un élément
  // restauré depuis la corbeille redevient bien is_deleted=false en base, mais reste invisible
  // partout ailleurs dans l'app (carte, liste de modération) tant que la page n'est pas rechargée.
  function onRestaurerItem(table, row) {
    if (!row) return;
    if (table === "signalements") {
      const mapped = mapSignalement(row);
      setSignalements(prev => prev.some(s => s.id === row.id) ? prev.map(s => s.id === row.id ? mapped : s) : [mapped, ...prev]);
    } else if (table === "arbres") {
      const mapped = mapArbre(row);
      setArbres(prev => prev.some(a => a.id === row.id) ? prev.map(a => a.id === row.id ? mapped : a) : [mapped, ...prev]);
    }
    // "benevoles" n'a pas d'état miroir dans App() (chargé à la demande côté admin) : rien à synchroniser.
  }

  function mapSignalement(r) {
    const d = new Date(r.created_at);
    return { ...r, date: d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
  }
  function mapArbre(r) {
    return { ...r, date: new Date(r.planted_at).toLocaleDateString("fr-FR"), plantedAt: new Date(r.planted_at).getTime() };
  }

  const [rafraichissementEnCours, setRafraichissementEnCours] = useState(false);
  async function chargerDonneesPrincipales() {
    setRafraichissementEnCours(true);
    try {
      const [{ data: sigs }, { data: trees }, { data: news }, { data: obs }, { data: suiv }, { data: enq }] = await Promise.all([
        supabase.from("signalements_public").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("arbres_public").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("actualites").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("observations").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("arbre_suivis").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("enquete_dossiers_public").select("*").order("created_at", { ascending: false }).limit(300),
      ]);
      setSignalements((sigs || []).reverse().map(mapSignalement));
      setArbres((trees || []).reverse().map(mapArbre));
      setActualites(news || []);
      setObservations((obs || []).reverse());
      setSuivis(suiv || []);
      setEnquetesCarte(enq || []);

      const lastSeen = localStorage.getItem("pace-last-alert") || "";
      const newAlert = (news || []).find(n => n.urgent && n.created_at > lastSeen);
      if (newAlert && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification("Alerte EcoVigil — " + newAlert.titre, { body: newAlert.contenu, icon: "./icon-192.png" }); } catch (e) {}
      }
      if (news && news[0]) localStorage.setItem("pace-last-alert", news[0].created_at);
    } catch (e) {
      console.error("Erreur de chargement Supabase :", e);
    }
    setRafraichissementEnCours(false);
  }

  useEffect(() => { chargerDonneesPrincipales(); }, []);
  // Amorce la session anonyme d'appareil dès le démarrage (plutôt qu'au premier clic) pour
  // qu'elle soit déjà prête quand l'utilisateur signale un problème ou change un statut.
  useEffect(() => { ensureDeviceSession(); }, []);

  async function uploadPhoto(dataUrl, prefix) {
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

  async function addSuivi(arbreId, { photo, etat, note }, opts) {
    opts = opts || {};
    const payload = { arbreId, photo, etat, note };
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("suivi", payload);
      setPendingQueueCount(loadPendingQueue().length);
      setSuivis(prev => [{ id: tempId, arbre_id: arbreId, photo_url: photo || null, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }, ...prev]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "suivis");
      const { data, error } = await supabase.from("arbre_suivis").insert({ arbre_id: arbreId, photo_url, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID }).select().single();
      if (error) throw error;
      setSuivis(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [data, ...withoutPending];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      console.error("Erreur d'ajout du suivi :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("suivi", payload);
      setPendingQueueCount(loadPendingQueue().length);
      setSuivis(prev => [{ id: tempId, arbre_id: arbreId, photo_url: photo || null, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }, ...prev]);
      alert("Pas de connexion : ce suivi a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addSignalement(s, opts) {
    opts = opts || {};
    if (!opts.isReplay) {
      if (!checkLimiteFrequence(12)) {
        alert("Trop de signalements envoyés depuis cet appareil en une heure. Réessaie plus tard.");
        return;
      }
      const doublonProche = signalements.find(x => !x._pending && x.categorie === s.categorie && distanceMetres(x.lat, x.lng, s.lat, s.lng) < 25 && (Date.now() - new Date(x.created_at || x.date).getTime()) < 172800000);
      if (doublonProche && !window.confirm("Un signalement similaire (même catégorie) existe déjà à moins de 25 m d'ici, envoyé récemment. Envoyer quand même ?")) {
        return;
      }
    }
    const { photo, ...toInsert } = s;
    // Si cet appareil est inscrit comme bénévole, on accompagne le signalement de ses
    // renseignements (nom, contact, pays, ville, quartier) pour donner du contexte à qui le traite.
    const bi = getBenevoleInfo();
    const benevoleFields = bi ? { benevole_id: bi.id || null, benevole_nom: bi.nom || null, benevole_contact: bi.contact || null, benevole_pays: bi.pays || null, benevole_ville: bi.ville || null, benevole_quartier: bi.quartier || null } : {};
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("signalement", s);
      setPendingQueueCount(loadPendingQueue().length);
      setSignalements(prev => [...prev, { ...toInsert, ...benevoleFields, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "signalements");
      const session = await ensureDeviceSession();
      const { data, error } = await supabase.from("signalements")
        .insert({ ...toInsert, ...benevoleFields, photo_url, device_id: DEVICE_ID, citoyen_id: session ? session.user.id : null, is_deleted: false })
        .headers(session ? { Authorization: "Bearer " + session.access_token } : {})
        .select().single();
      if (error) throw error;
      setSignalements(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, mapSignalement(data)];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
      if (s.urgence === "haute") {
        supabase.from("admins").select("email").then(({ data: admins }) => {
          (admins || []).forEach(a => {
            supabase.from("notifications").insert({
              destinataire: a.email, message: `Signalement urgent à valider (${categorieMeta(s.categorie).label})`, lien: "signalements",
            }).catch(() => {});
          });
        });
      }
    } catch (e) {
      console.error("Erreur d'envoi du signalement :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("signalement", s);
      setPendingQueueCount(loadPendingQueue().length);
      setSignalements(prev => [...prev, { ...toInsert, ...benevoleFields, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), _pending: true }]);
      alert("Pas de connexion : ton signalement a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addArbre(a, opts) {
    opts = opts || {};
    if (!opts.isReplay) {
      if (!checkLimiteFrequence(20)) {
        alert("Trop d'arbres enregistrés depuis cet appareil en une heure. Réessaie plus tard.");
        return;
      }
      const doublonProche = arbres.find(x => !x._pending && distanceMetres(x.lat, x.lng, a.lat, a.lng) < 3 && (Date.now() - (x.plantedAt || 0)) < 600000);
      if (doublonProche && !window.confirm("Un arbre vient déjà d'être enregistré à moins de 3 m d'ici. Ajouter quand même ?")) {
        return;
      }
    }
    const { photo, ...toInsert } = a;
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("arbre", a);
      setPendingQueueCount(loadPendingQueue().length);
      setArbres(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, planted_at: new Date().toISOString(), date: new Date().toLocaleDateString("fr-FR"), plantedAt: Date.now(), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "arbres");
      const { data, error } = await supabase.from("arbres").insert({ ...toInsert, photo_url, device_id: DEVICE_ID, is_deleted: false }).select().single();
      if (error) throw error;
      setArbres(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, mapArbre(data)];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      console.error("Erreur d'enregistrement de l'arbre :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("arbre", a);
      setPendingQueueCount(loadPendingQueue().length);
      setArbres(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, planted_at: new Date().toISOString(), date: new Date().toLocaleDateString("fr-FR"), plantedAt: Date.now(), _pending: true }]);
      alert("Pas de connexion : ton arbre a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addObservation(o, opts) {
    opts = opts || {};
    const { photo, ...toInsert } = o;
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("observation", o);
      setPendingQueueCount(loadPendingQueue().length);
      setObservations(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "observations");
      const { data, error } = await supabase.from("observations").insert({ ...toInsert, photo_url, device_id: DEVICE_ID }).select().single();
      if (error) throw error;
      setObservations(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, data];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("observation", o);
      setPendingQueueCount(loadPendingQueue().length);
      setObservations(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }]);
      alert("Pas de connexion : ton observation a été enregistrée sur l'appareil et sera envoyée automatiquement dès que le réseau reviendra.");
    }
  }

  async function flushPendingQueue() {
    if (!navigator.onLine) return;
    // Verrou de ré-entrance : le déclencheur 'online' et le minuteur de secours (20s) peuvent
    // se chevaucher sur un réseau lent, ce qui provoquerait un double envoi du même élément
    // (doublon en base) si deux passages de la file s'exécutaient en parallèle.
    if (flushInProgressRef.current) return;
    flushInProgressRef.current = true;
    try { window.dispatchEvent(new CustomEvent("pace-queue-syncing", { detail: { syncing: true } })); } catch (e) {}
    const MAX_TENTATIVES = 8;
    try {
      const queue = loadPendingQueue();
      for (const item of queue) {
        if (!navigator.onLine) break; // vraie coupure réseau : on s'arrête, on réessaiera plus tard
        if (item._failed) continue; // déjà abandonné après trop d'échecs, ne pas re-tenter automatiquement
        try {
          if (item.type === "signalement") await addSignalement(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "arbre") await addArbre(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "observation") await addObservation(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "suivi") await addSuivi(item.payload.arbreId, item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "suppression") await envoyerDemandeSuppression({ isReplay: true, tempId: item.id });
          else if (item.type === "benevole") await inscrireBenevole(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "enquete") { await syncOneDossierEnquete(item.payload.localId); dequeuePendingAction(item.id); }
          else dequeuePendingAction(item.id);
        } catch (e) {
          // Un échec sur un élément (réseau instable ou donnée rejetée par le serveur) ne doit
          // pas bloquer indéfiniment les éléments suivants de la file (effet de tête de ligne).
          // On compte les tentatives par élément et on continue avec le reste de la file ;
          // au-delà du seuil, l'élément est marqué comme échoué mais reste conservé localement
          // (aucune perte de données) plutôt que d'être rejoué en boucle toutes les 20s.
          const current = loadPendingQueue();
          const idx = current.findIndex(q => q.id === item.id);
          if (idx !== -1) {
            current[idx].attempts = (current[idx].attempts || 0) + 1;
            if (current[idx].attempts >= MAX_TENTATIVES) {
              current[idx]._failed = true;
              console.error("Synchronisation abandonnée après plusieurs échecs pour l'élément", item.id, e);
            }
            savePendingQueue(current);
          }
        }
      }
    } finally {
      flushInProgressRef.current = false;
      setPendingQueueCount(loadPendingQueue().length);
      try { window.dispatchEvent(new CustomEvent("pace-queue-syncing", { detail: { syncing: false } })); } catch (e) {}
    }
  }


  // Entrées du menu hamburger : mêmes cibles et mêmes conditions d'accès que les cartes de l'accueil et le rendu ci-dessous.
  const ouvrirReglage = (section) => () => setThemeSection(section);
  const notifNotes = { default: t(lang, "activer_notifs"), granted: "Activées", denied: "Bloquées dans les réglages du navigateur" };
  const menuItems = [
    { id: "accueil", label: t(lang, "nav_accueil"), icon: IconHome, onSelect: () => setTab("accueil") },
    { id: "profil", label: "Profil", icon: IconUserCircle, onSelect: () => setTab("profil") },
    { id: "theme", label: "Thèmes", icon: IconSun, onSelect: ouvrirReglage("theme") },
    { id: "accent", label: "Couleur d'accent", icon: IconDroplet, onSelect: ouvrirReglage("accent") },
    { id: "langue", label: "Langue / Language", icon: IconGlobe, onSelect: ouvrirReglage("langue") },
    { id: "gps", label: "Format des coordonnées GPS", icon: IconTarget, onSelect: ouvrirReglage("gps") },
    { id: "orientation", label: "Affichage : portrait / paysage", icon: IconMaximize, onSelect: ouvrirReglage("orientation"), note: { auto: "Automatique", portrait: "Portrait", paysage: "Paysage" }[orientation] },
    { id: "notifs", label: "Notifications", icon: IconBell, onSelect: enableNotif, disabled: notifState !== "default", note: notifNotes[notifState] || "Non prises en charge sur cet appareil" },
    { id: "espace_org", label: "Compte organisation", icon: IconShield, onSelect: () => setTab("espace_org"), locked: !estOrganisationValidee, note: estOrganisationValidee ? null : "Réservé aux organisations validées" },
    { id: "assistant", label: "Assistant de décision environnementale", icon: IconSparkles, onSelect: () => setTab("assistant"), locked: !accesEtendu, note: accesEtendu ? null : "Réservé aux bénévoles et organisations validés" },
    { id: "groupes_terrain", label: "Groupe terrain", icon: IconUsers, onSelect: () => setTab("groupes_terrain") },
    { id: "enquetes_terrain", label: "Enquêtes terrain", icon: IconSearch, onSelect: () => setTab("enquetes_terrain"), locked: !estBenevoleValide, note: estBenevoleValide ? null : "Réservé aux bénévoles validés" },
    { id: "evenements", label: "Événements", icon: IconCalendar, onSelect: () => setTab("evenements") },
  ];

  return (
    <div dir={RTL_LANGS.includes(lang) ? "rtl" : "ltr"} className={`pace-app-outer ${isDark ? "pace-dark" : ""} accent-${accent}${orientation !== "auto" ? ` orient-${orientation}` : ""}`} style={{ fontFamily: "Work Sans, sans-serif", background: "var(--c-bg)", minHeight: "100vh", display: "flex", justifyContent: "center", transition: "background-color .25s ease" }}>
      {showSplash && <SplashScreen lang={lang} />}
      {citoyenRecoveryToken && !showSplash && (
        <CitoyenNouveauMotDePasse token={citoyenRecoveryToken} onDone={() => setCitoyenRecoveryToken(null)} />
      )}
      {showOnboarding && !showSplash && !citoyenRecoveryToken && (
        <Onboarding onDone={() => {
          try { localStorage.setItem("pace-onboarded", "1"); } catch (e) {}
          setShowOnboarding(false);
        }} />
      )}
      <div className={`pace-frame ${showAdmin ? "pace-frame-wide" : ""}`} style={{ minHeight: "100vh", background: "var(--c-bg)", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)", transition: "background-color .25s ease" }}>
        <div className="pace-header" style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-sky))", color: "#fff", padding: "18px 16px 22px", borderRadius: "0 0 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img src={LOGO_DATA_URL} alt={t(lang, "logo_pace_alt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, letterSpacing: 0.3 }}>EcoVigil</div>
            <div style={{ fontSize: 10.5, opacity: 0.9, lineHeight: 1.3 }}>{t(lang, "plateforme_desc")}</div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{t(lang, "sub_accueil")}</div>
          </div>
          {/* Cloche de notifications citoyenne : ferme la boucle de suivi (validation, résolution
              d'un signalement...) pour quiconque n'a pas activé les notifications push — sans elle,
              ces notifications étaient enregistrées en base mais nulle part visibles dans l'app.
              Même composant générique que celui du Centre d'EcoVigil (NotifBell), simplement
              interrogé par device_id plutôt que par e-mail admin. Masquée en mode admin : ce
              dernier a déjà sa propre cloche, distincte, dans son propre en-tête. */}
          {!showAdmin && <NotifBell email={DEVICE_ID} onNavigate={setTab} color="#fff" />}
        {!showAdmin && (
          <button onClick={() => setShowMenu(true)} aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-expanded={showMenu} style={{
            background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconMenu size={17} color="#fff" />
          </button>
        )}
          {/* Bouton du Centre d'EcoVigil retiré de l'interface visible : l'accès admin
              se fait uniquement via l'URL dédiée ?admin=1 (voir initialUrlState plus haut),
              pour qu'un utilisateur ordinaire ne puisse pas tomber dessus par erreur. */}
        </div>

        {showMenu && <MenuHamburger items={menuItems} onClose={() => setShowMenu(false)} />}

  {themeSection && (
          <ThemePanel
            themeMode={themeMode} accent={accent} lang={lang} coordFormat={coordFormat} orientation={orientation} onSetOrientation={updateOrientation}
            onSetMode={updateThemeMode} onSetAccent={updateAccent} onSetLang={updateLang} onSetCoordFormat={updateCoordFormat}
            section={themeSection}
        onClose={() => setThemeSection(null)}
          />
        )}

        {!online && (
          <div style={{ background: "#B5451B", color: "#fff", fontSize: 11.5, textAlign: "center", padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <IconWifiOff size={13} /> {t(lang, "hors_ligne_banner")}{pendingQueueCount > 0 ? ` (${pendingQueueCount} ${t(lang, "hors_ligne_banner_attente")})` : ""}
          </div>
        )}
        {online && pendingQueueCount > 0 && (
          <div style={{ background: "var(--c-warning)", color: "#fff", fontSize: 11.5, textAlign: "center", padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <IconClock size={13} /> {t(lang, "envoi_en_cours_prefix")} {pendingQueueCount} {t(lang, "envoi_attente_suffix")}
          </div>
        )}

        {showAdmin ? (
          <AdminSpace signalements={signalements} arbres={arbres} onUpdateStatut={adminUpdateStatut} onResolve={adminResolve} onValidate={adminValidate} onValidateArbre={adminValidateArbre} onDelete={adminDelete} onSoftDeleteArbre={adminSoftDeleteArbre} onRevertModeration={adminRevertModeration} onSoftDeleteSignalement={adminSoftDeleteSignalement} onRestaurerItem={onRestaurerItem} onRafraichir={chargerDonneesPrincipales} rafraichissementEnCours={rafraichissementEnCours} onExit={() => { exitAdminIdentity(); setShowAdmin(false); }} />
        ) : tab === "confidentialite" ? (
          <Confidentialite onBack={() => setTab("accueil")} />
        ) : profilInfo === undefined ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--c-text-muted)", fontSize: 13, gap: 8 }}>
            <IconClock size={15} /> Chargement…
          </div>
        ) : profilInfo === null ? (
          <MurProfilObligatoire profilInfo={profilInfo} lang={lang} />
        ) : accesBloque ? (
          <BenevoleAccesBloque statut={benevoleStatut} />
        ) : ecransReserves.includes(tab) && statutEnCours ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--c-text-muted)", fontSize: 13, gap: 8 }}>
            <IconClock size={15} /> Vérification de l'accès…
          </div>
        ) : tab === "biodiversite" && accesEtendu ? (
          <Biodiversite observations={observations} onAdd={addObservation} onBack={() => setTab("accueil")} lang={lang} coordFormat={coordFormat} />
        ) : tab === "assistant" && accesEtendu ? (
          <AssistantIA onBack={() => setTab("accueil")} signalements={signalements} arbres={arbres} observations={observations} actualites={actualites} />
        ) : tab === "espace_org" && estOrganisationValidee ? (
          <EspaceOrganisation organisationEmail={citoyenSession && citoyenSession.user && citoyenSession.user.email} organisationUserId={citoyenSession && citoyenSession.user && citoyenSession.user.id} onBack={() => setTab("accueil")} coordFormat={coordFormat}  peutBasculerBenevole={estBenevoleValide} />
        ) : tab === "evenements" ? (
          <Evenements onBack={() => setTab("accueil")} />
        ) : tab === "groupes_terrain" ? (
          <GroupesTerrain onBack={() => setTab("accueil")} estBenevoleValide={estBenevoleValide} />
        ) : tab === "enquetes_terrain" ? (
          <EnquetesTerrain onBack={() => setTab("accueil")} />
        ) : (
          <div key={tab} className="pace-fade-in">
            {tab === "accueil" && <Accueil signalements={signalements.filter(s => s.device_id === DEVICE_ID)} arbres={arbres.filter(a => a.device_id === DEVICE_ID)} notifState={notifState} onEnableNotif={enableNotif} onOpenAdmin={() => { enterAdminIdentity(); setShowAdmin(true); }} actualites={actualites} onNavigate={setTab} lang={lang} estBenevoleValide={estBenevoleValide} benevoleStatut={benevoleStatut} onBenevoleInscrit={() => { setBenevoleStatut("en_attente"); try { localStorage.setItem("pace-benevole-statut", "en_attente"); } catch (e) {} }} estOrganisationValidee={estOrganisationValidee} organisationStatut={organisationStatut} organisationEtapeDossier={organisationEtapeDossier} organisationEtapeMotif={organisationEtapeMotif} onBasculerStatutSignalement={citoyenBasculerStatutSignalement} profilInfo={profilInfo} onProfilChange={rafraichirProfil} />}
            {tab === "carte" && accesEtendu && <Carte signalements={signalements} arbres={arbres} observations={observations} enquetesCarte={enquetesCarte} onAddSignalement={addSignalement} onAddArbre={addArbre} onAddObservation={addObservation} online={online} pendingQueueCount={pendingQueueCount} onFlushQueue={flushPendingQueue} lang={lang} coordFormat={coordFormat} />}
            {tab === "signaler" && accesEtendu && <Signaler onSubmit={addSignalement} lang={lang} coordFormat={coordFormat} />}
            {tab === "arbre" && accesEtendu && <MonArbre arbres={arbres.filter(a => a.device_id === DEVICE_ID)} suivis={suivis} onAdd={addArbre} onAddSuivi={addSuivi} lang={lang} coordFormat={coordFormat} />}
            {tab === "profil" && <ProfilTab profilInfo={profilInfo} onProfilChange={rafraichirProfil} lang={lang} />}
          </div>
        )}

        {!showAdmin && !!profilInfo && !accesBloque && tab !== "biodiversite" && tab !== "confidentialite" && tab !== "assistant" && tab !== "espace_org" && tab !== "evenements" && tab !== "groupes_terrain" && tab !== "enquetes_terrain" && (
          <div className="pace-bottom-nav" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--c-surface)", borderTop: "1px solid var(--c-border)", display: "flex", padding: "8px 6px", borderRadius: "18px 18px 0 0", boxShadow: "0 -4px 16px rgba(0,0,0,0.04)" }}>
            {TABS.map(tabItem => {
              const IconT = tabItem.icon;
              const active = tab === tabItem.id;
              const verrouille = tabItem.id !== "accueil" && tabItem.id !== "profil" && !accesEtendu;
              const navLabels = { accueil: t(lang, "nav_accueil"), carte: t(lang, "nav_carte"), arbre: t(lang, "nav_arbre") };
              return (
                <button key={tabItem.id} onClick={() => setTab(verrouille ? "accueil" : tabItem.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", opacity: verrouille ? 0.45 : 1 }}>
                  <div style={{ background: tabItem.cta && !verrouille ? "#B5451B" : (active && !verrouille ? "var(--c-surface-soft)" : "transparent"), borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {verrouille ? <IconLock size={15} color="var(--c-text-muted)" /> : <IconT size={17} color={tabItem.cta ? "#fff" : (active ? "var(--c-accent)" : "var(--c-text-muted)")} />}
                  </div>
                  <span style={{ fontSize: 10, color: active && !verrouille ? "var(--c-accent)" : "var(--c-text-muted)", fontWeight: active && !verrouille ? 600 : 500 }}>{navLabels[tabItem.id] || tabItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
