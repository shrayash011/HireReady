import type { ResumeContent } from "@/types";

export function ModernTemplate({ data }: { data: ResumeContent }) {
  const p = data.personal_info;
  return (
    <div className="resume-print mx-auto max-w-[8.5in] bg-white p-10 text-[#111] font-sans text-[11pt] leading-snug">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">
          {p.full_name || "Your Name"}
        </h1>
        <div className="mt-1 h-[2px] w-16 bg-[#4F46E5]" />
        <p className="mt-2 text-[10pt] text-gray-700">
          {[p.email, p.phone, p.location].filter(Boolean).join("  |  ")}
        </p>
        <p className="text-[10pt] text-gray-700">
          {[p.linkedin, p.website].filter(Boolean).join("  |  ")}
        </p>
      </header>

      {p.summary && (
        <section className="mt-5">
          <h2 className="text-[11pt] font-semibold text-[#4F46E5]">Profile</h2>
          <p className="mt-1">{p.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11pt] font-semibold text-[#4F46E5]">Experience</h2>
          {data.experiences.map((e, i) => (
            <div key={i} className="mt-2">
              <div className="flex justify-between">
                <span><strong>{e.role}</strong> — {e.company}</span>
                <span className="text-[10pt] text-gray-700">
                  {e.start_date} – {e.current ? "Present" : e.end_date}
                </span>
              </div>
              {e.location && <div className="text-[10pt] text-gray-600">{e.location}</div>}
              <ul className="ml-5 mt-1 list-disc">
                {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11pt] font-semibold text-[#4F46E5]">Education</h2>
          {data.education.map((ed, i) => (
            <div key={i} className="mt-1 flex justify-between">
              <span>
                <strong>{ed.degree}</strong>{ed.field ? `, ${ed.field}` : ""} — {ed.school}
              </span>
              <span className="text-[10pt] text-gray-700">{ed.start_date} – {ed.end_date}</span>
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11pt] font-semibold text-[#4F46E5]">Skills</h2>
          <p className="mt-1">{data.skills.join(" • ")}</p>
        </section>
      )}

      {data.languages && data.languages.length > 0 && (
        <section className="mt-5">
          <h2 className="text-[11pt] font-semibold text-[#4F46E5]">Languages</h2>
          <p className="mt-1">{data.languages.map((l) => `${l.name} (${l.level})`).join("  •  ")}</p>
        </section>
      )}
    </div>
  );
}
