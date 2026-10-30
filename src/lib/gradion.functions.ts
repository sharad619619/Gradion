import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { analyzeMatch, type MatchAnalysis } from "./matcher";
import { buildDeterministicRoadmap, type Roadmap } from "./roadmap";

const AnalyzeInput = z.object({
  name: z.string().trim().max(100).optional(),
  resumeText: z.string().trim().min(80, "Resume text is too short to analyse — paste the full text or upload a file."),
  jobDescription: z.string().trim().min(80, "Job description is too short — paste the complete JD."),
  targetRole: z.string().trim().min(2).max(100),
});

const RoadmapInput = z.object({
  analysis: z.object({
    id: z.string(),
    targetRole: z.string(),
    matchScore: z.number(),
    matchLabel: z.string(),
    matched: z.array(z.object({ skill: z.string(), evidence: z.string() })),
    partial: z.array(z.object({ skill: z.string(), evidence: z.string() })),
    missing: z.array(z.object({ skill: z.string(), why: z.string() })),
    subscores: z.object({
      technical: z.number(),
      experience: z.number(),
      projects: z.number(),
      education: z.number(),
      soft: z.number(),
    }),
    resumeText: z.string(),
    jobDescription: z.string(),
  }),
});

async function callGemini(system: string, user: string): Promise<unknown | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      console.error("AI gateway error", res.status);
      return null;
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (e) {
    console.error("AI call failed", e);
    return null;
  }
}

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data }): Promise<{ analysis: MatchAnalysis }> => {
    // Deterministic, transparent scoring is the source of truth.
    const analysis = analyzeMatch(data);

    // Optionally enrich the narrative layer with Gemini (never the scores).
    const ai = (await callGemini(
      `You are Gradion's resume intelligence. Given a skill-match analysis, rewrite ONLY the narrative fields: interpretation (2 sentences, honest and specific), suggestions (5 concrete resume-improvement items), and experienceGaps (up to 4). Never invent skills, projects or experience not present in the input. Output strict JSON: {"interpretation": string, "suggestions": string[], "experienceGaps": string[]}.`,
      JSON.stringify({
        targetRole: analysis.targetRole,
        matchScore: analysis.matchScore,
        matched: analysis.matched.map((m) => m.skill),
        partial: analysis.partial.map((p) => p.skill),
        missing: analysis.missing.map((m) => m.skill),
        subscores: analysis.subscores,
      }),
    )) as { interpretation?: string; suggestions?: string[]; experienceGaps?: string[] } | null;

    if (ai?.interpretation && Array.isArray(ai.suggestions) && ai.suggestions.length >= 3) {
      analysis.interpretation = ai.interpretation;
      analysis.suggestions = ai.suggestions.slice(0, 6);
      if (Array.isArray(ai.experienceGaps) && ai.experienceGaps.length) analysis.experienceGaps = ai.experienceGaps.slice(0, 4);
      analysis.source = "ai";
    }

    try {
      await supabaseAdmin.from("resume_analyses").insert({
        name: data.name ?? null,
        resume_text: data.resumeText.slice(0, 20000),
        job_description: data.jobDescription.slice(0, 20000),
        target_role: data.targetRole,
        match_score: analysis.matchScore,
        matched_skills: analysis.matched as unknown as never,
        partial_skills: analysis.partial as unknown as never,
        missing_skills: analysis.missing as unknown as never,
        analysis_json: analysis as unknown as never,
      });
    } catch (e) {
      console.error("Failed to persist analysis", e);
    }

    return { analysis };
  });

export const generateRoadmap = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RoadmapInput.parse(d))
  .handler(async ({ data }): Promise<{ roadmap: Roadmap }> => {
    // Rebuild a full analysis object for the deterministic builder/fallback.
    const base = analyzeMatch({
      resumeText: data.analysis.resumeText,
      jobDescription: data.analysis.jobDescription,
      targetRole: data.analysis.targetRole,
    });
    base.id = data.analysis.id;
    base.matchScore = data.analysis.matchScore;
    base.matchLabel = data.analysis.matchLabel;

    const fallback = () => {
      const r = buildDeterministicRoadmap(base);
      r.analysisId = data.analysis.id;
      return r;
    };

    const ai = (await callGemini(
      `You are Gradion's career intelligence engine. Given a resume–job match analysis, produce a personalized 90-day career roadmap as strict JSON with EXACTLY these keys:
{"currentPosition": string, "priorities": [{"skill","priority":"High"|"Medium"|"Low","why"}], "milestones": [{"title","skill","why","duration","objectives":string[3],"completion","resource"}], "projects": [{"name","problem","skills":string[],"stack","outcome","portfolioValue","difficulty"}], "certifications": [{"name","org","skills","effort","url"}], "internships": [{"role","skills","fit","location"}], "interview": {"technical": string[5], "practical": string[3], "behavioural": string[3]}}.
Rules: base everything on the actual missing/partial skills provided. Exactly 3 projects, 3 certifications, 3 internships, 6 milestones. Only use real, well-known certification URLs; omit "url" if unsure. Label internships as sample listings in the location field. Never invent skills the analysis didn't identify.`,
      JSON.stringify({
        targetRole: base.targetRole,
        matchScore: base.matchScore,
        matched: base.matched.map((m) => m.skill),
        partial: base.partial.map((p) => p.skill),
        missing: base.missing.map((m) => ({ skill: m.skill, why: m.why })),
        subscores: base.subscores,
      }),
    )) as Partial<Roadmap> | null;

    let roadmap: Roadmap;
    if (ai && Array.isArray(ai.milestones) && ai.milestones.length >= 4 && Array.isArray(ai.projects) && ai.projects.length >= 3) {
      const det = fallback();
      roadmap = {
        ...det,
        currentPosition: typeof ai.currentPosition === "string" ? ai.currentPosition : det.currentPosition,
        priorities: Array.isArray(ai.priorities) && ai.priorities.length ? (ai.priorities as Roadmap["priorities"]) : det.priorities,
        milestones: ai.milestones as Roadmap["milestones"],
        projects: ai.projects as Roadmap["projects"],
        certifications: Array.isArray(ai.certifications) && ai.certifications.length ? (ai.certifications as Roadmap["certifications"]) : det.certifications,
        internships: Array.isArray(ai.internships) && ai.internships.length ? (ai.internships as Roadmap["internships"]) : det.internships,
        interview: ai.interview?.technical?.length ? (ai.interview as Roadmap["interview"]) : det.interview,
        source: "ai",
      };
    } else {
      roadmap = fallback();
    }

    try {
      const { data: pathRow } = await supabaseAdmin
        .from("career_paths")
        .insert({
          analysis_id: null,
          target_role: roadmap.targetRole,
          readiness_score: base.matchScore,
          roadmap_json: roadmap as unknown as never,
        })
        .select("id")
        .single();
      if (pathRow?.id) {
        await supabaseAdmin.from("roadmap_tasks").insert(
          roadmap.phases.flatMap((p) =>
            p.tasks.map((t) => ({
              career_path_id: pathRow.id,
              title: t.title,
              description: t.detail,
              phase: p.phase,
              status: "not_started",
              deadline: t.deadline,
            })),
          ),
        );
      }
    } catch (e) {
      console.error("Failed to persist roadmap", e);
    }

    return { roadmap };
  });
