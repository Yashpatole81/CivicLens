import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { LargeSecureStore } from "./auth-storage";

const DEFAULT_SUPABASE_URL = "https://gwhxfxpmptpddibmsfaq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aHhmeHBtcHRwZGRpYm1zZmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDg4NTcsImV4cCI6MjEwODc4NDg1N30.mz0Kn33Go-T4E9gS5N0IFUwbdDAmsjNDaD7H23kkuZY";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: LargeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
