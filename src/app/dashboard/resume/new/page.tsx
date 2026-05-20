import { redirect } from "next/navigation";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { getAccountSettings } from "@/lib/account-data-server";
import type { ResumeContent } from "@/types";

export const metadata = {
  title: "New resume · HireReady"
};

export default async function NewResumePage() {
  const settings = await getAccountSettings();
  if (!settings) redirect("/login");

  const { profile, defaults } = settings;

  const initial: ResumeContent = {
    personal_info: {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedin_url,
      website: profile.portfolio_url,
      summary: ""
    },
    experiences: [
      {
        company: "",
        role: "",
        location: "",
        start_date: "",
        end_date: "",
        current: false,
        bullets: [""]
      }
    ],
    education: [],
    skills: [],
    languages: [],
    certifications: []
  };

  return (
    <ResumeBuilder
      initial={initial}
      initialTemplate={defaults.default_template}
      initialTargetRole={profile.job_title || null}
    />
  );
}
