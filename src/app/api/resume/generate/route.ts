import { claudeComplete, parseJsonFromModel } from "@/lib/anthropic";
import { buildResumePrompt } from "@/lib/prompts";
import { guarded } from "@/lib/route-guard";
import type { ResumeContent } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resume: ResumeContent;
  jobDescription: string;
}

export const POST = guarded<ResumeContent>({ meter: "ats_checks" }, async ({ req }) => {
  const body = (await req.json()) as Body;
  if (!body?.resume || !body?.jobDescription?.trim()) {
    throw new Error("resume and jobDescription are required");
  }

  const prompt = buildResumePrompt(body.resume, body.jobDescription);
  const raw = await claudeComplete({ prompt, maxTokens: 4096, temperature: 0.3 });
  const tailored = parseJsonFromModel<ResumeContent>(raw);
  return { data: tailored };
});
