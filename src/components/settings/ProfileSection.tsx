"use client";

import { useState } from "react";
import { SectionShell, SaveStatus } from "./SectionShell";
import type { AccountProfile } from "@/lib/account-data-server";

const FIELDS: { key: keyof AccountProfile; label: string; placeholder?: string; type?: string; readOnly?: boolean }[] = [
  { key: "full_name", label: "Full name", placeholder: "Aanya Sharma" },
  { key: "email", label: "Email", readOnly: true },
  { key: "job_title", label: "Current job title", placeholder: "Senior Software Engineer" },
  { key: "location", label: "Location / country", placeholder: "Bengaluru, India" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourname" },
  { key: "portfolio_url", label: "Portfolio / website", placeholder: "https://yourname.dev" },
  { key: "avatar_url", label: "Profile photo URL", placeholder: "https://…/photo.jpg" }
];

export function ProfileSection({ initial }: { initial: AccountProfile }) {
  const [form, setForm] = useState<AccountProfile>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function update<K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedAt(null);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      const { email: _ignored, ...payload } = form;
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
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
      title="Profile"
      description="Your personal info. Used to pre-fill new resumes and personalize AI suggestions."
      action={<SaveStatus saving={saving} error={error} savedAt={savedAt} />}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-xs">
            <span className="font-medium text-text-muted">{f.label}</span>
            <input
              type={f.type ?? "text"}
              value={form[f.key] ?? ""}
              readOnly={f.readOnly}
              placeholder={f.placeholder}
              onChange={(e) => update(f.key, e.target.value)}
              className={`rounded-input border border-border px-3 py-2 text-sm ${
                f.readOnly ? "cursor-not-allowed bg-bg text-text-muted" : "bg-surface"
              }`}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          Save profile
        </button>
      </div>
    </SectionShell>
  );
}
