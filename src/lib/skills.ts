export type SkillCategory = "technical" | "tool" | "soft";

export type SkillDef = {
  name: string;
  aliases: string[];
  category: SkillCategory;
  group: string;
  why: string;
};

/**
 * Canonical skill taxonomy used by the matching engine.
 * Aliases are matched case-insensitively with word boundaries.
 */
export const SKILLS: SkillDef[] = [
  // --- Data group ---
  { name: "SQL", aliases: ["sql", "structured query language", "mysql", "postgresql", "postgres"], category: "technical", group: "data", why: "Querying and shaping data is the daily core of analytical roles." },
  { name: "Advanced SQL", aliases: ["advanced sql", "window functions", "ctes", "query optimization"], category: "technical", group: "data", why: "Employers expect beyond-basic querying: window functions, CTEs and optimization." },
  { name: "Python", aliases: ["python", "python3"], category: "technical", group: "data", why: "Python is the default language for data analysis and automation." },
  { name: "Pandas", aliases: ["pandas", "numpy"], category: "tool", group: "data", why: "Pandas is the standard toolkit for data wrangling in Python." },
  { name: "Excel", aliases: ["excel", "ms excel", "microsoft excel", "spreadsheets", "google sheets"], category: "tool", group: "data", why: "Excel remains the most common business analysis tool." },
  { name: "Power BI", aliases: ["power bi", "powerbi"], category: "tool", group: "data", why: "Power BI is a top dashboarding requirement in analyst job descriptions." },
  { name: "Tableau", aliases: ["tableau"], category: "tool", group: "data", why: "Tableau is a widely requested visualization platform." },
  { name: "Statistics", aliases: ["statistics", "statistical analysis", "statistical methods", "hypothesis testing"], category: "technical", group: "data", why: "Statistical thinking underpins credible analysis and A/B testing." },
  { name: "Data Visualization", aliases: ["data visualization", "data visualisation", "visualization", "visualizations", "visualising data", "visualizing data", "matplotlib", "charts", "storytelling with data"], category: "technical", group: "data", why: "Turning numbers into clear visuals is how analysts create impact." },
  { name: "Data Cleaning", aliases: ["data cleaning", "data cleansing", "data wrangling", "data preprocessing", "data preparation"], category: "technical", group: "data", why: "Most real-world data is messy; cleaning it is a core job expectation." },
  { name: "Dashboard Development", aliases: ["dashboard development", "dashboarding", "building dashboards", "dashboard creation", "interactive dashboards"], category: "technical", group: "data", why: "Dashboards are the primary deliverable of most analyst roles." },
  { name: "Business Reporting", aliases: ["business reporting", "reporting", "business reports", "management reporting"], category: "technical", group: "data", why: "Stakeholders rely on accurate, repeatable reporting." },
  { name: "ETL", aliases: ["etl", "data pipelines", "data pipeline", "data extraction"], category: "technical", group: "data", why: "Moving data from sources to warehouses is a key responsibility." },
  { name: "Machine Learning", aliases: ["machine learning", "ml", "scikit-learn", "scikit learn", "predictive modeling"], category: "technical", group: "data", why: "ML literacy is increasingly expected even in analyst roles." },
  { name: "A/B Testing", aliases: ["a/b testing", "ab testing", "experimentation"], category: "technical", group: "data", why: "Experiment design is a hallmark of mature data teams." },

  // --- Engineering group ---
  { name: "JavaScript", aliases: ["javascript", "js", "es6"], category: "technical", group: "engineering", why: "JavaScript powers the modern web." },
  { name: "TypeScript", aliases: ["typescript", "ts"], category: "technical", group: "engineering", why: "TypeScript is the default for serious frontend and Node codebases." },
  { name: "React", aliases: ["react", "react.js", "reactjs"], category: "technical", group: "engineering", why: "React is the most requested frontend framework." },
  { name: "Node.js", aliases: ["node", "node.js", "nodejs", "express"], category: "technical", group: "engineering", why: "Node.js is a common backend runtime for product teams." },
  { name: "Git", aliases: ["git", "github", "gitlab", "version control"], category: "tool", group: "engineering", why: "Version control is non-negotiable in team environments." },
  { name: "REST APIs", aliases: ["rest api", "rest apis", "restful", "api development", "api integration"], category: "technical", group: "engineering", why: "Building and consuming APIs is a daily engineering task." },
  { name: "Docker", aliases: ["docker", "containers", "containerization"], category: "tool", group: "engineering", why: "Containers are how modern software ships." },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "tool", group: "engineering", why: "Kubernetes dominates container orchestration." },
  { name: "CI/CD", aliases: ["ci/cd", "cicd", "continuous integration", "continuous deployment", "github actions"], category: "technical", group: "engineering", why: "Automated pipelines are standard practice in professional teams." },
  { name: "Testing", aliases: ["unit testing", "testing", "jest", "pytest", "test driven", "tdd"], category: "technical", group: "engineering", why: "Employers expect code that is verified, not just written." },
  { name: "Java", aliases: ["java "], category: "technical", group: "engineering", why: "Java remains a staple of enterprise backends." },
  { name: "C++", aliases: ["c++", "cpp"], category: "technical", group: "engineering", why: "C++ is valued for performance-critical systems." },
  { name: "HTML/CSS", aliases: ["html", "css", "html5", "css3", "tailwind"], category: "technical", group: "engineering", why: "Markup and styling are the foundation of the web." },
  { name: "Data Structures & Algorithms", aliases: ["data structures", "algorithms", "dsa"], category: "technical", group: "engineering", why: "DSA is the gateway skill for technical interviews." },

  // --- Cloud group ---
  { name: "AWS", aliases: ["aws", "amazon web services"], category: "tool", group: "cloud", why: "AWS is the largest cloud platform in job listings." },
  { name: "Azure", aliases: ["azure", "microsoft azure"], category: "tool", group: "cloud", why: "Azure is dominant in enterprise environments." },
  { name: "Google Cloud", aliases: ["gcp", "google cloud"], category: "tool", group: "cloud", why: "GCP is common in data-heavy organizations." },
  { name: "Cloud Computing", aliases: ["cloud computing", "cloud platforms", "cloud services"], category: "technical", group: "cloud", why: "Cloud fluency is now a baseline expectation." },
  { name: "Linux", aliases: ["linux", "bash", "shell scripting", "unix"], category: "technical", group: "cloud", why: "Most servers run Linux; comfort there is assumed." },
  { name: "Networking", aliases: ["networking", "tcp/ip", "dns"], category: "technical", group: "cloud", why: "Networking fundamentals underpin cloud and security work." },
  { name: "Terraform", aliases: ["terraform", "infrastructure as code", "iac"], category: "tool", group: "cloud", why: "Infrastructure as code is how modern teams manage cloud." },

  // --- Design group ---
  { name: "Figma", aliases: ["figma"], category: "tool", group: "design", why: "Figma is the industry-standard design tool." },
  { name: "Wireframing", aliases: ["wireframing", "wireframes", "lo-fi"], category: "technical", group: "design", why: "Wireframes communicate structure before polish." },
  { name: "Prototyping", aliases: ["prototyping", "prototype", "interactive prototype"], category: "technical", group: "design", why: "Prototypes validate ideas before engineering invests." },
  { name: "Usability Testing", aliases: ["usability testing", "user testing", "ux research"], category: "technical", group: "design", why: "Evidence-based design beats opinion-based design." },
  { name: "Design Systems", aliases: ["design systems", "design system", "component library"], category: "technical", group: "design", why: "Systems thinking scales design across products." },

  // --- Marketing group ---
  { name: "SEO", aliases: ["seo", "search engine optimization"], category: "technical", group: "marketing", why: "Organic search is a primary growth channel." },
  { name: "Google Ads", aliases: ["google ads", "adwords", "ppc", "paid search"], category: "tool", group: "marketing", why: "Paid acquisition skills are directly revenue-linked." },
  { name: "Content Writing", aliases: ["content writing", "copywriting", "content creation"], category: "technical", group: "marketing", why: "Clear writing drives every marketing channel." },
  { name: "Email Marketing", aliases: ["email marketing", "newsletter", "crm campaigns"], category: "technical", group: "marketing", why: "Lifecycle email remains the highest-ROI channel." },
  { name: "Marketing Analytics", aliases: ["marketing analytics", "google analytics", "ga4"], category: "technical", group: "marketing", why: "Measurement separates marketers from guessers." },

  // --- Soft skills ---
  { name: "Communication", aliases: ["communication", "communication skills", "verbal communication", "written communication", "presentation skills", "presenting"], category: "soft", group: "soft", why: "Analysis only matters if you can explain it." },
  { name: "Teamwork", aliases: ["teamwork", "collaboration", "team player", "cross-functional"], category: "soft", group: "soft", why: "Almost all professional work is team work." },
  { name: "Problem Solving", aliases: ["problem solving", "problem-solving", "analytical problem solving", "critical thinking"], category: "soft", group: "soft", why: "Employers hire people who resolve ambiguity." },
  { name: "Analytical Thinking", aliases: ["analytical thinking", "analytical skills", "analytical mindset", "data-driven"], category: "soft", group: "soft", why: "A structured, evidence-first mindset is the analyst's identity." },
  { name: "Leadership", aliases: ["leadership", "led a team", "mentored"], category: "soft", group: "soft", why: "Initiative and ownership stand out in junior candidates." },
  { name: "Time Management", aliases: ["time management", "prioritization", "meeting deadlines"], category: "soft", group: "soft", why: "Reliability on deadlines builds trust fast." },
  { name: "Stakeholder Management", aliases: ["stakeholder management", "stakeholder communication", "client facing"], category: "soft", group: "soft", why: "Translating between business and technical teams is a force multiplier." },
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Find a skill mentioned in free text (word-boundary, alias-aware). */
export function findSkill(text: string, skill: SkillDef): boolean {
  const lower = text.toLowerCase();
  return skill.aliases.some((a) => {
    const pattern = new RegExp(`(^|[^a-z0-9+/#])${escape(a.toLowerCase())}([^a-z0-9]|$)`, "i");
    return pattern.test(lower);
  });
}

/** Extract all known skills present in a text. */
export function extractSkills(text: string): SkillDef[] {
  return SKILLS.filter((s) => findSkill(text, s));
}

/** Extract important multi-word/technical keywords from a JD that are not in the taxonomy. */
export function extractKeywords(jd: string): string[] {
  const stop = new Set([
    "the", "and", "for", "with", "you", "your", "our", "are", "will", "have", "has", "this", "that", "from", "into",
    "who", "what", "when", "where", "how", "why", "can", "able", "work", "working", "team", "role", "job", "candidate",
    "candidates", "should", "must", "looking", "strong", "good", "great", "experience", "experienced", "skills", "skill",
    "years", "year", "plus", "etc", "including", "include", "such", "like", "well", "across", "within", "about", "their",
    "they", "them", "we", "us", "is", "in", "on", "of", "to", "a", "an", "as", "at", "by", "or", "be", "it", "if",
  ]);
  const counts = new Map<string, number>();
  const words = jd.toLowerCase().replace(/[^a-z0-9+/#.\-\s]/g, " ").split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/^[.\-]+|[.\-]+$/g, "");
    if (clean.length < 4 || stop.has(clean)) continue;
    counts.set(clean, (counts.get(clean) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([w]) => w);
}
