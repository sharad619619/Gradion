
-- Pathways table stores demo submissions and AI-generated output
CREATE TABLE public.pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  education TEXT NOT NULL,
  current_skills TEXT NOT NULL,
  interests TEXT NOT NULL,
  target_career TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  location TEXT NOT NULL,
  readiness_score INTEGER NOT NULL DEFAULT 0,
  ai_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pathways TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pathways TO authenticated;
GRANT ALL ON public.pathways TO service_role;

ALTER TABLE public.pathways ENABLE ROW LEVEL SECURITY;

-- Public demo: anyone can insert their submission; anyone can read aggregate (for admin demo).
CREATE POLICY "Anyone can submit a pathway"
  ON public.pathways FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read pathways"
  ON public.pathways FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_pathways_created_at ON public.pathways(created_at DESC);
CREATE INDEX idx_pathways_target_career ON public.pathways(target_career);
