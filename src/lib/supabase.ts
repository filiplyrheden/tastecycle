import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = Constants.expoConfig?.extra ?? {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY in Expo extra config."
  );
}

export const supabase = createClient(
  String(SUPABASE_URL),
  String(SUPABASE_ANON_KEY),
  {
    auth: {
      storage: {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      },
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
