"use client";

import { useEffect, useRef, useState } from "react";
import { fetchOrPaywall } from "@/lib/paywall-client";

type Phase = "idle" | "recording" | "transcribing";

export function VoiceRecorder({
  onTranscript,
  disabled
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop recording + release mic when the component unmounts mid-record.
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't support voice recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = pickSupportedMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime ?? "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        await sendForTranscription(blob, mime);
      };
      rec.start();
      recorderRef.current = rec;
      setPhase("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not access microphone");
      setPhase("idle");
    }
  }

  function stop() {
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = null;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setPhase("transcribing");
    } else {
      setPhase("idle");
    }
  }

  async function sendForTranscription(blob: Blob, mime: string | undefined) {
    try {
      const form = new FormData();
      const ext = (mime ?? "audio/webm").split("/")[1]?.split(";")[0] ?? "webm";
      form.append("file", blob, `answer.${ext}`);
      const res = await fetchOrPaywall("/api/interview/transcribe", { method: "POST", body: form });
      const json = (await res.json()) as { data: { text: string } | null; error: string | null };
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? "Transcription failed");
      onTranscript(json.data.text);
    } catch (err) {
      if (!(err as { paywall?: unknown }).paywall) {
        setError(err instanceof Error ? err.message : "Transcription failed");
      }
    } finally {
      setPhase("idle");
      setElapsed(0);
    }
  }

  const isRecording = phase === "recording";
  const isBusy = phase === "transcribing";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={disabled || isBusy}
        onClick={isRecording ? stop : start}
        className={`flex items-center gap-2 rounded-input border px-3 py-2 text-xs font-medium transition disabled:opacity-40 ${
          isRecording
            ? "border-bad bg-bad/10 text-bad"
            : "border-border bg-surface text-text hover:border-accent hover:text-accent"
        }`}
      >
        {isRecording ? (
          <>
            <span className="inline-block h-2 w-2 animate-pulse rounded-pill bg-bad" />
            Stop ({formatTime(elapsed)})
          </>
        ) : isBusy ? (
          <>
            <span className="inline-block h-2 w-2 animate-pulse rounded-pill bg-accent" />
            Transcribing…
          </>
        ) : (
          <>
            <MicIcon /> Use voice
          </>
        )}
      </button>
      {error && <span className="text-[11px] text-bad">{error}</span>}
    </div>
  );
}

function pickSupportedMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((c) => MediaRecorder.isTypeSupported(c));
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}
