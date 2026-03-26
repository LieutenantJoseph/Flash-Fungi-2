// src/app/(app)/study/page.tsx
// Study mode selection page.
// Phase 3 will build out the full flashcard engine here.

import Link from "next/link";

export const metadata = {
  title: "Study",
};

const STUDY_MODES = [
  {
    id: "quick",
    title: "Quick Study",
    icon: "⚡",
    description: "Rapid-fire identification practice — 10 species, quick rounds.",
    color: "from-fungi-accent to-fungi-secondary",
  },
  {
    id: "focused",
    title: "Focused Study",
    icon: "🎯",
    description: "Filter by family for targeted practice sessions.",
    color: "from-fungi-success to-fungi-moss",
  },
  {
    id: "marathon",
    title: "Marathon Mode",
    icon: "🏃",
    description: "Unlimited continuous study. See how far you can go.",
    color: "from-fungi-primary to-fungi-bark",
  },
] as const;

export default function StudyPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Study Modes
        </h1>
        <p className="text-fungi-text-secondary">
          Choose how you want to practice mushroom identification.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STUDY_MODES.map((mode) => (
          <div
            key={mode.id}
            className="group relative p-6 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 hover:border-fungi-secondary/30 transition-all"
          >
            {/* Gradient accent bar */}
            <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r ${mode.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className="text-3xl mb-3">{mode.icon}</div>
            <h2 className="text-lg font-semibold mb-1">{mode.title}</h2>
            <p className="text-sm text-fungi-text-muted mb-4">
              {mode.description}
            </p>

            <Link
              href={`/study/${mode.id}`}
              className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-fungi-primary to-fungi-secondary text-white hover:opacity-90 transition-opacity"
            >
              Start
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
