import { Screen, SectionTitle } from "../components/ui.jsx";
import { T } from "../lib/typo.jsx";

export const CONTACT_TELEPHONE = "+224 628615181";
export const CONTACT_EMAILS = ["ecovigilguinee@gmail.com", "wassolonmansa97@gmail.com"];

// Icône « enveloppe » pour l'entrée de menu (même signature que les autres icônes : size, color).
export function IconContact({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function Contact({ onBack }) {
  const ligne = { display: "block", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontSize: T.body, fontWeight: 600, textDecoration: "none", marginBottom: 8, overflowWrap: "anywhere" };
  const etiquette = { fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", margin: "14px 0 6px" };
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <SectionTitle sub="Une question, une suggestion ou un problème ? Écris-nous ou appelle-nous.">Contact</SectionTitle>

      <div style={etiquette}>Téléphone</div>
      <a href={"tel:" + CONTACT_TELEPHONE.replace(/\s/g, "")} style={ligne}>{CONTACT_TELEPHONE}</a>

      <div style={etiquette}>E-mails</div>
      {CONTACT_EMAILS.map(m => <a key={m} href={"mailto:" + m} style={ligne}>{m}</a>)}
    </Screen>
  );
}
