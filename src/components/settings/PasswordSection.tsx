"use client";

import { useState } from "react";
import { SectionShell, SaveStatus } from "./SectionShell";

export function PasswordSection() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (pw !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw })
      });
      const json = (await res.json()) as { error?: string | { message?: string } };
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Save failed";
        throw new Error(msg);
      }
      setSavedAt(Date.now());
      setPw("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      title="Change password"
      description="Minimum 8 characters. You'll stay signed in on this device."
      action={<SaveStatus saving={saving} error={error} savedAt={savedAt} />}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:max-w-md">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-text-muted">New password</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            className="rounded-input border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-text-muted">Confirm new password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className="rounded-input border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
        <div>
          <button
            type="submit"
            disabled={saving || !pw || !confirm}
            className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            Update password
          </button>
        </div>
      </form>
    </SectionShell>
  );
}
