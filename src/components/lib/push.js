import { DEVICE_ID, getActiveSession, supabase } from "./supabase.js";

// --- Notifications push réelles (fonctionnent même app fermée / téléphone verrouillé) ---
const VAPID_PUBLIC_KEY = "BADF58nqmx-yyzmqQ5TkwdSGIoUye6BRH19sVkMKUqF7JBf6o2RU0iFwWgwCq2Gjf-SUIHuyr4jNLg2UQDTJEUc";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function subscribeToPush() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const json = sub.toJSON();
    const s = getActiveSession();
    const email = s && s.user ? s.user.email : null;
    await supabase.from("push_subscriptions").upsert({
      device_id: DEVICE_ID, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, email,
    }, { onConflict: "device_id" });
    return true;
  } catch (e) {
    console.error("Erreur d'abonnement push :", e);
    return false;
  }
}
