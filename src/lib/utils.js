import { t, langCourante } from "./i18n.js";

// --- Point 1 : estimation du CO2 selon l'âge de l'arbre plutôt qu'une constante fixe.
// Approximation : ~6 kg/an la 1ère année (jeune plant), puis ~21 kg/an en rythme de croisière une fois établi.
export function co2EstimeParArbre(a) {
  const plantedAt = a.plantedAt || (a.planted_at ? new Date(a.planted_at).getTime() : Date.now());
  const ansEcoules = Math.max(0, (Date.now() - plantedAt) / (365 * 86400000));
  if (ansEcoules <= 1) return Math.round(ansEcoules * 6);
  return Math.round(6 + (ansEcoules - 1) * 21);
}

// --- Anti-fraude (point 2) : distance entre deux coordonnées GPS, en mètres ---
export function distanceMetres(lat1, lng1, lat2, lng2) {
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
  const pts = t(langCourante(), "cap_dirs").split(","); // points cardinaux selon la langue (N, E, S, O/W)
  const dir = estLatitude ? (dd >= 0 ? pts[0] : pts[4]) : (dd >= 0 ? pts[2] : pts[6]);
  // On arrondit d'abord en dixièmes de seconde, puis on décompose : évite d'afficher "60.0" secondes
  // (ex. 41'59.97" arrondi à 41'60.0" au lieu de 42'0.0").
  const dixiemes = Math.round(Math.abs(dd) * 3600 * 10);
  const deg = Math.floor(dixiemes / 36000);
  const min = Math.floor((dixiemes % 36000) / 600);
  const sec = ((dixiemes % 600) / 10).toFixed(1);
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

export function formatCoordonnees(lat, lng, format) {
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
export const PRIORITE_ORDRE = { critique: 4, haute: 3, moyenne: 2, faible: 1 };

export function calculerPriorite(signalement, tousSignalements) {
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

// Les libellés sont des accesseurs : ils suivent la langue active à chaque lecture, sans que les
// écrans qui lisent PRIORITE_INFO[x].label aient besoin d'être modifiés.
export const PRIORITE_INFO = {
  critique: { get label() { return t(langCourante(), "priorite_critique"); }, color: "#8B1E1E" },
  haute: { get label() { return t(langCourante(), "priorite_haute"); }, color: "#B5451B" },
  moyenne: { get label() { return t(langCourante(), "priorite_moyenne"); }, color: "#E3A73B" },
  faible: { get label() { return t(langCourante(), "priorite_faible"); }, color: "#4A8B6F" },
};

// Limite de fréquence par appareil : évite le spam de masse depuis un seul device.
// Première ligne de défense côté client — à compléter par une politique RLS/Edge Function côté serveur si besoin d'une garantie forte.
export function checkLimiteFrequence(maxParHeure) {
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
