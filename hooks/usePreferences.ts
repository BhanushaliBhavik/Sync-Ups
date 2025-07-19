import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { preferencesService, PropertyPreferences } from '../services/preferencesService';
import { useAuthStore } from './useAuth';

// Query keys for React Query with user-scoped caching
export const QUERY_KEYS = {
  PREFERENCES: (userId?: string) => ['preferences', userId] as const,
};

// Hook to get user preferences with user-scoped caching
export const useGetPreferences = () => {
  const authStore = useAuthStore();
  const currentUser = authStore.getCurrentUser();
  
  return useQuery({
    queryKey: QUERY_KEYS.PREFERENCES(currentUser?.id),
    queryFn: preferencesService.getPreferences,
    enabled: !!currentUser?.id, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook to save/update preferences
export const useSavePreferences = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: preferencesService.savePreferences,
    onSuccess: (data: PropertyPreferences) => {
      console.log('✅ Preferences saved successfully:', data);
      
      const currentUser = authStore.getCurrentUser();
      if (currentUser?.id) {
        // Update the user-specific preferences cache with new data
        queryClient.setQueryData(QUERY_KEYS.PREFERENCES(currentUser.id), data);
        
        // Optionally refetch to ensure consistency
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PREFERENCES(currentUser.id) });
      }
    },
    onError: (error: any) => {
      console.error('❌ Failed to save preferences:', error.message);
      
      // Don't show alert for authentication errors or expected errors - let the component handle them
      if (!error.message.includes('confirm your email') && 
          !error.message.includes('sign in') &&
          !error.message.includes('Authentication') &&
          !__DEV__) {
        Alert.alert(
          'Save Failed',
          error.message || 'Failed to save preferences. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    },
  });
};

// Hook to check if user has preferences with user-scoped caching
export const useHasPreferences = () => {
  const { data: preferences, isLoading } = useGetPreferences();
  
  return {
    hasPreferences: Boolean(preferences),
    isLoading,
    preferences,
  };
};

// Hook to clear preferences cache for a specific user
export const useClearPreferencesCache = () => {
  const queryClient = useQueryClient();
  
  return {
    clearUserPreferences: (userId?: string) => {
      if (userId) {
        console.log('🧹 Clearing preferences cache for user:', userId);
        queryClient.removeQueries({ queryKey: QUERY_KEYS.PREFERENCES(userId) });
      }
    },
    clearAllPreferences: () => {
      console.log('🧹 Clearing all preferences cache');
      queryClient.removeQueries({ queryKey: ['preferences'] });
    }
  };
}; 