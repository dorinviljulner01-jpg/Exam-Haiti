import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// En Stage 1, ces variables peuvent être vides : l'appli tourne avec les
// données de démonstration locales (lib/sampleData.ts). Dès que tu ajoutes
// un vrai projet Supabase dans .env.local, l'authentification devient réelle.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
