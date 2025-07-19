-- Create user_preferences table in Supabase
CREATE TABLE IF NOT EXISTS user_preferences (
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
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index - one preference per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_location 
ON user_preferences(preferred_location);

CREATE INDEX IF NOT EXISTS idx_user_preferences_price_range 
ON user_preferences(min_price, max_price);

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can only access their own preferences
CREATE POLICY "Users can view their own preferences" 
ON user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON user_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE user_preferences IS 'User property search preferences';
COMMENT ON COLUMN user_preferences.user_id IS 'Links to auth.users.id';
COMMENT ON COLUMN user_preferences.preferred_location IS 'Primary location preference (required)';
COMMENT ON COLUMN user_preferences.location_type IS 'Array: Downtown, Suburbs, etc.';
COMMENT ON COLUMN user_preferences.home_types IS 'Array: House, Apartment, Condo, etc.';
COMMENT ON COLUMN user_preferences.amenities IS 'Array: Parking, Gym, Pool, etc.'; 