"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApplicationStatus } from "@/types";
import { Input, Textarea } from "@/components/ui/Field";

const STATUSES: { id: ApplicationStatus; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "phone_screen", label: "Phone Screen" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" }
];

export function AddApplicationForm({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("saved");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      setError("Company and role are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          status,
          job_url: jobUrl.trim() || undefined,
          job_description: jobDescription.trim() || undefined
        })
      });
      const json = (await res.json()) as { data: unknown; error: string | null };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      // Reset + close + refresh data
      setCompany(""); setRole(""); setJobUrl(""); setJobDescription(""); setStatus("saved");
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-card border border-border bg-card shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">New application</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Stripe"
            required
            autoFocus
          />
          <Input
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Product Designer"
            required
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>

          <Input
            label="Job URL (optional)"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://…"
          />

          <Textarea
            label="Job description (optional)"
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the JD so you can tailor a resume to it later."
          />

          {error && (
            <p className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-surface px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-input border border-border bg-card px-3 py-2 text-sm text-text-muted hover:border-accent hover:text-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Add application"}
          </button>
        </div>
      </form>
    </div>
  );
}
