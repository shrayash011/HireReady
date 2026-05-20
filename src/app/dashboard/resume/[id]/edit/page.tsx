import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import type { ResumeContent, ResumeTemplate } from "@/types";

export const metadata = {
  title: "Edit resume · HireReady"
};

interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template: ResumeTemplate;
  content_json: ResumeContent;
  target_role: string | null;
}

export default async function EditResumePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) redirect("/login");

  const res = await (supabase.from("resumes") as unknown as {
    select: (cols: string) => {
      eq: (c: string, v: string) => {
        maybeSingle: () => Promise<{ data: ResumeRow | null }>;
      };
    };
  })
    .select("id, user_id, title, template, content_json, target_role")
    .eq("id", params.id)
    .maybeSingle();

  const row = res.data;
  if (!row || row.user_id !== userId) notFound();

  return (
    <ResumeBuilder
      resumeId={row.id}
      initial={row.content_json}
      initialTemplate={row.template}
      initialTitle={row.title}
      initialTargetRole={row.target_role}
    />
  );
}
