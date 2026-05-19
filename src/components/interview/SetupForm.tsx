"use client";

import { useState } from "react";
import type { InterviewType } from "@/types";
import { Input } from "@/components/ui/Field";

const ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Engineering Manager",
  "Product Manager",
  "Senior Product Manager",
  "Product Designer",
  "Senior Product Designer",
  "Data Scientist",
  "Data Analyst",
  "Marketing Manager",
  "Sales Executive",
  "Customer Success Manager",
  "Operations Manager",
  "Financial Analyst",
  "Other"
];

const LEVELS = ["Entry-level", "Mid-level", "Senior", "Staff / Principal", "Manager", "Director+"];

export interface SetupValues {
  role: string;
  level: string;
  company: string;
  interviewType: InterviewType;
}

export function SetupForm({
  onStart,
  loading
}: {
  onStart: (values: SetupValues) => void;
  loading: boolean;
}) {
  const [role, setRole] = useState("Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [level, setLevel] = useState("Mid-level");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<InterviewType>("mixed");

  const resolvedRole = role === "Other" ? customRole.trim() : role;
  const canStart = !!resolvedRole && !loading;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="text-center">
        <span className="text-xs uppercase tracking-widest text-text-muted">Mock interview</span>
        <h1 className="mt-1 text-3xl font-semibold">Set up your practice session</h1>
        <p className="mt-1 text-sm text-text-muted">
          10 AI-generated questions calibrated to your role and level. Type or speak your answers.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6">
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>

        {role === "Other" && (
          <Input
            label="Specify role"
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            placeholder="e.g. Solutions Architect"
          />
        )}

        <Field label="Experience level">
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`rounded-input border px-3 py-2 text-xs transition ${
                  level === l
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>

        <Input
          label="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Stripe, Figma, Anthropic…"
          hint="If set, questions can reference the company's culture and product."
        />

        <Field label="Interview type">
          <div className="grid grid-cols-3 gap-2">
            {(["behavioral", "technical", "mixed"] as InterviewType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-input border px-3 py-2 text-xs capitalize transition ${
                  type === t
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="button"
          onClick={() => onStart({ role: resolvedRole, level, company: company.trim(), interviewType: type })}
          disabled={!canStart}
          className="mt-2 rounded-input bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
        >
          {loading ? "Generating questions…" : "Start interview"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
      {children}
    </label>
  );
}
