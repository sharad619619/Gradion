import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, FileText, ScanSearch, Map, TrendingUp, ArrowRight } from "lucide-react";
import { PathwayMap } from "@/components/PathwayMap";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gradion — From Resume Matching to Career Readiness." },
      { name: "description", content: "Discover how your skills match industry expectations, uncover what's missing, and get a personalized 90-day roadmap to become job-ready." },
      { property: "og:title", content: "Gradion — From Resume Matching to Career Readiness." },
      { property: "og:description", content: "AI resume–job matching that converts skill gaps into a personalized career roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function Index() {
  return (
    <div>
      <Hero />
      <Problem />
      <HowItWorks />
      <TwoEngines />
      <ProductPreview />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div className="flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" /> AI Resume–Job Matching + Career Readiness Intelligence
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl"
          >
            Your resume is your <span className="text-gradient">starting point</span>. Not your final destination.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Discover how your skills match industry expectations, uncover what's missing, and get a personalized roadmap to become job-ready.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/matcher" className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]">
              Analyse My Resume <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
              Explore How It Works
            </a>
          </motion.div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <Stat label="Skill signals tracked" value="55+" />
            <Stat label="Transparent scoring model" value="5-factor" />
            <Stat label="Path to readiness" value="90 days" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live analysis</div>
                <div className="font-display text-lg font-semibold">Resume → Junior Data Analyst</div>
              </div>
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">Match 68</span>
            </div>
            <PathwayMap
              nodes={[
                { label: "Resume", sub: "Uploaded" },
                { label: "AI Analysis", sub: "Skills extracted" },
                { label: "Skill Gap", sub: "5 missing" },
                { label: "Roadmap", sub: "90-day plan" },
                { label: "Job-Ready", sub: "Readiness ↑" },
              ]}
            />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Pill label="Matched" value="Python, SQL +3" />
              <Pill label="Missing" value="Power BI +4" />
              <Pill label="Next step" value="Dashboard project" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Problem() {
  return (
    <section className="border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary">The problem</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Students have skills. They can't prove they match the job.</h2>
            <p className="mt-4 text-muted-foreground">
              Learners move between colleges, courses, certifications and internships with no clear signal of whether any of it aligns with what employers actually ask for. Resumes get rejected by filters students never see — and nobody tells them <em>what was missing or how to fix it</em>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["62%", "of graduates feel unprepared for their first role"],
              ["75%", "of resumes are filtered out before a human reads them"],
              ["5", "questions every student asks: match? strengths? gaps? plan? timeline?"],
              ["90 days", "is enough to close most skill gaps — with the right plan"],
            ].map(([k, v]) => (
              <div key={v} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="text-gradient font-display text-3xl font-bold">{k}</div>
                <div className="mt-1 text-muted-foreground">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload Resume", d: "PDF, DOCX, or paste the text. Drag-and-drop supported.", icon: Upload },
    { n: "02", t: "Add Job Description", d: "Paste the full JD of the role you're targeting.", icon: FileText },
    { n: "03", t: "Analyse Skill Alignment", d: "Transparent 5-factor scoring across skills, experience, projects and education.", icon: ScanSearch },
    { n: "04", t: "Generate Career Roadmap", d: "A personalized 30/60/90-day plan built from your actual gaps.", icon: Map },
    { n: "05", t: "Track Employability", d: "A readiness score that grows as you complete milestones.", icon: TrendingUp },
  ];
  return (
    <section id="how-it-works" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp}>
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary">How Gradion works</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Five steps from confusion to a plan.</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <s.icon className="h-5 w-5 text-secondary" />
              <div className="mt-3 font-display text-sm text-muted-foreground">{s.n}</div>
              <div className="mt-1 font-display text-lg font-semibold">{s.t}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TwoEngines() {
  return (
    <section className="border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp}>
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary">Two-layer intelligence</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Matching tells you where you stand. Intelligence gets you hired.</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <motion.div {...fadeUp} className="rounded-3xl border border-border bg-card p-7 shadow-elegant">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Engine 1</div>
            <h3 className="mt-3 font-display text-2xl font-semibold">Resume Intelligence</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {["Resume parsing (PDF/DOCX/text)", "Job description analysis", "Skill matching: matched, partial, missing", "Keyword identification", "Transparent match percentage"].map((f) => (
                <li key={f} className="flex gap-2"><span className="text-secondary">●</span>{f}</li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rounded-3xl border border-border bg-card p-7 shadow-elegant">
            <div className="inline-flex rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">Engine 2</div>
            <h3 className="mt-3 font-display text-2xl font-semibold">Career Intelligence</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {["Skill-gap closure, prioritized", "Project recommendations that prove missing skills", "Certification recommendations", "Internship discovery", "A 30/60/90-day career roadmap"].map((f) => (
                <li key={f} className="flex gap-2"><span className="text-secondary">●</span>{f}</li>
              ))}
            </ul>
          </motion.div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">The career engine runs on the actual output of the matching engine — never a generic template.</p>
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp}>
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary">Product preview</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your analysis, at a glance.</h2>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background/60 p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Match score</div>
              <div className="text-gradient font-display text-6xl font-extrabold">68</div>
              <div className="text-xs text-muted-foreground">Moderate Alignment</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
                <div className="text-xs font-semibold text-secondary">Matched skills</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Python", "SQL", "Excel", "Statistics"].map((s) => (
                    <span key={s} className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="text-xs font-semibold text-destructive">Missing skills</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Power BI", "Tableau", "Advanced SQL"].map((s) => (
                    <span key={s} className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-xs font-semibold">Career milestones</div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>✓ SQL fundamentals</li>
                  <li>→ Power BI dashboards</li>
                  <li>→ Portfolio project</li>
                  <li>→ Interview prep</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4">
            <span className="text-sm text-muted-foreground">Readiness score grows as you complete roadmap milestones</span>
            <span className="font-display text-lg font-bold text-secondary">34 → 78</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fadeUp} className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant md:p-16">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">Don't just find out what you're missing. Discover how to get there.</h2>
          <p className="mt-3 max-w-xl opacity-90">Upload your resume, paste a job description, and get your personalized pathway in under 60 seconds. No signup required.</p>
          <Link to="/matcher" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-semibold text-foreground shadow-elegant">
            Start My Career Journey <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
