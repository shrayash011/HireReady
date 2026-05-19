import { claudeComplete, parseJsonFromModel } from "@/lib/anthropic";
import { buildInterviewQuestionsPrompt } from "@/lib/prompts";
import { guarded } from "@/lib/route-guard";
import type { InterviewType } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  role: string;
  level: string;
  company?: string;
  interviewType?: InterviewType;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: "behavioral" | "technical" | "situational";
  difficulty: "easy" | "medium" | "hard";
  what_it_probes: string;
}

// Free plan: interviews limit = 0 → starting one always trips paywall.
// Pro + Premium: unlimited.
export const POST = guarded<GeneratedQuestion[]>({ meter: "interviews" }, async ({ req }) => {
  const body = (await req.json()) as Body;
  if (!body?.role?.trim() || !body?.level?.trim()) {
    throw new Error("role and level are required");
  }

  let prompt = buildInterviewQuestionsPrompt(body.role, body.level, body.company ?? "");
  if (body.interviewType && body.interviewType !== "mixed") {
    prompt += `\n\nIMPORTANT: bias the mix toward ${body.interviewType} questions specifically — at least 8 of the 10 should be ${body.interviewType}.`;
  }

  const raw = await claudeComplete({ prompt, maxTokens: 2048, temperature: 0.6 });
  const parsed = parseJsonFromModel<{ questions: GeneratedQuestion[] }>(raw);
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("Model returned no questions");
  }

  return { data: parsed.questions };
});
