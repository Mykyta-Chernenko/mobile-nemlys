import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { AuthProvider } from './src/provider/AuthProvider';

import * as Localization from 'expo-localization';
import { i18n } from '@app/localization/i18n';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@app/theme';
import FontWrapper from '@app/theme/FontWrapper';
import * as Sentry from 'sentry-expo';
import { BackHandler } from 'react-native';
import SplashScreen from '@app/theme/SplashScreen';

export default function App() {
  // disable android button back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () => backHandler.remove();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <FontWrapper>
        <SplashScreen>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
          <StatusBar style="dark" />
        </SplashScreen>
      </FontWrapper>
    </ThemeProvider>
  );
}

Sentry.init({
  dsn: 'https://e3fb818e5bc14ba896e7b2f7bbd410b1@o4504363776344064.ingest.sentry.io/4504363782438912',
  enableInExpoDevelopment: false,
  debug: true,
  integrations: [
    new Sentry.Native.ReactNativeTracing({
      tracingOrigins: [/supabase/],
    }),
  ],
  tracesSampleRate: 0.1,
});
i18n.locale = Localization.locale;
