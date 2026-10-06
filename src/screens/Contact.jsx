import React from "react";
import { Screen } from "../components/ui.jsx";
import { T, TITRE_GRAND } from "../lib/typo.jsx";

// Coordonnées d'EcoVigil affichées dans le menu hamburger (module « Contact »).
const TELEPHONE = "+224 628615181";
const EMAILS = ["ecovigilguinee@gmail.com", "wassolonmansa97@gmail.com"];

function IconTel({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
function IconCourriel({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

const carte = { display: "flex", alignItems: "center", gap: 12, padding: "14px 14px", borderRadius: 14, border: "1px solid var(--c-border)", background: "var(--c-surface)", textDecoration: "none", color: "var(--c-text)", marginBottom: 10 };
const pastille = { width: 38, height: 38, borderRadius: "50%", background: "var(--c-accent-soft, rgba(0,128,96,0.12))", color: "var(--c-accent-dark)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

export function Contact({ onBack }) {
  const tel = TELEPHONE.replace(/\s+/g, "");
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ ...TITRE_GRAND, fontWeight: 700, color: "var(--c-accent-dark)", marginBottom: 4 }}>Contact</div>
      <div style={{ fontSize: T.body, color: "var(--c-text-muted)", marginBottom: 16 }}>Une question, une suggestion ou besoin d'aide ? Écris-nous ou appelle-nous.</div>

      <a href={`tel:${tel}`} style={carte}>
        <span style={pastille}><IconTel /></span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: T.small, color: "var(--c-text-muted)" }}>Contact</span>
          <span style={{ display: "block", fontSize: T.body, fontWeight: 600 }}>{TELEPHONE}</span>
        </span>
      </a>

      {EMAILS.map(adresse => (
        <a key={adresse} href={`mailto:${adresse}`} style={carte}>
          <span style={pastille}><IconCourriel /></span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: T.small, color: "var(--c-text-muted)" }}>Email</span>
            <span style={{ display: "block", fontSize: T.body, fontWeight: 600, wordBreak: "break-all" }}>{adresse}</span>
          </span>
        </a>
      ))}
    </Screen>
  );
}
