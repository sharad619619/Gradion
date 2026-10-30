import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Clock, BookOpen, Briefcase, GraduationCap, MessageSquare, Award } from "lucide-react";
import { getAnalysis, getRoadmap, getTaskStatuses, setTaskStatus, useStoreVersion, useHydrated, type TaskStatus } from "@/lib/store";
import { LoadingShell } from "@/components/LoadingShell";
import { generateRoadmap } from "@/lib/gradion.functions";
import type { RoadmapPhase } from "@/lib/roadmap";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Your 90-Day Career Roadmap — Gradion" },
      { name: "description", content: "A personalized 30/60/90-day employability roadmap built from your actual resume–job match analysis." },
      { property: "og:title", content: "Your 90-Day Career Roadmap — Gradion" },
      { property: "og:description", content: "Milestones, projects, certifications and interview prep — sequenced for your gaps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoadmapPage,
});

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  not_started: "in_progress",
  in_progress: "completed",
  completed: "not_started",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

function RoadmapPage() {
  useStoreVersion();
  const navigate = useNavigate();
  const gen = useServerFn(generateRoadmap);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useHydrated();

  if (!hydrated) return <LoadingShell />;

  const analysis = getAnalysis(null);
  const roadmap = analysis ? getRoadmap(analysis.id) : null;
  const statuses = getTaskStatuses();

  if (!analysis) {
    return (
      <EmptyState
        title="No roadmap yet"
        body="Your roadmap is generated from a real resume–job analysis. Run one first — it takes under 60 seconds."
      />
    );
  }

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Generate your roadmap</h1>
        <p className="mt-3 text-muted-foreground">
          You have a match analysis for <span className="font-semibold text-foreground">{analysis.targetRole}</span> ({analysis.matchScore}/100). Turn it into a 90-day plan.
        </p>
        {error ? <div className="mx-auto mt-4 max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
        <button
          disabled={generating}
          onClick={async () => {
            setGenerating(true);
            setError(null);
            try {
              const { roadmap: r } = await gen({ data: { analysis } });
              const { saveRoadmap } = await import("@/lib/store");
              saveRoadmap(r);
              navigate({ to: "/roadmap" });
            } catch (e) {
              setError(e instanceof Error ? e.message : "Generation failed. Try again.");
            } finally {
              setGenerating(false);
            }
          }}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60"
        >
          {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate My Career Roadmap"}
        </button>
      </div>
    );
  }

  const allTasks = roadmap.phases.flatMap((p) => p.tasks);
  const doneCount = allTasks.filter((t) => statuses[t.id] === "completed").length;
  const progress = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Engine 2 — Career Intelligence</span>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Your 90-day journey to career readiness</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Built from your actual {analysis.targetRole} analysis ({roadmap.source === "ai" ? "AI-generated" : "deterministic plan"}). Check off milestones as you complete them — your readiness score updates automatically.
      </p>

      {/* Progress */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Roadmap progress</div>
            <div className="font-display text-2xl font-bold">{doneCount} of {allTasks.length} milestones completed</div>
          </div>
          <div className="text-gradient font-display text-4xl font-extrabold">{progress}%</div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-hero transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{roadmap.currentPosition}</p>
      </div>

      {/* Priorities */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Skill-gap prioritization</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roadmap.priorities.map((p) => (
            <div key={p.skill} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.skill}</div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-medium " +
                    (p.priority === "High" ? "bg-destructive/10 text-destructive" : p.priority === "Medium" ? "bg-accent/25 text-accent-foreground" : "bg-muted text-muted-foreground")
                  }
                >
                  {p.priority}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{p.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phases */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">30 / 60 / 90-day plan</h2>
        <div className="mt-6 space-y-6">
          {roadmap.phases.map((phase, i) => (
            <PhaseCard key={phase.phase} phase={phase} index={i} statuses={statuses} />
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Learning milestones</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {roadmap.milestones.map((m) => (
            <div key={m.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="font-display text-lg font-semibold">{m.title}</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{m.duration}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.why}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {m.objectives.map((o) => <li key={o} className="flex gap-2"><span className="text-secondary">●</span>{o}</li>)}
              </ul>
              <div className="mt-3 rounded-xl bg-background/60 p-3 text-xs">
                <div><span className="font-medium">Done when:</span> {m.completion}</div>
                <div className="mt-1 flex items-start gap-1 text-muted-foreground"><BookOpen className="mt-0.5 h-3 w-3 shrink-0" />{m.resource}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Projects that prove your missing skills</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {roadmap.projects.map((p) => (
            <div key={p.name} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display text-base font-semibold">{p.name}</div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.difficulty}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.problem}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.skills.map((s) => <span key={s} className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">{s}</span>)}
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground">Stack:</span> {p.stack}</div>
                <div><span className="font-medium text-foreground">Outcome:</span> {p.outcome}</div>
                <div><span className="font-medium text-foreground">Portfolio value:</span> {p.portfolioValue}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications + internships */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><GraduationCap className="h-5 w-5 text-primary" /> Recommended certifications</h2>
          <ul className="mt-4 space-y-3">
            {roadmap.certifications.map((c) => (
              <li key={c.name} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.org} · {c.effort}</div>
                <div className="mt-1 text-xs">Covers: {c.skills}</div>
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-medium text-primary hover:underline">Official resource →</a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Briefcase className="h-5 w-5 text-secondary" /> Internship directions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Sample opportunity categories — not live listings.</p>
          <ul className="mt-4 space-y-3">
            {roadmap.internships.map((i) => (
              <li key={i.role} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="font-semibold">{i.role}</div>
                <div className="text-xs text-muted-foreground">{i.location} · {i.skills}</div>
                <div className="mt-1 text-xs">{i.fit}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Interview prep */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-2xl font-semibold"><MessageSquare className="h-5 w-5 text-accent" /> Interview preparation</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {(
            [
              ["Technical", roadmap.interview.technical],
              ["Practical", roadmap.interview.practical],
              ["Behavioural", roadmap.interview.behavioural],
            ] as const
          ).map(([title, qs]) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="font-display text-lg font-semibold">{title}</div>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
                {qs.map((q) => <li key={q}>{q}</li>)}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/dashboard" className="inline-flex h-12 items-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Award className="mr-2 h-4 w-4" /> Track My Readiness
        </Link>
        <Link to="/opportunities" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold hover:bg-muted">
          Explore Opportunities
        </Link>
      </div>
    </div>
  );
}

function PhaseCard({ phase, index, statuses }: { phase: RoadmapPhase; index: number; statuses: Record<string, TaskStatus> }) {
  const done = phase.tasks.filter((t) => statuses[t.id] === "completed").length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary">Phase {index + 1} — {phase.days}</div>
          <h3 className="mt-1 font-display text-xl font-semibold">{phase.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{phase.focus}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{done}/{phase.tasks.length} done</span>
      </div>
      <ul className="mt-4 space-y-2">
        {phase.tasks.map((t) => {
          const status = statuses[t.id] ?? "not_started";
          return (
            <li key={t.id} className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4">
              <button
                onClick={() => setTaskStatus(t.id, STATUS_CYCLE[status])}
                aria-label={`Mark "${t.title}" — currently ${STATUS_LABEL[status]}`}
                className="mt-0.5 shrink-0"
              >
                {status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                ) : status === "in_progress" ? (
                  <Loader2 className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className={"text-sm font-semibold " + (status === "completed" ? "text-muted-foreground line-through" : "")}>{t.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.detail}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{t.deadline}</span>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] font-medium " +
                    (status === "completed" ? "bg-secondary/15 text-secondary" : status === "in_progress" ? "bg-accent/25 text-accent-foreground" : "bg-muted text-muted-foreground")
                  }
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground">{body}</p>
      <Link to="/matcher" className="mt-6 inline-flex h-12 items-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant">
        Analyse My Resume
      </Link>
    </div>
  );
}
