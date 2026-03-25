// src/lib/api/field-guides.ts
// Typed data access layer for field guides.

import { SupabaseClient } from "@supabase/supabase-js";
import type { FieldGuide } from "@/types/database";

// ============================================================
// READ — Public
// ============================================================

export async function getPublishedFieldGuides(
  supabase: SupabaseClient,
  options: {
    family?: string;
    search?: string;
  } = {}
): Promise<FieldGuide[]> {
  const { family, search } = options;

  let query = supabase
    .from("field_guides")
    .select("*")
    .eq("status", "published")
    .order("species_name", { ascending: true });

  if (family) query = query.eq("family", family);
  if (search) query = query.ilike("species_name", `%${search}%`);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch field guides: ${error.message}`);
  return (data as FieldGuide[]) ?? [];
}

export async function getFieldGuideBySpecies(
  supabase: SupabaseClient,
  speciesName: string
): Promise<FieldGuide | null> {
  const { data, error } = await supabase
    .from("field_guides")
    .select("*")
    .eq("species_name", speciesName)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as FieldGuide;
}

export async function getFieldGuideById(
  supabase: SupabaseClient,
  id: string
): Promise<FieldGuide | null> {
  const { data, error } = await supabase
    .from("field_guides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as FieldGuide;
}

/**
 * Returns a map of species_name → hints for use in study modes.
 * Only includes guides that have non-empty hints arrays.
 */
export async function getHintsMap(
  supabase: SupabaseClient
): Promise<Record<string, FieldGuide>> {
  const { data, error } = await supabase
    .from("field_guides")
    .select("*")
    .eq("status", "published")
    .not("hints", "eq", "[]");

  if (error) throw new Error(`Failed to fetch hints: ${error.message}`);

  const map: Record<string, FieldGuide> = {};
  for (const guide of (data as FieldGuide[]) ?? []) {
    map[guide.species_name] = guide;
  }
  return map;
}

// ============================================================
// WRITE — Admin only (requires service role client)
// ============================================================

export async function createFieldGuide(
  supabase: SupabaseClient,
  guide: Omit<FieldGuide, "id" | "created_at" | "updated_at">
): Promise<FieldGuide> {
  const { data, error } = await supabase
    .from("field_guides")
    .insert(guide)
    .select()
    .single();

  if (error) throw new Error(`Failed to create field guide: ${error.message}`);
  return data as FieldGuide;
}

export async function updateFieldGuide(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Omit<FieldGuide, "id" | "created_at" | "updated_at">>
): Promise<FieldGuide> {
  const { data, error } = await supabase
    .from("field_guides")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update field guide: ${error.message}`);
  return data as FieldGuide;
}

export async function publishFieldGuide(
  supabase: SupabaseClient,
  id: string
): Promise<FieldGuide> {
  return updateFieldGuide(supabase, id, { status: "published" });
}
