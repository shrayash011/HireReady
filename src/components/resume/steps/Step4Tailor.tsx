"use client";

import { useState } from "react";
import type { ResumeContent } from "@/types";
import { Textarea } from "@/components/ui/Field";
import { fetchOrPaywall } from "@/lib/paywall-client";
import { JobUrlInput } from "@/components/jobs/JobUrlInput";

export function Step4Tailor({
  data,
  jobDescription,
  setJobDescription,
  onApply
}: {
  data: ResumeContent;
  jobDescription: string;
  setJobDescription: (s: string) => void;
  onApply: (tailored: ResumeContent) => void;
}) {
  const [tailored, setTailored] = useState<ResumeContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function tailor() {
    if (!jobDescription.trim()) {
      setError("Paste a job description first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrPaywall("/api/resume/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resume: data, jobDescription })
      });
      const json = (await res.json()) as { data: ResumeContent | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? "Tailor failed");
      setTailored(json.data);
    } catch (e) {
      // fetchOrPaywall shows the modal; just clear local loading state.
      const message = e instanceof Error ? e.message : "Failed";
      if (!(e as { paywall?: unknown }).paywall) setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl font-semibold">AI tailoring</h2>
        <p className="text-sm text-text-muted">
          Paste the job description. Claude will rewrite your bullets to mirror the JD&apos;s language,
          quantify impact, and prioritize relevant experience.
        </p>
      </header>

      <JobUrlInput onParsed={(job) => setJobDescription(job.jobDescription)} />

      <Textarea
        rows={10}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the full job description here…"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={tailor}
          disabled={loading || !jobDescription.trim()}
          className="rounded-input bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
        >
          {loading ? "Tailoring…" : "Tailor my resume"}
        </button>
        {error && <span className="text-sm text-bad">{error}</span>}
        <span className="ml-auto text-xs text-text-muted">
          Tailoring rewrites bullets — you can always discard.
        </span>
      </div>

      {tailored && (
        <BeforeAfter before={data} after={tailored} onApply={() => onApply(tailored)} onDiscard={() => setTailored(null)} />
      )}
    </div>
  );
}

function BeforeAfter({
  before,
  after,
  onApply,
  onDiscard
}: {
  before: ResumeContent;
  after: ResumeContent;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-4 rounded-card border border-accent/40 bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-accent">Tailored version ready</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-input border border-border bg-surface px-3 py-1.5 text-xs text-text-muted hover:border-bad hover:text-bad"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-input bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
          >
            Apply tailored version
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Column label="Before" data={before} />
        <Column label="After (tailored)" data={after} accent />
      </div>
    </div>
  );
}

function Column({ label, data, accent }: { label: string; data: ResumeContent; accent?: boolean }) {
  return (
    <div className={`rounded-input border bg-surface p-4 ${accent ? "border-accent/60" : "border-border"}`}>
      <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${accent ? "text-accent" : "text-text-muted"}`}>
        {label}
      </h4>
      {data.personal_info.summary && (
        <p className="mb-3 text-xs italic text-text-muted">{data.personal_info.summary}</p>
      )}
      <div className="flex flex-col gap-3">
        {data.experiences.map((e, i) => (
          <div key={i}>
            <div className="text-xs font-medium">{e.role} — {e.company}</div>
            <ul className="ml-4 mt-1 list-disc text-xs text-text-muted">
              {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
