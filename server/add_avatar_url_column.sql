-- Run in Supabase SQL Editor (as postgres/service role).
-- Adds an avatar_url column to the profiles table.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

NOTIFY pgrst, 'reload schema';
