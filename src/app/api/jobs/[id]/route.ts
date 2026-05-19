import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import type { ApplicationStatus } from "@/types";

export const runtime = "nodejs";

interface Body {
  status?: ApplicationStatus;
}

const ALLOWED_STATUS: ApplicationStatus[] = [
  "saved", "applied", "phone_screen", "interview", "offer", "rejected"
];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  if (!body.status || !ALLOWED_STATUS.includes(body.status)) {
    return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
  }

  try {
    const table = supabase.from("job_applications") as unknown as {
      update: (row: Record<string, unknown>) => {
        eq: (c: string, v: string) => {
          eq: (c: string, v: string) => {
            select: (cols: string) => {
              single: () => Promise<{
                data: { id: string; status: ApplicationStatus; applied_at: string | null } | null;
                error: { message: string } | null;
              }>;
            };
          };
        };
      };
    };

    // If moving from "saved" to anything else, stamp applied_at on first transition.
    // RLS already restricts by user_id, but we add it explicitly as defence-in-depth.
    const patch: Record<string, unknown> = { status: body.status };
    if (body.status !== "saved") {
      patch.applied_at = new Date().toISOString();
    }

    const { data, error } = await table
      .update(patch)
      .eq("id", params.id)
      .eq("user_id", userId)
      .select("id, status, applied_at")
      .single();

    if (error) throw new Error(error.message);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: { code: "auth_required", message: "Sign in first." } },
      { status: 401 }
    );
  }

  try {
    const table = supabase.from("job_applications") as unknown as {
      delete: () => {
        eq: (c: string, v: string) => {
          eq: (c: string, v: string) => Promise<{ error: { message: string } | null }>;
        };
      };
    };

    const { error } = await table.delete().eq("id", params.id).eq("user_id", userId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ data: { id: params.id }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
