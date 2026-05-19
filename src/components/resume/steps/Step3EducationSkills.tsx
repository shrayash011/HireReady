"use client";

import { useState } from "react";
import type { Education, ResumeContent } from "@/types";
import { Input } from "@/components/ui/Field";

function emptyEducation(): Education {
  return { school: "", degree: "", field: "", start_date: "", end_date: "", gpa: "" };
}

export function Step3EducationSkills({
  data,
  onChange
}: {
  data: ResumeContent;
  onChange: (patch: Partial<ResumeContent>) => void;
}) {
  const [skillInput, setSkillInput] = useState("");
  const [langName, setLangName] = useState("");
  const [langLevel, setLangLevel] = useState("");

  const updateEdu = (idx: number, patch: Partial<Education>) => {
    onChange({ education: data.education.map((e, i) => (i === idx ? { ...e, ...patch } : e)) });
  };

  const addSkillsFromInput = () => {
    const parts = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !data.skills.includes(s));
    if (parts.length === 0) return;
    onChange({ skills: [...data.skills, ...parts] });
    setSkillInput("");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Education */}
      <section className="flex flex-col gap-4">
        <header>
          <h2 className="text-xl font-semibold">Education</h2>
          <p className="text-sm text-text-muted">Highest degree first.</p>
        </header>

        {data.education.map((ed, i) => (
          <div key={i} className="rounded-card border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-muted">Education #{i + 1}</h3>
              <button
                type="button"
                onClick={() => onChange({ education: data.education.filter((_, k) => k !== i) })}
                className="text-xs text-bad hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="School" value={ed.school} onChange={(e) => updateEdu(i, { school: e.target.value })} />
              <Input label="Degree" value={ed.degree} onChange={(e) => updateEdu(i, { degree: e.target.value })} placeholder="B.Tech" />
              <Input label="Field of study" value={ed.field ?? ""} onChange={(e) => updateEdu(i, { field: e.target.value })} placeholder="Computer Science" />
              <Input label="GPA (optional)" value={ed.gpa ?? ""} onChange={(e) => updateEdu(i, { gpa: e.target.value })} placeholder="3.8 / 4.0" />
              <Input label="Start" value={ed.start_date ?? ""} onChange={(e) => updateEdu(i, { start_date: e.target.value })} placeholder="2018" />
              <Input label="End" value={ed.end_date ?? ""} onChange={(e) => updateEdu(i, { end_date: e.target.value })} placeholder="2022" />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => onChange({ education: [...data.education, emptyEducation()] })}
          className="self-start rounded-input border border-dashed border-border bg-card px-4 py-2 text-sm text-text-muted hover:border-accent hover:text-accent"
        >
          + Add education
        </button>
      </section>

      {/* Skills */}
      <section className="flex flex-col gap-3">
        <header>
          <h2 className="text-xl font-semibold">Skills</h2>
          <p className="text-sm text-text-muted">Hard skills, tools, frameworks. Aim for 8–15. Comma-separated.</p>
        </header>

        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkillsFromInput();
              }
            }}
            placeholder="Python, SQL, AWS, Figma…"
            className="flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:border-accent"
          />
          <button
            type="button"
            onClick={addSkillsFromInput}
            className="rounded-input bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {data.skills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ skills: data.skills.filter((k) => k !== s) })}
              className="group rounded-pill border border-border bg-surface px-3 py-1 text-xs hover:border-bad hover:text-bad"
              title="Click to remove"
            >
              {s} <span className="text-text-muted group-hover:text-bad">✕</span>
            </button>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="flex flex-col gap-3">
        <header>
          <h2 className="text-xl font-semibold">Languages</h2>
          <p className="text-sm text-text-muted">Optional. Useful for global roles.</p>
        </header>

        <div className="flex gap-2">
          <input
            value={langName}
            onChange={(e) => setLangName(e.target.value)}
            placeholder="English"
            className="flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select
            value={langLevel}
            onChange={(e) => setLangLevel(e.target.value)}
            className="rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Level…</option>
            <option>Native</option>
            <option>Fluent</option>
            <option>Professional</option>
            <option>Conversational</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (!langName.trim() || !langLevel) return;
              onChange({
                languages: [...(data.languages ?? []), { name: langName.trim(), level: langLevel }]
              });
              setLangName("");
              setLangLevel("");
            }}
            className="rounded-input bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(data.languages ?? []).map((l, i) => (
            <button
              key={`${l.name}-${i}`}
              type="button"
              onClick={() => onChange({ languages: (data.languages ?? []).filter((_, k) => k !== i) })}
              className="rounded-pill border border-border bg-surface px-3 py-1 text-xs hover:border-bad hover:text-bad"
            >
              {l.name} <span className="text-text-muted">· {l.level}</span> <span className="text-text-muted">✕</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
