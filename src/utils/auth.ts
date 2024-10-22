import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import { analyticsForgetUser } from '@app/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const logout = async () => {
  await supabase.auth.signOut();
  await analyticsForgetUser();
  // just to make sure in case something goes wrong
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};
