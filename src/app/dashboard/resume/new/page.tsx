"use client";

import { useState } from "react";
import type { Experience, ResumeContent, ResumeTemplate } from "@/types";
import { StepIndicator } from "@/components/resume/StepIndicator";
import { ATSScorePanel } from "@/components/resume/ATSScorePanel";
import { Step1Personal } from "@/components/resume/steps/Step1Personal";
import { Step2Experience } from "@/components/resume/steps/Step2Experience";
import { Step3EducationSkills } from "@/components/resume/steps/Step3EducationSkills";
import { Step4Tailor } from "@/components/resume/steps/Step4Tailor";
import { Step5Template } from "@/components/resume/steps/Step5Template";
import { Step6Preview } from "@/components/resume/steps/Step6Preview";

const TOTAL_STEPS = 6;

function emptyResume(): ResumeContent {
  return {
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
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
}

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState<ResumeContent>(emptyResume);
  const [template, setTemplate] = useState<ResumeTemplate>("clean");
  const [jobDescription, setJobDescription] = useState("");

  const updatePersonal = (patch: Partial<ResumeContent["personal_info"]>) =>
    setResume((r) => ({ ...r, personal_info: { ...r.personal_info, ...patch } }));

  const updateExperiences = (experiences: Experience[]) =>
    setResume((r) => ({ ...r, experiences }));

  const patchResume = (patch: Partial<ResumeContent>) =>
    setResume((r) => ({ ...r, ...patch }));

  const applyTailored = (tailored: ResumeContent) => {
    setResume(tailored);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="resume-builder-shell mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1 print:hidden">
          <span className="text-xs uppercase tracking-widest text-text-muted">Resume builder</span>
          <h1 className="text-3xl font-semibold">Build your resume</h1>
        </header>

        <div className="print:hidden">
          <StepIndicator current={step} onJump={setStep} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="rounded-card border border-border bg-card p-6 print:border-0 print:bg-white print:p-0">
            {step === 0 && <Step1Personal data={resume} onChange={updatePersonal} />}
            {step === 1 && <Step2Experience data={resume} onChange={updateExperiences} />}
            {step === 2 && <Step3EducationSkills data={resume} onChange={patchResume} />}
            {step === 3 && (
              <Step4Tailor
                data={resume}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onApply={applyTailored}
              />
            )}
            {step === 4 && (
              <Step5Template data={resume} template={template} onChange={setTemplate} />
            )}
            {step === 5 && <Step6Preview data={resume} template={template} />}

            <div className="mt-8 flex items-center justify-between border-t border-border pt-5 print:hidden">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-input border border-border bg-surface px-4 py-2 text-sm text-text-muted hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ← Back
              </button>
              <span className="text-xs text-text-muted">Step {step + 1} of {TOTAL_STEPS}</span>
              <button
                type="button"
                disabled={step === TOTAL_STEPS - 1}
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
                className="rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </main>

          <div className="print:hidden">
            <ATSScorePanel resume={resume} jobDescription={jobDescription} />
          </div>
        </div>
      </div>
    </div>
  );
}
