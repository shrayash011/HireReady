import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import {
  PaywallError,
  checkLimit,
  getAuthedUser,
  paywallJson
} from "@/lib/plan";
import type { ResumeContent, ResumeTemplate } from "@/types";

export const runtime = "nodejs";

interface Body {
  id?: string;
  title?: string;
  template?: ResumeTemplate;
  content_json: ResumeContent;
  target_role?: string | null;
  last_ats_score?: number | null;
}

const ALLOWED_TEMPLATES: ResumeTemplate[] = ["clean", "modern", "executive"];

export async function POST(req: Request) {
  const supabase = createServerSupabase();

  try {
    const user = await getAuthedUser(supabase);
    if (!user) throw new PaywallError({ code: "auth_required" });

    const body = (await req.json()) as Body;
    if (!body?.content_json) {
      return NextResponse.json({ error: "content_json is required" }, { status: 400 });
    }

    const template: ResumeTemplate = ALLOWED_TEMPLATES.includes(
      body.template as ResumeTemplate
    )
      ? (body.template as ResumeTemplate)
      : "clean";

    const derivedTitle =
      body.title?.trim() ||
      body.target_role?.trim() ||
      body.content_json.personal_info?.full_name?.trim() ||
      "Untitled resume";

    // UPDATE path — verify ownership via the user_id filter.
    if (body.id) {
      const table = supabase.from("resumes") as unknown as {
        update: (row: Record<string, unknown>) => {
          eq: (c: string, v: string) => {
            eq: (c: string, v: string) => {
              select: (cols: string) => {
                single: () => Promise<{
                  data: { id: string } | null;
                  error: { message: string } | null;
                }>;
              };
            };
          };
        };
      };

      const { data, error } = await table
        .update({
          title: derivedTitle,
          template,
          content_json: body.content_json,
          target_role: body.target_role ?? null,
          last_ats_score: body.last_ats_score ?? null
        })
        .eq("id", body.id)
        .eq("user_id", user.id)
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data: { id: data.id }, error: null });
    }

    // INSERT path — paywall by lifetime resume count.
    await checkLimit(supabase, user, "resumes");

    const insertTable = supabase.from("resumes") as unknown as {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };

    const { data, error } = await insertTable
      .insert({
        user_id: user.id,
        title: derivedTitle,
        template,
        content_json: body.content_json,
        target_role: body.target_role ?? null,
        last_ats_score: body.last_ats_score ?? null
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Insert returned no row");

    return NextResponse.json({ data: { id: data.id }, error: null });
  } catch (err) {
    if (err instanceof PaywallError) {
      return NextResponse.json(paywallJson(err), { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
