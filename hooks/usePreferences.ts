import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { preferencesService, PropertyPreferences } from '../services/preferencesService';

// Query keys for React Query
export const QUERY_KEYS = {
  PREFERENCES: ['preferences'] as const,
};

// Hook to get user preferences
export const useGetPreferences = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PREFERENCES,
    queryFn: preferencesService.getPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook to save/update preferences
export const useSavePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: preferencesService.savePreferences,
    onSuccess: (data: PropertyPreferences) => {
      console.log('✅ Preferences saved successfully:', data);
      
      // Update the preferences cache with new data
      queryClient.setQueryData(['preferences'], data);
      
      // Optionally refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
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

// Hook to check if user has preferences
export const useHasPreferences = () => {
  const { data: preferences, isLoading } = useGetPreferences();
  
  return {
    hasPreferences: Boolean(preferences),
    isLoading,
    preferences,
  };
}; 