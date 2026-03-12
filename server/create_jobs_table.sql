-- Run in Supabase SQL Editor
-- Creates the jobs table for the job board

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Remote',
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Full-time'
    CHECK (type IN ('Full-time', 'Internship', 'Part-time', 'Contract')),
  skills TEXT[] DEFAULT '{}',
  url TEXT,
  posted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read jobs
CREATE POLICY "Authenticated users can view jobs"
ON public.jobs FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert jobs (role check done at API level)
CREATE POLICY "Authenticated users can insert jobs"
ON public.jobs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = posted_by);

-- Poster can delete own jobs
CREATE POLICY "Poster can delete own jobs"
ON public.jobs FOR DELETE TO authenticated
USING (auth.uid() = posted_by);

NOTIFY pgrst, 'reload schema';
