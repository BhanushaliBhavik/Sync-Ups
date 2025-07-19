import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
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
      authStore.setLoading(true);
      authStore.clearError();
    },
    onSuccess: (user) => {
      console.log('✅ useSignUp onSuccess: User created:', user.id);
      
      // Check if user needs email confirmation by trying to get current session
      authService.getCurrentUser().then(confirmedUser => {
        if (confirmedUser) {
          console.log('✅ User has session - confirmed and signed in');
          authStore.setUser(user);
        } else {
          console.log('📧 User needs email confirmation - setting as unconfirmed');
          authStore.setUnconfirmedUser(user);
        }
        authStore.setLoading(false);
      }).catch(() => {
        console.log('📧 No session found - user needs email confirmation');
        authStore.setUnconfirmedUser(user);
        authStore.setLoading(false);
      });
      
      // Immediately check if user is properly set
      setTimeout(() => {
        const currentUser = authStore.getCurrentUser();
        console.log('🔍 useSignUp: Current user after setting:', currentUser ? 'Present' : 'Missing');
      }, 100);
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
      // Check if we have a current user (confirmed or unconfirmed)
      const currentUser = authStore.getCurrentUser();
      console.log('🔍 useAuthInit: Current user in store:', currentUser ? 'Present' : 'None');
      console.log('🔍 useAuthInit: Waiting for confirmation:', authStore.isWaitingForConfirmation);
      
      if (currentUser) {
        console.log('✅ useAuthInit: User already in store, skipping initial check');
        authStore.setLoading(false);
        return;
      }
      
      // Only check for stored session if no user is currently set
      try {
        console.log('🔍 useAuthInit: Checking for stored session');
        const user = await authService.getCurrentUser();
        
        if (mounted) {
          console.log('📱 useAuthInit: Retrieved user:', user ? 'Found' : 'None');
          authStore.setUser(user);
          authStore.setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.warn('❌ useAuthInit: Failed to get initial user:', error);
          // Only set user to null if there wasn't already a user
          if (!authStore.getCurrentUser()) {
            authStore.setUser(null);
          }
          authStore.setLoading(false);
        }
      }
    };

    // Small delay to let any signup/signin operations complete first
    const initTimer = setTimeout(initializeAuth, 100);

    // Listen to auth state changes
    console.log('👂 useAuthInit: Setting up auth state change listener');
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        console.log('🔄 useAuthInit: Auth state changed:', user ? 'User present' : 'No user');
        
        // Only update if we don't have an unconfirmed user waiting
        if (!authStore.isWaitingForConfirmation) {
          authStore.setUser(user);
        } else if (user) {
          // If we were waiting for confirmation and now have a user, they confirmed!
          console.log('🎉 Email confirmation completed!');
          authStore.setUser(user);
        }
      }
    });

    return () => {
      console.log('🧹 useAuthInit: Cleaning up');
      mounted = false;
      clearTimeout(initTimer);
      subscription.unsubscribe();
    };
  }, []);
}; 