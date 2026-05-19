// Client-safe dashboard types + pure helpers. Server-only data fetching lives
// in `dashboard-data-server.ts` so client components that import the shared
// helpers don't accidentally drag in `next/headers`.

import type { ApplicationStatus, ResumeTemplate } from "@/types";

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
