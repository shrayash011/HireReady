import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { PAID_PLANS_LIVE } from "@/lib/plan";
import { getStripe, priceIdFor, type PlanCheckoutKey } from "@/lib/stripe";

export const runtime = "nodejs";

interface Body {
  plan: PlanCheckoutKey;
}

export async function POST(req: Request) {
  // Hard stop while we're in free-only launch mode.
  if (!PAID_PLANS_LIVE) {
    return NextResponse.json(
      { error: "Paid plans are launching soon." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.plan) {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 });
  }

  try {
    const supabase = createServerSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json(
        { error: { code: "auth_required", message: "Sign in to subscribe." } },
        { status: 401 }
      );
    }

    // Look up or seed stripe_customer_id on the user row.
    const profile = await (supabase.from("users") as unknown as {
      select: (cols: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { stripe_customer_id: string | null; email: string; full_name: string | null } | null }> } };
    }).select("stripe_customer_id, email, full_name").eq("id", user.id).maybeSingle();

    let customerId = profile.data?.stripe_customer_id ?? null;
    const stripe = getStripe();

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.data?.email ?? user.email ?? undefined,
        name: profile.data?.full_name ?? undefined,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      await (supabase.from("users") as unknown as {
        update: (row: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
      }).update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const priceId = priceIdFor(body.plan);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/pricing?upgrade=cancelled`,
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id, plan_key: body.plan }
    });

    return NextResponse.json({ data: { url: session.url }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
