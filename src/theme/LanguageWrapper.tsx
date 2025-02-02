import { useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '@app/provider/AuthProvider';
import { getLanguageFromLocale, i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import React from 'react';
import { LANGUAGE_CODE } from '@app/utils/constants';

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
        await AsyncStorage.removeItem('language');
        const storedLanguage = await AsyncStorage.getItem('language');

        if (storedLanguage) {
          i18n.locale = getLanguageFromLocale(storedLanguage);
        } else if (!authContext.isSignedIn) {
          // If user not logged in, set device locale
          i18n.locale = LANGUAGE_CODE;
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
            await setAppLanguage(getLanguageFromLocale(data.language));
          } else {
            i18n.locale = LANGUAGE_CODE;
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
