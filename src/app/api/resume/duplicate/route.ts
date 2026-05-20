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
  source_id: string;
}

interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template: ResumeTemplate;
  content_json: ResumeContent;
  target_role: string | null;
}

export async function POST(req: Request) {
  const supabase = createServerSupabase();

  try {
    const user = await getAuthedUser(supabase);
    if (!user) throw new PaywallError({ code: "auth_required" });

    const body = (await req.json()) as Body;
    if (!body?.source_id) {
      return NextResponse.json({ error: "source_id is required" }, { status: 400 });
    }

    // Duplicating counts toward the lifetime resume cap.
    await checkLimit(supabase, user, "resumes");

    const sourceRes = await (supabase.from("resumes") as unknown as {
      select: (cols: string) => {
        eq: (c: string, v: string) => {
          maybeSingle: () => Promise<{ data: ResumeRow | null }>;
        };
      };
    })
      .select("id, user_id, title, template, content_json, target_role")
      .eq("id", body.source_id)
      .maybeSingle();

    const source = sourceRes.data;
    if (!source || source.user_id !== user.id) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const insertRes = await (supabase.from("resumes") as unknown as {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
    })
      .insert({
        user_id: user.id,
        title: `${source.title} (copy)`,
        template: source.template,
        content_json: source.content_json,
        target_role: source.target_role
      })
      .select("id")
      .single();

    if (insertRes.error) throw new Error(insertRes.error.message);
    if (!insertRes.data) throw new Error("Insert returned no row");

    return NextResponse.json({ data: { id: insertRes.data.id }, error: null });
  } catch (err) {
    if (err instanceof PaywallError) {
      return NextResponse.json(paywallJson(err), { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
