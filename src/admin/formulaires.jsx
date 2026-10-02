import { useState } from "react";
import { VerifFileInput } from "../components/VerifFileInput.jsx";
import { StatutBadge, VERIF_DOC_TYPES, VERIF_MOTIFS_REJET, VERIF_PREUVE_TYPES } from "./Verification.jsx";

export const itemCardStyle = { background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 10, marginBottom: 8 };

export const miniBtnStyle = { fontSize: 10.5, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", cursor: "pointer" };

export const acceptBtnStyle = { flex: 1, fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer" };

export const rejectBtnStyle = { flex: 1, fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", cursor: "pointer" };

export const primaryBtnStyle = { padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };

export const secondaryBtnStyle = { padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" };

export const textareaStyle = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" };

export function DocumentForm({ onSubmit, busy }) {
  const [type, setType] = useState(VERIF_DOC_TYPES[0]);
  const [reference, setReference] = useState("");
  const [dateDocument, setDateDocument] = useState("");
  const [fichierUrl, setFichierUrl] = useState(null);
  return (
    <div style={{ ...itemCardStyle, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Type de document</div>
      <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
        {VERIF_DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Référence (optionnel)</div>
      <input value={reference} onChange={e => setReference(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Date du document (optionnel)</div>
      <input type="date" value={dateDocument} onChange={e => setDateDocument(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <VerifFileInput value={fichierUrl} onChange={setFichierUrl} label="Fichier joint" />
      <button disabled={busy} onClick={() => onSubmit({ type, reference: reference || null, date_document: dateDocument || null, fichier_url: fichierUrl })} style={{ ...primaryBtnStyle, width: "100%" }}>Ajouter le document</button>
    </div>
  );
}

export function PreuveForm({ activites, onSubmit, busy }) {
  const [type, setType] = useState("photo");
  const [activiteId, setActiviteId] = useState("");
  const [description, setDescription] = useState("");
  const [datePreuve, setDatePreuve] = useState("");
  const [url, setUrl] = useState(null);
  return (
    <div style={{ ...itemCardStyle, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Type de preuve</div>
      <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
        {VERIF_PREUVE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      {activites.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Activité liée (optionnel)</div>
          <select value={activiteId} onChange={e => setActiviteId(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}>
            <option value="">Aucune activité liée</option>
            {activites.map(a => <option key={a.id} value={a.id}>{a.titre}</option>)}
          </select>
        </>
      )}
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Description</div>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...textareaStyle, marginBottom: 10 }} placeholder="Ce que cette preuve démontre…" />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>Date de la preuve (optionnel)</div>
      <input type="date" value={datePreuve} onChange={e => setDatePreuve(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }} />
      <VerifFileInput value={url} onChange={setUrl} label="Photo, vidéo ou document" />
      <button disabled={busy} onClick={() => onSubmit({ type, activite_id: activiteId || null, description: description || null, date_preuve: datePreuve ? new Date(datePreuve).toISOString() : null, url })} style={{ ...primaryBtnStyle, width: "100%" }}>Ajouter la preuve</button>
    </div>
  );
}

export function PreuveItem({ preuve, onStatuer, busy }) {
  const [showRejet, setShowRejet] = useState(false);
  const [motifRejet, setMotifRejet] = useState(VERIF_MOTIFS_REJET[0].id);
  const [motifDetail, setMotifDetail] = useState("");
  const typeLabel = (VERIF_PREUVE_TYPES.find(t => t.id === preuve.type) || {}).label || preuve.type;
  return (
    <div style={itemCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{typeLabel}</div>
        <StatutBadge statut={preuve.statut} labels={{ a_examiner: "À examiner", acceptee: "Acceptée", rejetee: "Rejetée" }} colors={{ a_examiner: "#E3A73B", acceptee: "var(--c-accent-dark)", rejetee: "#B5451B" }} />
      </div>
      {preuve.description && <div style={{ fontSize: 11, color: "var(--c-text-secondary)", marginTop: 3 }}>{preuve.description}</div>}
      {preuve.url && <a href={preuve.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--c-accent-dark)" }}>Voir le fichier</a>}
      {preuve.date_preuve && <div style={{ fontSize: 10.5, color: "var(--c-text-muted)" }}>Datée du {new Date(preuve.date_preuve).toLocaleDateString("fr-FR")}</div>}
      {preuve.motif_rejet && (
        <div style={{ fontSize: 10.5, color: "#B5451B", marginTop: 4 }}>
          Motif : {(VERIF_MOTIFS_REJET.find(m => m.id === preuve.motif_rejet) || {}).label || preuve.motif_rejet}{preuve.motif_detail ? ` — ${preuve.motif_detail}` : ""}
        </div>
      )}
      {preuve.statut === "a_examiner" && !showRejet && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button disabled={busy} onClick={() => onStatuer(preuve, "acceptee")} style={acceptBtnStyle}>Accepter</button>
          <button disabled={busy} onClick={() => setShowRejet(true)} style={rejectBtnStyle}>Rejeter</button>
        </div>
      )}
      {showRejet && (
        <div style={{ marginTop: 8 }}>
          <select value={motifRejet} onChange={e => setMotifRejet(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 12, marginBottom: 6, boxSizing: "border-box" }}>
            {VERIF_MOTIFS_REJET.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <textarea value={motifDetail} onChange={e => setMotifDetail(e.target.value)} rows={2} placeholder="Détail (optionnel)…" style={{ ...textareaStyle, marginBottom: 6 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowRejet(false)} style={{ ...secondaryBtnStyle, flex: 1, padding: "7px 0", fontSize: 11.5 }}>Annuler</button>
            <button disabled={busy} onClick={() => { onStatuer(preuve, "rejetee", motifRejet, motifDetail); setShowRejet(false); }} style={{ ...rejectBtnStyle, flex: 1 }}>Confirmer le rejet</button>
          </div>
        </div>
      )}
    </div>
  );
}
