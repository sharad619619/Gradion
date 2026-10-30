export type OpportunityCategory =
  | "Internships"
  | "Projects"
  | "Certifications"
  | "Learning Resources"
  | "Scholarships"
  | "Competitions & Hackathons";

export type Opportunity = {
  id: string;
  title: string;
  org: string;
  category: OpportunityCategory;
  description: string;
  skills: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  link?: string;
  sample: boolean;
};

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  "Internships",
  "Projects",
  "Certifications",
  "Learning Resources",
  "Scholarships",
  "Competitions & Hackathons",
];

export const OPPORTUNITY_LIST: Opportunity[] = [
  // Internships (sample)
  { id: "int-1", title: "Data Analyst Intern", org: "FinNova Bank", category: "Internships", description: "Work with the analytics team on SQL reporting and Power BI dashboards for retail banking KPIs.", skills: ["SQL", "Power BI", "Excel"], difficulty: "Beginner", time: "3 months", sample: true },
  { id: "int-2", title: "Business Intelligence Intern", org: "Stellar Health", category: "Internships", description: "Build dashboard prototypes and support weekly business reporting for the operations team.", skills: ["Power BI", "Data Visualization", "Business Reporting"], difficulty: "Beginner", time: "6 months", sample: true },
  { id: "int-3", title: "Frontend Engineering Intern", org: "Linea Mobility", category: "Internships", description: "Ship React features with a senior mentor; strong Git and testing practices expected.", skills: ["React", "TypeScript", "Git"], difficulty: "Intermediate", time: "4 months", sample: true },
  { id: "int-4", title: "Analytics Volunteer — Open Data", org: "DataKind-style program", category: "Internships", description: "Contribute analysis to nonprofit open-data projects. No application gate — start immediately.", skills: ["Python", "Data Cleaning", "Statistics"], difficulty: "Beginner", time: "Flexible", sample: true },

  // Projects
  { id: "prj-1", title: "Kaggle Playground Competitions", org: "Kaggle", category: "Projects", description: "Monthly beginner-friendly ML/data competitions with real datasets and public leaderboards.", skills: ["Python", "Statistics", "Data Cleaning"], difficulty: "Intermediate", time: "Ongoing", link: "https://www.kaggle.com/competitions", sample: false },
  { id: "prj-2", title: "Outreachy Open-Source Program", org: "Outreachy", category: "Projects", description: "Paid open-source internships for underrepresented groups — real code, real mentors.", skills: ["Git", "REST APIs", "Testing"], difficulty: "Intermediate", time: "3 months", link: "https://www.outreachy.org/", sample: false },
  { id: "prj-3", title: "Build-in-Public 30-Day Sprint", org: "Community", category: "Projects", description: "Ship one small project in 30 days while posting progress — builds portfolio and network.", skills: ["Communication", "Project Execution"], difficulty: "Beginner", time: "30 days", sample: true },

  // Certifications
  { id: "crt-1", title: "Google Data Analytics Certificate", org: "Google / Coursera", category: "Certifications", description: "Foundations of data cleaning, SQL, visualization and R. Financial aid available.", skills: ["SQL", "Data Cleaning", "Data Visualization"], difficulty: "Beginner", time: "~6 months", link: "https://www.coursera.org/professional-certificates/google-data-analytics", sample: false },
  { id: "crt-2", title: "Microsoft PL-300: Power BI Data Analyst", org: "Microsoft", category: "Certifications", description: "The industry-standard Power BI credential: data modeling, DAX, dashboards.", skills: ["Power BI", "Dashboard Development"], difficulty: "Intermediate", time: "40–60 hrs", link: "https://learn.microsoft.com/credentials/certifications/data-analyst-associate/", sample: false },
  { id: "crt-3", title: "AWS Cloud Practitioner", org: "AWS", category: "Certifications", description: "Entry-level cloud fluency credential recognized across industries.", skills: ["Cloud Computing", "AWS"], difficulty: "Beginner", time: "30–40 hrs", link: "https://aws.amazon.com/certification/certified-cloud-practitioner/", sample: false },

  // Learning resources
  { id: "lrn-1", title: "Kaggle Learn Micro-Courses", org: "Kaggle", category: "Learning Resources", description: "Free, hands-on micro-courses: Pandas, SQL, data cleaning, visualization, ML.", skills: ["Pandas", "SQL", "Data Cleaning"], difficulty: "Beginner", time: "4–6 hrs each", link: "https://www.kaggle.com/learn", sample: false },
  { id: "lrn-2", title: "CS50x — Intro to Computer Science", org: "Harvard / edX", category: "Learning Resources", description: "The classic rigorous CS foundation course. Free to audit.", skills: ["Problem Solving", "Programming Fundamentals"], difficulty: "Intermediate", time: "11 weeks", link: "https://cs50.harvard.edu/x/", sample: false },
  { id: "lrn-3", title: "Mode SQL Tutorial", org: "Mode", category: "Learning Resources", description: "Interactive SQL from basics to advanced window functions, on real data.", skills: ["SQL", "Advanced SQL"], difficulty: "Beginner", time: "Self-paced", link: "https://mode.com/sql-tutorial/", sample: false },

  // Scholarships
  { id: "sch-1", title: "Google Generation Scholarship", org: "Google", category: "Scholarships", description: "For students from underrepresented groups in computer science.", skills: [], difficulty: "Beginner", time: "Annual cycle", link: "https://buildyourfuture.withgoogle.com/scholarships", sample: false },
  { id: "sch-2", title: "GitHub Education Pack", org: "GitHub", category: "Scholarships", description: "Free developer tools, credits and courses for verified students.", skills: ["Git"], difficulty: "Beginner", time: "Instant", link: "https://education.github.com/pack", sample: false },

  // Competitions
  { id: "cmp-1", title: "Smart India Hackathon", org: "Govt. of India", category: "Competitions & Hackathons", description: "India's largest hackathon — solve real ministry/industry problem statements in teams.", skills: ["Teamwork", "Problem Solving", "Prototyping"], difficulty: "Intermediate", time: "Annual", link: "https://www.sih.gov.in/", sample: false },
  { id: "cmp-2", title: "Devpost Hackathons", org: "Devpost", category: "Competitions & Hackathons", description: "Continuous global online hackathons — filter by theme, prize and skill level.", skills: ["Prototyping", "Teamwork"], difficulty: "Beginner", time: "Weekends", link: "https://devpost.com/hackathons", sample: false },
];
