import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";
import { initializeApp, type FirebaseApp } from "firebase/app";
import Cookies from "js-cookie";
import configService from "./configService";

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

const normalizeVapidKey = (key: string | undefined | null): string => {
  if (!key) return "";
  if (typeof key !== "string") return "";
  let value = key.trim();
  if (!value) return "";
  if (value === "undefined" || value === "null") return "";
  if (value.length < 16) return "";
  value = value.replace(/\s+/g, "");
  const validChars = /^[A-Za-z0-9+\-_\/]+$/;
  if (!validChars.test(value)) return "";
  return value;
};

const firebaseConfigFromEnv = async () => {
  let config: any = {};
  try {
    config = await configService.getConfig();
  } catch {
    config = {};
  }

  const env: any = (import.meta as any).env || {};
  const win: any = typeof window !== "undefined" ? window : {};

  const apiKey =
    config.VITE_FIREBASE_API_KEY ||
    env.VITE_FIREBASE_API_KEY ||
    win.VITE_FIREBASE_API_KEY ||
    "";

  const projectId =
    config.VITE_FIREBASE_PROJECT_ID ||
    env.VITE_FIREBASE_PROJECT_ID ||
    win.VITE_FIREBASE_PROJECT_ID ||
    "";

  const senderId =
    config.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    win.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "";

  const appId =
    config.VITE_FIREBASE_APP_ID ||
    env.VITE_FIREBASE_APP_ID ||
    win.VITE_FIREBASE_APP_ID ||
    "";

  const authDomain =
    config.VITE_FIREBASE_AUTH_DOMAIN ||
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    win.VITE_FIREBASE_AUTH_DOMAIN ||
    "";

  const storageBucket =
    config.VITE_FIREBASE_STORAGE_BUCKET ||
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    win.VITE_FIREBASE_STORAGE_BUCKET ||
    "";

  const defaultVapidKey =
    "BMjXzjyQxd8L5qBQjgr3FkYnTAQ35lv6-jRcv_Nn4I-iSuv2uVjfKuJ0YOJxn_3IKDkRQpfC16LE1N53zxES3CE";

  const vapidKeyFromConfig =
    config.VITE_FIREBASE_VAPID_KEY ||
    env.VITE_FIREBASE_VAPID_KEY ||
    win.VITE_FIREBASE_VAPID_KEY ||
    "";

  const normalizedFromConfig = normalizeVapidKey(vapidKeyFromConfig);
  const normalizedDefault = normalizeVapidKey(defaultVapidKey);
  const raw = normalizedFromConfig || normalizedDefault;

  let vapidKey = raw;
  if (vapidKey) {
    let base64 = vapidKey.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    vapidKey = base64;
  }

  return {
    firebaseConfig: {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId: senderId,
      appId,
    },
    vapidKey,
  };
};

export const initializeFirebaseMessaging = async () => {
  if (firebaseApp && messaging) return { app: firebaseApp, messaging };
  if (typeof window === "undefined") return null;

  const { firebaseConfig } = await firebaseConfigFromEnv();
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) {
    return null;
  }

  firebaseApp = initializeApp(firebaseConfig);
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn("Firebase messaging is not supported in this environment");
    return null;
  }
  messaging = getMessaging(firebaseApp);
  return { app: firebaseApp, messaging };
};

export const requestOrderNotificationPermission = async () => {
  if (typeof window === "undefined" || typeof Notification === "undefined") return null;
  try {
    const permission = await Notification.requestPermission();
    console.log("Lab FCM notification permission:", permission);
    if (permission !== "granted") return null;

    const initialized = await initializeFirebaseMessaging();
    if (!initialized || !initialized.messaging) return null;

    const { vapidKey } = await firebaseConfigFromEnv();
    const normalizedVapidKey = vapidKey;
    const token = await getToken(
      initialized.messaging,
      normalizedVapidKey ? { vapidKey: normalizedVapidKey } : undefined
    );
    console.log("Lab FCM token:", token);
    if (!token) return null;

    Cookies.set("lab_fcm_token", token, { expires: 365 });
    return token;
  } catch (error) {
    console.error("Lab FCM permission/token error:", error);
    return null;
  }
};

export const subscribeToOrderForegroundMessages = async (handler: (payload: any) => void) => {
  const initialized = await initializeFirebaseMessaging();
  if (!initialized || !initialized.messaging) return;
  onMessage(initialized.messaging, (payload) => {
    console.log("Lab FCM foreground message:", payload);
    handler(payload);
  });
};
