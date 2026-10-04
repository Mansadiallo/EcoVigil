import { useEffect, useState } from "react";
import { IconCalendar, IconPlus, IconUsers } from "../components/icons.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { DEVICE_ID, supabase } from "../lib/supabase.js";
import { T } from "../lib/typo.jsx";

export function Evenements({ onBack }) {
  const [evenements, setEvenements] = useState(null);
  const [participations, setParticipations] = useState({});
  const [mesParticipations, setMesParticipations] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [lieu, setLieu] = useState("");
  const [dateEv, setDateEv] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [busyParticip, setBusyParticip] = useState(null);

  async function charger() {
    const hier = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("evenements").select("*").gte("date_debut", hier).order("date_debut", { ascending: true });
    setEvenements(data || []);
    const { data: parts } = await supabase.from("evenement_participants").select("evenement_id, device_id");
    const counts = {}; const mine = new Set();
    (parts || []).forEach(p => {
      counts[p.evenement_id] = (counts[p.evenement_id] || 0) + 1;
      if (p.device_id === DEVICE_ID) mine.add(p.evenement_id);
    });
    setParticipations(counts);
    setMesParticipations(mine);
  }
  useEffect(() => { charger(); }, []);

  function creerEvenement() {
    setErreur("");
    if (!titre.trim() || !dateEv) { setErreur("Le titre et la date sont requis."); return; }
    setBusy(true);
    supabase.from("evenements").insert({
      titre: titre.trim(), description: description.trim() || null, lieu: lieu.trim() || null,
      date_debut: new Date(dateEv).toISOString(), device_id: DEVICE_ID,
    }).then(({ error }) => {
      setBusy(false);
      if (error) { setErreur("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setTitre(""); setDescription(""); setLieu(""); setDateEv(""); setShowForm(false);
      charger();
    });
  }

  async function participer(ev) {
    setBusyParticip(ev.id);
    const { error } = await supabase.from("evenement_participants").insert({ evenement_id: ev.id, device_id: DEVICE_ID });
    setBusyParticip(null);
    if (!error) charger(); else alert("Action refusée par le serveur.");
  }
  async function seDesister(ev) {
    setBusyParticip(ev.id);
    const { error } = await supabase.from("evenement_participants").delete().eq("evenement_id", ev.id).eq("device_id", DEVICE_ID);
    setBusyParticip(null);
    if (!error) charger(); else alert("Action refusée par le serveur.");
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconCalendar size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Journées de plantation, sensibilisation, nettoyage… proposées par la communauté.">Événements</SectionTitle>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> Proposer un événement
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre (ex : Journée de plantation au parc X)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box", resize: "none" }} />
          <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Lieu"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          <input value={dateEv} onChange={e => setDateEv(e.target.value)} type="datetime-local"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          {erreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
          <button onClick={creerEvenement} disabled={busy || !titre.trim() || !dateEv} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: (!titre.trim() || !dateEv) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: (!titre.trim() || !dateEv) ? "default" : "pointer", marginRight: 8 }}>
            {busy ? "…" : "Publier l'événement"}
          </button>
          <button onClick={() => { setShowForm(false); setErreur(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {evenements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>
      ) : evenements.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 20 }}>Aucun événement à venir pour le moment — sois le premier à en proposer un !</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {evenements.map(ev => {
            const inscrit = mesParticipations.has(ev.id);
            return (
              <div key={ev.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: T.body, fontWeight: 600 }}>{ev.titre}</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 3 }}>
                  {new Date(ev.date_debut).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}{ev.lieu ? ` · ${ev.lieu}` : ""}
                </div>
                {ev.description && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 6 }}>{ev.description}</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <IconUsers size={13} /> {participations[ev.id] || 0} participant(s)
                  </div>
                  <button onClick={() => inscrit ? seDesister(ev) : participer(ev)} disabled={busyParticip === ev.id} style={{
                    fontSize: T.small, padding: "6px 12px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                    border: inscrit ? "1px solid var(--c-border)" : "none",
                    background: inscrit ? "var(--c-surface)" : "var(--c-accent-dark)",
                    color: inscrit ? "var(--c-text-secondary)" : "#fff" }}>
                    {busyParticip === ev.id ? "…" : inscrit ? "Se désister" : "Participer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
