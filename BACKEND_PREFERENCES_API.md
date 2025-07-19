# Backend Preferences API Implementation

## 🎯 **Overview**

To solve the authentication mismatch issue, preferences are now moved to your backend API instead of Supabase. This creates a consistent architecture where both user creation and preferences use your backend.

## 🛠️ **Required API Endpoints**

Add these endpoints to your backend at `https://home-hub-ten.vercel.app`:

### **1. GET /api/user/preferences**

**Purpose:** Fetch user preferences

**URL:** `GET /api/user/preferences?userId={userId}`

**Headers:**
```
Content-Type: application/json
X-User-ID: {userId}
```

**Response (200 OK):**
```json
{
  "preferences": {
    "id": "pref_123",
    "userId": "016da864-6e60-4a29-8a89-4365dd9b9756",
    "preferred_location": "New York, NY",
    "location_type": ["Downtown", "Suburbs"],
    "home_types": ["Apartment", "House"],
    "min_price": 300000,
    "max_price": 700000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym"],
    "latitude": 40.7128,
    "longitude": -74.0060,
    "created_at": "2025-07-19T13:00:00Z",
    "updated_at": "2025-07-19T13:00:00Z"
  }
}
```

**Response (404 Not Found):** No preferences exist for user

### **2. POST /api/user/preferences**

**Purpose:** Save/update user preferences

**URL:** `POST /api/user/preferences`

**Headers:**
```
Content-Type: application/json
X-User-ID: {userId}
```

**Request Body:**
```json
{
  "userId": "016da864-6e60-4a29-8a89-4365dd9b9756",
  "preferred_location": "New York, NY",
  "location_type": ["Downtown", "Suburbs"],
  "home_types": ["Apartment", "House"],
  "min_price": 300000,
  "max_price": 700000,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["Parking", "Gym"],
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (200 OK):**
```json
{
  "preferences": {
    "id": "pref_123",
    "userId": "016da864-6e60-4a29-8a89-4365dd9b9756",
    "preferred_location": "New York, NY",
    "location_type": ["Downtown", "Suburbs"],
    "home_types": ["Apartment", "House"],
    "min_price": 300000,
    "max_price": 700000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym"],
    "latitude": 40.7128,
    "longitude": -74.0060,
    "created_at": "2025-07-19T13:00:00Z",
    "updated_at": "2025-07-19T13:00:00Z"
  }
}
```

### **3. GET /api/user/preferences/exists (Optional)**

**Purpose:** Check if user has preferences

**URL:** `GET /api/user/preferences/exists?userId={userId}`

**Headers:**
```
Content-Type: application/json
X-User-ID: {userId}
```

**Response (200 OK):**
```json
{
  "exists": true
}
```

## 💾 **Database Schema**

Add a `user_preferences` table to your backend database:

### **SQL Schema:**
```sql
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_location TEXT,
    location_type TEXT[] DEFAULT '{}',
    home_types TEXT[] DEFAULT '{}',
    min_price INTEGER DEFAULT 0,
    max_price INTEGER DEFAULT 0,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    amenities TEXT[] DEFAULT '{}',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### **Prisma Schema (if using Prisma):**
```prisma
model UserPreferences {
  id                 String   @id @default(uuid())
  userId             String   @unique @map("user_id")
  preferredLocation  String?  @map("preferred_location")
  locationType       String[] @map("location_type")
  homeTypes          String[] @map("home_types")
  minPrice           Int      @default(0) @map("min_price")
  maxPrice           Int      @default(0) @map("max_price")
  bedrooms           Int      @default(0)
  bathrooms          Int      @default(0)
  amenities          String[]
  latitude           Decimal? @db.Decimal(10, 8)
  longitude          Decimal? @db.Decimal(11, 8)
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")
  
  user Users @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_preferences")
}
```

## 🔧 **Implementation Example**

### **Next.js API Route: `/api/user/preferences.js`**

```javascript
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.headers['x-user-id'] || req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return await getPreferences(req, res, userId);
    } else if (req.method === 'POST') {
      return await savePreferences(req, res, userId);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function getPreferences(req, res, userId) {
  // Check if user exists
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get preferences
  const preferences = await getPreferencesByUserId(userId);
  
  if (!preferences) {
    return res.status(404).json({ error: 'No preferences found' });
  }

  return res.status(200).json({ preferences });
}

async function savePreferences(req, res, userId) {
  const preferencesData = req.body;
  
  // Validate user exists
  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Validate request data
  if (preferencesData.userId !== userId) {
    return res.status(400).json({ error: 'User ID mismatch' });
  }

  // Save or update preferences
  const preferences = await upsertPreferences(userId, preferencesData);
  
  return res.status(200).json({ preferences });
}

// Implement these functions based on your database
async function getUserById(userId) {
  // Example: return await db.users.findUnique({ where: { id: userId } });
}

async function getPreferencesByUserId(userId) {
  // Example: return await db.userPreferences.findUnique({ where: { userId } });
}

async function upsertPreferences(userId, data) {
  // Example: return await db.userPreferences.upsert({
  //   where: { userId },
  //   update: { ...data, updatedAt: new Date() },
  //   create: { ...data, userId, createdAt: new Date(), updatedAt: new Date() }
  // });
}
```

## 🧪 **Testing**

Test your endpoints:

### **Test GET:**
```bash
curl -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756" \
  "https://home-hub-ten.vercel.app/api/user/preferences?userId=016da864-6e60-4a29-8a89-4365dd9b9756"
```

### **Test POST:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756" \
  -d '{
    "userId": "016da864-6e60-4a29-8a89-4365dd9b9756",
    "preferred_location": "Test Location",
    "location_type": ["Downtown"],
    "home_types": ["Apartment"],
    "min_price": 300000,
    "max_price": 700000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking"]
  }' \
  "https://home-hub-ten.vercel.app/api/user/preferences"
```

## ✅ **Expected Results**

After implementing these endpoints:

```
✅ No more "Auth session missing" errors
✅ Preferences save to your backend (not Supabase)  
✅ Consistent authentication using your user system
✅ User preferences load correctly on app restart
✅ Complete integration with your existing backend
```

## 🎯 **Benefits of This Approach**

1. **Consistent Architecture**: All user data in your backend
2. **No Auth Conflicts**: Single authentication system
3. **Better Control**: Full control over preferences data
4. **Easier Maintenance**: All APIs in one place
5. **Production Ready**: No dependency on mixed systems

**Once you implement these endpoints, preferences will work seamlessly with your existing user system!** 🚀 