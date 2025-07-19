import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Enhanced error types for better handling
export class AuthError extends Error {
  code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Helper function to handle and format errors
const handleAuthError = (error: any): never => {
  console.error('Auth error:', error);
  
  if (error.message) {
    // Handle specific Supabase error messages
    let userMessage = error.message;
    
    if (error.message.includes('Invalid login credentials')) {
      userMessage = 'Invalid email or password. Please check your credentials.';
    } else if (error.message.includes('Email not confirmed')) {
      userMessage = 'Please check your email and click the confirmation link before signing in.';
    } else if (error.message.includes('User already registered')) {
      userMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.message.includes('Password should be at least')) {
      userMessage = 'Password must be at least 6 characters long.';
    } else if (error.message.includes('Unable to validate email address')) {
      userMessage = 'Please enter a valid email address.';
    } else if (error.message.includes('Signup requires a valid password')) {
      userMessage = 'Please enter a valid password.';
    } else if (error.message.includes('Only an email address or phone number should be provided')) {
      userMessage = 'Please provide either an email or phone number, not both.';
    } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    throw new AuthError(userMessage, error.code);
  }
  
  throw new AuthError('An unexpected error occurred. Please try again.');
};

export const authService = {
  async signIn(data: SignInData): Promise<User> {
    try {
      const { email, password } = data;
      
      if (!email.trim()) {
        throw new AuthError('Email is required');
      }
      
      if (!password.trim()) {
        throw new AuthError('Password is required');
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        handleAuthError(error);
      }

      if (!authData.user) {
        throw new AuthError('Sign in failed. Please try again.');
      }

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.name || '',
        createdAt: authData.user.created_at || '',
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      return handleAuthError(error);
    }
  },

  async signUp(data: SignUpData): Promise<User> {
    try {
      const { email, password, name } = data;
      
      // Validation
      if (!email.trim()) {
        throw new AuthError('Email is required');
      }
      
      if (!password.trim()) {
        throw new AuthError('Password is required');
      }
      
      if (password.length < 6) {
        throw new AuthError('Password must be at least 6 characters long');
      }
      
      if (!name?.trim()) {
        throw new AuthError('Name is required');
      }
      
      console.log('Attempting to sign up user:', email);
      
      // Use your existing backend signup endpoint
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://home-hub-ten.vercel.app';
      // Remove trailing /api if present to avoid double /api/
      const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
      const apiUrl = `${cleanBaseUrl}/api/auth/signup`;
      
      console.log('🔗 Signup API URL:', apiUrl);
      
      console.log('📤 Signup API Request - User data:', {
        email: email.trim(),
        password: '***', // Don't log password
        name: name.trim(),
        role: 'buyer'
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          name: name.trim(),
          role: 'buyer', // Always assign buyer role
          phone: null, // Optional phone field your backend expects
        }),
      });

      console.log('📥 Signup API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Signup API failed:', response.status, errorData);
        
        let errorMessage = 'Signup failed. Please try again.';
        
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          // Use the raw error text if JSON parsing fails
          if (errorData) {
            errorMessage = errorData;
          }
        }
        
        // Handle specific errors based on status code
        if (response.status === 400) {
          throw new AuthError(errorMessage);
        } else if (response.status === 409) {
          throw new AuthError(errorMessage);
        } else if (response.status === 405) {
          console.log('❌ Signup API failed:', response, e);
          throw new AuthError('Signup endpoint not available. Please contact support.');
        } else if (response.status >= 500) {
          throw new AuthError('Server error during signup. Please try again later.');
        } else {
          throw new AuthError(errorMessage);
        }
      }

      const result = await response.json();
      console.log('✅ Signup API Response Data:', {
        success: result.success,
        message: result.message,
        user: result.user ? 'Present' : 'Missing',
        isVerified: result.user?.is_verified,
        isExistingUser: result.isExistingUser || false
      });

      // Validate response structure
      if (!result.success || !result.user) {
        throw new AuthError(result.message || 'Invalid response from signup API. Please try again.');
      }

      // Handle existing user case
      if (result.isExistingUser) {
        console.log('✅ Role added to existing user successfully');
      } else {
        console.log('✅ New user created successfully');
      }

      // Handle email verification requirement
      const needsVerification = !result.user.is_verified;
      if (needsVerification) {
        console.log('📧 User needs email verification');
      } else {
        console.log('✅ User is verified and ready');
      }

      // Return user data in our expected format
      const user: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        createdAt: result.user.created_at || new Date().toISOString(),
      };

      console.log('✅ User successfully processed via backend API:', user.id);

      // Note: Your backend doesn't return a JWT token, it uses its own auth system
      console.log('ℹ️ Backend uses its own authentication system (no JWT token in response)');

      return user;

    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      console.error('❌ Unexpected signup error:', error);
      
      if (error instanceof Error && (error.message.includes('Network request failed') || error.message.includes('fetch'))) {
        throw new AuthError('Network error. Please check your internet connection and try again.');
      }
      
      throw new AuthError('An unexpected error occurred during signup. Please try again.');
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Don't log warning for expected "no session" cases
        if (error.message.includes('Auth session missing') || 
            error.message.includes('session_not_found') ||
            error.message.includes('No session available')) {
          return null;
        }
        
        console.warn('Error getting current user:', error);
        return null;
      }
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        createdAt: user.created_at || '',
      };
    } catch (error: any) {
      // Don't log warning for expected "no session" cases
      if (error.message && (
          error.message.includes('Auth session missing') || 
          error.message.includes('session_not_found') ||
          error.message.includes('No session available'))) {
        return null;
      }
      
      console.warn('Error getting current user:', error);
      return null;
    }
  },

  async signInWithGoogle(): Promise<void> {
    try {
      // Create redirect URL for your app
      const redirectUrl = makeRedirectUri({
        scheme: 'realrrestate', // This should match your app scheme in app.json
        path: '/auth/callback',
      });

      console.log('OAuth redirect URL:', redirectUrl);
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log('OAuth response data:', data);
      console.log('OAuth response error:', error);

      if (error) {
        console.error('Supabase OAuth error:', error);
        
        // Handle specific OAuth errors
        if (error.message.includes('Provider not found') || error.message.includes('google')) {
          throw new AuthError(
            'Google sign-in is not configured. Please contact support or use email/password to sign in.'
          );
        }
        
        if (error.message.includes('redirect') || error.message.includes('URL')) {
          throw new AuthError(
            'OAuth configuration error. Please try again or use email/password to sign in.'
          );
        }
        
        handleAuthError(error);
      }

      if (data?.url) {
        console.log('Opening OAuth URL in browser:', data.url);
        
        // Open the OAuth URL in the browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('Browser OAuth result:', result);

        if (result.type === 'success' && result.url) {
          // Handle the callback URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          
          console.log('OAuth callback params:', Object.fromEntries(params.entries()));
          
          if (params.get('error')) {
            const errorDesc = params.get('error_description') || params.get('error') || 'OAuth authentication failed';
            console.error('OAuth callback error:', errorDesc);
            throw new AuthError(`Google sign-in failed: ${errorDesc}`);
          }
        } else if (result.type === 'cancel') {
          throw new AuthError('Google sign-in was cancelled');
        } else if (result.type === 'dismiss') {
          throw new AuthError('Google sign-in was dismissed');
        } else {
          throw new AuthError('Google sign-in failed - please try again');
        }
      } else {
        console.error('No OAuth URL returned from Supabase');
        throw new AuthError('Failed to initiate Google sign-in. Please check your configuration.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof AuthError) throw error;
      handleAuthError(error);
    }
  },

  async signInWithApple(): Promise<void> {
    try {
      // Create redirect URL for your app
      const redirectUrl = makeRedirectUri({
        scheme: 'realestate',
        path: '/auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        handleAuthError(error);
      }

      if (data?.url) {
        // Open the OAuth URL in the browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success' && result.url) {
          // Handle the callback URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          
          if (params.get('error')) {
            throw new AuthError(params.get('error_description') || 'OAuth authentication failed');
          }
        } else if (result.type === 'cancel') {
          throw new AuthError('Apple sign-in was cancelled');
        }
      } else {
        throw new AuthError('Failed to initiate Apple sign-in');
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error);
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 AuthService: Auth state change event:', event, 'Session:', session ? 'Present' : 'None');
      
      try {
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            createdAt: session.user.created_at || '',
          };
          console.log('✅ AuthService: Calling callback with user:', user.id);
          callback(user);
        } else {
          console.log('❌ AuthService: Calling callback with null (no session)');
          callback(null);
        }
      } catch (error) {
        console.error('❌ AuthService: Error in auth state change:', error);
        callback(null);
      }
    });
  },
}; 