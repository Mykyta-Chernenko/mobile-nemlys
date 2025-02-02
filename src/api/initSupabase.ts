import { Database } from '@app/types/supabase.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from 'react-native-dotenv';
import { fetchWithRetry } from '@app/utils/retry';
export const AUTH_STORAGE_KEY = 'key';

export const supabase = createClient<Database>(SUPABASE_URL as string, SUPABASE_KEY as string, {
  global: { fetch: fetchWithRetry },
  auth: {
    autoRefreshToken: true,
    storage: AsyncStorage as any,
    storageKey: AUTH_STORAGE_KEY,
    detectSessionInUrl: false,
  },
});
