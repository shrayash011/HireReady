import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import type { ResumeTemplate } from "@/types";

export const runtime = "nodejs";

const ALLOWED_TEMPLATES: ResumeTemplate[] = ["clean", "modern", "executive"];

interface Body {
  full_name?: string;
  avatar_url?: string;
  job_title?: string;
  location?: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  default_template?: ResumeTemplate;
  default_language?: string;
  notify_low_ats?: boolean;
  notify_weekly_summary?: boolean;
  notify_interview_reminders?: boolean;
}

const STRING_KEYS = [
  "full_name",
  "avatar_url",
  "job_title",
  "location",
  "phone",
  "linkedin_url",
  "portfolio_url",
  "default_language"
] as const;

const BOOL_KEYS = [
  "notify_low_ats",
  "notify_weekly_summary",
  "notify_interview_reminders"
] as const;

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: { code: "auth_required", message: "Sign in first." } },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  for (const k of STRING_KEYS) {
    const v = body[k];
    if (typeof v === "string") patch[k] = v.trim() || null;
  }
  for (const k of BOOL_KEYS) {
    const v = body[k];
    if (typeof v === "boolean") patch[k] = v;
  }
  if (body.default_template !== undefined) {
    if (!ALLOWED_TEMPLATES.includes(body.default_template)) {
      return NextResponse.json({ error: "Invalid default_template" }, { status: 400 });
    }
    patch.default_template = body.default_template;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const table = supabase.from("users") as unknown as {
      update: (row: Record<string, unknown>) => {
        eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await table.update(patch).eq("id", userId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ data: { ok: true }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
