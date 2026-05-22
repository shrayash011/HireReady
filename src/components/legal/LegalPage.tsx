import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared chrome for the privacy / terms / refund pages. Centered prose column
 * with a minimal top bar and footer link list. Element styles inside the body
 * come from the `.legal-prose` class (defined inline below) — keeps the
 * legal pages legible without pulling in @tailwindcss/typography.
 */
export function LegalPage({
  title,
  subtitle,
  effectiveDate,
  children
}: {
  title: string;
  subtitle?: string;
  effectiveDate?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border/60 bg-bg/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            <span className="text-accent">Hire</span>Ready
          </Link>
          <Link href="/" className="text-xs text-text-muted hover:text-accent">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
          {effectiveDate && (
            <p className="mt-1 text-xs text-text-muted">
              Last updated: {effectiveDate}
            </p>
          )}
        </div>

        <article className="legal-prose">{children}</article>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-muted">
          <div>© {new Date().getFullYear()} HireReady</div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:text-accent">Terms</Link>
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/refund" className="hover:text-accent">Refund</Link>
            <a href="mailto:hireready011@gmail.com" className="hover:text-accent">Contact</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
