import { dequeuePendingAction, enqueuePendingAction } from "./offline.js";
import { DEVICE_ID, currentSession, getActiveSession, supabase } from "./supabase.js";

export async function logActivity(action, table, id, detail) {
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
export async function capturerConnexionParZone() {
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
export async function logGroupeAudit(groupeId, action, cibleType, cibleId, detail) {
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
export async function logAudit(actionType, targetEntity, targetId, reason, metadata) {
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
export async function envoyerDemandeSuppression(opts) {
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
export async function inscrireBenevole(payload, opts) {
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
