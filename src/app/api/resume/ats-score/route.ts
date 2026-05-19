import { claudeComplete, parseJsonFromModel } from "@/lib/anthropic";
import { buildATSPrompt } from "@/lib/prompts";
import { guarded } from "@/lib/route-guard";
import type { ResumeContent } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  resume: ResumeContent;
  jobDescription: string;
}

interface ATSResult {
  score: number;
  missing_keywords: string[];
  weak_bullets: { original: string; issue: string; improved: string }[];
  suggestions: string[];
  strengths: string[];
}

export const POST = guarded<ATSResult>({ meter: "ats_checks" }, async ({ req }) => {
  const body = (await req.json()) as Body;
  if (!body?.resume || !body?.jobDescription?.trim()) {
    throw new Error("resume and jobDescription are required");
  }

  const prompt = buildATSPrompt(body.resume, body.jobDescription);
  const raw = await claudeComplete({ prompt, maxTokens: 2048, temperature: 0.2 });
  const result = parseJsonFromModel<ATSResult>(raw);
  return { data: result };
});
