-- Events Table for Alumni Connect
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TEXT,            -- e.g. "7:00 PM IST"
    location TEXT,              -- e.g. "Main Auditorium, IIT Ropar"
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Everyone can view events
CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

-- Only authenticated users can insert (admin check is done at app level)
CREATE POLICY "Authenticated users can insert events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only the creator or service_role can delete
CREATE POLICY "Creator can delete events"
ON public.events FOR DELETE
USING (auth.uid() = created_by);
