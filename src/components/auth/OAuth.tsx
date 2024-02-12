import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import AppleIcon from '@app/icons/apple';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { ANON_USER, AuthContext, handleAuthTokens } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { logErrors } from '@app/utils/errors';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import * as AppleAuthentication from 'expo-apple-authentication';

export const OAuth = ({
  handleUser,
  setLoading,
}: {
  handleUser: (provider: string) => (user: SupabaseUser) => Promise<void>;
  setLoading: (isLoadingL: boolean) => void;
}) => {
  const { theme } = useTheme();
  const [localloading, setLocalLoading] = useState(false);
  const auth = useContext(AuthContext);

  const googleAuth = async () => {
    setLoading(true);
    setLocalLoading(true);
    void localAnalytics().logEvent('LoginInitiated', {
      screen: 'OAuth',
      action: 'OAuth button clicked',
      provider: 'google',
      userId: ANON_USER,
    });
    // fixes a bug in supabase
    const oldWindow = window;
    window = undefined as any;
    try {
      const returnUrl = Linking.createURL('');
      const signInParms: SignInWithOAuthCredentials = {
        provider: 'google',
        options: {
          redirectTo: returnUrl,
        },
      };

      const { data } = await supabase.auth.signInWithOAuth(signInParms);
      const authUrl = data?.url;

      if (authUrl) {
        await Linking.openURL(authUrl);
      } else {
        throw Error(`authUrl is not returned ${JSON.stringify(data)}`);
      }
    } catch (e) {
      logErrors(e);
    } finally {
      window = oldWindow;
      setTimeout(() => setLocalLoading(false), 4000);
      setTimeout(() => setLoading(false), 4000);
    }
  };
  useEffect(() => {
    const handleDeepLinkingTokenResponse = async (url: string | null): Promise<void> => {
      setLocalLoading(true);
      setLoading(true);
      try {
        if (!url) return;
        const correctUrl = url.includes('#') ? url.replace('#', '?') : url;
        const urlObject = new URL(correctUrl);
        const accessToken = urlObject.searchParams.get('access_token');
        const refreshToken = urlObject.searchParams.get('refresh_token');
        if (!accessToken || !refreshToken) return;
        await handleAuthTokens(
          accessToken,
          refreshToken,
          handleUser('google'),
          auth.setIsSignedIn!,
          auth.setUserId!,
        );
      } catch (e) {
        logErrors(e);
        await supabase.auth.signOut();
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    };
    const listener = (event: { url: string }) => {
      void handleDeepLinkingTokenResponse(event.url);
    };
    const subscription = Linking.addEventListener('url', listener);
    void Linking.getInitialURL().then((url) => handleDeepLinkingTokenResponse(url));
    return () => {
      subscription.remove();
    };
  }, []);
  const appleAuth = async () => {
    setLoading(true);
    setLocalLoading(true);
    void localAnalytics().logEvent('LoginInitiated', {
      screen: 'OAuth',
      action: 'OAuth button clicked',
      provider: 'apple',
      userId: ANON_USER,
    });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        if (error) {
          throw new Error(
            `Error apple signing in, user: ${JSON.stringify(user)}, error: ${JSON.stringify(
              error,
            )}`,
          );
        }

        const session = await supabase.auth.getSession();

        const accessToken = session?.data?.session?.access_token;
        const refreshToken = session?.data?.session?.refresh_token;
        if (accessToken && refreshToken) {
          await handleAuthTokens(
            accessToken,
            refreshToken,
            handleUser('apple'),
            auth.setIsSignedIn!,
            auth.setUserId!,
          );
        } else {
          throw new Error(
            `Auth session has no access token ${JSON.stringify(session?.data?.session || {})}`,
          );
        }
      } else {
        throw new Error(`No identityToken, credential: ${JSON.stringify(credential)}`);
      }
    } catch (e) {
      logErrors(e);
      await supabase.auth.signOut();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };
  return (
    <>
      {Platform.OS === 'ios' && (
        <PrimaryButton
          onPress={() => void appleAuth()}
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
      )}
      <SecondaryButton
        onPress={() => void googleAuth()}
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
