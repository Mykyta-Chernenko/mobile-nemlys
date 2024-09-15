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
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <BaseToast {...props} style={{ borderLeftColor: 'rgba(182, 128, 241, 1)' }} />
  ),
  error: (props) => <ErrorToast {...props} style={{ borderLeftColor: 'rgba(250, 65, 165, 1))' }} />,
};
function App() {
  return (
    <>
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
      <Toast config={toastConfig}></Toast>
    </>
  );
}

if (!__DEV__) {
  Sentry.init({
    dsn: 'https://e3fb818e5bc14ba896e7b2f7bbd410b1@o4504363776344064.ingest.sentry.io/4504363782438912',
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: [/supabase/],
      }),
    ],
    tracesSampleRate: 0.1,
    attachScreenshot: true,
    attachStacktrace: true,
  });
}

export default __DEV__ ? App : Sentry.wrap(App);
