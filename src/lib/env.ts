// src/lib/env.ts
// Centralized environment variable access with validation.
// Import from here instead of reading process.env directly.

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

// Public variables (safe for browser, prefixed with NEXT_PUBLIC_)
export const env = {
  supabase: {
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;

// Server-only variables (NEVER import this in client components)
export const serverEnv = {
  supabase: {
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
} as const;
