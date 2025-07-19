# Deploy Database-Backed User Preferences API

## 🎯 **Overview**

This guide will help you deploy **real database-backed API endpoints** that store preferences **persistently** in your database, fixing the 405 errors and making preferences persist properly.

---

## 📋 **Step 1: Create Database Table**

**Run this SQL in your Supabase Dashboard** (or your database):

```sql
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
```

---

## 🗂️ **Step 2: Copy API Files to Backend**

Copy these 2 files to your backend project:

### **File 1: `pages/api/user/preferences.js`**
```javascript
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
```

### **File 2: `pages/api/user/preferences/exists.js`**
```javascript
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
```

---

## 🔑 **Step 3: Configure Environment Variables**

Add these to your **backend project's `.env` file**:

```bash
# Supabase Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative names (if your backend uses these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important:** Use `SUPABASE_SERVICE_ROLE_KEY` for backend APIs to bypass Row Level Security.

---

## 📦 **Step 4: Install Dependencies**

In your **backend project**, ensure you have the Supabase client:

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

---

## 🚀 **Step 5: Deploy Backend**

Deploy your backend using your normal process:

```bash
# If using Vercel CLI:
vercel --prod

# Or commit and push if using Git auto-deploy:
git add .
git commit -m "Add database-backed user preferences API"
git push
```

---

## 🧪 **Step 6: Test Deployment**

Once deployed, test the endpoints:

```bash
# Test 1: Should return 400 (not 405) once deployed
curl -I https://home-hub-ten.vercel.app/api/user/preferences

# Test 2: Save preferences to database
curl -X POST "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756" \
  -d '{
    "preferred_location": "San Francisco, CA",
    "location_type": ["Downtown"],
    "home_types": ["Apartment"],
    "min_price": 300000,
    "max_price": 800000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym"]
  }'

# Test 3: Get preferences from database
curl -X GET "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756"
```

---

## 🎉 **Expected Results**

### **Before Deployment:**
- ❌ Status: `405` with `x-matched-path: /404`
- ❌ Error: "Failed to save preferences. Please try again."
- ❌ Preferences don't persist

### **After Deployment:**
- ✅ Status: `200` or `400` (not `405`)
- ✅ Success: "Preferences saved successfully!"
- ✅ **Preferences persist in database** 🗄️
- ✅ **User can reload app and preferences remain** 💾

---

## 🔄 **Your App Flow Will Work:**

1. **Signup** → User created ✅ (already working)
2. **Navigate to preferences** ✅ (already working)
3. **Save preferences** → **Stored in database** ✅
4. **App restart** → **Preferences still there** ✅
5. **Navigation after save** → Works perfectly ✅

---

## 🔧 **Troubleshooting**

### Still getting 405 errors?
1. Ensure files are in correct `pages/api/user/` structure
2. Check environment variables are set correctly
3. Verify table exists in your database
4. Check Vercel deployment logs

### Database connection issues?
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` 
2. Test database connection in Supabase dashboard
3. Ensure table `user_preferences` exists

### Preferences not persisting?
1. Check database logs in Supabase dashboard
2. Verify unique constraint on `user_id` is working
3. Test direct database queries to confirm data is stored

---

**Ready to deploy? Copy the SQL and 2 JavaScript files to your backend, configure environment variables, and deploy!** 🚀 