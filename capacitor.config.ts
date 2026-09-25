import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ph.getdressdbyrissee.app',
  appName: "Get Dress'd by Rissée",
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // In production, when hosted on your custom domain, set url to your custom domain:
    // url: 'https://getdressdbyrissee.ph',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: "Get Dress'd by Rissée",
    allowsLinkPreview: true,
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0c0a09',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#0c0a09',
    },
  },
};

export default config;
