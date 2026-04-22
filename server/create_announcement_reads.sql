CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, announcement_id)
);
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own reads" ON announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reads" ON announcement_reads FOR SELECT USING (auth.uid() = user_id);
