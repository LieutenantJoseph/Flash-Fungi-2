// src/types/database.ts
// Single source of truth for all Supabase table types.
// When the schema changes, update HERE and everything downstream gets type-checked.

// ============================================================
// ENUMS
// ============================================================

export type SpecimenStatus = "pending" | "approved" | "rejected" | "archived";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type HintType = "morphological" | "comparative" | "ecological" | "taxonomic";
export type StudyMode = "quick" | "focused" | "marathon";
export type UserRole = "user" | "admin";

// ============================================================
// CORE TABLES
// ============================================================

export interface Specimen {
  id: string;
  species_name: string;
  genus: string;
  family: string;
  common_name: string | null;
  inaturalist_id: string;
  location: string | null;
  description: string | null;
  dna_sequenced: boolean;
  status: SpecimenStatus;
  quality_score: number | null;
  admin_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpecimenPhoto {
  id: string;
  specimen_id: string;
  inaturalist_photo_id: string;
  url: string;
  attribution: string | null;
  license: string;
  position: number;
  created_at: string;
}

export interface FieldGuide {
  id: string;
  species_name: string;
  common_name: string | null;
  genus: string;
  family: string;
  description: string;
  ecology: string;
  hints: Hint[];
  diagnostic_features: DiagnosticFeatures;
  comparison_species: string[];
  status: "draft" | "published" | "review";
  created_at: string;
  updated_at: string;
}

export interface Hint {
  type: HintType;
  level: number; // 1-4
  text: string;
  educational_value?: "high" | "medium" | "low";
}

export interface DiagnosticFeatures {
  cap: {
    shape?: string;
    color?: string;
    texture?: string;
    size_range?: string;
  };
  gills_pores: {
    type?: string;
    attachment?: string;
    spacing?: string;
    color?: string;
  };
  stem: {
    ring_presence?: string;
    base_structure?: string;
    texture?: string;
  };
  spore_print: {
    color?: string;
    collection_method?: string;
  };
  chemical_reactions: {
    tests?: string[];
  };
}

export interface TrainingModule {
  id: string;
  title: string;
  icon: string;
  category: string;
  difficulty_level: DifficultyLevel;
  duration_minutes: number;
  content: ModuleContent;
  prerequisites: string[];
  unlocks: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleContent {
  introduction?: {
    pages: Array<{
      title: string;
      content: string;
      image?: string;
    }>;
  };
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
  };
  assessment?: {
    questions: Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>;
  };
}

// ============================================================
// AUTH / USER TABLES
// ============================================================

export interface UserProfile {
  id: string; // matches auth.users.id
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  privacy_settings: {
    show_stats: boolean;
    show_achievements: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  session_type: StudyMode;
  mode: string;
  stats: SessionStats;
  metadata: Record<string, unknown> | null;
  filters: Record<string, unknown> | null;
  difficulty_level: DifficultyLevel | "mixed";
  is_complete: boolean;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface SessionStats {
  total_questions: number;
  correct_answers: number;
  total_score: number;
  hints_used: number;
  streak: number;
  longest_streak: number;
  specimens_studied: number;
  perfect_scores: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed: boolean;
  score: number | null;
  progress_data: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  earned_at: string;
  metadata: Record<string, unknown> | null;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}
