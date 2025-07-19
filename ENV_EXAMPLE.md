# Environment Variables Configuration

Create a `.env` file in your project root with the following variables:

## Supabase Configuration (Required for Auth)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Backend API Configuration (Required for User Creation)
```env
EXPO_PUBLIC_API_URL=https://home-hub-ten.vercel.app/api
```

## Example .env file:
```env
# Supabase Credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
EXPO_PUBLIC_API_URL=https://home-hub-ten.vercel.app/api
```

## How to Get Supabase Credentials:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Backend API:
- Your backend is deployed on Vercel: `https://home-hub-ten.vercel.app`
- The API will be called at `/api/users` endpoint for user creation
- Update `EXPO_PUBLIC_API_URL` if you deploy to a different domain

## ⚠️ Important:
- Restart your Expo development server after creating/updating `.env`
- The app will use Supabase for authentication and your backend for user data storage 