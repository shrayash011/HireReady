"use client";

import type { ResumeContent, ResumeTemplate } from "@/types";
import { ResumeTemplateView } from "@/components/resume/templates";

interface Step6PreviewProps {
  data: ResumeContent;
  template: ResumeTemplate;
  onSaveAndPrint?: () => void;
  saving?: boolean;
  savedId?: string | null;
}

export function Step6Preview({ data, template, onSaveAndPrint, saving, savedId }: Step6PreviewProps) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Preview &amp; export</h2>
          <p className="text-sm text-text-muted">
            Review the final output. Save first to keep your resume, then export as PDF.
          </p>
        </div>
        <div className="flex gap-2">
          {onSaveAndPrint && (
            <button
              type="button"
              onClick={onSaveAndPrint}
              disabled={saving}
              className="rounded-input bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : savedId ? "Save & open print" : "Save & export PDF"}
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-input border border-border bg-surface px-4 py-2.5 text-sm hover:border-accent hover:text-accent"
          >
            Quick print
          </button>
        </div>
      </header>

      <div id="resume-print-area" className="rounded-card border border-border bg-card p-4 shadow-inner">
        <ResumeTemplateView template={template} data={data} />
        <p className="resume-watermark mt-6 text-center text-[10px] text-gray-500 print:block">
          Created with HireReady · hireready.com
        </p>
      </div>
    </div>
  );
}
