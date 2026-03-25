// src/lib/api/training-modules.ts
// Typed data access layer for training modules.

import { SupabaseClient } from "@supabase/supabase-js";
import type { TrainingModule } from "@/types/database";

// ============================================================
// READ — Public
// ============================================================

export async function getPublishedModules(
  supabase: SupabaseClient
): Promise<TrainingModule[]> {
  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch modules: ${error.message}`);
  return (data as TrainingModule[]) ?? [];
}

export async function getModuleById(
  supabase: SupabaseClient,
  id: string
): Promise<TrainingModule | null> {
  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as TrainingModule;
}

export async function getModulesByCategory(
  supabase: SupabaseClient,
  category: string
): Promise<TrainingModule[]> {
  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .eq("category", category)
    .eq("published", true)
    .order("difficulty_level", { ascending: true });

  if (error) throw new Error(`Failed to fetch modules: ${error.message}`);
  return (data as TrainingModule[]) ?? [];
}

// ============================================================
// WRITE — Admin only (requires service role client)
// ============================================================

export async function createModule(
  supabase: SupabaseClient,
  module: Omit<TrainingModule, "created_at" | "updated_at">
): Promise<TrainingModule> {
  const { data, error } = await supabase
    .from("training_modules")
    .insert(module)
    .select()
    .single();

  if (error) throw new Error(`Failed to create module: ${error.message}`);
  return data as TrainingModule;
}

export async function updateModule(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Omit<TrainingModule, "id" | "created_at" | "updated_at">>
): Promise<TrainingModule> {
  const { data, error } = await supabase
    .from("training_modules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update module: ${error.message}`);
  return data as TrainingModule;
}

export async function deleteModule(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("training_modules")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete module: ${error.message}`);
}
