// src/app/(app)/field-guide/page.tsx
// Field guide browser — lists published species with search.
// Server Component — data fetched at request time.

import { createClient } from "@/lib/supabase/server";
import { getPublishedFieldGuides } from "@/lib/api";
import type { FieldGuide } from "@/types/database";

export const metadata = {
  title: "Field Guide",
};

export default async function FieldGuidePage() {
  const supabase = await createClient();

  let speciesList: FieldGuide[];
  try {
    speciesList = await getPublishedFieldGuides(supabase);
  } catch (error) {
    console.error("Error loading field guides:", error);
    speciesList = [];
  }

  // Group by family
  const families = speciesList.reduce<Record<string, typeof speciesList>>((acc, guide) => {
    const family = guide.family || "Unknown";
    if (!acc[family]) acc[family] = [];
    acc[family].push(guide);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-2">
          Field Guide
        </h1>
        <p className="text-fungi-text-secondary">
          {speciesList.length} species documented.
          {speciesList.length === 0 && " Field guides will appear here once published from the admin portal."}
        </p>
      </div>

      {Object.entries(families)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([family, species]) => (
          <div key={family} className="mb-8">
            <h2 className="text-lg font-semibold text-fungi-secondary mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fungi-secondary" />
              {family}
              <span className="text-sm font-normal text-fungi-text-muted">
                ({species.length})
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {species.map((guide) => (
                <div
                  key={guide.id}
                  className="p-4 rounded-lg bg-fungi-bg-card border border-fungi-bg-tertiary/50 hover:border-fungi-secondary/30 transition-colors"
                >
                  <h3 className="font-semibold italic">{guide.species_name}</h3>
                  {guide.common_name && (
                    <p className="text-sm text-fungi-text-secondary">
                      {guide.common_name}
                    </p>
                  )}
                  <p className="text-xs text-fungi-text-muted mt-2 line-clamp-2">
                    {guide.description || "Description coming soon."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
