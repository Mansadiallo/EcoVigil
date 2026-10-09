import { useEffect, useState } from "react";
import { IconLock } from "../components/icons.jsx";
import { toCSV } from "../components/media.jsx";
import { StatCard } from "../components/ui.jsx";
import { logAudit } from "../lib/audit.js";
import { ENV_DEFI_PAR_CODE, categorieMeta, chargerTaxonomiePubliee, urgenceLabel } from "../lib/categories.jsx";
import { downloadCSV, exportExcel, exportPDF, exportRapportPDF, exportRapportWord, exportWord } from "../lib/exports.js";
import { supabase } from "../lib/supabase.js";
import { calculerPriorite } from "../lib/utils.js";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

// ---- Fiche environnementale (même contenu que sous chaque signalement dans l'application) ----
// Les textes de la taxonomie sont des objets par langue ({ fr: ... }) ; le rapport est en français,
// avec repli sur la première langue disponible.
const texteFiche = (v) => {
  if (v == null) return "";
  const x = (typeof v === "object" && !Array.isArray(v)) ? (v.fr !== undefined ? v.fr : Object.values(v)[0]) : v;
  return Array.isArray(x) ? x.join(", ") : (x == null ? "" : String(x));
};

export const COLONNES_FICHE = [
  { key: "details", label: "Détails spécifiques au problème" },
  { key: "fiche_defi", label: "Fiche — Défi" },
  { key: "fiche_causes", label: "Fiche — Causes probables" },
  { key: "fiche_impacts", label: "Fiche — Impacts" },
  { key: "fiche_action", label: "Fiche — Action recommandée" },
  { key: "fiche_indicateurs", label: "Fiche — Indicateurs" },
  { key: "fiche_resultat", label: "Fiche — Résultat attendu" },
];

// Charge les fiches publiées, indexées par code de problème.
export async function chargerFichesEnv() {
  await chargerTaxonomiePubliee(); // pour afficher le nom lisible des catégories dans le rapport
  const [{ data: problemes }, { data: defis }] = await Promise.all([
    supabase.from("env_problemes").select("code, defi_id, causes_presumees, impacts, action_recommandee, indicateurs, resultat_attendu, champs_collecte").eq("statut", "publie"),
    supabase.from("env_defis").select("id, nom").eq("statut", "publie"),
  ]);
  const nomDefi = {};
  (defis || []).forEach(d => { nomDefi[d.id] = texteFiche(d.nom); });
  const fiches = {};
  (problemes || []).forEach(p => {
    fiches[p.code] = {
      fiche_defi: nomDefi[p.defi_id] || "",
      fiche_causes: texteFiche(p.causes_presumees),
      fiche_impacts: texteFiche(p.impacts),
      fiche_action: texteFiche(p.action_recommandee),
      fiche_indicateurs: texteFiche(p.indicateurs),
      fiche_resultat: texteFiche(p.resultat_attendu),
      // Champs de collecte propres à ce problème : clé -> libellé (les champs photo/fichier sont ignorés).
      _champs: (Array.isArray(p.champs_collecte) ? p.champs_collecte : []).filter(c => c && c.cle),
    };
  });
  return fiches;
}

const STATUT_LABELS = { attente: "En attente", resolu: "Résolu" };
const libelleStatut = (st) => STATUT_LABELS[st] || (st ? String(st).replace(/_/g, " ").replace(/^./, m => m.toUpperCase()) : "");

// Détails saisis pour CE problème (donnees_collecte), présentés avec les libellés du formulaire de
// signalement correspondant : « Aspect de l'eau : Trouble ». Renvoie une liste de « libellé : valeur ».
function detailsSpecifiques(donnees, champs) {
  if (!donnees || typeof donnees !== "object") return [];
  const parCle = {}; champs.forEach(c => { parCle[c.cle] = c; });
  return Object.entries(donnees).map(([cle, valeur]) => {
    const def = parCle[cle];
    if (def && ["photo", "fichier", "video", "audio"].includes(def.type)) return null;
    if (valeur == null || valeur === "" || (Array.isArray(valeur) && valeur.length === 0)) return null;
    const lib = def ? texteFiche(def.label) : cle.replace(/_/g, " ").replace(/^./, m => m.toUpperCase());
    const val = Array.isArray(valeur) ? valeur.join(", ") : (typeof valeur === "object" ? JSON.stringify(valeur) : String(valeur));
    if (!def && /^(preuves?|photos?)$/i.test(cle)) return null;
    return `${lib} : ${val}`;
  }).filter(Boolean);
}

const dateFr = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "";

// Prépare les lignes d'un rapport de signalements : fiche environnementale, détails du problème et,
// surtout, informations du bénévole responsable — reprises du signalement et, si elles y manquent,
// complétées depuis son profil (par identifiant, sinon par appareil) et le nom de son organisation.
// options.admin : ajoute la priorité calculée et l'identifiant d'appareil (rapport global du Centre).
export async function preparerLignesSignalements(signalements, options = {}) {
  const fiches = await chargerFichesEnv();
  const [{ data: benevoles }, { data: orgs }] = await Promise.all([
    supabase.from("benevoles").select("id, nom, contact, telephone, pays, ville, zone, device_id, organisation_id").eq("is_deleted", false).limit(5000),
    supabase.from("organisations").select("id, nom").eq("is_deleted", false),
  ]);
  const parId = {}, parAppareil = {}, nomOrg = {};
  (benevoles || []).forEach(b => { parId[b.id] = b; if (b.device_id) parAppareil[b.device_id] = b; });
  (orgs || []).forEach(o => { nomOrg[o.id] = o.nom; });
  return (signalements || []).map(s => {
    const { _champs = [], ...fiche } = fiches[s.categorie] || {};
    const b = parId[s.benevole_id] || parAppareil[s.device_id] || {};
    const details = detailsSpecifiques(s.donnees_collecte, _champs);
    const nom = s.benevole_nom || b.nom || "";
    return {
      ...s, ...fiche,
      id: s.id,
      date: s.created_at ? new Date(s.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "",
      categorie: categorieMeta(s.categorie).label,
      defi: ENV_DEFI_PAR_CODE[s.categorie] || "Non classé",
      urgence_label: s.urgence ? urgenceLabel("fr", s.urgence) : "",
      statut_label: libelleStatut(s.statut),
      priorite: options.admin ? String(calculerPriorite(s, signalements)) : "",
      gps: s.lat != null && s.lng != null ? `${Number(s.lat).toFixed(5)}, ${Number(s.lng).toFixed(5)}` : "",
      details: details.join(" ; "), details_lignes: details.join("\n"),
      benevole_nom: nom || "Non renseigné (signalement citoyen, aucun bénévole associé)",
      benevole_contact: s.benevole_contact || b.contact || "",
      benevole_telephone: b.telephone || "",
      benevole_organisation: b.organisation_id ? (nomOrg[b.organisation_id] || "") : "",
      benevole_pays: s.benevole_pays || b.pays || "",
      benevole_ville: s.benevole_ville || b.ville || "",
      benevole_quartier: s.benevole_quartier || b.zone || "",
      resolved_at_label: dateFr(s.resolved_at),
    };
  });
}

// Colonnes du rapport (formats tableau : CSV / Excel).
export function colonnesSignalements(admin = false) {
  return [
    { key: "id", label: "ID" }, { key: "date", label: "Date" }, { key: "categorie", label: "Catégorie" }, { key: "defi", label: "Défi" },
    { key: "urgence_label", label: "Urgence" }, ...(admin ? [{ key: "priorite", label: "Priorité" }] : []),
    { key: "statut_label", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" },
    ...COLONNES_FICHE,
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_telephone", label: "Bénévole — Téléphone" }, { key: "benevole_organisation", label: "Bénévole — Organisation" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" }, { key: "benevole_quartier", label: "Bénévole — Quartier" },
    { key: "resolution_organisme", label: "Résolution — Organisme" }, { key: "resolution_action", label: "Résolution — Action" }, { key: "resolved_at_label", label: "Résolution — Date" },
    ...(admin ? [{ key: "device_id", label: "Appareil" }] : []),
  ];
}

// Rubriques du rapport narratif (Word / PDF) : une fiche par signalement.
const SECTIONS_SIGNALEMENT = [
  { titre: "Signalement", champs: [["id", "Identifiant"], ["date", "Date du signalement"], ["statut_label", "Statut"], ["urgence_label", "Urgence"], ["priorite", "Priorité"], ["categorie", "Catégorie"], ["defi", "Défi environnemental"], ["description", "Description"], ["gps", "Coordonnées GPS"]] },
  { titre: "Détails spécifiques au problème", champs: [["details_lignes", "Informations recueillies"]] },
  { titre: "Fiche environnementale", champs: [["fiche_causes", "Causes probables"], ["fiche_impacts", "Impacts"], ["fiche_action", "Action recommandée"], ["fiche_indicateurs", "Indicateurs"], ["fiche_resultat", "Résultat attendu"]] },
  { titre: "Bénévole responsable du signalement", champs: [["benevole_nom", "Nom"], ["benevole_organisation", "Organisation"], ["benevole_contact", "Contact"], ["benevole_telephone", "Téléphone"], ["benevole_pays", "Pays"], ["benevole_ville", "Ville"], ["benevole_quartier", "Quartier"]] },
  { titre: "Résolution", champs: [["resolution_organisme", "Organisme"], ["resolution_action", "Action menée"], ["resolved_at_label", "Date de résolution"]] },
];

function compter(rows, cle, vide) {
  const m = {};
  rows.forEach(r => { const k = r[cle] || vide; m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

// Bloc de synthèse : total, répartition par statut, urgence et défi.
export function syntheseSignalements(rows) {
  return [
    { titre: "Total", lignes: [["Signalements", rows.length]] },
    { titre: "Par statut", lignes: compter(rows, "statut_label", "Non défini") },
    { titre: "Par urgence", lignes: compter(rows, "urgence_label", "Non définie") },
    { titre: "Par défi environnemental", lignes: compter(rows, "defi", "Non classé").slice(0, 8) },
  ];
}

// Paramètres passés à ExportRow (prop `rapport`) pour la mise en page professionnelle.
export function rapportSignalements(sousTitre) {
  return {
    sections: SECTIONS_SIGNALEMENT,
    sousTitre,
    synthese: syntheseSignalements,
    titreCarte: (r) => r.categorie || "Signalement",
    metaCarte: (r) => [r.date, r.urgence_label ? `Urgence ${r.urgence_label.toLowerCase()}` : "", r.statut_label].filter(Boolean).join(" · "),
  };
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
      <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text)", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "100%", background: color, borderRadius: 3, height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.week === 0 ? 1 : 0.65 }} title={`${d.count}`} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: T.meta, color: "var(--c-text-muted)" }}>{d.week === 0 ? "cette sem." : `-${d.week}`}</div>
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
      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Répartition par défi environnemental</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(([nom, count]) => (
          <div key={nom}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 3 }}>
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

const optionsRapport = (rapport, rows) => ({ sousTitre: rapport.sousTitre, synthese: rapport.synthese(rows), titreCarte: rapport.titreCarte, metaCarte: rapport.metaCarte });

export function ExportRow({ label, count, getRows, columns, filenamePrefix, title, choixFormat = false, rapport = null }) {
  const [busy, setBusy] = useState(null);
  const [mode, setMode] = useState("tableau"); // si choixFormat : "tableau" (CSV, Excel) ou "narratif" (Word, PDF)
  const tousFormats = [
    { id: "csv", label: "CSV", mode: "tableau" },
    { id: "xlsx", label: "Excel", mode: "tableau" },
    { id: "doc", label: "Word", mode: "narratif" },
    { id: "pdf", label: "PDF", mode: "narratif" },
  ];
  const formats = choixFormat ? tousFormats.filter(f => f.mode === mode) : tousFormats;
  async function lancer(format) {
    setBusy(format);
    try {
      const rows = await getRows();
      const base = `${filenamePrefix}-${Date.now()}`;
      if (format === "csv") downloadCSV(`${base}.csv`, toCSV(rows, columns));
      else if (format === "xlsx") exportExcel(`${base}.xlsx`, rows, columns, title, rapport ? { synthese: rapport.synthese(rows) } : undefined);
      else if (format === "doc") { if (rapport) exportRapportWord(`${base}.doc`, title, rows, rapport.sections, optionsRapport(rapport, rows)); else exportWord(`${base}.doc`, title, rows, columns); }
      else if (format === "pdf") { if (rapport) exportRapportPDF(`${base}.pdf`, title, rows, rapport.sections, optionsRapport(rapport, rows)); else exportPDF(`${base}.pdf`, title, rows, columns); }
    } catch (e) {
      alert("Échec de l'export : " + (e && e.message ? e.message : "erreur inconnue"));
    } finally { setBusy(null); }
  }
  return (
    <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{label} ({count})</div>
      {choixFormat && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {[["tableau", "Format tableau"], ["narratif", "Format narratif"]].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setMode(v)} style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontWeight: 600, fontSize: T.meta, cursor: "pointer",
              border: `1px solid ${mode === v ? "var(--c-accent-dark)" : "var(--c-border)"}`,
              background: mode === v ? "var(--c-accent-dark)" : "var(--c-surface)", color: mode === v ? "#fff" : "var(--c-text-secondary)" }}>{l}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        {formats.map(f => (
          <button key={f.id} onClick={() => lancer(f.id)} disabled={busy !== null} style={{
            flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--c-border)",
            background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.meta,
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

  const colonnes = colonnesSignalements(false);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Rapports par organisation</div>
      <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10 }}>
        Même rapport (signalements de son domaine) que celui que l'organisation exporte depuis son propre espace.
      </div>
      <select value={orgId} onChange={e => chargerRapport(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 10, background: "var(--c-surface)" }}>
        <option value="">Sélectionner une organisation…</option>
        {(organisations || []).map(o => (
          <option key={o.id} value={o.id}>{o.nom} ({o.type === "gouvernement" ? "Gouvernement" : "ONG"}{o.statut !== "valide" ? " — non validée" : ""})</option>
        ))}
      </select>
      {chargement && <div style={{ fontSize: T.small, color: "var(--c-text-muted)", textAlign: "center", padding: 10 }}>Chargement…</div>}
      {rapport && (
        <ExportRow
          choixFormat
          label={`Signalements du domaine de ${rapport.org.nom}`}
          count={rapport.rows.length}
          columns={colonnes}
          filenamePrefix={`pace-${rapport.org.type}-${(rapport.org.nom || "org").replace(/\s+/g, "-")}`}
          title={`Rapport ${rapport.org.nom}`}
          rapport={rapportSignalements(rapport.org.nom)}
          getRows={() => preparerLignesSignalements(rapport.rows)}
        />
      )}
    </div>
  );
}

export function AdminRapports({ signalements, arbres, isSuperAdmin, centreVerrouille, onToggleCentre }) {
  const [benevolesCount, setBenevolesCount] = useState(null);

  useEffect(() => {
    supabase.from("benevoles").select("id", { count: "exact", head: true }).eq("is_deleted", false).then(({ count }) => setBenevolesCount(count));
  }, []);

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

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Évolution (8 dernières semaines)</div>
      <MiniBarChart data={weeklyBuckets(signalements)} color="#B5451B" label="Signalements" />
      <MiniBarChart data={weeklyBuckets(arbres)} color="var(--c-accent)" label="Arbres plantés" />

      <RepartitionParDefi signalements={signalements} />

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Exporter le rapport</div>
      <ExportRow choixFormat label="Signalements" count={signalements.length} columns={colonnesSignalements(true)} rapport={rapportSignalements("Centre d'EcoVigil — tous les signalements")} filenamePrefix="pace-signalements" title="Rapport EcoVigil — Signalements"
        getRows={() => preparerLignesSignalements(signalements, { admin: true })} />
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
            <div style={{ fontWeight: 700, fontSize: T.body, color: centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-text)" }}>
              Centre {centreVerrouille && centreVerrouille.verrouille ? "verrouillé" : "déverrouillé"}
            </div>
          </div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
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
            padding: "9px 14px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: T.body, cursor: "pointer",
            background: centreVerrouille && centreVerrouille.verrouille ? "var(--c-accent-dark)" : "#B5451B", color: "#fff"
          }}>
            {centreVerrouille && centreVerrouille.verrouille ? "Déverrouiller" : "Verrouiller le Centre d'EcoVigil"}
          </button>
        </div>
      )}
      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Équipe administrateurs</div>
      <form onSubmit={addAdmin} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com"
          style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
        <button type="button" onClick={addAdmin} disabled={busy} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          {busy ? "..." : "Ajouter"}
        </button>
      </form>
      {msg && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>{msg}</div>}
      <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8 }}>La personne devra créer son compte via "Centre d'EcoVigil → Créer un compte" avec cette adresse exacte.</div>
      {admins === null ? <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Chargement…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {admins.map(a => (
            <div key={a.email} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: T.body, color: "var(--c-text)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</span>
                <span style={{ fontSize: T.meta, fontWeight: 700, padding: "2px 7px", borderRadius: 999, flexShrink: 0, background: a.role === "super_admin" ? "var(--c-accent-dark)" : "var(--c-surface-soft)", color: a.role === "super_admin" ? "#fff" : "var(--c-text-muted)" }}>
                  {a.role === "super_admin" ? "Super admin" : "Admin"}
                </span>
              </div>
              {isSuperAdmin && a.role !== "super_admin" && (
                <button onClick={() => retirerAdmin(a)} style={{ flexShrink: 0, fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Retirer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
