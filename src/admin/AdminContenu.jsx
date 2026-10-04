import { useEffect, useState } from "react";
import { IconTrash } from "../components/icons.jsx";
import { supabase } from "../lib/supabase.js";
import { T } from "../lib/typo.jsx";

export function AdminActualites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("actualites").select("*").order("created_at", { ascending: false }).limit(100);
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function publish(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!titre.trim() || !contenu.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("actualites").insert({ titre, contenu, urgent });
    setBusy(false);
    if (error) { alert("Publication refusée par le serveur."); return; }
    setTitre(""); setContenu(""); setUrgent(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Supprimer cette actualité ?")) return;
    await supabase.from("actualites").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <form onSubmit={publish} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
        <input required value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
        <textarea required value={contenu} onChange={e => setContenu(e.target.value)} placeholder="Contenu" rows={3}
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box", resize: "none" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} /> Marquer comme alerte urgente
        </label>
        <button type="button" onClick={publish} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          {busy ? "Publication..." : "Publier"}
        </button>
      </form>

      {loading ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div> : (
        <div className="pace-grid-cards">
          {items.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: T.body, textAlign: "center", padding: 12 }}>Aucune actualité publiée.</div>}
          {items.map(n => (
            <div key={n.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  {n.urgent && <span style={{ fontSize: T.meta, fontWeight: 700, color: "#B5451B" }}>⚠ ALERTE — </span>}
                  <span style={{ fontWeight: 600, fontSize: T.body }}>{n.titre}</span>
                </div>
                <button onClick={() => remove(n.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}><IconTrash size={14} /></button>
              </div>
              <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 4 }}>{n.contenu}</div>
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 5 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminEvenements() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("evenements").select("*").order("date_debut", { ascending: false }).limit(200);
    setItems(data || []);
    const { data: parts } = await supabase.from("evenement_participants").select("evenement_id");
    const c = {};
    (parts || []).forEach(p => { c[p.evenement_id] = (c[p.evenement_id] || 0) + 1; });
    setCounts(c);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Supprimer cet événement (ex. contenu inapproprié ou doublon) ? Les inscriptions associées seront aussi retirées.")) return;
    await supabase.from("evenement_participants").delete().eq("evenement_id", id);
    await supabase.from("evenements").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 12 }}>
        Les événements sont proposés librement par les citoyens et bénévoles depuis l'app. Cette liste sert à
        retirer un contenu inapproprié ou un doublon — la création se fait côté public, pas ici.
      </div>
      {loading ? <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div> : (
        <div className="pace-grid-cards">
          {items.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: T.body, textAlign: "center", padding: 12 }}>Aucun événement proposé.</div>}
          {items.map(ev => (
            <div key={ev.id} style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: T.body }}>{ev.titre}</span>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 2 }}>
                    {new Date(ev.date_debut).toLocaleString("fr-FR")}{ev.lieu ? ` · ${ev.lieu}` : ""} · {counts[ev.id] || 0} participant(s)
                  </div>
                </div>
                <button onClick={() => remove(ev.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}><IconTrash size={14} /></button>
              </div>
              {ev.description && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 4 }}>{ev.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
