import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ph.edu.neust.campuscare',
  appName: 'Campus I-Ulat',
  webDir: 'www',
  plugins: {
    // CapacitorHttp is called directly (CapacitorHttp.get / .post); plain fetch stays as is.
    CapacitorHttp: { enabled: false },
  },
};

export default config;
