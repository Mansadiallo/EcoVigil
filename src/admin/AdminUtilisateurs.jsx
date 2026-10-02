import { useEffect, useState } from "react";
import { IconTrash } from "../components/icons.jsx";
import { logActivity } from "../lib/audit.js";
import { getActiveSession, supabase } from "../lib/supabase.js";

export function AdminSuppressions({ isSuperAdmin }) {
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

export function AdminBenevoles() {
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
