// admin/src/lib/supabase/server.ts
// Admin server client. Uses service role key to bypass RLS for all data operations.
// Auth still uses anon key + cookies for login session management.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Auth client — for checking who is logged in (uses anon key + cookies)
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context
          }
        },
      },
    }
  );
}

// Admin data client — bypasses RLS for all CRUD operations
export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(_cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Admin client doesn't manage cookies
        },
      },
    }
  );
}
