import { useEffect, useRef, useState } from "react";
import { LOGO_DATA_URL } from "../imagesData.js";
import { PasswordInput } from "./PasswordInput.jsx";
import { IconAlert, IconBell, IconHome, IconLock, IconMapPin, IconMonitor, IconMoon, IconSun, IconTree, IconUserCircle } from "./icons.jsx";
import { t } from "../lib/i18n.js";
import { supabase } from "../lib/supabase.js";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

export const TABS = [
  { id: "accueil", label: "Accueil", icon: IconHome },
  { id: "carte", label: "Carte", icon: IconMapPin },
  { id: "signaler", label: "Signaler", icon: IconAlert, cta: true },
  { id: "arbre", label: "Mon Arbre", icon: IconTree },
  { id: "profil", label: "Profil", icon: IconUserCircle },
];

export function NotifBell({ email, onNavigate, color }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  // "email" porte soit une vraie adresse (session org/admin), soit le DEVICE_ID
  // (citoyen/bénévole) : dans ce second cas, destinataire n'est pas dans le JWT,
  // donc la lecture/le marquage passent par des RPC dédiées (voir migration RLS
  // notifications) plutôt que par un select/update direct sur la table.
  const isDevice = !email.includes("@");

  async function load() {
    const { data } = isDevice
      ? await supabase.rpc("mes_notifications", { p_device: email })
      : await supabase.from("notifications").select("*").eq("destinataire", email).order("created_at", { ascending: false }).limit(30);
    setNotifs(data || []);
  }
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [email]);

  const unread = notifs.filter(n => !n.lu).length;

  async function openPanel() {
    setOpen(!open);
    if (!open && unread > 0) {
      const ids = notifs.filter(n => !n.lu).map(n => n.id);
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
      for (const id of ids) {
        if (isDevice) supabase.rpc("marquer_notification_lue", { p_device: email, p_id: id }).then(() => {});
        else supabase.from("notifications").update({ lu: true }).eq("id", id).then(() => {});
      }
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={openPanel} style={{ background: "none", border: "none", color: color || "var(--c-text-muted)", cursor: "pointer", padding: 6, position: "relative" }}>
        <IconBell size={18} />
        {unread > 0 && <span style={{ position: "absolute", top: 2, right: 2, background: "#B5451B", color: "#fff", fontSize: T.meta, fontWeight: 700, borderRadius: 9, minWidth: 18, height: 18, padding: "0 4px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", top: 34, right: 0, width: 260, background: "var(--c-surface)", borderRadius: 12, border: "1px solid var(--c-border)", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", zIndex: 100, maxHeight: 320, overflowY: "auto" }}>
          {notifs.length === 0 ? (
            <div style={{ padding: 16, fontSize: T.body, color: "var(--c-text-muted)", textAlign: "center" }}>Aucune notification.</div>
          ) : notifs.map(n => (
            <button key={n.id} onClick={() => { if (n.lien) onNavigate(n.lien); setOpen(false); }} style={{
              display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "none", borderBottom: "1px solid var(--c-surface-soft)",
              background: "var(--c-surface)", cursor: "pointer" }}>
              <div style={{ fontSize: T.small, color: "var(--c-text)" }}>{n.message}</div>
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString("fr-FR")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const ONBOARDING_SLIDES = [
  { icon: IconAlert, title: "Signale un problème", text: "Décharges, pollution, déforestation... prends une photo, ta position s'ajoute automatiquement." },
  { icon: IconMapPin, title: "Vois la carte communautaire", text: "Les signalements validés et les arbres plantés par tout le monde, en direct." },
  { icon: IconTree, title: "Plante et suis tes arbres", text: "Enregistre chaque arbre planté et suis sa croissance dans le temps." },
];

/* Verrouillage de l'orientation de l'écran (Screen Orientation API).
   Les navigateurs n'autorisent le verrouillage qu'en plein écran ou en appli installée, et
   seulement suite à un geste de l'utilisateur : en mode paysage on passe donc d'abord en plein écran.
   Non pris en charge sur iPhone (aucun effet, sans erreur). */
export async function verrouillerOrientation(o) {
  try {
    const so = typeof screen !== "undefined" ? screen.orientation : null;
    if (!so) return;
    if (o === "auto") {
      if (so.unlock) so.unlock();
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      return;
    }
    if (!so.lock) return;
    const installee = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    if (o === "paysage" && !installee && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
    await so.lock(o === "portrait" ? "portrait" : "landscape");
  } catch (e) {}
}

export function ThemePanel({ themeMode, accent, lang, coordFormat, onSetMode, onSetAccent, onSetLang, onSetCoordFormat, orientation, onSetOrientation, onClose, section }) {
  const modes = [
    { id: "light", label: "Clair", icon: IconSun },
    { id: "dark", label: "Sombre", icon: IconMoon },
    { id: "system", label: "Auto", icon: IconMonitor },
  ];
  const accents = [
    { id: "green", label: "Vert", color: "#4CAF50" },
    { id: "blue", label: "Bleu", color: "#2E6E86" },
    { id: "gold", label: "Doré", color: "#8A6318" },
  ];
  const orientations = [
    { id: "auto", label: "Auto", w: 16, h: 16 },
    { id: "portrait", label: "Portrait", w: 12, h: 18 },
    { id: "paysage", label: "Paysage", w: 18, h: 12 },
  ];
  const langues = [
    { id: "fr", label: "Français" },
    { id: "en", label: "English" },
    { id: "pt", label: "Português" },
    { id: "es", label: "Español" },
    { id: "sw", label: "Kiswahili" },
    { id: "ar", label: "العربية" },
  ];
  return (
    <div role="dialog" aria-label="Réglages d'affichage" style={{ position: "fixed", inset: 0, zIndex: 25000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <button aria-label="Fermer les réglages" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--c-surface)", borderRadius: "20px 20px 0 0", padding: 20, boxShadow: "var(--shadow-md)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>Affichage</div>
          <button onClick={onClose} aria-label="Fermer" style={{ background: "var(--c-surface-soft)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "var(--c-text-secondary)" }}>✕</button>
        </div>

  {section === "theme" && (<>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Thème</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {modes.map(m => {
            const MIcon = m.icon;
            const active = themeMode === m.id;
            return (
              <button key={m.id} onClick={() => onSetMode(m.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <MIcon size={18} color={active ? "var(--c-accent)" : "var(--c-text-muted)"} />
                <span style={{ fontSize: T.small, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{m.label}</span>
              </button>
            );
          })}
        </div>
  </>)}

  {section === "accent" && (<>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Couleur d'accent</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {accents.map(a => {
            const active = accent === a.id;
            return (
              <button key={a.id} onClick={() => onSetAccent(a.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? `2px solid ${a.color}` : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: a.color, display: "block" }} />
                <span style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)" }}>{a.label}</span>
              </button>
            );
          })}
        </div>
  </>)}

  {section === "langue" && (<>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Langue / Language</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {langues.map(l => {
            const active = lang === l.id;
            return (
              <button key={l.id} onClick={() => onSetLang(l.id)} aria-pressed={active} style={{
                padding: "12px 0", borderRadius: 12, fontSize: T.body, fontWeight: 600,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", color: active ? "var(--c-accent)" : "var(--c-text-secondary)", cursor: "pointer" }}>
                {l.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
          La navigation principale et les titres changent de langue immédiatement. La traduction complète du contenu est en cours.
        </div>
  </>)}

  {section === "gps" && (<>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Format des coordonnées GPS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { id: "dd", label: "Degré décimal", exemple: "9.535000, -13.680000" },
            { id: "dms", label: "Deg/Min/Sec", exemple: "9°32'6.0\"N" },
            { id: "utm", label: "UTM", exemple: "28P 644879mE" },
          ].map(f => {
            const active = coordFormat === f.id;
            return (
              <button key={f.id} onClick={() => onSetCoordFormat(f.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ fontSize: T.small, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{f.label}</span>
                <span style={{ fontSize: T.meta, color: "var(--c-text-faint)" }}>{f.exemple}</span>
              </button>
            );
          })}
        </div>
  </>)}

      {section === "orientation" && (<>
        <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 8 }}>Orientation de l'affichage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {orientations.map(o => {
            const active = orientation === o.id;
            return (
              <button key={o.id} onClick={() => onSetOrientation(o.id)} aria-pressed={active} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0", borderRadius: 12,
                border: active ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: active ? "var(--c-surface-soft)" : "var(--c-surface)", cursor: "pointer" }}>
                <span style={{ width: o.w, height: o.h, borderRadius: 3, boxSizing: "border-box", display: "block", border: `2px ${o.id === "auto" ? "dashed" : "solid"} ${active ? "var(--c-accent)" : "var(--c-text-muted)"}` }} />
                <span style={{ fontSize: T.small, fontWeight: 600, color: active ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{o.label}</span>
              </button>
            );
          })}
        </div>
        {!(typeof screen !== "undefined" && screen.orientation && screen.orientation.lock) && (
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 10, lineHeight: 1.4 }}>Sur cet appareil, le navigateur ne permet pas de forcer l'orientation : tournez simplement votre téléphone.</div>
        )}
      </>)}
      </div>
    </div>
  );
}

/* Menu hamburger : ouvre, sans les dupliquer, les écrans et réglages existants (onglets, ThemePanel, notifications). */
export function MenuHamburger({ items, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => { if (closeRef.current) closeRef.current.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="pace-drawer-root" style={{ zIndex: 12000 }}>
      <button aria-label="Fermer le menu" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", border: "none", cursor: "pointer" }} />
      <div className="pace-fade-in" style={{ position: "absolute", top: 0, bottom: 0, insetInlineEnd: 0, width: "min(320px, 86%)", overflowY: "auto", background: "var(--c-surface)", borderStartStartRadius: 20, borderEndStartRadius: 20, padding: "calc(16px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px))", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>Menu</div>
          <button ref={closeRef} onClick={onClose} aria-label="Fermer" style={{ background: "var(--c-surface-soft)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "var(--c-text-secondary)" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => {
            const ItemIcon = item.icon;
            const off = item.locked || item.disabled;
            return (
              <button key={item.id} onClick={() => { onClose(); item.onSelect(); }} disabled={off} style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "start", minHeight: 52, padding: "10px 14px",
                borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)",
                cursor: off ? "default" : "pointer", opacity: off ? 0.6 : 1 }}>
                <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8, display: "flex", flexShrink: 0 }}>
                  {item.locked ? <IconLock size={17} color="var(--c-text-muted)" /> : <ItemIcon size={17} color="var(--c-accent)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.body, fontWeight: 600, color: "var(--c-text)" }}>{item.label}</div>
                  {item.note && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{item.note}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SplashScreen({ lang }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 30000,
      background: "linear-gradient(160deg,#007A3D,#0077B6)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div className="pace-scale-in" style={{
        width: 96, height: 96, borderRadius: "50%", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)", overflow: "hidden", marginBottom: 18,
      }}>
        <img src={LOGO_DATA_URL} alt="Logo EcoVigil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div className="pace-fade-in" style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 24, color: "#fff", letterSpacing: 0.4 }}>
        EcoVigil
      </div>
      <div className="pace-fade-in" style={{ fontSize: T.small, color: "rgba(255,255,255,0.85)", marginTop: 4, textAlign: "center", padding: "0 24px" }}>
        {t(lang, "devise_ecovigil")}
      </div>
    </div>
  );
}

export function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const Icon = slide.icon;
  const last = step === ONBOARDING_SLIDES.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "linear-gradient(160deg,var(--c-accent-dark),var(--c-sky))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, color: "#fff", textAlign: "center" }}>
      <button onClick={onDone} aria-label="Fermer" style={{
        position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,0.18)", border: "none",
        borderRadius: "50%", width: 34, height: 34, color: "#fff", fontSize: 16, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

      <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "50%", padding: 22, marginBottom: 22 }}>
        <Icon size={36} color="#fff" />
      </div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 600, marginBottom: 10 }}>{slide.title}</div>
      <div style={{ fontSize: T.body, opacity: 0.9, lineHeight: 1.5, maxWidth: 280 }}>{slide.text}</div>

      <div style={{ display: "flex", gap: 6, marginTop: 28, marginBottom: 28 }}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <span key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 4, background: i === step ? "#fff" : "rgba(255,255,255,0.4)", transition: "all .3s" }} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>Précédent</button>
        )}
        <button onClick={() => last ? onDone() : setStep(step + 1)} style={{ flex: 2, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 700, fontSize: T.body, cursor: "pointer" }}>
          {last ? "Commencer" : "Suivant"}
        </button>
      </div>
      <button onClick={onDone} style={{ marginTop: 18, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "8px 20px", color: "#fff", fontSize: T.body, fontWeight: 600, cursor: "pointer" }}>Passer l'introduction</button>
      {last && (
        <div style={{ fontSize: T.meta, opacity: 0.85, marginTop: 16, maxWidth: 280 }}>
          En continuant, tu acceptes notre politique de confidentialité (consultable à tout moment depuis l'accueil → À propos & Informations légales).
        </div>
      )}
    </div>
  );
}

export function CitoyenNouveauMotDePasse({ token, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function valider() {
    if (newPassword.length < 8) return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password: newPassword }, token);
    setBusy(false);
    if (error) { setError(error.message || "Erreur lors du changement de mot de passe."); return; }
    onDone();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--c-bg)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 360, width: "100%", background: "var(--c-surface)", borderRadius: 16, padding: 20, border: "1px solid var(--c-border)" }}>
        <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>Nouveau mot de passe</div>
        <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginBottom: 14 }}>Choisis un nouveau mot de passe pour ton compte.</div>
        <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (8 caractères min.)"
          style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 10 }} />
        {error && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
        <button onClick={valider} disabled={busy || newPassword.length < 8} style={{
          width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
          background: newPassword.length < 8 ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
          cursor: newPassword.length < 8 ? "default" : "pointer" }}>
          {busy ? "…" : "Valider"}
        </button>
      </div>
    </div>
  );
}
