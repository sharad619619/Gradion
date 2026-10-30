import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, Plus, Map, Compass, TrendingUp, Bookmark } from "lucide-react";
import { loadAnalyses, getAnalysis, getRoadmap, getTaskStatuses, getBookmarks, computeReadiness, useStoreVersion, useHydrated } from "@/lib/store";
import { LoadingShell } from "@/components/LoadingShell";
import { MatchScoreRing } from "@/components/MatchScoreRing";
import { OPPORTUNITY_LIST } from "@/lib/opportunities-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Gradion" },
      { name: "description", content: "Track your resume match scores, employability readiness, roadmap progress and saved opportunities." },
      { property: "og:title", content: "My Dashboard — Gradion" },
      { property: "og:description", content: "Your career journey, measurable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  useStoreVersion();
  const hydrated = useHydrated();
  if (!hydrated) return <LoadingShell />;
  const analyses = loadAnalyses();
  const analysis = getAnalysis(null);
  const roadmap = analysis ? getRoadmap(analysis.id) : null;
  const statuses = getTaskStatuses();
  const bookmarks = getBookmarks();
  const readiness = computeReadiness(analysis, roadmap);

  if (!analysis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Your dashboard is waiting for data</h1>
        <p className="mt-3 text-muted-foreground">Run your first resume–job analysis and your scores, roadmap and progress will live here.</p>
        <Link to="/matcher" className="mt-6 inline-flex h-12 items-center rounded-full bg-gradient-hero px-6 text-sm font-semibold text-primary-foreground shadow-elegant">
          Analyse My Resume
        </Link>
      </div>
    );
  }

  const tasks = roadmap?.phases.flatMap((p) => p.tasks) ?? [];
  const done = tasks.filter((t) => statuses[t.id] === "completed").length;
  const upcoming = tasks.filter((t) => statuses[t.id] !== "completed").slice(0, 4);
  const savedOpps = OPPORTUNITY_LIST.filter((o) => bookmarks.includes(o.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">My Dashboard</span>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Your career journey, measurable.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Match score shows where you stand today. Readiness shows how much preparation you've demonstrably completed.</p>

      {/* Scores */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-6 rounded-3xl border border-border bg-card p-6 shadow-elegant">
          <MatchScoreRing score={analysis.matchScore} size={150} />
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Resume–JD match</div>
            <div className="mt-1 font-display text-xl font-semibold">{analysis.targetRole}</div>
            <div className="mt-1 text-sm text-secondary">{analysis.matchLabel}</div>
            <Link to="/analysis" search={{ id: analysis.id }} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">View full analysis →</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Employability readiness</div>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-gradient font-display text-5xl font-extrabold">{readiness.score}</span>
            <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {readiness.factors.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs">
                <span className="w-44 shrink-0 text-muted-foreground">{f.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${f.max ? (f.points / f.max) * 100 : 0}%` }} />
                </div>
                <span className="w-10 text-right font-medium">{f.points}/{f.max}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/matcher" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold hover:bg-muted">
          <Plus className="mr-2 h-4 w-4" /> Analyse Another Job
        </Link>
        <Link to="/roadmap" className="inline-flex h-11 items-center rounded-full bg-gradient-hero px-5 text-sm font-semibold text-primary-foreground shadow-elegant">
          <Map className="mr-2 h-4 w-4" /> Continue My Roadmap
        </Link>
        <Link to="/opportunities" className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold hover:bg-muted">
          <Compass className="mr-2 h-4 w-4" /> Explore Opportunities
        </Link>
        <button
          onClick={() => downloadReport(analysis, readiness.score)}
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4" /> Download My Report
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Roadmap summary */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Active roadmap</h2>
          {roadmap ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
                </div>
                <span className="text-sm font-medium">{done}/{tasks.length}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-secondary">Skills acquired (demonstrated)</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {analysis.matched.filter((m) => m.evidence === "demonstrated").map((m) => (
                      <span key={m.skill} className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">{m.skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-destructive">Skills remaining</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {analysis.missing.map((m) => (
                      <span key={m.skill} className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{m.skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming milestones</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                      <span className="truncate">{t.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">{t.deadline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">
              No roadmap yet. <Link to="/roadmap" className="font-medium text-primary hover:underline">Generate one from your analysis →</Link>
            </div>
          )}
        </div>

        {/* Saved opportunities + recent analyses */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Bookmark className="h-4 w-4 text-accent" /> Saved opportunities</h2>
            {savedOpps.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {savedOpps.slice(0, 5).map((o) => (
                  <li key={o.id} className="rounded-xl border border-border bg-background/60 p-3">
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.org} · {o.category}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet. <Link to="/opportunities" className="font-medium text-primary hover:underline">Browse opportunities →</Link></p>
            )}
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold">Recent analyses</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {analyses.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link to="/analysis" search={{ id: a.id }} className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-3 hover:bg-muted">
                    <span className="truncate font-medium">{a.targetRole}</span>
                    <span className="ml-2 shrink-0 font-display font-bold text-primary">{a.matchScore}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

async function downloadReport(analysis: NonNullable<ReturnType<typeof getAnalysis>>, readinessScore: number) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;
  const line = (text: string, size = 11, bold = false, gap = 6) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, pageW - 32);
    for (const l of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(l, 16, y);
      y += gap;
    }
  };

  line("GRADION — Career Match Report", 18, true, 10);
  line(`Generated ${new Date().toLocaleString()}`, 9, false, 8);
  line(`Target role: ${analysis.targetRole}`, 13, true);
  line(`Match score: ${analysis.matchScore}/100 — ${analysis.matchLabel}`, 12);
  line(`Employability readiness: ${readinessScore}/100`, 12, false, 8);
  line(analysis.interpretation, 10, false, 8);

  line("Matched skills", 13, true);
  line(analysis.matched.map((m) => `• ${m.skill} (${m.evidence})`).join("\n") || "• None detected", 10, false, 8);
  line("Partially matched skills", 13, true);
  line(analysis.partial.map((m) => `• ${m.skill} — ${m.evidenceNote}`).join("\n") || "• None detected", 10, false, 8);
  line("Missing skills", 13, true);
  line(analysis.missing.map((m) => `• ${m.skill} — ${m.why}`).join("\n") || "• None detected", 10, false, 8);

  line("Resume improvement suggestions", 13, true);
  line(analysis.suggestions.map((s) => `• ${s}`).join("\n"), 10, false, 8);

  line("Subscores (weighted model)", 13, true);
  line(
    `Technical ${analysis.subscores.technical}/100 (40%) · Experience ${analysis.subscores.experience}/100 (25%) · Projects ${analysis.subscores.projects}/100 (15%) · Education ${analysis.subscores.education}/100 (10%) · Soft skills ${analysis.subscores.soft}/100 (10%)`,
    10,
    false,
    8,
  );

  line("Note: scores are indicative compatibility measures, not predictions of hiring success.", 8, false);

  doc.save(`gradion-report-${analysis.targetRole.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}
