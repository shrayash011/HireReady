import type { ReactNode } from "react";

export function SectionShell({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-card p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function SaveStatus({ saving, error, savedAt }: { saving: boolean; error: string | null; savedAt: number | null }) {
  if (saving) return <span className="text-xs text-text-muted">Saving…</span>;
  if (error) return <span className="text-xs text-bad">{error}</span>;
  if (savedAt) return <span className="text-xs text-good">Saved</span>;
  return null;
}
