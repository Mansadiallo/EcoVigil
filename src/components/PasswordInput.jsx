import { useState } from "react";
import { IconCheck, IconEye, IconEyeOff } from "./icons.jsx";
import { langCourante, t } from "../lib/i18n.js";

export function PasswordInput({ value, onChange, placeholder, ariaLabel, style, disabled }) {
  const [visible, setVisible] = useState(false);
  const L = langCourante();
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} aria-label={ariaLabel || placeholder} disabled={disabled}
        style={{ ...style, width: "100%", paddingInlineEnd: 40, boxSizing: "border-box", opacity: disabled ? 0.6 : 1 }} />
      <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? t(L, "mdp_masquer") : t(L, "mdp_afficher")} disabled={disabled} style={{
        position: "absolute", insetInlineEnd: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none",
        cursor: "pointer", color: "var(--c-text-muted)", padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}

// ===== Politique de mot de passe renforcée (comptes du Centre d'EcoVigil uniquement) =====
// Le Centre d'EcoVigil donne accès à des données sensibles (identifiants d'appareils, notes de
// modération, gestion des comptes bénévoles/organisations) : on exige donc ici un mot de passe
// nettement plus robuste que celui des comptes citoyens/organisations (8 caractères). Cette
// validation est côté client (UX + premier filtre) ; elle ne remplace pas une politique équivalente
// configurée côté serveur (Supabase Auth → Authentication → Policies / mot de passe minimal, qui
// doit être alignée sur ces mêmes règles pour empêcher un contournement via un appel direct à l'API).
export function evaluerForceMotDePasseAdmin(pw) {
  const val = pw || "";
  const L = langCourante();
  const regles = [
    { id: "longueur", label: t(L, "mdp_regle_longueur"), ok: val.length >= 12 },
    { id: "maj", label: t(L, "mdp_regle_maj"), ok: /[A-Z]/.test(val) },
    { id: "min", label: t(L, "mdp_regle_min"), ok: /[a-z]/.test(val) },
    { id: "chiffre", label: t(L, "mdp_regle_chiffre"), ok: /[0-9]/.test(val) },
    { id: "special", label: t(L, "mdp_regle_special"), ok: /[^A-Za-z0-9]/.test(val) },
  ];
  return { regles, valide: regles.every(r => r.ok) };
}

export function ExigencesMotDePasseAdmin({ password }) {
  const { regles } = evaluerForceMotDePasseAdmin(password);
  return (
    <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10, display: "flex", flexDirection: "column", gap: 3 }}>
      {regles.map(r => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, color: r.ok ? "var(--c-accent)" : "var(--c-text-muted)" }}>
          {r.ok ? <IconCheck size={11} /> : <span style={{ width: 11, display: "inline-block", textAlign: "center" }}>•</span>} {r.label}
        </div>
      ))}
    </div>
  );
}
