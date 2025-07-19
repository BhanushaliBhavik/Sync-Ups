-- Seed Wishlist Data for Supabase Database
-- This script inserts sample wishlist items into the favorites table

-- Insert sample wishlist items (favorites)
-- Note: Replace 'user_agent_001' with actual user IDs from your users table
INSERT INTO favorites (id, property_id, user_id, created_at) VALUES
-- User 1's wishlist
('fav_001', 'prop_001', 'user_agent_001', NOW() - INTERVAL '5 days'),
('fav_002', 'prop_003', 'user_agent_001', NOW() - INTERVAL '3 days'),
('fav_003', 'prop_005', 'user_agent_001', NOW() - INTERVAL '1 day'),

-- User 2's wishlist
('fav_004', 'prop_002', 'user_agent_002', NOW() - INTERVAL '4 days'),
('fav_005', 'prop_006', 'user_agent_002', NOW() - INTERVAL '2 days'),
('fav_006', 'prop_008', 'user_agent_002', NOW() - INTERVAL '6 hours'),

-- User 3's wishlist
('fav_007', 'prop_004', 'user_agent_003', NOW() - INTERVAL '7 days'),
('fav_008', 'prop_007', 'user_agent_003', NOW() - INTERVAL '2 days'),
('fav_009', 'prop_009', 'user_agent_003', NOW() - INTERVAL '1 day'),
('fav_010', 'prop_010', 'user_agent_003', NOW() - INTERVAL '12 hours');

-- Optional: Add a notes column to favorites table if you want notes functionality
-- ALTER TABLE favorites ADD COLUMN notes TEXT;

-- Optional: Add some sample notes (uncomment if you added the notes column)
-- UPDATE favorites SET notes = 'Love the city views!' WHERE id = 'fav_001';
-- UPDATE favorites SET notes = 'Perfect for family' WHERE id = 'fav_002';
-- UPDATE favorites SET notes = 'Great location near downtown' WHERE id = 'fav_004';
-- UPDATE favorites SET notes = 'Beautiful waterfront property' WHERE id = 'fav_005';
-- UPDATE favorites SET notes = 'Modern design, great amenities' WHERE id = 'fav_007'; 