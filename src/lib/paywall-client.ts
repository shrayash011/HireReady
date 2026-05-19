"use client";

import type { DailyFeature, PREMIUM_FEATURES } from "./plan";

export type ClientPaywallReason =
  | { code: "auth_required"; message: string }
  | { code: "limit_reached"; feature: DailyFeature; used: number; limit: number; message: string }
  | { code: "premium_only"; feature: keyof typeof PREMIUM_FEATURES; message: string };

export const PAYWALL_EVENT = "hireready:paywall";

/**
 * fetch wrapper that detects paywall responses (401/402) and dispatches a window event
 * the UpgradePromptModal listens for. Throws a tagged error so callers can `catch`
 * and stop further work, without each call site having to do the modal plumbing.
 */
export async function fetchOrPaywall(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 401 && res.status !== 402) return res;

  // Clone before reading so callers can still consume the body if they catch.
  const clone = res.clone();
  let reason: ClientPaywallReason | null = null;
  try {
    const json = (await clone.json()) as { error?: ClientPaywallReason };
    if (json?.error?.code) reason = json.error;
  } catch {
    /* non-JSON error */
  }

  if (reason) {
    window.dispatchEvent(new CustomEvent<ClientPaywallReason>(PAYWALL_EVENT, { detail: reason }));
    const err = new Error(reason.message) as Error & { paywall: ClientPaywallReason };
    err.paywall = reason;
    throw err;
  }
  return res;
}
