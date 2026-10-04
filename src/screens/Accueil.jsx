import { useEffect, useState } from "react";
import { CAROUSEL_PHOTOS_REELLES } from "../imagesData.js";
import { ORGANISME_LABELS } from "../admin/constants.js";
import { IconAlert, IconBell, IconCloudRain, IconDroplet, IconFish, IconFlame, IconFlask, IconGlobe, IconHome, IconLayers, IconNewspaper, IconPaw, IconPick, IconShield, IconSprout, IconSun, IconTrash, IconTree, IconWaves, IconWind } from "../components/icons.jsx";
import { Screen, SectionTitle, StatCard } from "../components/ui.jsx";
import { FicheEnvironnementale, categorieLabel, categorieMeta } from "../lib/categories.jsx";
import { t } from "../lib/i18n.js";
import { co2EstimeParArbre } from "../lib/utils.js";
import { VolunteerCard } from "./Profil.jsx";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

function ClimatWidget({ lang }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setError(true); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();
          setWeather(data.current);
        } catch (e) { setError(true); }
      },
      () => setError(true),
      { timeout: 6000 }
    );
  }, []);

  if (error || !weather) return null;

  const code = weather.weather_code;
  const isRain = code >= 51 && code <= 82;
  const isHeat = weather.temperature_2m >= 34;
  const WIcon = isRain ? IconCloudRain : IconSun;
  const alert = isRain ? t(lang, "alerte_pluie") : isHeat ? t(lang, "alerte_chaleur") : null;

  return (
    <div style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-sky))", borderRadius: 14, padding: 14, marginBottom: 16, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: T.meta, opacity: 0.8 }}>{t(lang, "meteo_locale")}</div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 26, fontWeight: 700 }}>{Math.round(weather.temperature_2m)}°C</div>
        </div>
        <WIcon size={30} color="#fff" />
      </div>
      {alert && (
        <div style={{ marginTop: 8, fontSize: T.small, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px" }}>
          ⚠ {alert}
        </div>
      )}
    </div>
  );
}

// Catégories mises en avant dans le module photo de l'accueil (sous-ensemble représentatif des CATEGORIES).
const CAROUSEL_PROBLEME_IDS = ["decharge", "pollution", "deforestation", "feu", "mine", "deversement", "braconnage", "pollution_air", "dechets_dangereux", "erosion", "assechement", "peche_illegale", "espece_envahissante", "construction_illegale", "inondation", "eau_potable"];

// Module visuel : photos d'exemple réalistes des problèmes environnementaux à signaler, qui se
// succèdent en fondu enchaîné (auto-défilement, pause au survol/toucher, indicateurs cliquables).
function ExemplesProblemesCarousel({ lang, onNavigate, accesEtendu }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex(i => (i + 1) % CAROUSEL_PROBLEME_IDS.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  const catId = CAROUSEL_PROBLEME_IDS[index];
  const cat = categorieMeta(catId);
  const CatIcon = cat.icon;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <IconAlert size={15} color="var(--c-accent-dark)" />
        <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>Exemples de problèmes à signaler</div>
      </div>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        style={{ position: "relative", width: "100%", height: 190, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "var(--c-surface-soft)" }}
      >
        {CAROUSEL_PROBLEME_IDS.map((id, i) => (
          <img
            key={id}
            src={CAROUSEL_PHOTOS_REELLES[id] || `https://picsum.photos/seed/pace-${id}/800/500`}
            alt={categorieLabel(lang, id)}
            loading={i === 0 ? "eager" : "lazy"}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              opacity: i === index ? 1 : 0, transition: "opacity 1.1s ease",
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.7) 100%)" }} />

        <div style={{ position: "absolute", top: 12, left: 14, display: "flex", gap: 4 }}>
          {CAROUSEL_PROBLEME_IDS.map((id, i) => (
            <button key={id} onClick={() => setIndex(i)} aria-label={categorieLabel(lang, id)} style={{
              width: i === index ? 16 : 6, height: 6, borderRadius: 3, border: "none", padding: 0, cursor: "pointer",
              background: i === index ? "#fff" : "rgba(255,255,255,0.5)", transition: "width .3s ease" }} />
          ))}
        </div>

        {accesEtendu && (
          <button onClick={() => onNavigate("signaler")} style={{
            position: "absolute", top: 10, right: 12, background: "rgba(255,255,255,0.92)", color: "var(--c-accent-dark)",
            border: "none", borderRadius: 20, padding: "6px 12px", fontSize: T.meta, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4 }}>
            <IconAlert size={12} /> Signaler
          </button>
        )}

        <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 8, padding: 5, display: "flex" }}>
              <CatIcon size={14} color="#fff" />
            </div>
            <span style={{ fontSize: T.meta, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.6 }}>EcoVigil</span>
          </div>
          <div style={{ ...TITRE_SOUS, fontWeight: 700, lineHeight: 1.2 }}>{categorieLabel(lang, catId)}</div>
        </div>
      </div>
    </div>
  );
}

// Bascule entre l'espace bénévole et l'espace organisation (visible si les deux sont disponibles)
export function EspaceSwitch({ actif, onBenevole, onOrganisation }) {
  const b = (id, lab, fn) => <button type="button" onClick={actif === id ? undefined : fn} aria-pressed={actif === id}
    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: actif === id ? "default" : "pointer", fontSize: T.body, fontWeight: 600,
      background: actif === id ? "var(--c-accent-dark)" : "transparent", color: actif === id ? "#fff" : "var(--c-text)" }}>{lab}</button>;
  return <div role="group" aria-label="Changer d'espace" style={{ display: "flex", gap: 4, padding: 4, background: "var(--c-surface-soft)", border: "1px solid var(--c-border-soft)", borderRadius: 14, marginBottom: 14 }}>
    {b("benevole", "Espace bénévole", onBenevole)}{b("organisation", "Espace organisation", onOrganisation)}</div>;
}

export function Accueil({ signalements, arbres, notifState, onEnableNotif, onOpenAdmin, actualites, onNavigate, lang, estBenevoleValide, benevoleStatut, onBenevoleInscrit, estOrganisationValidee, organisationStatut, organisationEtapeDossier, organisationEtapeMotif, onBasculerStatutSignalement, profilInfo, onProfilChange }) {
  const resolus = signalements.filter(s => s.statut === "resolu").length;
  const co2 = arbres.reduce((sum, a) => sum + co2EstimeParArbre(a), 0);
  const accesEtendu = estBenevoleValide || estOrganisationValidee; // bénévole validé OU organisation validée
  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_accueil")}>{t(lang, "title_accueil")}</SectionTitle>

      {notifState === "default" && (
        <button onClick={onEnableNotif} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
          background: "var(--c-surface-soft)", border: "1px solid var(--c-border-soft)", borderRadius: 12, padding: "10px 12px",
          marginBottom: 14, cursor: "pointer", color: "var(--c-accent-dark)", fontSize: T.body
        }}>
          <IconBell size={16} /> {t(lang, "activer_notifs")}
        </button>
      )}

      <ClimatWidget lang={lang} />

      <ExemplesProblemesCarousel lang={lang} onNavigate={onNavigate} accesEtendu={accesEtendu} />

      {!accesEtendu && (
        <div style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-accent))", borderRadius: 14, padding: "14px 16px", marginBottom: 4, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconShield size={16} color="#fff" />
            <div style={{ fontSize: T.body, fontWeight: 700 }}>Accès complet réservé aux bénévoles et organisations</div>
          </div>
          <div style={{ fontSize: T.small, opacity: 0.92, lineHeight: 1.5 }}>
            Carte, signalements, arbres et biodiversité sont réservés aux bénévoles et organisations validés par EcoVigil.
            Inscris-toi ci-dessous pour y accéder.
          </div>
        </div>
      )}
      {!estBenevoleValide && <VolunteerCard lang={lang} benevoleStatut={benevoleStatut} onInscrit={onBenevoleInscrit} profilInfo={profilInfo} onProfilChange={onProfilChange} />}

      {actualites.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <IconNewspaper size={15} color="var(--c-accent-dark)" />
            <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "actualites")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actualites.slice(0, 3).map(n => (
              <div key={n.id} style={{
                background: n.urgent ? "var(--c-warning-bg)" : "var(--c-surface)", border: `1px solid ${n.urgent ? "var(--c-warning-border-soft)" : "var(--c-border)"}`,
                borderRadius: 12, padding: 12 }}>
                {n.urgent && <div style={{ fontSize: T.meta, fontWeight: 700, color: "#B5451B", marginBottom: 3 }}>⚠ ALERTE</div>}
                {n.auteur_nom && <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-accent-dark)", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}><IconShield size={10} /> {n.auteur_nom}</div>}
                <div style={{ fontWeight: 600, fontSize: T.body, color: "var(--c-text)" }}>{n.titre}</div>
                <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 3 }}>{n.contenu}</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 5 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <StatCard label={t(lang, "stat_arbres")} value={arbres.length} unit="" accent="var(--c-accent)" />
        <StatCard label={t(lang, "signalements_resolus")} value={resolus} unit={`/${signalements.length}`} accent="#B5451B" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label={t(lang, "stat_co2")} value={co2} unit="kg" accent="#E3A73B" />
      </div>
      <SectionTitle>{t(lang, "activite_recente")}</SectionTitle>
      {signalements.length === 0 && arbres.length === 0 && (
        <div style={{ color: "var(--c-text-muted)", fontSize: T.body, background: "var(--c-surface)", padding: 16, borderRadius: 12, border: "1px dashed var(--c-border-soft)" }}>
          {t(lang, "rien_signaler")}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...signalements].reverse().slice(0, 3).map(s => {
          const cat = categorieMeta(s.categorie);
          const IconC = cat.icon;
          return (
            <div key={s.id} style={{ background: "var(--c-surface)", padding: 10, borderRadius: 12, border: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconC size={16} color="var(--c-accent)" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)" }}>{categorieLabel(lang, cat.id)}</div>
                  <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>{s.date}</div>
                </div>
                <span style={{
                  fontSize: T.meta, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: s.statut === "resolu" ? "var(--c-success-bg)" : "var(--c-warning-bg)", color: s.statut === "resolu" ? "var(--c-accent)" : "#B5451B" }}>
                  {s.statut === "resolu" ? t(lang, "resolu") : t(lang, "en_attente")}
                </span>
              </div>
              <div style={{ marginTop: 8, paddingLeft: 42 }}>
                <FicheEnvironnementale code={s.categorie} />
              </div>
              {onBasculerStatutSignalement && (
                <div style={{ marginTop: 8, paddingLeft: 42 }}>
                  <button onClick={() => onBasculerStatutSignalement(s)} style={{
                    fontSize: T.meta, fontWeight: 600, padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                    border: s.statut === "resolu" ? "1px solid var(--c-border)" : "none",
                    background: s.statut === "resolu" ? "var(--c-surface)" : "var(--c-accent-dark)",
                    color: s.statut === "resolu" ? "var(--c-text-secondary)" : "#fff" }}>
                    {s.statut === "resolu" ? t(lang, "remettre_en_attente_signaleur") : t(lang, "marquer_resolu_signaleur")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {[...signalements].reverse().slice(0, 3).some(s => s.statut === "resolu" && s.resolution_organisme) && (
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", padding: "0 4px" }}>
            {[...signalements].reverse().slice(0, 3).filter(s => s.statut === "resolu" && s.resolution_organisme).map(s => (
              <div key={s.id} style={{ marginBottom: 2 }}>{t(lang, "traite_par")} {ORGANISME_LABELS[s.resolution_organisme] || s.resolution_organisme}{s.resolution_action ? ` — ${s.resolution_action}` : ""}</div>
            ))}
          </div>
        )}
      </div>

      {estBenevoleValide && <VolunteerCard lang={lang} benevoleStatut={benevoleStatut} />}

      {/* Lien "Centre d'EcoVigil" retiré de l'écran d'accueil : accès admin uniquement via ?admin=1 dans l'URL */}
      <button onClick={() => onNavigate("confidentialite")} style={{
        width: "100%", background: "none", border: "none", color: "var(--c-text-faint)",
        fontSize: T.meta, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: 8
      }}>{t(lang, "apropos_confidentialite")}</button>
    </Screen>
  );
}

const ENV_ICON_MAP = { IconTrash, IconDroplet, IconTree, IconFlame, IconPick, IconAlert, IconPaw, IconFish, IconWind, IconLayers, IconWaves, IconFlask, IconHome, IconSun, IconSprout, IconGlobe };

export function envIcon(nom) { return ENV_ICON_MAP[nom] || IconAlert; }

export function CarteBiodiversite({ lang, onNavigate }) {
  return (
    <div style={{ marginTop: 14 }}>
      <button onClick={() => onNavigate("biodiversite")} style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 14, borderRadius: 14,
        border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", textAlign: "left", width: "100%" }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}>
          <IconPaw size={18} color="var(--c-accent)" />
        </div>
        <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)" }}>{t(lang, "title_biodiversite")}</div>
      </button>
    </div>
  );
}
