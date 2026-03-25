// src/lib/api/user-progress.ts
// Typed data access layer for user progress, study sessions, and achievements.
// All functions require an authenticated user — RLS enforces ownership.

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  StudySession,
  SessionStats,
  UserProgress,
  UserAchievement,
  UserProfile,
  StudyMode,
} from "@/types/database";

// ============================================================
// USER PROFILE
// ============================================================

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<UserProfile, "username" | "display_name" | "bio" | "avatar_url" | "privacy_settings">>
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update profile: ${error.message}`);
  return data as UserProfile;
}

// ============================================================
// STUDY SESSIONS
// ============================================================

export async function createStudySession(
  supabase: SupabaseClient,
  session: {
    user_id: string;
    session_type: StudyMode;
    mode: string;
    filters?: Record<string, unknown>;
    difficulty_level?: string;
  }
): Promise<StudySession> {
  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      ...session,
      stats: {
        total_questions: 0,
        correct_answers: 0,
        total_score: 0,
        hints_used: 0,
        streak: 0,
        longest_streak: 0,
        specimens_studied: 0,
        perfect_scores: 0,
      } satisfies SessionStats,
      is_complete: false,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as StudySession;
}

export async function updateStudySession(
  supabase: SupabaseClient,
  sessionId: string,
  updates: {
    stats?: SessionStats;
    is_complete?: boolean;
    ended_at?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<StudySession> {
  const { data, error } = await supabase
    .from("study_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  return data as StudySession;
}

export async function endStudySession(
  supabase: SupabaseClient,
  sessionId: string,
  finalStats: SessionStats
): Promise<StudySession> {
  return updateStudySession(supabase, sessionId, {
    stats: finalStats,
    is_complete: true,
    ended_at: new Date().toISOString(),
  });
}

export async function getUserSessions(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {}
): Promise<StudySession[]> {
  const { limit = 20 } = options;

  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
  return (data as StudySession[]) ?? [];
}

// ============================================================
// MODULE PROGRESS
// ============================================================

export async function getModuleProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, UserProgress>> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to fetch progress: ${error.message}`);

  const map: Record<string, UserProgress> = {};
  for (const progress of (data as UserProgress[]) ?? []) {
    map[progress.module_id] = progress;
  }
  return map;
}

export async function saveModuleProgress(
  supabase: SupabaseClient,
  userId: string,
  moduleId: string,
  updates: {
    completed?: boolean;
    score?: number;
    progress_data?: Record<string, unknown>;
  }
): Promise<UserProgress> {
  const row = {
    user_id: userId,
    module_id: moduleId,
    ...updates,
    completed_at: updates.completed ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("user_progress")
    .upsert(row, { onConflict: "user_id,module_id" })
    .select()
    .single();

  if (error) throw new Error(`Failed to save progress: ${error.message}`);
  return data as UserProgress;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch achievements: ${error.message}`);
  return (data as UserAchievement[]) ?? [];
}

export async function grantAchievement(
  supabase: SupabaseClient,
  userId: string,
  achievementKey: string,
  metadata?: Record<string, unknown>
): Promise<UserAchievement | null> {
  const { data, error } = await supabase
    .from("user_achievements")
    .upsert(
      {
        user_id: userId,
        achievement_key: achievementKey,
        metadata,
        earned_at: new Date().toISOString(),
      },
      { onConflict: "user_id,achievement_key" }
    )
    .select()
    .single();

  if (error) {
    console.error(`Failed to grant achievement: ${error.message}`);
    return null;
  }
  return data as UserAchievement;
}

// ============================================================
// AGGREGATE STATS (for profile page)
// ============================================================

export async function getUserStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  modulesCompleted: number;
  achievementsEarned: number;
  totalStudyTimeMinutes: number;
}> {
  // Fetch all in parallel
  const [sessionsResult, progressResult, achievementsResult] = await Promise.all([
    supabase
      .from("study_sessions")
      .select("stats, started_at, ended_at")
      .eq("user_id", userId)
      .eq("is_complete", true),
    supabase
      .from("user_progress")
      .select("completed")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("user_achievements")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const sessions = (sessionsResult.data ?? []) as Pick<StudySession, "stats" | "started_at" | "ended_at">[];

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalStudyTimeMinutes = 0;

  for (const session of sessions) {
    const stats = session.stats as SessionStats;
    totalQuestions += stats.total_questions || 0;
    totalCorrect += stats.correct_answers || 0;

    if (session.started_at && session.ended_at) {
      const start = new Date(session.started_at).getTime();
      const end = new Date(session.ended_at).getTime();
      totalStudyTimeMinutes += Math.round((end - start) / 60000);
    }
  }

  return {
    totalSessions: sessions.length,
    totalQuestions,
    totalCorrect,
    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    modulesCompleted: progressResult.data?.length ?? 0,
    achievementsEarned: achievementsResult.count ?? 0,
    totalStudyTimeMinutes,
  };
}
