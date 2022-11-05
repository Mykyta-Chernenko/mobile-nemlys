import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-url-polyfill/auto'
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient("https://rpqzwvkyzulmvvldkqse.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcXp3dmt5enVsbXZ2bGRrcXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjcxNjc5ODMsImV4cCI6MTk4Mjc0Mzk4M30.5YGQBVaGcTfljLUaviU_oKzdt-7BBKDIRN4dTlSYdxE", {
  auth:{
    storage: AsyncStorage as any,
  detectSessionInUrl: false 
  }
});
