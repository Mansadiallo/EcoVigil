import React, { useEffect, useRef, useState } from "react";
import { IconClock, IconRotateCcw, IconTarget } from "../components/icons.jsx";
import { formatCoordonnees } from "./utils.js";

export const AFRICA_CENTER = [7.1881, 21.0938]; // Centre géographique approximatif du continent africain

export function markerHtml(color, kind, borderColor) {
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
export const ORIGINE_COULEURS = { benevole: "#2E6B8A", ong: "#1F7A4D", administration: "#7A1F1F" };

export const ORIGINE_LABELS = { citoyen: "Citoyen", benevole: "Bénévole", ong: "ONG", administration: "Administration publique" };

export function origineSignalement(s, origineParGroupe) {
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
export function coucheDeCategorie(catId) {
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
export function pointInPolygon(point, vs) {
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
export function gpsQualite(accuracy) {
  if (accuracy == null || isNaN(accuracy)) return { label: "Inconnue", couleur: "#94a3b8" };
  if (accuracy <= 10) return { label: "Excellente", couleur: "#16a34a" };
  if (accuracy <= 25) return { label: "Bonne", couleur: "#65a30d" };
  if (accuracy <= 50) return { label: "Moyenne", couleur: "#d97706" };
  return { label: "Faible", couleur: "#dc2626" };
}

export function formatCap(deg) {
  if (deg == null || isNaN(deg)) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const i = Math.round(deg / 45) % 8;
  return `${Math.round(deg)}° (${dirs[i]})`;
}

export function formatVitesse(ms) {
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
export function LocationPrecision({ coordFormat, onUpdate, compact = false }) {
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

export async function getCachedTile(key) {
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

export async function putCachedTile(key, blob) {
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

export async function countCachedTiles() {
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

export async function clearCachedTiles() {
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
export function tilesPourZone(bounds, zMin, zMax) {
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
export function creerCoucheTuilesHorsLigne(urlTemplate, options) {
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
export const SENTINEL2_MOSAIC_YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

export function urlMosaiqueSentinel2(annee) {
  return `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${annee}_3857/default/g/{z}/{y}/{x}.jpg`;
}

export const SENTINEL2_ATTRIBUTION = "Sentinel-2 cloudless — EOX IT Services GmbH (données Copernicus Sentinel modifiées)";

// Résolution native Sentinel-2 (~10 m/pixel) : au-delà du zoom 14 environ, les tuiles
// sont nécessairement interpolées. Fixer la même limite pour "avant" ET "après" évite
// qu'une mosaïque paraisse plus nette que l'autre pour une raison purement technique
// (zoom serveur différent) plutôt qu'un vrai changement de terrain.
export const SENTINEL2_ZOOM_NATIF_MAX = 14;

// Compare deux tuiles octet par octet (pas de supposition, pas de hash approximatif) :
// c'est la seule façon de confirmer que deux mosaïques renvoient réellement une image
// différente pour la zone regardée, avant de présenter la comparaison comme fiable.
export async function chargerTuileBrute(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("tuile indisponible");
  return await res.arrayBuffer();
}

export function tuilesIdentiques(buf1, buf2) {
  if (buf1.byteLength !== buf2.byteLength) return false;
  const a = new Uint8Array(buf1), b = new Uint8Array(buf2);
  for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
  return true;
}

// Aperçu cartographique de la surface à reboiser : dessine un polygone qui suit exactement
// l'ordre des points saisis par l'organisation (et non une enveloppe convexe), avec une
// étiquette "S = x ha / m²" centrée sur la surface colorée.
export function ZoneReboisementMap({ points, superficieAffichee, hauteur = 210 }) {
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
