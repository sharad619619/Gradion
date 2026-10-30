import { createFileRoute, Link } from "@tanstack/react-router";
import { PathwayMap } from "@/components/PathwayMap";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Gradion — From Resume Matching to Career Readiness" },
      { name: "description", content: "Why we built Gradion: most tools tell students whether their resume matches a job. Gradion tells them what's missing and exactly how to get there." },
      { property: "og:title", content: "About Gradion" },
      { property: "og:description", content: "The career intelligence layer on top of resume–job matching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">About Gradion</span>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
        Most tools tell students whether their resume matches a job. <span className="text-gradient">Gradion tells them how to become the candidate.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
        Gradion started from a simple observation: resume screening tools end at the verdict — match or no match. But a student who learns they're a 54% match hasn't been helped; they've been told a problem exists without being shown the way out.
      </p>

      <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-elegant">
        <PathwayMap
          nodes={[
            { label: "Resume", sub: "Where you are" },
            { label: "AI Analysis", sub: "What matches" },
            { label: "Skill Gap", sub: "What's missing" },
            { label: "Roadmap", sub: "How to close it" },
            { label: "Readiness", sub: "Proof of progress" },
            { label: "Employment", sub: "The destination" },
          ]}
        />
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          { t: "Transparent by design", d: "Our match score is a published, weighted model — technical skills 40%, experience 25%, projects 15%, education 10%, soft skills 10%. No black box." },
          { t: "Honest about evidence", d: "We distinguish a skill mentioned, a skill supported by evidence, and a skill demonstrated through a project. We never fabricate qualifications." },
          { t: "Action over anxiety", d: "Every gap we identify comes with a sequenced plan: learning resources, projects that prove the skill, certifications, and a 90-day timeline." },
        ].map((v) => (
          <div key={v.t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="font-display text-lg font-semibold">{v.t}</div>
            <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <h2 className="font-display text-2xl font-semibold">Privacy</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Your resume and job descriptions are processed to produce your analysis and are never shared with third parties. Analyses and roadmap progress are stored in your browser and in our secure backend so your journey persists between visits. You can clear your browser storage at any time to remove local data.
        </p>
        <h2 className="mt-8 font-display text-2xl font-semibold">Contact</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Questions, feedback, or partnership ideas: <a href="mailto:hello@gradion.app" className="font-medium text-primary hover:underline">hello@gradion.app</a>
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elegant">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight">See what your resume is really saying.</h2>
        <Link to="/matcher" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-semibold text-foreground shadow-elegant">
          Analyse My Resume →
        </Link>
      </div>
    </div>
  );
}
