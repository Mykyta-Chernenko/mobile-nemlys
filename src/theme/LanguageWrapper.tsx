import { useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '@app/provider/AuthProvider';
import { getLanguageFromLocale, i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import React from 'react';
import { LANGUAGE_CODE } from '@app/utils/constants';
import { localAnalytics } from '@app/utils/analytics';

export const setAppLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem('language', language);
    i18n.locale = language;
    localAnalytics().setLanguage(language);
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
    const retrieveLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        return getLanguageFromLocale(storedLanguage);
      } else if (!authContext.isSignedIn) {
        return LANGUAGE_CODE;
      } else {
        const { data, error } = await supabase
          .from('user_technical_details')
          .select('language')
          .eq('user_id', authContext.userId!)
          .maybeSingle();

        if (error) {
          console.error(error.message);
          return LANGUAGE_CODE;
        }

        if (data && data?.language) {
          return getLanguageFromLocale(data.language);
        } else {
          return LANGUAGE_CODE;
        }
      }
    };

    const fetchAndSetLanguage = async () => {
      try {
        const language = await retrieveLanguage();
        i18n.locale = language;
        localAnalytics().setLanguage(language);
      } catch (error) {
        console.error('Failed to set language', error);
      }
    };

    void fetchAndSetLanguage();
  }, [authContext.userId]);
  return <>{props.children}</>;
}
