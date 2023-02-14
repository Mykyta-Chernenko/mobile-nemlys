import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from 'react-native-dotenv';
export const AUTH_STORAGE_KEY = 'key';

export const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
  auth: {
    autoRefreshToken: true,
    storage: AsyncStorage as any,
    storageKey: AUTH_STORAGE_KEY,
    detectSessionInUrl: false,
  },
});
