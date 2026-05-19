import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import {
  PaywallError,
  checkLimit,
  getAuthedUser,
  incrementUsage,
  paywallJson,
  requirePremium,
  type DailyFeature,
  type PREMIUM_FEATURES
} from "@/lib/plan";

interface GuardOptions {
  /** Feature to charge against daily/total quota. */
  meter?: DailyFeature;
  /** Require premium plan for this feature. */
  premium?: keyof typeof PREMIUM_FEATURES;
  /** If true, increment the meter on success. Default true when `meter` is set. */
  incrementOnSuccess?: boolean;
}

/**
 * Wrap a route handler with auth + paywall + usage metering.
 *
 *   export const POST = guarded({ meter: "ats_checks" }, async ({ supabase, user, req }) => {
 *     ...
 *     return { data: result };
 *   });
 *
 * The inner handler returns the response body (NOT a NextResponse); guarded()
 * wraps it. On thrown PaywallError, returns 401/402 with structured error.
 */
export function guarded<T>(
  opts: GuardOptions,
  handler: (ctx: {
    req: Request;
    supabase: ReturnType<typeof createServerSupabase>;
    user: NonNullable<Awaited<ReturnType<typeof getAuthedUser>>>;
  }) => Promise<{ data: T; error?: null }>
) {
  return async function POST(req: Request) {
    const supabase = createServerSupabase();
    try {
      const user = await getAuthedUser(supabase);
      if (!user) throw new PaywallError({ code: "auth_required" });

      if (opts.premium) requirePremium(user, opts.premium);
      if (opts.meter) await checkLimit(supabase, user, opts.meter);

      const result = await handler({ req, supabase, user });

      if (opts.meter && opts.incrementOnSuccess !== false) {
        // best-effort; ignore failures
        incrementUsage(supabase, user.id, opts.meter).catch(() => {});
      }

      return NextResponse.json({ data: result.data, error: null });
    } catch (err) {
      if (err instanceof PaywallError) {
        return NextResponse.json(paywallJson(err), { status: err.status });
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ data: null, error: message }, { status: 500 });
    }
  };
}
