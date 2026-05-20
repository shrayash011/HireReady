"use client";

import Link from "next/link";
import { useState } from "react";
import type { DashboardResume } from "@/lib/dashboard-data";
import { relativeTime } from "@/lib/dashboard-data";
import { bandForScore, colorForBand } from "@/lib/ats-heuristic";

export function ResumeCard({ resume }: { resume: DashboardResume }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const score = resume.last_ats_score;
  const color = score !== null ? colorForBand(bandForScore(score)) : "#888890";

  return (
    <div className="group relative flex flex-col gap-3 rounded-card border border-border bg-card p-4 transition hover:border-accent/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{resume.title}</h3>
          {resume.target_role && (
            <p className="truncate text-xs text-text-muted">{resume.target_role}</p>
          )}
        </div>
        <span className="shrink-0 rounded-pill border border-border bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
          {resume.template}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <ScoreDial score={score} color={color} />
        <div className="flex-1 text-xs text-text-muted">
          <div className="text-text">
            {score !== null ? `${score}/100 ATS` : "Not scored yet"}
          </div>
          <div className="mt-0.5">Edited {relativeTime(resume.updated_at)}</div>
        </div>
      </div>

      <div className="mt-1 flex gap-1.5">
        <Link
          href={`/dashboard/resume/${resume.id}/edit`}
          className="flex-1 rounded-input border border-border bg-surface px-2 py-1.5 text-center text-xs hover:border-accent hover:text-accent"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => alert("TODO: duplicate via /api/resume/duplicate")}
          className="flex-1 rounded-input border border-border bg-surface px-2 py-1.5 text-xs hover:border-accent hover:text-accent"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-input border border-border bg-surface px-2 py-1.5 text-xs hover:border-accent hover:text-accent"
          aria-label="More actions"
        >
          ⋯
        </button>
      </div>

      {menuOpen && (
        <div
          onMouseLeave={() => setMenuOpen(false)}
          className="absolute right-3 top-[5.5rem] z-10 flex w-40 flex-col rounded-input border border-border bg-surface py-1 text-xs shadow-lg"
        >
          <Link
            href={`/dashboard/resume/${resume.id}/edit`}
            className="px-3 py-2 hover:bg-card"
          >
            Open
          </Link>
          <a
            href={`/dashboard/resume/${resume.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 hover:bg-card"
          >
            Download PDF
          </a>
          <button className="px-3 py-2 text-left text-bad hover:bg-card" onClick={() => alert("TODO: delete confirmation")}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreDial({ score, color }: { score: number | null; color: string }) {
  const v = score ?? 0;
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
        <path
          d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
          fill="none" stroke="#2A2A30" strokeWidth="3.5"
        />
        {score !== null && (
          <path
            d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
            fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={`${v}, 100`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold" style={{ color }}>
        {score ?? "—"}
      </div>
    </div>
  );
}

export function ResumeGrid({ resumes }: { resumes: DashboardResume[] }) {
  if (resumes.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-10 text-center text-sm text-text-muted">
        No resumes yet.{" "}
        <Link href="/dashboard/resume/new" className="text-accent hover:underline">
          Build your first →
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((r) => <ResumeCard key={r.id} resume={r} />)}
    </div>
  );
}
