-- Connections Management Schema

-- Core Table: connections
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING', -- Can be 'PENDING', 'ACCEPTED', 'REJECTED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- A user cannot send duplicate requests to the same person
    UNIQUE(requester_id, receiver_id)
);

-- Index for scalable fetching of pending/accepted connections
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Optional basic policies: User can only select relationships they are a part of
CREATE POLICY "Users can view their connections" 
ON public.connections FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert connection requests" 
ON public.connections FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can accept/reject connections" 
ON public.connections FOR UPDATE 
USING (auth.uid() = receiver_id OR auth.uid() = requester_id);

-- Ensure Realtime is enabled for this table via Supabase Dashboard.
