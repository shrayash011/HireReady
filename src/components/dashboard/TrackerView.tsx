"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { KanbanCard } from "@/lib/dashboard-data";
import { KanbanBoard } from "./KanbanBoard";
import { AddApplicationForm } from "./AddApplicationForm";

export function TrackerView({ initial }: { initial: KanbanCard[] }) {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  // Open the modal automatically if the URL says ?new=1 (used by QuickActions).
  useEffect(() => {
    if (params.get("new") === "1") setOpen(true);
  }, [params]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-widest text-text-muted">Application tracker</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your job pipeline</h1>
          <p className="text-sm text-text-muted">
            Drag cards between columns as you progress. Status updates save automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-input bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          + Add application
        </button>
      </div>

      <KanbanBoard initial={initial} />

      <AddApplicationForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
