"use client";

import { useState } from "react";
import type {
  InterviewAnswer,
  InterviewQuestion,
  InterviewScore,
  InterviewType
} from "@/types";
import { SetupForm, type SetupValues } from "@/components/interview/SetupForm";
import { InterviewSession } from "@/components/interview/InterviewSession";
import { ResultsView } from "@/components/interview/ResultsView";
import { fetchOrPaywall } from "@/lib/paywall-client";

type Phase = "setup" | "session" | "results";

interface SessionState {
  role: string;
  level: string;
  company: string;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScore[];
}

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);

  async function startInterview(values: SetupValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrPaywall("/api/interview/questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values)
      });
      type GeneratedQ = InterviewQuestion & { what_it_probes?: string };
      const json = (await res.json()) as { data: GeneratedQ[] | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? "Failed to generate questions");

      const questions: InterviewQuestion[] = json.data.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        question: q.question,
        type: q.type === "situational" ? "behavioral" : q.type,
        difficulty: q.difficulty
      }));

      setSession({
        role: values.role,
        level: values.level,
        company: values.company,
        interviewType: values.interviewType,
        questions,
        answers: [],
        scores: []
      });
      setPhase("session");
    } catch (e) {
      if (!(e as { paywall?: unknown }).paywall) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function upsertAnswer(a: InterviewAnswer) {
    setSession((s) => {
      if (!s) return s;
      const others = s.answers.filter((x) => x.question_id !== a.question_id);
      return { ...s, answers: [...others, a] };
    });
  }

  function upsertScore(score: InterviewScore) {
    setSession((s) => {
      if (!s) return s;
      const others = s.scores.filter((x) => x.question_id !== score.question_id);
      return { ...s, scores: [...others, score] };
    });
  }

  async function finishAndSave() {
    if (!session) return;
    const overall = computeOverall(session.scores);
    setPhase("results");
    // Fire-and-forget: persist if a session exists, otherwise the route returns persisted:false.
    try {
      await fetch("/api/interview/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: session.role,
          level: session.level,
          company: session.company,
          interviewType: session.interviewType,
          questions: session.questions,
          answers: session.answers,
          scores: session.scores,
          overallScore: overall
        })
      });
    } catch {
      // silent — results UI doesn't depend on persistence
    }
  }

  function restart() {
    setSession(null);
    setPhase("setup");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {error && (
          <div className="mb-4 rounded-card border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
            {error}
          </div>
        )}

        {phase === "setup" && <SetupForm onStart={startInterview} loading={loading} />}

        {phase === "session" && session && (
          <InterviewSession
            role={session.role}
            questions={session.questions}
            answers={session.answers}
            scores={session.scores}
            onAnswer={upsertAnswer}
            onScore={upsertScore}
            onFinish={finishAndSave}
          />
        )}

        {phase === "results" && session && (
          <ResultsView
            questions={session.questions}
            scores={session.scores}
            overallScore={computeOverall(session.scores)}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}

function computeOverall(scores: InterviewScore[]): number {
  if (scores.length === 0) return 0;
  const avg10 = scores.reduce((acc, s) => acc + s.score, 0) / scores.length;
  return Math.round(avg10 * 10); // 1–10 average → 0–100
}
