"use client";

import { useState } from "react";

interface ParsedJob {
  company: string;
  role: string;
  location: string;
  jobDescription: string;
}

/**
 * Tiny URL → parsed JD field. Lives next to a JD textarea — on success
 * the caller decides which fields to apply (some forms only want jd, others
 * want company + jd too).
 */
export function JobUrlInput({
  onParsed,
  className = ""
}: {
  onParsed: (job: ParsedJob) => void;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchJob() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });
      const json = (await res.json()) as { data?: ParsedJob; error?: string | { message?: string } };
      if (!res.ok || !json.data) {
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Could not parse that URL";
        throw new Error(msg);
      }
      onParsed(json.data);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse that URL");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchJob();
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={onKey}
          placeholder="…or paste a job URL to auto-fill"
          className="flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={fetchJob}
          disabled={loading || !url.trim()}
          className="rounded-input border border-border bg-card px-3 py-2 text-sm hover:border-accent hover:text-accent disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Fetching…" : "Fetch JD"}
        </button>
      </div>
      {error && <span className="text-xs text-bad">{error}</span>}
    </div>
  );
}
