import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { analyzeResume } from "@/lib/gradion.functions";
import { saveAnalysis } from "@/lib/store";
import { DEMO_RESUME, DEMO_JD, DEMO_PROFILE } from "@/lib/demo-data";

export const Route = createFileRoute("/matcher")({
  head: () => ({
    meta: [
      { title: "Resume Matcher — Gradion" },
      { name: "description", content: "Upload your resume, paste a job description, and get a transparent AI match analysis with skill gaps and a career roadmap." },
      { property: "og:title", content: "Resume Matcher — Gradion" },
      { property: "og:description", content: "AI resume–job description matching with transparent scoring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatcherPage,
});

type UploadState = { fileName: string; chars: number } | null;

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let out = "";
  for (let i = 1; i <= Math.min(doc.numPages, 10); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
  }
  return out.trim();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value.trim();
}

function MatcherPage() {
  const navigate = useNavigate();
  const run = useServerFn(analyzeResume);
  const fileInput = useRef<HTMLInputElement>(null);

  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [name, setName] = useState("");
  const [upload, setUpload] = useState<UploadState>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setNotice(null);
    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "docx", "txt"].includes(ext ?? "")) {
      setError("Unsupported file type. Upload a PDF, DOCX or TXT file — or paste your resume text below.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File is too large (max 8 MB). Try pasting the resume text instead.");
      return;
    }
    setParsing(true);
    try {
      let text = "";
      if (ext === "pdf") text = await extractPdfText(file);
      else if (ext === "docx") text = await extractDocxText(file);
      else text = await file.text();
      if (text.length < 80) {
        setError("We couldn't extract enough text from that file. Paste your resume text manually below.");
        return;
      }
      setResumeText(text);
      setUpload({ fileName: file.name, chars: text.length });
      setNotice(`Extracted ${text.length.toLocaleString()} characters from ${file.name}. You can edit the text below before analysing.`);
    } catch {
      setError("Could not parse that file. Paste your resume text manually below — it works exactly the same.");
    } finally {
      setParsing(false);
    }
  }

  function loadDemo() {
    setName(DEMO_PROFILE.name);
    setResumeText(DEMO_RESUME);
    setJd(DEMO_JD);
    setTargetRole(DEMO_PROFILE.targetRole);
    setUpload(null);
    setError(null);
    setNotice("Sample profile loaded — Aarav Sharma, B.Tech CS, targeting Junior Data Analyst. Click Analyse My Match.");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (resumeText.trim().length < 80) {
      setError("Your resume text looks too short. Paste the full resume or upload a file.");
      return;
    }
    if (jd.trim().length < 80) {
      setError("The job description looks too short. Paste the complete JD for an accurate match.");
      return;
    }
    if (!targetRole.trim()) {
      setError("Enter the target job title (e.g. Junior Data Analyst).");
      return;
    }
    setLoading(true);
    try {
      const { analysis } = await run({ data: { name: name || undefined, resumeText, jobDescription: jd, targetRole } });
      saveAnalysis(analysis);
      navigate({ to: "/analysis", search: { id: analysis.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Engine 1 — Resume Intelligence</span>
      <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">How well does your resume match the job?</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Upload your resume, paste the job description, and get a transparent match analysis: matched skills, partial matches, missing skills, and a weighted score you can actually interrogate.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        {/* Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
          className={
            "rounded-3xl border-2 border-dashed p-8 text-center transition-colors " +
            (dragging ? "border-primary bg-primary/5" : "border-border bg-card")
          }
        >
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          {parsing ? (
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              Reading your document…
            </div>
          ) : upload ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
              <div className="font-semibold">{upload.fileName}</div>
              <div className="text-xs text-muted-foreground">{upload.chars.toLocaleString()} characters extracted</div>
              <button type="button" onClick={() => fileInput.current?.click()} className="mt-1 text-sm font-medium text-primary hover:underline">
                Upload a different file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="font-semibold">Drag & drop your resume here</div>
              <div className="text-xs text-muted-foreground">PDF, DOCX or TXT — max 8 MB</div>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-2 inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
              >
                Browse files
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <label htmlFor="resume" className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Resume text
            </label>
            <textarea
              id="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here (or upload a file above)…"
              className="mt-3 h-64 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed"
              required
            />
            <div className="mt-1 text-xs text-muted-foreground">{resumeText.length.toLocaleString()} characters</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <label htmlFor="jd" className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-secondary" /> Job description
            </label>
            <textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the complete job description you're targeting…"
              className="mt-3 h-64 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-relaxed"
              required
            />
            <div className="mt-1 text-xs text-muted-foreground">{jd.length.toLocaleString()} characters</div>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft md:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Your name <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Sharma"
              maxLength={100}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-semibold">Target job title</label>
            <input
              id="role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Junior Data Analyst"
              maxLength={100}
              required
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        ) : null}
        {notice ? (
          <div className="flex items-start gap-2 rounded-xl border border-secondary/30 bg-secondary/10 p-3 text-sm text-foreground" role="status">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {notice}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || parsing}
            className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-hero px-8 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing your match…
              </>
            ) : (
              "Analyse My Match"
            )}
          </button>
          <button
            type="button"
            onClick={loadDemo}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="mr-2 h-4 w-4 text-accent" /> Try Interactive Demo
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          The demo loads a realistic sample resume and job description — no files needed. Your documents are analysed securely and never shared.
        </p>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-soft"
      >
        <h2 className="font-display text-lg font-semibold">How the score works</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-5">
          {[
            ["Technical skills", "40%"],
            ["Experience", "25%"],
            ["Projects & evidence", "15%"],
            ["Education", "10%"],
            ["Soft skills", "10%"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-background/60 p-3 text-center">
              <div className="font-display text-xl font-bold text-primary">{v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          The score is an indicative compatibility measure — not a prediction of hiring success. Missing information is never treated as confirmed proficiency.
        </p>
      </motion.div>
    </div>
  );
}
