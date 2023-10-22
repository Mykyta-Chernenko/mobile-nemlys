import { useTheme } from '@rneui/themed';
import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import AppleIcon from '@app/icons/apple';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { supabase } from '@app/api/initSupabase';
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
  GoogleSignin.configure({
    scopes: ['openid', 'profile', 'email'],
    webClientId: '657800157778-icettrm0tf6f5ultfljdkftmju32ur59.apps.googleusercontent.com',
    // iosClientId: 'com.googleusercontent.apps.318892102836-d27hl77305a4e4qcgbmo5chtgc43kups',
  });

  const handlePress = async () => {
    try {
      // doesn't work because it's not possible to provide nonce to GoogleSignin
      await GoogleSignin.hasPlayServices();
      const a2 = await GoogleSignin.getTokens();
      if (a2.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: a2.idToken,
        });
        console.log(error, data);
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
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
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => void handlePress()}
      />
    </>
  );
};
