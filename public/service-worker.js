// Service Worker EcoVigil
// Accompagne manifest.json pour le fonctionnement hors ligne (mise en cache de l'app shell)
// et les notifications push réelles (fonctionnent même app fermée / téléphone verrouillé).
//
// À chaque déploiement qui change index.html, manifest.json ou les icônes, incrémente
// CACHE_VERSION ci-dessous pour que les appareils déjà installés récupèrent la nouvelle version
// au lieu de rester bloqués sur une version mise en cache.
const CACHE_VERSION = "ecovigil-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-16.png",
  "./icon-32.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord (pour avoir la dernière version dès qu'il y a une connexion),
// avec repli sur le cache si hors ligne — et mise à jour silencieuse du cache à chaque succès.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // jamais interférer avec Supabase, tuiles de carte, etc.

  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() =>
        caches.match(event.request).then((reponse) => reponse || caches.match("./index.html"))
      )
  );
});

// --- Notifications push réelles (voir VAPID_PUBLIC_KEY et subscribeToPush() dans index.html) ---
self.addEventListener("push", (event) => {
  let donnees = {};
  try { donnees = event.data ? event.data.json() : {}; } catch (e) { donnees = { body: event.data ? event.data.text() : "" }; }

  const titre = donnees.title || "EcoVigil";
  const options = {
    body: donnees.body || "",
    icon: donnees.icon || "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: donnees.url || "./index.html" },
    tag: donnees.tag || undefined,
  };

  event.waitUntil(self.registration.showNotification(titre, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./index.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((listeClients) => {
      for (const client of listeClients) {
        if (client.url.includes(new URL(url, self.location.href).pathname) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
