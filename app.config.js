export default function () {
  const config = {
    expo: {
      name: 'Nemlys',
      slug: 'nemlys',
      scheme: 'nemlys',
      version: '3.2.3',
      orientation: 'portrait',
      icon: './assets/icon.png',
      splash: {
        image: './assets/splash.png',
        resizeMode: 'cover',
      },
      assetBundlePatterns: ['**/*'],
      ios: {
        appStoreUrl: 'itms-apps://apps.apple.com/id/app/nemlys/id1662262055',
        supportsTablet: true,
        bundleIdentifier: 'com.marakaci.nemlys',
        buildNumber: '3.2.3',
        googleServicesFile: './GoogleService-Info.dev.plist',
        config: {
          usesNonExemptEncryption: false,
        },
      },
      android: {
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.nemlys.app',
        package: 'com.nemlys.app',
        versionCode: 323,
      },
      web: {
        favicon: './assets/favicon.png',
      },
      extra: {
        eas: {
          projectId: 'd6eafe0b-1185-4733-8f06-e86dddfbb49e',
        },
      },
      plugins: [
        '@react-native-google-signin/google-signin',
        'sentry-expo',
        [
          'expo-build-properties',
          {
            ios: {
              useFrameworks: 'static',
            },
          },
        ],
        'expo-localization',
      ],
      hooks: {
        postPublish: [
          {
            file: 'sentry-expo/upload-sourcemaps',
            config: {
              organization: 'nemlys',
              project: 'nemlys',
              authToken: '0c404c02c48f4218865904370b10c0d5c07e5e66010b4de5a0dcf7c4bdb8f3ae',
            },
          },
        ],
      },
      runtimeVersion: {
        policy: 'sdkVersion',
      },
      updates: {
        checkAutomatically: 'ON_LOAD',
        fallbackToCacheTimeout: 2000,
        url: 'https://u.expo.dev/d6eafe0b-1185-4733-8f06-e86dddfbb49e',
      },
    },
  };
  // Default to the production plist
  let googleServiceFile = './GoogleService-Info.dev.plist';

  // Check the environment variable and switch to the dev plist if needed
  if (process.env.USE_DEV_PLIST === 'true') {
    googleServiceFile = './GoogleService-Info.dev.plist';
  }
  console.log(googleServiceFile);
  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: googleServiceFile,
    },
  };
}
