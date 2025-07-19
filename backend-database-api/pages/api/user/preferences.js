import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for backend API
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get user ID from header or query
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    console.log(`📊 Preferences API - ${req.method} request for user: ${userId}`);

    if (req.method === 'GET') {
      // GET /api/user/preferences - Retrieve user preferences from database
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found - this is normal for new users
          console.log(`📝 No preferences found for user: ${userId}`);
          return res.status(404).json({ 
            error: 'No preferences found' 
          });
        }
        
        console.error('❌ Database error fetching preferences:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch preferences' 
        });
      }

      console.log('✅ Preferences retrieved successfully from database');
      return res.status(200).json({ 
        preferences 
      });

    } else if (req.method === 'POST') {
      // POST /api/user/preferences - Save user preferences to database
      const {
        preferred_location,
        location_type,
        home_types,
        min_price,
        max_price,
        bedrooms,
        bathrooms,
        amenities,
        latitude,
        longitude,
        ...otherData
      } = req.body;

      // Validate required fields
      if (!preferred_location) {
        return res.status(400).json({ 
          error: 'Preferred location is required' 
        });
      }

      // Prepare preferences object for database
      const preferencesData = {
        user_id: userId,
        preferred_location,
        location_type: location_type || [],
        home_types: home_types || [],
        min_price: min_price || 0,
        max_price: max_price || 0,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        amenities: amenities || [],
        latitude: latitude || null,
        longitude: longitude || null,
        ...otherData
      };

      console.log('💾 Saving preferences to database:', JSON.stringify(preferencesData, null, 2));

      // Use upsert (insert or update) since users can only have one preference record
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .upsert(preferencesData, { 
          onConflict: 'user_id',
          returning: 'minimal' 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error saving preferences:', error);
        return res.status(500).json({ 
          error: 'Failed to save preferences' 
        });
      }

      console.log('✅ Preferences saved successfully to database:', JSON.stringify(preferences, null, 2));
      
      return res.status(200).json({ 
        preferences 
      });

    } else {
      return res.status(405).json({ 
        error: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('❌ Preferences API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
} 