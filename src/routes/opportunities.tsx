import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, Search, ExternalLink } from "lucide-react";
import { OPPORTUNITY_LIST, OPPORTUNITY_CATEGORIES, type OpportunityCategory } from "@/lib/opportunities-data";
import { getAnalysis, getBookmarks, toggleBookmark, useStoreVersion, useHydrated } from "@/lib/store";
import { LoadingShell } from "@/components/LoadingShell";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — Gradion" },
      { name: "description", content: "Internships, projects, certifications, learning resources, scholarships and hackathons — personalized to your skill gaps." },
      { property: "og:title", content: "Opportunities — Gradion" },
      { property: "og:description", content: "Discover opportunities matched to your career pathway." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  useStoreVersion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "All">("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const hydrated = useHydrated();
  const bookmarks = hydrated ? getBookmarks() : [];
  const analysis = hydrated ? getAnalysis(null) : null;
  const gapSkills = useMemo(
    () => new Set([...(analysis?.missing.map((m) => m.skill) ?? []), ...(analysis?.partial.map((p) => p.skill) ?? [])]),
    [analysis],
  );

  const filtered = OPPORTUNITY_LIST.filter((o) => {
    if (category !== "All" && o.category !== category) return false;
    if (savedOnly && !bookmarks.includes(o.id)) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.org.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => {
    const score = (o: (typeof OPPORTUNITY_LIST)[number]) => o.skills.filter((s) => gapSkills.has(s)).length;
    return score(b) - score(a);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Opportunities</span>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Next steps, ready to take.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {analysis
          ? `Personalized to your ${analysis.targetRole} gaps — opportunities that build your missing skills surface first.`
          : "Run a resume analysis and we'll personalize these to your skill gaps."}
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, titles, organizations…"
            className="h-11 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm"
            aria-label="Search opportunities"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...OPPORTUNITY_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                (category === c ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => setSavedOnly((s) => !s)}
            className={
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
              (savedOnly ? "bg-accent text-accent-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            <Bookmark className="h-3 w-3" /> Saved ({bookmarks.length})
          </button>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">No opportunities match your filters.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o, i) => {
            const saved = bookmarks.includes(o.id);
            const closesGap = o.skills.some((s) => gapSkills.has(s));
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-base font-semibold">{o.title}</div>
                    <div className="text-xs text-muted-foreground">{o.org}</div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(o.id)}
                    aria-label={saved ? `Remove ${o.title} from saved` : `Save ${o.title}`}
                    className="shrink-0 rounded-full p-1.5 hover:bg-muted"
                  >
                    {saved ? <BookmarkCheck className="h-4 w-4 text-accent" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{o.category}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{o.difficulty}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{o.time}</span>
                  {o.sample ? <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[11px] font-medium text-accent-foreground">Sample</span> : null}
                  {closesGap ? <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">Closes your gap</span> : null}
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{o.description}</p>
                {o.skills.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.skills.map((s) => (
                      <span key={s} className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] text-secondary">{s}</span>
                    ))}
                  </div>
                ) : null}
                {o.link ? (
                  <a href={o.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Visit resource <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-xs text-muted-foreground">
        Cards labelled “Sample” are illustrative categories for demonstration, not live openings. Cards with a resource link point to real, verified external programs.
      </p>
    </div>
  );
}
