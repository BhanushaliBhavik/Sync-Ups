import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthError, authService, SignInData, SignUpData } from '../services/authService';
import { authStore } from '../stores/authStore';

export const useSignIn = () => {
  return useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onMutate: () => {
      authStore.setLoading(true);
      authStore.clearError();
    },
    onSuccess: (user) => {
      authStore.setUser(user);
      authStore.setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Sign in error:', error);
      const message = error instanceof AuthError ? error.message : 'Sign in failed. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onMutate: () => {
      authStore.clearAllUserData(); // Clear old user data completely
      authStore.setLoading(true);
    },
    onSuccess: (user) => {
      console.log('✅ useSignUp onSuccess: User processed:', user.id);
      
      // With your backend, the user is created immediately
      // We set them as the main user (not unconfirmed)
      authStore.setUser(user);
      authStore.setLoading(false);
      
      console.log('✅ User set in auth store:', user.id);
    },
    onError: (error: Error) => {
      console.error('❌ useSignUp onError:', error);
      const message = error instanceof AuthError ? error.message : 'Sign up failed. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: () => authService.signOut(),
    onMutate: () => {
      authStore.setLoading(true);
      authStore.clearError();
    },
    onSuccess: () => {
      authStore.signOut();
      authStore.setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Sign out error:', error);
      const message = error instanceof AuthError ? error.message : 'Failed to sign out. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

export const useGoogleSignIn = () => {
  return useMutation({
    mutationFn: () => authService.signInWithGoogle(),
    onMutate: () => {
      authStore.setLoading(true);
      authStore.clearError();
    },
    onSuccess: () => {
      // OAuth success will be handled by auth state change listener
      authStore.setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Google sign in error:', error);
      const message = error instanceof AuthError ? error.message : 'Google sign in failed. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

export const useAppleSignIn = () => {
  return useMutation({
    mutationFn: () => authService.signInWithApple(),
    onMutate: () => {
      authStore.setLoading(true);
      authStore.clearError();
    },
    onSuccess: () => {
      // OAuth success will be handled by auth state change listener
      authStore.setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Apple sign in error:', error);
      const message = error instanceof AuthError ? error.message : 'Apple sign in failed. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

// Hook to get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof AuthError) return false;
      return failureCount < 2;
    },
  });
};

// Hook to get auth state from store
export const useAuthStore = () => authStore;

// Hook to initialize auth state and listen to changes
export const useAuthInit = () => {
  useEffect(() => {
    let mounted = true;
    
    console.log('🔧 useAuthInit: Starting auth initialization');
    
    const initializeAuth = async () => {
      try {
        authStore.setLoading(true);
        
        // Get initial user state
        const currentUser = await authService.getCurrentUser();
        console.log('🔍 useAuthInit: Initial user check:', currentUser ? 'Present' : 'None');
        
        if (currentUser && mounted) {
          authStore.setUser(currentUser);
          console.log('✅ useAuthInit: User restored from session');
        } else if (mounted) {
          console.log('ℹ️ useAuthInit: No session found');
        }
      } catch (error) {
        console.error('❌ useAuthInit: Error getting initial user:', error);
      } finally {
        if (mounted) {
          authStore.setLoading(false);
        }
      }
    };

    // Set up Supabase auth state listener for real-time changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔄 Auth state change detected:', event, !!session);
        
        if (!mounted) return;

        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in via auth state change');
            if (session?.user) {
              const userData = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || '',
                createdAt: session.user.created_at || '',
              };
              
              // Check if this was a confirmation from an unconfirmed state
              if (authStore.isWaitingForConfirmation && authStore.unconfirmedUser) {
                console.log('🎉 Email confirmation detected! User was waiting, now confirmed');
              }
              
              authStore.setUser(userData);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 User signed out via auth state change');
            authStore.signOut();
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed');
            // Session is still valid, no action needed
            break;
            
          case 'USER_UPDATED':
            console.log('👤 User updated via auth state change');
            if (session?.user) {
              const userData = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || '',
                createdAt: session.user.created_at || '',
              };
              authStore.setUser(userData);
            }
            break;
            
          default:
            console.log('ℹ️ Unknown auth event:', event);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup function
    return () => {
      console.log('🧹 useAuthInit: Cleaning up');
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);
}; 