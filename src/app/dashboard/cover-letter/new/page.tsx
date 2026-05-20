import Link from "next/link";
import { listResumesForPicker } from "@/lib/cover-letter-data-server";
import { CoverLetterForm } from "@/components/cover-letter/CoverLetterForm";

export const metadata = {
  title: "New cover letter · HireReady"
};

export default async function NewCoverLetterPage() {
  const resumes = await listResumesForPicker();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted">Cover letter</span>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">New cover letter</h1>
            <p className="text-sm text-text-muted">
              Pick a resume, paste the job description, and we&apos;ll draft a tailored letter.
            </p>
          </div>
          <Link
            href="/dashboard/cover-letter"
            className="rounded-input border border-border bg-card px-3 py-2 text-xs text-text-muted hover:border-accent hover:text-accent"
          >
            ← All cover letters
          </Link>
        </header>

        <CoverLetterForm resumes={resumes} />
      </div>
    </div>
  );
}
