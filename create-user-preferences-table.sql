-- Create user_preferences table for storing property search preferences
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

-- Create unique constraint to allow only one preference per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_location ON user_preferences(preferred_location);
CREATE INDEX IF NOT EXISTS idx_user_preferences_price_range ON user_preferences(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_user_preferences_created_at ON user_preferences(created_at);

-- Create trigger to automatically update the updated_at column
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

-- Add comments for documentation
COMMENT ON TABLE user_preferences IS 'Stores property search preferences for users';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to the user who owns these preferences';
COMMENT ON COLUMN user_preferences.preferred_location IS 'Primary location preference (required)';
COMMENT ON COLUMN user_preferences.location_type IS 'Array of location types (Downtown, Suburbs, etc.)';
COMMENT ON COLUMN user_preferences.home_types IS 'Array of home types (House, Apartment, Condo, etc.)';
COMMENT ON COLUMN user_preferences.min_price IS 'Minimum price range';
COMMENT ON COLUMN user_preferences.max_price IS 'Maximum price range';
COMMENT ON COLUMN user_preferences.bedrooms IS 'Minimum number of bedrooms';
COMMENT ON COLUMN user_preferences.bathrooms IS 'Minimum number of bathrooms';
COMMENT ON COLUMN user_preferences.amenities IS 'Array of desired amenities';
COMMENT ON COLUMN user_preferences.latitude IS 'Location latitude for geo-based searches';
COMMENT ON COLUMN user_preferences.longitude IS 'Location longitude for geo-based searches'; 