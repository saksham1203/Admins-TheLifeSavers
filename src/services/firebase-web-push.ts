// src/firebase/firebase-web-push.ts
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log("Web FCM Token:", currentToken);
      // Save to backend if needed
    } else {
      console.warn("No registration token available.");
    }
  } catch (err) {
    console.error("Error getting token:", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
