import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import type { ApplicationStatus } from "@/types";

export const runtime = "nodejs";

interface Body {
  company: string;
  role: string;
  status?: ApplicationStatus;
  job_url?: string;
  job_description?: string;
  resume_id?: string;
  notes?: string;
}

const ALLOWED_STATUS: ApplicationStatus[] = [
  "saved", "applied", "phone_screen", "interview", "offer", "rejected"
];

// TODO: gate behind plan limit (free = 5 total jobs) once we add a job_count
// helper. For now, any authenticated user can create unlimited applications.
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

  const company = body.company?.trim();
  const role = body.role?.trim();
  if (!company || !role) {
    return NextResponse.json({ error: "company and role are required" }, { status: 400 });
  }

  const status: ApplicationStatus = body.status && ALLOWED_STATUS.includes(body.status)
    ? body.status
    : "saved";

  try {
    const insertable = supabase.from("job_applications") as unknown as {
      insert: (row: Record<string, unknown>) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { id: string; status: ApplicationStatus } | null;
            error: { message: string } | null;
          }>;
        };
      };
    };

    const { data, error } = await insertable
      .insert({
        user_id: userId,
        company,
        role,
        status,
        applied_at: status === "saved" ? null : new Date().toISOString(),
        job_url: body.job_url?.trim() || null,
        job_description: body.job_description?.trim() || null,
        resume_id: body.resume_id || null,
        notes: body.notes?.trim() || null
      })
      .select("id, status")
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Insert returned no row");

    return NextResponse.json({ data, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
