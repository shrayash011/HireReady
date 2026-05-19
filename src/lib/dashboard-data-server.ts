import "server-only";

import { createServerSupabase } from "@/lib/supabase";
import type { ApplicationStatus, ResumeTemplate } from "@/types";
import type { DashboardPayload, DashboardResume, KanbanCard } from "./dashboard-data";

interface ResumeRow {
  id: string;
  title: string;
  target_role: string | null;
  template: ResumeTemplate;
  last_ats_score: number | null;
  updated_at: string;
}

interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_at: string | null;
  resume_id: string | null;
}

const EMPTY: DashboardPayload = {
  stats: { resumes_created: 0, ats_average: null, applications_sent: 0, interviews_booked: 0 },
  resumes: [],
  applications: []
};

/**
 * Per-user dashboard data. Reads the current session via createServerSupabase,
 * queries `resumes` + `job_applications` scoped to that user, and computes stats.
 * Returns the empty payload if there's no session — the UI already has empty-state handling.
 */
export async function getDashboardData(): Promise<DashboardPayload> {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) return EMPTY;

  // Loose-typed handles around our Database stub so the chained query builders
  // don't resolve to `never`. Replace once `supabase gen types` is run.
  type AnyTable = {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        order: (col: string, opts: { ascending: boolean }) =>
          Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
    };
  };
  const resumesQ = supabase.from("resumes") as unknown as AnyTable;
  const appsQ = supabase.from("job_applications") as unknown as AnyTable;

  const [resumesRes, appsRes] = await Promise.all([
    resumesQ
      .select("id, title, target_role, template, last_ats_score, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    appsQ
      .select("id, company, role, status, applied_at, resume_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  ]);

  if (resumesRes.error) console.warn("[dashboard] resumes query failed:", resumesRes.error.message);
  if (appsRes.error)    console.warn("[dashboard] applications query failed:", appsRes.error.message);

  const resumes: DashboardResume[] = (resumesRes.data as ResumeRow[] | null ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    target_role: r.target_role,
    template: r.template,
    last_ats_score: r.last_ats_score,
    updated_at: r.updated_at
  }));

  // Build a lookup so each application card can show its resume's ATS score.
  const scoreByResume = new Map<string, number | null>();
  for (const r of resumes) scoreByResume.set(r.id, r.last_ats_score);

  const applications: KanbanCard[] = (appsRes.data as ApplicationRow[] | null ?? []).map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    status: a.status,
    applied_at: a.applied_at,
    ats_score: a.resume_id ? scoreByResume.get(a.resume_id) ?? null : null,
    resume_id: a.resume_id
  }));

  const scored = resumes.map((r) => r.last_ats_score).filter((s): s is number => s !== null);
  const ats_average = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : null;

  const applications_sent = applications.filter((a) => a.status !== "saved").length;
  const interviews_booked = applications.filter(
    (a) => a.status === "phone_screen" || a.status === "interview"
  ).length;

  return {
    stats: {
      resumes_created: resumes.length,
      ats_average,
      applications_sent,
      interviews_booked
    },
    resumes,
    applications
  };
}
