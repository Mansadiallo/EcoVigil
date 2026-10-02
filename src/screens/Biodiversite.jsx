import { useState } from "react";
import { IconPaw, IconPlus } from "../components/icons.jsx";
import { MediaThumb, PhotoCaptureButton } from "../components/media.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { AFRICA_CENTER, LocationPrecision } from "../lib/carteUtils.jsx";
import { t } from "../lib/i18n.js";

export function Biodiversite({ observations, onAdd, onBack, lang, coordFormat }) {
  const [showForm, setShowForm] = useState(false);
  const [espece, setEspece] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [gpsFix, setGpsFix] = useState(null);

  function submit() {
    if (!espece.trim()) return;
    setBusy(true);
    const finalize = (lat, lng) => {
      onAdd({ espece, description, photo, lat, lng }).finally(() => {
        setBusy(false); setEspece(""); setDescription(""); setPhoto(null); setShowForm(false); setGpsFix(null);
      });
    };
    if (gpsFix && gpsFix.lat != null && gpsFix.lng != null) {
      finalize(gpsFix.lat, gpsFix.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>{t(lang, "retour")}</button>
      <SectionTitle sub={t(lang, "sub_biodiv2")}>{t(lang, "title_biodiversite")}</SectionTitle>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> {t(lang, "signaler_observation")}
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label={t(lang, "photo_espece")} previewMaxHeight={130} />
          <input value={espece} onChange={e => setEspece(e.target.value)} placeholder={t(lang, "espece_placeholder")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t(lang, "remarques_placeholder")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, boxSizing: "border-box", resize: "none", fontFamily: "Work Sans, sans-serif" }} />
          <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFix} compact />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: 13 }}>{t(lang, "annuler")}</button>
            <button onClick={submit} disabled={busy} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{busy ? t(lang, "envoi_en_cours") : t(lang, "enregistrer")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {observations.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>{t(lang, "aucune_observation_partagee")}</div>}
        {[...observations].reverse().map(o => (
          <div key={o.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
            <MediaThumb src={o.photo_url} style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <IconPaw size={14} color="var(--c-accent)" />
              <div style={{ fontWeight: 600, fontSize: 13 }}>{o.espece}</div>
            </div>
            {o.description && <div style={{ fontSize: 12, color: "var(--c-text-secondary)" }}>{o.description}</div>}
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: 4 }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
