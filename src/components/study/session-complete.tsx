// src/components/study/session-complete.tsx
"use client";

import Link from "next/link";
import type { SessionStats } from "@/types/database";

interface SessionCompleteProps {
  stats: SessionStats;
  mode: string;
  onRestart: () => void;
}

export function SessionComplete({ stats, mode, onRestart }: SessionCompleteProps) {
  const accuracy =
    stats.total_questions > 0
      ? Math.round((stats.correct_answers / stats.total_questions) * 100)
      : 0;
  const avgScore =
    stats.total_questions > 0
      ? Math.round(stats.total_score / stats.total_questions)
      : 0;

  const grade =
    avgScore >= 90
      ? { emoji: "🏆", label: "Outstanding!", color: "text-yellow-400" }
      : avgScore >= 75
        ? { emoji: "🌟", label: "Great work!", color: "text-green-400" }
        : avgScore >= 60
          ? { emoji: "👍", label: "Good effort!", color: "text-blue-400" }
          : avgScore >= 40
            ? { emoji: "📚", label: "Keep practicing!", color: "text-orange-400" }
            : { emoji: "🌱", label: "You're learning!", color: "text-fungi-text-secondary" };

  return (
    <div className="max-w-md mx-auto text-center animate-fade-in">
      <div className="text-6xl mb-4">{grade.emoji}</div>
      <h2 className={`text-2xl font-bold mb-1 font-[family-name:var(--font-display)] ${grade.color}`}>
        {grade.label}
      </h2>
      <p className="text-fungi-text-muted mb-8 capitalize">{mode} study complete</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50">
          <div className="text-2xl font-bold">{stats.correct_answers}/{stats.total_questions}</div>
          <div className="text-xs text-fungi-text-muted">Correct</div>
        </div>
        <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50">
          <div className={`text-2xl font-bold ${accuracy >= 70 ? "text-green-400" : accuracy >= 50 ? "text-yellow-400" : "text-red-400"}`}>
            {accuracy}%
          </div>
          <div className="text-xs text-fungi-text-muted">Accuracy</div>
        </div>
        <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50">
          <div className="text-2xl font-bold">{avgScore}</div>
          <div className="text-xs text-fungi-text-muted">Avg Score</div>
        </div>
        <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50">
          <div className="text-2xl font-bold">🔥 {stats.longest_streak}</div>
          <div className="text-xs text-fungi-text-muted">Best Streak</div>
        </div>
        {stats.perfect_scores > 0 && (
          <div className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 col-span-2">
            <div className="text-2xl font-bold text-yellow-400">⭐ {stats.perfect_scores}</div>
            <div className="text-xs text-fungi-text-muted">Perfect Scores</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-fungi-accent to-fungi-secondary hover:opacity-90 transition-opacity"
        >
          Study Again
        </button>
        <Link
          href="/study"
          className="w-full py-3 rounded-xl font-medium text-fungi-text-secondary border border-fungi-bg-tertiary hover:border-fungi-secondary/30 transition-colors text-center"
        >
          Back to Study Modes
        </Link>
      </div>
    </div>
  );
}
