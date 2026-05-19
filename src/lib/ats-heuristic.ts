import type { ResumeContent } from "@/types";

const STRONG_VERBS = new Set([
  "led", "built", "shipped", "launched", "architected", "designed", "drove",
  "owned", "delivered", "scaled", "reduced", "increased", "cut", "grew",
  "automated", "migrated", "negotiated", "managed", "mentored", "founded",
  "spearheaded", "orchestrated", "streamlined", "transformed", "implemented",
  "developed", "created", "established", "improved", "optimized", "accelerated",
  "expanded", "generated", "saved", "boosted", "tripled", "doubled", "achieved"
]);

const WEAK_OPENERS = [
  "responsible for", "duties included", "tasked with", "worked on",
  "helped with", "assisted", "participated in", "involved in"
];

const NUMBER_RE = /\b\d+(?:[.,]\d+)?\s*(?:%|k|m|b|x|hrs?|hours?|days?|weeks?|months?|years?|users?|customers?|clients?|reports?|engineers?|people)?\b/i;
const HARD_NUMBER_RE = /\b\d+(?:[.,]\d+)?\b/;

export interface HeuristicResult {
  score: number;
  band: "red" | "amber" | "green" | "exceptional";
  fixes: { id: string; label: string; severity: "high" | "med" | "low" }[];
  stats: {
    bulletsTotal: number;
    bulletsWithMetrics: number;
    bulletsWithWeakOpener: number;
    bulletsWithWeakVerb: number;
    skillsCount: number;
    keywordOverlap?: number;
    keywordsMatched?: string[];
    keywordsMissing?: string[];
  };
}

export function bandForScore(score: number): HeuristicResult["band"] {
  if (score >= 90) return "exceptional";
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "red";
}

export function colorForBand(band: HeuristicResult["band"]): string {
  switch (band) {
    case "red": return "#EF4444";
    case "amber": return "#F59E0B";
    case "green": return "#22C55E";
    case "exceptional": return "#6366F1";
  }
}

/** Extract candidate keywords from a job description. Crude but useful. */
export function extractJDKeywords(jd: string): string[] {
  if (!jd) return [];
  const tokens = jd
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && t.length <= 30);

  const stopwords = new Set([
    "the", "and", "for", "with", "you", "are", "our", "your", "from", "have",
    "will", "this", "that", "they", "their", "them", "but", "not", "all", "any",
    "can", "able", "across", "about", "into", "such", "well", "more", "must",
    "should", "would", "could", "team", "work", "role", "join", "looking",
    "experience", "years", "year", "skills", "ability", "etc", "including",
    "based", "company", "world", "make", "help", "build", "use", "using"
  ]);

  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (stopwords.has(t)) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([w]) => w);
}

export function scoreResumeHeuristic(
  resume: ResumeContent,
  jobDescription?: string
): HeuristicResult {
  const fixes: HeuristicResult["fixes"] = [];
  const allBullets = resume.experiences.flatMap((e) => e.bullets ?? []);
  const bulletsTotal = allBullets.length;

  let bulletsWithMetrics = 0;
  let bulletsWithWeakOpener = 0;
  let bulletsWithWeakVerb = 0;

  for (const b of allBullets) {
    const lower = b.toLowerCase().trim();
    if (NUMBER_RE.test(b) || HARD_NUMBER_RE.test(b)) bulletsWithMetrics++;
    if (WEAK_OPENERS.some((w) => lower.startsWith(w))) bulletsWithWeakOpener++;
    const firstWord = lower.split(/\s+/)[0]?.replace(/[^a-z]/g, "") ?? "";
    if (firstWord && !STRONG_VERBS.has(firstWord)) bulletsWithWeakVerb++;
  }

  // Start at 50 and adjust based on signals.
  let score = 50;

  // Completeness signals
  if (resume.personal_info.full_name) score += 3;
  if (resume.personal_info.email) score += 2;
  if (resume.personal_info.phone) score += 1;
  if (resume.personal_info.summary && resume.personal_info.summary.length > 60) score += 4;
  else fixes.push({ id: "summary", label: "Add a 2–3 line professional summary", severity: "med" });

  if (resume.experiences.length === 0) {
    fixes.push({ id: "no-exp", label: "Add at least one work experience", severity: "high" });
    score -= 20;
  }
  if (resume.education.length === 0) {
    fixes.push({ id: "no-edu", label: "Add your education", severity: "low" });
  }
  if (resume.skills.length < 5) {
    fixes.push({ id: "skills-thin", label: "Add at least 5 skills (you have " + resume.skills.length + ")", severity: "med" });
  } else {
    score += 4;
  }

  // Bullet quality
  if (bulletsTotal > 0) {
    const metricRatio = bulletsWithMetrics / bulletsTotal;
    score += Math.round(metricRatio * 20);
    if (metricRatio < 0.4) {
      fixes.push({
        id: "metrics",
        label: `Quantify more bullets — only ${bulletsWithMetrics}/${bulletsTotal} have numbers`,
        severity: "high"
      });
    }

    if (bulletsWithWeakOpener > 0) {
      fixes.push({
        id: "weak-opener",
        label: `Rewrite ${bulletsWithWeakOpener} bullet${bulletsWithWeakOpener > 1 ? "s" : ""} starting with "Responsible for" / "Worked on"`,
        severity: "high"
      });
      score -= bulletsWithWeakOpener * 2;
    }

    const weakVerbRatio = bulletsWithWeakVerb / bulletsTotal;
    if (weakVerbRatio > 0.5) {
      fixes.push({
        id: "weak-verbs",
        label: "Start more bullets with strong action verbs (Led, Shipped, Reduced…)",
        severity: "med"
      });
      score -= 5;
    }
  } else {
    fixes.push({ id: "no-bullets", label: "Add bullet points under each experience", severity: "high" });
  }

  // JD keyword overlap
  let keywordOverlap: number | undefined;
  let matched: string[] | undefined;
  let missing: string[] | undefined;
  if (jobDescription && jobDescription.trim().length > 30) {
    const jdKeywords = extractJDKeywords(jobDescription);
    const resumeText = [
      resume.personal_info.summary ?? "",
      ...resume.skills,
      ...allBullets,
      ...resume.experiences.map((e) => `${e.role} ${e.company}`)
    ].join(" ").toLowerCase();

    const m: string[] = [];
    const x: string[] = [];
    for (const k of jdKeywords) {
      if (resumeText.includes(k)) m.push(k);
      else x.push(k);
    }
    keywordOverlap = jdKeywords.length ? m.length / jdKeywords.length : 0;
    matched = m.slice(0, 12);
    missing = x.slice(0, 10);

    score += Math.round(keywordOverlap * 15);
    if (keywordOverlap < 0.4) {
      fixes.push({
        id: "kw-low",
        label: `Add JD keywords: ${missing.slice(0, 4).join(", ")}…`,
        severity: "high"
      });
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    band: bandForScore(score),
    fixes: fixes.slice(0, 8),
    stats: {
      bulletsTotal,
      bulletsWithMetrics,
      bulletsWithWeakOpener,
      bulletsWithWeakVerb,
      skillsCount: resume.skills.length,
      keywordOverlap,
      keywordsMatched: matched,
      keywordsMissing: missing
    }
  };
}
