"use client";

import { useState } from "react";
import type { InterviewAnswer, InterviewQuestion, InterviewScore } from "@/types";
import { Textarea } from "@/components/ui/Field";
import { fetchOrPaywall } from "@/lib/paywall-client";
import { VoiceRecorder } from "./VoiceRecorder";
import { FeedbackCard } from "./FeedbackCard";

export function InterviewSession({
  role,
  questions,
  answers,
  scores,
  onAnswer,
  onScore,
  onFinish
}: {
  role: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  scores: InterviewScore[];
  onAnswer: (a: InterviewAnswer) => void;
  onScore: (s: InterviewScore) => void;
  onFinish: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = questions[idx];
  const existingAnswer = answers.find((a) => a.question_id === q?.id);
  const existingScore = scores.find((s) => s.question_id === q?.id);

  const goto = (i: number) => {
    setIdx(i);
    setDraft(answers.find((a) => a.question_id === questions[i].id)?.answer_text ?? "");
    setError(null);
  };

  async function submitAnswer() {
    if (!q) return;
    const text = draft.trim();
    if (!text) {
      setError("Type or record an answer first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    onAnswer({ question_id: q.id, answer_text: text });

    try {
      const res = await fetchOrPaywall("/api/interview/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: q.id, question: q.question, answer: text, role })
      });
      const json = (await res.json()) as { data: InterviewScore | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? "Feedback failed");
      onScore(json.data);
    } catch (e) {
      if (!(e as { paywall?: unknown }).paywall) {
        setError(e instanceof Error ? e.message : "Feedback failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!q) return null;
  const progress = ((idx + 1) / questions.length) * 100;
  const allAnswered = scores.length === questions.length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* progress + nav */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Question {idx + 1} of {questions.length}</span>
          <span className="capitalize">
            {q.type} · {q.difficulty}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-pill bg-surface">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex flex-wrap gap-1">
          {questions.map((qq, i) => {
            const answered = !!scores.find((s) => s.question_id === qq.id);
            const active = i === idx;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => goto(i)}
                className={`h-7 w-7 rounded-input text-xs font-medium transition ${
                  active
                    ? "bg-accent text-white"
                    : answered
                    ? "bg-accent/20 text-accent"
                    : "bg-surface text-text-muted hover:bg-card"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* question */}
      <div className="rounded-card border border-border bg-card p-6">
        <h2 className="text-lg font-semibold leading-snug">{q.question}</h2>
      </div>

      {/* answer */}
      <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Your answer</h3>
          <VoiceRecorder onTranscript={(text) => setDraft((d) => (d ? `${d} ${text}` : text))} disabled={submitting} />
        </div>

        <Textarea
          rows={7}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Use the STAR format — Situation, Task, Action, Result. Concrete numbers beat adjectives."
        />
        {error && <span className="text-xs text-bad">{error}</span>}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goto(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="rounded-input border border-border bg-surface px-3 py-2 text-xs text-text-muted hover:border-accent hover:text-accent disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={submitAnswer}
            disabled={submitting}
            className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
          >
            {submitting ? "Scoring…" : existingScore ? "Re-score" : "Submit answer"}
          </button>
          <button
            type="button"
            onClick={() => goto(Math.min(questions.length - 1, idx + 1))}
            disabled={idx === questions.length - 1}
            className="rounded-input border border-border bg-surface px-3 py-2 text-xs text-text-muted hover:border-accent hover:text-accent disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>

      {/* feedback */}
      {existingScore && <FeedbackCard score={existingScore} />}
      {!existingScore && existingAnswer && (
        <div className="rounded-card border border-dashed border-border bg-card p-4 text-xs text-text-muted">
          Your answer is saved. Submit to get AI feedback.
        </div>
      )}

      {/* finish */}
      {allAnswered && (
        <button
          type="button"
          onClick={onFinish}
          className="mt-2 rounded-input bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-hover"
        >
          See results →
        </button>
      )}
    </div>
  );
}
