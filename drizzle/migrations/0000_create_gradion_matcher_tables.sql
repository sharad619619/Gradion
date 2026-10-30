CREATE TABLE public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  resume_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  target_role TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  partial_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.resume_analyses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create analyses" ON public.resume_analyses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read analyses" ON public.resume_analyses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  readiness_score INTEGER NOT NULL DEFAULT 0,
  roadmap_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.career_paths TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.career_paths TO authenticated;
GRANT ALL ON public.career_paths TO service_role;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create career paths" ON public.career_paths FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read career paths" ON public.career_paths FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'foundation',
  status TEXT NOT NULL DEFAULT 'not_started',
  deadline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.roadmap_tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_tasks TO authenticated;
GRANT ALL ON public.roadmap_tasks TO service_role;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create tasks" ON public.roadmap_tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read tasks" ON public.roadmap_tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update tasks" ON public.roadmap_tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  recommendation_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.recommendations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendations TO authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create recommendations" ON public.recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read recommendations" ON public.recommendations FOR SELECT TO anon, authenticated USING (true);