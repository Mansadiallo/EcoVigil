import { useEffect, useState } from "react";
import { AUDIT_LABELS } from "../admin/constants.js";
import { IconPlus, IconShield, IconUsers } from "../components/icons.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { logGroupeAudit } from "../lib/audit.js";
import { uid } from "../lib/categories.jsx";
import { DEVICE_ID, supabase } from "../lib/supabase.js";

export function GroupesTerrain({ onBack, estBenevoleValide }) {
  const [groupes, setGroupes] = useState(null);
  const [groupeSelectionne, setGroupeSelectionne] = useState(null);
  const [membres, setMembres] = useState(null);
  const [missions, setMissions] = useState(null);
  const [auditLog, setAuditLog] = useState(null);

  const [showCreer, setShowCreer] = useState(false);
  const [nomGroupe, setNomGroupe] = useState("");
  const [descGroupe, setDescGroupe] = useState("");
  const [objectifGroupe, setObjectifGroupe] = useState("");
  const [codeOrgGroupe, setCodeOrgGroupe] = useState("");
  const [busyCreer, setBusyCreer] = useState(false);
  const [erreurCreer, setErreurCreer] = useState("");

  const [codeRejoindre, setCodeRejoindre] = useState("");
  const [busyRejoindre, setBusyRejoindre] = useState(false);
  const [erreurRejoindre, setErreurRejoindre] = useState("");

  const [showCreerMission, setShowCreerMission] = useState(false);
  const [titreMission, setTitreMission] = useState("");
  const [descMission, setDescMission] = useState("");
  const [echeanceMission, setEcheanceMission] = useState("");
  const [assigneMission, setAssigneMission] = useState("");
  const [busyMission, setBusyMission] = useState(false);

  async function chargerGroupes() {
    const { data: adhesions } = await supabase.from("gt_membres").select("groupe_id").eq("device_id", DEVICE_ID).eq("statut", "actif");
    const ids = (adhesions || []).map(a => a.groupe_id);
    if (ids.length === 0) { setGroupes([]); return; }
    const { data } = await supabase.from("gt_groupes").select("*, organisations(nom)").in("id", ids).eq("is_deleted", false).order("created_at", { ascending: false });
    setGroupes(data || []);
  }
  useEffect(() => { chargerGroupes(); }, []);

  // Rafraîchissement automatique pendant qu'un groupe est ouvert : sans ça, l'action d'un autre
  // membre (mission terminée, nouveau membre...) ne serait visible qu'en quittant puis rouvrant
  // le groupe. Simple sondage (comme la cloche de notifications) plutôt qu'un abonnement temps
  // réel — suffisant à cette fréquence et cohérent avec le reste de l'app.
  useEffect(() => {
    if (!groupeSelectionne) return;
    const t = setInterval(() => selectionnerGroupe(groupeSelectionne), 15000);
    return () => clearInterval(t);
  }, [groupeSelectionne]);

  async function selectionnerGroupe(id) {
    setGroupeSelectionne(id);
    setMembres(null); setMissions(null); setAuditLog(null);
    const [{ data: m }, { data: mi }, { data: log }] = await Promise.all([
      supabase.from("gt_membres").select("*").eq("groupe_id", id).eq("statut", "actif").order("joined_at", { ascending: true }),
      supabase.from("gt_missions").select("*").eq("groupe_id", id).order("created_at", { ascending: false }),
      supabase.from("gt_audit_log").select("*").eq("groupe_id", id).order("created_at", { ascending: false }).limit(20),
    ]);
    setMembres(m || []);
    setMissions(mi || []);
    setAuditLog(log || []);
  }

  function creerGroupe() {
    setErreurCreer("");
    if (!estBenevoleValide) { setErreurCreer("Il faut être bénévole validé pour créer un groupe — inscris-toi depuis l'accueil, puis reviens une fois ton compte validé."); return; }
    if (!nomGroupe.trim()) { setErreurCreer("Le nom du groupe est requis."); return; }
    setBusyCreer(true);
    // La création passe par une fonction serveur (RPC) qui résout le code d'organisation
    // (si saisi) et crée le groupe + l'adhésion du créateur en une seule opération atomique —
    // jamais le client, pour qu'il soit impossible de s'auto-affilier en devinant/forgeant
    // un organisation_id. L'affiliation reste en attente jusqu'à confirmation de l'organisation.
    const groupeId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid() + "-" + uid());
    supabase.rpc("gt_groupe_creer", {
      p_id: groupeId, p_nom: nomGroupe.trim(), p_description: descGroupe.trim() || null,
      p_objectif: objectifGroupe.trim() || null, p_device_id: DEVICE_ID, p_code: codeOrgGroupe.trim() || null,
    }).then(({ error }) => {
      setBusyCreer(false);
      if (error) {
        if (error.message && error.message.includes("code_invalide")) {
          setErreurCreer("Le code d'organisation saisi est incorrect ou n'est lié à aucune organisation.");
        } else {
          setErreurCreer("Échec : " + (error.message || "erreur inconnue"));
        }
        return;
      }
      setNomGroupe(""); setDescGroupe(""); setObjectifGroupe(""); setCodeOrgGroupe(""); setShowCreer(false);
      chargerGroupes();
    });
  }

  function rejoindreGroupe() {
    setErreurRejoindre("");
    if (!estBenevoleValide) { setErreurRejoindre("Il faut être bénévole validé pour rejoindre un groupe — inscris-toi depuis l'accueil, puis reviens une fois ton compte validé."); return; }
    if (!codeRejoindre.trim()) return;
    setBusyRejoindre(true);
    supabase.from("gt_groupes").select("id, nom").eq("code_groupe", codeRejoindre.trim().toUpperCase()).eq("is_deleted", false).eq("statut", "actif").maybeSingle()
      .then(({ data: grp, error }) => {
        if (error || !grp) { setBusyRejoindre(false); setErreurRejoindre("Code introuvable. Vérifie-le auprès du responsable du groupe."); return; }
        supabase.from("gt_membres").insert({
          groupe_id: grp.id, device_id: DEVICE_ID, role: "membre", statut: "actif", joined_at: new Date().toISOString(),
        }).then(({ error: errM }) => {
          setBusyRejoindre(false);
          if (errM) { setErreurRejoindre(errM.code === "23505" ? "Tu es déjà membre de ce groupe." : "Échec : " + errM.message); return; }
          logGroupeAudit(grp.id, "membre_rejoint", "gt_membres", DEVICE_ID);
          setCodeRejoindre("");
          chargerGroupes();
          // Avertit les membres déjà présents — sans ça, l'arrivée de quelqu'un ne se remarquerait
          // qu'en rouvrant le groupe par hasard.
          supabase.from("gt_membres").select("device_id").eq("groupe_id", grp.id).eq("statut", "actif").then(({ data: existants }) => {
            (existants || []).filter(e => e.device_id !== DEVICE_ID).forEach(e => {
              supabase.from("notifications").insert({
                destinataire: e.device_id,
                message: `Un nouveau membre a rejoint le groupe "${grp.nom}".`,
                lien: "groupes_terrain",
              }).catch(() => {});
            });
          });
        });
      });
  }

  function creerMission() {
    if (!titreMission.trim()) return;
    setBusyMission(true);
    supabase.from("gt_missions").insert({
      groupe_id: groupeSelectionne, titre: titreMission.trim(), description: descMission.trim() || null,
      echeance: echeanceMission || null, assigne_a: assigneMission || null, cree_par: DEVICE_ID,
    }).select().single().then(({ data, error }) => {
      setBusyMission(false);
      if (error) { alert("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      const detail = assigneMission ? `"${titreMission.trim()}" assignée à ${assigneMission === DEVICE_ID ? "soi-même" : assigneMission.slice(0, 6)}` : `"${titreMission.trim()}" (non assignée)`;
      logGroupeAudit(groupeSelectionne, "mission_creee", "gt_missions", data.id, detail);
      if (assigneMission && assigneMission !== DEVICE_ID) {
        supabase.from("notifications").insert({
          destinataire: assigneMission,
          message: `Nouvelle mission assignée : "${titreMission.trim()}"`,
          lien: "groupes_terrain",
        }).catch(() => {});
      }
      setTitreMission(""); setDescMission(""); setEcheanceMission(""); setAssigneMission(""); setShowCreerMission(false);
      selectionnerGroupe(groupeSelectionne);
    });
  }

  async function changerStatutMission(m, statut) {
    const { error } = await supabase.from("gt_missions").update({ statut, updated_at: new Date().toISOString() }).eq("id", m.id);
    if (error) { alert("Action refusée par le serveur."); return; }
    logGroupeAudit(groupeSelectionne, `mission_${statut}`, "gt_missions", m.id, m.titre);
    // Notifie les autres membres uniquement pour l'étape qui compte vraiment ("terminé") — pas
    // à chaque changement de statut, pour ne pas noyer le groupe de notifications.
    if (statut === "termine" && membres) {
      membres.filter(mem => mem.device_id !== DEVICE_ID).forEach(mem => {
        supabase.from("notifications").insert({
          destinataire: mem.device_id,
          message: `Mission "${m.titre}" marquée terminée par un membre du groupe.`,
          lien: "groupes_terrain",
        }).catch(() => {});
      });
    }
    selectionnerGroupe(groupeSelectionne);
  }

  const groupeInfo = groupes && groupes.find(g => g.id === groupeSelectionne);

  // Vue détail d'un groupe (membres + missions)
  if (groupeSelectionne && groupeInfo) {
    const statutLabel = { a_faire: "À faire", en_cours: "En cours", termine: "Terminé" };
    return (
      <Screen>
        <button onClick={() => setGroupeSelectionne(null)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Mes groupes</button>
        <SectionTitle sub={groupeInfo.objectif || "Groupe de terrain"}>{groupeInfo.nom}</SectionTitle>
        <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", margin: "10px 0" }}>
          Code du groupe : <strong>{groupeInfo.code_groupe}</strong> — partage-le pour inviter d'autres bénévoles.
        </div>
        {groupeInfo.organisation_id && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: groupeInfo.organisation_confirmee ? "var(--c-text-secondary)" : "var(--c-warning-text)", marginBottom: 10 }}>
            <IconShield size={13} color={groupeInfo.organisation_confirmee ? "var(--c-accent)" : "var(--c-warning)"} />
            {groupeInfo.organisation_confirmee
              ? <>Affilié à <strong>{groupeInfo.organisations ? groupeInfo.organisations.nom : "l'organisation"}</strong></>
              : <>Affiliation à <strong>{groupeInfo.organisations ? groupeInfo.organisations.nom : "l'organisation"}</strong> en attente de confirmation</>}
          </div>
        )}

        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)", margin: "14px 0 8px" }}>Membres ({(membres || []).length})</div>
        {membres === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {membres.map(m => (
              <span key={m.id} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 999, background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                {m.device_id === DEVICE_ID ? "Toi" : `Membre ${m.device_id.slice(0, 6)}`}{m.role === "admin" ? " · responsable" : ""}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 8px" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)" }}>Missions</div>
          {!showCreerMission && (
            <button onClick={() => setShowCreerMission(true)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Nouvelle</button>
          )}
        </div>

        {showCreerMission && (
          <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 12 }}>
            <input value={titreMission} onChange={e => setTitreMission(e.target.value)} placeholder="Titre de la mission"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box" }} />
            <textarea value={descMission} onChange={e => setDescMission(e.target.value)} rows={2} placeholder="Détails (optionnel)"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12.5, marginBottom: 6, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <select value={assigneMission} onChange={e => setAssigneMission(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5 }}>
                <option value="">Non assignée</option>
                {(membres || []).map(m => <option key={m.id} value={m.device_id}>{m.device_id === DEVICE_ID ? "Toi" : `Membre ${m.device_id.slice(0, 6)}`}</option>)}
              </select>
              <input value={echeanceMission} onChange={e => setEcheanceMission(e.target.value)} type="date"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5 }} />
            </div>
            <button onClick={creerMission} disabled={busyMission || !titreMission.trim()} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: !titreMission.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 11.5, cursor: "pointer", marginRight: 6 }}>
              {busyMission ? "…" : "Créer"}
            </button>
            <button onClick={() => setShowCreerMission(false)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 11.5, cursor: "pointer" }}>Annuler</button>
          </div>
        )}

        {missions === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : missions.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)", padding: 12, textAlign: "center" }}>Aucune mission pour ce groupe.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missions.map(m => (
              <div key={m.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.titre}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.statut === "termine" ? "var(--c-text-muted)" : m.statut === "en_cours" ? "#fff" : "var(--c-text-secondary)", background: m.statut === "en_cours" ? "var(--c-accent)" : "var(--c-surface-soft)", borderRadius: 999, padding: "3px 8px", flexShrink: 0, marginLeft: 8 }}>
                    {statutLabel[m.statut] || m.statut}
                  </span>
                </div>
                {m.description && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 4 }}>{m.description}</div>}
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>
                  {m.assigne_a && (m.assigne_a === DEVICE_ID ? "Assignée à toi" : `Assignée à ${m.assigne_a.slice(0, 6)}`)}
                  {m.echeance && ` · échéance ${new Date(m.echeance).toLocaleDateString("fr-FR")}`}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {["a_faire", "en_cours", "termine"].filter(s => s !== m.statut).map(s => (
                    <button key={s} onClick={() => changerStatutMission(m, s)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                      → {statutLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14, fontWeight: 600, color: "var(--c-accent-dark)", margin: "18px 0 8px" }}>Journal d'activité</div>
        {auditLog === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : auditLog.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune action enregistrée pour le moment.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {auditLog.map(a => (
              <div key={a.id} style={{ fontSize: 11, color: "var(--c-text-secondary)", borderLeft: "2px solid var(--c-border)", paddingLeft: 8 }}>
                <span style={{ fontWeight: 600 }}>{AUDIT_LABELS[a.action] || a.action}</span>
                {a.detail ? ` — ${a.detail}` : ""}
                <div style={{ fontSize: 10, color: "var(--c-text-muted)" }}>{new Date(a.created_at).toLocaleString("fr-FR")} · {a.acteur === DEVICE_ID ? "toi" : a.acteur.includes("@") ? a.acteur : a.acteur.slice(0, 6)}</div>
              </div>
            ))}
          </div>
        )}
      </Screen>
    );
  }

  // Vue liste "Mes groupes"
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconUsers size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Coordonne des missions de terrain avec d'autres bénévoles.">Groupes de terrain</SectionTitle>
      </div>

      {!estBenevoleValide && (
        <div style={{ fontSize: 12, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
          Il faut être <strong>bénévole validé</strong> pour créer ou rejoindre un groupe. Inscris-toi depuis l'écran d'accueil, puis reviens ici une fois ton compte validé par un admin.
        </div>
      )}

      <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Rejoindre avec un code</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={codeRejoindre} onChange={e => setCodeRejoindre(e.target.value.toUpperCase())} placeholder="CODE"
            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 13, letterSpacing: 1, boxSizing: "border-box" }} />
          <button onClick={rejoindreGroupe} disabled={busyRejoindre || !codeRejoindre.trim()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: !codeRejoindre.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            {busyRejoindre ? "…" : "Rejoindre"}
          </button>
        </div>
        {erreurRejoindre && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginTop: 6 }}>{erreurRejoindre}</div>}
      </div>

      {!showCreer ? (
        <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> Créer un nouveau groupe
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <input value={nomGroupe} onChange={e => setNomGroupe(e.target.value)} placeholder="Nom du groupe"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <input value={objectifGroupe} onChange={e => setObjectifGroupe(e.target.value)} placeholder="Objectif (ex : Nettoyage du littoral de X)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={descGroupe} onChange={e => setDescGroupe(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />
          <input value={codeOrgGroupe} onChange={e => setCodeOrgGroupe(e.target.value.toUpperCase())} placeholder="Code d'organisation (optionnel, ex : ECO01)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, letterSpacing: 0.5, marginBottom: 4, boxSizing: "border-box" }} />
          <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>
            Si votre groupe travaille avec une organisation, saisissez son code d'inscription : elle pourra suivre vos activités une fois qu'elle aura confirmé l'affiliation.
          </div>
          {erreurCreer && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>{erreurCreer}</div>}
          <button onClick={creerGroupe} disabled={busyCreer || !nomGroupe.trim()} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: !nomGroupe.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginRight: 8 }}>
            {busyCreer ? "…" : "Créer le groupe"}
          </button>
          <button onClick={() => { setShowCreer(false); setErreurCreer(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {groupes === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : groupes.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13, padding: 16 }}>Tu ne fais partie d'aucun groupe pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {groupes.map(g => (
            <button key={g.id} onClick={() => selectionnerGroupe(g.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nom}</div>
              {g.objectif && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
              {g.organisations && <div style={{ fontSize: 10, color: "var(--c-accent-dark)", marginTop: 4, fontWeight: 600 }}>Affilié à {g.organisations.nom}</div>}
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
