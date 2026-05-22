import type { Plan } from "@/types";

// Loose Supabase client type — avoids the generated-types generic mismatch
// with our minimal Database stub. Once you generate real types, swap to
// `SupabaseClient<Database>` from "@supabase/supabase-js".
type SupabaseClient = {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null } | null }> };
  from: (table: string) => unknown;
};

/**
 * Launch toggle — when false, paid plans are hidden / shown as "Coming soon"
 * and the Stripe checkout API isn't called. Flip to true once Stripe (or
 * LemonSqueezy / Paddle) is fully wired and tested in prod.
 */
export const PAID_PLANS_LIVE = false;

export type DailyFeature = "resumes" | "ats_checks" | "cover_letters" | "interviews";

/** Daily/total caps that apply when plan === "free". Paid plans are uncapped. */
export const FREE_LIMITS: Record<DailyFeature, number> = {
  resumes: 2,         // total (not daily)
  ats_checks: 3,      // per day
  cover_letters: 1,   // total
  interviews: 0       // not available on free
};

/** Whether a feature is total-lifetime vs daily-rolling. */
const TOTAL_FEATURES: Record<DailyFeature, boolean> = {
  resumes: true,
  ats_checks: false,
  cover_letters: true,
  interviews: false
};

/** Premium-only feature flags. */
export const PREMIUM_FEATURES = {
  voice_interviews: true,
  linkedin_import: true,
  chrome_extension: true
} as const;

export type PaywallReason =
  | { code: "auth_required" }
  | { code: "limit_reached"; feature: DailyFeature; used: number; limit: number }
  | { code: "premium_only"; feature: keyof typeof PREMIUM_FEATURES };

export class PaywallError extends Error {
  reason: PaywallReason;
  status: number;
  constructor(reason: PaywallReason) {
    super(`paywall:${reason.code}`);
    this.reason = reason;
    this.status = reason.code === "auth_required" ? 401 : 402;
  }
}

interface AuthedUser {
  id: string;
  plan: Plan;
}

/**
 * Resolve the current authenticated user + their plan from the users table.
 * Returns null if no session. Returns plan="free" if user row not yet provisioned.
 */
export async function getAuthedUser(supabase: SupabaseClient): Promise<AuthedUser | null> {
  const { data: authData } = await supabase.auth.getUser();
  const id = authData?.user?.id;
  if (!id) return null;

  const profile = await (supabase.from("users") as unknown as {
    select: (cols: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: { plan: Plan } | null }> } };
  }).select("plan").eq("id", id).maybeSingle();

  return { id, plan: profile.data?.plan ?? "free" };
}

/** Throws PaywallError if the feature is not available under the user's plan. */
export async function checkLimit(
  supabase: SupabaseClient,
  user: AuthedUser,
  feature: DailyFeature
): Promise<void> {
  if (user.plan !== "free") return; // paid users uncapped on daily features

  const limit = FREE_LIMITS[feature];
  const used = await readUsage(supabase, user.id, feature);
  if (used >= limit) {
    throw new PaywallError({ code: "limit_reached", feature, used, limit });
  }
}

/** Throws if the user's plan doesn't include a premium-only capability. */
export function requirePremium(user: AuthedUser, feature: keyof typeof PREMIUM_FEATURES): void {
  if (user.plan !== "premium") {
    throw new PaywallError({ code: "premium_only", feature });
  }
}

/** Increment today's counter for a feature. Best-effort — failures don't break the request. */
export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: DailyFeature
): Promise<void> {
  const column = columnFor(feature);
  const today = new Date().toISOString().slice(0, 10);

  // Upsert today's row, then increment via a follow-up update.
  // Two calls is fine — daily_usage has a unique index on (user_id, usage_date).
  const usage = supabase.from("daily_usage") as unknown as {
    upsert: (row: Record<string, unknown>, opts: { onConflict: string; ignoreDuplicates?: boolean }) =>
      Promise<{ error: { message: string } | null }>;
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: Record<string, number> | null }>;
        };
      };
    };
    update: (row: Record<string, unknown>) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  await usage.upsert(
    { user_id: userId, usage_date: today, [column]: 0 },
    { onConflict: "user_id,usage_date", ignoreDuplicates: true }
  );

  const cur = await usage
    .select(`${column}`)
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  const next = (cur.data?.[column] ?? 0) + 1;

  await usage
    .update({ [column]: next })
    .eq("user_id", userId)
    .eq("usage_date", today);
}

async function readUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: DailyFeature
): Promise<number> {
  const column = columnFor(feature);

  if (TOTAL_FEATURES[feature]) {
    // Lifetime totals: count the underlying table.
    const table = totalCountTable(feature);
    const result = await (supabase.from(table) as unknown as {
      select: (cols: string, opts: { count: "exact"; head: true }) => {
        eq: (col: string, val: string) => Promise<{ count: number | null }>;
      };
    })
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    return result.count ?? 0;
  }

  // Daily: read today's row.
  const today = new Date().toISOString().slice(0, 10);
  const row = await (supabase.from("daily_usage") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: Record<string, number> | null }>;
        };
      };
    };
  })
    .select(column)
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  return row.data?.[column] ?? 0;
}

function columnFor(feature: DailyFeature): string {
  switch (feature) {
    case "resumes": return "resumes_created";
    case "ats_checks": return "ats_checks";
    case "cover_letters": return "cover_letters_created";
    case "interviews": return "interviews_started";
  }
}

function totalCountTable(feature: DailyFeature): string {
  switch (feature) {
    case "resumes": return "resumes";
    case "cover_letters": return "cover_letters";
    default: throw new Error(`No total-count table for ${feature}`);
  }
}

/** Convert a PaywallError into a JSON response body. */
export function paywallJson(err: PaywallError) {
  return { data: null, error: { ...err.reason, message: errorMessage(err.reason) } };
}

function errorMessage(r: PaywallReason): string {
  switch (r.code) {
    case "auth_required": return "Sign in to use this feature.";
    case "limit_reached":
      return r.limit === 0
        ? `${humanFeature(r.feature)} is not available on the Free plan.`
        : `You've used ${r.used}/${r.limit} ${humanFeature(r.feature)} on the Free plan.`;
    case "premium_only":
      return `${humanPremium(r.feature)} is a Premium feature.`;
  }
}

function humanFeature(f: DailyFeature): string {
  return ({
    resumes: "resumes",
    ats_checks: "ATS checks today",
    cover_letters: "cover letters",
    interviews: "mock interviews"
  } as Record<DailyFeature, string>)[f];
}

function humanPremium(f: keyof typeof PREMIUM_FEATURES): string {
  return ({
    voice_interviews: "Voice mock interviews",
    linkedin_import: "LinkedIn import",
    chrome_extension: "Chrome extension"
  } as Record<keyof typeof PREMIUM_FEATURES, string>)[f];
}
