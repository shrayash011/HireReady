import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { TopNav } from "@/components/dashboard/TopNav";
import type { Plan } from "@/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user;

  // Middleware already redirects, but belt-and-braces in case a route slips through.
  if (!authUser) redirect("/login");

  const profile = await (supabase.from("users") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { full_name: string | null; plan: Plan } | null }>;
      };
    };
  }).select("full_name, plan").eq("id", authUser.id).maybeSingle();

  const navUser = {
    fullName: profile.data?.full_name ?? authUser.user_metadata?.full_name ?? null,
    email: authUser.email ?? "",
    plan: (profile.data?.plan ?? "free") as Plan
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <TopNav user={navUser} />
      {children}
    </div>
  );
}
