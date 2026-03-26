// src/components/study/focused-study-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { StudyEngine } from "./study-engine";
import type { Hint } from "@/types/database";

interface StudyData {
  specimens: {
    id: string;
    species_name: string;
    common_name: string | null;
    genus: string;
    family: string;
    description: string | null;
    dna_sequenced: boolean;
  }[];
  photos: Record<string, { url: string; attribution: string | null }[]>;
  guides: Record<string, { hints: Hint[]; ecology?: string }>;
}

interface FocusedStudyClientProps {
  userId: string;
  families: string[];
  selectedFamily: string | null;
  studyData: StudyData | null;
}

export function FocusedStudyClient({
  userId,
  families,
  selectedFamily,
  studyData,
}: FocusedStudyClientProps) {
  const router = useRouter();

  // Family selection screen
  if (!selectedFamily || !studyData) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
          Focused Study
        </h1>
        <p className="text-fungi-text-secondary mb-6">
          Choose a family to focus your study session on.
        </p>

        {families.length === 0 ? (
          <p className="text-fungi-text-muted">No families available yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {families.map((family) => (
              <button
                key={family}
                onClick={() => router.push(`/study/focused?family=${encodeURIComponent(family)}`)}
                className="p-4 rounded-xl bg-fungi-bg-card border border-fungi-bg-tertiary/50 hover:border-fungi-secondary/30 text-left transition-colors"
              >
                <div className="font-semibold">{family}</div>
                <div className="text-xs text-fungi-text-muted mt-1">
                  Study all species in this family
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Study session
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => router.push("/study/focused")}
          className="text-sm text-fungi-text-muted hover:text-fungi-text transition-colors"
        >
          ← Change family
        </button>
        <span className="text-sm text-fungi-text-muted">·</span>
        <span className="text-sm text-fungi-secondary font-medium">{selectedFamily}</span>
      </div>

      <StudyEngine
        userId={userId}
        mode="focused"
        specimens={studyData.specimens}
        photos={studyData.photos}
        guides={studyData.guides}
        filters={{ family: selectedFamily }}
      />
    </div>
  );
}
