import { useEffect, useState } from "react";
import { logVerifHistorique } from "./Verification.jsx";
import { IconTrash } from "../components/icons.jsx";
import { logAudit } from "../lib/audit.js";
import { champTexte } from "../lib/categories.jsx";
import { supabase } from "../lib/supabase.js";
import { ETAPE_DOSSIER_INFO } from "../screens/Organisation.jsx";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

const ENV_STATUTS = [
  { id: "brouillon", label: "Brouillon", color: "var(--c-text-muted)" },
  { id: "en_validation", label: "En validation", color: "#E3A73B" },
  { id: "valide", label: "Validé", color: "#4A8B6F" },
  { id: "publie", label: "Publié", color: "var(--c-accent-dark)" },
  { id: "desactive", label: "Désactivé", color: "#B5451B" },
  { id: "archive", label: "Archivé", color: "var(--c-text-faint)" },
];

function statutInfo(id) { return ENV_STATUTS.find(s => s.id === id) || ENV_STATUTS[0]; }

export function AdminContenuEnv({ isSuperAdmin, adminEmail }) {
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
          <span style={{ fontSize: T.meta, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.color, color: "#fff" }}>{s.label}</span>
          {item.valide_par && <span style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>par {item.valide_par}</span>}
        </div>
        {item.motif_refus && <div style={{ fontSize: T.meta, color: "#B5451B" }}>Motif : {item.motif_refus}</div>}
        {isSuperAdmin && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
            {(item.statut === "brouillon" || item.statut === "en_validation") && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "publie")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Valider et publier</button>
                <button disabled={busyId === item.id} onClick={() => { const m = prompt("Motif du refus (visible dans l'historique) :") || ""; changerStatut(table, item, "brouillon", m); }} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Refuser</button>
              </>
            )}
            {item.statut === "publie" && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "desactive")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Désactiver</button>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "archive")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Archiver</button>
              </>
            )}
            {item.statut === "desactive" && (
              <>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "publie")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Republier</button>
                <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "archive")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Archiver</button>
              </>
            )}
            {item.statut === "archive" && (
              <button disabled={busyId === item.id} onClick={() => changerStatut(table, item, "brouillon")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Restaurer en brouillon</button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (defis === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Taxonomie des défis environnementaux et des problèmes rattachés au formulaire Signaler.
        Seul le contenu au statut <b>Publié</b> est visible par les citoyens.
        {!isSuperAdmin && " Les actions de validation sont réservées au super-admin."}
      </div>
      <div className="pace-grid-cards">
      {defis.map(d => (
        <div key={d.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14 }}>
          <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>{(d.nom && d.nom.fr) || d.code}</div>
          <LigneStatut table="env_defis" item={d} />
          <div style={{ marginTop: 10, paddingLeft: 10, borderLeft: "2px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 10 }}>
            {problemes.filter(p => p.defi_id === d.id).map(p => (
              <div key={p.id}>
                <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)" }}>{(p.nom && p.nom.fr) || p.code}</div>
                <LigneStatut table="env_problemes" item={p} />
              </div>
            ))}
            {problemes.filter(p => p.defi_id === d.id).length === 0 && (
              <div style={{ fontSize: T.meta, color: "var(--c-text-faint)", fontStyle: "italic" }}>Aucun problème rattaché.</div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

export const ORG_ADMIN_STATUTS = {
  en_attente: { label: "En attente", color: "#E3A73B" },
  valide: { label: "Validée", color: "var(--c-accent-dark)" },
  suspendu: { label: "Suspendue", color: "#B5451B" },
  bloque: { label: "Bloquée", color: "#7A1F1F" },
  rejete: { label: "Refusée", color: "var(--c-text-muted)" },
};

export function AdminOrganisations({ isSuperAdmin, adminEmail }) {
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

  if (organisations === null) return <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>;

  return (
    <div>
      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 14 }}>
        Comptes ONG et Gouvernement. Une organisation validée peut modérer les signalements de son ou ses domaine(s) et publier des actualités officielles.
        {!isSuperAdmin && " Les actions de validation sont réservées au super-admin."}
      </div>
      {organisations.length === 0 && <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 20 }}>Aucune organisation inscrite.</div>}
      {organisations.map(o => {
        const s = ORG_ADMIN_STATUTS[o.statut] || { label: o.statut, color: "var(--c-text-muted)" };
        return (
          <div key={o.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div>
                <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-text)" }}>{o.nom}</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{o.type === "ong" ? "ONG" : "Gouvernement"} · {o.email}</div>
                {(o.ville || o.pays) && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{[o.ville, o.pays].filter(Boolean).join(", ")}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ fontSize: T.meta, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: s.color, color: "#fff" }}>{s.label}</span>
                <span style={{ fontSize: T.meta, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: (ETAPE_DOSSIER_INFO[o.etape_dossier] || {}).couleur || "var(--c-text-muted)", color: "#fff" }}>
                  {(ETAPE_DOSSIER_INFO[o.etape_dossier] || {}).label || o.etape_dossier}
                </span>
              </div>
            </div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginTop: 8 }}>
              <b>Domaine(s) :</b> {(o.defis || []).map(id => defisIndex[id] || id).join(", ") || "aucun"}
            </div>
            {o.numero_agrement && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>N° agrément / acte légal : {o.numero_agrement}{o.date_expiration_agrement ? ` (expire le ${new Date(o.date_expiration_agrement).toLocaleDateString("fr-FR")})` : ""}</div>}
            {o.representant_nom && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>Représentant légal : {o.representant_nom}{o.representant_fonction ? ` — ${o.representant_fonction}` : ""}</div>}
            {(o.adresse_officielle || o.telephone_officiel || o.email_professionnel) && (
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{[o.adresse_officielle, o.telephone_officiel, o.email_professionnel].filter(Boolean).join(" · ")}</div>
            )}
            {o.etape_dossier_motif && <div style={{ fontSize: T.meta, color: "#B5451B", marginTop: 2 }}>Motif de l'étape : {o.etape_dossier_motif}</div>}
            {o.motif_refus && <div style={{ fontSize: T.meta, color: "#B5451B", marginTop: 4 }}>Motif du compte : {o.motif_refus}</div>}

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {ETAPES_INTERMEDIAIRES.filter(e => e !== o.etape_dossier).map(e => (
                <button key={e} disabled={busyId === o.id} onClick={() => changerEtapeDossier(o, e)} style={{ fontSize: T.meta, padding: "4px 8px", borderRadius: 7, border: `1px solid ${ETAPE_DOSSIER_INFO[e].couleur}`, background: "var(--c-surface)", color: ETAPE_DOSSIER_INFO[e].couleur, fontWeight: 600, cursor: "pointer" }}>
                  {ETAPE_DOSSIER_INFO[e].label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 6 }}>Documents et niveau de vérification détaillés : onglet « Vérification ».</div>
            {isSuperAdmin && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {o.statut !== "valide" && o.statut !== "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "valide")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Valider</button>
                )}
                {o.statut === "en_attente" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif du refus :") || ""; changerStatut(o, "rejete", m); }} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Refuser</button>
                )}
                {o.statut === "valide" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif de la suspension :") || ""; changerStatut(o, "suspendu", m); }} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Suspendre</button>
                )}
                {o.statut === "suspendu" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "en_attente")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Remettre en attente</button>
                )}
                {o.statut !== "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => { const m = prompt("Motif du blocage (compte définitivement bloqué jusqu'à déblocage manuel) :") || ""; changerStatut(o, "bloque", m); }} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid #7A1F1F", background: "#2a1414", color: "#ff9b9b", fontWeight: 600, cursor: "pointer" }}>Bloquer</button>
                )}
                {o.statut === "bloque" && (
                  <button disabled={busyId === o.id} onClick={() => changerStatut(o, "en_attente")} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Débloquer</button>
                )}
                <button disabled={busyId === o.id} onClick={() => supprimerOrg(o)} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>
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
