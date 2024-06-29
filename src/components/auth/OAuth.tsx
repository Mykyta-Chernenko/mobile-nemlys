import { useTheme } from '@rneui/themed';
import React, { useContext, useState } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import AppleIcon from '@app/icons/apple';
import { supabase } from '@app/api/initSupabase';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { ANON_USER, AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { logErrorsWithMessage } from '@app/utils/errors';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { IS_SUPABASE_DEV } from '@app/utils/constants';

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
  const devConfig = {
    webClientId: '146690585551-vj1sip8h25ois3oun3fv0m0rfg614it3.apps.googleusercontent.com',
    iosClientId: '146690585551-kmmq76bsbhb4d9hljoups22889rvkklu.apps.googleusercontent.com',
  };
  const prodConfig = {
    webClientId: '318892102836-d27hl77305a4e4qcgbmo5chtgc43kups.apps.googleusercontent.com',
    iosClientId: '318892102836-9ud8fcu170fqr5i56bcskeci051gc6ra.apps.googleusercontent.com',
  };
  const config = IS_SUPABASE_DEV ? devConfig : prodConfig;
  GoogleSignin.configure(config);
  const signIn = async () => {
    try {
      setLoading(true);
      setLocalLoading(true);
      void localAnalytics().logEvent('LoginInitiated', {
        screen: 'OAuth',
        action: 'OAuth button clicked',
        provider: 'google',
        userId: ANON_USER,
      });
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken!,
      });
      if (error) {
        throw new Error(
          `Error google signing in, error: ${JSON.stringify(error)}, user: ${JSON.stringify(
            userInfo,
          )}, `,
        );
      }
      await handleUser('google')(data.user);
      auth?.setIsSignedIn!(true);
      auth?.setUserId!(data.user.id);
    } catch (e) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // cancelled login, proceed
      } else {
        logErrorsWithMessage(e, (e?.message as string) || '');
        await supabase.auth.signOut();
      }
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };
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
        if (error || user === null) {
          throw new Error(
            `Error apple signing in, error: ${JSON.stringify(error)}, user: ${
              user !== null ? JSON.stringify(user) : ''
            }`,
          );
        }
        await handleUser('google')(user);
        auth?.setIsSignedIn!(true);
        auth?.setUserId!(user.id);
      } else {
        throw new Error(`No identityToken, credential: ${JSON.stringify(credential)}`);
      }
    } catch (e) {
      console.log(JSON.stringify(e));
      if (e.code === 'ERR_REQUEST_CANCELED' || e.code === 'ERR_REQUEST_UNKNOWN') {
        // cancelled login, proceed
      } else {
        logErrorsWithMessage(e, (e?.message as string) || '');
        await supabase.auth.signOut();
      }
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
        onPress={() => void signIn()}
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
