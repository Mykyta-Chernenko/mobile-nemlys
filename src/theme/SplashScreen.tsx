import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, BackHandler, Image, ImageBackground, Linking, Platform } from 'react-native';
import { logErrors } from '@app/utils/errors';
import { SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { expo } from '../../app.json';
import { i18n } from '@app/localization/i18n';

interface Props {
  children: React.ReactNode;
}
void SplashScreen.preventAutoHideAsync();

export default function (props: Props) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    // so the splash is both hidden and rendered on the same tick, no white screen between
    setTimeout(() => void SplashScreen.hideAsync(), 100);
  });
  useEffect(() => {
    const f = async () => {
      const res: SupabaseAnswer<{ version }> = await supabase
        .from('app_settings')
        .select('version')
        .single();
      if (res.error) {
        logErrors(res.error);
        setShow(false);
        return;
      }
      if (res.data.version > parseInt(expo.version.replaceAll('.', ''), 10)) {
        Alert.alert(
          i18n.t('update.outdated_title'),
          i18n.t('update.need_to_update'),
          [
            {
              text: i18n.t('update.title'),
              onPress: () => {
                void BackHandler.exitApp();
                if (Platform.OS === 'android') {
                  void Linking.openURL(
                    'https://play.google.com/store/apps/details?id=com.nemlys.app',
                  );
                } else if (Platform.OS === 'ios') {
                  void Linking.openURL('itms-apps://apps.apple.com/id/app/nemlys/id1662262055');
                }
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        setShow(false);
      }
    };
    void f();
  });
  return show ? (
    <ImageBackground
      style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      source={require('../../assets/splash.png')}
    >
      <Image
        style={{
          height: 70,
          width: 70,
          borderRadius: 7,
        }}
        source={require('../../assets/icon.gif')}
      ></Image>
    </ImageBackground>
  ) : (
    <>{props.children}</>
  );
}
