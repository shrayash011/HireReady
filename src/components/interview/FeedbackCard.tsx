"use client";

import { useState } from "react";
import type { InterviewScore } from "@/types";

export function FeedbackCard({ score, defaultOpen = true }: { score: InterviewScore; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const color = score.score >= 8 ? "#22C55E" : score.score >= 5 ? "#F59E0B" : "#EF4444";
  const starColor = score.star_rating === "full" ? "#22C55E" : score.star_rating === "partial" ? "#F59E0B" : "#EF4444";

  return (
    <div className="rounded-card border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-pill text-sm font-semibold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {score.score}
          </div>
          <div>
            <div className="text-sm font-semibold">Feedback</div>
            <div className="text-[11px] text-text-muted">
              STAR: <span style={{ color: starColor }}>{score.star_rating}</span> · click to {open ? "collapse" : "expand"}
            </div>
          </div>
        </div>
        <span className={`text-text-muted transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 text-sm">
          <Section title="Top tip" highlight>
            <p>{score.one_tip}</p>
          </Section>

          {score.strengths.length > 0 && (
            <Section title="What worked">
              <BulletList items={score.strengths} bullet="✓" color="#22C55E" />
            </Section>
          )}

          {score.improvements.length > 0 && (
            <Section title="Improve this">
              <BulletList items={score.improvements} bullet="→" color="#F59E0B" />
            </Section>
          )}

          {score.missing_elements.length > 0 && (
            <Section title="Missing">
              <BulletList items={score.missing_elements} bullet="•" color="#EF4444" />
            </Section>
          )}

          <Section title="Model answer">
            <p className="rounded-input border border-border bg-surface p-3 text-xs italic leading-relaxed text-text">
              “{score.model_answer}”
            </p>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className={`text-[11px] font-semibold uppercase tracking-wider ${highlight ? "text-accent" : "text-text-muted"}`}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function BulletList({ items, bullet, color }: { items: string[]; bullet: string; color: string }) {
  return (
    <ul className="flex flex-col gap-1.5 text-xs">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span style={{ color }}>{bullet}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
