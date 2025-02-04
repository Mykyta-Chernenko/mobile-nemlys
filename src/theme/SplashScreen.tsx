import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, BackHandler, ImageBackground, Linking } from 'react-native';
import { logErrorsWithMessageWithoutAlert, logSupaErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import Constants from 'expo-constants';
import { i18n } from '@app/localization/i18n';
import * as StoreReview from 'expo-store-review';
import * as Updates from 'expo-updates';
import { localAnalytics } from '@app/utils/analytics';
import { ANON_USER } from '@app/provider/AuthProvider';
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
    async function checkEASUpdates() {
      try {
        if (__DEV__) return false;
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          void localAnalytics().logEvent('EASUpdateAvailable', {
            userId: ANON_USER,
            updateDetails: update,
          });
          await Updates.fetchUpdateAsync();
          void localAnalytics().logEvent('EASUpdateFetched', {
            userId: ANON_USER,
          });
          await Updates.reloadAsync();
          void localAnalytics().logEvent('EASUpdateAppReloaded', {
            userId: ANON_USER,
          });
          return true;
        }
        return false;
      } catch (error) {
        logErrorsWithMessageWithoutAlert(error, `Error fetching latest Expo update`);
        return false;
      }
    }

    const checkUpdates = async () => {
      const [res, updateAvailable] = await Promise.all([
        supabase.from('app_settings').select('version').single(),
        checkEASUpdates(),
      ]);
      // we need to proceed with the update, no more calls
      if (updateAvailable) {
        return;
      }
      if (res.error) {
        logSupaErrors(res.error);
        setShow(false);
        return;
      }
      if (res.data.version > parseInt(Constants.expoConfig!.version!.replaceAll('.', ''), 10)) {
        void localAnalytics().logEvent('AppRequireUpdateShow', {
          userId: ANON_USER,
        });
        Alert.alert(
          i18n.t('update_outdated_title'),
          i18n.t('update_need_to_update'),
          [
            {
              text: i18n.t('update_title'),
              onPress: () => {
                const url = StoreReview.storeUrl();
                void Linking.openURL(url!).then(() => BackHandler.exitApp());
              },
            },
          ],
          { cancelable: false },
        );
      } else {
        setShow(false);
      }
    };
    void checkUpdates();
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
