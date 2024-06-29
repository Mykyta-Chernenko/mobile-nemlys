import React from 'react';
import 'react-native-url-polyfill/auto';
import Navigation from './src/navigation';
import { AuthProvider } from './src/provider/AuthProvider';
import LanguageWrapper from './src/theme/LanguageWrapper';

import { ThemeProvider } from '@rneui/themed';
import { theme } from '@app/theme';
import FontWrapper from '@app/theme/FontWrapper';
import * as Sentry from '@sentry/react-native';
import SplashScreen from '@app/theme/SplashScreen';
import ThemeStatusBar from '@app/theme/ThemeStatusBar';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <FontWrapper>
        <SplashScreen>
          <AuthProvider>
            <LanguageWrapper>
              <Navigation />
            </LanguageWrapper>
          </AuthProvider>
          <ThemeStatusBar></ThemeStatusBar>
        </SplashScreen>
      </FontWrapper>
    </ThemeProvider>
  );
}

Sentry.init({
  dsn: 'https://e3fb818e5bc14ba896e7b2f7bbd410b1@o4504363776344064.ingest.sentry.io/4504363782438912',
  debug: false,
  integrations: [
    new Sentry.ReactNativeTracing({
      tracingOrigins: [/supabase/],
    }),
  ],
  tracesSampleRate: 0.1,
  attachScreenshot: true,
  attachStacktrace: true,
});

export default Sentry.wrap(App);
