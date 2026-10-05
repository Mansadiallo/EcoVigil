import { useEffect, useState } from "react";
import { IconAlert, IconCloudRain, IconDroplet, IconFish, IconFlame, IconFlask, IconGlassWater, IconGlobe, IconHome, IconLayers, IconPaw, IconPick, IconSprout, IconSun, IconTrash, IconTree, IconWaves, IconWind } from "../components/icons.jsx";
import { supabase } from "./supabase.js";
import { langCourante, t } from "./i18n.js";
import { envIcon } from "../screens/Accueil.jsx";

export const CATEGORIES = [
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
export let ENV_PROBLEMES_INDEX = {};

export let ENV_DEFI_PAR_CODE = {}; // code de problème -> nom du défi parent (fr), pour la ventilation par défi

let envTaxonomieChargee = false;

export async function chargerTaxonomiePubliee() {
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
// Le libellé renvoyé suit la langue active (les écrans qui lisent categorieMeta(id).label sont donc traduits sans modification).
export function categorieMeta(id) {
  const L = langCourante();
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return { ...cat, label: categorieLabel(L, id) };
  const p = ENV_PROBLEMES_INDEX[id];
  if (p) return { id, label: categorieLabel(L, id), icon: envIcon(p.icone) };
  return { id, label: id, icon: IconAlert };
}

export function categorieLabel(lang, id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return (CATEGORIES_LABELS[lang] && CATEGORIES_LABELS[lang][id]) || cat.label;
  const p = ENV_PROBLEMES_INDEX[id];
  if (p && p.nom) return p.nom[lang] || p.nom.fr || id;
  return id;
}

export function urgenceLabel(lang, id) {
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

// Contenu multilingue stocké en base sous la forme { fr, en, pt, ... } : on prend la langue active,
// et à défaut le français.
export function champTexte(champ, lang) { const L = lang || langCourante(); return (champ && (champ[L] || champ.fr)) || ""; }

function champListe(champ, lang) { const L = lang || langCourante(); return ((champ && (champ[L] || champ.fr)) || []).join(", "); }

export function FicheEnvironnementale({ code, lang }) {
  const L = lang || langCourante();
  const [fiche, setFiche] = useState(undefined); // undefined = pas chargé, null = rien de publié pour ce code
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => { if (ouvert && fiche === undefined) chargerFicheComplete(code).then(setFiche); }, [ouvert]);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOuvert(o => !o)} style={{ fontSize: 10.5, color: "var(--c-accent-dark)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}>
        {ouvert ? "▾" : "▸"} {t(L, "fiche_titre")}
      </button>
      {ouvert && fiche === undefined && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>{t(L, "fiche_chargement")}</div>}
      {ouvert && fiche === null && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>{t(L, "fiche_aucune")}</div>}
      {ouvert && fiche && (
        <div style={{ fontSize: 11, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", borderRadius: 8, padding: 8, marginTop: 4, lineHeight: 1.6 }}>
          {fiche.defi && <div><b>{t(L, "fiche_defi")} :</b> {champTexte(fiche.defi.nom, L)}</div>}
          {champListe(fiche.probleme.causes_presumees, L) && <div><b>{t(L, "fiche_causes")} :</b> {champListe(fiche.probleme.causes_presumees, L)}</div>}
          {champListe(fiche.probleme.impacts, L) && <div><b>{t(L, "fiche_impacts")} :</b> {champListe(fiche.probleme.impacts, L)}</div>}
          {champTexte(fiche.probleme.action_recommandee, L) && <div><b>{t(L, "fiche_action")} :</b> {champTexte(fiche.probleme.action_recommandee, L)}</div>}
          {champListe(fiche.probleme.indicateurs, L) && <div><b>{t(L, "fiche_indicateurs")} :</b> {champListe(fiche.probleme.indicateurs, L)}</div>}
          {champTexte(fiche.probleme.resultat_attendu, L) && <div><b>{t(L, "fiche_resultat")} :</b> {champTexte(fiche.probleme.resultat_attendu, L)}</div>}
        </div>
      )}
    </div>
  );
}

export const URGENCE = [
  { id: "faible", label: "Faible", color: "#4A8B6F" },
  { id: "moyenne", label: "Moyenne", color: "#E3A73B" },
  { id: "haute", label: "Haute", color: "#B5451B" },
];

export function uid() { return Math.random().toString(36).slice(2, 10); }
