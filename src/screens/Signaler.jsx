import { useEffect, useState } from "react";
import { IconCheck, IconChevronLeft } from "../components/icons.jsx";
import { PhotoCaptureButton } from "../components/media.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { AFRICA_CENTER, LocationPrecision } from "../lib/carteUtils.jsx";
import { CATEGORIES, URGENCE, categorieLabel, urgenceLabel } from "../lib/categories.jsx";
import { t } from "../lib/i18n.js";
import { supabase } from "../lib/supabase.js";
import { CarteBiodiversite, envIcon } from "./Accueil.jsx";
import { T, TITRE_GRAND } from "../lib/typo.jsx";

export function Signaler({ onSubmit, lang, coordFormat, onNavigate }) {
  const [step, setStep] = useState(1); // 1 = défi, 2 = problème (mode dynamique uniquement), 3 = détails
  const [defiChoisi, setDefiChoisi] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const [problemeChoisi, setProblemeChoisi] = useState(null); // objet complet si mode dynamique, pour accéder à champs_collecte
  const [urgence, setUrgence] = useState("moyenne");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [donneesCollecte, setDonneesCollecte] = useState({});
  const [sent, setSent] = useState(false);
  const [gpsFix, setGpsFix] = useState(null);

  // Taxonomie dynamique (défis/problèmes publiés par le super-admin). Tant que rien n'est
  // publié, `defisPublies` reste vide et le formulaire se comporte exactement comme avant
  // (grille plate des 16 catégories codées en dur) — aucune régression.
  const [defisPublies, setDefisPublies] = useState(null);
  const [problemesPublies, setProblemesPublies] = useState([]);
  useEffect(() => {
    Promise.all([
      supabase.from("env_defis").select("*").eq("statut", "publie").order("ordre", { ascending: true }),
      supabase.from("env_problemes").select("*").eq("statut", "publie").order("ordre", { ascending: true }),
    ]).then(([{ data: d }, { data: p }]) => {
      setDefisPublies(d || []);
      setProblemesPublies(p || []);
    });
  }, []);
  const modeDynamique = !!(defisPublies && defisPublies.length > 0);
  const problemesDuDefi = defiChoisi ? problemesPublies.filter(p => p.defi_id === defiChoisi.id) : [];
  const champsDynamiques = (problemeChoisi && problemeChoisi.champs_collecte) || [];

  function champManquant() {
    // Les champs de type "photo" ne sont pas rendus ici (la photo est déjà gérée par le
    // bouton photo général du formulaire) : ils ne doivent donc jamais bloquer l'envoi.
    return champsDynamiques.some(c => c.type !== "photo" && c.requis && !donneesCollecte[c.cle]);
  }

  function submit() {
    const finalize = (lat, lng) => {
      onSubmit({ categorie, urgence, description, photo, lat, lng, donnees_collecte: donneesCollecte });
      setSent(true);
      setTimeout(() => {
        setSent(false); setStep(1); setDefiChoisi(null); setCategorie(null); setProblemeChoisi(null);
        setDescription(""); setPhoto(null); setUrgence("moyenne"); setDonneesCollecte({}); setGpsFix(null);
      }, 1800);
    };
    // Priorité au relevé GPS visible dans le formulaire (widget LocationPrecision), que
    // l'utilisateur a pu vérifier avant l'envoi. On ne retente un relevé "à l'aveugle" que
    // si ce widget n'a encore rien capté (ex. permission accordée tardivement).
    if (gpsFix && gpsFix.lat != null && gpsFix.lng != null) {
      finalize(gpsFix.lat, gpsFix.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
    }
  }

  if (sent) {
    return (
      <Screen>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 380, textAlign: "center" }}>
          <div style={{ background: "var(--c-success-bg)", borderRadius: "50%", padding: 18, marginBottom: 14 }}><IconCheck size={32} color="var(--c-accent)" /></div>
          <div style={{ ...TITRE_GRAND, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "signalement_envoye")}</div>
          <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginTop: 6 }}>{t(lang, "merci_equipe")}</div>
        </div>
      </Screen>
    );
  }

  // Étape "choix du défi" (uniquement en mode dynamique, avec du contenu publié)
  if (modeDynamique && step === 1) {
    return (
      <Screen>
        <SectionTitle sub={t(lang, "sub_signaler")}>{t(lang, "title_signaler")}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {defisPublies.map(d => {
            const IconD = envIcon(d.icone);
            return (
              <button key={d.id} onClick={() => { setDefiChoisi(d); setStep(2); }} style={{
                textAlign: "left", border: "1px solid var(--c-border)", background: "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconD size={20} color="var(--c-text-secondary)" />
                <div style={{ fontSize: T.body, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{(d.nom && d.nom[lang]) || (d.nom && d.nom.fr) || d.code}</div>
              </button>
            );
          })}
        </div>
        <CarteBiodiversite lang={lang} onNavigate={onNavigate} />
      </Screen>
    );
  }

  // Étape "choix du problème dans le défi" (mode dynamique uniquement)
  if (modeDynamique && step === 2) {
    return (
      <Screen>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button onClick={() => setStep(1)} style={{ padding: 8, borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>
          <SectionTitle sub={(defiChoisi.nom && defiChoisi.nom[lang]) || (defiChoisi.nom && defiChoisi.nom.fr)}>{t(lang, "title_signaler")}</SectionTitle>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {problemesDuDefi.map(p => {
            const IconP = envIcon(p.icone);
            const active = categorie === p.code;
            return (
              <button key={p.id} onClick={() => { setCategorie(p.code); setProblemeChoisi(p); setStep(3); }} style={{
                textAlign: "left", border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconP size={20} color={active ? "var(--c-accent)" : "var(--c-text-secondary)"} />
                <div style={{ fontSize: T.body, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{(p.nom && p.nom[lang]) || (p.nom && p.nom.fr) || p.code}</div>
              </button>
            );
          })}
          {problemesDuDefi.length === 0 && (
            <div style={{ gridColumn: "1 / -1", fontSize: T.small, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Aucun problème publié pour ce défi pour le moment.</div>
          )}
        </div>
      </Screen>
    );
  }

  const etapeDetails = modeDynamique ? step === 3 : step === 2;

  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_signaler")}>{t(lang, "title_signaler")}</SectionTitle>
      {!modeDynamique && step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CATEGORIES.map(c => {
            const IconC = c.icon;
            const active = categorie === c.id;
            return (
              <button key={c.id} onClick={() => setCategorie(c.id)} style={{
                textAlign: "left", border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                <IconC size={20} color={active ? "var(--c-accent)" : "var(--c-text-secondary)"} />
                <div style={{ fontSize: T.body, marginTop: 8, fontWeight: 600, color: "var(--c-text)", lineHeight: 1.25 }}>{categorieLabel(lang, c.id)}</div>
              </button>
            );
          })}
        </div>
      )}
      {!modeDynamique && step === 1 && <CarteBiodiversite lang={lang} onNavigate={onNavigate} />}
      {etapeDetails && (
        <div>
          <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "urgence_label")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {URGENCE.map(u => (
              <button key={u.id} onClick={() => setUrgence(u.id)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer",
                border: urgence === u.id ? `2px solid ${u.color}` : "1px solid var(--c-border)",
                background: urgence === u.id ? `${u.color}18` : "var(--c-surface)",
                color: urgence === u.id ? u.color : "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body }}>{urgenceLabel(lang, u.id)}</button>
            ))}
          </div>
          <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "photo_label")}</div>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label={t(lang, "ajouter_photo")} previewMaxHeight={160} />
          <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{t(lang, "description_label")}</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder={t(lang, "decrire_situation")}
            style={{ width: "100%", borderRadius: 12, border: "1px solid var(--c-border)", padding: 10, fontSize: T.field, resize: "none" }} />

          {champsDynamiques.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)" }}>Détails spécifiques à ce problème</div>
              {champsDynamiques.filter(c => c.type !== "photo").map(c => (
                <div key={c.cle}>
                  <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 4 }}>{c.label}{c.requis && " *"}</div>
                  {c.type === "select" ? (
                    <select value={donneesCollecte[c.cle] || ""} onChange={e => setDonneesCollecte(prev => ({ ...prev, [c.cle]: e.target.value }))}
                      style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-surface)", color: "var(--c-text)" }}>
                      <option value="" disabled>Choisir…</option>
                      {(c.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input type={c.type === "nombre" ? "number" : "text"} value={donneesCollecte[c.cle] || ""} onChange={e => setDonneesCollecte(prev => ({ ...prev, [c.cle]: e.target.value }))}
                      style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFix} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        {etapeDetails && <button onClick={() => setStep(modeDynamique ? 2 : 1)} style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>}
        <button disabled={(!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())} onClick={() => (!modeDynamique && step === 1) ? setStep(2) : submit()} style={{
          flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
          background: ((!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
          cursor: ((!modeDynamique && step === 1 && !categorie) || (etapeDetails && champManquant())) ? "default" : "pointer" }}>
          {(!modeDynamique && step === 1) ? t(lang, "continuer") : t(lang, "envoyer_signalement")}
        </button>
      </div>
    </Screen>
  );
}
