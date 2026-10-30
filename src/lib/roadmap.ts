import type { MatchAnalysis } from "./matcher";

export type RoadmapTask = {
  id: string;
  title: string;
  detail: string;
  deadline: string;
};

export type RoadmapPhase = {
  phase: "foundation" | "application" | "preparation";
  days: string;
  title: string;
  focus: string;
  tasks: RoadmapTask[];
};

export type Milestone = {
  title: string;
  skill: string;
  why: string;
  duration: string;
  objectives: string[];
  completion: string;
  resource: string;
};

export type Roadmap = {
  id: string;
  analysisId: string;
  targetRole: string;
  createdAt: string;
  currentPosition: string;
  priorities: { skill: string; priority: "High" | "Medium" | "Low"; why: string }[];
  milestones: Milestone[];
  projects: { name: string; problem: string; skills: string[]; stack: string; outcome: string; portfolioValue: string; difficulty: string }[];
  certifications: { name: string; org: string; skills: string; effort: string; url?: string }[];
  internships: { role: string; skills: string; fit: string; location: string }[];
  interview: { technical: string[]; practical: string[]; behavioural: string[] };
  phases: RoadmapPhase[];
  source: "ai" | "deterministic";
};

const RESOURCE_MAP: Record<string, string> = {
  "Power BI": "Microsoft Learn — Power BI learning path (free)",
  Tableau: "Tableau Public free training videos",
  SQL: "Mode SQL Tutorial / SQLBolt (free, interactive)",
  "Advanced SQL": "Mode Advanced SQL + LeetCode database problems",
  Python: "Python for Everybody (free, Coursera audit)",
  Pandas: "Kaggle Learn — Pandas micro-course (free)",
  "Data Visualization": "Storytelling with Data (book) + practice dashboards",
  "Data Cleaning": "Kaggle Learn — Data Cleaning (free)",
  "Dashboard Development": "Build 2 public dashboards on Tableau Public / Power BI",
  "Business Reporting": "Google Data Analytics capstone-style reporting exercises",
  Statistics: "Khan Academy — Statistics & Probability (free)",
  Excel: "Microsoft Excel skills path / ExcelJet (free)",
  Docker: "Docker official getting-started guide",
  "REST APIs": "freeCodeCamp APIs course (free)",
  React: "react.dev official tutorial",
  default: "Search a highly-rated free course on this skill (Coursera audit / YouTube / official docs)",
};

function resourceFor(skill: string): string {
  return RESOURCE_MAP[skill] ?? RESOURCE_MAP.default;
}

function difficultyFor(i: number): string {
  return i === 0 ? "Beginner-friendly" : i === 1 ? "Intermediate" : "Capstone";
}

/**
 * Deterministic roadmap builder — converts an actual MatchAnalysis into a
 * personalized 90-day plan. Used as fallback when the AI gateway is
 * unavailable, and as the schema the AI output is validated against.
 */
export function buildDeterministicRoadmap(analysis: MatchAnalysis): Roadmap {
  const missing = analysis.missing.map((m) => m.skill);
  const partial = analysis.partial.map((p) => p.skill);
  const demonstrated = analysis.matched.filter((m) => m.evidence === "demonstrated").map((m) => m.skill);

  // Hard skills first — soft-skill gaps are addressed through projects, not courses.
  const hardMissing = analysis.missing.filter((m) => m.category !== "soft");
  const softMissing = analysis.missing.filter((m) => m.category === "soft");
  const priorities = [
    ...hardMissing.slice(0, 3).map((m) => ({ skill: m.skill, priority: "High" as const, why: m.why })),
    ...hardMissing.slice(3).map((m) => ({ skill: m.skill, priority: "Medium" as const, why: m.why })),
    ...analysis.partial.slice(0, 3).map((p) => ({ skill: p.skill, priority: "Medium" as const, why: `You list this without evidence — converting it into proof is a quick win.` })),
    ...analysis.partial.slice(3).map((p) => ({ skill: p.skill, priority: "Low" as const, why: p.why })),
    ...softMissing.map((m) => ({ skill: m.skill, priority: "Low" as const, why: `${m.why} Demonstrate it through team projects and your portfolio narrative.` })),
  ].slice(0, 8);

  const milestoneSkills = [...hardMissing.map((m) => m.skill).slice(0, 4), ...partial.slice(0, 2)];
  const milestones: Milestone[] = milestoneSkills.map((skill, i) => ({
    title: `Master ${skill}`,
    skill,
    why: analysis.missing.find((m) => m.skill === skill)?.why ?? analysis.partial.find((p) => p.skill === skill)?.why ?? "Required by your target role.",
    duration: i < 2 ? "2 weeks" : "1–2 weeks",
    objectives: [
      `Complete a structured beginner course on ${skill}`,
      `Apply ${skill} to a small real dataset or problem`,
      `Explain your ${skill} work clearly in writing`,
    ],
    completion: `You can show one artifact (notebook, dashboard, repo) that uses ${skill} on real data.`,
    resource: resourceFor(skill),
  }));
  milestones.push({
    title: "Portfolio & interview preparation",
    skill: "Career assets",
    why: "Proof beats claims — a polished portfolio converts learning into interviews.",
    duration: "2 weeks",
    objectives: ["Publish 2–3 projects with clear READMEs", "Rewrite resume bullets with metrics", "Practice 10+ role-specific interview questions"],
    completion: "Portfolio link is on your resume and you can walk through every project.",
    resource: "GitHub + a simple personal site (GitHub Pages is free)",
  });

  const projectSeeds = [
    {
      name: `${missing[0] ?? "Analytics"} in action: end-to-end case study`,
      problem: `Take a public dataset (Kaggle/data.gov) and solve a real business question using ${missing[0] ?? "your strongest new skill"}.`,
      skills: [missing[0], partial[0], "Communication"].filter(Boolean) as string[],
      stack: [missing[0], "Python", "SQL"].filter(Boolean).join(", "),
      outcome: "A published case study with a clear question, method, and recommendation.",
      portfolioValue: "Directly evidences the #1 skill this JD asks for.",
    },
    {
      name: `Interactive dashboard: ${analysis.targetRole} KPI tracker`,
      problem: "Build a dashboard that tracks 5–6 KPIs for a domain you care about (sports, finance, campus data).",
      skills: [missing.find((m) => /power bi|tableau|dashboard/i.test(m)) ?? "Data Visualization", "Data Cleaning"].filter(Boolean),
      stack: "Power BI or Tableau Public, Excel/CSV data",
      outcome: "A shareable dashboard link you can put on your resume.",
      portfolioValue: "Proves dashboard development — a core requirement of this role.",
    },
    {
      name: "SQL deep-dive: analytics query pack",
      problem: "Solve 25 progressively harder SQL problems (joins, window functions, CTEs) and document your approach.",
      skills: ["SQL", "Advanced SQL"].filter((s) => missing.includes(s) || partial.includes(s) || true),
      stack: "PostgreSQL or MySQL, a public dataset",
      outcome: "A GitHub repo of annotated queries showing growth from basics to advanced.",
      portfolioValue: "Interview-ready SQL proof; doubles as interview prep.",
    },
  ];
  const projects = projectSeeds.map((p, i) => ({ ...p, difficulty: difficultyFor(i) }));

  const certifications = [
    { name: "Google Data Analytics Professional Certificate", org: "Google / Coursera", skills: "SQL, spreadsheets, data cleaning, visualization, R basics", effort: "~6 months at 10h/week (financial aid available)", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
    { name: "Microsoft PL-300: Power BI Data Analyst", org: "Microsoft", skills: "Power BI, data modeling, dashboard development", effort: "40–60 hours prep + exam", url: "https://learn.microsoft.com/credentials/certifications/data-analyst-associate/" },
    { name: "IBM Data Analyst Professional Certificate", org: "IBM / Coursera", skills: "Python, SQL, Excel, Cognos, dashboards", effort: "~3 months at 10h/week", url: "https://www.coursera.org/professional-certificates/ibm-data-analyst" },
  ];

  const internships = [
    { role: `Data Analyst Intern (remote)`, skills: "SQL, Excel, dashboards", fit: "Applies your strongest matched skills while you close the BI gap.", location: "Remote — sample listing" },
    { role: "Business Intelligence Intern", skills: "Power BI, reporting", fit: "Directly builds the dashboard-development evidence this JD wants.", location: "Hybrid — sample listing" },
    { role: "Analytics Volunteer / Open-data contributor", skills: "Python, data cleaning", fit: "Real-world messy data experience you can start this week, no application needed.", location: "Remote — sample listing" },
  ];

  const interview = {
    technical: [
      "Write a SQL query to find the top 3 products by revenue per region.",
      "Explain the difference between a LEFT JOIN and an INNER JOIN with an example.",
      "How would you handle missing values in a dataset before analysis?",
      "What is the difference between correlation and causation? Give a business example.",
      "Walk me through how you would design a dashboard for weekly sales reporting.",
    ],
    practical: [
      "Given this messy CSV, outline your data-cleaning steps live.",
      "Build a quick chart from this dataset and explain what insight it shows.",
      "How would you measure whether a new feature launch was successful?",
    ],
    behavioural: [
      "Tell me about a time you explained a technical finding to a non-technical audience.",
      "Describe a project where you had to learn a new tool quickly.",
      "Tell me about a time your analysis was challenged — how did you respond?",
    ],
  };

  const highPriority = priorities.filter((p) => p.priority === "High").map((p) => p.skill);
  const phases: RoadmapPhase[] = [
    {
      phase: "foundation",
      days: "Days 1–30",
      title: "Foundation",
      focus: `Close the high-priority gaps: ${highPriority.slice(0, 3).join(", ") || "core role skills"}.`,
      tasks: [
        { id: "p1-t1", title: `Complete a structured course on ${highPriority[0] ?? "your top missing skill"}`, detail: resourceFor(highPriority[0] ?? ""), deadline: "Day 10" },
        { id: "p1-t2", title: `Hands-on practice: ${highPriority[0] ?? "top skill"} exercises daily (45 min)`, detail: "Consistency beats intensity — log your practice.", deadline: "Day 14" },
        { id: "p1-t3", title: `Start ${highPriority[1] ?? "second missing skill"} fundamentals`, detail: resourceFor(highPriority[1] ?? ""), deadline: "Day 21" },
        { id: "p1-t4", title: "Self-assessment: explain both skills aloud in 2 minutes each", detail: "If you can't explain it simply, revisit the material.", deadline: "Day 30" },
      ],
    },
    {
      phase: "application",
      days: "Days 31–60",
      title: "Practical Application",
      focus: "Turn learning into proof: ship projects and publish them.",
      tasks: [
        { id: "p2-t1", title: `Build project #1: ${projectSeeds[0].name}`, detail: projectSeeds[0].problem, deadline: "Day 42" },
        { id: "p2-t2", title: `Build project #2: ${projectSeeds[1].name}`, detail: projectSeeds[1].problem, deadline: "Day 52" },
        { id: "p2-t3", title: "Publish both on GitHub with clear READMEs (problem, approach, outcome)", detail: "Add screenshots and a live link where possible.", deadline: "Day 56" },
        { id: "p2-t4", title: "Peer review: get feedback from one community (Discord, Reddit, campus club)", detail: "External feedback catches blind spots.", deadline: "Day 60" },
      ],
    },
    {
      phase: "preparation",
      days: "Days 61–90",
      title: "Career Preparation",
      focus: "Convert proof into interviews and offers.",
      tasks: [
        { id: "p3-t1", title: "Rewrite resume: lead with matched skills, add new projects with metrics", detail: "Mirror the JD's exact terminology honestly.", deadline: "Day 68" },
        { id: "p3-t2", title: "Complete 4 mock interviews (2 technical, 2 behavioural)", detail: "Use the question bank in your roadmap.", deadline: "Day 78" },
        { id: "p3-t3", title: "Apply to 15–20 internships/junior roles per week", detail: "Track applications in a sheet; follow up after 5 days.", deadline: "Day 85" },
        { id: "p3-t4", title: "Final review: re-run your resume against the JD in Gradion", detail: "Measure how far your match score has moved.", deadline: "Day 90" },
      ],
    },
  ];

  return {
    id: crypto.randomUUID(),
    analysisId: analysis.id,
    targetRole: analysis.targetRole,
    createdAt: new Date().toISOString(),
    currentPosition: `You already bring ${demonstrated.length ? `demonstrated strength in ${demonstrated.slice(0, 3).join(", ")}` : "a solid academic foundation"}, with a ${analysis.matchScore}/100 match for ${analysis.targetRole}. Your fastest gains come from closing ${missing.slice(0, 2).join(" and ") || "the remaining gaps"} and converting listed skills into evidence.`,
    priorities,
    milestones,
    projects,
    certifications,
    internships,
    interview,
    phases,
    source: "deterministic",
  };
}
