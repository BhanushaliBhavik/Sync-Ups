import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onMutate: () => {
      authStore.clearAllUserData(); // Clear old user data completely
      
      // Clear React Query cache to prevent old user data from showing
      queryClient.removeQueries({ queryKey: ['preferences'] });
      console.log('🧹 Cleared all preferences cache during signup');
      
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
      console.error('Sign up error:', error);
      const message = error instanceof AuthError ? error.message : 'Sign up failed. Please try again.';
      authStore.setError(message);
      authStore.setLoading(false);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.signOut,
    onMutate: () => {
      // Get current user before clearing
      const currentUser = authStore.getCurrentUser();
      
      // Clear user-specific preferences cache
      if (currentUser?.id) {
        queryClient.removeQueries({ queryKey: ['preferences', currentUser.id] });
        console.log('🧹 Cleared preferences cache for user:', currentUser.id);
      }
      
      authStore.setLoading(true);
    },
    onSuccess: () => {
      authStore.signOut();
      authStore.setLoading(false);
    },
    onError: (error: Error) => {
      console.error('Sign out error:', error);
      const message = error instanceof AuthError ? error.message : 'Sign out failed. Please try again.';
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
        
        // Check if we already have a user in the auth store
        const existingUser = authStore.getCurrentUser();
        if (existingUser) {
          console.log('🔍 useAuthInit: User already exists in store:', existingUser.email);
          // Don't override existing user, just verify the session is still valid
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser && currentUser.id === existingUser.id) {
              console.log('✅ useAuthInit: Existing user session is valid');
            } else if (!currentUser) {
              console.log('⚠️ useAuthInit: Session expired, clearing user');
              authStore.signOut();
            }
          } catch (error) {
            console.log('ℹ️ useAuthInit: Session check failed, keeping existing user for now');
          }
        } else {
          // No existing user, try to get from Supabase
          const currentUser = await authService.getCurrentUser();
          console.log('🔍 useAuthInit: Initial user check:', currentUser ? 'Present' : 'None');
          
          if (currentUser && mounted) {
            authStore.setUser(currentUser);
            console.log('✅ useAuthInit: User restored from session');
          } else if (mounted) {
            console.log('ℹ️ useAuthInit: No session found');
          }
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
          case 'INITIAL_SESSION':
            console.log('🚀 Initial session event:', !!session);
            // Only handle initial session if we don't already have a user
            if (!authStore.getCurrentUser()) {
              if (session?.user) {
                console.log('✅ Initial session has valid user, setting in store');
                const userData = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || '',
                  createdAt: session.user.created_at || '',
                };
                authStore.setUser(userData);
              } else {
                console.log('ℹ️ Initial session has no user');
              }
            } else {
              console.log('ℹ️ User already exists in store, ignoring initial session');
            }
            break;
            
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