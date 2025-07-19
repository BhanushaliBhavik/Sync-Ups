

import { preferencesDB } from '../preferencesDB.js';

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

    console.log(`🔍 Checking preferences existence for user: ${userId}`);

    // Check if preferences exist
    const exists = preferencesDB.exists(userId);
    
    console.log(`✅ Preferences existence check result: ${exists}`);
    
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