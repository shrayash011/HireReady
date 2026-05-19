"use client";

import { useMemo, useState } from "react";
import type { ResumeContent } from "@/types";
import { bandForScore, colorForBand, scoreResumeHeuristic } from "@/lib/ats-heuristic";
import { fetchOrPaywall } from "@/lib/paywall-client";

interface FullATSResult {
  score: number;
  missing_keywords: string[];
  weak_bullets: { original: string; issue: string; improved: string }[];
  suggestions: string[];
  strengths: string[];
}

export function ATSScorePanel({
  resume,
  jobDescription
}: {
  resume: ResumeContent;
  jobDescription: string;
}) {
  const heuristic = useMemo(
    () => scoreResumeHeuristic(resume, jobDescription),
    [resume, jobDescription]
  );

  const [full, setFull] = useState<FullATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = full?.score ?? heuristic.score;
  const band = bandForScore(score);
  const color = colorForBand(band);
  const dashArray = `${score}, 100`;

  async function runFullAnalysis() {
    if (!jobDescription.trim()) {
      setError("Paste a job description in step 4 first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrPaywall("/api/resume/ats-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resume, jobDescription })
      });
      const json = (await res.json()) as { data: FullATSResult | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? "Failed");
      setFull(json.data);
    } catch (e) {
      if (!(e as { paywall?: unknown }).paywall) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="sticky top-6 flex w-full flex-col gap-4 rounded-card border border-border bg-card p-5 lg:w-80">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">ATS Score</h3>
        <span className="rounded-pill bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
          {full ? "Claude analysis" : "Live"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
            <path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none"
              stroke="#2A2A30"
              strokeWidth="3"
            />
            <path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={dashArray}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">/ 100</span>
          </div>
        </div>
        <div className="flex-1 text-sm">
          <p className="font-medium capitalize" style={{ color }}>
            {band === "exceptional" ? "Exceptional" : band}
          </p>
          <p className="text-xs text-text-muted">
            {band === "red" && "Significant gaps — needs work before applying."}
            {band === "amber" && "Passable but missing key signals."}
            {band === "green" && "Strong — likely to pass ATS."}
            {band === "exceptional" && "Top-tier match. Send it."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={runFullAnalysis}
        disabled={loading || !jobDescription.trim()}
        className="rounded-input bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
      >
        {loading ? "Analyzing…" : full ? "Re-run Claude analysis" : "Run full Claude analysis"}
      </button>
      {error && <p className="text-xs text-bad">{error}</p>}

      {full ? (
        <FullResultsView full={full} />
      ) : (
        <HeuristicView fixes={heuristic.fixes} stats={heuristic.stats} />
      )}
    </aside>
  );
}

function HeuristicView({
  fixes,
  stats
}: {
  fixes: ReturnType<typeof scoreResumeHeuristic>["fixes"];
  stats: ReturnType<typeof scoreResumeHeuristic>["stats"];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-input border border-border bg-surface p-3 text-xs text-text-muted">
        <div className="flex justify-between">
          <span>Bullets with metrics</span>
          <span className="text-text">{stats.bulletsWithMetrics}/{stats.bulletsTotal}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Skills</span>
          <span className="text-text">{stats.skillsCount}</span>
        </div>
        {stats.keywordOverlap !== undefined && (
          <div className="mt-1 flex justify-between">
            <span>JD keyword overlap</span>
            <span className="text-text">{Math.round(stats.keywordOverlap * 100)}%</span>
          </div>
        )}
      </div>

      {fixes.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Suggested fixes</h4>
          <ul className="flex flex-col gap-2">
            {fixes.map((f) => (
              <li key={f.id} className="flex gap-2 text-xs">
                <span
                  className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    f.severity === "high" ? "bg-bad" : f.severity === "med" ? "bg-warn" : "bg-text-muted"
                  }`}
                />
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.keywordsMissing && stats.keywordsMissing.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Missing JD keywords</h4>
          <div className="flex flex-wrap gap-1">
            {stats.keywordsMissing.slice(0, 8).map((k) => (
              <span key={k} className="rounded-pill bg-surface px-2 py-0.5 text-[10px] text-text-muted">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FullResultsView({ full }: { full: FullATSResult }) {
  return (
    <div className="flex flex-col gap-3 text-xs">
      {full.suggestions.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold uppercase tracking-wider text-text-muted">Top fixes</h4>
          <ul className="flex flex-col gap-1.5">
            {full.suggestions.slice(0, 5).map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {full.missing_keywords.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold uppercase tracking-wider text-text-muted">Missing keywords</h4>
          <div className="flex flex-wrap gap-1">
            {full.missing_keywords.slice(0, 10).map((k) => (
              <span key={k} className="rounded-pill border border-bad/40 bg-bad/10 px-2 py-0.5 text-[10px] text-bad">
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {full.strengths.length > 0 && (
        <section>
          <h4 className="mb-2 font-semibold uppercase tracking-wider text-text-muted">Strengths</h4>
          <ul className="flex flex-col gap-1">
            {full.strengths.slice(0, 3).map((s, i) => (
              <li key={i} className="text-text-muted">✓ {s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
