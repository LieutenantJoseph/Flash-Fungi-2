// src/app/(app)/training/page.tsx
// Training modules listing page.
// Phase 3 will build out the full module player.

import { createClient } from "@/lib/supabase/server";
import { getPublishedModules } from "@/lib/api";
import type { TrainingModule } from "@/types/database";

export const metadata = {
  title: "Training",
};

export default async function TrainingPage() {
  const supabase = await createClient();

  let moduleList: TrainingModule[];
  try {
    moduleList = await getPublishedModules(supabase);
  } catch (error) {
    console.error("Error loading modules:", error);
    moduleList = [];
  }

  const difficultyColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-400 bg-green-400/10";
      case "intermediate": return "text-yellow-400 bg-yellow-400/10";
      case "advanced": return "text-red-400 bg-red-400/10";
      default: return "text-fungi-text-muted bg-fungi-bg-tertiary";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Training Modules
        </h1>
        <p className="text-fungi-text-secondary">
          Structured lessons to build your mycology knowledge.
          {moduleList.length === 0 && " Modules will appear here once published."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {moduleList.map((mod) => (
          <div
            key={mod.id}
            className="p-5 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 hover:border-fungi-secondary/30 transition-colors"
          >
            <div className="text-3xl mb-3">{mod.icon || "📖"}</div>
            <h2 className="text-lg font-semibold mb-1">{mod.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded bg-fungi-bg-tertiary text-fungi-text-muted">
                {mod.category}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColor(mod.difficulty_level)}`}>
                {mod.difficulty_level}
              </span>
              <span className="text-xs text-fungi-text-muted">
                ~{mod.duration_minutes} min
              </span>
            </div>
            <div className="mt-4">
              <span className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-fungi-bg-tertiary/50 text-fungi-text-muted">
                Coming in Phase 3
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
