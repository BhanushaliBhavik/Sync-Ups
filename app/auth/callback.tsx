import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../hooks/useAuth';
import { navigationService } from '../../services/navigationService';

export default function AuthCallback() {
  const authStore = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔗 Auth callback triggered - handling email confirmation or OAuth');
      
      // Wait a moment for auth state to be processed by the auth listener
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentUser = authStore.getCurrentUser();
      console.log('📊 Auth callback: User state after delay:', {
        hasUser: !!currentUser,
        isConfirmed: !!authStore.user,
        isWaitingForConfirmation: authStore.isWaitingForConfirmation
      });
      
      if (authStore.user) {
        // User is confirmed and signed in
        console.log('✅ Auth callback: User confirmed, checking preferences setup');
        
        // Check if user should be redirected to preferences
        const shouldRedirect = await navigationService.shouldRedirectToPreferences(authStore.user.id);
        
        if (shouldRedirect) {
          console.log('📍 Auth callback: Redirecting to preferences');
          router.replace('/property-preferences');
        } else {
          console.log('🏠 Auth callback: Redirecting to search');
          router.replace('/(tabs)/search');
        }
      } else if (authStore.isWaitingForConfirmation) {
        // User is still waiting for confirmation
        console.log('📧 Auth callback: User still needs to confirm email, redirecting to signup');
        router.replace('/auth/signup');
      } else {
        // No user found, redirect to signin
        console.log('🔐 Auth callback: No user found, redirecting to signin');
        router.replace('/auth/signin');
      }
    };

    handleCallback();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center">
        <View className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <Text className="text-lg text-text-primary mb-2">Completing Authentication...</Text>
        <Text className="text-sm text-text-secondary text-center px-6">
          Please wait while we finish setting up your account
        </Text>
      </View>
    </SafeAreaView>
  );
} 