import { compressImage, uploadPhotoGeneric } from "../components/media.jsx";
import { uid } from "./categories.jsx";
import { supabase } from "./supabase.js";

/* ---------- File d'attente hors-ligne (signalements, arbres, observations) ----------
   Principe : si l'appareil est hors-ligne (ou si l'envoi échoue), l'action est
   stockée dans localStorage avec un identifiant temporaire, affichée immédiatement
   dans l'interface avec un badge "en attente", puis renvoyée automatiquement au
   retour du réseau (événement 'online' + vérification périodique de sécurité). */
const PENDING_QUEUE_KEY = "pace-pending-queue";

export function loadPendingQueue() {
  try { const v = JSON.parse(localStorage.getItem(PENDING_QUEUE_KEY) || "[]"); return Array.isArray(v) ? v.filter(Boolean) : []; } catch (e) { return []; }
}

export function savePendingQueue(q) {
  try { localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(q)); } catch (e) {
    // Quota localStorage dépassé (ex. trop de photos en attente) : on retire le plus ancien
    // pour laisser de la place au nouveau, plutôt que de perdre silencieusement l'action.
    try {
      const trimmed = q.slice(1);
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(trimmed));
    } catch (e2) {}
  }
}

export function enqueuePendingAction(type, payload) {
  const tempId = "pending-" + uid() + uid();
  const q = loadPendingQueue();
  q.push({ id: tempId, type, payload, queued_at: Date.now() });
  savePendingQueue(q);
  try { window.dispatchEvent(new Event("pace-queue-updated")); } catch (e) {}
  return tempId;
}

export function dequeuePendingAction(tempId) {
  savePendingQueue(loadPendingQueue().filter(it => it.id !== tempId));
  try { window.dispatchEvent(new Event("pace-queue-updated")); } catch (e) {}
}

// ---- Enquêtes hors-ligne : dossiers éditables avant synchronisation, sur le même principe que
// PENDING_QUEUE_KEY ci-dessus, mais avec un contenu qu'on peut continuer à modifier (plusieurs
// sauvegardes locales successives) plutôt qu'une action figée à rejouer telle quelle.
const ENQ_OFFLINE_KEY = "ecovigil-enquetes-offline";

// Les dossiers lus depuis localStorage peuvent être corrompus ou d'un ancien format (entrée nulle,
// sans "cols"…) : on les normalise ici pour que l'interface ne plante jamais à l'affichage.
export function loadOfflineEnquetes() {
  try {
    const v = JSON.parse(localStorage.getItem(ENQ_OFFLINE_KEY) || "{}");
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out = {};
    Object.entries(v).forEach(([k, r]) => {
      if (!r || typeof r !== "object" || Array.isArray(r)) return;
      const objet = (x) => x && typeof x === "object" && !Array.isArray(x);
      out[k] = objet(r.cols) && objet(r.donnees) ? r : { ...r, localId: r.localId || k, cols: objet(r.cols) ? r.cols : {}, donnees: objet(r.donnees) ? r.donnees : {} };
    });
    return out;
  } catch (e) { return {}; }
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

export function getOfflineEnquete(localId) { return loadOfflineEnquetes()[localId] || null; }

export function putOfflineEnquete(rec) { const m = loadOfflineEnquetes(); m[rec.localId] = rec; saveOfflineEnquetes(m); }

export function removeOfflineEnquete(localId) { const m = loadOfflineEnquetes(); delete m[localId]; saveOfflineEnquetes(m); }

// Une seule entrée de file par dossier : évite les doublons si plusieurs sauvegardes locales
// s'enchaînent avant la prochaine synchronisation.
export function enqueuePendingEnquete(localId) {
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
export async function syncOneDossierEnquete(localId) {
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
