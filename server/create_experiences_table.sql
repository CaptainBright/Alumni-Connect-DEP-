-- Run in Supabase SQL Editor
-- Creates the experiences table for the Career Playbooks feature

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'Alumni'
    CHECK (author_role IN ('Alumni', 'Student')),
  category TEXT NOT NULL DEFAULT 'advice'
    CHECK (category IN ('interview', 'job', 'internship', 'advice')),
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read experiences
CREATE POLICY "Authenticated users can view experiences"
ON public.experiences FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert their own experiences
CREATE POLICY "Authenticated users can insert experiences"
ON public.experiences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Author can update own experiences
CREATE POLICY "Author can update own experiences"
ON public.experiences FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Author can delete own experiences
CREATE POLICY "Author can delete own experiences"
ON public.experiences FOR DELETE TO authenticated
USING (auth.uid() = author_id);

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_experiences_category ON public.experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON public.experiences(created_at DESC);

NOTIFY pgrst, 'reload schema';
