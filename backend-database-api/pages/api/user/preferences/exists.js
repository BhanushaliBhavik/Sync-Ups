import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for backend API
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    // Get user ID from header or query
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    console.log(`🔍 Checking preferences existence in database for user: ${userId}`);

    // Check if preferences exist in database
    const { data, error, count } = await supabase
      .from('user_preferences')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Database error checking preferences existence:', error);
      return res.status(500).json({ 
        error: 'Failed to check preferences existence' 
      });
    }

    const exists = count > 0;
    console.log(`✅ Preferences existence check result from database: ${exists}`);
    
    return res.status(200).json({ 
      exists 
    });

  } catch (error) {
    console.error('❌ Preferences existence check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
} 