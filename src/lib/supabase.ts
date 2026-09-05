import { createClient } from "@supabase/supabase-js";

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR_SUPABASE_URL_HERE")) {
  console.warn(
    "Supabase credentials missing. Make sure you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local",
  );
}

export const supabase = createClient(
  supabaseUrl && supabaseUrl.startsWith("http") ? supabaseUrl : "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);
