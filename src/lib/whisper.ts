/**
 * Whisper transcription via raw fetch — no openai SDK dependency.
 * Reference: https://platform.openai.com/docs/api-reference/audio/createTranscription
 */

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";

export async function transcribeAudio(audio: Blob | File, opts?: {
  language?: string;
  prompt?: string;
  filename?: string;
}): Promise<{ text: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const form = new FormData();
  const filename = opts?.filename ?? (audio instanceof File ? audio.name : "audio.webm");
  form.append("file", audio, filename);
  form.append("model", "whisper-1");
  if (opts?.language) form.append("language", opts.language);
  if (opts?.prompt) form.append("prompt", opts.prompt);
  form.append("response_format", "json");

  const res = await fetch(WHISPER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Whisper API ${res.status}: ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as { text?: string };
  if (!json.text) throw new Error("Whisper returned no text");
  return { text: json.text.trim() };
}
