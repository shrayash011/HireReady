"use client";

import { useEffect } from "react";

/**
 * Mounts on the print page and immediately opens the browser's print dialog.
 * The user picks "Save as PDF" (or cancels) — no server-side PDF rendering.
 * After-print: window stays open so they can re-print or close manually.
 */
export function PrintTrigger() {
  useEffect(() => {
    // Slight delay so the resume DOM is fully painted (fonts, layout) before printing.
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="print:hidden mb-4 flex items-center justify-between rounded-card border border-border bg-card px-4 py-3 text-sm">
      <span className="text-text-muted">
        Print dialog opening… choose <strong className="text-text">Save as PDF</strong>.
      </span>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-input bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
      >
        Print again
      </button>
    </div>
  );
}
