import Link from "next/link";
import { listCoverLetters } from "@/lib/cover-letter-data-server";
import { relativeTime } from "@/lib/dashboard-data";

export const metadata = {
  title: "Cover letters · HireReady"
};

export default async function CoverLettersPage() {
  const letters = await listCoverLetters();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted">Cover letters</span>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your cover letters</h1>
            <p className="text-sm text-text-muted">{letters.length} saved</p>
          </div>
          <Link
            href="/dashboard/cover-letter/new"
            className="rounded-input bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover"
          >
            + New cover letter
          </Link>
        </header>

        {letters.length === 0 ? (
          <div className="rounded-card border border-dashed border-border bg-card p-10 text-center text-sm text-text-muted">
            No cover letters yet.{" "}
            <Link href="/dashboard/cover-letter/new" className="text-accent hover:underline">
              Draft your first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {letters.map((l) => {
              const title = l.company ?? l.resume_title ?? "Cover letter";
              const preview = l.content.slice(0, 220);
              return (
                <article
                  key={l.id}
                  className="flex flex-col gap-2 rounded-card border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold">{title}</h3>
                    <span className="shrink-0 rounded-pill border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                      {l.tone}
                    </span>
                  </div>
                  <p className="line-clamp-5 whitespace-pre-wrap text-xs text-text-muted">
                    {preview}
                    {l.content.length > 220 ? "…" : ""}
                  </p>
                  <div className="mt-auto text-[10px] text-text-muted">
                    {relativeTime(l.created_at)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
