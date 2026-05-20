import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

type AnyTable = {
  select: (cols: string) => {
    eq: (c: string, v: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
  };
};

type RelationTable = {
  select: (cols: string) => {
    in: (c: string, v: string[]) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
  };
};

export async function GET() {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return NextResponse.json(
      { error: { code: "auth_required", message: "Sign in first." } },
      { status: 401 }
    );
  }

  // Pull this user's rows from each per-user table in parallel.
  const [profile, resumes, coverLetters, jobApps, interviews] = await Promise.all([
    (supabase.from("users") as unknown as AnyTable).select("*").eq("id", user.id),
    (supabase.from("resumes") as unknown as AnyTable).select("*").eq("user_id", user.id),
    (supabase.from("cover_letters") as unknown as AnyTable).select("*").eq("user_id", user.id),
    (supabase.from("job_applications") as unknown as AnyTable).select("*").eq("user_id", user.id),
    (supabase.from("mock_interviews") as unknown as AnyTable).select("*").eq("user_id", user.id)
  ]);

  // ats_scores has no user_id — fetch by resume_id of this user's resumes.
  const resumeIds = (resumes.data ?? [])
    .map((r) => (r as { id?: string }).id)
    .filter((id): id is string => typeof id === "string");

  let atsScores: unknown[] = [];
  if (resumeIds.length > 0) {
    const res = await (supabase.from("ats_scores") as unknown as RelationTable)
      .select("*")
      .in("resume_id", resumeIds);
    atsScores = res.data ?? [];
  }

  const payload = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: profile.data?.[0] ?? null,
    resumes: resumes.data ?? [],
    cover_letters: coverLetters.data ?? [],
    job_applications: jobApps.data ?? [],
    mock_interviews: interviews.data ?? [],
    ats_scores: atsScores
  };

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="hireready-export-${today}.json"`
    }
  });
}
