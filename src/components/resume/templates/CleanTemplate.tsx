import type { ResumeContent } from "@/types";

export function CleanTemplate({ data }: { data: ResumeContent }) {
  const p = data.personal_info;
  return (
    <div className="resume-print mx-auto max-w-[8.5in] bg-white p-10 text-[#111] font-sans text-[11pt] leading-snug">
      <header className="border-b border-gray-300 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">{p.full_name || "Your Name"}</h1>
        <p className="mt-1 text-[10pt] text-gray-700">
          {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join("  •  ")}
        </p>
      </header>

      {p.summary && (
        <section className="mt-4">
          <h2 className="mb-1 text-[10pt] font-bold uppercase tracking-widest text-gray-700">Summary</h2>
          <p>{p.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-[10pt] font-bold uppercase tracking-widest text-gray-700">Experience</h2>
          {data.experiences.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <strong>{e.role}</strong>
                <span className="text-[10pt] text-gray-700">
                  {e.start_date} – {e.current ? "Present" : e.end_date}
                </span>
              </div>
              <div className="flex justify-between text-[10.5pt]">
                <span>{e.company}</span>
                {e.location && <span className="text-gray-700">{e.location}</span>}
              </div>
              <ul className="ml-5 mt-1 list-disc">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-[10pt] font-bold uppercase tracking-widest text-gray-700">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mb-2 flex justify-between">
              <div>
                <strong>{ed.school}</strong> — {ed.degree}{ed.field ? `, ${ed.field}` : ""}
                {ed.gpa && <span className="text-gray-700"> (GPA {ed.gpa})</span>}
              </div>
              <span className="text-[10pt] text-gray-700">{ed.start_date} – {ed.end_date}</span>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-1 text-[10pt] font-bold uppercase tracking-widest text-gray-700">Skills</h2>
          <p>{data.skills.join(" • ")}</p>
        </section>
      )}

      {data.languages && data.languages.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-1 text-[10pt] font-bold uppercase tracking-widest text-gray-700">Languages</h2>
          <p>{data.languages.map((l) => `${l.name} (${l.level})`).join("  •  ")}</p>
        </section>
      )}
    </div>
  );
}
