// src/app/page.tsx
// Landing page for Flash Fungi.
// Server Component — fetches specimen stats at request time.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch stats for the landing page
  const { count: specimenCount } = await supabase
    .from("specimens")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: speciesCount } = await supabase
    .from("field_guides")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-fungi-bg-tertiary/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="mushroom">🍄</span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold bg-gradient-to-r from-fungi-primary to-fungi-secondary bg-clip-text text-transparent">
            Flash Fungi
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/study"
                className="text-sm text-fungi-text-secondary hover:text-fungi-text transition-colors"
              >
                Study
              </Link>
              <Link
                href="/field-guide"
                className="text-sm text-fungi-text-secondary hover:text-fungi-text transition-colors"
              >
                Field Guide
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fungi-bg-card border border-fungi-bg-tertiary hover:border-fungi-secondary/50 transition-colors"
              >
                <span className="text-sm">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-fungi-text-secondary hover:text-fungi-text transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-fungi-primary to-fungi-secondary text-white hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center animate-fade-in">
          <div className="text-7xl mb-6" role="img" aria-label="mushroom">
            🍄
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-fungi-primary via-fungi-secondary to-fungi-accent bg-clip-text text-transparent">
            Master Mycology
          </h1>
          <p className="text-xl text-fungi-text-secondary mb-10 leading-relaxed">
            Learn to identify mushrooms with research-grade specimens,
            progressive hints, and interactive training modules.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href={user ? "/study" : "/signup"}
              className="px-8 py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-fungi-accent to-fungi-secondary text-white shadow-lg shadow-fungi-accent/20 hover:shadow-fungi-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {user ? "Start Studying" : "Create Free Account"}
            </Link>
            <Link
              href="/field-guide"
              className="px-8 py-3.5 text-base font-semibold rounded-xl border border-fungi-bg-tertiary text-fungi-text-secondary hover:border-fungi-secondary/50 hover:text-fungi-text transition-all"
            >
              Browse Field Guide
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-md mx-auto">
            <StatCard value={specimenCount ?? 0} label="Specimens" icon="🔬" />
            <StatCard value={speciesCount ?? 0} label="Species Guides" icon="📖" />
            <StatCard value={4} label="Study Modes" icon="⚡" className="col-span-2 sm:col-span-1" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-fungi-text-muted border-t border-fungi-bg-tertiary/30">
        Flash Fungi v2.0 — Built for mycology enthusiasts
      </footer>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  className = "",
}: {
  value: number;
  label: string;
  icon: string;
  className?: string;
}) {
  return (
    <div className={`p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 ${className}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold font-[family-name:var(--font-display)] text-fungi-text">
        {value}
      </div>
      <div className="text-xs text-fungi-text-muted">{label}</div>
    </div>
  );
}
