import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Map, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { getAnalysis, saveRoadmap, useStoreVersion, useHydrated } from "@/lib/store";
import { LoadingShell } from "@/components/LoadingShell";
import { generateRoadmap } from "@/lib/gradion.functions";
import { MatchScoreRing } from "@/components/MatchScoreRing";
import type { SkillMatch } from "@/lib/matcher";

export const Route = createFileRoute("/analysis")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({
    meta: [
      { title: "Your Career Match Analysis — Gradion" },
      { name: "description", content: "Detailed resume–job match analysis: matched, partial and missing skills, keyword analysis, and your personalized career roadmap." },
      { property: "og:title", content: "Your Career Match Analysis — Gradion" },
      { property: "og:description", content: "Transparent match scoring and skill-gap breakdown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  useStoreVersion();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const gen = useServerFn(generateRoadmap);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const hydrated = useHydrated();
  const analysis = hydrated ? getAnalysis(id) : null;

  if (!hydrated) return <LoadingShell />;

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">No analysis yet</h1>
        <p className="mt-3 text-muted-foreground">Upload your resume and a job description to see your match analysis here.</p>
        <Link to="/matcher" className="mt-6 inline-flex h-12 items-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant">
          Analyse My Resume
        </Link>
      </div>
    );
  }

  async function onGenerateRoadmap() {
    setGenerating(true);
    setGenError(null);
    try {
      const { roadmap } = await gen({ data: { analysis: analysis! } });
      saveRoadmap(roadmap);
      navigate({ to: "/roadmap" });
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Roadmap generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const chartData = [
    { name: "Technical", value: analysis.subscores.technical },
    { name: "Experience", value: analysis.subscores.experience },
    { name: "Projects", value: analysis.subscores.projects },
    { name: "Education", value: analysis.subscores.education },
    { name: "Soft skills", value: analysis.subscores.soft },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Top section */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex flex-wrap items-center gap-8">
          <MatchScoreRing score={analysis.matchScore} label={analysis.matchLabel} />
          <div className="min-w-[260px] flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary">Your Career Match Analysis</div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">{analysis.targetRole}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              Analysed {new Date(analysis.createdAt).toLocaleString()} · {analysis.source === "ai" ? "AI-enhanced narrative" : "Deterministic engine"}
            </div>
            <p className="mt-3 max-w-xl text-muted-foreground">{analysis.interpretation}</p>
            <p className="mt-2 text-xs text-muted-foreground">Indicative compatibility score — not a prediction of hiring success.</p>
          </div>
        </div>
      </motion.section>

      {/* Skill breakdown */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Skill match breakdown</h2>
        <p className="mt-1 text-sm text-muted-foreground">Click any skill to see the evidence and recommended action.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <SkillGroup title="Matched" icon={<CheckCircle2 className="h-4 w-4" />} tone="matched" skills={analysis.matched} />
          <SkillGroup title="Partially matched" icon={<AlertTriangle className="h-4 w-4" />} tone="partial" skills={analysis.partial} />
          <SkillGroup title="Missing" icon={<XCircle className="h-4 w-4" />} tone="missing" skills={analysis.missing} />
        </div>
      </section>

      {/* Analytics */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Match analytics</h2>
          <p className="mt-1 text-xs text-muted-foreground">Weighted: technical 40% · experience 25% · projects 15% · education 10% · soft 10%</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => [`${v}/100`, "Alignment"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.value >= 70 ? "oklch(0.62 0.15 160)" : d.value >= 45 ? "oklch(0.78 0.15 70)" : "oklch(0.58 0.22 25)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Keyword analysis</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.keywords.map((k) => (
                <span
                  key={k.term}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium " +
                    (k.found ? "bg-secondary/15 text-secondary" : "bg-destructive/10 text-destructive")
                  }
                  title={k.found ? "Found in your resume" : "Not found in your resume"}
                >
                  {k.found ? "✓ " : "✕ "}
                  {k.term}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Education alignment</h2>
            <p className="mt-2 text-sm text-muted-foreground">{analysis.educationAlignment}</p>
          </div>
        </div>
      </section>

      {/* Gaps + suggestions */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Experience gaps</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {analysis.experienceGaps.map((g) => (
              <li key={g} className="flex gap-2 rounded-xl border border-border bg-background/60 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold">Resume improvement suggestions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {analysis.suggestions.map((s) => (
              <li key={s} className="flex gap-2 rounded-xl border border-border bg-background/60 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Engine 2 CTA */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant"
      >
        <div className="text-sm uppercase tracking-wider opacity-80">Engine 2 — Gradion Career Intelligence</div>
        <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight">Your match is just the beginning.</h2>
        <p className="mt-2 max-w-xl opacity-90">Gradion has identified the gaps. Now let's build a pathway to close them — projects, certifications, internships and a 90-day plan generated from <em>this</em> analysis.</p>
        {genError ? <div className="mt-4 rounded-xl bg-destructive/20 p-3 text-sm">{genError}</div> : null}
        <button
          onClick={onGenerateRoadmap}
          disabled={generating}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-semibold text-foreground shadow-elegant disabled:opacity-70"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your roadmap…
            </>
          ) : (
            <>
              <Map className="mr-2 h-4 w-4" /> Generate My Personalized Career Roadmap
            </>
          )}
        </button>
      </motion.section>
    </div>
  );
}

const TONES = {
  matched: { chip: "border-secondary/40 bg-secondary/10 text-secondary", dot: "text-secondary" },
  partial: { chip: "border-accent/50 bg-accent/15 text-accent-foreground", dot: "text-accent" },
  missing: { chip: "border-destructive/40 bg-destructive/10 text-destructive", dot: "text-destructive" },
} as const;

function SkillGroup({ title, icon, tone, skills }: { title: string; icon: React.ReactNode; tone: keyof typeof TONES; skills: SkillMatch[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const t = TONES[tone];
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className={"flex items-center gap-2 font-display text-lg font-semibold " + t.dot}>
        {icon}
        {title}
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{skills.length}</span>
      </div>
      {skills.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">None detected.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((s) => (
            <button
              key={s.skill}
              onClick={() => setOpen(open === s.skill ? null : s.skill)}
              className={"rounded-full border px-3 py-1.5 text-xs font-medium transition-transform hover:scale-105 " + t.chip}
              aria-expanded={open === s.skill}
            >
              {s.skill}
            </button>
          ))}
        </div>
      )}
      {open
        ? skills
            .filter((s) => s.skill === open)
            .map((s) => (
              <div key={s.skill} className="mt-4 rounded-2xl border border-border bg-background/60 p-4 text-sm">
                <div className="font-semibold">{s.skill}</div>
                <div className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Why it matters:</span> {s.why}</div>
                <div className="mt-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">Evidence:</span> {s.evidenceNote}</div>
                <div className="mt-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">Recommended action:</span> {s.action}</div>
              </div>
            ))
        : null}
    </div>
  );
}
