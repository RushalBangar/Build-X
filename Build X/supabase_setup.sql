-- =====================================================
-- Alumni Connect Platform - Supabase Database Setup
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create Alumni Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.alumni (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    batch TEXT NOT NULL,
    email TEXT UNIQUE,
    bio TEXT,
    linkedin_url TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Messages Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    receiver TEXT,
    alumni_id BIGINT REFERENCES public.alumni(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Connections Table (Optional - for tracking student-alumni connections)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.connections (
    id BIGSERIAL PRIMARY KEY,
    student_email TEXT NOT NULL,
    alumni_id BIGINT REFERENCES public.alumni(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_email, alumni_id)
);

-- 4. Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Alumni Table
-- =====================================================
-- Allow anyone to read alumni profiles
CREATE POLICY "Alumni profiles are viewable by everyone"
    ON public.alumni FOR SELECT
    USING (true);

-- Allow authenticated users to insert alumni profiles
CREATE POLICY "Authenticated users can insert alumni"
    ON public.alumni FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own alumni profile
CREATE POLICY "Users can update their own alumni profile"
    ON public.alumni FOR UPDATE
    USING (auth.email() = email);

-- 6. Create RLS Policies for Messages Table
-- =====================================================
-- Allow users to read messages they sent or received
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (
        auth.email() = sender OR 
        auth.email() = receiver OR
        auth.role() = 'authenticated'
    );

-- Allow authenticated users to insert messages
CREATE POLICY "Authenticated users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Create RLS Policies for Connections Table
-- =====================================================
-- Allow users to view their own connections
CREATE POLICY "Users can view their own connections"
    ON public.connections FOR SELECT
    USING (auth.email() = student_email);

-- Allow users to create connections
CREATE POLICY "Users can create connections"
    ON public.connections FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own connections
CREATE POLICY "Users can update their own connections"
    ON public.connections FOR UPDATE
    USING (auth.email() = student_email);

-- 8. Create Indexes for Better Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_alumni_email ON public.alumni(email);
CREATE INDEX IF NOT EXISTS idx_alumni_batch ON public.alumni(batch);
CREATE INDEX IF NOT EXISTS idx_alumni_company ON public.alumni(company);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_alumni_id ON public.messages(alumni_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connections_student_email ON public.connections(student_email);
CREATE INDEX IF NOT EXISTS idx_connections_alumni_id ON public.connections(alumni_id);

-- 9. Create Function to Update 'updated_at' Timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create Triggers for Auto-updating 'updated_at'
-- =====================================================
CREATE TRIGGER set_updated_at_alumni
    BEFORE UPDATE ON public.alumni
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_connections
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 11. Insert Sample Alumni Data
-- =====================================================
INSERT INTO public.alumni (name, role, company, batch, email, bio) VALUES
    ('Rohan Sharma', 'SDE II', 'Google', '2022', 'rohan.sharma@google.com', 'Passionate about distributed systems and cloud architecture. Love mentoring students!'),
    ('Priya Patel', 'Product Manager', 'Microsoft', '2021', 'priya.patel@microsoft.com', 'Leading product initiatives in AI/ML space. Happy to guide on product management careers.'),
    ('Arjun Mehta', 'Data Scientist', 'Amazon', '2020', 'arjun.mehta@amazon.com', 'Working on recommendation systems and ML models. Open to discussing data science opportunities.'),
    ('Sneha Reddy', 'UX Designer', 'Adobe', '2023', 'sneha.reddy@adobe.com', 'Creating delightful user experiences. Love talking about design thinking and user research.'),
    ('Vikram Singh', 'DevOps Engineer', 'Netflix', '2019', 'vikram.singh@netflix.com', 'Building scalable infrastructure. Can help with DevOps, CI/CD, and cloud technologies.'),
    ('Ananya Iyer', 'ML Engineer', 'Tesla', '2022', 'ananya.iyer@tesla.com', 'Working on autonomous driving ML models. Excited to mentor aspiring ML engineers!')
ON CONFLICT (email) DO NOTHING;

-- 12. Enable Realtime for Messages Table
-- =====================================================
-- Run this in Supabase Dashboard > Database > Replication
-- Or use the following command:
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next Steps:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste and run this entire SQL script
-- 3. Verify tables are created in Table Editor
-- 4. Check that sample data is inserted
-- 5. Enable Realtime for 'messages' table in Database > Replication
-- =====================================================
