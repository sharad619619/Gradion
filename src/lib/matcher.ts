import { SKILLS, extractSkills, extractKeywords, findSkill, type SkillDef } from "./skills";

export type SkillEvidence = "demonstrated" | "mentioned" | "related" | "missing";

export type SkillMatch = {
  skill: string;
  category: string;
  evidence: SkillEvidence;
  evidenceNote: string;
  why: string;
  action: string;
};

export type Subscores = {
  technical: number;
  experience: number;
  projects: number;
  education: number;
  soft: number;
};

export type MatchAnalysis = {
  id: string;
  createdAt: string;
  targetRole: string;
  matchScore: number;
  matchLabel: string;
  interpretation: string;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
  experienceGaps: string[];
  educationAlignment: string;
  keywords: { term: string; found: boolean }[];
  suggestions: string[];
  subscores: Subscores;
  resumeText: string;
  jobDescription: string;
  source: "ai" | "deterministic";
};

export const SCORE_WEIGHTS = {
  technical: 0.4,
  experience: 0.25,
  projects: 0.15,
  education: 0.1,
  soft: 0.1,
} as const;

export function matchLabel(score: number): string {
  if (score >= 90) return "Excellent Alignment";
  if (score >= 75) return "Strong Alignment";
  if (score >= 60) return "Moderate Alignment";
  if (score >= 40) return "Developing Alignment";
  return "Significant Skill Gap";
}

export function interpretScore(score: number): string {
  if (score >= 90) return "Your resume aligns exceptionally well with this role. Focus on interview preparation and proof of depth.";
  if (score >= 75) return "You are a strong match. Closing one or two gaps could make you a top-tier candidate.";
  if (score >= 60) return "You have a workable foundation. A focused 60–90 day plan can close the remaining gap.";
  if (score >= 40) return "Some core requirements are missing, but the path is clear. Structured upskilling will move you quickly.";
  return "There is a significant gap today — which is exactly what a roadmap is for. Start with the high-priority skills.";
}

const EVIDENCE_WORDS = /project|built|build|developed|created|implemented|designed|led|internship|interned|deployed|analyzed|analysed|automated|achieved|improved|reduced|increased|organized|organised|tutored|tutor|volunteered|taught|presented|workshop|mentored|won|member|club/i;

/** Strongest mention of a skill in the text: an evidence-backed sentence beats a bare listing. */
function bestSentence(text: string, skill: SkillDef): { sentence: string; demonstrated: boolean } | null {
  const sentences = text.split(/(?<=[.!?\n])/);
  let first: string | null = null;
  for (const s of sentences) {
    if (!findSkill(s, skill)) continue;
    const clean = s.trim().slice(0, 220);
    if (!first) first = clean;
    if (EVIDENCE_WORDS.test(s)) return { sentence: clean, demonstrated: true };
  }
  return first ? { sentence: first, demonstrated: false } : null;
}

function classifyEvidence(resumeText: string, skill: SkillDef): { evidence: SkillEvidence; note: string } {
  const hit = bestSentence(resumeText, skill);
  if (!hit) return { evidence: "missing", note: "Not found in resume." };
  if (hit.demonstrated) {
    return { evidence: "demonstrated", note: `Backed by evidence: “${hit.sentence}”` };
  }
  return { evidence: "mentioned", note: "Listed in the resume without supporting project or experience evidence." };
}

function countProjects(resumeText: string): number {
  const matches = resumeText.match(/project[s]?\b/gi) ?? [];
  const sectioned = resumeText.match(/projects?\s*[:\-]/gi) ?? [];
  const bulletish = (resumeText.match(/(^|\n)\s*[-•*]/g) ?? []).length;
  return Math.max(sectioned.length ? Math.min(matches.length, 6) : 0, Math.min(Math.floor(bulletish / 3), 4), matches.length ? 1 : 0);
}

function detectExperience(resumeText: string): { internships: boolean; work: boolean; years: number } {
  const internships = /intern(ship)?(ed)?\b/i.test(resumeText);
  const work = /(work experience|employed|full[- ]time|part[- ]time|freelance|position|role at|company)/i.test(resumeText);
  const yearsMatch = resumeText.match(/(\d+)\s*\+?\s*years?/i);
  return { internships, work, years: yearsMatch ? parseInt(yearsMatch[1], 10) : 0 };
}

function detectEducation(resumeText: string): string {
  const m = resumeText.match(/(ph\.?d|doctorate|master'?s?|m\.?tech|m\.?sc|mba|mca|bachelor'?s?|b\.?tech|b\.?sc|b\.?e\.?|bca|b\.?com|degree|diploma)[^\n.]*/i);
  return m ? m[0].trim().slice(0, 120) : "";
}

function jdRequiresExperience(jd: string): { years: number; internshipOk: boolean } {
  const yearsMatch = jd.match(/(\d+)\s*\+?\s*years?/i);
  const internshipOk = /intern|entry[- ]level|junior|fresher|graduate/i.test(jd);
  return { years: yearsMatch ? parseInt(yearsMatch[1], 10) : 0, internshipOk };
}

/**
 * Deterministic, transparent resume–JD matching engine.
 * Weights: technical 40%, experience 25%, projects 15%, education 10%, soft 10%.
 */
export function analyzeMatch(input: {
  resumeText: string;
  jobDescription: string;
  targetRole: string;
}): MatchAnalysis {
  const { resumeText, jobDescription, targetRole } = input;
  const jdSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  const resumeNames = new Set(resumeSkills.map((s) => s.name));
  const jdNames = new Set(jdSkills.map((s) => s.name));

  const matched: SkillMatch[] = [];
  const partial: SkillMatch[] = [];
  const missing: SkillMatch[] = [];

  for (const skill of jdSkills) {
    if (resumeNames.has(skill.name)) {
      const { evidence, note } = classifyEvidence(resumeText, skill);
      if (evidence === "demonstrated") {
        matched.push({ skill: skill.name, category: skill.category, evidence, evidenceNote: note, why: skill.why, action: "Keep it prominent — quantify the impact (numbers, outcomes)." });
      } else {
        partial.push({ skill: skill.name, category: skill.category, evidence, evidenceNote: note, why: skill.why, action: "Add proof: a project, metric, or internship example showing this skill in action." });
      }
    } else {
      missing.push({
        skill: skill.name,
        category: skill.category,
        evidence: "missing",
        evidenceNote: "Required by the job description, not found in your resume.",
        why: skill.why,
        action: `Prioritize learning ${skill.name} — see your roadmap for a sequenced plan.`,
      });
    }
  }

  // --- Subscores ---
  const jdTechnical = jdSkills.filter((s) => s.category !== "soft");
  const jdSoft = jdSkills.filter((s) => s.category === "soft");
  const techScore = jdTechnical.length
    ? (jdTechnical.filter((s) => matched.some((m) => m.skill === s.name)).length +
        0.5 * jdTechnical.filter((s) => partial.some((p) => p.skill === s.name)).length) /
      jdTechnical.length
    : 0.6;
  const softScore = jdSoft.length
    ? (jdSoft.filter((s) => resumeNames.has(s.name)).length + 0.5 * jdSoft.filter((s) => partial.some((p) => p.skill === s.name)).length) /
      jdSoft.length
    : Math.min(resumeSkills.filter((s) => s.category === "soft").length / 3, 1);

  const exp = detectExperience(resumeText);
  const jdExp = jdRequiresExperience(jobDescription);
  let experienceScore: number;
  if (jdExp.years > 0) {
    experienceScore = Math.min(exp.years / jdExp.years, 1) * 0.7 + (exp.work ? 0.3 : exp.internships ? 0.15 : 0);
  } else if (jdExp.internshipOk) {
    experienceScore = (exp.internships ? 0.6 : 0.25) + (exp.work ? 0.4 : 0);
  } else {
    experienceScore = (exp.work ? 0.6 : 0.2) + (exp.internships ? 0.4 : 0);
  }
  experienceScore = Math.min(experienceScore, 1);

  const projectCount = countProjects(resumeText);
  const demonstratedCount = matched.length;
  const projectsScore = Math.min(projectCount / 3, 1) * 0.5 + Math.min(demonstratedCount / Math.max(jdTechnical.length, 1), 1) * 0.5;

  const education = detectEducation(resumeText);
  const jdEdu = detectEducation(jobDescription);
  let educationScore = 0.5;
  let educationAlignment: string;
  if (education && jdEdu) {
    const sameLevel =
      (/bachelor|b\.tech|b\.sc|b\.e\.|bca|b\.com/i.test(education) && /bachelor|b\.tech|b\.sc|b\.e\.|bca|b\.com|degree/i.test(jdEdu)) ||
      (/master|m\.tech|m\.sc|mba|mca/i.test(education) && /master|m\.tech|m\.sc|mba|mca/i.test(jdEdu));
    educationScore = sameLevel ? 0.95 : 0.65;
    educationAlignment = sameLevel
      ? `Your education (“${education}”) aligns with the level this role asks for.`
      : `Your education (“${education}”) is close to, but not exactly, the stated requirement (“${jdEdu}”). Compensate with projects and certifications.`;
  } else if (education) {
    educationScore = 0.8;
    educationAlignment = `Your education (“${education}”) satisfies typical expectations for this kind of role; the JD states no specific degree requirement.`;
  } else {
    educationScore = 0.45;
    educationAlignment = "No clear education section was detected in the resume. Add your degree, institution and graduation year — recruiters filter on this.";
  }

  const subscores: Subscores = {
    technical: Math.round(techScore * 100),
    experience: Math.round(experienceScore * 100),
    projects: Math.round(projectsScore * 100),
    education: Math.round(educationScore * 100),
    soft: Math.round(softScore * 100),
  };

  const matchScore = Math.max(
    5,
    Math.min(
      98,
      Math.round(
        subscores.technical * SCORE_WEIGHTS.technical +
          subscores.experience * SCORE_WEIGHTS.experience +
          subscores.projects * SCORE_WEIGHTS.projects +
          subscores.education * SCORE_WEIGHTS.education +
          subscores.soft * SCORE_WEIGHTS.soft,
      ),
    ),
  );

  // --- Experience gaps ---
  const experienceGaps: string[] = [];
  if (!exp.internships && jdExp.internshipOk) experienceGaps.push("No internship experience detected — even one short internship materially improves your candidacy.");
  if (!exp.work && jdExp.years > 0) experienceGaps.push(`The JD asks for ~${jdExp.years}+ year(s) of experience; your resume shows none. Target internships or contract work first.`);
  if (projectCount < 2) experienceGaps.push("Few portfolio projects detected. Two to three well-documented projects are the fastest credibility builder.");
  if (!/github|portfolio|kaggle|behance|link\b/i.test(resumeText)) experienceGaps.push("No portfolio link (GitHub, Kaggle, personal site) found — add one near your name.");
  if (experienceGaps.length === 0) experienceGaps.push("No major experience gaps detected. Focus on deepening evidence for your strongest skills.");

  // --- Keywords ---
  const keywords = extractKeywords(jobDescription)
    .filter((k) => !jdNames.has(k))
    .slice(0, 10)
    .map((term) => ({ term, found: resumeText.toLowerCase().includes(term) }));

  // --- Suggestions ---
  const suggestions: string[] = [];
  if (partial.length > 0)
    suggestions.push(`You list ${partial.slice(0, 3).map((p) => p.skill).join(", ")} without evidence — add one concrete project or metric for each.`);
  if (missing.length > 0)
    suggestions.push(`Mirror the JD's language: once you have genuine exposure to ${missing.slice(0, 2).map((m) => m.skill).join(" and ")}, name them exactly as the JD does.`);
  if (projectCount < 2) suggestions.push("Add a dedicated Projects section with 2–3 entries: problem, approach, tools, and a measurable outcome.");
  if (!/\d+%|\d+x|\$\d|saved|grew|reduced|improved/i.test(resumeText)) suggestions.push("Quantify impact — numbers (%, time saved, users) make skills believable.");
  if (resumeText.length < 900) suggestions.push("Your resume text is short; a fuller one-page resume gives matchers (human and AI) more signal.");
  suggestions.push("Tailor the top third of your resume to this specific role: lead with the matched skills the JD emphasizes.");
  if (suggestions.length < 4) suggestions.push("Keep formatting simple: standard headings, no tables or graphics that parsers can't read.");

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    targetRole,
    matchScore,
    matchLabel: matchLabel(matchScore),
    interpretation: interpretScore(matchScore),
    matched,
    partial,
    missing,
    experienceGaps,
    educationAlignment,
    keywords,
    suggestions: suggestions.slice(0, 6),
    subscores,
    resumeText,
    jobDescription,
    source: "deterministic",
  };
}

/** All skills in the taxonomy, for target-role skill pickers. */
export { SKILLS, findSkill };
