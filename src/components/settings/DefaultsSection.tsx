"use client";

import { useState } from "react";
import { SectionShell, SaveStatus } from "./SectionShell";
import { TEMPLATES } from "@/components/resume/templates";
import type { AccountDefaults } from "@/lib/account-data-server";
import type { ResumeTemplate } from "@/types";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" }
];

export function DefaultsSection({ initial }: { initial: AccountDefaults }) {
  const [form, setForm] = useState<AccountDefaults>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function setTemplate(t: ResumeTemplate) {
    setForm((f) => ({ ...f, default_template: t }));
    setSavedAt(null);
  }

  function setLang(code: string) {
    setForm((f) => ({ ...f, default_language: code }));
    setSavedAt(null);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = (await res.json()) as { error?: string | { message?: string } };
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Save failed";
        throw new Error(msg);
      }
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      title="Resume defaults"
      description="Pre-set these so new resumes start with sensible defaults."
      action={<SaveStatus saving={saving} error={error} savedAt={savedAt} />}
    >
      <div className="flex flex-col gap-5">
        <div>
          <span className="text-xs font-medium text-text-muted">Default template</span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {TEMPLATES.map((t) => {
              const selected = form.default_template === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`rounded-input border px-3 py-3 text-left transition ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface hover:border-accent/50"
                  }`}
                >
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="mt-0.5 text-[11px] text-text-muted">{t.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs sm:max-w-xs">
          <span className="font-medium text-text-muted">Default language</span>
          <select
            value={form.default_language}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-input border border-border bg-surface px-3 py-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Save defaults
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
