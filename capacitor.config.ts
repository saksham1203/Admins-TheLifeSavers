import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.thelifesavers.app',
  appName: 'TheLifeSavers',
  webDir: 'dist',
  server: {
    androidScheme: "https",
    iosScheme: "https",
    hostname: "www.thelifesavers.in",
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "#ffffffff",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
