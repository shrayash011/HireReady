"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ApplicationStatus } from "@/types";
import {
  KANBAN_COLUMNS,
  guessLogoDomain,
  relativeTime,
  type KanbanCard as KanbanCardData
} from "@/lib/dashboard-data";
import { bandForScore, colorForBand } from "@/lib/ats-heuristic";

export function KanbanBoard({ initial }: { initial: KanbanCardData[] }) {
  const [cards, setCards] = useState<KanbanCardData[]>(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStatus, KanbanCardData[]>();
    for (const col of KANBAN_COLUMNS) map.set(col.id, []);
    for (const c of cards) map.get(c.status)?.push(c);
    return map;
  }, [cards]);

  async function move(id: string, to: ApplicationStatus) {
    const previous = cards;
    // Optimistic update — flip locally first.
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const applied_at =
          c.applied_at === null && to !== "saved" ? new Date().toISOString() : c.applied_at;
        return { ...c, status: to, applied_at };
      })
    );

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: to })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // Roll back on failure so the UI stays consistent with the server.
      console.warn("Failed to persist status change:", err);
      setCards(previous);
    }
  }

  // Brand-new user: no applications yet. Show a friendlier empty state instead
  // of six "Drop here" columns.
  if (cards.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-medium">No applications yet</p>
        <p className="mt-1 text-xs text-text-muted">
          Track jobs you&apos;re applying to. Drag cards between columns as you progress.
        </p>
        <Link
          href="/dashboard/tracker?new=1"
          className="mt-4 inline-block rounded-input bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover"
        >
          + Add your first application
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1100px] grid-cols-6 gap-3">
        {KANBAN_COLUMNS.map((col) => {
          const items = grouped.get(col.id) ?? [];
          const isOver = dragOver === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== col.id) setDragOver(col.id);
              }}
              onDragLeave={() => setDragOver((c) => (c === col.id ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain") || dragId;
                if (id) move(id, col.id);
                setDragId(null);
                setDragOver(null);
              }}
              className={`flex flex-col gap-2 rounded-card border bg-surface p-3 transition ${
                isOver ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {col.label}
                </h3>
                <span className="rounded-pill bg-card px-2 py-0.5 text-[10px] text-text-muted">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {items.map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    onDragStart={(e) => {
                      setDragId(card.id);
                      e.dataTransfer.setData("text/plain", card.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOver(null);
                    }}
                  />
                ))}

                {items.length === 0 && (
                  <div className="rounded-input border border-dashed border-border bg-card/40 px-3 py-6 text-center text-[11px] text-text-muted">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  card,
  onDragStart,
  onDragEnd
}: {
  card: KanbanCardData;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}) {
  const color = card.ats_score !== null ? colorForBand(bandForScore(card.ats_score)) : "#888890";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group cursor-grab rounded-input border border-border bg-card p-3 transition hover:border-accent/50 active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <CompanyLogo company={card.company} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{card.company}</div>
          <div className="truncate text-[11px] text-text-muted">{card.role}</div>
        </div>
        {card.ats_score !== null && (
          <span
            className="rounded-pill px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: `${color}22`, color }}
          >
            {card.ats_score}
          </span>
        )}
      </div>
      <div className="mt-2 text-[10px] text-text-muted">
        {card.applied_at ? `Applied ${relativeTime(card.applied_at)}` : "Saved — not applied yet"}
      </div>
    </div>
  );
}

function CompanyLogo({ company }: { company: string }) {
  const [errored, setErrored] = useState(false);
  const domain = guessLogoDomain(company);
  if (errored) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-input bg-surface text-[11px] font-semibold text-text-muted">
        {company.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  // Plain <img> rather than next/image so onError + remote-host config stays simple.
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={`${company} logo`}
      width={32}
      height={32}
      onError={() => setErrored(true)}
      className="h-8 w-8 shrink-0 rounded-input bg-white object-contain p-0.5"
    />
  );
}
