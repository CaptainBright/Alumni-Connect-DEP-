-- Extended Messaging Schema for Alumni Hub

-- 1. Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_one UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_two UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    context_tag VARCHAR(255), -- 'Mentorship', 'Job Referral', 'Interview Guidance', etc.
    status VARCHAR(50) DEFAULT 'Active', -- 'Active mentorship', 'Follow-up required', 'Closed guidance'
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_one, participant_two)
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT, -- Resume / PDF / Link attachments
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT TRUE,
    is_career_insight BOOLEAN DEFAULT FALSE,
    reaction VARCHAR(50), -- e.g., 'helpful', 'important' for message reactions
    is_bookmarked BOOLEAN DEFAULT FALSE, -- Allows users to pin/bookmark a message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scale
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- RLS setup (same as before)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for conversations
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can update their conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- 4. RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
);

CREATE POLICY "Users can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = sender_id OR 
    EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
    )
);
