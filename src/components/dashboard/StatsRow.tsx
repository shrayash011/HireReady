import type { DashboardStats } from "@/lib/dashboard-data";

const ITEMS: { key: keyof DashboardStats; label: string; suffix?: string; hint: string }[] = [
  { key: "resumes_created",   label: "Resumes",            hint: "Total resumes you've built" },
  { key: "ats_average",       label: "Avg ATS score",  suffix: "/100", hint: "Across all resumes" },
  { key: "applications_sent", label: "Applications sent",  hint: "Excluding saved-only" },
  { key: "interviews_booked", label: "Interviews booked",  hint: "Phone screens + interviews" }
];

export function StatsRow({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {ITEMS.map((it) => {
        const v = stats[it.key];
        const display = v === null ? "—" : v;
        return (
          <div
            key={it.key}
            className="rounded-card border border-border bg-card p-4 transition hover:border-accent/40"
          >
            <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {it.label}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">{display}</span>
              {it.suffix && v !== null && (
                <span className="text-sm text-text-muted">{it.suffix}</span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-text-muted">{it.hint}</div>
          </div>
        );
      })}
    </div>
  );
}
