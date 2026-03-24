// src/components/layout/app-shell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/study", label: "Study", icon: "⚡" },
  { href: "/field-guide", label: "Field Guide", icon: "📖" },
  { href: "/training", label: "Training", icon: "🎓" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-fungi-bg/80 backdrop-blur-md border-b border-fungi-bg-tertiary/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🍄</span>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold bg-gradient-to-r from-fungi-primary to-fungi-secondary bg-clip-text text-transparent hidden sm:inline">
              Flash Fungi
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-fungi-bg-card text-fungi-text border border-fungi-secondary/30"
                      : "text-fungi-text-muted hover:text-fungi-text hover:bg-fungi-bg-secondary"
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info + sign out */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-fungi-text-muted hidden sm:inline truncate max-w-[160px]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs text-fungi-text-muted hover:text-fungi-danger transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-fungi-bg/95 backdrop-blur-md border-t border-fungi-bg-tertiary/50 z-50">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive
                    ? "text-fungi-accent"
                    : "text-fungi-text-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="sm:hidden h-16" />
    </div>
  );
}
