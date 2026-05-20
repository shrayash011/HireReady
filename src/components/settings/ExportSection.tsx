"use client";

import { useState } from "react";
import { SectionShell } from "./SectionShell";

export function ExportSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string | { message?: string } };
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Export failed";
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `hireready-export-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionShell
      title="Export my data"
      description="Download every resume, cover letter, application, interview, and ATS score we have on file as JSON."
    >
      <div className="flex flex-col gap-2">
        {error && (
          <div className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</div>
        )}
        <div>
          <button
            type="button"
            onClick={onDownload}
            disabled={loading}
            className="rounded-input border border-border bg-surface px-4 py-2 text-sm hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {loading ? "Preparing…" : "Download my data"}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
