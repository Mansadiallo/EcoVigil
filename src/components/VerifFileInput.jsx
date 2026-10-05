import { useState } from "react";
import { compressImage, uploadPhotoGeneric } from "./media.jsx";
import { langCourante, t } from "../lib/i18n.js";

// Petit champ fichier générique (image ou document) réutilisé pour les
// pièces justificatives et les preuves du dossier de vérification.
export function VerifFileInput({ value, onChange, label }) {
  const [busy, setBusy] = useState(false);
  const L = langCourante();
  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });
      const isImg = f.type && f.type.startsWith("image/");
      const finalDataUrl = isImg ? await compressImage(dataUrl) : dataUrl;
      const url = await uploadPhotoGeneric(finalDataUrl, "verifications");
      if (url) onChange(url);
      else alert(t(L, "verif_echec_envoi"));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 5 }}>{label || t(L, "verif_fichier")}</div>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: "var(--c-accent-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{t(L, "verif_voir")}</a>
          <button type="button" onClick={() => onChange(null)} style={{ background: "none", border: "1px solid var(--c-border)", borderRadius: 8, padding: "3px 8px", fontSize: 10.5, cursor: "pointer", color: "var(--c-text-muted)" }}>{t(L, "retirer")}</button>
        </div>
      ) : (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1.5px dashed var(--c-text-faint)", fontSize: 11.5, color: "var(--c-text-secondary)", cursor: "pointer" }}>
          <input type="file" onChange={handleFile} style={{ display: "none" }} />
          {busy ? t(L, "envoi_en_cours") : t(L, "verif_joindre")}
        </label>
      )}
    </div>
  );
}
