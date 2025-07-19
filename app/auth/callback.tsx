import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthCallback() {
  useEffect(() => {
    // This component handles OAuth callbacks
    // The actual auth state will be managed by the Supabase auth listener
    // Redirect to the search screen after a brief delay
    const timer = setTimeout(() => {
      router.replace('/(tabs)/search');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <View className="w-16 h-16 border-4 border-blue-600 border-t-blue-200 rounded-full mb-4" />
        <Text className="text-lg text-gray-600">Completing sign in...</Text>
      </View>
    </SafeAreaView>
  );
} 