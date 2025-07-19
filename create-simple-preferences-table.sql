-- Simple user_preferences table (without latitude/longitude)
-- Run this in Supabase Dashboard → SQL Editor

DROP TABLE IF EXISTS user_preferences CASCADE;

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferred_location TEXT NOT NULL,
  location_type TEXT[] DEFAULT '{}',
  home_types TEXT[] DEFAULT '{}',
  min_price INTEGER DEFAULT 0,
  max_price INTEGER DEFAULT 0,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One preference per user
CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id); 