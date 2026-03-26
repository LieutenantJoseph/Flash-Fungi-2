// src/lib/api/study-loader.ts
// Server-side data loader for study modes.
// Fetches specimens, photos, and field guides in parallel.

import { SupabaseClient } from "@supabase/supabase-js";
import type { Hint } from "@/types/database";

export async function loadStudyData(
  supabase: SupabaseClient,
  options: {
    family?: string;
    genus?: string;
    limit?: number;
  } = {}
) {
  const { family, genus, limit } = options;

  // Build specimen query
  let specimenQuery = supabase
    .from("specimens")
    .select("id, species_name, common_name, genus, family, description, dna_sequenced")
    .eq("status", "approved")
    .order("species_name");

  if (family) specimenQuery = specimenQuery.eq("family", family);
  if (genus) specimenQuery = specimenQuery.eq("genus", genus);
  if (limit) specimenQuery = specimenQuery.limit(limit);

  // Fetch specimens and field guides in parallel
  const [specimensResult, guidesResult] = await Promise.all([
    specimenQuery,
    supabase
      .from("field_guides")
      .select("species_name, hints, ecology")
      .eq("status", "published"),
  ]);

  const specimens = specimensResult.data ?? [];

  // Fetch photos for all specimens
  const specimenIds = specimens.map((s: { id: string }) => s.id);
  let photos: Record<string, { url: string; attribution: string | null }[]> = {};

  if (specimenIds.length > 0) {
    const { data: photoData } = await supabase
      .from("specimen_photos")
      .select("specimen_id, url, attribution")
      .in("specimen_id", specimenIds)
      .order("position");

    // Group by specimen ID
    photos = (photoData ?? []).reduce(
      (acc: Record<string, { url: string; attribution: string | null }[]>, p: { specimen_id: string; url: string; attribution: string | null }) => {
        if (!acc[p.specimen_id]) acc[p.specimen_id] = [];
        acc[p.specimen_id].push({ url: p.url, attribution: p.attribution });
        return acc;
      },
      {}
    );
  }

  // Build guides map
  const guides: Record<string, { hints: Hint[]; ecology?: string }> = {};
  for (const guide of guidesResult.data ?? []) {
    const g = guide as { species_name: string; hints: Hint[]; ecology?: string };
    guides[g.species_name] = { hints: g.hints ?? [], ecology: g.ecology };
  }

  return { specimens, photos, guides };
}
