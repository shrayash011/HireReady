"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PAYWALL_EVENT, type ClientPaywallReason } from "@/lib/paywall-client";

interface Unlock {
  title: string;
  body: string;
  bullets: string[];
  recommendedPlan: "pro" | "premium";
}

function unlockFor(reason: ClientPaywallReason): Unlock {
  if (reason.code === "auth_required") {
    return {
      title: "Sign in to continue",
      body: "Create a free account in 30 seconds — keep your resumes, applications, and interview history in one place.",
      bullets: [
        "2 free resumes + ATS scoring",
        "1 free cover letter",
        "Sync your job tracker across devices"
      ],
      recommendedPlan: "pro"
    };
  }

  if (reason.code === "premium_only") {
    const map: Record<typeof reason.feature, Unlock> = {
      voice_interviews: {
        title: "Voice interviews are a Premium feature",
        body: "Practice out loud and get feedback on how you actually sound — not how you type. Whisper transcribes in seconds.",
        bullets: [
          "Unlimited voice mock interviews",
          "Tone + structure feedback per answer",
          "Everything in Pro included"
        ],
        recommendedPlan: "premium"
      },
      linkedin_import: {
        title: "LinkedIn import is Premium",
        body: "Paste your LinkedIn URL — we'll pull every role, school, and skill into a clean draft you can tailor in one click.",
        bullets: ["1-click LinkedIn → resume", "Auto-format dates and bullets", "Everything in Pro included"],
        recommendedPlan: "premium"
      },
      chrome_extension: {
        title: "The Chrome extension is Premium",
        body: "One-click Apply on LinkedIn, Lever, and Greenhouse — your tailored resume gets attached automatically.",
        bullets: ["Auto-fill on 50+ job boards", "Attach the right resume per role", "Everything in Pro included"],
        recommendedPlan: "premium"
      }
    };
    return map[reason.feature];
  }

  // limit_reached
  const r = reason;
  const featureMap: Record<typeof r.feature, Unlock> = {
    resumes: {
      title: `You've built ${r.used} of ${r.limit} free resumes`,
      body: "Pro lets you spin up a tailored resume for every role you apply to — without losing the originals.",
      bullets: [
        "Unlimited resumes + versions",
        "Unlimited ATS scoring",
        "Unlimited cover letters",
        "Clean PDF (no watermark)"
      ],
      recommendedPlan: "pro"
    },
    ats_checks: {
      title: `Daily ATS check limit reached (${r.used}/${r.limit})`,
      body: "Pro removes the daily cap — run ATS analysis on every job description, every time, until you find the version that scores 90+.",
      bullets: [
        "Unlimited ATS scoring",
        "Unlimited resume tailoring",
        "Unlimited cover letters",
        "Clean PDF (no watermark)"
      ],
      recommendedPlan: "pro"
    },
    cover_letters: {
      title: `You've used your ${r.limit} free cover letter`,
      body: "Pro gives you a fresh, role-specific cover letter for every application — drafted in seconds, ready to edit.",
      bullets: [
        "Unlimited cover letters",
        "Unlimited resumes + ATS scoring",
        "Text mock interviews",
        "Clean PDF (no watermark)"
      ],
      recommendedPlan: "pro"
    },
    interviews: {
      title: "Mock interviews aren't on the Free plan",
      body: "Pro unlocks 10-question mock interviews with AI feedback per answer — STAR scoring, model answers, and the one tip that matters.",
      bullets: [
        "Unlimited text mock interviews",
        "STAR feedback per answer",
        "Unlimited ATS + cover letters",
        "Clean PDF"
      ],
      recommendedPlan: "pro"
    }
  };
  return featureMap[r.feature];
}

export function UpgradePromptModal() {
  const [reason, setReason] = useState<ClientPaywallReason | null>(null);

  useEffect(() => {
    function onHit(e: Event) {
      const detail = (e as CustomEvent<ClientPaywallReason>).detail;
      if (detail) setReason(detail);
    }
    window.addEventListener(PAYWALL_EVENT, onHit);
    return () => window.removeEventListener(PAYWALL_EVENT, onHit);
  }, []);

  if (!reason) return null;
  const u = unlockFor(reason);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => setReason(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-card border border-border bg-card shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-accent via-accent-hover to-accent" />
        <button
          type="button"
          onClick={() => setReason(null)}
          aria-label="Close"
          className="absolute right-3 top-3 text-text-muted hover:text-text"
        >
          ✕
        </button>

        <div className="flex flex-col gap-4 p-6">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {u.recommendedPlan === "premium" ? "Premium" : "Upgrade to Pro"}
            </span>
            <h2 className="mt-1 text-lg font-semibold leading-snug">{u.title}</h2>
            <p className="mt-1 text-sm text-text-muted">{u.body}</p>
          </div>

          <ul className="flex flex-col gap-1.5 rounded-input border border-border bg-surface p-3 text-sm">
            {u.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-accent">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReason(null)}
              className="flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm text-text-muted hover:border-accent hover:text-text"
            >
              Maybe later
            </button>
            <Link
              href={`/pricing?highlight=${u.recommendedPlan}`}
              onClick={() => setReason(null)}
              className="flex-1 rounded-input bg-accent px-3 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover"
            >
              See plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
