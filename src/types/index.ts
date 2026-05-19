export type Plan = "free" | "pro" | "premium";
export type ResumeTemplate = "clean" | "modern" | "executive";
export type ApplicationStatus =
  | "saved"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected";
export type CoverLetterTone = "professional" | "enthusiastic" | "concise";
export type InterviewType = "behavioral" | "technical" | "mixed";

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface ResumeContent {
  personal_info: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages?: { name: string; level: string }[];
  certifications?: { name: string; issuer: string; date?: string }[];
}

export interface ATSFeedback {
  score: number;
  keyword_matches: string[];
  missing_keywords: string[];
  weak_bullets: { original: string; issue: string; improved: string }[];
  suggestions: string[];
  strengths: string[];
  summary: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational";
  difficulty: "easy" | "medium" | "hard";
}

export interface InterviewAnswer {
  question_id: string;
  answer_text: string;
  audio_url?: string;
}

export interface InterviewScore {
  question_id: string;
  score: number;
  star_rating: "full" | "partial" | "none";
  strengths: string[];
  improvements: string[];
  missing_elements: string[];
  model_answer: string;
  one_tip: string;
}

// Minimal Database type stub — generate full types via:
//   npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
// Until then, table rows/inserts are `any` so route code compiles without
// duplicating column types here.
type AnyTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: Record<string, AnyTable>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
