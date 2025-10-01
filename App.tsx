import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import 'react-native-url-polyfill/auto';
import Navigation from './src/navigation';
import { AuthProvider } from '@app/provider/AuthProvider';
import LanguageWrapper from './src/theme/LanguageWrapper';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@app/theme';
import FontWrapper from '@app/theme/FontWrapper';
import * as Sentry from '@sentry/react-native';
import SplashScreen from '@app/theme/SplashScreen';
import ThemeStatusBar from '@app/theme/ThemeStatusBar';
import Toast, { ErrorToast } from 'react-native-toast-message';
import { isNetworkError } from '@app/utils/errors';
import { FontText } from '@app/components/utils/FontText';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const toastConfig = {
  error: (props) => <ErrorToast {...props} style={{ borderLeftColor: 'rgba(250, 65, 165, 1))' }} />,
  success: (props) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 20,
          gap: 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'rgba(26, 5, 47, 1)',
          borderRadius: 16,
        }}
      >
        {props?.props?.icon ? (
          <props.props.icon style={{ width: 24, height: 24 }} />
        ) : (
          <View style={{ height: 24, width: 24 }}></View>
        )}

        <FontText
          small
          style={{
            flex: 1,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          {props.text1}
        </FontText>

        <TouchableOpacity onPress={() => Toast.hide()}>
          <Image
            source={require('./assets/images/close_black.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      </View>
    );
  },
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
      Sentry.reactNativeTracingIntegration({
        shouldCreateSpanForRequest: (url) => {
          return !!url.match(/\/supabase\/?$/);
        },
      }),
    ],
    enableNativeFramesTracking: Constants.executionEnvironment === ExecutionEnvironment.StoreClient,
    tracesSampleRate: 0.1,
    attachScreenshot: true,
    attachStacktrace: true,
    beforeSend: (event, hint) => {
      // discard network error
      if (hint && hint.originalException && isNetworkError(hint.originalException)) {
        return null;
      }
      return event;
    },
  });
}

export default __DEV__ ? App : Sentry.wrap(App);
