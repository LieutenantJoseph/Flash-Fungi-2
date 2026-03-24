// src/app/(app)/layout.tsx
// Layout for all authenticated app pages (study, field-guide, training, profile).
// Provides the persistent navigation bar and sign-out functionality.

import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This layout is for authenticated routes. If no user, redirect.
  // (Middleware also guards this, but defense in depth.)
  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
