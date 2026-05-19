"use client";

import type { InterviewQuestion, InterviewScore } from "@/types";
import { FeedbackCard } from "./FeedbackCard";

export function ResultsView({
  questions,
  scores,
  overallScore,
  onRestart
}: {
  questions: InterviewQuestion[];
  scores: InterviewScore[];
  overallScore: number;
  onRestart: () => void;
}) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const topImprovements = collectTopImprovements(scores);

  const color = overallScore >= 80 ? "#22C55E" : overallScore >= 60 ? "#F59E0B" : "#EF4444";

  const qById = (id: string) => questions.find((q) => q.id === id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="text-center">
        <span className="text-xs uppercase tracking-widest text-text-muted">Results</span>
        <h1 className="mt-1 text-3xl font-semibold">Session complete</h1>
      </header>

      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card p-8">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
            <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#2A2A30" strokeWidth="3" />
            <path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${overallScore}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{overallScore}</span>
            <span className="text-[10px] uppercase tracking-widest text-text-muted">/ 100</span>
          </div>
        </div>
        <p className="text-sm text-text-muted">
          Average across {scores.length} answers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {strongest && (
          <Highlight tone="good" title="Strongest answer" score={strongest.score} question={qById(strongest.question_id)?.question ?? ""}>
            {strongest.strengths[0] ?? "Clear, structured response."}
          </Highlight>
        )}
        {weakest && (
          <Highlight tone="bad" title="Weakest answer" score={weakest.score} question={qById(weakest.question_id)?.question ?? ""}>
            {weakest.one_tip}
          </Highlight>
        )}
      </div>

      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Top 3 things to work on</h2>
        <ol className="flex flex-col gap-2 text-sm">
          {topImprovements.map((tip, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-accent/20 text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">All feedback</h2>
        {scores.map((s) => {
          const q = qById(s.question_id);
          return (
            <div key={s.question_id} className="flex flex-col gap-2">
              {q && <p className="text-xs italic text-text-muted">“{q.question}”</p>}
              <FeedbackCard score={s} defaultOpen={false} />
            </div>
          );
        })}
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="mt-2 rounded-input bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover"
      >
        Practice again
      </button>
    </div>
  );
}

function Highlight({
  tone,
  title,
  score,
  question,
  children
}: {
  tone: "good" | "bad";
  title: string;
  score: number;
  question: string;
  children: React.ReactNode;
}) {
  const color = tone === "good" ? "#22C55E" : "#EF4444";
  return (
    <div className="flex flex-col gap-2 rounded-card border bg-card p-4" style={{ borderColor: `${color}55` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{title}</span>
        <span
          className="rounded-pill px-2 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {score}/10
        </span>
      </div>
      <p className="text-xs italic text-text-muted">“{question}”</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function collectTopImprovements(scores: InterviewScore[]): string[] {
  // Prefer the one_tip from the lowest-scoring answers, then fall back to first improvements.
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  const seen = new Set<string>();
  const out: string[] = [];

  for (const s of sorted) {
    if (s.one_tip && !seen.has(s.one_tip)) {
      seen.add(s.one_tip);
      out.push(s.one_tip);
      if (out.length === 3) return out;
    }
  }
  for (const s of sorted) {
    for (const imp of s.improvements) {
      if (!seen.has(imp)) {
        seen.add(imp);
        out.push(imp);
        if (out.length === 3) return out;
      }
    }
  }
  return out;
}
