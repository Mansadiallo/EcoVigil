import { useEffect, useMemo, useState } from "react";
import { IconCheck, IconLock } from "../components/icons.jsx";
import { logActivity } from "../lib/audit.js";
import { categorieMeta } from "../lib/categories.jsx";
import { supabase } from "../lib/supabase.js";
import { distanceMetres } from "../lib/utils.js";

export function ConfirmActionModal({ title, description, reasonLabel, confirmLabel, confirmColor, danger, showDuration, motifOptions, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [motif, setMotif] = useState(motifOptions ? motifOptions[0].id : "");
  const [duration, setDuration] = useState("7");
  const [customDate, setCustomDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1); // double confirmation : 1 = formulaire, 2 = confirmation finale

  const reasonOk = reason.trim().length >= 5;

  function computeJusqua() {
    if (!showDuration) return null;
    if (duration === "indetermine") return null;
    if (duration === "custom") return customDate ? new Date(customDate).toISOString() : null;
    const days = parseInt(duration, 10);
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  async function handleFinalConfirm() {
    setBusy(true);
    await onConfirm({ reason: reason.trim(), motif: motifOptions ? motif : null, jusqua: computeJusqua() });
    setBusy(false);
  }

  return (
    <div role="dialog" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 26000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <button aria-label="Fermer" onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--c-surface)", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "88vh", overflowY: "auto" }}>
        {step === 1 ? (
          <>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: danger ? "#B5451B" : "var(--c-accent-dark)", marginBottom: 6 }}>{title}</div>
            {description && <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>{description}</div>}

            {motifOptions && (
              <>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Motif</div>
                <select value={motif} onChange={e => setMotif(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }}>
                  {motifOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </>
            )}

            {showDuration && (
              <>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>Durée</div>
                <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }}>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="custom">Date précise…</option>
                  <option value="indetermine">Indéterminée</option>
                </select>
                {duration === "custom" && (
                  <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 12, boxSizing: "border-box" }} />
                )}
              </>
            )}

            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 6 }}>{reasonLabel || "Motif de l'action (obligatoire)"}</div>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explique la raison de cette action…"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 6, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" }} />
            {!reasonOk && reason.length > 0 && <div style={{ fontSize: 11, color: "#B5451B", marginBottom: 8 }}>Précise un peu plus (5 caractères minimum).</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button type="button" onClick={onCancel} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13, color: "var(--c-text)" }}>Annuler</button>
              <button type="button" disabled={!reasonOk} onClick={() => setStep(2)} style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none", cursor: reasonOk ? "pointer" : "default",
                background: !reasonOk ? "var(--c-text-faint)" : (confirmColor || "var(--c-accent-dark)"), color: "#fff", fontWeight: 600, fontSize: 13 }}>
                Continuer
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "#B5451B", marginBottom: 10 }}>Confirmer définitivement ?</div>
            <div style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.6, marginBottom: 4 }}>
              {confirmLabel || "Cette action"} — motif : « {reason.trim()} »
            </div>
            <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginBottom: 16 }}>Cette action sera enregistrée dans le journal d'audit avec ton identité et l'horodatage.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13, color: "var(--c-text)" }}>Retour</button>
              <button type="button" disabled={busy} onClick={handleFinalConfirm} style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {busy ? "..." : "Confirmer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ACTION_LABELS = {
  decision: "a ajouté une mise à jour terrain",
  resolution: "a marqué résolu",
  reouverture: "a remis en attente",
  validation: "a validé",
  suppression: "a supprimé",
  suspension: "a suspendu",
  rejet: "a rejeté",
  soft_delete: "a mis à la corbeille",
  restauration: "a restauré",
  suppression_definitive: "a supprimé définitivement",
};

// Statistiques agrégées des connexions par zone géographique (ville/région/pays), résolues côté
// client à partir de l'IP à chaque ouverture de l'app (voir capturerConnexionParZone) et journalisées
// dans activity_log comme n'importe quelle autre action — pas de nouvelle table, pas de position
// individuelle affichée : uniquement des décomptes agrégés par zone, sur la période choisie.
export function AdminConnexions() {
  const [logs, setLogs] = useState(null);
  const [jours, setJours] = useState(30);

  async function charger() {
    setLogs(null);
    const depuis = new Date(Date.now() - jours * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("activity_log").select("detail, created_at")
      .eq("action", "connexion").gte("created_at", depuis).order("created_at", { ascending: false }).limit(5000);
    setLogs(data || []);
  }
  useEffect(() => { charger(); }, [jours]);

  const parZone = useMemo(() => {
    if (!logs) return [];
    const compte = new Map();
    for (const l of logs) {
      let zone = "Zone inconnue";
      try {
        const d = JSON.parse(l.detail);
        zone = [d.ville, d.region, d.pays].filter(Boolean).join(", ") || zone;
      } catch (e) { /* ancienne entrée non-JSON ou service indisponible à l'époque : ignorée du détail */ }
      compte.set(zone, (compte.get(zone) || 0) + 1);
    }
    return Array.from(compte.entries()).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const total = parZone.reduce((s, [, n]) => s + n, 0);
  const max = parZone.length ? parZone[0][1] : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)" }}>Connexions par zone géographique</div>
        <select value={jours} onChange={e => setJours(Number(e.target.value))} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12, background: "var(--c-bg)", color: "var(--c-text)" }}>
          <option value={7}>7 derniers jours</option>
          <option value={30}>30 derniers jours</option>
          <option value={90}>90 derniers jours</option>
        </select>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
        Position approximative (ville/région/pays) résolue à partir de l'adresse IP à chaque ouverture de l'app, agrégée par zone — jamais de position individuelle précise, jamais de suivi nominatif d'un utilisateur.
      </div>
      {logs === null ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : parZone.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13 }}>Aucune connexion enregistrée sur cette période.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 2 }}>{total} connexion{total > 1 ? "s" : ""} sur la période, {parZone.length} zone{parZone.length > 1 ? "s" : ""}</div>
          {parZone.map(([zone, n]) => (
            <div key={zone}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                <span>{zone}</span><span style={{ fontWeight: 600 }}>{n}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--c-border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${max ? (n / max) * 100 : 0}%`, background: "var(--c-accent-dark)", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Détection d'abus (spam, doublons) sans jamais identifier qui que ce soit : s'appuie
// uniquement sur des données déjà présentes sur chaque signalement (device_id pseudonyme,
// coordonnées, catégorie, date) — jamais sur la connexion, l'IP ou une identité réelle. Deux
// signaux : un appareil qui envoie beaucoup de signalements en peu de temps, et des grappes de
// signalements quasi-identiques (même catégorie, à moins de 25 m, à moins de 48 h d'écart).
export function AdminAbusSignalements({ signalements }) {
  const analyse = useMemo(() => {
    const liste = (signalements || []).filter(s => !s._pending && s.id);
    const dateDe = s => new Date(s.created_at || s.date).getTime();

    const parAppareil = new Map();
    liste.forEach(s => {
      const id = s.device_id || "inconnu";
      if (!parAppareil.has(id)) parAppareil.set(id, []);
      parAppareil.get(id).push(s);
    });
    const maintenant = Date.now();
    const appareilsSuspects = Array.from(parAppareil.entries())
      .map(([id, items]) => {
        const recents24h = items.filter(s => maintenant - dateDe(s) < 86400000).length;
        const recents7j = items.filter(s => maintenant - dateDe(s) < 604800000).length;
        return { id, total: items.length, recents24h, recents7j, items };
      })
      .filter(a => a.recents24h >= 5 || a.recents7j >= 15)
      .sort((a, b) => b.recents24h - a.recents24h || b.recents7j - a.recents7j);

    const parCategorie = new Map();
    liste.forEach(s => {
      if (s.lat == null || s.lng == null) return;
      if (!parCategorie.has(s.categorie)) parCategorie.set(s.categorie, []);
      parCategorie.get(s.categorie).push(s);
    });
    const dejaGroupe = new Set();
    const grappes = [];
    parCategorie.forEach(items => {
      for (let i = 0; i < items.length; i++) {
        if (dejaGroupe.has(items[i].id)) continue;
        const groupe = [items[i]];
        for (let j = i + 1; j < items.length; j++) {
          if (dejaGroupe.has(items[j].id)) continue;
          const dist = distanceMetres(items[i].lat, items[i].lng, items[j].lat, items[j].lng);
          const ecartH = Math.abs(dateDe(items[i]) - dateDe(items[j])) / 3600000;
          if (dist < 25 && ecartH < 48) groupe.push(items[j]);
        }
        if (groupe.length > 1) { groupe.forEach(g => dejaGroupe.add(g.id)); grappes.push(groupe); }
      }
    });
    grappes.sort((a, b) => b.length - a.length);

    return { appareilsSuspects, grappes };
  }, [signalements]);

  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
        Détection basée uniquement sur des identifiants d'appareil pseudonymes et les coordonnées/catégorie/date déjà présentes sur chaque signalement — jamais sur une identité réelle ni sur la connexion.
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Appareils à volume inhabituel ({analyse.appareilsSuspects.length})</div>
      {analyse.appareilsSuspects.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 12.5, marginBottom: 18 }}>Aucun appareil au-dessus des seuils (5 signalements/24h ou 15/7j).</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
          {analyse.appareilsSuspects.map(a => (
            <div key={a.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
              Appareil {a.id.slice(0, 8)}… — {a.recents24h} en 24h, {a.recents7j} en 7j ({a.total} au total)
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Grappes de doublons potentiels ({analyse.grappes.length})</div>
      {analyse.grappes.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 12.5 }}>Aucune grappe détectée (même catégorie, &lt;25 m, &lt;48h).</div>
      ) : (
        <div className="pace-grid-cards" style={{ gap: 10 }}>
          {analyse.grappes.map((g, i) => (
            <div key={i} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{categorieMeta(g[0].categorie).label} — {g.length} signalements groupés</div>
              {g.map(s => (
                <div key={s.id} style={{ fontSize: 11, color: "var(--c-text-secondary)" }}>
                  {s.date || new Date(s.created_at).toLocaleString("fr-FR")} — appareil {(s.device_id || "inconnu").slice(0, 8)}…
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminHistorique({ isSuperAdmin, onRestaurerItem }) {
  const [logs, setLogs] = useState(null);
  const [corbeille, setCorbeille] = useState(null);
  const [vue, setVue] = useState("journal"); // journal | corbeille

  async function loadLogs() {
    const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
    setLogs(data || []);
  }
  async function loadCorbeille() {
    const [{ data: s }, { data: a }, { data: b }, { data: o }] = await Promise.all([
      supabase.from("signalements").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("arbres").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("benevoles").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
      supabase.from("organisations").select("*").eq("is_deleted", true).order("deleted_at", { ascending: false }),
    ]);
    setCorbeille({ signalements: s || [], arbres: a || [], benevoles: b || [], organisations: o || [] });
  }
  useEffect(() => { loadLogs(); loadCorbeille(); }, []);

  function nomDe(table, item) {
    if (table === "signalements") { return categorieMeta(item.categorie).label; }
    if (table === "arbres") return item.nom || "Arbre";
    if (table === "benevoles") return item.nom;
    if (table === "organisations") return `${item.nom} (${item.type === "ong" ? "ONG" : "Gouvernement"})`;
    return "élément";
  }

  async function restaurer(table, item) {
    const nom = nomDe(table, item);
    const { data, error } = await supabase.from(table).update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", item.id).select();
    if (error || !data || data.length === 0) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    logActivity("restauration", table, item.id, nom);
    if (onRestaurerItem) onRestaurerItem(table, data[0]);
    loadCorbeille(); loadLogs();
  }

  async function supprimerDefinitivement(table, item) {
    const nom = nomDe(table, item);
    if (!confirm(`Supprimer définitivement "${nom}" ? Cette action est irréversible.`)) return;
    if (!confirm("Confirme une seconde fois : il n'y a aucun moyen de revenir en arrière après ça.")) return;
    const { error } = await supabase.from(table).delete().eq("id", item.id);
    if (error) { alert("Échec de la suppression : " + error.message); return; }
    logActivity("suppression_definitive", table, item.id, nom);
    loadCorbeille(); loadLogs();
  }

  const totalCorbeille = corbeille ? corbeille.signalements.length + corbeille.arbres.length + corbeille.benevoles.length + corbeille.organisations.length : 0;

  function CorbeilleSection({ titre, table, items }) {
    if (items.length === 0) return null;
    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 6px" }}>{titre} ({items.length})</div>
        <div className="pace-grid-cards">
          {items.map(item => (
            <div key={item.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--c-text)" }}>{nomDe(table, item)}</div>
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>Supprimé par {item.deleted_by || "?"} le {new Date(item.deleted_at).toLocaleDateString("fr-FR")}</div>
              {table === "signalements" && !isSuperAdmin ? (
                <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 8, fontStyle: "italic" }}>Restauration et suppression définitive réservées au super-admin.</div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => restaurer(table, item)} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Restaurer</button>
                  <button onClick={() => supprimerDefinitivement(table, item)} style={{ fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Supprimer définitivement</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        {[["journal", "Journal"], ["corbeille", `Éléments supprimés${corbeille ? ` (${totalCorbeille})` : ""}`]].map(([id, label]) => (
          <button key={id} onClick={() => setVue(id)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            border: vue === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: vue === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: vue === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
        ))}
      </div>

      {vue === "journal" && (
        logs === null ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> :
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>Les 100 dernières actions de l'équipe.</div>
          {logs.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucune action enregistrée pour l'instant.</div>}
          {logs.map(l => (
            <div key={l.id} style={{ background: "var(--c-surface)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--c-border)", fontSize: 12.5 }}>
              <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{l.acteur}</span>{" "}
              <span style={{ color: "var(--c-text-secondary)" }}>{ACTION_LABELS[l.action] || l.action}</span>{" "}
              <span style={{ color: "var(--c-text-secondary)" }}>{l.cible_table}</span>
              {l.detail && <span style={{ color: "var(--c-text-muted)" }}> — {l.detail}</span>}
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>
                {new Date(l.created_at).toLocaleDateString("fr-FR")} à {new Date(l.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {vue === "corbeille" && (
        corbeille === null ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div> :
        totalCorbeille === 0 ? <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Corbeille vide.</div> :
        <div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 4 }}>
            Les éléments supprimés restent ici jusqu'à restauration ou suppression définitive.
          </div>
          <CorbeilleSection titre="Signalements" table="signalements" items={corbeille.signalements} />
          <CorbeilleSection titre="Arbres" table="arbres" items={corbeille.arbres} />
          <CorbeilleSection titre="Bénévoles" table="benevoles" items={corbeille.benevoles} />
          <CorbeilleSection titre="Organisations" table="organisations" items={corbeille.organisations} />
        </div>
      )}
    </div>
  );
}

// --- Détection d'activité suspecte (heuristiques côté client sur les journaux existants) ---
// Ce n'est PAS une détection d'intrusion réseau : ni les IP, ni les tentatives de connexion
// échouées, ni le trafic ne sont visibles depuis le frontend. C'est un repérage de patterns
// anormaux dans les actions déjà journalisées (activity_log, audit_logs) pour aider un admin
// à repérer un compte compromis ou un usage abusif des droits admin. Son efficacité dépend
// entièrement des policies RLS de ces deux tables : elles doivent rester illisibles pour
// tout compte non-admin, sans quoi un attaquant pourrait aussi consulter ce panneau.
const ACTIONS_DESTRUCTRICES = /suppression|rejet|suspension|soft_delete/i;

const FENETRE_RAFALE_MS = 5 * 60 * 1000;

const SEUIL_RAFALE = 8;

const FENETRE_SUPPRESSIONS_MS = 10 * 60 * 1000;

const SEUIL_SUPPRESSIONS = 3;

const HEURE_DEBUT_INHABITUELLE = 0;

const HEURE_FIN_INHABITUELLE = 5;

function detecterActiviteSuspecte(evenements) {
  const alertes = [];
  if (!evenements || evenements.length === 0) return alertes;

  const parActeur = {};
  evenements.forEach(e => {
    const acteur = e.acteur || "inconnu";
    (parActeur[acteur] = parActeur[acteur] || []).push(e);
  });

  Object.entries(parActeur).forEach(([acteur, evts]) => {
    const tries = [...evts].filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 1) Rafale d'actions tous types confondus (compte détourné automatisant des actions)
    for (const ref of tries) {
      const fenetre = tries.filter(e => Math.abs(new Date(e.date) - new Date(ref.date)) < FENETRE_RAFALE_MS);
      if (fenetre.length >= SEUIL_RAFALE) {
        alertes.push({ niveau: "warning", acteur, date: ref.date, cle: `rafale-${acteur}`,
          titre: `${fenetre.length} actions en moins de 5 minutes` });
        break;
      }
    }

    // 2) Rafale de suppressions / rejets / suspensions (le geste le plus destructeur)
    const destructrices = tries.filter(e => ACTIONS_DESTRUCTRICES.test(e.action || ""));
    for (const ref of destructrices) {
      const fenetre = destructrices.filter(e => Math.abs(new Date(e.date) - new Date(ref.date)) < FENETRE_SUPPRESSIONS_MS);
      if (fenetre.length >= SEUIL_SUPPRESSIONS) {
        alertes.push({ niveau: "critical", acteur, date: ref.date, cle: `suppr-${acteur}`,
          titre: `${fenetre.length} suppressions/rejets/suspensions en moins de 10 minutes` });
        break;
      }
    }

    // 3) Activité hors horaires habituels (approximatif : heure locale de qui consulte ce panneau)
    tries.forEach(e => {
      const h = new Date(e.date).getHours();
      if (h >= HEURE_DEBUT_INHABITUELLE && h < HEURE_FIN_INHABITUELLE) {
        alertes.push({ niveau: "info", acteur, date: e.date, cle: `horaire-${acteur}-${e.date}-${e.action}`,
          titre: `Action à ${h}h : ${ACTION_LABELS[e.action] || e.action}${e.table ? " (" + e.table + ")" : ""}` });
      }
    });

    // 4) Premier geste connu de ce compte = action destructrice (signal fort de compte compromis)
    if (tries.length && ACTIONS_DESTRUCTRICES.test(tries[0].action || "")) {
      alertes.push({ niveau: "warning", acteur, date: tries[0].date, cle: `premier-${acteur}`,
        titre: "Première action connue de ce compte : suppression/rejet/suspension" });
    }
  });

  return alertes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function AdminMfaPanel({ session }) {
  const facteurs = (session && session.user && session.user.factors) || [];
  const facteurVerifie = facteurs.find(f => f.factor_type === "totp" && f.status === "verified");
  const [enrolement, setEnrolement] = useState(null); // { id, totp: { qr_code, secret, uri } }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState(false);

  async function demarrerEnrolement() {
    setErreur(""); setMessage(""); setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator" });
    setBusy(false);
    if (error) { setErreur(error.message); return; }
    setEnrolement(data);
  }

  async function confirmerEnrolement(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!enrolement) return;
    setErreur(""); setBusy(true);
    const { data: chal, error: errChal } = await supabase.auth.mfa.challenge({ factorId: enrolement.id });
    if (errChal) { setBusy(false); setErreur(errChal.message); return; }
    const { error: errVerif } = await supabase.auth.mfa.verify({ factorId: enrolement.id, challengeId: chal.id, code: code.trim() });
    setBusy(false);
    if (errVerif) { setErreur("Code incorrect. Vérifie l'heure de ton appareil et réessaie."); return; }
    setEnrolement(null); setCode("");
    setMessage("Double authentification activée. Elle sera demandée à chaque connexion.");
  }

  async function annulerEnrolement() {
    if (!enrolement) return;
    await supabase.auth.mfa.unenroll({ factorId: enrolement.id });
    setEnrolement(null); setCode(""); setErreur("");
  }

  async function supprimerFacteur() {
    if (!facteurVerifie) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: facteurVerifie.id });
    setBusy(false);
    setConfirmSuppr(false);
    if (error) { setErreur(error.message); return; }
    setMessage("Double authentification désactivée pour ce compte.");
  }

  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconLock size={16} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-accent-dark)" }}>Double authentification (2FA)</div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
        Ajoute une couche de sécurité supplémentaire : en plus du mot de passe, un code à 6 chiffres généré
        par une application d'authentification (Google Authenticator, Authy, 1Password…) sera demandé à
        chaque connexion.
      </div>

      {message && <div style={{ fontSize: 12, color: "var(--c-accent)", marginBottom: 10 }}>{message}</div>}
      {erreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginBottom: 10 }}>{erreur}</div>}

      {facteurVerifie && !enrolement ? (
        <>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#fff", background: "var(--c-accent)", borderRadius: 999, padding: "4px 10px", marginBottom: 10 }}>
            <IconCheck size={12} /> Activée
          </div>
          {!confirmSuppr ? (
            <button onClick={() => setConfirmSuppr(true)} style={{ display: "block", padding: "8px 14px", borderRadius: 10, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              Désactiver la double authentification
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 8 }}>Confirme la désactivation : ton compte ne sera plus protégé que par le mot de passe.</div>
              <button onClick={supprimerFacteur} disabled={busy} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", marginRight: 8 }}>
                {busy ? "…" : "Confirmer la désactivation"}
              </button>
              <button onClick={() => setConfirmSuppr(false)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                Annuler
              </button>
            </div>
          )}
        </>
      ) : !enrolement ? (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--c-text-muted)", background: "var(--c-surface-soft)", borderRadius: 999, padding: "4px 10px", marginBottom: 10 }}>
          Non activée
        </div>
      ) : null}

      {!facteurVerifie && !enrolement && (
        <button onClick={demarrerEnrolement} disabled={busy} style={{ display: "block", padding: "9px 14px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {busy ? "…" : "Activer la double authentification"}
        </button>
      )}

      {enrolement && (
        <form onSubmit={confirmerEnrolement}>
          <div style={{ fontSize: 12, color: "var(--c-text-secondary)", marginBottom: 10 }}>
            1. Scanne ce QR code avec ton application d'authentification (ou saisis la clé manuellement).<br />
            2. Entre ensuite le code à 6 chiffres qu'elle affiche pour confirmer.
          </div>
          {enrolement.totp && enrolement.totp.qr_code && (
            <div style={{ background: "#fff", borderRadius: 10, padding: 10, marginBottom: 10, display: "flex", justifyContent: "center" }}
              dangerouslySetInnerHTML={{ __html: enrolement.totp.qr_code }} />
          )}
          {enrolement.totp && enrolement.totp.secret && (
            <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10, wordBreak: "break-all" }}>
              Clé manuelle : <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{enrolement.totp.secret}</span>
            </div>
          )}
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code à 6 chiffres" aria-label="Code de confirmation"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 16, letterSpacing: 3, textAlign: "center", marginBottom: 10, boxSizing: "border-box" }} />
          <button type="submit" disabled={busy || code.length !== 6} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: code.length !== 6 ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5,
            cursor: code.length !== 6 ? "default" : "pointer", marginRight: 8 }}>
            {busy ? "…" : "Confirmer"}
          </button>
          <button type="button" onClick={annulerEnrolement} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}

export function AdminSecurite({ session }) {
  const [evenements, setEvenements] = useState(null);
  const [erreur, setErreur] = useState(null);

  async function charger() {
    setErreur(null);
    const [{ data: acts, error: e1 }, { data: audits, error: e2 }] = await Promise.all([
      supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (e1 && e2) {
      setErreur("Impossible de charger les journaux (droits admin requis ou connexion indisponible).");
      setEvenements([]);
      return;
    }
    const fromActs = (acts || []).map(l => ({ acteur: l.acteur, action: l.action, table: l.cible_table, date: l.created_at }));
    const fromAudits = (audits || []).map(l => ({ acteur: l.admin_id, action: l.action_type, table: l.target_entity, date: l.created_at }));
    setEvenements([...fromActs, ...fromAudits]);
  }

  useEffect(() => { charger(); }, []);

  const alertes = useMemo(() => detecterActiviteSuspecte(evenements || []), [evenements]);
  const critiques = alertes.filter(a => a.niveau === "critical");
  const avertissements = alertes.filter(a => a.niveau === "warning");
  const infos = alertes.filter(a => a.niveau === "info");

  const COULEURS = {
    critical: { bg: "var(--c-danger-border-soft)", border: "#B5451B", text: "#B5451B" },
    warning: { bg: "var(--c-warning-bg)", border: "var(--c-warning-border-soft)", text: "var(--c-warning-text)" },
    info: { bg: "var(--c-surface-soft)", border: "var(--c-border)", text: "var(--c-text-secondary)" },
  };

  function AlerteCard({ a }) {
    const c = COULEURS[a.niveau];
    return (
      <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px" }}>
        <div style={{ fontWeight: 600, fontSize: 12.5, color: c.text }}>{a.titre}</div>
        <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 3 }}>
          {a.acteur} — {new Date(a.date).toLocaleDateString("fr-FR")} à {new Date(a.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <AdminMfaPanel session={session} />

      <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", lineHeight: 1.5, marginBottom: 4 }}>
        Repérage de patterns anormaux dans les 300 dernières actions journalisées : rafales d'actions,
        suppressions groupées, activité hors horaires, compte au comportement destructeur dès sa
        première action. Ceci ne remplace pas une détection d'intrusion réseau : les IP et les
        tentatives de connexion échouées ne sont pas visibles depuis l'application.
      </div>

      <button onClick={charger} style={{ alignSelf: "flex-start", fontSize: 11.5, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, cursor: "pointer" }}>Actualiser</button>

      {erreur && <div style={{ color: "#B5451B", fontSize: 12.5 }}>{erreur}</div>}

      {evenements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>
      ) : alertes.length === 0 ? (
        <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Aucune activité suspecte détectée.</div>
      ) : (
        <>
          {critiques.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#B5451B", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>Critique ({critiques.length})</div>
              <div className="pace-grid-cards">{critiques.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
          {avertissements.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-warning-text)", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>À surveiller ({avertissements.length})</div>
              <div className="pace-grid-cards">{avertissements.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
          {infos.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-text-muted)", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0" }}>Information ({infos.length})</div>
              <div className="pace-grid-cards">{infos.map(a => <AlerteCard key={a.cle} a={a} />)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
