import { SectionShell } from "./SectionShell";
import type { AccountUsage } from "@/lib/account-data-server";
import type { FREE_LIMITS } from "@/lib/plan";

interface Row {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

export function UsageSection({
  usage,
  limits
}: {
  usage: AccountUsage;
  limits: typeof FREE_LIMITS;
}) {
  const rows: Row[] = [
    { label: "Resumes", used: usage.resumes_total, limit: limits.resumes, unit: "total" },
    { label: "ATS checks", used: usage.ats_checks_today, limit: limits.ats_checks, unit: "today" },
    { label: "Cover letters", used: usage.cover_letters_total, limit: limits.cover_letters, unit: "total" },
    { label: "Mock interviews", used: usage.interviews_started_today, limit: limits.interviews, unit: "today" }
  ];

  return (
    <SectionShell
      title="Free plan usage"
      description="Upgrade to Pro to remove these limits."
    >
      <div className="flex flex-col gap-3">
        {rows.map((r) => {
          const pct = r.limit > 0 ? Math.min(100, (r.used / r.limit) * 100) : r.used > 0 ? 100 : 0;
          const exhausted = r.limit === 0 || r.used >= r.limit;
          return (
            <div key={r.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{r.label}</span>
                <span className={exhausted ? "text-bad" : "text-text-muted"}>
                  {r.limit === 0
                    ? "Not on Free"
                    : `${r.used} / ${r.limit} ${r.unit}`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-pill bg-surface">
                <div
                  className={`h-full transition-all ${exhausted ? "bg-bad" : "bg-accent"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
