import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.thesoros.app",
  appName: "THÉSOROS",
  webDir: "public",
  server: {
    url: "https://xn--thsoros-cya.com",
    cleartext: false,
  },
};

export default config;