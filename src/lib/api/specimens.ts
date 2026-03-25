// src/lib/api/specimens.ts
// Typed data access layer for specimens.
// All specimen queries go through this module — no raw Supabase calls in components.

import { SupabaseClient } from "@supabase/supabase-js";
import type { Specimen, SpecimenPhoto, PaginatedResponse } from "@/types/database";

export interface SpecimenFilters {
  status?: Specimen["status"];
  family?: string;
  genus?: string;
  dnaOnly?: boolean;
  search?: string;
}

export interface SpecimenWithPhotos extends Specimen {
  photos: SpecimenPhoto[];
}

// ============================================================
// READ — Public (respects RLS, works with anon key)
// ============================================================

export async function getApprovedSpecimens(
  supabase: SupabaseClient,
  options: {
    page?: number;
    pageSize?: number;
    family?: string;
    genus?: string;
    dnaOnly?: boolean;
    search?: string;
  } = {}
): Promise<PaginatedResponse<Specimen>> {
  const {
    page = 1,
    pageSize = 25,
    family,
    genus,
    dnaOnly,
    search,
  } = options;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("specimens")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .order("species_name", { ascending: true })
    .range(from, to);

  if (family) query = query.eq("family", family);
  if (genus) query = query.eq("genus", genus);
  if (dnaOnly) query = query.eq("dna_sequenced", true);
  if (search) query = query.ilike("species_name", `%${search}%`);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to fetch specimens: ${error.message}`);

  return {
    data: (data as Specimen[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getSpecimenByInaturalistId(
  supabase: SupabaseClient,
  inaturalistId: string
): Promise<SpecimenWithPhotos | null> {
  const { data: specimen, error } = await supabase
    .from("specimens")
    .select("*")
    .eq("inaturalist_id", inaturalistId)
    .eq("status", "approved")
    .single();

  if (error || !specimen) return null;

  const { data: photos } = await supabase
    .from("specimen_photos")
    .select("*")
    .eq("specimen_id", specimen.id)
    .order("position", { ascending: true });

  return {
    ...(specimen as Specimen),
    photos: (photos as SpecimenPhoto[]) ?? [],
  };
}

export async function getSpecimenPhotos(
  supabase: SupabaseClient,
  specimenId: string
): Promise<SpecimenPhoto[]> {
  const { data, error } = await supabase
    .from("specimen_photos")
    .select("*")
    .eq("specimen_id", specimenId)
    .order("position", { ascending: true });

  if (error) throw new Error(`Failed to fetch photos: ${error.message}`);
  return (data as SpecimenPhoto[]) ?? [];
}

export async function getUniqueFamilies(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("specimens")
    .select("family")
    .eq("status", "approved")
    .order("family", { ascending: true });

  if (error) throw new Error(`Failed to fetch families: ${error.message}`);

  // Deduplicate
  const families = [...new Set((data ?? []).map((d: { family: string }) => d.family))];
  return families.filter(Boolean);
}

export async function getUniqueGenera(
  supabase: SupabaseClient,
  family?: string
): Promise<string[]> {
  let query = supabase
    .from("specimens")
    .select("genus")
    .eq("status", "approved")
    .order("genus", { ascending: true });

  if (family) query = query.eq("family", family);

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch genera: ${error.message}`);

  const genera = [...new Set((data ?? []).map((d: { genus: string }) => d.genus))];
  return genera.filter(Boolean);
}

// ============================================================
// WRITE — Admin only (requires service role client)
// ============================================================

export async function createSpecimen(
  supabase: SupabaseClient,
  specimen: Omit<Specimen, "id" | "created_at" | "updated_at" | "approved_at">
): Promise<Specimen> {
  const { data, error } = await supabase
    .from("specimens")
    .insert(specimen)
    .select()
    .single();

  if (error) throw new Error(`Failed to create specimen: ${error.message}`);
  return data as Specimen;
}

export async function updateSpecimenStatus(
  supabase: SupabaseClient,
  specimenId: string,
  status: Specimen["status"],
  adminNotes?: string
): Promise<Specimen> {
  const updates: Record<string, unknown> = { status };
  if (status === "approved") updates.approved_at = new Date().toISOString();
  if (adminNotes !== undefined) updates.admin_notes = adminNotes;

  const { data, error } = await supabase
    .from("specimens")
    .update(updates)
    .eq("id", specimenId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update specimen: ${error.message}`);
  return data as Specimen;
}

export async function addSpecimenPhotos(
  supabase: SupabaseClient,
  specimenId: string,
  photos: Omit<SpecimenPhoto, "id" | "created_at" | "specimen_id">[]
): Promise<SpecimenPhoto[]> {
  const rows = photos.map((photo) => ({
    ...photo,
    specimen_id: specimenId,
  }));

  const { data, error } = await supabase
    .from("specimen_photos")
    .insert(rows)
    .select();

  if (error) throw new Error(`Failed to add photos: ${error.message}`);
  return (data as SpecimenPhoto[]) ?? [];
}
