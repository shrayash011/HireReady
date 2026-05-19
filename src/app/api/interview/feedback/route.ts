import { claudeComplete, parseJsonFromModel } from "@/lib/anthropic";
import { buildInterviewFeedbackPrompt } from "@/lib/prompts";
import { guarded } from "@/lib/route-guard";
import type { InterviewScore } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  question: string;
  answer: string;
  role: string;
  questionId?: string;
}

// No meter — feedback follows a question that was already metered. Auth still required.
export const POST = guarded<InterviewScore>({}, async ({ req }) => {
  const body = (await req.json()) as Body;
  if (!body?.question?.trim() || !body?.answer?.trim() || !body?.role?.trim()) {
    throw new Error("question, answer, and role are required");
  }

  const prompt = buildInterviewFeedbackPrompt(body.question, body.answer, body.role);
  const raw = await claudeComplete({ prompt, maxTokens: 1500, temperature: 0.3 });
  const result = parseJsonFromModel<Omit<InterviewScore, "question_id">>(raw);

  return {
    data: { question_id: body.questionId ?? "", ...result }
  };
});
