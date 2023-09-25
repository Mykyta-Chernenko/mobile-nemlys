import React from 'react';
import 'react-native-url-polyfill/auto';
import Navigation from './src/navigation';
import { AuthProvider } from './src/provider/AuthProvider';

import * as Localization from 'expo-localization';
import { i18n } from '@app/localization/i18n';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@app/theme';
import FontWrapper from '@app/theme/FontWrapper';
import * as Sentry from 'sentry-expo';
import SplashScreen from '@app/theme/SplashScreen';
import ThemeStatusBar from '@app/theme/ThemeStatusBar';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <FontWrapper>
        <SplashScreen>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
          <ThemeStatusBar></ThemeStatusBar>
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
