import "server-only";

import { createServerSupabase } from "@/lib/supabase";
import { FREE_LIMITS } from "@/lib/plan";
import type { Plan, ResumeTemplate } from "@/types";

export interface AccountProfile {
  full_name: string;
  email: string;
  avatar_url: string;
  job_title: string;
  location: string;
  phone: string;
  linkedin_url: string;
  portfolio_url: string;
}

export interface AccountDefaults {
  default_template: ResumeTemplate;
  default_language: string;
}

export interface AccountNotifications {
  notify_low_ats: boolean;
  notify_weekly_summary: boolean;
  notify_interview_reminders: boolean;
}

export interface AccountUsage {
  resumes_total: number;
  ats_checks_today: number;
  cover_letters_total: number;
  interviews_started_today: number;
}

export interface AccountSettings {
  user_id: string;
  profile: AccountProfile;
  defaults: AccountDefaults;
  notifications: AccountNotifications;
  plan: Plan;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  usage: AccountUsage;
  limits: typeof FREE_LIMITS;
}

interface UserRow {
  full_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  location: string | null;
  phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  default_template: ResumeTemplate | null;
  default_language: string | null;
  notify_low_ats: boolean | null;
  notify_weekly_summary: boolean | null;
  notify_interview_reminders: boolean | null;
  plan: Plan;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
}

interface DailyUsageRow {
  ats_checks: number | null;
  interviews_started: number | null;
}

const USER_COLS =
  "full_name, avatar_url, job_title, location, phone, linkedin_url, portfolio_url, " +
  "default_template, default_language, notify_low_ats, notify_weekly_summary, " +
  "notify_interview_reminders, plan, plan_expires_at, stripe_customer_id";

/**
 * Fetch everything the Settings page needs in one pass: profile + defaults +
 * notifications + plan + today's daily_usage + the lifetime totals for
 * resumes/cover_letters (counted via head:true queries).
 */
export async function getAccountSettings(): Promise<AccountSettings | null> {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user;
  if (!authUser) return null;

  const today = new Date().toISOString().slice(0, 10);

  const usersQ = (supabase.from("users") as unknown as {
    select: (cols: string) => {
      eq: (c: string, v: string) => {
        maybeSingle: () => Promise<{ data: UserRow | null }>;
      };
    };
  })
    .select(USER_COLS)
    .eq("id", authUser.id)
    .maybeSingle();

  const usageQ = (supabase.from("daily_usage") as unknown as {
    select: (cols: string) => {
      eq: (c: string, v: string) => {
        eq: (c: string, v: string) => {
          maybeSingle: () => Promise<{ data: DailyUsageRow | null }>;
        };
      };
    };
  })
    .select("ats_checks, interviews_started")
    .eq("user_id", authUser.id)
    .eq("usage_date", today)
    .maybeSingle();

  const resumeCountQ = (supabase.from("resumes") as unknown as {
    select: (cols: string, opts: { count: "exact"; head: true }) => {
      eq: (c: string, v: string) => Promise<{ count: number | null }>;
    };
  })
    .select("id", { count: "exact", head: true })
    .eq("user_id", authUser.id);

  const coverCountQ = (supabase.from("cover_letters") as unknown as {
    select: (cols: string, opts: { count: "exact"; head: true }) => {
      eq: (c: string, v: string) => Promise<{ count: number | null }>;
    };
  })
    .select("id", { count: "exact", head: true })
    .eq("user_id", authUser.id);

  const [userRes, usageRes, resumeCount, coverCount] = await Promise.all([
    usersQ,
    usageQ,
    resumeCountQ,
    coverCountQ
  ]);

  const row = userRes.data;
  const usage = usageRes.data;

  return {
    user_id: authUser.id,
    profile: {
      full_name: row?.full_name ?? "",
      email: authUser.email ?? "",
      avatar_url: row?.avatar_url ?? "",
      job_title: row?.job_title ?? "",
      location: row?.location ?? "",
      phone: row?.phone ?? "",
      linkedin_url: row?.linkedin_url ?? "",
      portfolio_url: row?.portfolio_url ?? ""
    },
    defaults: {
      default_template: row?.default_template ?? "clean",
      default_language: row?.default_language ?? "en"
    },
    notifications: {
      notify_low_ats: row?.notify_low_ats ?? false,
      notify_weekly_summary: row?.notify_weekly_summary ?? true,
      notify_interview_reminders: row?.notify_interview_reminders ?? false
    },
    plan: row?.plan ?? "free",
    plan_expires_at: row?.plan_expires_at ?? null,
    stripe_customer_id: row?.stripe_customer_id ?? null,
    usage: {
      resumes_total: resumeCount.count ?? 0,
      ats_checks_today: usage?.ats_checks ?? 0,
      cover_letters_total: coverCount.count ?? 0,
      interviews_started_today: usage?.interviews_started ?? 0
    },
    limits: FREE_LIMITS
  };
}
