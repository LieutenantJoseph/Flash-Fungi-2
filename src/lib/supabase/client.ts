// src/lib/supabase/client.ts
// Browser-side Supabase client. Uses the anon key and respects RLS policies.
// Use this in Client Components ("use client").

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
