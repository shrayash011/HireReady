import Stripe from "stripe";
import type { Plan } from "@/types";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return _stripe;
}

/** Map a Stripe price ID back to one of our app plans. */
export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (
    priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID ||
    priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID
  ) return "pro";
  if (
    priceId === process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ||
    priceId === process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
  ) return "premium";
  return "free";
}

/** Resolve "pro_monthly" → price ID. */
export function priceIdFor(planKey: PlanCheckoutKey): string {
  const map: Record<PlanCheckoutKey, string | undefined> = {
    pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
  };
  const id = map[planKey];
  if (!id) throw new Error(`Stripe price ID not configured for ${planKey}`);
  return id;
}

export type PlanCheckoutKey = "pro_monthly" | "pro_yearly" | "premium_monthly" | "premium_yearly";

export const PLAN_DISPLAY: Record<Plan, { name: string; price: string; tagline: string }> = {
  free:    { name: "Free",    price: "$0",        tagline: "Try the core tools" },
  pro:     { name: "Pro",     price: "$9 / mo",   tagline: "For active job seekers" },
  premium: { name: "Premium", price: "$29 / mo",  tagline: "For the serious job hunt" }
};
