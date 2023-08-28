import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, BackHandler, ImageBackground, Linking } from 'react-native';
import { logErrors } from '@app/utils/errors';
import { SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import Constants from 'expo-constants';
import { i18n } from '@app/localization/i18n';
import * as StoreReview from 'expo-store-review';
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
      if (res.data.version > parseInt(Constants.expoConfig!.version!.replaceAll('.', ''), 10)) {
        Alert.alert(
          i18n.t('update.outdated_title'),
          i18n.t('update.need_to_update'),
          [
            {
              text: i18n.t('update.title'),
              onPress: () => {
                void BackHandler.exitApp();
                const url = StoreReview.storeUrl();
                void Linking.openURL(url!);
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
    ></ImageBackground>
  ) : (
    <>{props.children}</>
  );
}
