"use client";

import type { Experience, ResumeContent } from "@/types";
import { Input, Textarea } from "@/components/ui/Field";

function emptyExperience(): Experience {
  return {
    company: "",
    role: "",
    location: "",
    start_date: "",
    end_date: "",
    current: false,
    bullets: [""]
  };
}

export function Step2Experience({
  data,
  onChange
}: {
  data: ResumeContent;
  onChange: (experiences: Experience[]) => void;
}) {
  const update = (idx: number, patch: Partial<Experience>) => {
    const next = data.experiences.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    onChange(next);
  };
  const remove = (idx: number) => onChange(data.experiences.filter((_, i) => i !== idx));
  const add = () => onChange([...data.experiences, emptyExperience()]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl font-semibold">Work experience</h2>
        <p className="text-sm text-text-muted">Most recent first. Quantify everything you can — numbers beat adjectives.</p>
      </header>

      {data.experiences.length === 0 && (
        <div className="rounded-card border border-dashed border-border bg-surface p-6 text-center text-sm text-text-muted">
          No experience added yet.
        </div>
      )}

      <div className="flex flex-col gap-6">
        {data.experiences.map((e, idx) => (
          <div key={idx} className="rounded-card border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-muted">Experience #{idx + 1}</h3>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs text-bad hover:underline"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Company" value={e.company} onChange={(ev) => update(idx, { company: ev.target.value })} />
              <Input label="Job title" value={e.role} onChange={(ev) => update(idx, { role: ev.target.value })} />
              <Input label="Location" value={e.location ?? ""} onChange={(ev) => update(idx, { location: ev.target.value })} placeholder="Bengaluru, India" />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Start" value={e.start_date} onChange={(ev) => update(idx, { start_date: ev.target.value })} placeholder="Jan 2022" />
                <Input
                  label="End"
                  value={e.current ? "" : (e.end_date ?? "")}
                  disabled={e.current}
                  onChange={(ev) => update(idx, { end_date: ev.target.value })}
                  placeholder="Present"
                />
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!e.current}
                onChange={(ev) => update(idx, { current: ev.target.checked, end_date: ev.target.checked ? "" : e.end_date })}
                className="accent-accent"
              />
              I currently work here
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Bullet points
              </span>
              {e.bullets.map((b, j) => (
                <div key={j} className="flex gap-2">
                  <Textarea
                    rows={2}
                    value={b}
                    onChange={(ev) => {
                      const bullets = [...e.bullets];
                      bullets[j] = ev.target.value;
                      update(idx, { bullets });
                    }}
                    placeholder='Led migration of 50M-row Postgres database with zero downtime, reducing query p95 from 800ms to 90ms.'
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => update(idx, { bullets: e.bullets.filter((_, k) => k !== j) })}
                    className="self-start rounded-input border border-border bg-card px-2 py-1 text-xs text-text-muted hover:border-bad hover:text-bad"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => update(idx, { bullets: [...e.bullets, ""] })}
                className="self-start rounded-input border border-border bg-card px-3 py-1.5 text-xs text-text-muted hover:border-accent hover:text-accent"
              >
                + Add bullet
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="self-start rounded-input border border-dashed border-border bg-card px-4 py-2 text-sm text-text-muted hover:border-accent hover:text-accent"
      >
        + Add another job
      </button>
    </div>
  );
}
