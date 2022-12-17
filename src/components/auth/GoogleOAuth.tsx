import { Button, Text, useTheme } from '@rneui/themed';
import { startAsync } from 'expo-auth-session';
import React, { useContext } from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { Provider, SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext, setSession } from '@app/provider/AuthProvider';
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
        const response = await startAsync({ authUrl, returnUrl });
        try {
          if (response.type == 'success') {
            const accessToken = response.params['access_token'];
            const refreshToken = response.params['refresh_token'];
            if (accessToken && refreshToken) {
              await setSession(accessToken, refreshToken);
              const { data: user, error } = await supabase.auth.getUser();
              if (error) {
                throw error;
              } else {
                const userId = user.user.id;
                const { error, count } = await supabase
                  .from('user_profile')
                  .select('*', { count: 'exact' })
                  .eq('user_id', userId);
                if (error) {
                  throw error;
                }
                await handleUser(user.user, !!count);
                auth.setIsSignedIn?.(true);
              }
            } else {
              console.error(`Auth response had no access_token ${JSON.stringify(response)}`);
              throw new Error();
            }
          } else if (response.type == 'error') {
            throw response.error;
          } else {
            throw new Error();
          }
        } catch (e: unknown) {
          alert(
            e?.['message']
              ? `Error happened: ${e?.['message'] as string}`
              : 'Something unexpected happened, try again',
          );
          await supabase.auth.signOut();
        }
      }

      window = oldWindow;
    }
  };
  return (
    <>
      <Text
        style={{
          alignSelf: 'center',
          color: theme.colors.background,
        }}
      >
        {i18n.t('oauth.pretext')}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button type="outline" onPress={() => void onPress()}>
          <GoogleIcon height="20" width="20" />

          <Text style={{ marginLeft: 5 }}>{i18n.t('oauth.button.google')}</Text>
        </Button>
      </View>
    </>
  );
};
