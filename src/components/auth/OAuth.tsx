import { useTheme } from '@rneui/themed';
import { startAsync } from 'expo-auth-session';
import React, { useContext, useState } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import AppleIcon from '@app/icons/apple';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { Provider, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import {
  ANON_USER,
  AuthContext,
  globalHandleUser,
  handleAuthTokens,
} from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { logErrors, logErrorsWithMessage, UserDoesNotExistError } from '@app/utils/errors';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '../buttons/PrimaryButtons';

// TODO use expo onyl in dev, use directl implementetion for prod to login
export const OAuth = ({
  handleUser,
  setLoading,
}: {
  handleUser: (provider: string) => (user: SupabaseUser, exists: boolean) => Promise<void>;
  setLoading: (isLoadingL: boolean) => void;
}) => {
  const { theme } = useTheme();
  const [localloading, setLocalLoading] = useState(false);
  const auth = useContext(AuthContext);

  const onPress = async (provider: Provider) => {
    setLoading(true);
    setLocalLoading(true);
    void localAnalytics().logEvent('LoginInitiated', {
      screen: 'OAuth',
      action: 'OAuth button clicked',
      provider,
      userId: ANON_USER,
    });
    try {
      const returnUrl = Linking.createURL('');
      const signInParms: SignInWithOAuthCredentials = {
        provider,
        options: {
          redirectTo: returnUrl,
          scopes: Platform.OS === 'ios' ? 'name email' : undefined,
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
          globalHandleUser.value = handleUser(provider);
          const response = await startAsync({
            authUrl: authUrl,
            projectNameForProxy: '@marakaci/nemlys',
          });
          console.log(response);
          try {
            if (response.type == 'success') {
              const accessToken = response.params['access_token'];
              const refreshToken = response.params['refresh_token'];
              if (accessToken && refreshToken) {
                await handleAuthTokens(
                  accessToken,
                  refreshToken,
                  handleUser(provider),
                  auth.setIsSignedIn!,
                  auth.setUserId!,
                );
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
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };
  return (
    <>
      <PrimaryButton
        onPress={() => void onPress('apple')}
        buttonStyle={{
          marginTop: 10,
        }}
        disabled={localloading}
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <AppleIcon
            height="20"
            width="20"
            fill={theme.colors.grey0}
            style={{ borderWidth: 0, borderColor: 'white' }}
          />

          <FontText
            style={{
              marginLeft: 5,
              color: theme.colors.grey0,
              paddingTop: 7,
              fontSize: 16,
            }}
          >
            {i18n.t('oauth.button.apple')}
          </FontText>
        </View>
      </PrimaryButton>
      <SecondaryButton
        onPress={() => void onPress('google')}
        disabled={localloading}
        buttonStyle={{ marginTop: 10, borderColor: theme.colors.grey3, borderWidth: 1 }}
      >
        <GoogleIcon height="20" width="20" />
        <FontText style={{ marginLeft: 5, fontSize: 16, paddingTop: 3 }}>
          {i18n.t('oauth.button.google')}
        </FontText>
      </SecondaryButton>
    </>
  );
};
