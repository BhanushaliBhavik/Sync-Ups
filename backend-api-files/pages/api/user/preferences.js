
import { preferencesDB } from './preferencesDB.js';

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
      // GET /api/user/preferences - Retrieve user preferences
      const preferences = preferencesDB.get(userId);
      
      if (!preferences) {
        console.log(`📝 No preferences found for user: ${userId}`);
        return res.status(404).json({ 
          error: 'No preferences found' 
        });
      }

      console.log('✅ Preferences retrieved successfully');
      return res.status(200).json({ 
        preferences 
      });

    } else if (req.method === 'POST') {
      // POST /api/user/preferences - Save user preferences
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

      // Create preferences object
      const preferences = {
        id: preferencesDB.get(userId)?.id || `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        created_at: preferencesDB.get(userId)?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...otherData
      };

      // Save to database
      preferencesDB.set(userId, preferences);
      
      console.log('✅ Preferences saved successfully:', JSON.stringify(preferences, null, 2));
      
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