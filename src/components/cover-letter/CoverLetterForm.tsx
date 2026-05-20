"use client";

import { useState } from "react";
import { fetchOrPaywall } from "@/lib/paywall-client";
import { JobUrlInput } from "@/components/jobs/JobUrlInput";
import type { CoverLetterTone } from "@/types";
import type { ResumeOption } from "@/lib/cover-letter-data-server";

const TONES: { value: CoverLetterTone; label: string; sub: string }[] = [
  { value: "professional", label: "Professional", sub: "Polished and formal" },
  { value: "enthusiastic", label: "Enthusiastic", sub: "Warm and energetic" },
  { value: "concise", label: "Concise", sub: "Short and punchy" }
];

export function CoverLetterForm({ resumes }: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = useState<string>(resumes[0]?.id ?? "");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeId) {
      setError("Pick a resume to base the cover letter on.");
      return;
    }
    if (!company.trim() || !jobDescription.trim()) {
      setError("Company and job description are required.");
      return;
    }
    setError(null);
    setContent(null);
    setLoading(true);
    try {
      const res = await fetchOrPaywall("/api/cover-letter/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resume_id: resumeId, company, jobDescription, tone })
      });
      const json = (await res.json()) as { data?: { content: string }; error?: { message?: string } };
      if (!res.ok || !json.data?.content) {
        throw new Error(json.error?.message ?? "Generation failed");
      }
      setContent(json.data.content);
    } catch (err) {
      if (err instanceof Error && !(err as Error & { paywall?: unknown }).paywall) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadTxt() {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-10 text-center text-sm text-text-muted">
        You need at least one resume first.{" "}
        <a href="/dashboard/resume/new" className="text-accent hover:underline">
          Build a resume →
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-card p-5">
        <div>
          <label className="text-xs font-medium text-text-muted">Resume</label>
          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="mt-1 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
                {r.target_role ? ` — ${r.target_role}` : ""}
              </option>
            ))}
          </select>
        </div>

        <JobUrlInput
          onParsed={(job) => {
            if (job.company) setCompany(job.company);
            if (job.jobDescription) setJobDescription(job.jobDescription);
          }}
        />

        <div>
          <label className="text-xs font-medium text-text-muted">Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe"
            className="mt-1 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here"
            rows={10}
            className="mt-1 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-muted">Tone</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={`rounded-input border px-3 py-2 text-left text-xs transition ${
                  tone === t.value
                    ? "border-accent bg-accent/10 text-text"
                    : "border-border bg-surface text-text-muted hover:border-accent/50"
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                <div className="mt-0.5 text-[10px]">{t.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-input bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate cover letter"}
        </button>
      </form>

      <div className="flex min-h-[24rem] flex-col gap-3 rounded-card border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Result</h2>
          {content && (
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="rounded-input border border-border bg-surface px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={downloadTxt}
                className="rounded-input border border-border bg-surface px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
              >
                Download .txt
              </button>
            </div>
          )}
        </div>

        {!content && !loading && (
          <p className="text-sm text-text-muted">Generated letter appears here.</p>
        )}
        {loading && <p className="text-sm text-text-muted">Drafting your letter…</p>}
        {content && (
          <pre className="whitespace-pre-wrap rounded-input bg-surface p-4 text-sm leading-relaxed text-text">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
