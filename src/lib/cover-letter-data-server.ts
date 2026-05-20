import "server-only";

import { createServerSupabase } from "@/lib/supabase";
import type { CoverLetterTone } from "@/types";

export interface ResumeOption {
  id: string;
  title: string;
  target_role: string | null;
}

export interface SavedCoverLetter {
  id: string;
  content: string;
  tone: CoverLetterTone;
  resume_id: string | null;
  job_application_id: string | null;
  created_at: string;
  resume_title: string | null;
  company: string | null;
}

/** List the current user's resumes — used by the cover letter "pick a resume" picker. */
export async function listResumesForPicker(): Promise<ResumeOption[]> {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return [];

  const res = await (supabase.from("resumes") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        order: (col: string, opts: { ascending: boolean }) =>
          Promise<{ data: ResumeOption[] | null; error: { message: string } | null }>;
      };
    };
  })
    .select("id, title, target_role")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (res.error) {
    console.warn("[cover-letter] resumes query failed:", res.error.message);
    return [];
  }
  return res.data ?? [];
}

/** List the current user's saved cover letters, newest first. */
export async function listCoverLetters(): Promise<SavedCoverLetter[]> {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return [];

  type Row = {
    id: string;
    content: string;
    tone: CoverLetterTone;
    resume_id: string | null;
    job_application_id: string | null;
    created_at: string;
    resumes: { title: string } | { title: string }[] | null;
    job_applications: { company: string } | { company: string }[] | null;
  };

  const res = await (supabase.from("cover_letters") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        order: (col: string, opts: { ascending: boolean }) =>
          Promise<{ data: Row[] | null; error: { message: string } | null }>;
      };
    };
  })
    .select(
      "id, content, tone, resume_id, job_application_id, created_at, resumes(title), job_applications(company)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (res.error) {
    console.warn("[cover-letter] list query failed:", res.error.message);
    return [];
  }

  return (res.data ?? []).map((r) => {
    const resumeRel = Array.isArray(r.resumes) ? r.resumes[0] : r.resumes;
    const appRel = Array.isArray(r.job_applications) ? r.job_applications[0] : r.job_applications;
    return {
      id: r.id,
      content: r.content,
      tone: r.tone,
      resume_id: r.resume_id,
      job_application_id: r.job_application_id,
      created_at: r.created_at,
      resume_title: resumeRel?.title ?? null,
      company: appRel?.company ?? null
    };
  });
}
