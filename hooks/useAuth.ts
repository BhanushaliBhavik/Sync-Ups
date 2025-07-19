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
      authStore.setUser(user);
      authStore.setLoading(false);
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
    
    // Get initial user state
    authService.getCurrentUser()
      .then(user => {
        if (mounted) {
          authStore.setUser(user);
          authStore.setLoading(false);
        }
      })
      .catch(error => {
        if (mounted) {
          console.warn('Failed to get initial user:', error);
          authStore.setUser(null);
          authStore.setLoading(false);
        }
      });

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        authStore.setUser(user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
}; 