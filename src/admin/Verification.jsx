import { useEffect, useState } from "react";
import { ORG_ADMIN_STATUTS } from "./AdminOrganisations.jsx";
import { DocumentForm, PreuveForm, PreuveItem, acceptBtnStyle, itemCardStyle, miniBtnStyle, primaryBtnStyle, rejectBtnStyle, secondaryBtnStyle, textareaStyle } from "./formulaires.jsx";
import { IconChevronLeft } from "../components/icons.jsx";
import { logAudit } from "../lib/audit.js";
import { champTexte } from "../lib/categories.jsx";
import { supabase } from "../lib/supabase.js";
import { ETAPE_DOSSIER_INFO } from "../screens/Organisation.jsx";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

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

export const VERIF_DOC_TYPES = ["Statuts / enregistrement légal", "Récépissé / agrément officiel", "Pièce d'identité du responsable", "Rapport d'activité", "Attestation de partenariat", "Justificatif financier", "Autre document"];

export const VERIF_PREUVE_TYPES = [
  { id: "photo", label: "Photographie" },
  { id: "video", label: "Vidéo" },
  { id: "rapport", label: "Rapport" },
  { id: "document", label: "Document" },
  { id: "gps", label: "Coordonnées GPS" },
  { id: "temoignage", label: "Témoignage" },
  { id: "validation_externe", label: "Validation externe" },
];

export const VERIF_MOTIFS_REJET = [
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

export async function logVerifHistorique(organisationId, evenement, acteur, detail) {
  try {
    await supabase.from("org_verification_historique").insert({
      organisation_id: organisationId, evenement, acteur, detail: detail || null,
    });
  } catch (e) { /* journal best-effort */ }
}

function VerifBadge({ color, children }) {
  return <span style={{ fontSize: T.meta, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: color, color: "#fff", whiteSpace: "nowrap" }}>{children}</span>;
}


// ------------------------------------------------------------
// Vue liste : toutes les organisations avec leur état de vérification
// ------------------------------------------------------------
export function AdminVerification({ isSuperAdmin, adminEmail }) {
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

  if (organisations === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>;

  const filtered = organisations.filter(o => {
    if (filtre === "toutes") return true;
    if (filtre === "a_traiter") return o.statut_verification === "aucune" || o.statut_verification === "en_reevaluation";
    return o.statut_verification === filtre;
  });

  return (
    <div>
      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 12 }}>
        Vérification interne des <strong>organisations</strong> par l'équipe EcoVigil, sur la base des documents et preuves soumis sur la plateforme. Ce niveau ne constitue pas une certification légale, réglementaire ou institutionnelle. Il ne certifie pas non plus les groupes de terrain de l'organisation, ni ses signalements.
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {[["toutes", "Toutes"], ["a_traiter", "À traiter"], ["active", "Actives"], ["suspendue", "Suspendues"], ["revoquee", "Révoquées"]].map(([id, label]) => (
          <button key={id} onClick={() => setFiltre(id)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: T.small, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: filtre === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: filtre === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: filtre === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 20 }}>Aucune organisation ici.</div>}

      <div className="pace-grid-cards" style={{ gap: 10 }}>
        {filtered.map(o => {
          const niv = verifNiveauInfo(o.niveau_verification);
          const st = VERIF_STATUTS[o.statut_verification] || VERIF_STATUTS.aucune;
          return (
            <button key={o.id} onClick={() => setSelected(o.id)} style={{
              textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-text)" }}>{o.nom}</div>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{o.type === "ong" ? "ONG" : "Gouvernement"} · {[o.ville, o.pays].filter(Boolean).join(", ") || "zone non précisée"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                  <VerifBadge color={niv.color}>{niv.court} · {niv.label}</VerifBadge>
                  <VerifBadge color={st.color}>{st.label}</VerifBadge>
                </div>
              </div>
              <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginTop: 8 }}>Score de confiance : <strong>{o.score_confiance || 0}/100</strong></div>
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

  if (!org) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement du dossier…</div>;

  const niv = verifNiveauInfo(org.niveau_verification);
  const st = VERIF_STATUTS[org.statut_verification] || VERIF_STATUTS.aucune;

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer", marginBottom: 12, padding: 0 }}>
        <IconChevronLeft size={14} /> Toutes les organisations
      </button>

      {/* A — Identité */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          <div>
            <div style={{ ...TITRE_SOUS, fontWeight: 600 }}>{org.nom}</div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{org.type === "ong" ? "ONG" : "Gouvernement"} · {org.email}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
            <VerifBadge color={niv.color}>{niv.court} · {niv.label}</VerifBadge>
            <VerifBadge color={st.color}>{st.label}</VerifBadge>
          </div>
        </div>
        <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", lineHeight: 1.6 }}>
          <div><strong>Zone d'intervention :</strong> {[org.ville, org.pays].filter(Boolean).join(", ") || "non précisée"}</div>
          <div><strong>Domaine(s) :</strong> {(org.defis || []).map(id => defisIndex[id] || id).join(", ") || "aucun"}</div>
          {org.numero_agrement && <div><strong>N° d'agrément / acte légal :</strong> {org.numero_agrement}</div>}
          {org.representant_nom && <div><strong>Représentant légal :</strong> {org.representant_nom}{org.representant_fonction ? ` (${org.representant_fonction})` : ""}</div>}
          {org.adresse_officielle && <div><strong>Adresse officielle :</strong> {org.adresse_officielle}</div>}
          <div><strong>Compte plateforme :</strong> {(ORG_ADMIN_STATUTS[org.statut] || { label: org.statut }).label}</div>
          <div><strong>Étape du dossier d'admission :</strong> {(ETAPE_DOSSIER_INFO[org.etape_dossier] || {}).label || org.etape_dossier}</div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: T.meta, color: "var(--c-text-muted)" }}>
          <span>{groupes.length} groupe(s) de terrain</span>
          <span>{activites.length} activité(s)</span>
          <span>{preuves.filter(p => p.statut === "acceptee").length} preuve(s) acceptée(s)</span>
          <span>{preuves.filter(p => p.statut === "rejetee").length} preuve(s) rejetée(s)</span>
        </div>
        {org.date_verification && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 4 }}>Vérifiée le {new Date(org.date_verification).toLocaleDateString("fr-FR")} · Dernière vérification {org.derniere_verification ? new Date(org.derniere_verification).toLocaleDateString("fr-FR") : "—"} · Prochaine réévaluation {org.prochaine_reevaluation ? new Date(org.prochaine_reevaluation).toLocaleDateString("fr-FR") : "—"}</div>}
      </div>

      {/* B — Documents justificatifs */}
      <DossierSection title="Documents justificatifs" count={documents.length} action={<button onClick={() => setShowDocForm(v => !v)} style={miniBtnStyle}>{showDocForm ? "Annuler" : "+ Ajouter"}</button>}>
        {showDocForm && <DocumentForm onSubmit={ajouterDocument} busy={busy} />}
        {documents.length === 0 && <EmptyNote>Aucun document soumis.</EmptyNote>}
        {documents.map(d => (
          <div key={d.id} style={itemCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: T.body }}>{d.type}</div>
                {d.reference && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>Réf. {d.reference}</div>}
                {d.date_document && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>Daté du {new Date(d.date_document).toLocaleDateString("fr-FR")}</div>}
              </div>
              <StatutBadge statut={d.statut} labels={{ a_examiner: "À examiner", accepte: "Accepté", rejete: "Rejeté" }} colors={{ a_examiner: "#E3A73B", accepte: "var(--c-accent-dark)", rejete: "#B5451B" }} />
            </div>
            {d.fichier_url && <a href={d.fichier_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: T.meta, color: "var(--c-accent-dark)" }}>Voir le fichier</a>}
            {d.motif_rejet && <div style={{ fontSize: T.meta, color: "#B5451B", marginTop: 4 }}>Motif : {d.motif_rejet}</div>}
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
            <div style={{ fontWeight: 600, fontSize: T.body }}>{a.titre}</div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>
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
        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
          Un groupe n'est jamais vérifié individuellement : il hérite seulement de l'affichage du niveau de son organisation de rattachement.
        </div>
        {groupes.length === 0 && <EmptyNote>Aucun groupe de terrain rattaché.</EmptyNote>}
        {groupes.map(g => (
          <div key={g.id} style={itemCardStyle}>
            <div style={{ fontWeight: 600, fontSize: T.body }}>{g.nom} <span style={{ fontWeight: 400, color: "var(--c-text-muted)", fontSize: T.meta }}>· {g.code_groupe}</span></div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{g.objectif || "sans objectif déclaré"} · statut : {g.statut}</div>
          </div>
        ))}
      </DossierSection>

      {/* F — Score de confiance & niveau */}
      <DossierSection title="Niveau &amp; score de confiance">
        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
          Le score de confiance de l'organisation ne détermine jamais la fiabilité d'un signalement : chaque signalement garde sa propre vérification.
        </div>
        <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Niveau de vérification</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12 }}>
          {VERIF_NIVEAUX.map(n => (
            <button key={n.id} onClick={() => setNiveauEdit(n.id)} style={{
              padding: "8px 4px", borderRadius: 10, fontSize: T.meta, fontWeight: 600, cursor: "pointer", textAlign: "center",
              border: niveauEdit === n.id ? `2px solid ${n.color}` : "1px solid var(--c-border)",
              background: niveauEdit === n.id ? "var(--c-surface-soft)" : "var(--c-surface)", color: niveauEdit === n.id ? n.color : "var(--c-text-secondary)" }}>
              {n.court}<br />{n.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 12 }}>{verifNiveauInfo(niveauEdit).desc}</div>

        <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Score de confiance : {scoreEdit}/100</div>
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
            <div style={{ fontWeight: 600, fontSize: T.body, marginBottom: 8 }}>
              {decisionEnCours === "approuver" ? "Approuver la vérification" : decisionEnCours === "refuser" ? "Refuser la vérification" : "Demander des informations complémentaires"}
            </div>
            <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Justification (obligatoire)</div>
            <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3} style={textareaStyle} placeholder="Éléments examinés, motif de la décision…" />
            <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", margin: "8px 0 5px" }}>Observations (optionnel)</div>
            <textarea value={observations} onChange={e => setObservations(e.target.value)} rows={2} style={textareaStyle} placeholder="Notes internes…" />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => { setDecisionEnCours(null); setJustification(""); setObservations(""); }} style={{ ...secondaryBtnStyle, flex: 1 }}>Annuler</button>
              <button disabled={busy || !justification.trim()} onClick={soumettreDecision} style={{ ...primaryBtnStyle, flex: 1 }}>Confirmer</button>
            </div>
          </div>
        )}

        {decisions.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Décisions précédentes</div>
            {decisions.map(d => (
              <div key={d.id} style={{ ...itemCardStyle, marginBottom: 6 }}>
                <div style={{ fontSize: T.small, fontWeight: 600 }}>{d.decision === "approuver" ? "Approuvée" : d.decision === "refuser" ? "Refusée" : "Informations demandées"} — niveau {d.niveau_attribue} · score {d.score_confiance}/100</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{d.decide_par} · {new Date(d.decided_at).toLocaleString("fr-FR")}</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginTop: 3 }}>{d.justification}</div>
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
              fontSize: T.meta, padding: "6px 11px", borderRadius: 8, cursor: "pointer", fontWeight: 600,
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
            <div key={h.id} style={{ fontSize: T.meta, borderLeft: "2px solid var(--c-border)", paddingLeft: 10 }}>
              <div style={{ fontWeight: 600 }}>{VERIF_HISTORIQUE_LABELS[h.evenement] || h.evenement}</div>
              <div style={{ color: "var(--c-text-muted)", fontSize: T.meta }}>{h.acteur} · {new Date(h.created_at).toLocaleString("fr-FR")}</div>
              {h.detail && <div style={{ color: "var(--c-text-secondary)", fontSize: T.meta }}>{h.detail}</div>}
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
        <div style={{ fontSize: T.body, fontWeight: 700, color: "var(--c-text)" }}>{title}{typeof count === "number" && <span style={{ color: "var(--c-text-muted)", fontWeight: 400 }}> ({count})</span>}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyNote({ children }) { return <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", padding: "6px 0" }}>{children}</div>; }

export function StatutBadge({ statut, labels, colors }) {
  return <VerifBadge color={colors[statut] || "var(--c-text-muted)"}>{labels[statut] || statut}</VerifBadge>;
}
