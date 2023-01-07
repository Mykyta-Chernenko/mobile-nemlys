import { useTheme } from '@rneui/themed';
import { startAsync } from 'expo-auth-session';
import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import AppleIcon from '@app/icons/apple';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { Provider, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext, globalHandleUser, handleAuthTokens } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { logErrors, logErrorsWithMessage, UserDoesNotExistError } from '@app/utils/errors';
import { SecondaryButton } from '../buttons/SecondaryButton';
export const OAuth = ({
  handleUser: handleUser,
}: {
  handleUser: (user: SupabaseUser, exists: boolean) => Promise<void>;
}) => {
  const { theme } = useTheme();
  const auth = useContext(AuthContext);
  const onPress = async (provider: Provider) => {
    const returnUrl = Linking.createURL('');
    const signInParms: SignInWithOAuthCredentials = {
      provider,
      options: {
        redirectTo: returnUrl,
      },
    };
    if (Platform.OS == 'web') {
      const { data, error } = await supabase.auth.signInWithOAuth(signInParms);
      if (error) {
        logErrors(error);
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
        globalHandleUser.value = handleUser;
        const response = await startAsync({ authUrl });
        try {
          if (response.type == 'success') {
            const accessToken = response.params['access_token'];
            const refreshToken = response.params['refresh_token'];
            if (accessToken && refreshToken) {
              await handleAuthTokens(accessToken, refreshToken, handleUser, auth.setIsSignedIn!);
            } else {
              throw new Error(`Auth response had no access_token ${JSON.stringify(response)}`);
            }
          } else if (response.type == 'error') {
            throw response.error;
          }
        } catch (e: unknown) {
          if (e instanceof UserDoesNotExistError) {
            logErrorsWithMessage(e, e.message);
          } else {
            logErrors(e);
          }
          await supabase.auth.signOut();
        } finally {
          globalHandleUser.value = null;
        }
      }

      window = oldWindow;
    }
  };
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
      }}
    >
      <View style={{ width: 200 }}>
        <SecondaryButton type="outline" onPress={() => void onPress('google')}>
          <GoogleIcon height="20" width="20" />

          <FontText style={{ marginLeft: 5 }}>{i18n.t('oauth.button.google')}</FontText>
        </SecondaryButton>
      </View>
      <View style={{ marginTop: 10, width: 200 }}>
        <SecondaryButton type="outline" onPress={() => void onPress('apple')}>
          <AppleIcon height="20" width="20" />

          <FontText style={{ marginLeft: 5 }}>{i18n.t('oauth.button.apple')}</FontText>
        </SecondaryButton>
      </View>
    </View>
  );
};
