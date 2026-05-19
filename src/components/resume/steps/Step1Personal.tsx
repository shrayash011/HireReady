"use client";

import type { ResumeContent } from "@/types";
import { Input, Textarea } from "@/components/ui/Field";

export function Step1Personal({
  data,
  onChange
}: {
  data: ResumeContent;
  onChange: (patch: Partial<ResumeContent["personal_info"]>) => void;
}) {
  const p = data.personal_info;
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl font-semibold">Personal info</h2>
        <p className="text-sm text-text-muted">How recruiters reach you. All fields except summary are public on your resume.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          value={p.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          placeholder="Priya Sharma"
        />
        <Input
          label="Email"
          type="email"
          value={p.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="priya@example.com"
        />
        <Input
          label="Phone"
          value={p.phone ?? ""}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Location"
          value={p.location ?? ""}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Bengaluru, India"
        />
        <Input
          label="LinkedIn"
          value={p.linkedin ?? ""}
          onChange={(e) => onChange({ linkedin: e.target.value })}
          placeholder="linkedin.com/in/priya"
        />
        <Input
          label="Portfolio / Website"
          value={p.website ?? ""}
          onChange={(e) => onChange({ website: e.target.value })}
          placeholder="priya.dev"
        />
      </div>

      <Textarea
        label="Professional summary"
        rows={4}
        value={p.summary ?? ""}
        onChange={(e) => onChange({ summary: e.target.value })}
        placeholder="Senior product designer with 7+ years shipping fintech and SaaS products. Led design at a 30-person startup acquired by Stripe."
        hint="2–3 lines. Name your role, key strengths, and a headline achievement."
      />
    </div>
  );
}
