import { claudeComplete } from "@/lib/anthropic";
import { buildCoverLetterPrompt } from "@/lib/prompts";
import { guarded } from "@/lib/route-guard";
import type { CoverLetterTone, ResumeContent } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resume_id?: string;
  resume?: ResumeContent;
  jobDescription: string;
  company: string;
  tone?: CoverLetterTone;
  job_application_id?: string;
}

type ResumeRow = { id: string; user_id: string; content_json: ResumeContent };

export const POST = guarded<{ content: string; id: string | null }>(
  { meter: "cover_letters" },
  async ({ req, supabase, user }) => {
    const body = (await req.json()) as Body;
    if (!body?.jobDescription?.trim()) throw new Error("jobDescription is required");
    if (!body?.company?.trim()) throw new Error("company is required");

    // Resolve the resume content — either from saved row or inline.
    let resume: ResumeContent | null = null;
    let resumeId: string | null = null;

    if (body.resume_id) {
      const row = await (supabase.from("resumes") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: ResumeRow | null }>;
          };
        };
      })
        .select("id, user_id, content_json")
        .eq("id", body.resume_id)
        .maybeSingle();
      if (!row.data || row.data.user_id !== user.id) {
        throw new Error("Resume not found");
      }
      resume = row.data.content_json;
      resumeId = row.data.id;
    } else if (body.resume) {
      resume = body.resume;
    } else {
      throw new Error("resume_id or resume is required");
    }

    const prompt = buildCoverLetterPrompt(resume, body.jobDescription, body.company);
    const content = await claudeComplete({ prompt, maxTokens: 2048, temperature: 0.6 });

    const tone: CoverLetterTone = body.tone ?? "professional";

    const insertRes = await (supabase.from("cover_letters") as unknown as {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
        };
      };
    })
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_application_id: body.job_application_id ?? null,
        content,
        tone
      })
      .select("id")
      .single();

    if (insertRes.error) {
      // Best-effort persist; still return the generated content so the user isn't blocked.
      console.warn("[cover-letter] insert failed:", insertRes.error.message);
    }

    return { data: { content, id: insertRes.data?.id ?? null } };
  }
);
