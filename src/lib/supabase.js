import { uid } from "./categories.jsx";

const SUPABASE_URL = "https://dimdahhvgdwbluwbslzh.supabase.co";

export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbWRhaGh2Z2R3Ymx1d2JzbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjIyOTcsImV4cCI6MjA5OTY5ODI5N30.DumlneB3r-YSsEeQ8Uc-g62-XdSwRX1xQjMcj2yzozI";

// --- Client Supabase maison, basé uniquement sur fetch() ---
// Remplace la bibliothèque officielle (chargée depuis jsdelivr.net, bloquée dans l'aperçu du chat)
// par un client minimal compatible avec l'API REST PostgREST + Auth + Storage de Supabase.
const REST_URL = SUPABASE_URL + "/rest/v1";

export const AUTH_URL = SUPABASE_URL + "/auth/v1";

const STORAGE_URL = SUPABASE_URL + "/storage/v1";

export let currentSession = null;

try { currentSession = JSON.parse(localStorage.getItem("pace-session") || "null"); } catch (e) { currentSession = null; }

export let authListeners = [];

// ===== Session du Centre d'EcoVigil (admin), totalement indépendante de la session citoyen =====
// Stockage localStorage séparé + écouteurs séparés : avoir un profil citoyen connecté ne bloque
// jamais l'accès direct au Centre d'EcoVigil, et s'y connecter ne déconnecte jamais le profil
// citoyen. "activeIdentity" détermine laquelle des deux sessions restHeaders() /
// refreshSessionIfNeeded() / l'objet "auth" ci-dessous utilisent à un instant donné : il est
// basculé de façon strictement synchrone par App (enterAdminIdentity/exitAdminIdentity), avant
// même que le composant du Centre d'EcoVigil ne soit monté — jamais via un effet asynchrone qui
// pourrait s'exécuter dans le mauvais ordre.
let adminSession = null;

try { adminSession = JSON.parse(localStorage.getItem("pace-admin-session") || "null"); } catch (e) { adminSession = null; }

let adminAuthListeners = [];

// "admin" dès le chargement si l'URL contient déjà ?admin=1 (accès direct au Centre d'EcoVigil,
// typiquement une navigation fraîche vers ce lien) : indispensable pour que le tout premier appel
// à getSession()/getActiveSession(), déclenché par l'effet de montage du Centre d'EcoVigil, lise
// déjà le bon store — avant même que React n'ait eu l'occasion de monter le moindre composant.
let activeIdentity = (function () {
  try { return new URLSearchParams(window.location.search).get("admin") === "1" ? "admin" : "citoyen"; } catch (e) { return "citoyen"; }
})(); // "citoyen" | "admin"

export function enterAdminIdentity() { activeIdentity = "admin"; }

export function exitAdminIdentity() { activeIdentity = "citoyen"; }

export function getActiveSession() { return activeIdentity === "admin" ? adminSession : currentSession; }

export function persistSession(session) {
  currentSession = session;
  try {
    if (session) localStorage.setItem("pace-session", JSON.stringify(session));
    else localStorage.removeItem("pace-session");
  } catch (e) {}
  authListeners.forEach((cb) => { try { cb(session ? "SIGNED_IN" : "SIGNED_OUT", session); } catch (e) {} });
}

function persistAdminSession(session) {
  adminSession = session;
  try {
    if (session) localStorage.setItem("pace-admin-session", JSON.stringify(session));
    else localStorage.removeItem("pace-admin-session");
  } catch (e) {}
  adminAuthListeners.forEach((cb) => { try { cb(session ? "SIGNED_IN" : "SIGNED_OUT", session); } catch (e) {} });
}

// Les méthodes signIn*/signUp/signOut/mfa.* ci-dessous sont écrites une seule fois et partagées
// entre le profil citoyen et le Centre d'EcoVigil : elles persistent toujours via cette fonction,
// qui redirige elle-même vers le bon stockage selon l'identité active au moment de l'appel.
export function persistActiveSession(session) {
  if (activeIdentity === "admin") persistAdminSession(session);
  else persistSession(session);
}

function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp || null;
  } catch (e) { return null; }
}

let refreshInFlight = null;

export async function refreshSessionIfNeeded() {
  const session = getActiveSession();
  if (!session || !session.refresh_token) return;
  const exp = decodeJwtExp(session.access_token);
  const now = Math.floor(Date.now() / 1000);
  if (exp && exp - now > 300) return; // encore valide plus de 5 minutes, rien à faire
  if (refreshInFlight) return refreshInFlight;
  const forAdmin = activeIdentity === "admin";
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.access_token) {
          const nouvelleSession = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user || session.user };
          if (forAdmin) persistAdminSession(nouvelleSession); else persistSession(nouvelleSession);
        }
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        // Le serveur a explicitement rejeté le refresh_token (révoqué / expiré / invalide) :
        // la session est définitivement morte. On la nettoie pour éviter un état incohérent
        // où l'app se croit connectée mais où chaque appel échouerait silencieusement.
        if (forAdmin) persistAdminSession(null); else persistSession(null);
      }
      // Toute autre erreur (5xx, réseau) est traitée comme transitoire : on garde la session
      // et on retentera au prochain cycle plutôt que de déconnecter sur un simple problème réseau.
    } catch (e) {
      // Échec réseau (fetch n'a pas abouti) : transitoire, on ne touche pas à la session.
    }
    refreshInFlight = null;
  })();
  return refreshInFlight;
}

function restHeaders(extra) {
  const session = getActiveSession();
  const token = session ? session.access_token : null;
  return Object.assign({ apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY) }, extra || {});
}

// --- Session "citoyen anonyme" (Supabase Anonymous Sign-in) ---------------------------------
// Distincte de currentSession (réservée à la connexion email/mot de passe des organisations et
// de l'admin) : sert uniquement à prouver, côté RLS, quel appareil est à l'origine d'une action
// en libre-service (créer/rouvrir/résoudre SES PROPRES signalements). Contrairement à DEVICE_ID
// (une simple chaîne générée côté client, visible de tous dans le flux public), cette session
// donne un vrai auth.uid() vérifiable par Postgres — impossible à usurper en lisant les données
// publiques. Nécessite que "Anonymous sign-ins" soit activé dans Authentication > Sign In / Providers.
let deviceSession = null;

try { deviceSession = JSON.parse(localStorage.getItem("pace-device-session") || "null"); } catch (e) { deviceSession = null; }

function persistDeviceSession(session) {
  deviceSession = session;
  try {
    if (session) localStorage.setItem("pace-device-session", JSON.stringify(session));
    else localStorage.removeItem("pace-device-session");
  } catch (e) {}
}

let deviceRefreshInFlight = null;

async function refreshDeviceSessionIfNeeded() {
  if (!deviceSession || !deviceSession.refresh_token) return;
  const exp = decodeJwtExp(deviceSession.access_token);
  const now = Math.floor(Date.now() / 1000);
  if (exp && exp - now > 300) return;
  if (deviceRefreshInFlight) return deviceRefreshInFlight;
  deviceRefreshInFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_URL}/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: deviceSession.refresh_token }),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.access_token) persistDeviceSession({ access_token: json.access_token, refresh_token: json.refresh_token, user: json.user || deviceSession.user });
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        persistDeviceSession(null); // refresh_token révoqué/expiré : on en redemandera un neuf
      }
    } catch (e) { /* réseau indisponible : transitoire, on retentera plus tard */ }
    deviceRefreshInFlight = null;
  })();
  return deviceRefreshInFlight;
}

// Renvoie une session anonyme valide pour cet appareil, en (re)créant une le cas échéant.
// Renvoie null si hors-ligne ou si les connexions anonymes ne sont pas encore activées côté
// Supabase : les appelants doivent alors se comporter comme avant (ou avertir l'utilisateur).
export async function ensureDeviceSession() {
  await refreshDeviceSessionIfNeeded();
  if (deviceSession && deviceSession.access_token) return deviceSession;
  try {
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ data: {}, gotrue_meta_security: {} }),
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (json && json.access_token) {
      const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
      persistDeviceSession(session);
      return session;
    }
  } catch (e) { /* pas de réseau : on retentera au prochain appel */ }
  return null;
}

class PaceQuery {
  constructor(table) {
    this.table = table;
    this.params = new URLSearchParams();
    this.method = "GET";
    this.body = undefined;
    this._single = false;
    this._maybe = false;
    this._head = false;
    this._countMode = null;
    this._upsert = false;
    this._onConflict = null;
    this._extraHeaders = null;
  }
  // Permet d'ajouter des en-têtes HTTP personnalisés à une requête précise (ex. "x-device-id"
  // pour prouver, côté RLS, quel appareil est à l'origine d'une mise à jour en libre-service).
  headers(obj) { this._extraHeaders = Object.assign(this._extraHeaders || {}, obj); return this; }
  select(cols, opts) {
    if (cols) this.params.set("select", cols);
    if (opts && opts.head) this._head = true;
    if (opts && opts.count) this._countMode = opts.count;
    return this;
  }
  eq(col, val) { this.params.append(col, "eq." + val); return this; }
  neq(col, val) { this.params.append(col, "neq." + val); return this; }
  not(col, op, val) { this.params.append(col, `not.${op}.${val === null ? "null" : val}`); return this; }
  gt(col, val) { this.params.append(col, "gt." + val); return this; }
  gte(col, val) { this.params.append(col, "gte." + val); return this; }
  lt(col, val) { this.params.append(col, "lt." + val); return this; }
  lte(col, val) { this.params.append(col, "lte." + val); return this; }
  is(col, val) { this.params.append(col, "is." + val); return this; }
  in(col, vals) { this.params.append(col, "in.(" + (vals || []).map(v => String(v)).join(",") + ")"); return this; }
  or(expr) { this.params.set("or", "(" + expr + ")"); return this; }
  order(col, opts) { this.params.set("order", col + ((opts && opts.ascending === false) ? ".desc" : ".asc")); return this; }
  limit(n) { this.params.set("limit", String(n)); return this; }
  insert(obj) { this.method = "POST"; this.body = obj; return this; }
  update(obj) { this.method = "PATCH"; this.body = obj; return this; }
  upsert(obj, opts) { this.method = "POST"; this.body = obj; this._upsert = true; this._onConflict = opts && opts.onConflict; return this; }
  delete() { this.method = "DELETE"; return this; }
  // Désactive le renvoi de la ligne affectée (Prefer: return=minimal au lieu de representation).
  // Indispensable quand l'appelant n'a pas de droit de LECTURE sur la table (ex. inscription
  // publique sur une table dont le SELECT est réservé aux admins) : demander la représentation
  // dans ce cas fait échouer l'écriture elle-même avec une erreur RLS, alors que l'écriture
  // seule (sans relecture) est parfaitement autorisée.
  returning(actif) { this._noReturn = actif === false; return this; }
  single() { this._single = true; return this; }
  maybeSingle() { this._single = true; this._maybe = true; return this; }
  then(resolve, reject) { return this._exec().then(resolve, reject); }
  catch(reject) { return this._exec().catch(reject); }
  finally(cb) { return this._exec().finally(cb); }
  async _exec() {
    await refreshSessionIfNeeded();
    if (this._upsert && this._onConflict) this.params.set("on_conflict", this._onConflict);
    let url = REST_URL + "/" + this.table;
    const qs = this.params.toString();
    if (qs) url += "?" + qs;

    const headers = restHeaders(Object.assign({ "Content-Type": "application/json" }, this._extraHeaders || {}));
    if (this._noReturn && (this.method === "POST" || this.method === "PATCH" || this.method === "DELETE")) {
      headers["Prefer"] = (this._upsert && this._onConflict ? "resolution=merge-duplicates," : "") + "return=minimal";
    } else if (this.method === "POST" || this.method === "PATCH") {
      headers["Prefer"] = (this._upsert ? "resolution=merge-duplicates," : "") + "return=representation";
    } else if (this.method === "DELETE") {
      headers["Prefer"] = "return=representation";
    } else if (this._head) {
      headers["Prefer"] = "count=" + (this._countMode || "exact");
    }

    try {
      const res = await fetch(url, {
        method: this._head ? "HEAD" : this.method,
        headers,
        body: this.body !== undefined ? JSON.stringify(this.body) : undefined,
      });
      if (this._head) {
        const range = res.headers.get("content-range") || "";
        const count = range.includes("/") ? parseInt(range.split("/")[1], 10) : null;
        return { data: null, error: res.ok ? null : { message: "Erreur serveur" }, count };
      }
      const text = await res.text();
      let json = null;
      if (text) { try { json = JSON.parse(text); } catch (e) { json = null; } }
      if (!res.ok) {
        const msg = (json && (json.message || json.error_description)) || "Erreur serveur";
        return { data: null, error: { message: msg } };
      }
      if (this._single) {
        const row = Array.isArray(json) ? (json[0] || null) : json;
        if (!row && !this._maybe) return { data: null, error: { message: "Aucune ligne trouvée" } };
        return { data: row, error: null };
      }
      return { data: json, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  }
}

export const supabase = {
  from(table) { return new PaceQuery(table); },
  async rpc(fnName, params) {
    try {
      const res = await fetch(`${REST_URL}/rpc/${fnName}`, {
        method: "POST",
        headers: restHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(params || {}),
      });
      const text = await res.text();
      let json = null;
      if (text) { try { json = JSON.parse(text); } catch (e) { json = null; } }
      if (!res.ok) {
        const msg = (json && (json.message || json.error_description)) || "Erreur serveur";
        return { data: null, error: { message: msg } };
      }
      return { data: json, error: null };
    } catch (e) { return { data: null, error: { message: e.message } }; }
  },
  storage: {
    from(bucket) {
      return {
        async upload(path, blob, opts) {
          try {
            const res = await fetch(`${STORAGE_URL}/object/${bucket}/${path}`, {
              method: "POST",
              headers: restHeaders({ "Content-Type": (opts && opts.contentType) || "application/octet-stream" }),
              body: blob,
            });
            if (!res.ok) {
              let msg = "Échec de l'envoi";
              try { const j = await res.json(); msg = j.message || msg; } catch (e) {}
              return { data: null, error: { message: msg } };
            }
            return { data: { path }, error: null };
          } catch (e) { return { data: null, error: { message: e.message } }; }
        },
        getPublicUrl(path) {
          return { data: { publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` } };
        },
      };
    },
  },
  auth: {
    async getSession() { return { data: { session: getActiveSession() } }; },
    // S'abonne au store correspondant à l'identité active AU MOMENT de l'appel : comme
    // enterAdminIdentity()/exitAdminIdentity() sont toujours basculés de façon synchrone AVANT le
    // montage du composant concerné (voir App), le Centre d'EcoVigil s'abonne toujours à
    // adminAuthListeners et le reste de l'app (profil citoyen, organisation) toujours à
    // authListeners — chacun des deux écouteurs de haut niveau reste ainsi bien isolé de l'autre.
    onAuthStateChange(cb) {
      if (activeIdentity === "admin") {
        adminAuthListeners.push(cb);
        return { data: { subscription: { unsubscribe() { adminAuthListeners = adminAuthListeners.filter((f) => f !== cb); } } } };
      }
      authListeners.push(cb);
      return { data: { subscription: { unsubscribe() { authListeners = authListeners.filter((f) => f !== cb); } } } };
    },
    async signInWithPassword({ email, password }) {
      try {
        const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { error: { message: json.error_description || json.msg || "Identifiants incorrects." } };
        const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
        persistActiveSession(session);
        return { data: { session }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async signInWithOtp({ email, options }) {
      try {
        const qs = (options && options.emailRedirectTo) ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/otp${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, create_user: true }),
        });
        if (!res.ok) { const j = await res.json().catch(() => ({})); return { error: { message: j.error_description || j.msg || "Erreur d'envoi." } }; }
        return { error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    // "redirectTo" (optionnel) : URL vers laquelle GoTrue redirige après clic sur le lien reçu par
    // e-mail. Si absent, GoTrue retombe sur le "Site URL" configuré dans le dashboard Supabase — une
    // dépendance fragile (un changement d'hébergeur, un renommage de domaine, etc. casse alors tous
    // les liens sans que le code ne change). On préfère donc, à chaque appel, transmettre explicitement
    // l'URL de la page actuellement chargée (window.location.origin + pathname), qui reste toujours
    // correcte quel que soit l'endroit où l'app est réellement servie.
    async signUp({ email, password, options }) {
      try {
        const body = { email, password };
        if (options && options.data) body.data = options.data;
        const qs = (options && options.emailRedirectTo) ? `?redirect_to=${encodeURIComponent(options.emailRedirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/signup${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail = json.error_description || json.msg || json.error || json.error_code || json.code;
          return { error: { message: (detail ? String(detail) : `Erreur d'inscription (HTTP ${res.status}).`), status: res.status, code: json.error_code || json.code } };
        }
        if (json.access_token) {
          const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
          persistActiveSession(session);
          return { data: { session, user: json.user }, error: null };
        }
        // Pas de session : confirmation par e-mail requise. GoTrue renvoie alors l'objet
        // utilisateur directement dans "json". Note anti-énumération : si l'e-mail est déjà
        // enregistré, GoTrue répond aussi sans erreur (pour ne pas révéler qu'un compte existe)
        // mais avec "identities: []" et n'envoie AUCUN e-mail — c'est ce cas qu'il faut détecter
        // côté appelant pour ne pas faire croire à tort qu'un e-mail de confirmation part.
        return { data: { session: null, user: json }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async signOut() { persistActiveSession(null); return { error: null }; },
    // Session anonyme Supabase (déjà activée sur ce projet) : sert de base d'identité stable
    // (auth.uid()) pour un membre d'organisation qui rejoint via un code d'invitation, sans
    // e-mail ni téléphone ni mot de passe.
    async signInAnonymously() {
      try {
        const res = await fetch(`${AUTH_URL}/signup`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || "Erreur de connexion." } };
        const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
        persistActiveSession(session);
        return { data: { session }, error: null };
      } catch (e) { return { data: null, error: { message: e.message } }; }
    },
    async resetPasswordForEmail(email, options) {
      try {
        const qs = (options && options.redirectTo) ? `?redirect_to=${encodeURIComponent(options.redirectTo)}` : "";
        const res = await fetch(`${AUTH_URL}/recover${qs}`, {
          method: "POST",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) { const j = await res.json().catch(() => ({})); return { error: { message: j.error_description || j.msg || "Erreur d'envoi." } }; }
        return { error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    async updateUser({ password }, accessToken) {
      try {
        const res = await fetch(`${AUTH_URL}/user`, {
          method: "PUT",
          headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { error: { message: json.error_description || json.msg || "Erreur de mise à jour." } };
        return { data: { user: json }, error: null };
      } catch (e) { return { error: { message: e.message } }; }
    },
    // ===== Double authentification (2FA / TOTP) =====
    // Utilise directement les endpoints MFA de GoTrue (compatibles avec supabase-js) : l'inscription
    // d'un facteur nécessite une session déjà active (mot de passe déjà vérifié) ; la vérification
    // d'un challenge élève ensuite le niveau d'assurance de la session (claim "aal" du JWT : aal1 →
    // aal2) et renouvelle les tokens.
    mfa: {
      async enroll({ factorType = "totp", friendlyName } = {}) {
        try {
          const res = await fetch(`${AUTH_URL}/factors`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
            body: JSON.stringify({ factor_type: factorType, friendly_name: friendlyName }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur d'activation de la double authentification." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      async challenge({ factorId }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}/challenge`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur lors de la demande de code." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      // accessToken optionnel : lors du step-up post-connexion, la session courante n'est encore
      // qu'au niveau aal1, on utilise donc explicitement ce token plutôt que la session active
      // (identique dans ce cas précis, gardé pour clarté et robustesse).
      async verify({ factorId, challengeId, code, accessToken }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}/verify`, {
            method: "POST",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (accessToken || (getActiveSession() && getActiveSession().access_token)), "Content-Type": "application/json" },
            body: JSON.stringify({ challenge_id: challengeId, code }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Code incorrect ou expiré." } };
          if (json.access_token) {
            const session = { access_token: json.access_token, refresh_token: json.refresh_token, user: json.user };
            persistActiveSession(session);
            return { data: { session }, error: null };
          }
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
      async unenroll({ factorId }) {
        try {
          const res = await fetch(`${AUTH_URL}/factors/${factorId}`, {
            method: "DELETE",
            headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + (getActiveSession() && getActiveSession().access_token), "Content-Type": "application/json" },
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) return { data: null, error: { message: json.error_description || json.msg || json.message || "Erreur lors de la suppression." } };
          return { data: json, error: null };
        } catch (e) { return { data: null, error: { message: e.message } }; }
      },
    },
  },
};

// Décode le payload d'un JWT (base64url) pour lire son claim "aal" (Authenticator Assurance
// Level : "aal1" = mot de passe seul, "aal2" = mot de passe + second facteur vérifié). Ne fait
// aucune vérification de signature — usage limité à de l'affichage/contrôle de flux côté client,
// jamais à une décision de sécurité qui devrait être re-vérifiée côté serveur (RLS Postgres via
// auth.jwt()->>'aal', déjà le cas pour les policies Supabase sensibles).
// URL de la page actuellement chargée (sans hash/paramètres), utilisée comme cible de redirection
// pour les e-mails d'authentification (confirmation, réinitialisation...) — reste toujours correcte
// quel que soit l'hébergeur réel de l'app (Netlify, GitHub Pages, domaine personnalisé...), sans
// dépendre du "Site URL" configuré côté dashboard Supabase.
export function urlRedirectionAuth(admin) {
  return window.location.origin + window.location.pathname + (admin ? "?admin=1" : "");
}

export function decoderJwtPayload(token) {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) { return null; }
}

function getDeviceId() {
  try {
    let id = localStorage.getItem("pace-device-id");
    if (!id) { id = uid() + uid(); localStorage.setItem("pace-device-id", id); }
    return id;
  } catch (e) {
    // localStorage inaccessible (ex. aperçu en iframe restreinte) : identifiant en mémoire pour cette session
    return "temp-" + uid() + uid();
  }
}

export const DEVICE_ID = getDeviceId();

// Renvoie les renseignements du bénévole inscrit sur cet appareil (nom, contact, pays, ville,
// quartier), mis en cache lors de l'inscription — ou null si l'appareil n'a jamais rempli le
// formulaire bénévole. Utilisé pour accompagner automatiquement ses signalements.
export function getBenevoleInfo() {
  try {
    const raw = localStorage.getItem("pace-benevole-info");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

/* Retire un écouteur d'authentification citoyen. Fonction dédiée car la variable authListeners ne peut être réaffectée que dans ce module. */
export function retirerEcouteurAuth(cb) {
  authListeners = authListeners.filter((f) => f !== cb);
}
