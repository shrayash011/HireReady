"use client";

import type { ResumeContent, ResumeTemplate } from "@/types";
import { ResumeTemplateView, TEMPLATES } from "@/components/resume/templates";

export function Step5Template({
  data,
  template,
  onChange
}: {
  data: ResumeContent;
  template: ResumeTemplate;
  onChange: (t: ResumeTemplate) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl font-semibold">Choose a template</h2>
        <p className="text-sm text-text-muted">
          All three are ATS-safe — tested on Workday, Greenhouse, and Lever. Pick the one that fits the role.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TEMPLATES.map((t) => {
          const active = template === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`flex flex-col gap-3 rounded-card border bg-card p-4 text-left transition ${
                active ? "border-accent ring-2 ring-accent/40" : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t.name}</h3>
                {active && <span className="text-xs text-accent">✓ Selected</span>}
              </div>
              <p className="text-xs text-text-muted">{t.description}</p>
              <div className="overflow-hidden rounded-input border border-border bg-white">
                <div className="origin-top-left scale-[0.32]" style={{ width: "calc(100% / 0.32)" }}>
                  <ResumeTemplateView template={t.id} data={data} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
