import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planFromPriceId } from "@/lib/stripe";
import { createServiceRoleSupabase } from "@/lib/supabase";
import type { Plan } from "@/types";

export const runtime = "nodejs";
// Stripe needs the exact raw bytes for signature verification.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook verify failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await syncFromSubscriptionId(stripe, session.subscription, session.metadata?.user_id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await syncFromSubscription(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await downgradeFromSubscription(sub);
        break;
      }
      default:
        // Ignore other events for now.
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncFromSubscriptionId(
  stripe: Stripe,
  subOrId: string | Stripe.Subscription | null,
  userIdHint?: string | null
): Promise<void> {
  if (!subOrId) return;
  const sub = typeof subOrId === "string" ? await stripe.subscriptions.retrieve(subOrId) : subOrId;
  await syncFromSubscription(sub, userIdHint ?? undefined);
}

async function syncFromSubscription(
  sub: Stripe.Subscription,
  userIdHint?: string
): Promise<void> {
  const userId =
    userIdHint ||
    (typeof sub.metadata?.user_id === "string" ? sub.metadata.user_id : undefined) ||
    (await findUserIdByCustomer(sub.customer));

  if (!userId) {
    console.warn("[stripe webhook] could not resolve user_id for subscription", sub.id);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id;
  const active = sub.status === "active" || sub.status === "trialing";
  const plan: Plan = active ? planFromPriceId(priceId) : "free";
  // current_period_end lives on the subscription item in newer Stripe API versions.
  // Read defensively from both spots.
  const periodEndSec =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items.data[0]?.current_period_end ??
    null;
  const expiresAt = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null;

  const supabase = createServiceRoleSupabase();
  await (supabase.from("users") as unknown as {
    update: (row: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
  })
    .update({
      plan,
      plan_expires_at: plan === "free" ? null : expiresAt,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id
    })
    .eq("id", userId);
}

async function downgradeFromSubscription(sub: Stripe.Subscription): Promise<void> {
  const userId =
    (typeof sub.metadata?.user_id === "string" ? sub.metadata.user_id : undefined) ||
    (await findUserIdByCustomer(sub.customer));
  if (!userId) return;

  const supabase = createServiceRoleSupabase();
  await (supabase.from("users") as unknown as {
    update: (row: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
  })
    .update({ plan: "free", plan_expires_at: null })
    .eq("id", userId);
}

async function findUserIdByCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<string | undefined> {
  const customerId = typeof customer === "string" ? customer : customer.id;
  const supabase = createServiceRoleSupabase();
  const result = await (supabase.from("users") as unknown as {
    select: (cols: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { id: string } | null }> } };
  }).select("id").eq("stripe_customer_id", customerId).maybeSingle();
  return result.data?.id;
}
