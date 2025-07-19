import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthStore } from '../hooks/useAuth';
import { navigationService } from '../services/navigationService';

export default function Index() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldRedirectToPreferences, setShouldRedirectToPreferences] = useState(false);
  const authStore = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Reduced wait time since signup now handles direct navigation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const currentUser = authStore.getCurrentUser();
        console.log('🔍 Auth state:', currentUser ? 'User present' : 'Not logged in');
        console.log('🔍 Is confirmed user:', !!authStore.user);
        console.log('🔍 Is waiting for confirmation:', authStore.isWaitingForConfirmation);
        console.log('📊 Auth loading state:', authStore.isLoading);
        
        // If still loading, wait a bit more
        if (authStore.isLoading) {
          console.log('⏳ Auth still loading, waiting...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (currentUser?.id) {
          console.log('👤 User ID:', currentUser.id);
          
          // Check if user should be redirected to preferences
          const shouldRedirect = await navigationService.shouldRedirectToPreferences(currentUser.id);
          console.log('🎯 Should redirect to preferences:', shouldRedirect);
          
          setShouldRedirectToPreferences(shouldRedirect);
        } else {
          console.log('❌ No user found in authStore');
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [authStore.user, authStore.unconfirmedUser, authStore.isLoading]);

  // Show loading while initializing or auth is loading
  if (isInitializing || authStore.isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
        {__DEV__ && (
          <View className="mt-2">
            <Text className="text-gray-500 text-sm text-center">
              Auth loading: {authStore.isLoading ? 'Yes' : 'No'}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Waiting for confirmation: {authStore.isWaitingForConfirmation ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </View>
    );
  }

  const currentUser = authStore.getCurrentUser();
  
  console.log('🚀 Rendering with:', { 
    hasUser: !!currentUser,
    isConfirmed: !!authStore.user,
    isWaitingForConfirmation: authStore.isWaitingForConfirmation,
    shouldRedirectToPreferences,
    authLoading: authStore.isLoading
  });

  // If user is waiting for email confirmation, show appropriate screen
  if (authStore.isWaitingForConfirmation) {
    console.log('📧 User waiting for email confirmation, staying on signup');
    return <Redirect href="/auth/signup" />;
  }

  // Redirect to preferences if user was interrupted during setup
  if (currentUser && shouldRedirectToPreferences) {
    console.log('📍 Redirecting to preferences');
    return <Redirect href="/property-preferences" />;
  }

  // Normal auth flow - only redirect to search if user is confirmed
  if (authStore.user) {
    console.log('🏠 Redirecting to search (confirmed user)');
    return <Redirect href="/(tabs)/home" />;
  }

  console.log('🔐 Redirecting to signin (not logged in)');
  return <Redirect href="/auth/signin" />;
}