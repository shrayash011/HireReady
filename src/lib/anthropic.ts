import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  _client = new Anthropic({ apiKey });
  return _client;
}

// Pinned in CLAUDE.md. Swap to a newer dated snapshot when you upgrade.
export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/**
 * Call Claude with a single user prompt and return the concatenated text.
 * Throws if the response doesn't contain a text block.
 */
export async function claudeComplete(opts: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const res = await getAnthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.4,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }]
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Claude returned no text content");
  return text;
}

/** Extract the first JSON object/array from a model response and parse it. */
export function parseJsonFromModel<T = unknown>(raw: string): T {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = trimmed.search(/[\[{]/);
  if (start === -1) throw new Error("No JSON found in model output");
  const end = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"));
  const slice = trimmed.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
