import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import { analyticsForgetUser } from '@app/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';

export const logout = async () => {
  await supabase.auth.signOut();
  await analyticsForgetUser();
  Sentry.setUser(null);

  // just to make sure in case something goes wrong
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};
