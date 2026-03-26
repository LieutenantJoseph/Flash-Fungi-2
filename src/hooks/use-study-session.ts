// src/hooks/use-study-session.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SessionStats, StudyMode } from "@/types/database";

interface UseStudySessionOptions {
  userId: string;
  mode: StudyMode;
  filters?: Record<string, unknown>;
}

export function useStudySession({ userId, mode, filters }: UseStudySessionOptions) {
  const supabase = createClient();
  const sessionIdRef = useRef<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    total_questions: 0,
    correct_answers: 0,
    total_score: 0,
    hints_used: 0,
    streak: 0,
    longest_streak: 0,
    specimens_studied: 0,
    perfect_scores: 0,
  });

  // Start a new session in Supabase
  const startSession = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          session_type: mode,
          mode,
          filters: filters ?? null,
          stats: {
            total_questions: 0,
            correct_answers: 0,
            total_score: 0,
            hints_used: 0,
            streak: 0,
            longest_streak: 0,
            specimens_studied: 0,
            perfect_scores: 0,
          },
          is_complete: false,
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!error && data) {
        sessionIdRef.current = data.id;
      }
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }, [supabase, userId, mode, filters]);

  // Track a single flashcard answer
  const trackAnswer = useCallback(
    (result: {
      score: number; // 0-100
      isCorrect: boolean;
      hintsUsed: number;
    }) => {
      setStats((prev) => {
        const newStreak = result.isCorrect ? prev.streak + 1 : 0;
        return {
          total_questions: prev.total_questions + 1,
          correct_answers: prev.correct_answers + (result.isCorrect ? 1 : 0),
          total_score: prev.total_score + result.score,
          hints_used: prev.hints_used + result.hintsUsed,
          streak: newStreak,
          longest_streak: Math.max(prev.longest_streak, newStreak),
          specimens_studied: prev.specimens_studied + 1,
          perfect_scores: prev.perfect_scores + (result.score === 100 ? 1 : 0),
        };
      });
    },
    []
  );

  // End session and persist final stats
  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return stats;

    try {
      await supabase
        .from("study_sessions")
        .update({
          stats,
          is_complete: true,
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current);
    } catch (err) {
      console.error("Failed to end session:", err);
    }

    return stats;
  }, [supabase, stats]);

  return { stats, startSession, trackAnswer, endSession };
}
