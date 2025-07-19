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
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
        firstName: authData.user.user_metadata?.firstName || '',
        lastName: authData.user.user_metadata?.lastName || '',
        createdAt: authData.user.created_at || '',
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      return handleAuthError(error);
    }
  },

  async signUp(data: SignUpData): Promise<User> {
    try {
      const { email, password, firstName, lastName } = data;
      
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
      
      if (!firstName?.trim()) {
        throw new AuthError('First name is required');
      }
      
      if (!lastName?.trim()) {
        throw new AuthError('Last name is required');
      }
      
      console.log('Attempting to sign up user:', email);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
          // Temporarily disable email confirmation for testing
          emailRedirectTo: undefined,
        },
      });

      console.log('Sign up response:', { authData, error });

      if (error) {
        console.error('Sign up error:', error);
        
        // Handle specific signup errors
        if (error.message.includes('User already registered')) {
          throw new AuthError('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('Invalid email')) {
          throw new AuthError('Please enter a valid email address.');
        } else if (error.message.includes('Password')) {
          throw new AuthError('Password must be at least 6 characters long.');
        }
        
        handleAuthError(error);
      }

      if (!authData.user) {
        throw new AuthError('Sign up failed. Please try again.');
      }

      console.log('Sign up successful, user created:', authData.user.id);

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        createdAt: authData.user.created_at || '',
      };
    } catch (error) {
      console.error('Sign up process error:', error);
      if (error instanceof AuthError) throw error;
      return handleAuthError(error);
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
        firstName: user.user_metadata?.firstName || '',
        lastName: user.user_metadata?.lastName || '',
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
        scheme: 'realestate', // This should match your app scheme in app.json
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
      try {
        if (session?.user) {
          callback({
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || '',
            lastName: session.user.user_metadata?.lastName || '',
            createdAt: session.user.created_at || '',
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    });
  },
}; 