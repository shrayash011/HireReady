"use client";

import type { ResumeContent, ResumeTemplate } from "@/types";
import { ResumeTemplateView } from "@/components/resume/templates";

export function Step6Preview({
  data,
  template
}: {
  data: ResumeContent;
  template: ResumeTemplate;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Preview &amp; export</h2>
          <p className="text-sm text-text-muted">
            Review the final output. Use Export to save as PDF — your browser&apos;s print dialog will let you &quot;Save as PDF&quot;.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-input bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Export PDF
        </button>
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
