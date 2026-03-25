// src/app/(app)/profile/page.tsx
// User profile page — shows account info and study statistics.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserProfile, getUserStats } from "@/lib/api";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, stats] = await Promise.all([
    getUserProfile(supabase, user.id),
    getUserStats(supabase, user.id),
  ]);

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Profile
        </h1>
      </div>

      {/* Account Info */}
      <div className="p-6 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 mb-6">
        <h2 className="text-sm font-medium text-fungi-text-muted mb-4 uppercase tracking-wide">
          Account
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-fungi-text-muted">Email</span>
            <p className="text-fungi-text">{user.email}</p>
          </div>
          <div>
            <span className="text-sm text-fungi-text-muted">Display Name</span>
            <p className="text-fungi-text">
              {profile?.display_name || "Not set"}
            </p>
          </div>
          <div>
            <span className="text-sm text-fungi-text-muted">Member Since</span>
            <p className="text-fungi-text">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50">
        <h2 className="text-sm font-medium text-fungi-text-muted mb-4 uppercase tracking-wide">
          Study Stats
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Study Sessions" value={stats.totalSessions} icon="📊" />
          <StatBox label="Modules Completed" value={stats.modulesCompleted} icon="🎓" />
          <StatBox label="Questions Answered" value={stats.totalQuestions} icon="❓" />
          <StatBox label="Accuracy" value={stats.accuracy} icon="🎯" suffix="%" />
        </div>
        <p className="text-xs text-fungi-text-muted mt-4">
          Detailed stats and achievements will be available in Phase 3.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, suffix }: { label: string; value: number; icon: string; suffix?: string }) {
  return (
    <div className="p-4 rounded-lg bg-fungi-bg-secondary">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-bold font-[family-name:var(--font-display)]">
        {value}{suffix}
      </div>
      <div className="text-xs text-fungi-text-muted">{label}</div>
    </div>
  );
}
