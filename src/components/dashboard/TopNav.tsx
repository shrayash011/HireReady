import Link from "next/link";
import type { Plan } from "@/types";
import { PAID_PLANS_LIVE } from "@/lib/plan";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavUser {
  fullName: string | null;
  email: string;
  plan: Plan;
}

const PLAN_BADGE: Record<Plan, { label: string; tone: string }> = {
  free:    { label: "Free",    tone: "bg-surface text-text-muted border border-border" },
  pro:     { label: "Pro",     tone: "bg-accent/15 text-accent border border-accent/40" },
  premium: { label: "Premium", tone: "bg-accent text-white border border-accent" }
};

export function TopNav({ user }: { user: NavUser }) {
  const badge = PLAN_BADGE[user.plan];
  const initials = (user.fullName ?? user.email).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            <span className="text-accent">Hire</span>Ready
          </Link>
          <nav className="hidden gap-4 text-xs text-text-muted md:flex">
            <Link href="/dashboard" className="hover:text-text">Dashboard</Link>
            <Link href="/dashboard/resume/new" className="hover:text-text">Build resume</Link>
            <Link href="/dashboard/interview" className="hover:text-text">Practice interview</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`hidden rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline ${badge.tone}`}>
            {badge.label}
          </span>
          {user.plan === "free" && PAID_PLANS_LIVE && (
            <Link href="/pricing" className="hidden text-xs text-accent hover:underline sm:inline">
              Upgrade
            </Link>
          )}
          <ThemeToggle />
          <div className="flex h-8 w-8 items-center justify-center rounded-pill bg-surface text-[11px] font-semibold text-text-muted">
            {initials}
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              aria-label="Sign out"
              className="rounded-input border border-border bg-surface px-2 py-1.5 text-xs text-text-muted hover:border-accent hover:text-accent sm:px-3"
            >
              <span className="hidden sm:inline">Sign out</span>
              <span className="sm:hidden" aria-hidden>↩</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
