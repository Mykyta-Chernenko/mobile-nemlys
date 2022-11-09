import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import {SUPABASE_URL, SUPABASE_KEY} from '@env'
export const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string, {
  auth:{
    storage: AsyncStorage as any,
    detectSessionInUrl: false 
  }
});
