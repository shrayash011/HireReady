import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ResumeGrid } from "@/components/dashboard/ResumeCard";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";

export const metadata = {
  title: "Dashboard · HireReady"
};

export default async function DashboardPage() {
  const { stats, resumes, applications } = await getDashboardData();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted">Dashboard</span>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-text-muted">Your job search, all in one place.</p>
          </div>
          <Link
            href="/settings"
            className="rounded-input border border-border bg-card px-3 py-2 text-xs text-text-muted hover:border-accent hover:text-accent"
          >
            Settings
          </Link>
        </header>

        <StatsRow stats={stats} />

        <QuickActions />

        <Section
          title="My resumes"
          action={<Link href="/dashboard/resume/new" className="text-xs text-accent hover:underline">+ New resume</Link>}
        >
          <ResumeGrid resumes={resumes} />
        </Section>

        <Section
          title="Application tracker"
          action={
            <Link
              href="/dashboard/tracker"
              className="text-xs text-text-muted hover:text-accent"
            >
              Open full tracker →
            </Link>
          }
        >
          <KanbanBoard initial={applications} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
