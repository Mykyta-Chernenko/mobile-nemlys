import { Button, useTheme } from '@rneui/themed';
import { startAsync } from 'expo-auth-session';
import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { Provider, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext, handleAuthTokens } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import * as Sentry from 'sentry-expo';
export const GoogleOAuth = ({
  handleUser: handleUser,
}: {
  handleUser: (user: SupabaseUser, exists: boolean) => Promise<void>;
}) => {
  const { theme } = useTheme();
  const auth = useContext(AuthContext);
  const onPress = async () => {
    const returnUrl = Linking.createURL('');
    const signInParms: SignInWithOAuthCredentials = {
      provider: 'google' as Provider,
      options: {
        redirectTo: returnUrl,
      },
    };
    if (Platform.OS == 'web') {
      const { data, error } = await supabase.auth.signInWithOAuth(signInParms);
      if (error) {
        alert('Error happened: ' + error.message);
      } else {
        console.log(data.url);
      }
    } else {
      // fixes a bug in supabase
      const oldWindow = window;
      window = undefined as any;
      const { data } = await supabase.auth.signInWithOAuth(signInParms);
      const authUrl = data.url;
      if (authUrl) {
        // WARN: on Android instead of getting the response back,
        //  we get a dismissed event, but we get the access token and the refesh token in the URL,
        //  so we use a URL listener from the AuthProvider to handle it
        auth.setHandleUser?.(handleUser);
        const response = await startAsync({ authUrl });
        try {
          if (response.type == 'success') {
            const accessToken = response.params['access_token'];
            const refreshToken = response.params['refresh_token'];
            if (accessToken && refreshToken) {
              await handleAuthTokens(accessToken, refreshToken, handleUser, auth.setIsSignedIn!);
            } else {
              console.error(`Auth response had no access_token ${JSON.stringify(response)}`);
              throw new Error();
            }
          } else if (response.type == 'error') {
            throw response.error;
          }
        } catch (e: unknown) {
          Sentry.Native.captureException(e);
          alert(
            e?.['message']
              ? `Error happened: ${e?.['message'] as string}`
              : i18n.t('unexpected_error'),
          );
          await supabase.auth.signOut();
        } finally {
          auth.setHandleUser?.(null);
        }
      }

      window = oldWindow;
    }
  };
  return (
    <>
      <FontText
        style={{
          alignSelf: 'center',
          color: theme.colors.background,
        }}
      >
        {i18n.t('oauth.pretext')}
      </FontText>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button type="outline" onPress={() => void onPress()}>
          <GoogleIcon height="20" width="20" />

          <FontText style={{ marginLeft: 5 }}>{i18n.t('oauth.button.google')}</FontText>
        </Button>
      </View>
    </>
  );
};
