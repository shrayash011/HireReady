import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { ResumeTemplateView } from "@/components/resume/templates";
import { PrintTrigger } from "@/components/resume/PrintTrigger";
import type { Plan, ResumeContent, ResumeTemplate } from "@/types";

export const metadata = {
  title: "Print resume · HireReady"
};

interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template: ResumeTemplate;
  content_json: ResumeContent;
}

export default async function PrintResumePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;
  if (!userId) redirect("/login");

  const resumeRes = await (supabase.from("resumes") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: ResumeRow | null }>;
      };
    };
  })
    .select("id, user_id, title, template, content_json")
    .eq("id", params.id)
    .maybeSingle();

  const resume = resumeRes.data;
  if (!resume || resume.user_id !== userId) notFound();

  const planRes = await (supabase.from("users") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        maybeSingle: () => Promise<{ data: { plan: Plan } | null }>;
      };
    };
  })
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  const plan: Plan = planRes.data?.plan ?? "free";
  const showWatermark = plan === "free";

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-[8.5in] px-4 py-6 print:p-0">
        <PrintTrigger />

        <div id="resume-print-area" className="rounded-card border border-border bg-white p-4 shadow-inner print:border-0 print:p-0 print:shadow-none">
          <ResumeTemplateView template={resume.template} data={resume.content_json} />
          {showWatermark && (
            <p className="resume-watermark mt-6 text-center text-[10px] text-gray-500">
              Created with HireReady · hireready.com
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
