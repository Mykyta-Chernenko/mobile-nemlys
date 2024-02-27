import { useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import React from 'react';

export const setAppLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('language', language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

interface Props {
  children: React.ReactNode;
}

export default function (props: Props) {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');

        if (storedLanguage) {
          i18n.locale = storedLanguage;
        } else if (!authContext.isSignedIn) {
          // If user not logged in, set device locale
          i18n.locale = Localization.locale;
        } else {
          // User logged in, fetch language setting from backend
          const { data, error } = await supabase
            .from('user_technical_details')
            .select('language')
            .eq('user_id', authContext.userId!)
            .maybeSingle();

          if (error) {
            console.error(error.message);
            return;
          }

          if (data && data.language) {
            await setAppLanguage(data.language);
          }
        }
      } catch (error) {
        console.error('Failed to set language', error);
      }
    };

    void fetchAndSetLanguage();
  }, [authContext.userId]);
  return <>{props.children}</>;
}
