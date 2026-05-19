import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/whisper";
import { createServerSupabase } from "@/lib/supabase";
import { PaywallError, getAuthedUser, paywallJson, requirePremium } from "@/lib/plan";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024; // Whisper's per-file limit

// Voice transcription is Premium-only. Not using guarded() since this route
// takes multipart/form-data, not JSON.
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  try {
    const user = await getAuthedUser(supabase);
    if (!user) throw new PaywallError({ code: "auth_required" });
    requirePremium(user, "voice_interviews");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty audio" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Audio exceeds 25MB" }, { status: 413 });
    }

    const language = (form.get("language") as string | null) ?? undefined;
    const { text } = await transcribeAudio(file, { language });
    return NextResponse.json({ data: { text }, error: null });
  } catch (err) {
    if (err instanceof PaywallError) {
      return NextResponse.json(paywallJson(err), { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
