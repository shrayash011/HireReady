import type { ApplicationStatus, ResumeTemplate } from "@/types";

// Mock data layer. Swap to Supabase queries once auth lands:
//   const supabase = createServerSupabase();
//   const { data: resumes } = await supabase.from("resumes").select("*").eq("user_id", uid);
//   …
// Keep the return shapes stable so the UI doesn't need to change.

export interface DashboardResume {
  id: string;
  title: string;
  target_role: string | null;
  template: ResumeTemplate;
  last_ats_score: number | null;
  updated_at: string;
}

export interface KanbanCard {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  applied_at: string | null;
  ats_score: number | null;
  resume_id: string | null;
}

export interface DashboardStats {
  resumes_created: number;
  ats_average: number | null;
  applications_sent: number;
  interviews_booked: number;
}

export interface DashboardPayload {
  stats: DashboardStats;
  resumes: DashboardResume[];
  applications: KanbanCard[];
}

export const KANBAN_COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "phone_screen", label: "Phone Screen" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" }
];

export async function getDashboardData(): Promise<DashboardPayload> {
  // TODO: replace with Supabase queries once auth + session are wired.
  const resumes: DashboardResume[] = [
    {
      id: "r_1",
      title: "Senior Product Designer — Fintech",
      target_role: "Senior Product Designer",
      template: "modern",
      last_ats_score: 87,
      updated_at: daysAgo(1)
    },
    {
      id: "r_2",
      title: "Staff Engineer — Backend",
      target_role: "Staff Software Engineer",
      template: "clean",
      last_ats_score: 92,
      updated_at: daysAgo(3)
    },
    {
      id: "r_3",
      title: "Product Manager — SaaS",
      target_role: "Senior PM",
      template: "executive",
      last_ats_score: 64,
      updated_at: daysAgo(7)
    }
  ];

  const applications: KanbanCard[] = [
    { id: "a_1", company: "Stripe",       role: "Senior Product Designer", status: "interview",     applied_at: daysAgo(8),  ats_score: 87, resume_id: "r_1" },
    { id: "a_2", company: "Figma",        role: "Staff Designer",          status: "phone_screen",  applied_at: daysAgo(5),  ats_score: 81, resume_id: "r_1" },
    { id: "a_3", company: "Linear",       role: "Senior Product Designer", status: "applied",       applied_at: daysAgo(3),  ats_score: 85, resume_id: "r_1" },
    { id: "a_4", company: "Notion",       role: "Product Designer",        status: "applied",       applied_at: daysAgo(2),  ats_score: 79, resume_id: "r_1" },
    { id: "a_5", company: "Vercel",       role: "Staff Engineer",          status: "offer",         applied_at: daysAgo(21), ats_score: 92, resume_id: "r_2" },
    { id: "a_6", company: "Anthropic",    role: "Product Engineer",        status: "saved",         applied_at: null,        ats_score: 88, resume_id: "r_2" },
    { id: "a_7", company: "Supabase",     role: "Senior PM",               status: "saved",         applied_at: null,        ats_score: 71, resume_id: "r_3" },
    { id: "a_8", company: "GitHub",       role: "Senior PM, Copilot",      status: "rejected",      applied_at: daysAgo(30), ats_score: 64, resume_id: "r_3" }
  ];

  const interviewsBooked = applications.filter(
    (a) => a.status === "phone_screen" || a.status === "interview"
  ).length;
  const sent = applications.filter((a) => a.status !== "saved").length;
  const scored = resumes.map((r) => r.last_ats_score).filter((s): s is number => s !== null);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null;

  return {
    stats: {
      resumes_created: resumes.length,
      ats_average: avg,
      applications_sent: sent,
      interviews_booked: interviewsBooked
    },
    resumes,
    applications
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

/** "5 minutes ago", "2 days ago", "Mar 4" — short relative time. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Guess a logo domain from a company name for Clearbit. */
export function guessLogoDomain(company: string): string {
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug}.com`;
}
