import React, { useEffect, useRef, useState } from "react";
import { IconAlert, IconCamera, IconClock, IconCloudDownload, IconCloudRain, IconDownload, IconDroplet, IconEdit, IconFlame, IconGauge, IconGlobe, IconLayers, IconMapPin, IconMaximize, IconMinimize, IconPick, IconPlay, IconRoute, IconSearch, IconShield, IconSprout, IconSquareStop, IconSun, IconTarget, IconTrash, IconTree, IconTrendingUp, IconWaves, IconWifi, IconWifiOff, IconWind, IconX } from "../components/icons.jsx";
import { MediaThumb, escapeHtml, mediaHtml, toCSV } from "../components/media.jsx";
import { Screen, SectionTitle, StatCard } from "../components/ui.jsx";
import { ENQ_NIVEAUX, ENQ_NIVEAU_COULEUR, nomTypeEnqueteCarte } from "../enquetes/EnquetesTerrain.jsx";
import { AFRICA_CENTER, ORIGINE_COULEURS, ORIGINE_LABELS, SENTINEL2_ATTRIBUTION, SENTINEL2_MOSAIC_YEARS, SENTINEL2_ZOOM_NATIF_MAX, chargerTuileBrute, clearCachedTiles, coucheDeCategorie, countCachedTiles, creerCoucheTuilesHorsLigne, formatCap, formatVitesse, getCachedTile, gpsQualite, markerHtml, origineSignalement, pointInPolygon, putCachedTile, tilesPourZone, tuilesIdentiques, urlMosaiqueSentinel2 } from "../lib/carteUtils.jsx";
import { CATEGORIES, ENV_PROBLEMES_INDEX, URGENCE, categorieLabel, categorieMeta, urgenceLabel } from "../lib/categories.jsx";
import { downloadCSV } from "../lib/exports.js";
import { t } from "../lib/i18n.js";
import { DEVICE_ID, supabase } from "../lib/supabase.js";
import { formatCoordonnees } from "../lib/utils.js";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

export function Carte({ signalements, arbres, observations, enquetesCarte, onAddSignalement, onAddArbre, onAddObservation, onSupprimerArbre, online, pendingQueueCount, onFlushQueue, lang, coordFormat }) {
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
  // Suppression d'un arbre par un bénévole validé (onSupprimerArbre n'est fourni que pour eux).
  // État porté par Carte (et non par DetailCard, recréé à chaque rendu) pour ne pas être perdu.
  const [suppArbre, setSuppArbre] = useState(null); // null | { motif, busy, erreur }
  useEffect(() => { setSuppArbre(null); }, [selected]);
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
        const pendingHtml = !a.valide ? `<div style="font-size:12px;color:#B5451B;margin-top:4px">⏳ ${t(lang, "en_attente_validation")}</div>` : "";
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
        const pendingHtml = !s.valide ? `<div style="font-size:12px;color:#B5451B;margin-top:4px">⏳ ${t(lang, "en_attente_validation")}</div>` : "";
        const origineHtml = origine !== "citoyen" ? `<div style="font-size:12px;color:${ORIGINE_COULEURS[origine]};font-weight:600;margin-top:2px">${ORIGINE_LABELS[origine]}</div>` : "";
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

  async function confirmerSuppressionArbre(arbre) {
    if (!suppArbre || !suppArbre.motif || suppArbre.busy || !onSupprimerArbre) return;
    setSuppArbre(prev => ({ ...prev, busy: true, erreur: "" }));
    try {
      await onSupprimerArbre(arbre, suppArbre.motif);
      setSuppArbre(null);
      setSelected(null);
    } catch (e) {
      setSuppArbre(prev => ({ ...prev, busy: false, erreur: "Suppression refusée. Vérifie ta connexion et que tu es bien connecté avec ton compte bénévole." }));
    }
  }

  function DetailCard({ s }) {
    if (s.type === "signalement") {
      return (
        <>
          <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: T.body }}>{categorieLabel(lang, s.data.categorie)}</div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 3 }}>{s.data.date}{s.data.statut ? ` · ${s.data.statut}` : ""}</div>
          <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginTop: 6 }}>{s.data.description || t(lang, "aucune_description")}</div>
        </>
      );
    }
    if (s.type === "enquete") {
      const niveauT = ENQ_NIVEAUX.find(n => n[0] === s.data.niveau_constat) || [];
      const color = ENQ_NIVEAU_COULEUR[s.data.niveau_constat] || "#6B7A8F";
      return (
        <>
          <div style={{ fontWeight: 600, fontSize: T.body }}>{s.data.titre}</div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 3 }}>{nomTypeEnqueteCarte(s.data.categorie)} · {s.data.numero}</div>
          <div style={{ fontSize: T.body, fontWeight: 600, color, marginTop: 6 }}>{niveauT[1] || ""}</div>
          {niveauT[2] && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 4 }}>{niveauT[2]}</div>}
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 6 }}>Enquête {s.data.statut === "verifiee" ? "vérifiée" : "terminée"} le {new Date(s.data.updated_at).toLocaleDateString("fr-FR")}</div>
        </>
      );
    }
    if (s.type === "observation") {
      return (
        <>
          <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: T.body }}>{s.data.espece || t(lang, "observation_biodiversite")}</div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 3 }}>{new Date(s.data.created_at).toLocaleDateString("fr-FR")}</div>
          <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginTop: 6 }}>{s.data.description || t(lang, "aucune_description")}</div>
        </>
      );
    }
    return (
      <>
        <MediaThumb src={s.data.photo_url} style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
        <div style={{ fontWeight: 600, fontSize: T.body }}>{s.data.nom}</div>
        <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 3 }}>{t(lang, "plante_le")}{s.data.date}</div>
        {onSupprimerArbre && s.type === "arbre" && !s.data._pending && !s.data.organisation_id && (
          !suppArbre ? (
            <button onClick={() => setSuppArbre({ motif: "", busy: false, erreur: "" })} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
              <IconTrash size={14} /> Supprimer cet arbre
            </button>
          ) : (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border-soft)" }}>
              <div style={{ fontSize: T.small, fontWeight: 600, marginBottom: 6 }}>Pourquoi supprimer cet arbre ?</div>
              {[["mal_enregistre", "Mal enregistré (faux arbre, doublon, espèce incorrecte)"], ["mal_geolocalise", "Mal géolocalisé (position incorrecte)"]].map(([id, label]) => (
                <button key={id} onClick={() => setSuppArbre(prev => ({ ...prev, motif: id, erreur: "" }))} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6, padding: "8px 10px", borderRadius: 8, border: suppArbre.motif === id ? "2px solid #B5451B" : "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: T.small, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
              {suppArbre.erreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 6 }}>{suppArbre.erreur}</div>}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSuppArbre(null)} disabled={suppArbre.busy} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>Annuler</button>
                <button onClick={() => confirmerSuppressionArbre(s.data)} disabled={!suppArbre.motif || suppArbre.busy} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: (!suppArbre.motif || suppArbre.busy) ? "var(--c-text-faint)" : "#B5451B", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: (!suppArbre.motif || suppArbre.busy) ? "default" : "pointer" }}>
                  {suppArbre.busy ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )
        )}
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: T.small }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 20, background: online ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)", color: online ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {online ? <IconWifi size={12} /> : <IconWifiOff size={12} />} {online ? t(lang, "en_ligne") : t(lang, "hors_ligne")}
        </span>
        {pendingQueueCount > 0 && (
          <button onClick={() => onFlushQueue && onFlushQueue()} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 20, border: "none", background: "var(--c-warning)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
            <IconCloudDownload size={12} /> {pendingQueueCount} {t(lang, "en_attente_synchro")}
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => showLayers ? setShowLayers(false) : ouvrirPanneau(setShowLayers)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showLayers ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showLayers ? "var(--c-accent-dark)" : "var(--c-surface)", color: showLayers ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconLayers size={14} /> {t(lang, "couches_btn")} {!aucuneCoucheActive && `(${Object.values(layersOn).filter(Boolean).length})`}
        </button>
        <button onClick={() => showFilters ? setShowFilters(false) : ouvrirPanneau(setShowFilters)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: filtresActifs ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: filtresActifs ? "var(--c-accent-dark)" : "var(--c-surface)", color: filtresActifs ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconTarget size={14} /> {t(lang, "filtres_btn")} {filtresActifs && "●"}
        </button>
        <button onClick={() => showTools ? setShowTools(false) : ouvrirPanneau(setShowTools)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showTools ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showTools ? "var(--c-accent-dark)" : "var(--c-surface)", color: showTools ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconEdit size={14} /> {t(lang, "outils_btn")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => addMode ? annulerAjout() : ouvrirPanneau(() => setAddMode(true))} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: addMode ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: addMode ? "var(--c-accent-dark)" : "var(--c-surface)", color: addMode ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconMapPin size={14} /> {t(lang, "ajouter_btn")}
        </button>
        <button onClick={() => showSearch ? setShowSearch(false) : ouvrirPanneau(setShowSearch)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showSearch ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showSearch ? "var(--c-accent-dark)" : "var(--c-surface)", color: showSearch ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconSearch size={14} /> {t(lang, "rechercher_btn")}
        </button>
        <button onClick={() => showOffline ? setShowOffline(false) : ouvrirPanneau(setShowOffline)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showOffline ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showOffline ? "var(--c-accent-dark)" : "var(--c-surface)", color: showOffline ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconCloudDownload size={14} /> {t(lang, "hors_ligne")}
        </button>
        <button onClick={() => showComparaison ? setShowComparaison(false) : ouvrirPanneau(setShowComparaison)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: (showComparaison || compareActif) ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: (showComparaison || compareActif) ? "var(--c-accent-dark)" : "var(--c-surface)", color: (showComparaison || compareActif) ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }} title="Comparaison satellite Sentinel-2">
          <IconTrendingUp size={14} /> Évolution
        </button>
        <button onClick={() => showParcoursPanel ? setShowParcoursPanel(false) : ouvrirPanneau(setShowParcoursPanel)} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10,
          border: showParcoursPanel ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
          background: showParcoursPanel ? "var(--c-accent-dark)" : "var(--c-surface)", color: showParcoursPanel ? "#fff" : "var(--c-text)",
          fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          <IconRoute size={14} /> {t(lang, "parcours_btn")}
        </button>
      </div>

      {addMode && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-accent-dark)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          {!addPoint && (
            <div style={{ fontSize: T.small, color: "var(--c-text-secondary)" }}>{t(lang, "toucher_carte_ajouter")}</div>
          )}
          {addPoint && !addType && (
            <>
              <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>
                {t(lang, "point_choisi_prefix")}{addPoint[0].toFixed(5)}, {addPoint[1].toFixed(5)}{t(lang, "point_choisi_suffix")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button onClick={() => setAddType("signalement")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>🚩 {t(lang, "type_signalement")}</button>
                <button onClick={() => setAddType("arbre")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>🌳 {t(lang, "type_arbre")}</button>
                <button onClick={() => setAddType("observation")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>🦋 {t(lang, "type_observation")}</button>
                <button onClick={() => setAddType("zone")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>⬠ {t(lang, "type_zone")}</button>
              </div>
            </>
          )}
          {addPoint && addType === "signalement" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select value={fCategorie} onChange={e => setFCategorie(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {[...CATEGORIES, ...Object.keys(ENV_PROBLEMES_INDEX).filter(code => !CATEGORIES.some(c => c.id === code)).map(code => ({ id: code }))].map(c => <option key={c.id} value={c.id}>{categorieLabel(lang, c.id)}</option>)}
              </select>
              <select value={fUrgence} onChange={e => setFUrgence(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {URGENCE.map(u => <option key={u.id} value={u.id}>{urgenceLabel(lang, u.id)}</option>)}
              </select>
              <textarea value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder={t(lang, "description_optionnel")} rows={2} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)", resize: "vertical" }} />
            </div>
          )}
          {addPoint && addType === "arbre" && (
            <input value={fNom} onChange={e => setFNom(e.target.value)} placeholder={t(lang, "essence_nom_arbre")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }} />
          )}
          {addPoint && addType === "observation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={fEspece} onChange={e => setFEspece(e.target.value)} placeholder={t(lang, "espece_observee_placeholder")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }} />
              <textarea value={fDescription} onChange={e => setFDescription(e.target.value)} placeholder={t(lang, "description_optionnel")} rows={2} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)", resize: "vertical" }} />
            </div>
          )}
          {addPoint && addType === "zone" && (
            <input value={fZoneNom} onChange={e => setFZoneNom(e.target.value)} placeholder={t(lang, "nom_zone_placeholder")} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }} />
          )}
          {addPoint && addType && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => setAddType(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>{t(lang, "retour_btn")}</button>
              <button onClick={validerAjout} disabled={addSaving} style={{ flex: 2, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: T.small, fontWeight: 600, cursor: addSaving ? "default" : "pointer", opacity: addSaving ? 0.7 : 1 }}>{addSaving ? t(lang, "enregistrement_encours") : t(lang, "enregistrer")}</button>
            </div>
          )}
          <button onClick={annulerAjout} style={{ marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: T.meta, cursor: "pointer" }}>{t(lang, "annuler_ajout")}</button>
        </div>
      )}

      {showSearch && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t(lang, "rechercher_placeholder")} style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)", marginBottom: 8 }} autoFocus />
          {searchLocalResults.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-muted)", margin: "4px 0" }}>{t(lang, "donnees_pace")}</div>
              {searchLocalResults.map((r, i) => (
                <div key={i} onClick={() => allerVers(r.lat, r.lng)} style={{ padding: "7px 4px", fontSize: T.body, color: "var(--c-text)", cursor: "pointer", borderBottom: "1px solid var(--c-border)" }}>{r.label} <span style={{ color: "var(--c-text-muted)", fontSize: T.meta }}>· {r.sub}</span></div>
              ))}
            </div>
          )}
          {searchPlaceResults.length > 0 && (
            <div>
              <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-muted)", margin: "4px 0" }}>{t(lang, "lieux_osm")}</div>
              {searchPlaceResults.map((r, i) => (
                <div key={i} onClick={() => allerVers(r.lat, r.lng, 14)} style={{ padding: "7px 4px", fontSize: T.body, color: "var(--c-text)", cursor: "pointer", borderBottom: "1px solid var(--c-border)" }}>{r.label}</div>
              ))}
            </div>
          )}
          {searchLoading && <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>{t(lang, "recherche_encours")}</div>}
          {!searchLoading && searchQuery.trim().length >= 2 && searchLocalResults.length === 0 && searchPlaceResults.length === 0 && (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>{t(lang, "aucun_resultat")}</div>
          )}
        </div>
      )}

      {showOffline && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Carte hors connexion</div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Télécharge la zone actuellement affichée pour pouvoir naviguer, mesurer et collecter des données sans réseau. Les données collectées hors ligne sont conservées et envoyées automatiquement dès que la connexion revient.
          </div>
          <div style={{ fontSize: T.small, marginBottom: 10 }}>{tilesCachedCount} tuile{tilesCachedCount > 1 ? "s" : ""} déjà en cache sur cet appareil.</div>
          {!satellite && (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)", background: "var(--c-bg)", borderRadius: 8, padding: 8, marginBottom: 10, lineHeight: 1.5 }}>
              Le téléchargement hors-ligne n'est disponible que pour le fond satellite pour le moment. Passe en vue satellite pour pré-télécharger cette zone.
            </div>
          )}
          {offlineDownloading ? (
            <>
              <div style={{ height: 8, borderRadius: 4, background: "var(--c-bg)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${offlineProgress.total ? (offlineProgress.done / offlineProgress.total) * 100 : 0}%`, background: "var(--c-accent-dark)" }} />
              </div>
              <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 8 }}>{offlineProgress.done} / {offlineProgress.total} tuiles téléchargées</div>
              <button onClick={annulerTelechargement} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>Arrêter le téléchargement</button>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={telechargerZoneHorsLigne} disabled={!satellite} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: satellite ? "var(--c-accent-dark)" : "var(--c-border)", color: satellite ? "#fff" : "var(--c-text-faint)", fontSize: T.small, fontWeight: 600, cursor: satellite ? "pointer" : "not-allowed" }}>
                <IconCloudDownload size={14} /> Télécharger cette zone
              </button>
              <button onClick={viderCacheHorsLigne} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>Vider</button>
            </div>
          )}
          {!offlineDownloading && tilesCachedCount > 0 && (
            <button onClick={capturerImageZone} disabled={captureEnCours} style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: captureEnCours ? "default" : "pointer" }}>
              <IconCamera size={14} /> {captureEnCours ? "Génération…" : "Enregistrer une image de cette zone"}
            </button>
          )}
        </div>
      )}

      {showParcoursPanel && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Parcours GPS de terrain</div>
          {parcoursRecording ? (
            <>
              <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 8 }}>⏺ Enregistrement… {formatDuree(parcoursElapsed)} · {parcoursPoints.length} points</div>
              <button onClick={() => arreterParcours(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>
                <IconSquareStop size={13} /> Arrêter et enregistrer
              </button>
            </>
          ) : (
            <button onClick={demarrerParcours} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: T.small, fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
              <IconPlay size={13} /> Démarrer un parcours
            </button>
          )}
          {savedParcours.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-muted)", marginBottom: 6 }}>Parcours enregistrés</div>
              {savedParcours.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--c-border)" }}>
                  <IconRoute size={13} color="var(--c-sky)" />
                  <span style={{ fontSize: T.small, flex: 1 }}>{(p.distance_m / 1000).toFixed(2)} km · {formatDuree(p.duree_s)}</span>
                  <button onClick={() => supprimerParcours(p.id)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer" }}><IconX size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showTools && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Outils d'analyse géographique</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            <button onClick={() => { setCoordMode(!coordMode); setClimatMode(false); setClickedCoord(null); }} style={{ padding: "8px 6px", borderRadius: 8, border: coordMode ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)", background: coordMode ? "var(--c-accent-dark)" : "var(--c-bg)", color: coordMode ? "#fff" : "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>📍 Coordonnées GPS</button>
            <button onClick={() => startDraw("marker")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>📌 Créer un point</button>
            <button onClick={() => startDraw("polyline")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>📏 Mesurer une distance</button>
            <button onClick={() => startDraw("polygon")} style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>⬠ Zone / superficie</button>
          </div>
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
            "Zone / superficie" dessine un polygone : calcule sa surface et analyse automatiquement les données des couches actives à l'intérieur.
          </div>

          {clickedCoord && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, fontSize: T.small, marginBottom: 8 }}>
              Coordonnées : {clickedCoord[0].toFixed(5)}, {clickedCoord[1].toFixed(5)}
            </div>
          )}
          {measureResult && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, fontSize: T.small, marginBottom: 8 }}>
              {measureResult.texte}
            </div>
          )}
          {zoneAnalysis && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ fontSize: T.small, fontWeight: 600, marginBottom: 4 }}>{zoneAnalysis.total} donnée{zoneAnalysis.total > 1 ? "s" : ""} dans la zone</div>
              {Object.entries(zoneAnalysis.parType).map(([t, n]) => (
                <div key={t} style={{ fontSize: T.small, color: "var(--c-text-secondary)" }}>{t} : {n}</div>
              ))}
              {zoneAnalysis.total === 0 && <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Aucune donnée des couches actives dans cette zone.</div>}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {(measureResult || zoneAnalysis || clickedCoord) && (
              <button onClick={clearAnalyse} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>Effacer</button>
            )}
            {zoneAnalysis && zoneAnalysis.total > 0 && (
              <button onClick={exporterAnalyse} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>
                <IconDownload size={13} /> Exporter
              </button>
            )}
          </div>
        </div>
      )}

      {showComparaison && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Comparaison satellite temporelle (Sentinel-2)</div>
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Compare deux mosaïques annuelles Sentinel-2 (Copernicus) sur la zone actuellement affichée — déplacez ou zoomez la carte <b>avant</b> d'activer la comparaison pour choisir la zone, car le déplacement/zoom de la carte est momentanément suspendu pendant que la comparaison est active (le glissement sur l'image sert alors à comparer, pas à déplacer la carte). Fonctionne indépendamment du fond satellite Esri.
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: T.meta, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>Avant</label>
              <select value={compareAnnee1} onChange={e => setCompareAnnee1(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {anneesSentinel.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: T.meta, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>Après</label>
              <select value={compareAnnee2} onChange={e => setCompareAnnee2(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
                {anneesSentinel.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {anneesSentinelVerifiees === null && (
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8 }}>Vérification des mosaïques réellement disponibles…</div>
          )}
          {anneesSentinelVerifiees === false && (
            <div style={{ fontSize: T.meta, color: "var(--c-warning)", marginBottom: 8, lineHeight: 1.4 }}>
              Liste d'années non confirmée par le service (vérification injoignable) : si une année choisie n'existe pas réellement, ce côté restera vide — essayez-en une autre le cas échéant.
            </div>
          )}
          <button onClick={() => { setCompareActif(v => !v); setCompareSwipePos(50); }} style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "none", background: compareActif ? "var(--c-warning)" : "var(--c-accent-dark)", color: "#fff", fontSize: T.body, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
            {compareActif ? "Désactiver la comparaison" : "Activer la comparaison"}
          </button>
          {compareAnnee1 === compareAnnee2 && (
            <div style={{ fontSize: T.meta, color: "var(--c-warning)", marginBottom: 8 }}>Choisissez deux années différentes pour une comparaison utile.</div>
          )}
          {compareActif && (
            <button onClick={lierComparaisonAuSignalement} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>
              <IconMapPin size={13} /> Lier cette observation à un signalement
            </button>
          )}
          <div style={{ fontSize: T.meta, color: "var(--c-text-faint)", marginTop: 8, lineHeight: 1.4 }}>
            Source : Sentinel-2 cloudless, © EOX IT Services GmbH — contient des données Copernicus Sentinel modifiées. Mosaïques annuelles (pas une date de prise de vue exacte). Un changement visible ici n'est pas en soi une preuve d'infraction : à recouper avec une vérification de terrain.
          </div>
        </div>
      )}

      {showLayers && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>{t(lang, "donnees_pace")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {LAYER_DEFS.map(l => (
              <label key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
                <input type="checkbox" checked={layersOn[l.id]} onChange={() => toggleLayer(l.id)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
                <l.icon size={14} color={l.color} />
                <span style={{ fontSize: T.body, color: "var(--c-text)" }}>{t(lang, l.labelKey)}</span>
                <span style={{ marginLeft: "auto", fontSize: T.meta, color: "var(--c-text-muted)" }}>{visibleCount[l.id]}</span>
              </label>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={showZones} onChange={() => setShowZones(!showZones)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconMapPin size={14} color="var(--c-warning)" />
            <span style={{ fontSize: T.body, color: "var(--c-text)" }}>{t(lang, "zones_enregistrees_local")}</span>
            <span style={{ marginLeft: "auto", fontSize: T.meta, color: "var(--c-text-muted)" }}>{zonesLocales.length}</span>
          </label>
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            {t(lang, "projets_suivi_admin")}
          </div>

          <div style={{ height: 1, background: "var(--c-border)", margin: "12px 0" }} />

          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Sources environnementales externes</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={climatMode} onChange={() => { setClimatMode(!climatMode); setCoordMode(false); setClickedCoord(null); }} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconCloudRain size={14} color="var(--c-sky)" />
            <span style={{ fontSize: T.body, color: "var(--c-text)" }}>Climat (Open-Meteo)</span>
            {climatLoading && <span style={{ marginLeft: "auto", fontSize: T.meta, color: "var(--c-text-muted)" }}>…</span>}
          </label>
          {climatMode && (
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", padding: "2px 4px 6px", lineHeight: 1.5 }}>
              Touche n'importe où sur la carte pour voir la météo actuelle à cet endroit.
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={coucheOccupationSol} onChange={() => setCoucheOccupationSol(v => !v)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconGlobe size={14} color="var(--c-accent)" />
            <span style={{ fontSize: T.body, color: "var(--c-text)" }}>Occupation des sols (Esri)</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", cursor: "pointer" }}>
            <input type="checkbox" checked={coucheHydrologie} onChange={() => setCoucheHydrologie(v => !v)} style={{ width: 16, height: 16, accentColor: "var(--c-accent-dark)" }} />
            <IconWaves size={14} color="var(--c-sky)" />
            <span style={{ fontSize: T.body, color: "var(--c-text)" }}>Hydrologie (Esri)</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", opacity: 0.5 }}>
            <IconLayers size={14} color="var(--c-text-muted)" />
            <span style={{ fontSize: T.body, color: "var(--c-text-muted)" }}>Imagerie satellite</span>
            <span style={{ marginLeft: "auto", fontSize: T.meta, fontWeight: 700, color: "var(--c-accent-dark)" }}>via le bouton dédié ↗</span>
          </div>
          {EXTERNAL_LAYERS_NON_CONNECTEES.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 4px", opacity: 0.45 }}>
              <l.icon size={14} color="var(--c-text-muted)" />
              <span style={{ fontSize: T.body, color: "var(--c-text-muted)" }}>{l.label}</span>
              <span style={{ marginLeft: "auto", fontSize: T.meta, fontWeight: 700, color: "var(--c-text-faint)" }}>Non connecté</span>
            </div>
          ))}
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Ces sources ne sont pas encore branchées à une donnée réelle vérifiée — elles apparaissent pour montrer où elles s'intégreront, sans rien afficher de fictif.
          </div>
        </div>
      )}

      {showFilters && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 14, padding: 12, marginBottom: 10 }}>
          <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>{t(lang, "filtres_titre")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">{t(lang, "toutes_categories")}</option>
              {[...CATEGORIES, ...Object.keys(ENV_PROBLEMES_INDEX).filter(code => !CATEGORIES.some(c => c.id === code)).map(code => ({ id: code }))].map(c => <option key={c.id} value={c.id}>{categorieLabel(lang, c.id)}</option>)}
            </select>
            <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">{t(lang, "tous_statuts")}</option>
              <option value="resolu">{t(lang, "resolu")}</option>
              <option value="en_cours">{t(lang, "statut_en_cours")}</option>
              <option value="en_attente">{t(lang, "en_attente")}</option>
            </select>
            <div>
              <label style={{ fontSize: T.meta, color: "var(--c-text-muted)", display: "block", marginBottom: 4 }}>{t(lang, "depuis_le")}</label>
              <input type="date" value={filtreDepuis} onChange={e => setFiltreDepuis(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }} />
            </div>
            {layersOn.enquetes && <select value={filtreGraviteEnquete} onChange={e => setFiltreGraviteEnquete(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-bg)", color: "var(--c-text)" }}>
              <option value="">Enquêtes — toutes gravités</option>
              {ENQ_NIVEAUX.filter(n => n[0] !== "a_determiner").map(([v, l]) => <option key={v} value={v}>Enquêtes — {l}</option>)}
            </select>}
            {filtresActifs && (
              <button onClick={resetFiltres} style={{ padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontSize: T.small, fontWeight: 600, cursor: "pointer" }}>{t(lang, "reinitialiser_filtres")}</button>
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
            fontSize: T.meta, fontWeight: 600, zIndex: 10000, display: "flex", alignItems: "center", gap: 5, maxWidth: "70%" }}>
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
          <div style={{ position: "absolute", top: fullscreen ? 18 : 10, right: fullscreen ? 66 : 56, background: "var(--c-surface)", borderRadius: 12, padding: "10px 12px", fontSize: T.small, color: "var(--c-text)", boxShadow: "0 2px 10px rgba(0,0,0,0.25)", zIndex: 10000, minWidth: 180 }}>
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
                <div style={{ marginTop: 4, color: "var(--c-text-muted)", fontSize: T.meta }}>{new Date(gpsData.timestamp).toLocaleTimeString("fr-FR")}</div>
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
            <div style={{ position: "absolute", top: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 9px", fontSize: T.meta, fontWeight: 600, zIndex: 10000 }}>
              {compareAnnee1}
            </div>
            <div style={{ position: "absolute", top: fullscreen ? 16 : 10, right: fullscreen ? 66 : 56, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 9px", fontSize: T.meta, fontWeight: 600, zIndex: 10000 }}>
              {compareAnnee2}
            </div>
            <div style={{ position: "absolute", bottom: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: (compareErreurAvant || compareErreurApres || compareVerif === "identiques" || compareVerif === "erreur") ? "#B5451B" : compareVerif === "distinctes" ? "rgba(22,101,52,0.85)" : "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: T.meta, fontWeight: 600, zIndex: 10000, textAlign: "center" }}>
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
              <div style={{ position: "absolute", bottom: fullscreen ? 46 : 40, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: T.meta, zIndex: 10000, textAlign: "center" }}>
                Zoom au-delà de la résolution native Sentinel-2 (~10 m/pixel, zoom ≈{SENTINEL2_ZOOM_NATIF_MAX}) : l'image est interpolée pour les deux dates, ce qui peut donner une impression de flou indépendante d'un vrai changement.
              </div>
            )}
          </>
        )}

        {locating && (
          <div style={{ position: "absolute", top: fullscreen ? 18 : 10, left: fullscreen ? 16 : 10, background: "var(--c-surface)", borderRadius: 20, padding: "5px 12px", fontSize: T.small, color: "var(--c-text-secondary)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)", zIndex: 10000 }}>
            {t(lang, "geoloc_en_cours")}
          </div>
        )}

        {locateError && !locating && (
          <div style={{ position: "absolute", bottom: fullscreen ? 16 : 10, left: fullscreen ? 16 : 10, right: fullscreen ? 16 : 10, background: "#B5451B", color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: T.small, boxShadow: "0 2px 8px rgba(0,0,0,0.25)", zIndex: 10000, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1 }}>{locateError}</span>
            <button onClick={() => setLocateError("")} style={{ background: "none", border: "none", color: "#fff", fontSize: T.body, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
          </div>
        )}

        {aucuneCoucheActive && !locating && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--c-surface)", borderRadius: 14, padding: "12px 16px", fontSize: T.small, color: "var(--c-text-secondary)", boxShadow: "0 2px 10px rgba(0,0,0,0.15)", zIndex: 9998, textAlign: "center", maxWidth: 220 }}>
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
          <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: T.small, color: "var(--c-text-secondary)", flexWrap: "wrap" }}>
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

          <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginTop: 18, marginBottom: 10 }}>{t(lang, "tableau_bord_zone")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
            <StatCard label={t(lang, "stat_donnees_affichees")} value={totalVisible} unit="" accent="var(--c-accent-dark)" />
            <StatCard label={t(lang, "layer_arbres")} value={visibleCount.arbres} unit="" accent="var(--c-accent)" />
            <StatCard label={t(lang, "stat_signalements")} value={visibleCount.dechets + visibleCount.pollution + visibleCount.signalements} unit="" accent="#B5451B" />
            <StatCard label={t(lang, "layer_biodiversite")} value={visibleCount.biodiversite} unit="" accent="var(--c-sky)" />
          </div>
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 6, lineHeight: 1.5 }}>
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
