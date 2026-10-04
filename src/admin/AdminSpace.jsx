import { useEffect, useState } from "react";
import { AdminActualites, AdminEvenements } from "./AdminContenu.jsx";
import { AdminEnquetes } from "./AdminEnquetes.jsx";
import { AdminContenuEnv, AdminOrganisations } from "./AdminOrganisations.jsx";
import { AdminRapports } from "./AdminRapports.jsx";
import { AdminAbusSignalements, AdminConnexions, AdminHistorique, AdminMfaPanel, AdminSecurite, ConfirmActionModal } from "./AdminSecurite.jsx";
import { AdminBenevoles, AdminSuppressions } from "./AdminUtilisateurs.jsx";
import { AdminVerification } from "./Verification.jsx";
import { ADMIN_LOGIN_MAX_TENTATIVES, ADMIN_LOGIN_VERROUILLAGE_MS, CATEGORIES_ADMIN, EMAILS_EXEMPTES_2FA_OBLIGATOIRE, MOTIF_LABELS_ADMIN, MOTIF_OPTIONS_ADMIN, ORGANISME_LABELS, ORGANISME_OPTIONS, categorieDuPanel } from "./constants.js";
import { ExigencesMotDePasseAdmin, PasswordInput, evaluerForceMotDePasseAdmin } from "../components/PasswordInput.jsx";
import { IconClock, IconLock, IconLogOut, IconTrash, IconTree, IconUserCircle, IconUsers } from "../components/icons.jsx";
import { MediaThumb, MediaThumbSmall } from "../components/media.jsx";
import { NotifBell } from "../components/shell.jsx";
import { Screen, SectionTitle, StatCard } from "../components/ui.jsx";
import { logAudit } from "../lib/audit.js";
import { FicheEnvironnementale, URGENCE, categorieMeta } from "../lib/categories.jsx";
import { alerterErreurLien } from "../lib/i18n.js";
import { subscribeToPush } from "../lib/push.js";
import { AUTH_URL, SUPABASE_KEY, decoderJwtPayload, persistActiveSession, supabase, urlRedirectionAuth } from "../lib/supabase.js";
import { PRIORITE_INFO, PRIORITE_ORDRE, calculerPriorite } from "../lib/utils.js";
import { T } from "../lib/typo.jsx";

export function AdminSpace({ signalements: signalementsProp, arbres, onUpdateStatut, onResolve, onValidate, onValidateArbre, onDelete, onSoftDeleteArbre, onRevertModeration, onSoftDeleteSignalement, onRestaurerItem, onRafraichir, rafraichissementEnCours, onExit }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // null = en cours de vérification
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("attente");
  const [panel, setPanel] = useState("signalements");
  const [moderationModal, setModerationModal] = useState(null);
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [welcomeSession, setWelcomeSession] = useState(false); // true = vient de cliquer le lien reçu par e-mail
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // Verrouillage local après plusieurs échecs de connexion successifs (voir constantes
  // ADMIN_LOGIN_MAX_TENTATIVES / ADMIN_LOGIN_VERROUILLAGE_MS ci-dessus).
  const [tentativesEchouees, setTentativesEchouees] = useState(0);
  const [verrouJusqua, setVerrouJusqua] = useState(null);
  const [maintenant, setMaintenant] = useState(Date.now());
  useEffect(() => {
    if (!verrouJusqua) return;
    const id = setInterval(() => setMaintenant(Date.now()), 500);
    return () => clearInterval(id);
  }, [verrouJusqua]);
  const secondesRestantes = verrouJusqua ? Math.max(0, Math.ceil((verrouJusqua - maintenant) / 1000)) : 0;
  const estVerrouille = verrouJusqua !== null && secondesRestantes > 0;
  useEffect(() => { if (verrouJusqua && secondesRestantes === 0) { setVerrouJusqua(null); setTentativesEchouees(0); } }, [secondesRestantes, verrouJusqua]);

  // ===== Double authentification (2FA) : step-up post-connexion =====
  // Après un signInWithPassword réussi, la session est au niveau aal1. Si le compte a déjà un
  // facteur TOTP vérifié, on exige un code avant de laisser passer vers le tableau de bord (accès
  // à des données sensibles). "session" ci-dessous n'est pas encore déclaré à cet endroit du
  // composant (défini plus bas) : ces états seront réutilisés depuis le rendu, où "session" existe.
  const [mfaChallenge, setMfaChallenge] = useState(null); // { factorId, challengeId }
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaError, setMfaError] = useState("");
  // Le flux public/partagé (carte, accueil) passe désormais par une vue restreinte qui masque
  // des champs sensibles (citoyen_id, coordonnées de bénévoles, notes de modération...). L'admin,
  // authentifié, a le droit de tout voir : on recharge donc ici sa propre copie complète depuis la
  // table brute plutôt que de dépendre du flux public déjà filtré en amont.
  const [signalementsAdmin, setSignalementsAdmin] = useState(null);
  async function chargerSignalementsAdmin() {
    const { data } = await supabase.from("signalements").select("*").eq("is_deleted", false).order("created_at", { ascending: false }).limit(2000);
    if (data) setSignalementsAdmin(data);
  }
  useEffect(() => { if (isAdmin) chargerSignalementsAdmin(); }, [isAdmin]);
  // Les actions admin (valider/résoudre/supprimer…) mettent à jour l'état partagé de l'app de
  // façon optimiste (setSignalements côté App). On répercute ces changements dans notre propre
  // copie ici, en ne touchant que les champs communs — les champs admin-only (modération,
  // bénévole, citoyen_id) absents de la vue publique restreinte sont préservés tels quels.
  useEffect(() => {
    if (signalementsAdmin === null || !signalementsProp) return;
    setSignalementsAdmin(prev => {
      const byId = new Map(prev.map(s => [s.id, s]));
      signalementsProp.forEach(sp => {
        const existing = byId.get(sp.id);
        byId.set(sp.id, existing ? { ...existing, ...sp } : sp);
      });
      return Array.from(byId.values());
    });
  }, [signalementsProp]);
  const signalements = signalementsAdmin !== null ? signalementsAdmin : (signalementsProp || []);

  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!token) return;

    if (type === "recovery") {
      setRecoveryToken(token);
      return;
    }
    // Lien de création de compte (signup / magiclink / invite) : on connecte directement
    // puis on demande de choisir un mot de passe.
    (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/user`, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
        const user = await res.json().catch(() => null);
        persistActiveSession({ access_token: token, refresh_token: refreshToken, user });
        setSession({ access_token: token, refresh_token: refreshToken, user });
        setWelcomeSession(true);
        window.location.hash = "";
      } catch (e) { console.error("Connexion par lien :", e); alerterErreurLien(); }
    })();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Niveau d'assurance de la session courante et présence d'un facteur TOTP déjà vérifié sur le
  // compte. Tant que aal2 n'est pas atteint alors qu'un facteur existe, on bloque l'accès au
  // tableau de bord (voir écran de step-up plus bas) — y compris la vérification des droits admin,
  // qui ne doit pas s'exécuter avant que la double authentification soit validée.
  const aal = session && session.access_token ? (decoderJwtPayload(session.access_token) || {}).aal : null;
  const facteursTotpVerifies = (session && session.user && session.user.factors) ? session.user.factors.filter(f => f.factor_type === "totp" && f.status === "verified") : [];
  // Exemption explicite (voir EMAILS_EXEMPTES_2FA_OBLIGATOIRE) : calculée ici pour couvrir aussi
  // bien le step-up (facteur déjà activé) que l'obligation d'inscription plus bas.
  const emailSession = (session && session.user && session.user.email || "").toLowerCase();
  const exempte2fa = EMAILS_EXEMPTES_2FA_OBLIGATOIRE.includes(emailSession);
  const mfaStepUpRequis = !!session && aal === "aal1" && facteursTotpVerifies.length > 0 && !exempte2fa;

  useEffect(() => {
    if (!mfaStepUpRequis || mfaChallenge) return;
    const factorId = facteursTotpVerifies[0].id;
    setMfaError("");
    supabase.auth.mfa.challenge({ factorId }).then(({ data, error }) => {
      if (error) { setMfaError(error.message); return; }
      setMfaChallenge({ factorId, challengeId: data.id });
    });
  }, [mfaStepUpRequis]);

  async function verifierCodeMfa(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!mfaChallenge) return;
    setMfaError(""); setMfaBusy(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfaChallenge.factorId, challengeId: mfaChallenge.challengeId, code: mfaCode.trim(), accessToken: session.access_token });
    setMfaBusy(false);
    if (error) { setMfaError("Code incorrect ou expiré."); return; }
    setMfaCode(""); setMfaChallenge(null);
  }

  useEffect(() => {
    if (!session) { setIsAdmin(null); setIsSuperAdmin(false); return; }
    supabase.from("admins").select("email, role").eq("email", session.user.email).maybeSingle()
      .then(({ data }) => { setIsAdmin(!!data); setIsSuperAdmin(!!data && data.role === "super_admin"); });
  }, [session]);

  // État de verrouillage global du Centre d'EcoVigil, chargé une fois les droits admin confirmés.
  const [centreVerrouille, setCentreVerrouille] = useState(null);
  async function chargerCentreVerrouille() {
    const { data } = await supabase.from("centre_controle_etat").select("*").eq("id", true).maybeSingle();
    setCentreVerrouille(data || { verrouille: false });
  }
  useEffect(() => {
    if (isAdmin) chargerCentreVerrouille();
  }, [isAdmin]);

  async function handleSetNewPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!evaluerForceMotDePasseAdmin(newPassword).valide) { setError("Le mot de passe ne respecte pas toutes les exigences ci-dessous."); return; }
    if (newPassword !== confirmNewPassword) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword }, recoveryToken);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setRecoveryToken(null);
    setNewPassword(""); setConfirmNewPassword("");
    window.location.hash = "";
    setError("Mot de passe mis à jour. Connecte-toi avec ton nouveau mot de passe.");
  }

  async function handleChooseWelcomePassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!evaluerForceMotDePasseAdmin(newPassword).valide) { setError("Le mot de passe ne respecte pas toutes les exigences ci-dessous."); return; }
    if (newPassword !== confirmNewPassword) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword }, session.access_token);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setWelcomeSession(false);
    setNewPassword(""); setConfirmNewPassword("");
  }

  async function handleForgot(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: urlRedirectionAuth(true) });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setError("Un e-mail de réinitialisation a été envoyé si ce compte existe.");
  }

  async function handleSignupOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) { setError("Entre une adresse e-mail valide."); return; }
    setBusy(true);
    // Pré-vérification : n'envoie un lien de création de compte que si l'email a été
    // pré-approuvé par un admin existant (table admins). Empêche n'importe quel visiteur
    // de déclencher l'envoi d'un e-mail "EcoVigil" pour une adresse non autorisée.
    const { data: preapprouve, error: errCheck } = await supabase.rpc("email_est_admin_preapprouve", { p_email: email.trim().toLowerCase() });
    if (errCheck) { setBusy(false); setError("Impossible de vérifier cette adresse pour l'instant. Réessaie."); return; }
    if (!preapprouve) {
      setBusy(false);
      setError("Cette adresse n'a pas été autorisée par un administrateur. Demande à un membre de l'équipe de t'ajouter d'abord dans \"Équipe administrateurs\".");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: urlRedirectionAuth(true) } });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setError("E-mail envoyé ! Ouvre le lien reçu pour choisir ton mot de passe et activer ton compte.");
  }

  async function handleAuth(e) {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (mode === "login" && estVerrouille) {
      setError(`Trop de tentatives échouées. Réessaie dans ${secondesRestantes}s.`);
      return;
    }
    if (!email.trim() || !email.includes("@")) { setError("Entre une adresse e-mail valide."); return; }
    if (!password) { setError("Entre ton mot de passe."); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Connexion réussie : on réinitialise le compteur d'échecs.
        setTentativesEchouees(0);
        setVerrouJusqua(null);
        try {
          if (typeof Notification !== "undefined" && Notification.permission !== "denied") {
            const perm = await Notification.requestPermission();
            if (perm === "granted") subscribeToPush();
          }
        } catch (notifErr) {
          console.error("Notifications indisponibles dans ce contexte :", notifErr);
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: urlRedirectionAuth(true) } });
        if (error) throw error;
        setError("Compte créé. Vérifie ta boîte mail pour confirmer l'adresse, puis connecte-toi.");
      }
    } catch (err) {
      const msg = (err && err.message) ? err.message : "Une erreur est survenue. Réessaie.";
      if (mode === "login" && (msg === "Invalid login credentials" || /invalid/i.test(msg))) {
        // Verrouillage local temporaire après plusieurs échecs successifs, en plus de la limite
        // de débit déjà appliquée côté serveur par Supabase sur cet endpoint.
        const n = tentativesEchouees + 1;
        setTentativesEchouees(n);
        if (n >= ADMIN_LOGIN_MAX_TENTATIVES) {
          setVerrouJusqua(Date.now() + ADMIN_LOGIN_VERROUILLAGE_MS);
          setError(`Trop de tentatives échouées. Réessaie dans ${Math.ceil(ADMIN_LOGIN_VERROUILLAGE_MS / 1000)}s.`);
        } else {
          setError(`Identifiants incorrects. (${ADMIN_LOGIN_MAX_TENTATIVES - n} tentative(s) avant verrouillage temporaire)`);
        }
      } else {
        setError(msg === "Invalid login credentials" ? "Identifiants incorrects." : msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function toggleCentreVerrouille(motif) {
    const nouveauEtat = !(centreVerrouille && centreVerrouille.verrouille);
    const { error } = await supabase.from("centre_controle_etat").update({
      verrouille: nouveauEtat,
      verrouille_par: nouveauEtat ? session.user.email : null,
      verrouille_le: nouveauEtat ? new Date().toISOString() : null,
      motif: nouveauEtat ? (motif || null) : null,
    }).eq("id", true);
    if (!error) {
      logAudit(nouveauEtat ? "verrouillage_centre" : "deverrouillage_centre", "centre_controle", "global", motif || null);
      chargerCentreVerrouille();
    }
    return { error };
  }

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);
  async function handleDeleteAccount() {
    await supabase.from("demandes_suppression").insert({ email: session.user.email, motif: "Demande depuis l'espace administrateur" });
    setDeleteSent(true);
    setTimeout(async () => { await supabase.auth.signOut(); setSession(null); }, 2500);
  }

  if (recoveryToken) {
    return (
      <Screen>
        <SectionTitle sub="Choisis un nouveau mot de passe.">Réinitialisation</SectionTitle>
        <form onSubmit={handleSetNewPassword} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8 }} />
          <PasswordInput value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirme le nouveau mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8 }} />
          <ExigencesMotDePasseAdmin password={newPassword} />
          {error && <div role="alert" style={{ fontSize: T.small, color: error.startsWith("Mot de passe mis") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || !evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "var(--c-text-faint)" : "var(--c-accent-dark)",
            color: "#fff", fontWeight: 600, fontSize: T.body, cursor: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "default" : "pointer" }}>
            {busy ? "..." : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </Screen>
    );
  }

  if (welcomeSession && session) {
    return (
      <Screen>
        <SectionTitle sub={session.user ? session.user.email : ""}>Bienvenue sur EcoVigil</SectionTitle>
        <form onSubmit={handleChooseWelcomePassword} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
            Ton adresse est confirmée. Choisis maintenant un mot de passe pour ton compte administrateur.
          </div>
          <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Choisis un mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8 }} />
          <PasswordInput value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Confirme le mot de passe"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8 }} />
          <ExigencesMotDePasseAdmin password={newPassword} />
          {error && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || !evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "var(--c-text-faint)" : "var(--c-accent-dark)",
            color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: (!evaluerForceMotDePasseAdmin(newPassword).valide || newPassword !== confirmNewPassword) ? "default" : "pointer" }}>
            {busy ? "..." : "Activer mon compte"}
          </button>
        </form>
      </Screen>
    );
  }

  if (mfaStepUpRequis) {
    return (
      <Screen>
        <SectionTitle sub="Entre le code généré par ton application d'authentification.">Double authentification</SectionTitle>
        <form onSubmit={verifierCodeMfa} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code à 6 chiffres" aria-label="Code de double authentification"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 18, letterSpacing: 4, textAlign: "center", marginBottom: 10, boxSizing: "border-box" }} />
          {mfaError && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{mfaError}</div>}
          <button type="submit" disabled={mfaBusy || mfaCode.length !== 6 || !mfaChallenge} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: (mfaCode.length !== 6 || !mfaChallenge) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: (mfaCode.length !== 6 || !mfaChallenge) ? "default" : "pointer", marginBottom: 8 }}>
            {mfaBusy ? "..." : "Valider"}
          </button>
          <button type="button" onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: T.small, cursor: "pointer", padding: 6 }}>← Annuler et se déconnecter</button>
        </form>
      </Screen>
    );
  }

  if (!session) {
    if (mode === "forgot") {
      return (
        <Screen>
          <SectionTitle sub="Reçois un lien pour réinitialiser ton mot de passe.">Mot de passe oublié</SectionTitle>
          <form onSubmit={handleForgot} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Ton adresse e-mail admin" aria-label="Adresse e-mail"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 10, boxSizing: "border-box" }} />
            {error && <div role="alert" style={{ fontSize: T.small, color: error.startsWith("Un e-mail") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
              {busy ? "..." : "Envoyer le lien"}
            </button>
            <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: T.small, cursor: "pointer", padding: 6 }}>← Retour à la connexion</button>
          </form>
          <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer" }}>← Retour à l'app</button>
        </Screen>
      );
    }
    if (mode === "signup") {
      return (
        <Screen>
          <SectionTitle sub="Un lien te sera envoyé pour activer ton compte.">Créer un compte admin</SectionTitle>
          <form onSubmit={handleSignupOtp} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" aria-label="Adresse e-mail"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 4, boxSizing: "border-box" }} />
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.4 }}>
              Conseil : évite une adresse e-mail contenant des informations confidentielles ou sensibles.
            </div>
            {error && <div role="alert" style={{ fontSize: T.small, color: error.startsWith("E-mail envoyé") ? "var(--c-accent)" : "#B5451B", marginBottom: 10 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
              {busy ? "..." : "Envoyer le lien de création"}
            </button>
            <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: T.small, cursor: "pointer", padding: 6 }}>
              Déjà un compte ? Se connecter
            </button>
          </form>
          <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer" }}>← Retour à l'app</button>
        </Screen>
      );
    }
    return (
      <Screen>
        <SectionTitle sub="Réservé à l'équipe de modération.">Centre d'EcoVigil</SectionTitle>
        <form onSubmit={handleAuth} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" aria-label="Adresse e-mail"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" disabled={estVerrouille}
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6 }} />
          <button type="button" onClick={() => { setMode("forgot"); setError(""); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer", padding: 0, marginBottom: 10, display: "block" }}>
            Mot de passe oublié ?
          </button>
          {estVerrouille && (
            <div role="alert" style={{ fontSize: T.small, color: "var(--c-warning-text)", background: "var(--c-warning-bg)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>
              Trop de tentatives échouées. Réessaie dans {secondesRestantes}s.
            </div>
          )}
          {!estVerrouille && error && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{error}</div>}
          <button type="submit" disabled={busy || estVerrouille} style={{
            width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
            background: estVerrouille ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: estVerrouille ? "default" : "pointer", marginBottom: 8 }}>
            {busy ? "..." : estVerrouille ? `Réessaie dans ${secondesRestantes}s` : "Se connecter"}
          </button>
          <button type="button" onClick={() => { setMode("signup"); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: "var(--c-text-secondary)", fontSize: T.small, cursor: "pointer", padding: 6 }}>
            Pas encore de compte admin ? En créer un
          </button>
        </form>
        <button onClick={onExit} style={{ marginTop: 14, background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer" }}>← Retour à l'app</button>
      </Screen>
    );
  }

  if (isAdmin === null) {
    return <Screen><div style={{ textAlign: "center", color: "var(--c-text-muted)", marginTop: 60, fontSize: T.body }}>Vérification des droits…</div></Screen>;
  }

  if (!isAdmin) {
    return (
      <Screen>
        <SectionTitle>Accès refusé</SectionTitle>
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)", fontSize: T.body, color: "var(--c-text-secondary)" }}>
          Le compte <b>{session.user.email}</b> n'a pas les droits administrateur.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={handleLogout} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: T.body }}>Se déconnecter</button>
          <button onClick={onExit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer", fontSize: T.body }}>Retour à l'app</button>
        </div>
      </Screen>
    );
  }

  // Écran bloquant pour tout admin qui n'est pas super_admin quand le Centre d'EcoVigil
  // est verrouillé. Le super_admin, lui, garde toujours l'accès (sinon plus personne ne
  // pourrait déverrouiller).
  if (centreVerrouille && centreVerrouille.verrouille && !isSuperAdmin) {
    return (
      <Screen>
        <SectionTitle>Centre d'EcoVigil verrouillé</SectionTitle>
        <div style={{ background: "var(--c-danger-border-soft)", border: "1px solid #B5451B", borderRadius: 14, padding: 16, fontSize: T.body, color: "var(--c-text)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <IconLock size={16} color="#B5451B" />
            <div style={{ fontWeight: 700, color: "#B5451B" }}>Accès temporairement suspendu</div>
          </div>
          <div style={{ color: "var(--c-text-secondary)", lineHeight: 1.5 }}>
            L'accès admin a été verrouillé par le super-administrateur{centreVerrouille.verrouille_par ? ` (${centreVerrouille.verrouille_par})` : ""}
            {centreVerrouille.verrouille_le ? ` le ${new Date(centreVerrouille.verrouille_le).toLocaleString("fr-FR")}` : ""}.
            {centreVerrouille.motif ? ` Motif : ${centreVerrouille.motif}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={handleLogout} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: T.body }}>Se déconnecter</button>
          <button onClick={onExit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer", fontSize: T.body }}>Retour à l'app</button>
        </div>
      </Screen>
    );
  }

  // Double authentification obligatoire pour tout compte admin (sauf exemption explicite
  // ci-dessus) : tant qu'aucun facteur TOTP vérifié n'est associé au compte, l'accès au tableau
  // de bord est bloqué et l'activation est forcée ici — un mot de passe seul (deviné, réutilisé
  // ailleurs, ou compromis dans une fuite de données externe) ne doit jamais suffire à entrer
  // dans le Centre d'EcoVigil.
  if (isAdmin && facteursTotpVerifies.length === 0 && !exempte2fa) {
    return (
      <Screen>
        <SectionTitle sub="Obligatoire pour tout compte administrateur avant de continuer.">Sécurise ton compte</SectionTitle>
        <AdminMfaPanel session={session} />
        <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginTop: 4, marginBottom: 14 }}>
          Une fois le code confirmé, reconnecte-toi pour accéder au Centre d'EcoVigil.
        </div>
        <button onClick={handleLogout} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: T.body }}>Se déconnecter</button>
      </Screen>
    );
  }

  const resolus = signalements.filter(s => s.statut === "resolu").length;
  const attente = signalements.filter(s => s.statut !== "resolu").length;
  const filtered = signalements.filter(s => filter === "tous" || (filter === "resolu" ? s.statut === "resolu" : s.statut !== "resolu"));

  return (
    <Screen>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <SectionTitle sub={session.user.email}>Centre d'EcoVigil</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NotifBell email={session.user.email} onNavigate={setPanel} />
          <button onClick={() => setConfirmDelete(true)} title="Supprimer mon compte" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 6 }}><IconUserCircle size={18} /></button>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 6 }}><IconLogOut size={18} /></button>
        </div>
      </div>

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200, padding: 20 }} onClick={() => !deleteSent && setConfirmDelete(false)}>
          <div style={{ background: "var(--c-surface)", borderRadius: 16, padding: 20, maxWidth: 340, width: "100%" }} onClick={e => e.stopPropagation()}>
            {deleteSent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 6 }}>Demande enregistrée</div>
                <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>Ton compte et tes données seront supprimés sous 30 jours. Tu vas être déconnecté.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 6 }}>Supprimer ton compte ?</div>
                <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
                  Ton compte ({session.user.email}) et les données qui y sont liées seront définitivement supprimés sous 30 jours. Cette action est irréversible.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>Annuler</button>
                  <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>Supprimer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <StatCard label="En attente" value={attente} unit="" accent="#B5451B" />
        <StatCard label="Résolus" value={resolus} unit="" accent="var(--c-accent)" />
      </div>

      {/* Niveau 1 : catégories thématiques — segmented control pleine largeur, 4 choix max,
          plus lisible qu'une seule rangée de 14 items à faire défiler. Dérivée du panneau actif
          (pas d'état séparé) pour rester synchronisée même en cas d'accès direct à un panneau
          (ex. depuis une notification). */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "var(--c-bg)", borderRadius: 12, padding: 4 }}>
        {CATEGORIES_ADMIN.map(cat => (
          <button key={cat.id} onClick={() => setPanel(cat.panels[0][0])} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 4px", borderRadius: 9, fontSize: T.small, fontWeight: 700, cursor: "pointer",
            border: "none", background: categorieDuPanel(panel) === cat.id ? "var(--c-surface)" : "transparent",
            color: categorieDuPanel(panel) === cat.id ? "var(--c-accent-dark)" : "var(--c-text-muted)",
            boxShadow: categorieDuPanel(panel) === cat.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
            <cat.icon size={13} />{cat.label}
          </button>
        ))}
      </div>

      {/* Niveau 2 : panneaux de la catégorie du panneau actif (3 à 4 items, jamais 14). */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto" }}>
        {(CATEGORIES_ADMIN.find(c => c.id === categorieDuPanel(panel)) || CATEGORIES_ADMIN[0]).panels.map(([id, label, Ic]) => (
          <button key={id} onClick={() => setPanel(id)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 20, fontSize: T.small, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            border: panel === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
            background: panel === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: panel === id ? "#fff" : "var(--c-text-secondary)" }}><Ic size={13} />{label}</button>
        ))}
      </div>

      {panel === "signalements" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={() => { onRafraichir(); chargerSignalementsAdmin(); }} disabled={rafraichissementEnCours} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, fontSize: T.small, fontWeight: 600,
              border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", cursor: rafraichissementEnCours ? "default" : "pointer" }}>
              <IconClock size={13} /> {rafraichissementEnCours ? "Actualisation…" : "Actualiser"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["attente", "En attente"], ["resolu", "Résolus"], ["tous", "Tous"]].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                padding: "6px 12px", borderRadius: 20, fontSize: T.small, fontWeight: 600, cursor: "pointer",
                border: filter === id ? "1px solid var(--c-accent-dark)" : "1px solid var(--c-border)",
                background: filter === id ? "var(--c-accent-dark)" : "var(--c-surface)", color: filter === id ? "#fff" : "var(--c-text-secondary)" }}>{label}</button>
            ))}
          </div>

          <div className="pace-grid-cards" style={{ gap: 10 }}>
            {filtered.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: T.body, textAlign: "center", padding: 20 }}>Aucun signalement ici.</div>}
            {[...filtered].sort((a, b) => PRIORITE_ORDRE[calculerPriorite(b, signalements)] - PRIORITE_ORDRE[calculerPriorite(a, signalements)]).map(s => {
              const cat = categorieMeta(s.categorie);
              const u = URGENCE.find(x => x.id === s.urgence);
              const priorite = calculerPriorite(s, signalements);
              const pInfo = PRIORITE_INFO[priorite];
              return (
                <div key={s.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
                  <MediaThumb src={s.photo_url} style={{ width: "100%", maxHeight: 130, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: T.body }}>{cat.label}</div>
                    <span style={{ fontSize: T.meta, fontWeight: 600, color: u ? u.color : "#B5451B" }}>{u ? u.label : s.urgence}</span>
                  </div>
                  <div style={{ display: "inline-block", fontSize: T.meta, fontWeight: 700, color: "#fff", background: pInfo.color, borderRadius: 999, padding: "2px 8px", marginBottom: 6 }}>{pInfo.label}</div>
                  <FicheEnvironnementale code={s.categorie} />
                  {!s.valide && (
                    <div style={{ fontSize: T.meta, fontWeight: 600, color: "#B5451B", marginBottom: 4 }}>⏳ Non validé — invisible du public</div>
                  )}
                  {s.moderation_motif && (
                    <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 4 }}>Dernière modération : {MOTIF_LABELS_ADMIN[s.moderation_motif] || s.moderation_motif}</div>
                  )}
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 6 }}>{s.date} · appareil {s.device_id ? s.device_id.slice(0, 6) : "?"}</div>
                  {s.benevole_nom && (
                    <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
                      <IconUsers size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                      Signalé par <strong>{s.benevole_nom}</strong>
                      {(s.benevole_ville || s.benevole_pays) && <> — {[s.benevole_ville, s.benevole_pays].filter(Boolean).join(", ")}</>}
                      {s.benevole_quartier && <> ({s.benevole_quartier})</>}
                      {s.benevole_contact && <div>{s.benevole_contact}</div>}
                    </div>
                  )}
                  {s.description && <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginBottom: 8 }}>{s.description}</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!s.valide && (
                      <button onClick={() => { onValidate(s.id); setSignalementsAdmin(prev => prev ? prev.map(x => x.id === s.id ? { ...x, valide: true } : x) : prev); }} style={{
                        flex: "1 1 100%", fontSize: T.small, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                        background: "var(--c-accent-dark)", color: "#fff" }}>
                        ✓ Valider et publier
                      </button>
                    )}
                    {s.valide && (
                      <button onClick={() => setModerationModal({ type: "revert", signalement: s })} style={{
                        flex: "1 1 100%", fontSize: T.meta, padding: "7px 0", borderRadius: 8, border: "1px solid var(--c-warning)", cursor: "pointer", fontWeight: 600,
                        background: "var(--c-warning-bg)", color: "var(--c-warning-text)" }}>
                        ↺ Repasser en vérification
                      </button>
                    )}
                    <button onClick={() => {
                      if (s.statut === "resolu") {
                        onUpdateStatut(s.id, "attente");
                        setSignalementsAdmin(prev => prev ? prev.map(x => x.id === s.id ? { ...x, statut: "attente", resolution_organisme: null, resolution_action: null, resolved_at: null } : x) : prev);
                      } else {
                        setModerationModal({ type: "resolve", signalement: s });
                      }
                    }} style={{
                      flex: 1, fontSize: T.small, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                      background: s.statut === "resolu" ? "var(--c-bg)" : "var(--c-accent)", color: s.statut === "resolu" ? "var(--c-text-secondary)" : "#fff" }}>
                      {s.statut === "resolu" ? "Remettre en attente" : "Marquer résolu"}
                    </button>
                    <button onClick={() => setModerationModal({ type: "delete", signalement: s })} style={{
                      padding: "7px 10px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", cursor: "pointer" }}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                  {s.statut === "resolu" && s.resolution_organisme && (
                    <div style={{ marginTop: 8, fontSize: T.meta, color: "var(--c-text-secondary)", background: "var(--c-success-bg)", borderRadius: 8, padding: "6px 8px" }}>
                      ✓ Résolu par {ORGANISME_LABELS[s.resolution_organisme] || s.resolution_organisme}{s.resolution_action ? ` — ${s.resolution_action}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {moderationModal && moderationModal.type === "revert" && (
        <ConfirmActionModal
          title="Repasser en vérification"
          description="Le signalement redevient invisible du public jusqu'à nouvelle validation. L'auteur sera notifié de cette décision."
          reasonLabel="Détail pour le journal d'audit (obligatoire)"
          confirmLabel="Repasser ce signalement en vérification"
          motifOptions={MOTIF_OPTIONS_ADMIN}
          danger
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onRevertModeration(moderationModal.signalement, payload);
            setSignalementsAdmin(prev => prev ? prev.map(x => x.id === moderationModal.signalement.id ? { ...x, valide: false, statut: "attente", moderation_motif: payload.motif } : x) : prev);
            setModerationModal(null);
          }}
        />
      )}
      {moderationModal && moderationModal.type === "delete" && (
        <ConfirmActionModal
          title="Mettre ce signalement à la corbeille"
          description="Il disparaît immédiatement de l'app et de la carte, mais reste archivé et restaurable par un super-administrateur."
          reasonLabel="Motif de la suppression (obligatoire)"
          confirmLabel="Mettre à la corbeille"
          danger
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onSoftDeleteSignalement(moderationModal.signalement, payload);
            setSignalementsAdmin(prev => prev ? prev.filter(s => s.id !== moderationModal.signalement.id) : prev);
            setModerationModal(null);
          }}
        />
      )}
      {moderationModal && moderationModal.type === "resolve" && (
        <ConfirmActionModal
          title="Marquer comme résolu"
          description="Indique l'organisme responsable de l'action et ce qui a été fait. Ces informations seront visibles publiquement, pour que les citoyens voient l'impact réel de leur signalement."
          reasonLabel="Action réalisée (obligatoire)"
          confirmLabel="Marquer résolu"
          motifOptions={ORGANISME_OPTIONS}
          onCancel={() => setModerationModal(null)}
          onConfirm={async (payload) => {
            await onResolve(moderationModal.signalement, { organisme: payload.motif, action: payload.reason });
            setSignalementsAdmin(prev => prev ? prev.map(x => x.id === moderationModal.signalement.id ? { ...x, statut: "resolu", resolution_organisme: payload.motif, resolution_action: payload.reason, resolved_at: new Date().toISOString() } : x) : prev);
            setModerationModal(null);
          }}
        />
      )}

      {panel === "arbres" && (
        <div className="pace-grid-cards" style={{ gap: 10 }}>
          {arbres.length === 0 && <div style={{ color: "var(--c-text-muted)", fontSize: T.body, textAlign: "center", padding: 20 }}>Aucun arbre enregistré.</div>}
          {[...arbres].reverse().map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-surface)", borderRadius: 12, padding: 10, border: "1px solid var(--c-border)" }}>
              {a.photo_url ? (
                <MediaThumbSmall src={a.photo_url} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-surface-soft)" }}>
                  <IconTree size={18} color="var(--c-accent)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: T.body, color: "var(--c-text)" }}>{a.nom || "Arbre"}</div>
                {!a.valide && (
                  <div style={{ fontSize: T.meta, fontWeight: 600, color: "#B5451B" }}>⏳ Non validé — invisible du public</div>
                )}
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{a.date} · appareil {a.device_id ? a.device_id.slice(0, 6) : "?"}</div>
                {!a.valide && (
                  <button onClick={() => onValidateArbre(a.id)} style={{
                    marginTop: 6, fontSize: T.meta, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600,
                    background: "var(--c-accent-dark)", color: "#fff" }}>
                    ✓ Valider et publier
                  </button>
                )}
              </div>
              <button onClick={() => { if (confirm(`Mettre "${a.nom || "cet arbre"}" à la corbeille ? Il sera restaurable depuis Historique.`)) onSoftDeleteArbre(a); }} aria-label="Supprimer" style={{ background: "none", border: "1px solid var(--c-danger-border-soft)", borderRadius: 8, color: "#B5451B", cursor: "pointer", padding: 7, flexShrink: 0, alignSelf: "flex-start" }}>
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {panel === "actualites" && <AdminActualites />}
      {panel === "evenements" && <AdminEvenements />}
      {panel === "benevoles" && <AdminBenevoles />}

      {panel === "historique" && <AdminHistorique isSuperAdmin={isSuperAdmin} onRestaurerItem={onRestaurerItem} />}
      {panel === "connexions" && <AdminConnexions />}
      {panel === "abus" && <AdminAbusSignalements signalements={signalementsAdmin} />}
      {panel === "securite" && <AdminSecurite session={session} />}
      {panel === "contenu_env" && <AdminContenuEnv isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "organisations" && <AdminOrganisations isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "publications" && <AdminVerification isSuperAdmin={isSuperAdmin} adminEmail={session.user.email} />}
      {panel === "rapports" && <AdminRapports signalements={signalements} arbres={arbres} isSuperAdmin={isSuperAdmin} centreVerrouille={centreVerrouille} onToggleCentre={toggleCentreVerrouille} />}
      {panel === "suppressions" && <AdminSuppressions isSuperAdmin={isSuperAdmin} />}
      {panel === "enquetes" && <AdminEnquetes session={session} />}

      <button onClick={onExit} style={{ marginTop: 18, width: "100%", background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", padding: 8 }}>← Retour à l'app</button>
    </Screen>
  );
}
