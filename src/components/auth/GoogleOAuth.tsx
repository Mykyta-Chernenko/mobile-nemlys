import { Button, Text } from '@rneui/themed';
import { startAsync } from 'expo-auth-session';
import React from 'react';
import { Platform, View } from 'react-native';
import GoogleIcon from '@app/icons/google';
import { supabase } from '@app/api/initSupabase';
import * as Linking from 'expo-linking';
import { Provider } from '@supabase/supabase-js';
import { i18n } from '@app/localization/i18n';
import { theme } from '@app/theme';
export const GoogleOAuth = () => {
  const onPress = async () => {
    const returnUrl = Linking.createURL('');
    const signInParms = {
      provider: 'google' as Provider,
      options: {
        redirectTo: returnUrl,
      },
    };
    if (Platform.OS == 'web') {
      const { error } = await supabase.auth.signInWithOAuth(signInParms);
      if (error) {
        alert('Error happened: ' + error.message);
      }
    } else {
      // fixes a bug in supabase
      const oldWindow = window;
      window = undefined as any;
      const { data } = await supabase.auth.signInWithOAuth(signInParms);
      const authUrl = data.url;
      const response = await startAsync({ authUrl, returnUrl });
      if (response.type == 'success') {
        await Linking.openURL(response.url);
      } else if (response.type == 'error') {
        alert('Error happened: ' + response.error?.message || response.error?.cause);
      } else {
        alert('Something unexpected happened ' + JSON.stringify(response));
      }
      window = oldWindow;
    }
  };
  return (
    <>
      <Text
        style={{
          alignSelf: 'center',
          color: theme.lightColors.grey3,
          marginVertical: 15,
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
