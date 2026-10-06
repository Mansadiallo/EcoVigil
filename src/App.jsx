import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { LOGO_DATA_URL } from "./imagesData.js";
import { IconBell, IconCalendar, IconClock, IconDroplet, IconGlobe, IconHome, IconLock, IconMaximize, IconMenu, IconSearch, IconShield, IconSparkles, IconSun, IconTarget, IconUserCircle, IconUsers, IconWifiOff } from "./components/icons.jsx";
import { CitoyenNouveauMotDePasse, MenuHamburger, NotifBell, Onboarding, SplashScreen, TABS, ThemePanel, verrouillerOrientation } from "./components/shell.jsx";
import { BoundaireErreur, EcranChargement } from "./components/ChargementEcran.jsx";
import { Screen } from "./components/ui.jsx";
import { capturerConnexionParZone, envoyerDemandeSuppression, inscrireBenevole, logActivity, logAudit } from "./lib/audit.js";
import { categorieMeta, chargerTaxonomiePubliee } from "./lib/categories.jsx";
import { RTL_LANGS, alerterErreurLien, t } from "./lib/i18n.js";
import { dequeuePendingAction, enqueuePendingAction, loadPendingQueue, savePendingQueue, syncOneDossierEnquete } from "./lib/offline.js";
import { subscribeToPush } from "./lib/push.js";
import { AUTH_URL, DEVICE_ID, SUPABASE_KEY, authListeners, currentSession, ensureDeviceSession, enterAdminIdentity, exitAdminIdentity, getActiveSession, getBenevoleInfo, persistSession, refreshSessionIfNeeded, retirerEcouteurAuth, supabase } from "./lib/supabase.js";
import { checkLimiteFrequence, distanceMetres } from "./lib/utils.js";
import { Accueil } from "./screens/Accueil.jsx";
import { MonArbre } from "./screens/MonArbre.jsx";
import { BenevoleAccesBloque, OrganisationCard } from "./screens/Organisation.jsx";
import { MurProfilObligatoire, ProfilTab } from "./screens/Profil.jsx";
import { Signaler } from "./screens/Signaler.jsx";
import { FONT_TEXTE, T } from "./lib/typo.jsx";

/* Écrans lourds chargés à la demande : le navigateur ne télécharge leur code qu'à la première ouverture. */
const AdminSpace = lazy(() => import("./admin/AdminSpace.jsx").then((m) => ({ default: m.AdminSpace })));
const EnquetesTerrain = lazy(() => import("./enquetes/EnquetesTerrain.jsx").then((m) => ({ default: m.EnquetesTerrain })));
const AssistantIA = lazy(() => import("./screens/Assistant.jsx").then((m) => ({ default: m.AssistantIA })));
const Biodiversite = lazy(() => import("./screens/Biodiversite.jsx").then((m) => ({ default: m.Biodiversite })));
const Carte = lazy(() => import("./screens/Carte.jsx").then((m) => ({ default: m.Carte })));
const Confidentialite = lazy(() => import("./screens/Confidentialite.jsx").then((m) => ({ default: m.Confidentialite })));
const EspaceOrganisation = lazy(() => import("./screens/EspaceOrganisation.jsx").then((m) => ({ default: m.EspaceOrganisation })));
const Evenements = lazy(() => import("./screens/Evenements.jsx").then((m) => ({ default: m.Evenements })));
const GroupesTerrain = lazy(() => import("./screens/GroupesTerrain.jsx").then((m) => ({ default: m.GroupesTerrain })));

function App() {
  // Deep-linking depuis la page d'accueil publique (pace-accueil.html) ou tout lien externe :
  // ?tab=carte|signaler|arbre  → ouvre directement l'onglet correspondant
  // ?admin=1                         → ouvre le Centre d'EcoVigil
  // Lecture unique au montage, ne modifie aucun comportement existant si absent de l'URL.
  const initialUrlState = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      const validTabs = ["accueil", "carte", "signaler", "arbre"];
      let initialTab = "accueil";
      if (t && validTabs.includes(t)) initialTab = t;
      if (params.get("membre_code")) initialTab = "compte_org"; // lien d'invitation WhatsApp : ouvre l'écran Compte organisation
      return { initialTab, initialAdmin: params.get("admin") === "1" };
    } catch (e) {
      return { initialTab: "accueil", initialAdmin: false };
    }
  }, []);

  const [tab, setTab] = useState(initialUrlState.initialTab);
  const [showAdmin, setShowAdmin] = useState(initialUrlState.initialAdmin);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem("pace-onboarded"); } catch (e) { return false; }
  });
  const [showSplash, setShowSplash] = useState(true);
  const [citoyenSession, setCitoyenSession] = useState(undefined); // undefined = en cours de vérification, null = pas connecté
  useEffect(() => {
    // Lit et écoute directement le store citoyen (currentSession/authListeners), plutôt que via
    // supabase.auth.getSession()/onAuthStateChange() qui suivent l'identité active du moment
    // (activeIdentity). Ce watcher tourne toujours, même quand on arrive directement sur
    // ?admin=1 (où activeIdentity démarre sur "admin") : il doit rester en permanence isolé du
    // Centre d'EcoVigil pour qu'un compte admin connecté ne "prenne" jamais la place du profil
    // citoyen, ni l'inverse.
    setCitoyenSession(currentSession || null);
    const cb = (_e, s) => setCitoyenSession(s);
    authListeners.push(cb);
    return () => { retirerEcouteurAuth(cb); };
  }, []);
  // Statistiques d'usage par zone géographique pour le Centre d'EcoVigil : une seule fois par
  // ouverture de l'app, pour tout utilisateur (citoyen anonyme ou compte admin/organisation).
  useEffect(() => { capturerConnexionParZone(); }, []);

  // Reprise d'identité bénévole : le statut de bénévole (et les groupes, dossiers d'enquête et
  // signalements qui lui sont rattachés) est lié à l'identifiant d'appareil, stocké par domaine
  // dans le navigateur. Sur un nouveau domaine ou un nouvel appareil, le bénévole se connecte avec
  // son profil, puis reprend ici son identifiant d'appareil d'origine (renvoyé uniquement au
  // titulaire du profil par la fonction Supabase benevole_device_du_profil). Un seul rechargement :
  // une fois les deux identifiants identiques, plus rien ne se déclenche.
  useEffect(() => {
    if (showAdmin) return;
    if (!citoyenSession || !citoyenSession.user || !citoyenSession.user.email) return;
    (async () => {
      try {
        const { data } = await supabase.rpc("benevole_device_du_profil");
        if (typeof data === "string" && data && data !== DEVICE_ID) {
          localStorage.setItem("pace-device-id", data);
          window.location.reload();
        }
      } catch (e) { /* best-effort : en cas d'échec, l'accès reste celui de l'appareil courant */ }
    })();
  }, [citoyenSession, showAdmin]);

  // Charge une fois la taxonomie publiée (défis/problèmes) dans le cache global partagé par
  // categorieLabel/categorieMeta, puis force un re-render pour que tout l'affichage déjà monté
  // (accueil, carte, historique admin...) se mette à jour avec les nouveaux libellés/icônes.
  const [, forceTaxoRefresh] = useState(0);
  useEffect(() => { chargerTaxonomiePubliee().then(() => forceTaxoRefresh(v => v + 1)); }, []);

  // Traite le lien reçu par e-mail (confirmation d'inscription bénévole, magic link, ou
  // récupération de mot de passe) quand un citoyen clique dessus et arrive sur l'app côté
  // public — jusqu'ici ce hash n'était traité que dans le panneau Admin, donc un bénévole
  // qui confirmait son compte n'obtenait jamais de session côté citoyen malgré la validation
  // admin de son inscription.
  const [citoyenRecoveryToken, setCitoyenRecoveryToken] = useState(null);
  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.includes("access_token")) return;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/user`, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
        const user = await res.json().catch(() => null);
        persistSession({ access_token: token, refresh_token: refreshToken, user });
        if (type === "recovery") setCitoyenRecoveryToken(token);
        window.location.hash = "";
      } catch (e) { console.error("Connexion par lien :", e); alerterErreurLien(); }
    })();
  }, []);

  // Statut bénévole de cet appareil : null tant qu'aucune inscription n'existe (accès libre en tant que citoyen).
  // Un enregistrement existant bloque l'accès au contenu tant qu'il n'est pas "valide" (voir Centre d'EcoVigil > Bénévoles).
  // Sans compte email/mot de passe (retiré), l'identité est de nouveau uniquement le device_id.
  // La lecture passe par la vue benevoles_statut_public (device_id + statut uniquement, aucune
  // donnée personnelle) plutôt que par la table benevoles directement, dont le SELECT public
  // n'existe plus depuis la correction de la fuite de vie privée.
  const [benevoleStatut, setBenevoleStatut] = useState(() => {
    try { return localStorage.getItem("pace-benevole-statut") || null; } catch (e) { return null; }
  });
  // Si un statut est déjà en cache local, l'accès est accordé immédiatement (pas d'attente
  // réseau) : un bénévole déjà validé garde son accès même hors ligne ou après une perte de
  // connexion. La vérification serveur tourne quand même en tâche de fond pour détecter un
  // changement de statut (suspension, etc.) dès que la connexion est disponible.
  const [benevoleStatutChargement, setBenevoleStatutChargement] = useState(() => {
    try { return !localStorage.getItem("pace-benevole-statut"); } catch (e) { return true; }
  });
  useEffect(() => {
    supabase.from("benevoles_statut_public").select("statut").eq("device_id", DEVICE_ID).order("statut", { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Réponse serveur claire : statut à jour, on le met en cache.
          const s = data[0].statut || "valide";
          setBenevoleStatut(s);
          try { localStorage.setItem("pace-benevole-statut", s); } catch (e) {}
        } else if (data) {
          // Réponse serveur claire mais vide : vraiment aucune inscription pour cet appareil
          // (pas une panne réseau, data est un tableau, pas null) — on efface le cache.
          setBenevoleStatut(null);
          try { localStorage.removeItem("pace-benevole-statut"); } catch (e) {}
        }
        // data === null : échec réseau. On ne touche pas au statut, on garde la valeur déjà
        // en cache (accès déjà validé précédemment) plutôt que de bloquer l'accès à tort.
        setBenevoleStatutChargement(false);
      });
  }, []);
  const accesBloque = benevoleStatut && benevoleStatut !== "valide";
  const estBenevoleValide = benevoleStatut === "valide";

  // Statut d'un compte Organisation (ONG/Gouvernement) : basé sur un vrai compte email/mot de
  // passe pour le compte principal, ou sur une session (éventuellement anonyme) ayant rejoint
  // via un code d'invitation pour un membre (citoyenSession dans les deux cas, pas device_id).
  // Nécessite une session active pour être vérifié — contrairement au bénévole, il faut se
  // connecter (ou resaisir son code) sur chaque nouvel appareil.
  // Statut organisation mis en cache localement (par utilisateur), comme le statut bénévole : un
  // membre d'organisation validé garde son accès sans connexion. La vérification serveur tourne
  // en tâche de fond ; seule une réponse serveur claire modifie ou efface le cache — jamais un
  // échec réseau.
  const CLE_CACHE_ORG = "pace-org-cache";
  function lireOrgCache(userId) {
    try {
      const o = JSON.parse(localStorage.getItem(CLE_CACHE_ORG) || "null");
      return o && o.id === userId ? o : null;
    } catch (e) { return null; }
  }
  function ecrireOrgCache(userId, org) {
    try {
      if (org) localStorage.setItem(CLE_CACHE_ORG, JSON.stringify({ id: userId, statut: org.statut, etape: org.etape || null, motif: org.motif || null }));
      else localStorage.removeItem(CLE_CACHE_ORG);
    } catch (e) {}
  }
  const orgCacheInitial = (() => {
    const uid = currentSession && currentSession.user && currentSession.user.id;
    return uid ? lireOrgCache(uid) : null;
  })();
  const [organisationStatut, setOrganisationStatut] = useState(orgCacheInitial ? orgCacheInitial.statut : null);
  const [organisationEtapeDossier, setOrganisationEtapeDossier] = useState(orgCacheInitial ? orgCacheInitial.etape : null);
  const [organisationEtapeMotif, setOrganisationEtapeMotif] = useState(orgCacheInitial ? orgCacheInitial.motif : null);
  // Avec un statut en cache, pas d'attente réseau (même principe que benevoleStatutChargement).
  const [organisationChargement, setOrganisationChargement] = useState(!orgCacheInitial);
  useEffect(() => {
    if (citoyenSession === undefined) return; // session en cours de résolution
    if (!citoyenSession || !citoyenSession.user || !citoyenSession.user.id) {
      setOrganisationStatut(null);
      setOrganisationEtapeDossier(null); setOrganisationEtapeMotif(null);
      ecrireOrgCache(null, null);
      setOrganisationChargement(false);
      return;
    }
    const emailSession = citoyenSession.user.email || null;
    const userIdSession = citoyenSession.user.id;
    // Applique une réponse serveur claire (organisation trouvée) et la met en cache.
    function appliquerOrg(org) {
      setOrganisationStatut(org.statut);
      setOrganisationEtapeDossier(org.etape_dossier); setOrganisationEtapeMotif(org.etape_dossier_motif);
      ecrireOrgCache(userIdSession, { statut: org.statut, etape: org.etape_dossier, motif: org.etape_dossier_motif });
      setOrganisationChargement(false);
    }
    (async () => {
      // Confirme automatiquement toute invitation de membre en attente pour cet e-mail (ex.
      // après un clic sur le lien reçu il y a longtemps, pour les tout premiers membres
      // invités par e-mail) — best-effort, ne bloque jamais l'accès. Les membres par code
      // d'invitation sont confirmés directement par org_membre_rejoindre, pas ici.
      if (emailSession) { try { await supabase.rpc("org_membre_confirmer"); } catch (e) { console.error("org_membre_confirmer :", e); } }

      // Le compte principal se connecte toujours par e-mail : sans e-mail sur la session
      // (cas d'un membre par code, via une session possiblement anonyme), on saute
      // directement à la recherche via org_membres.
      let data = [];
      if (emailSession) {
        const res = await supabase.from("organisations").select("statut, type, etape_dossier, etape_dossier_motif").eq("email", emailSession).eq("is_deleted", false).order("created_at", { ascending: false }).limit(1);
        if (res.error) { setOrganisationChargement(false); return; } // échec réseau : on garde le statut en cache
        data = res.data;
      }
      if (data && data.length > 0) { appliquerOrg(data[0]); return; }
      if (data && data.length === 0) {
        // Pas de compte principal à cette identité : peut-être un membre confirmé d'une
        // organisation, identifié par e-mail (tout premiers membres) ou par user_id
        // (membres ayant rejoint via un code d'invitation).
        let membreQuery = supabase.from("org_membres").select("organisation_id").eq("statut", "actif").limit(1);
        membreQuery = emailSession ? membreQuery.eq("email", emailSession) : membreQuery.eq("user_id", userIdSession);
        const { data: membreData, error: membreErr } = await membreQuery.maybeSingle();
        if (membreErr) { setOrganisationChargement(false); return; } // échec réseau : on garde le cache
        if (membreData) {
          const { data: orgData, error: orgErr } = await supabase.from("organisations").select("statut, type, etape_dossier, etape_dossier_motif").eq("id", membreData.organisation_id).eq("is_deleted", false).maybeSingle();
          if (orgErr) { setOrganisationChargement(false); return; } // échec réseau : on garde le cache
          if (orgData) { appliquerOrg(orgData); return; }
        }
        // Réponse serveur claire : aucune organisation pour cette identité.
        setOrganisationStatut(null);
        setOrganisationEtapeDossier(null); setOrganisationEtapeMotif(null);
        ecrireOrgCache(null, null);
      }
      setOrganisationChargement(false);
    })();
  }, [citoyenSession]);
  const estOrganisationValidee = organisationStatut === "valide";
  const accesEtendu = estBenevoleValide || estOrganisationValidee; // bénévole validé OU organisation validée

  // Profil de base (e-mail + mot de passe) : préalable requis avant de devenir bénévole ou de
  // créer un compte organisation. Partage la même citoyenSession que le compte organisation —
  // un profil n'est pas un compte organisation, mais utilise le même mécanisme d'authentification.
  // Le profil est mis en cache localement (comme le statut bénévole) : sans connexion, la lecture
  // de profils_comptes échoue, et l'app concluait à tort « aucun profil » en affichant la création.
  const CLE_CACHE_PROFIL = "pace-profil-cache";
  function lireProfilCache(userId) {
    try {
      const o = JSON.parse(localStorage.getItem(CLE_CACHE_PROFIL) || "null");
      return o && o.id === userId ? o.profil : null;
    } catch (e) { return null; }
  }
  function ecrireProfilCache(userId, profil) {
    try {
      if (profil) localStorage.setItem(CLE_CACHE_PROFIL, JSON.stringify({ id: userId, profil }));
      else localStorage.removeItem(CLE_CACHE_PROFIL);
    } catch (e) {}
  }
  // Valeur initiale : si une session existe déjà, le profil en cache s'affiche immédiatement
  // (aucune attente réseau) ; la vérification serveur tourne ensuite en tâche de fond.
  const [profilInfo, setProfilInfo] = useState(() => {
    const uid = currentSession && currentSession.user && currentSession.user.id;
    return (uid && lireProfilCache(uid)) || undefined; // undefined = en cours, null = aucun profil
  });
  async function rafraichirProfil() {
    const user = citoyenSession && citoyenSession.user;
    if (!user || !user.id) { setProfilInfo(null); ecrireProfilCache(null, null); return; }
    let data = null, echec = false;
    try {
      const res = await supabase.from("profils_comptes").select("nom, email, pays, ville, photo_url").eq("id", user.id).maybeSingle();
      data = res.data || null;
      echec = !!res.error || (!res.data && typeof navigator !== "undefined" && navigator.onLine === false);
    } catch (e) { echec = true; }
    if (echec) {
      // Panne réseau : on n'en déduit surtout pas « aucun profil ». On garde l'affichage actuel,
      // sinon le cache local, sinon (compte avec e-mail) les infos saisies à l'inscription.
      const meta = user.user_metadata || {};
      const depuisSession = user.email ? { nom: meta.nom || user.email, email: user.email, pays: meta.pays || null, ville: meta.ville || null, photo_url: meta.photo_url || null } : null;
      setProfilInfo(prev => prev || lireProfilCache(user.id) || depuisSession || null);
      return;
    }
    setProfilInfo(data);
    ecrireProfilCache(user.id, data);
  }
  useEffect(() => {
    if (citoyenSession === undefined) return;
    rafraichirProfil();
  }, [citoyenSession]);

  const statutEnCours = benevoleStatutChargement || organisationChargement;
  const ecransReserves = ["carte", "signaler", "arbre", "biodiversite", "assistant"];

  // Garde-fou : si le tab courant est réservé et que le citoyen est confirmé non-bénévole,
  // on le ramène sur Accueil. On attend que le statut soit résolu (statutEnCours) avant de
  // trancher, pour ne jamais faire d'aller-retour inutile pour un bénévole validé qui ouvre
  // un lien direct vers un onglet réservé.
  useEffect(() => {
    if (statutEnCours) return;
    if (ecransReserves.includes(tab) && !accesEtendu) setTab("accueil");
    if (tab === "espace_org" && !estOrganisationValidee) setTab("accueil");
    if (tab === "compte_org" && estOrganisationValidee) setTab("espace_org");
  }, [tab, accesEtendu, estOrganisationValidee, statutEnCours]);

  const [themeSection, setThemeSection] = useState(null); // section du panneau d'affichage ouverte (null = fermé)
  const [showMenu, setShowMenu] = useState(false);

  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem("pace-theme-mode") || "system"; } catch (e) { return "system"; }
  });
  const [accent, setAccent] = useState(() => {
    try { return localStorage.getItem("pace-theme-accent") || "green"; } catch (e) { return "green"; }
  });
  const [systemDark, setSystemDark] = useState(() => {
    try { return window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
  });

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => setSystemDark(e.matches);
      mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
      return () => { mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler); };
    } catch (e) {}
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemDark);

  function updateThemeMode(mode) {
    setThemeMode(mode);
    try { localStorage.setItem("pace-theme-mode", mode); } catch (e) {}
  }
  function updateAccent(a) {
    setAccent(a);
    try { localStorage.setItem("pace-theme-accent", a); } catch (e) {}
  }

  // Point 3 : accessibilité — langue de l'interface (FR/EN pour commencer)
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("pace-lang") || "fr"; } catch (e) { return "fr"; }
  });
  function updateLang(l) {
    setLang(l);
    try { localStorage.setItem("pace-lang", l); } catch (e) {}
  }

  // Format d'affichage des coordonnées GPS : degré décimal, degré/minute/seconde, ou UTM.
  const [coordFormat, setCoordFormat] = useState(() => {
    try { return localStorage.getItem("pace-coord-format") || "dd"; } catch (e) { return "dd"; }
  });
  function updateCoordFormat(f) {
    setCoordFormat(f);
    try { localStorage.setItem("pace-coord-format", f); } catch (e) {}
  }

  // Orientation de l'affichage : "auto" (suit l'appareil), "portrait" ou "paysage". La disposition s'adapte
  // toujours (classe orient-* sur le conteneur) ; le verrouillage réel de l'écran n'est tenté que si
  // l'appareil l'autorise (Screen Orientation API : appli installée / plein écran sur Android, pas sur iOS).
  const [orientation, setOrientation] = useState(() => {
    try { return localStorage.getItem("pace-orientation") || "auto"; } catch (e) { return "auto"; }
  });
  function updateOrientation(o) {
    setOrientation(o);
    try { localStorage.setItem("pace-orientation", o); } catch (e) {}
    verrouillerOrientation(o);
  }
  useEffect(() => {
    const so = typeof screen !== "undefined" ? screen.orientation : null;
    if (!so) return;
    try {
      if (orientation === "auto") { if (so.unlock) so.unlock(); }
      else if (so.lock) { const r = so.lock(orientation === "portrait" ? "portrait" : "landscape"); if (r && r.catch) r.catch(() => {}); }
    } catch (e) {}
  }, [orientation]);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      subscribeToPush();
    }
  }, []);

  useEffect(() => {
    refreshSessionIfNeeded();
    const t = setInterval(refreshSessionIfNeeded, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const [signalements, setSignalements] = useState([]);
  const [arbres, setArbres] = useState([]);
  const [enquetesCarte, setEnquetesCarte] = useState([]);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [notifState, setNotifState] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [actualites, setActualites] = useState([]);
  const [observations, setObservations] = useState([]);
  const [suivis, setSuivis] = useState([]);
  const [pendingQueueCount, setPendingQueueCount] = useState(() => loadPendingQueue().length);
  const flushInProgressRef = useRef(false);

  useEffect(() => {
    const goOnline = () => { setOnline(true); flushPendingQueue(); };
    const goOffline = () => setOnline(false);
    const onQueueUpdated = () => setPendingQueueCount(loadPendingQueue().length);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("pace-queue-updated", onQueueUpdated);
    if (navigator.onLine) flushPendingQueue();
    const retryTimer = setInterval(() => { if (navigator.onLine) flushPendingQueue(); }, 20000);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); window.removeEventListener("pace-queue-updated", onQueueUpdated); clearInterval(retryTimer); };
  }, []);

  // Retour de la connexion : relit le profil pour rafraîchir le cache local (effet séparé de celui
  // ci-dessus, dont les écouteurs sont figés au premier rendu et ne verraient pas la session à jour).
  useEffect(() => {
    if (online && citoyenSession !== undefined) rafraichirProfil();
  }, [online]);

  function enableNotif() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then((perm) => {
      setNotifState(perm);
      if (perm === "granted") subscribeToPush();
    });
  }

  async function adminUpdateStatut(id, next) {
    const clear = next !== "resolu" ? { resolution_organisme: null, resolution_action: null, resolved_at: null } : {};
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, statut: next, ...clear } : s));
    const { error } = await supabase.from("signalements").update({ statut: next, ...clear }).eq("id", id);
    if (error) {
      console.error("Erreur de mise à jour du statut :", error);
      alert("Action refusée par le serveur (droits admin requis).");
    } else {
      logActivity(next === "resolu" ? "resolution" : "reouverture", "signalements", id);
      if (next === "resolu") {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try { new Notification("Signalement mis à jour", { body: "Un signalement a été marqué comme résolu.", icon: "./icon-192.png" }); } catch (e) {}
        }
        const s = signalements.find(x => x.id === id);
        if (s && s.device_id) {
          supabase.from("notifications").insert({
            destinataire: s.device_id,
            message: "Ton signalement a été marqué comme résolu.",
            lien: "carte",
          }).catch(() => {});
        }
      }
    }
  }

  // Le bénévole/citoyen à l'origine d'un signalement est sur le terrain et sait en temps réel
  // si le problème a été traité ou non : il peut donc basculer lui-même le statut de SES PROPRES
  // signalements, sans passer par l'admin.
  // Sécurité : contrairement à une première version qui ne comparait qu'un device_id (visible de
  // tous dans le flux public, donc usurpable), la mise à jour est signée avec la vraie session
  // Supabase anonyme de l'appareil (ensureDeviceSession) — la policy RLS "signalements" vérifie
  // côté serveur que citoyen_id = auth.uid() de cette session avant d'autoriser l'écriture.
  async function citoyenBasculerStatutSignalement(signalement) {
    if (!signalement || signalement.device_id !== DEVICE_ID) return;
    const session = await ensureDeviceSession();
    if (!session) {
      alert("Impossible de vérifier ton identité pour le moment (connexion, ou fonctionnalité pas encore activée côté serveur). Réessaie plus tard.");
      return;
    }
    const next = signalement.statut === "resolu" ? "attente" : "resolu";
    const clear = next === "resolu" ? { resolved_at: new Date().toISOString() } : { resolution_organisme: null, resolution_action: null, resolved_at: null };
    const precedent = signalement;
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, statut: next, ...clear } : s));
    const { data, error } = await supabase.from("signalements").update({ statut: next, ...clear }).eq("id", signalement.id).headers({ Authorization: "Bearer " + session.access_token }).select();
    if (error || !data || data.length === 0) {
      setSignalements(prev => prev.map(s => s.id === signalement.id ? precedent : s));
      alert("Action refusée par le serveur. Réessaie une fois de retour en ligne, ou contacte un administrateur si le problème persiste.");
      return;
    }
    logActivity(next === "resolu" ? "resolution_signaleur" : "reouverture_signaleur", "signalements", signalement.id);
  }

  async function adminResolve(signalement, { organisme, action }) {
    const payload = { statut: "resolu", resolution_organisme: organisme, resolution_action: action, resolved_at: new Date().toISOString() };
    const { data, error } = await supabase.from("signalements").update(payload).eq("id", signalement.id).select();
    if (error || !data || data.length === 0) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, ...payload } : s));
    logActivity("resolution", "signalements", signalement.id, `${organisme} — ${action}`);
    if (signalement.device_id) {
      supabase.from("notifications").insert({
        destinataire: signalement.device_id,
        message: `Ton signalement a été résolu par ${organisme}.`,
        lien: "carte",
      }).catch(() => {});
    }
  }

  async function adminValidate(id) {
    setSignalements(prev => prev.map(s => s.id === id ? { ...s, valide: true } : s));
    const { error } = await supabase.from("signalements").update({ valide: true }).eq("id", id);
    if (error) { console.error("Erreur de validation :", error); alert("Action refusée par le serveur (droits admin requis)."); }
    else {
      logActivity("validation", "signalements", id);
      const s = signalements.find(x => x.id === id);
      if (s && s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: "Ton signalement a été validé et pris en compte par l'équipe.",
          lien: "carte",
        }).catch(() => {});
      }
    }
  }

  async function adminValidateArbre(id) {
    setArbres(prev => prev.map(a => a.id === id ? { ...a, valide: true } : a));
    const { error } = await supabase.from("arbres").update({ valide: true }).eq("id", id);
    if (error) { console.error("Erreur de validation :", error); alert("Action refusée par le serveur (droits admin requis)."); }
    else logActivity("validation", "arbres", id);
  }

  const MOTIF_LABELS = { faux: "Faux signalement", doublon: "Doublon", spam: "Spam", erreur_localisation: "Erreur de localisation" };

  async function adminRevertModeration(signalement, { reason, motif }) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    setSignalements(prev => prev.map(s => s.id === signalement.id ? { ...s, valide: false, statut: "attente", moderation_motif: motif, moderation_par: email } : s));
    await supabase.from("signalements").update({
      valide: false, statut: "attente", moderation_motif: motif, moderation_par: email, moderation_le: new Date().toISOString(),
    }).eq("id", signalement.id);
    await logAudit("revert_statut", "signalement", signalement.id, reason, { motif });
    // Notifie l'auteur du signalement (citoyen, identifié par device_id)
    supabase.from("notifications").insert({
      destinataire: signalement.device_id,
      message: `Ton signalement a été repassé en vérification. Motif : ${MOTIF_LABELS[motif] || motif}.`,
      lien: "carte",
    }).catch(() => {});
  }

  async function adminSoftDeleteSignalement(signalement, { reason }) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    const { data, error } = await supabase.from("signalements").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: email }).eq("id", signalement.id).select();
    if (error || !data || data.length === 0) { alert("Suppression refusée par le serveur (droits admin requis) : le signalement n'a pas été modifié et réapparaîtra."); return; }
    await logAudit("soft_delete", "signalement", signalement.id, reason);
    logActivity("soft_delete", "signalements", signalement.id, reason);
    setSignalements(prev => prev.filter(s => s.id !== signalement.id));
  }

  async function adminDelete(table, id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { alert("Suppression refusée par le serveur."); return; }
    logActivity("suppression", table, id);
    if (table === "signalements") setSignalements(prev => prev.filter(s => s.id !== id));
    if (table === "arbres") setArbres(prev => prev.filter(a => a.id !== id));
  }

  async function adminSoftDeleteArbre(arbre) {
    const email = (getActiveSession() || {}).user ? getActiveSession().user.email : "";
    const { data, error } = await supabase.from("arbres").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: email }).eq("id", arbre.id).select();
    if (error) { alert("Action refusée par le serveur (droits admin requis)."); return; }
    if (!data || data.length === 0) { alert("Suppression refusée par le serveur (droits admin requis) : l'arbre n'a pas été modifié et réapparaîtra."); return; }
    logActivity("soft_delete", "arbres", arbre.id, arbre.nom || "Arbre");
    setArbres(prev => prev.filter(a => a.id !== arbre.id));
  }

  // Suppression par le citoyen d'un de ses propres arbres (enregistré par erreur ou incorrect).
  // Suppression douce, comme côté organisation/admin : l'arbre reste restaurable depuis l'Historique.
  // Un arbre encore en file d'attente hors-ligne n'existe pas en base : on le retire simplement de la file.
  async function citoyenSupprimerArbre(arbre) {
    if (arbre._pending) {
      dequeuePendingAction(arbre.id);
      setPendingQueueCount(loadPendingQueue().length);
      setArbres(prev => prev.filter(a => a.id !== arbre.id));
      return;
    }
    // RPC SECURITY DEFINER : la table arbres n'est pas lisible/modifiable directement par un citoyen (RLS).
    const sessionAppareil = await ensureDeviceSession();
    const { error } = await supabase.rpc("supprimer_arbre_citoyen", { p_id: arbre.id }, sessionAppareil ? { Authorization: "Bearer " + sessionAppareil.access_token } : undefined);
    if (error) throw error;
    setArbres(prev => prev.filter(a => a.id !== arbre.id));
  }

  // Abandon manuel des envois en attente (bandeau « Envoi de N élément(s) en attente… » bloqué).
  // Retire de la file locale tous les éléments pas encore envoyés, ainsi que leurs copies
  // provisoires affichées dans l'app (marquées _pending).
  function abandonnerEnvoisEnAttente() {
    const queue = loadPendingQueue();
    if (queue.length === 0) { setPendingQueueCount(0); return; }
    if (!confirm(`Supprimer ${queue.length} élément(s) en attente d'envoi ? Ces données n'ont pas encore été envoyées au serveur et seront perdues définitivement.`)) return;
    queue.forEach(item => { try { dequeuePendingAction(item.id); } catch (e) {} });
    setArbres(prev => prev.filter(a => !a._pending));
    setSignalements(prev => prev.filter(x => !x._pending));
    setObservations(prev => prev.filter(x => !x._pending));
    setSuivis(prev => prev.filter(x => !x._pending));
    setPendingQueueCount(loadPendingQueue().length);
    logActivity("file_attente_abandonnee", "citoyen", DEVICE_ID, `${queue.length} élément(s)`);
  }

  // Suppression par un bénévole validé d'un arbre qu'il juge mal enregistré ou mal géolocalisé.
  // Suppression douce via RPC SECURITY DEFINER (vérifie le statut bénévole côté serveur, journalise
  // dans audit_logs) : l'arbre reste restaurable par un admin depuis l'Historique.
  // motif : "mal_enregistre" | "mal_geolocalise"
  async function benevoleSupprimerArbre(arbre, motif) {
    const { error } = await supabase.rpc("supprimer_arbre_benevole", { p_id: arbre.id, p_motif: motif });
    if (error) throw error;
    setArbres(prev => prev.filter(a => a.id !== arbre.id));
    logActivity("arbre_supprime_benevole", "arbres", arbre.id, motif);
  }

  // Le panneau "Historique" (corbeille) gère sa propre liste indépendamment de l'état
  // signalements/arbres chargé une fois au démarrage de App(). Sans ce callback, un élément
  // restauré depuis la corbeille redevient bien is_deleted=false en base, mais reste invisible
  // partout ailleurs dans l'app (carte, liste de modération) tant que la page n'est pas rechargée.
  function onRestaurerItem(table, row) {
    if (!row) return;
    if (table === "signalements") {
      const mapped = mapSignalement(row);
      setSignalements(prev => prev.some(s => s.id === row.id) ? prev.map(s => s.id === row.id ? mapped : s) : [mapped, ...prev]);
    } else if (table === "arbres") {
      const mapped = mapArbre(row);
      setArbres(prev => prev.some(a => a.id === row.id) ? prev.map(a => a.id === row.id ? mapped : a) : [mapped, ...prev]);
    }
    // "benevoles" n'a pas d'état miroir dans App() (chargé à la demande côté admin) : rien à synchroniser.
  }

  function mapSignalement(r) {
    const d = new Date(r.created_at);
    return { ...r, date: d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
  }
  function mapArbre(r) {
    return { ...r, date: new Date(r.planted_at).toLocaleDateString("fr-FR"), plantedAt: new Date(r.planted_at).getTime() };
  }

  const [rafraichissementEnCours, setRafraichissementEnCours] = useState(false);
  async function chargerDonneesPrincipales() {
    setRafraichissementEnCours(true);
    try {
      const [{ data: sigs }, { data: trees }, { data: news }, { data: obs }, { data: suiv }, { data: enq }] = await Promise.all([
        supabase.from("signalements_public").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("arbres_public").select("*").order("created_at", { ascending: false }).limit(300),
        supabase.from("actualites").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("observations").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("arbre_suivis").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("enquete_dossiers_public").select("*").order("created_at", { ascending: false }).limit(300),
      ]);
      setSignalements((sigs || []).reverse().map(mapSignalement));
      setArbres((trees || []).reverse().map(mapArbre));
      setActualites(news || []);
      setObservations((obs || []).reverse());
      setSuivis(suiv || []);
      setEnquetesCarte(enq || []);

      const lastSeen = localStorage.getItem("pace-last-alert") || "";
      const newAlert = (news || []).find(n => n.urgent && n.created_at > lastSeen);
      if (newAlert && typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification("Alerte EcoVigil — " + newAlert.titre, { body: newAlert.contenu, icon: "./icon-192.png" }); } catch (e) {}
      }
      if (news && news[0]) localStorage.setItem("pace-last-alert", news[0].created_at);
    } catch (e) {
      console.error("Erreur de chargement Supabase :", e);
    }
    setRafraichissementEnCours(false);
  }

  useEffect(() => { chargerDonneesPrincipales(); }, []);
  // Amorce la session anonyme d'appareil dès le démarrage (plutôt qu'au premier clic) pour
  // qu'elle soit déjà prête quand l'utilisateur signale un problème ou change un statut.
  useEffect(() => { ensureDeviceSession(); }, []);

  async function uploadPhoto(dataUrl, prefix) {
    if (!dataUrl) return null;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const ext = (blob.type.split("/")[1] || "jpg").split("+")[0];
      const path = `${prefix}/${DEVICE_ID}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("pace-photos").upload(path, blob, { contentType: blob.type });
      if (error) throw error;
      const { data } = supabase.storage.from("pace-photos").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      console.error("Erreur d'upload photo :", e);
      return null;
    }
  }

  async function addSuivi(arbreId, { photo, etat, note }, opts) {
    opts = opts || {};
    const payload = { arbreId, photo, etat, note };
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("suivi", payload);
      setPendingQueueCount(loadPendingQueue().length);
      setSuivis(prev => [{ id: tempId, arbre_id: arbreId, photo_url: photo || null, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }, ...prev]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "suivis");
      const { data, error } = await supabase.from("arbre_suivis").insert({ arbre_id: arbreId, photo_url, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID }).select().single();
      if (error) throw error;
      setSuivis(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [data, ...withoutPending];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      console.error("Erreur d'ajout du suivi :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("suivi", payload);
      setPendingQueueCount(loadPendingQueue().length);
      setSuivis(prev => [{ id: tempId, arbre_id: arbreId, photo_url: photo || null, etat: etat || "vivant", note: note || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }, ...prev]);
      alert("Pas de connexion : ce suivi a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addSignalement(s, opts) {
    opts = opts || {};
    if (!opts.isReplay) {
      if (!checkLimiteFrequence(12)) {
        alert("Trop de signalements envoyés depuis cet appareil en une heure. Réessaie plus tard.");
        return;
      }
      const doublonProche = signalements.find(x => !x._pending && x.categorie === s.categorie && distanceMetres(x.lat, x.lng, s.lat, s.lng) < 25 && (Date.now() - new Date(x.created_at || x.date).getTime()) < 172800000);
      if (doublonProche && !window.confirm("Un signalement similaire (même catégorie) existe déjà à moins de 25 m d'ici, envoyé récemment. Envoyer quand même ?")) {
        return;
      }
    }
    const { photo, ...toInsert } = s;
    // Si cet appareil est inscrit comme bénévole, on accompagne le signalement de ses
    // renseignements (nom, contact, pays, ville, quartier) pour donner du contexte à qui le traite.
    const bi = getBenevoleInfo();
    const benevoleFields = bi ? { benevole_id: bi.id || null, benevole_nom: bi.nom || null, benevole_contact: bi.contact || null, benevole_pays: bi.pays || null, benevole_ville: bi.ville || null, benevole_quartier: bi.quartier || null } : {};
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("signalement", s);
      setPendingQueueCount(loadPendingQueue().length);
      setSignalements(prev => [...prev, { ...toInsert, ...benevoleFields, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "signalements");
      const session = await ensureDeviceSession();
      const { data, error } = await supabase.from("signalements")
        .insert({ ...toInsert, ...benevoleFields, photo_url, device_id: DEVICE_ID, citoyen_id: session ? session.user.id : null, is_deleted: false })
        .headers(session ? { Authorization: "Bearer " + session.access_token } : {})
        .select().single();
      if (error) throw error;
      setSignalements(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, mapSignalement(data)];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
      if (s.urgence === "haute") {
        supabase.from("admins").select("email").then(({ data: admins }) => {
          (admins || []).forEach(a => {
            supabase.from("notifications").insert({
              destinataire: a.email, message: `Signalement urgent à valider (${categorieMeta(s.categorie).label})`, lien: "signalements",
            }).catch(() => {});
          });
        });
      }
    } catch (e) {
      console.error("Erreur d'envoi du signalement :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("signalement", s);
      setPendingQueueCount(loadPendingQueue().length);
      setSignalements(prev => [...prev, { ...toInsert, ...benevoleFields, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), _pending: true }]);
      alert("Pas de connexion : ton signalement a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addArbre(a, opts) {
    opts = opts || {};
    if (!opts.isReplay) {
      if (!checkLimiteFrequence(20)) {
        alert("Trop d'arbres enregistrés depuis cet appareil en une heure. Réessaie plus tard.");
        return;
      }
      const doublonProche = arbres.find(x => !x._pending && distanceMetres(x.lat, x.lng, a.lat, a.lng) < 3 && (Date.now() - (x.plantedAt || 0)) < 600000);
      if (doublonProche && !window.confirm("Un arbre vient déjà d'être enregistré à moins de 3 m d'ici. Ajouter quand même ?")) {
        return;
      }
    }
    const { photo, ...toInsert } = a;
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("arbre", a);
      setPendingQueueCount(loadPendingQueue().length);
      setArbres(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, planted_at: new Date().toISOString(), date: new Date().toLocaleDateString("fr-FR"), plantedAt: Date.now(), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "arbres");
      // .returning(false) (Prefer: return=minimal) : la lecture directe de la table arbres est réservée
      // aux admins/organisations (RLS), donc demander la ligne en retour ferait rejeter l'INSERT d'un
      // citoyen (403). L'identifiant est généré ici pour afficher l'arbre sans relire la ligne.
      const maintenant = new Date().toISOString();
      const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : undefined;
      // Identité stable de l'appareil (session anonyme), comme pour les signalements : l'arbre est
      // rattaché à citoyen_id, ce qui permet à son auteur de le supprimer même s'il change de compte.
      const sessionAppareil = await ensureDeviceSession();
      const { error } = await supabase.from("arbres")
        .insert({ ...toInsert, id, photo_url, device_id: DEVICE_ID, citoyen_id: sessionAppareil ? sessionAppareil.user.id : null, is_deleted: false, planted_at: maintenant })
        .headers(sessionAppareil ? { Authorization: "Bearer " + sessionAppareil.access_token } : {})
        .returning(false);
      if (error) throw error;
      const data = { ...toInsert, id: id || opts.tempId || ("local-" + Date.now()), photo_url, device_id: DEVICE_ID, is_deleted: false, valide: false, publie: false, planted_at: maintenant, created_at: maintenant };
      setArbres(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, mapArbre(data)];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      console.error("Erreur d'enregistrement de l'arbre :", e);
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("arbre", a);
      setPendingQueueCount(loadPendingQueue().length);
      setArbres(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, planted_at: new Date().toISOString(), date: new Date().toLocaleDateString("fr-FR"), plantedAt: Date.now(), _pending: true }]);
      alert("Pas de connexion : ton arbre a été enregistré sur l'appareil et sera envoyé automatiquement dès que le réseau reviendra.");
    }
  }

  async function addObservation(o, opts) {
    opts = opts || {};
    const { photo, ...toInsert } = o;
    if (!opts.isReplay && !navigator.onLine) {
      const tempId = enqueuePendingAction("observation", o);
      setPendingQueueCount(loadPendingQueue().length);
      setObservations(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }]);
      return;
    }
    try {
      const photo_url = await uploadPhoto(photo, "observations");
      const { data, error } = await supabase.from("observations").insert({ ...toInsert, photo_url, device_id: DEVICE_ID }).select().single();
      if (error) throw error;
      setObservations(prev => {
        const withoutPending = opts.tempId ? prev.filter(x => x.id !== opts.tempId) : prev;
        return [...withoutPending, data];
      });
      if (opts.tempId) dequeuePendingAction(opts.tempId);
    } catch (e) {
      if (opts.isReplay) { throw e; }
      const tempId = enqueuePendingAction("observation", o);
      setPendingQueueCount(loadPendingQueue().length);
      setObservations(prev => [...prev, { ...toInsert, id: tempId, photo_url: photo || null, device_id: DEVICE_ID, created_at: new Date().toISOString(), _pending: true }]);
      alert("Pas de connexion : ton observation a été enregistrée sur l'appareil et sera envoyée automatiquement dès que le réseau reviendra.");
    }
  }

  async function flushPendingQueue() {
    if (!navigator.onLine) return;
    // Verrou de ré-entrance : le déclencheur 'online' et le minuteur de secours (20s) peuvent
    // se chevaucher sur un réseau lent, ce qui provoquerait un double envoi du même élément
    // (doublon en base) si deux passages de la file s'exécutaient en parallèle.
    if (flushInProgressRef.current) return;
    flushInProgressRef.current = true;
    try { window.dispatchEvent(new CustomEvent("pace-queue-syncing", { detail: { syncing: true } })); } catch (e) {}
    const MAX_TENTATIVES = 8;
    try {
      // Réinitialisation unique : les éléments abandonnés (_failed) à cause de l'ancien rejet RLS
      // sur l'insertion des arbres sont rejoués une fois avec le correctif.
      try {
        if (!localStorage.getItem("pace-queue-reset-v2")) {
          const q = loadPendingQueue();
          q.forEach(i => { delete i._failed; i.attempts = 0; });
          savePendingQueue(q);
          localStorage.setItem("pace-queue-reset-v2", "1");
        }
      } catch (e) {}
      const queue = loadPendingQueue();
      for (const item of queue) {
        if (!navigator.onLine) break; // vraie coupure réseau : on s'arrête, on réessaiera plus tard
        if (item._failed) continue; // déjà abandonné après trop d'échecs, ne pas re-tenter automatiquement
        try {
          if (item.type === "signalement") await addSignalement(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "arbre") await addArbre(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "observation") await addObservation(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "suivi") await addSuivi(item.payload.arbreId, item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "suppression") await envoyerDemandeSuppression({ isReplay: true, tempId: item.id });
          else if (item.type === "benevole") await inscrireBenevole(item.payload, { isReplay: true, tempId: item.id });
          else if (item.type === "enquete") { await syncOneDossierEnquete(item.payload.localId); dequeuePendingAction(item.id); }
          else dequeuePendingAction(item.id);
        } catch (e) {
          // Un échec sur un élément (réseau instable ou donnée rejetée par le serveur) ne doit
          // pas bloquer indéfiniment les éléments suivants de la file (effet de tête de ligne).
          // On compte les tentatives par élément et on continue avec le reste de la file ;
          // au-delà du seuil, l'élément est marqué comme échoué mais reste conservé localement
          // (aucune perte de données) plutôt que d'être rejoué en boucle toutes les 20s.
          const current = loadPendingQueue();
          const idx = current.findIndex(q => q.id === item.id);
          if (idx !== -1) {
            current[idx].attempts = (current[idx].attempts || 0) + 1;
            if (current[idx].attempts >= MAX_TENTATIVES) {
              current[idx]._failed = true;
              console.error("Synchronisation abandonnée après plusieurs échecs pour l'élément", item.id, e);
            }
            savePendingQueue(current);
          }
        }
      }
    } finally {
      flushInProgressRef.current = false;
      setPendingQueueCount(loadPendingQueue().length);
      try { window.dispatchEvent(new CustomEvent("pace-queue-syncing", { detail: { syncing: false } })); } catch (e) {}
    }
  }


  // Entrées du menu hamburger : mêmes cibles et mêmes conditions d'accès que les cartes de l'accueil et le rendu ci-dessous.
  const ouvrirReglage = (section) => () => setThemeSection(section);
  const notifNotes = { default: t(lang, "activer_notifs"), granted: "Activées", denied: "Bloquées dans les réglages du navigateur" };
  const menuItems = [
    { id: "accueil", label: t(lang, "nav_accueil"), icon: IconHome, onSelect: () => setTab("accueil") },
    { id: "profil", label: "Profil", icon: IconUserCircle, onSelect: () => setTab("profil") },
    { id: "theme", label: "Thèmes", icon: IconSun, onSelect: ouvrirReglage("theme") },
    { id: "accent", label: "Couleur d'accent", icon: IconDroplet, onSelect: ouvrirReglage("accent") },
    { id: "langue", label: "Langue / Language", icon: IconGlobe, onSelect: ouvrirReglage("langue") },
    { id: "gps", label: "Format des coordonnées GPS", icon: IconTarget, onSelect: ouvrirReglage("gps") },
    { id: "orientation", label: "Affichage : portrait / paysage", icon: IconMaximize, onSelect: ouvrirReglage("orientation"), note: { auto: "Automatique", portrait: "Portrait", paysage: "Paysage" }[orientation] },
    { id: "notifs", label: "Notifications", icon: IconBell, onSelect: enableNotif, disabled: notifState !== "default", note: notifNotes[notifState] || "Non prises en charge sur cet appareil" },
    { id: "espace_org", label: "Compte organisation", icon: IconShield, onSelect: () => setTab(estOrganisationValidee ? "espace_org" : "compte_org"), note: estOrganisationValidee ? null : "Créer un compte ou se connecter" },
    { id: "assistant", label: "Assistant de décision environnementale", icon: IconSparkles, onSelect: () => setTab("assistant"), locked: !accesEtendu, note: accesEtendu ? null : "Réservé aux bénévoles et organisations validés" },
    { id: "groupes_terrain", label: "Groupe terrain", icon: IconUsers, onSelect: () => setTab("groupes_terrain") },
    { id: "enquetes_terrain", label: "Enquêtes terrain", icon: IconSearch, onSelect: () => setTab("enquetes_terrain"), locked: !estBenevoleValide, note: estBenevoleValide ? null : "Réservé aux bénévoles validés" },
    { id: "evenements", label: "Événements", icon: IconCalendar, onSelect: () => setTab("evenements") },
  ];

  return (
    <div dir={RTL_LANGS.includes(lang) ? "rtl" : "ltr"} className={`pace-app-outer ${isDark ? "pace-dark" : ""} accent-${accent}${orientation !== "auto" ? ` orient-${orientation}` : ""}`} style={{ fontFamily: FONT_TEXTE, background: "var(--c-bg)", minHeight: "100vh", display: "flex", justifyContent: "center", transition: "background-color .25s ease" }}>
      {showSplash && <SplashScreen lang={lang} />}
      {citoyenRecoveryToken && !showSplash && (
        <CitoyenNouveauMotDePasse token={citoyenRecoveryToken} onDone={() => setCitoyenRecoveryToken(null)} />
      )}
      {showOnboarding && !showSplash && !citoyenRecoveryToken && (
        <Onboarding onDone={() => {
          try { localStorage.setItem("pace-onboarded", "1"); } catch (e) {}
          setShowOnboarding(false);
        }} />
      )}
      <div className={`pace-frame ${showAdmin ? "pace-frame-wide" : ""}`} style={{ minHeight: "100vh", background: "var(--c-bg)", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)", transition: "background-color .25s ease" }}>
        <div className="pace-header" style={{ background: "linear-gradient(120deg,var(--c-accent-dark),var(--c-sky))", color: "#fff", padding: "18px 16px 22px", borderRadius: "0 0 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img src={LOGO_DATA_URL} alt={t(lang, "logo_pace_alt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, letterSpacing: 0.3 }}>EcoVigil</div>
            <div style={{ fontSize: T.meta, opacity: 0.9, lineHeight: 1.3 }}>{t(lang, "plateforme_desc")}</div>
            <div style={{ fontSize: T.meta, opacity: 0.75, marginTop: 1 }}>{t(lang, "sub_accueil")}</div>
          </div>
          {/* Cloche de notifications citoyenne : ferme la boucle de suivi (validation, résolution
              d'un signalement...) pour quiconque n'a pas activé les notifications push — sans elle,
              ces notifications étaient enregistrées en base mais nulle part visibles dans l'app.
              Même composant générique que celui du Centre d'EcoVigil (NotifBell), simplement
              interrogé par device_id plutôt que par e-mail admin. Masquée en mode admin : ce
              dernier a déjà sa propre cloche, distincte, dans son propre en-tête. */}
          {!showAdmin && <NotifBell email={DEVICE_ID} onNavigate={setTab} color="#fff" />}
        {!showAdmin && (
          <button onClick={() => setShowMenu(true)} aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-expanded={showMenu} style={{
            background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 38, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconMenu size={17} color="#fff" />
          </button>
        )}
          {/* Bouton du Centre d'EcoVigil retiré de l'interface visible : l'accès admin
              se fait uniquement via l'URL dédiée ?admin=1 (voir initialUrlState plus haut),
              pour qu'un utilisateur ordinaire ne puisse pas tomber dessus par erreur. */}
        </div>

        {showMenu && <MenuHamburger items={menuItems} onClose={() => setShowMenu(false)} />}

  {themeSection && (
          <ThemePanel
            themeMode={themeMode} accent={accent} lang={lang} coordFormat={coordFormat} orientation={orientation} onSetOrientation={updateOrientation}
            onSetMode={updateThemeMode} onSetAccent={updateAccent} onSetLang={updateLang} onSetCoordFormat={updateCoordFormat}
            section={themeSection}
        onClose={() => setThemeSection(null)}
          />
        )}

        {!online && (
          <div style={{ background: "#B5451B", color: "#fff", fontSize: T.small, textAlign: "center", padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <IconWifiOff size={13} /> {t(lang, "hors_ligne_banner")}{pendingQueueCount > 0 ? ` (${pendingQueueCount} ${t(lang, "hors_ligne_banner_attente")})` : ""}
          </div>
        )}
        {online && pendingQueueCount > 0 && (
          <div style={{ background: "var(--c-warning)", color: "#fff", fontSize: T.small, textAlign: "center", padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <IconClock size={13} /> {t(lang, "envoi_en_cours_prefix")} {pendingQueueCount} {t(lang, "envoi_attente_suffix")}
            <button onClick={abandonnerEnvoisEnAttente} style={{ marginLeft: 6, padding: "2px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>Supprimer</button>
          </div>
        )}

        <BoundaireErreur key={showAdmin ? "admin" : tab}>
        <Suspense fallback={<EcranChargement />}>
        {showAdmin ? (
          <AdminSpace signalements={signalements} arbres={arbres} onUpdateStatut={adminUpdateStatut} onResolve={adminResolve} onValidate={adminValidate} onValidateArbre={adminValidateArbre} onDelete={adminDelete} onSoftDeleteArbre={adminSoftDeleteArbre} onRevertModeration={adminRevertModeration} onSoftDeleteSignalement={adminSoftDeleteSignalement} onRestaurerItem={onRestaurerItem} onRafraichir={chargerDonneesPrincipales} rafraichissementEnCours={rafraichissementEnCours} onExit={() => { exitAdminIdentity(); setShowAdmin(false); }} />
        ) : tab === "confidentialite" ? (
          <Confidentialite onBack={() => setTab("accueil")} />
        ) : profilInfo === undefined ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--c-text-muted)", fontSize: T.body, gap: 8 }}>
            <IconClock size={15} /> Chargement…
          </div>
        ) : profilInfo === null ? (
          <MurProfilObligatoire profilInfo={profilInfo} lang={lang} />
        ) : accesBloque ? (
          <BenevoleAccesBloque statut={benevoleStatut} />
        ) : ecransReserves.includes(tab) && statutEnCours ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--c-text-muted)", fontSize: T.body, gap: 8 }}>
            <IconClock size={15} /> Vérification de l'accès…
          </div>
        ) : tab === "biodiversite" && accesEtendu ? (
          <Biodiversite observations={observations} onAdd={addObservation} onBack={() => setTab("signaler")} lang={lang} coordFormat={coordFormat} />
        ) : tab === "assistant" && accesEtendu ? (
          <AssistantIA onBack={() => setTab("accueil")} signalements={signalements} arbres={arbres} observations={observations} actualites={actualites} />
        ) : tab === "compte_org" && !estOrganisationValidee ? (
          <Screen>
            <button onClick={() => setTab("accueil")} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
            <OrganisationCard lang={lang} organisationStatut={organisationStatut} organisationEtapeDossier={organisationEtapeDossier} organisationEtapeMotif={organisationEtapeMotif} profilInfo={profilInfo} onProfilChange={rafraichirProfil} />
          </Screen>
        ) : tab === "espace_org" && estOrganisationValidee ? (
          <EspaceOrganisation organisationEmail={citoyenSession && citoyenSession.user && citoyenSession.user.email} organisationUserId={citoyenSession && citoyenSession.user && citoyenSession.user.id} onBack={() => setTab("accueil")} coordFormat={coordFormat}  peutBasculerBenevole={estBenevoleValide} />
        ) : tab === "evenements" ? (
          <Evenements onBack={() => setTab("accueil")} />
        ) : tab === "groupes_terrain" ? (
          <GroupesTerrain onBack={() => setTab("accueil")} estBenevoleValide={estBenevoleValide} />
        ) : tab === "enquetes_terrain" ? (
          <EnquetesTerrain onBack={() => setTab("accueil")} />
        ) : (
          <div key={tab} className="pace-fade-in">
            {tab === "accueil" && <Accueil signalements={signalements.filter(s => s.device_id === DEVICE_ID)} arbres={arbres.filter(a => a.device_id === DEVICE_ID)} notifState={notifState} onEnableNotif={enableNotif} onOpenAdmin={() => { enterAdminIdentity(); setShowAdmin(true); }} actualites={actualites} onNavigate={setTab} lang={lang} estBenevoleValide={estBenevoleValide} benevoleStatut={benevoleStatut} onBenevoleInscrit={() => { setBenevoleStatut("en_attente"); try { localStorage.setItem("pace-benevole-statut", "en_attente"); } catch (e) {} }} estOrganisationValidee={estOrganisationValidee} organisationStatut={organisationStatut} organisationEtapeDossier={organisationEtapeDossier} organisationEtapeMotif={organisationEtapeMotif} onBasculerStatutSignalement={citoyenBasculerStatutSignalement} profilInfo={profilInfo} onProfilChange={rafraichirProfil} />}
            {tab === "carte" && accesEtendu && <Carte signalements={signalements} arbres={arbres} observations={observations} enquetesCarte={enquetesCarte} onAddSignalement={addSignalement} onAddArbre={addArbre} onAddObservation={addObservation} onSupprimerArbre={estBenevoleValide ? benevoleSupprimerArbre : undefined} online={online} pendingQueueCount={pendingQueueCount} onFlushQueue={flushPendingQueue} lang={lang} coordFormat={coordFormat} />}
            {tab === "signaler" && accesEtendu && <Signaler onSubmit={addSignalement} lang={lang} coordFormat={coordFormat} onNavigate={setTab} />}
            {tab === "arbre" && accesEtendu && <MonArbre arbres={arbres.filter(a => a.device_id === DEVICE_ID)} suivis={suivis} onAdd={addArbre} onAddSuivi={addSuivi} onDelete={citoyenSupprimerArbre} lang={lang} coordFormat={coordFormat} />}
            {tab === "profil" && <ProfilTab profilInfo={profilInfo} onProfilChange={rafraichirProfil} lang={lang} />}
          </div>
        )}
        </Suspense>
        </BoundaireErreur>

        {!showAdmin && !!profilInfo && !accesBloque && tab !== "biodiversite" && tab !== "confidentialite" && tab !== "assistant" && tab !== "espace_org" && tab !== "compte_org" && tab !== "evenements" && tab !== "groupes_terrain" && tab !== "enquetes_terrain" && (
          <div className="pace-bottom-nav" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--c-surface)", borderTop: "1px solid var(--c-border)", display: "flex", padding: "8px 6px", borderRadius: "18px 18px 0 0", boxShadow: "0 -4px 16px rgba(0,0,0,0.04)" }}>
            {TABS.map(tabItem => {
              const IconT = tabItem.icon;
              const active = tab === tabItem.id;
              const verrouille = tabItem.id !== "accueil" && tabItem.id !== "profil" && !accesEtendu;
              const navLabels = { accueil: t(lang, "nav_accueil"), carte: t(lang, "nav_carte"), arbre: t(lang, "nav_arbre") };
              return (
                <button key={tabItem.id} onClick={() => setTab(verrouille ? "accueil" : tabItem.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", opacity: verrouille ? 0.45 : 1 }}>
                  <div style={{ background: tabItem.cta && !verrouille ? "#B5451B" : (active && !verrouille ? "var(--c-surface-soft)" : "transparent"), borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {verrouille ? <IconLock size={15} color="var(--c-text-muted)" /> : <IconT size={17} color={tabItem.cta ? "#fff" : (active ? "var(--c-accent)" : "var(--c-text-muted)")} />}
                  </div>
                  <span style={{ fontSize: T.meta, color: active && !verrouille ? "var(--c-accent)" : "var(--c-text-muted)", fontWeight: active && !verrouille ? 600 : 500 }}>{navLabels[tabItem.id] || tabItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
