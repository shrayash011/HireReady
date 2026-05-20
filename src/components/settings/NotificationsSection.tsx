"use client";

import { useState } from "react";
import { SectionShell, SaveStatus } from "./SectionShell";
import type { AccountNotifications } from "@/lib/account-data-server";

const ROWS: { key: keyof AccountNotifications; label: string; sub: string }[] = [
  {
    key: "notify_low_ats",
    label: "Low ATS score alert",
    sub: "Email me when a resume's ATS score drops below 60."
  },
  {
    key: "notify_weekly_summary",
    label: "Weekly application summary",
    sub: "Get a Monday recap of applications, interviews, and rejections."
  },
  {
    key: "notify_interview_reminders",
    label: "Interview practice reminders",
    sub: "Nudge me to run a mock interview before a scheduled call."
  }
];

export function NotificationsSection({ initial }: { initial: AccountNotifications }) {
  const [form, setForm] = useState<AccountNotifications>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function toggle(key: keyof AccountNotifications) {
    const next = { ...form, [key]: !form[key] };
    setForm(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [key]: next[key] })
      });
      const json = (await res.json()) as { error?: string | { message?: string } };
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Save failed";
        throw new Error(msg);
      }
      setSavedAt(Date.now());
    } catch (err) {
      setForm((f) => ({ ...f, [key]: !next[key] }));
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      title="Notifications"
      description="Email delivery is coming soon — your preferences will be respected once enabled."
      action={<SaveStatus saving={saving} error={error} savedAt={savedAt} />}
    >
      <div className="flex flex-col gap-3">
        {ROWS.map((r) => {
          const on = form[r.key];
          return (
            <div key={r.key} className="flex items-start justify-between gap-4 rounded-input border border-border bg-surface px-4 py-3">
              <div>
                <div className="text-sm font-medium">{r.label}</div>
                <div className="mt-0.5 text-xs text-text-muted">{r.sub}</div>
              </div>
              <button
                type="button"
                onClick={() => toggle(r.key)}
                aria-pressed={on}
                className={`relative h-6 w-11 shrink-0 rounded-pill transition ${
                  on ? "bg-accent" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    on ? "left-[1.375rem]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
