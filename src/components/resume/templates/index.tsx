import type { ResumeContent, ResumeTemplate } from "@/types";
import { CleanTemplate } from "./CleanTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";

export function ResumeTemplateView({
  template,
  data
}: {
  template: ResumeTemplate;
  data: ResumeContent;
}) {
  switch (template) {
    case "modern": return <ModernTemplate data={data} />;
    case "executive": return <ExecutiveTemplate data={data} />;
    case "clean":
    default: return <CleanTemplate data={data} />;
  }
}

export const TEMPLATES: { id: ResumeTemplate; name: string; description: string }[] = [
  { id: "clean", name: "Clean", description: "Single-column, maximum ATS compatibility. The safe default." },
  { id: "modern", name: "Modern", description: "Indigo accents, slightly more visual hierarchy. Still ATS-safe." },
  { id: "executive", name: "Executive", description: "Serif, centered, traditional. For senior leadership roles." }
];
