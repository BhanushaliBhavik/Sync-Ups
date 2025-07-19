-- Create Inquiries Table for Property Inquiries
-- This table stores user inquiries about properties

CREATE TABLE IF NOT EXISTS inquiries (
    id text PRIMARY KEY DEFAULT 'inq_' || substr(md5(random()::text), 1, 20),
    property_id text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(property_id, user_id) -- Ensures one inquiry per user per property
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON inquiries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own inquiries
CREATE POLICY "Users can view their own inquiries" ON inquiries
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only create inquiries for themselves
CREATE POLICY "Users can create their own inquiries" ON inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own inquiries
CREATE POLICY "Users can update their own inquiries" ON inquiries
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own inquiries
CREATE POLICY "Users can delete their own inquiries" ON inquiries
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample inquiries for testing
-- Note: Replace 'user_agent_001' with actual user IDs from your users table
INSERT INTO inquiries (id, property_id, user_id, message, status, created_at) VALUES
('inq_001', 'prop_001', 'user_agent_001', 'I am interested in this property. Can you provide more details about the neighborhood?', 'pending', NOW() - INTERVAL '2 days'),
('inq_002', 'prop_003', 'user_agent_001', 'Is this property still available? I would like to schedule a viewing.', 'contacted', NOW() - INTERVAL '1 day'),
('inq_003', 'prop_005', 'user_agent_002', 'What are the maintenance charges for this property?', 'pending', NOW() - INTERVAL '3 days'),
('inq_004', 'prop_002', 'user_agent_002', 'I am interested in this property. Please contact me.', 'closed', NOW() - INTERVAL '5 days'),
('inq_005', 'prop_006', 'user_agent_003', 'Can you provide information about nearby schools and hospitals?', 'pending', NOW() - INTERVAL '1 day');

-- Grant necessary permissions
GRANT ALL ON inquiries TO authenticated;
GRANT USAGE ON SEQUENCE inquiries_id_seq TO authenticated; 