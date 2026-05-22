"use client";

import { Fragment, useState } from "react";
import type { Plan } from "@/types";
import { PAID_PLANS_LIVE } from "@/lib/plan";
import type { PlanCheckoutKey } from "@/lib/stripe";

type Cycle = "monthly" | "yearly";

interface PlanColumn {
  id: Plan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  ctaPlanKey: PlanCheckoutKey | null;
}

const PLANS: PlanColumn[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the core tools",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get started",
    ctaPlanKey: null
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active job seekers",
    monthlyPrice: 9,
    yearlyPrice: 84, // $7/mo billed yearly
    cta: "Upgrade to Pro",
    ctaPlanKey: "pro_monthly"
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "For the serious job hunt",
    monthlyPrice: 29,
    yearlyPrice: 276, // $23/mo billed yearly
    cta: "Go Premium",
    ctaPlanKey: "premium_monthly"
  }
];

interface Feature {
  label: string;
  values: Record<Plan, string | boolean>;
}

const FEATURES: { group: string; rows: Feature[] }[] = [
  {
    group: "Resumes",
    rows: [
      { label: "Resumes",                 values: { free: "2 total",       pro: "Unlimited", premium: "Unlimited" } },
      { label: "ATS scoring",             values: { free: "3 / day",       pro: "Unlimited", premium: "Unlimited" } },
      { label: "Resume tailoring",        values: { free: "Counts as ATS", pro: "Unlimited", premium: "Unlimited" } },
      { label: "PDF export",              values: { free: "Watermarked",   pro: "Clean",     premium: "Clean" } }
    ]
  },
  {
    group: "Cover letters & tracker",
    rows: [
      { label: "Cover letters",           values: { free: "1 total",       pro: "Unlimited", premium: "Unlimited" } },
      { label: "Job tracker",             values: { free: "5 jobs",        pro: "Unlimited", premium: "Unlimited" } }
    ]
  },
  {
    group: "Interview practice",
    rows: [
      { label: "Text mock interviews",    values: { free: false,           pro: true,        premium: true } },
      { label: "Voice mock interviews",   values: { free: false,           pro: false,       premium: true } },
      { label: "STAR feedback per answer",values: { free: false,           pro: true,        premium: true } }
    ]
  },
  {
    group: "Extras",
    rows: [
      { label: "LinkedIn import",         values: { free: false,           pro: false,       premium: true } },
      { label: "Chrome extension",        values: { free: false,           pro: false,       premium: true } },
      { label: "Priority support",        values: { free: false,           pro: false,       premium: true } }
    ]
  }
];

export function PricingTable({ highlight }: { highlight?: Plan }) {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PlanCheckoutKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(planKey: PlanCheckoutKey) {
    setError(null);
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planKey })
      });
      const json = (await res.json()) as { data: { url: string } | null; error: unknown };
      if (res.status === 401) {
        window.location.href = "/login?next=/pricing";
        return;
      }
      if (!res.ok || !json.data?.url) {
        const message = typeof json.error === "string" ? json.error : "Could not start checkout";
        throw new Error(message);
      }
      window.location.href = json.data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="inline-flex rounded-pill border border-border bg-surface p-1 text-xs">
          {(["monthly", "yearly"] as Cycle[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={`rounded-pill px-4 py-1.5 font-medium capitalize transition ${
                cycle === c ? "bg-accent text-white" : "text-text-muted hover:text-text"
              }`}
            >
              {c}{c === "yearly" && <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-80">save ~22%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const isHighlight = highlight ? p.id === highlight : p.id === "pro";
          const price = cycle === "monthly" ? p.monthlyPrice : p.yearlyPrice;
          const planKey: PlanCheckoutKey | null =
            p.ctaPlanKey
              ? cycle === "yearly"
                ? p.id === "pro" ? "pro_yearly" : "premium_yearly"
                : p.id === "pro" ? "pro_monthly" : "premium_monthly"
              : null;

          return (
            <div
              key={p.id}
              className={`flex flex-col gap-4 rounded-card border bg-card p-6 ${
                isHighlight ? "border-accent ring-1 ring-accent/40" : "border-border"
              }`}
            >
              <div className="flex flex-wrap gap-1.5">
                {isHighlight && (
                  <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Most popular
                  </span>
                )}
                {p.id !== "free" && !PAID_PLANS_LIVE && (
                  <span className="rounded-pill bg-warn/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn">
                    Coming soon
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-xs text-text-muted">{p.tagline}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${price}</span>
                <span className="text-sm text-text-muted">
                  {p.id === "free" ? "forever" : cycle === "monthly" ? "/ mo" : "/ year"}
                </span>
              </div>

              {p.id === "free" || PAID_PLANS_LIVE ? (
                <button
                  type="button"
                  onClick={() => planKey ? subscribe(planKey) : (window.location.href = "/signup")}
                  disabled={loadingPlan !== null && loadingPlan !== planKey}
                  className={`rounded-input px-3 py-2.5 text-sm font-medium transition ${
                    isHighlight
                      ? "bg-accent text-white hover:bg-accent-hover"
                      : "border border-border bg-surface text-text hover:border-accent"
                  } disabled:opacity-50`}
                >
                  {loadingPlan === planKey ? "Redirecting…" : p.cta}
                </button>
              ) : (
                <a
                  href="mailto:hireready011@gmail.com?subject=Notify%20me%20when%20paid%20plans%20launch"
                  className="rounded-input border border-dashed border-border bg-surface px-3 py-2.5 text-center text-sm font-medium text-text-muted transition hover:border-accent hover:text-accent"
                >
                  Notify me when it launches
                </a>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-center text-sm text-bad">{error}</p>
      )}

      <div className="overflow-x-auto rounded-card border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Features</th>
              {PLANS.map((p) => (
                <th key={p.id} className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((g) => (
              <Fragment key={g.group}>
                <tr>
                  <td colSpan={4} className="bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {g.group}
                  </td>
                </tr>
                {g.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="p-4 text-text">{row.label}</td>
                    {PLANS.map((p) => {
                      const v = row.values[p.id];
                      return (
                        <td key={p.id} className="p-4 text-center">
                          {typeof v === "boolean" ? (
                            v ? <span className="text-accent">✓</span> : <span className="text-text-muted">—</span>
                          ) : (
                            <span className="text-text">{v}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-text-muted">
        {PAID_PLANS_LIVE
          ? "Cancel anytime. All prices in USD. Pro yearly is ~$7/mo, Premium yearly is ~$23/mo."
          : "Paid plans are launching soon. For now, everything on the Free plan is available with no card required."}
      </p>
    </div>
  );
}
