import Link from "next/link";

const ACTIONS = [
  {
    href: "/dashboard/resume/new",
    label: "New Resume",
    sub: "Build & tailor with AI",
    primary: true
  },
  {
    href: "/dashboard/cover-letter/new",
    label: "New Cover Letter",
    sub: "AI-drafted, tailored to the JD"
  },
  {
    href: "/dashboard/tracker?new=1",
    label: "New Application",
    sub: "Track a job you're applying to"
  },
  {
    href: "/dashboard/interview",
    label: "Practice Interview",
    sub: "Voice or text mock interview"
  }
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`group flex items-center justify-between rounded-card border p-4 transition ${
            a.primary
              ? "border-accent/60 bg-accent text-white hover:bg-accent-hover"
              : "border-border bg-card hover:border-accent/50"
          }`}
        >
          <div>
            <div className="text-sm font-semibold">{a.label}</div>
            <div className={`text-xs ${a.primary ? "text-white/70" : "text-text-muted"}`}>
              {a.sub}
            </div>
          </div>
          <span
            className={`text-xl transition group-hover:translate-x-0.5 ${
              a.primary ? "text-white/80" : "text-text-muted"
            }`}
          >
            →
          </span>
        </Link>
      ))}
    </div>
  );
}
