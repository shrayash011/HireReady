"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionShell } from "./SectionShell";
import type { Plan } from "@/types";

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium"
};

export function BillingSection({
  plan,
  plan_expires_at,
  has_stripe_customer
}: {
  plan: Plan;
  plan_expires_at: string | null;
  has_stripe_customer: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = (await res.json()) as { data?: { url: string }; error?: string | { message?: string } };
      if (!res.ok || !json.data?.url) {
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Could not open billing portal";
        throw new Error(msg);
      }
      window.location.href = json.data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal");
      setLoading(false);
    }
  }

  const renewalDate = plan_expires_at
    ? new Date(plan_expires_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : null;

  return (
    <SectionShell
      title="Subscription & billing"
      description="Manage your plan, invoices, and payment method."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-input border border-border bg-surface px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-text-muted">Current plan</div>
            <div className="mt-0.5 text-lg font-semibold">{PLAN_LABEL[plan]}</div>
            {renewalDate && plan !== "free" && (
              <div className="mt-1 text-xs text-text-muted">Renews on {renewalDate}</div>
            )}
            {plan === "free" && (
              <div className="mt-1 text-xs text-text-muted">No subscription</div>
            )}
          </div>
          <span
            className={`rounded-pill px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
              plan === "free"
                ? "bg-surface text-text-muted ring-1 ring-border"
                : "bg-accent/10 text-accent ring-1 ring-accent/30"
            }`}
          >
            {PLAN_LABEL[plan]}
          </span>
        </div>

        {error && (
          <div className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</div>
        )}

        <div className="flex flex-wrap gap-2">
          {plan === "free" ? (
            <Link
              href="/pricing"
              className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Upgrade
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="rounded-input border border-border bg-surface px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              Compare plans
            </Link>
          )}
          {has_stripe_customer && (
            <button
              type="button"
              onClick={openPortal}
              disabled={loading}
              className="rounded-input border border-border bg-surface px-4 py-2 text-sm hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {loading ? "Opening…" : "Manage billing"}
            </button>
          )}
        </div>

        <p className="text-[11px] text-text-muted">
          Cancel, change payment method, and download invoices via the billing portal.
        </p>
      </div>
    </SectionShell>
  );
}
