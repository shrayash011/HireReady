import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

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
    const table = supabase.from("resumes") as unknown as {
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
