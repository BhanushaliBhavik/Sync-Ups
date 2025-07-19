# Deploy User Preferences API

## 🚀 Quick Deployment Guide

### Step 1: Copy Files to Backend

Copy these files from your frontend project to your backend project:

```bash
# In your backend project, create the directory structure:
mkdir -p pages/api/user/preferences

# Copy the files:
cp /path/to/frontend/api/user/preferences.js pages/api/user/
cp /path/to/frontend/api/user/preferencesDB.js pages/api/user/
cp /path/to/frontend/api/user/preferences/exists.js pages/api/user/preferences/
```

### Step 2: Verify File Structure

Your backend should have this structure:

```
your-backend-project/
├── pages/
│   └── api/
│       ├── auth/
│       │   └── signup.js          # Your existing endpoint
│       ├── properties/            # Your existing endpoints
│       └── user/                  # NEW: Add these files
│           ├── preferences.js     # Main preferences API
│           ├── preferencesDB.js   # Shared database module
│           └── preferences/
│               └── exists.js      # Existence check API
```

### Step 3: Deploy

Deploy your backend using your normal process:

```bash
# If using Vercel CLI:
vercel --prod

# Or commit and push if using Git auto-deploy:
git add .
git commit -m "Add user preferences API endpoints"
git push
```

### Step 4: Test Endpoints

Once deployed, test the endpoints:

```bash
# Test 1: Check preferences exist (should be false initially)
curl -X GET "https://home-hub-ten.vercel.app/api/user/preferences/exists" \
  -H "X-User-ID: your-user-id"

# Test 2: Save preferences
curl -X POST "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: your-user-id" \
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

# Test 3: Get preferences (should work after saving)
curl -X GET "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "X-User-ID: your-user-id"
```

### Step 5: Test in Your App

Once the backend endpoints are live, your React Native app should work:

1. **Signup** → User created ✅ (already working)
2. **Navigate to preferences** ✅ (already working)
3. **Save preferences** → Should work now! ✅
4. **Navigation after save** → Should work! ✅

---

## 🔧 Troubleshooting

### Still getting 405 errors?

1. **Check deployment**: Ensure files are in the correct `pages/api/` structure
2. **Check file names**: Must match exactly: `preferences.js`, `exists.js`
3. **Check imports**: Ensure `preferencesDB.js` is in the right location
4. **Restart/redeploy**: Sometimes Vercel needs a fresh deployment

### Test deployment status:

```bash
# Quick check if endpoints exist:
curl -I https://home-hub-ten.vercel.app/api/user/preferences
# Should return 400 (missing user ID) instead of 404
```

### Expected responses after deployment:

- **Before deployment**: `405` with `x-matched-path: /404` 
- **After deployment**: `400` with `User ID is required`

---

## 📊 Success Indicators

✅ **Backend deployed successfully when:**
- `GET /api/user/preferences` returns `400` (not `405`)
- `POST /api/user/preferences` accepts data
- Your React Native app can save preferences
- No more "Failed to save preferences" errors

🎉 **Your app will then work end-to-end:**
Signup → Email confirmation → Preferences screen → Save preferences → Navigate to main app 