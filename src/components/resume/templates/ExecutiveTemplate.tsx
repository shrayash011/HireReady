import type { ResumeContent } from "@/types";

export function ExecutiveTemplate({ data }: { data: ResumeContent }) {
  const p = data.personal_info;
  return (
    <div className="resume-print mx-auto max-w-[8.5in] bg-white p-10 text-[#111] font-serif text-[11pt] leading-snug">
      <header className="text-center">
        <h1 className="text-3xl font-bold uppercase tracking-[0.18em]">
          {p.full_name || "Your Name"}
        </h1>
        <p className="mt-2 text-[10pt]">
          {[p.email, p.phone, p.location].filter(Boolean).join("  •  ")}
        </p>
        {(p.linkedin || p.website) && (
          <p className="text-[10pt]">{[p.linkedin, p.website].filter(Boolean).join("  •  ")}</p>
        )}
        <div className="mx-auto mt-3 h-px w-full bg-black" />
      </header>

      {p.summary && (
        <section className="mt-4">
          <h2 className="text-center text-[10pt] font-bold uppercase tracking-[0.25em]">
            Executive Summary
          </h2>
          <p className="mt-1 italic">{p.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section className="mt-5">
          <h2 className="text-center text-[10pt] font-bold uppercase tracking-[0.25em]">
            Professional Experience
          </h2>
          {data.experiences.map((e, i) => (
            <div key={i} className="mt-3">
              <div className="flex justify-between">
                <strong className="uppercase tracking-wide">{e.company}</strong>
                <span className="text-[10pt]">
                  {e.start_date} – {e.current ? "Present" : e.end_date}
                </span>
              </div>
              <div className="italic">{e.role}{e.location ? ` — ${e.location}` : ""}</div>
              <ul className="ml-5 mt-1 list-disc">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mt-5">
          <h2 className="text-center text-[10pt] font-bold uppercase tracking-[0.25em]">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mt-1 flex justify-between">
              <span><strong>{ed.school}</strong> — {ed.degree}{ed.field ? `, ${ed.field}` : ""}</span>
              <span className="text-[10pt]">{ed.start_date} – {ed.end_date}</span>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-5">
          <h2 className="text-center text-[10pt] font-bold uppercase tracking-[0.25em]">Core Competencies</h2>
          <p className="mt-1 text-center">{data.skills.join("  •  ")}</p>
        </section>
      )}

      {data.languages && data.languages.length > 0 && (
        <section className="mt-5">
          <h2 className="text-center text-[10pt] font-bold uppercase tracking-[0.25em]">Languages</h2>
          <p className="mt-1 text-center">{data.languages.map((l) => `${l.name} (${l.level})`).join("  •  ")}</p>
        </section>
      )}
    </div>
  );
}
