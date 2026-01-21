/* Firebase Cloud Messaging Service Worker for PatientPort Lab */

/* global importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyAtP5iR3QfLbc7THpgOhjUdazrzDVeUiKY",
  authDomain: "patientport-latest.firebaseapp.com",
  projectId: "patientport-latest",const defaultVapidKey =
  "BMjXzjyQxd8L5qBQjgr3FkYnTAQ35lv6-jRcv_Nn4I-iSuv2uVjfKuJ0YOJxn_3IKDkRQpfC16LE1N53zxES3CE";

const vapidKeyFromConfig =
  config.VITE_FIREBASE_VAPID_KEY ||
  env.VITE_FIREBASE_VAPID_KEY ||
  win.VITE_FIREBASE_VAPID_KEY ||
  "";

const rawVapidKey = vapidKeyFromConfig || defaultVapidKey;
const vapidKey = normalizeVapidKey(rawVapidKey);

return {
  firebaseConfig: { ... },
  vapidKey,
};const defaultVapidKey =
  "BMjXzjyQxd8L5qBQjgr3FkYnTAQ35lv6-jRcv_Nn4I-iSuv2uVjfKuJ0YOJxn_3IKDkRQpfC16LE1N53zxES3CE";

const vapidKeyFromConfig =
  config.VITE_FIREBASE_VAPID_KEY ||
  env.VITE_FIREBASE_VAPID_KEY ||
  win.VITE_FIREBASE_VAPID_KEY ||
  "";

const rawVapidKey = vapidKeyFromConfig || defaultVapidKey;
const vapidKey = normalizeVapidKey(rawVapidKey);

return {
  firebaseConfig: { ... },
  vapidKey,
};const defaultVapidKey =
  "BMjXzjyQxd8L5qBQjgr3FkYnTAQ35lv6-jRcv_Nn4I-iSuv2uVjfKuJ0YOJxn_3IKDkRQpfC16LE1N53zxES3CE";

const vapidKeyFromConfig =
  config.VITE_FIREBASE_VAPID_KEY ||
  env.VITE_FIREBASE_VAPID_KEY ||
  win.VITE_FIREBASE_VAPID_KEY ||
  "";

const rawVapidKey = vapidKeyFromConfig || defaultVapidKey;
const vapidKey = normalizeVapidKey(rawVapidKey);

return {
  firebaseConfig: { ... },
  vapidKey,
};
  storageBucket: "patientport-latest.firebasestorage.app",
  messagingSenderId: "549918652532",
  appId: "1:549918652532:web:5556e0f6041ea06b367921",
  // measurementId is not required for messaging in the service worker
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || "Lab Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new lab update.",
    icon: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

