import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

interface Body {
  password: string;
}

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user?.id) {
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

  const password = (body.password ?? "").trim();
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: { ok: true }, error: null });
}
