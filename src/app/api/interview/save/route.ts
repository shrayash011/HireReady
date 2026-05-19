import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import type {
  InterviewAnswer,
  InterviewQuestion,
  InterviewScore,
  InterviewType
} from "@/types";

export const runtime = "nodejs";

interface Body {
  role: string;
  level?: string;
  company?: string;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScore[];
  overallScore: number;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.role || !Array.isArray(body.questions)) {
    return NextResponse.json({ error: "Malformed session payload" }, { status: 400 });
  }

  // Persist to Supabase if a session is present. Without auth we skip silently —
  // the client doesn't depend on this for the results UI.
  try {
    const supabase = createServerSupabase();
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;

    if (!userId) {
      return NextResponse.json({
        data: { persisted: false, reason: "no_session" },
        error: null
      });
    }

    // Cast to bypass Supabase's strict generated-types requirement.
    // Once you run `supabase gen types typescript`, the cast becomes unnecessary.
    const insertable = supabase.from("mock_interviews") as unknown as {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> };
      };
    };

    const { data, error } = await insertable
      .insert({
        user_id: userId,
        role: body.role,
        experience_level: body.level ?? null,
        company: body.company ?? null,
        interview_type: body.interviewType,
        questions_json: body.questions,
        answers_json: body.answers,
        scores_json: body.scores,
        overall_score: body.overallScore,
        completed_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Insert returned no row");
    return NextResponse.json({ data: { persisted: true, id: data.id }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
