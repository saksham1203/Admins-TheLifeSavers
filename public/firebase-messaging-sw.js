importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyB5goHrC_xq-VyXoylQTAxMOXBK4AO65R8",
    authDomain: "the-life-savers.firebaseapp.com",
    projectId: "the-life-savers",
    storageBucket: "the-life-savers.firebasestorage.app",
    messagingSenderId: "480246787774",
    appId: "1:480246787774:web:328add65f6aefe7c04f8ef",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
