import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useSignOut } from '../../hooks/useAuth';
import { User } from '../../services/authService';
import { preferencesService } from '../../services/preferencesService';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const authStore = useAuthStore();
  const signOutMutation = useSignOut();

  // Monitor auth state changes
  useEffect(() => {
    const checkAuth = () => {
      setUser(authStore.user);
      setIsLoading(authStore.isLoading);
    };
    
    checkAuth();
    // Set up a simple polling mechanism to check auth state
    const interval = setInterval(checkAuth, 100);
    
    // Cleanup after a reasonable time
    const timer = setTimeout(() => {
      clearInterval(interval);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [authStore]);

  // Check if user has preferences
  useEffect(() => {
    const checkPreferences = async () => {
      if (user?.id) {
        try {
          const preferences = await preferencesService.getPreferences(user.id);
          setHasPreferences(!!preferences);
        } catch (error) {
          console.log('Could not check preferences:', error);
          setHasPreferences(false);
        }
      }
    };

    checkPreferences();
  }, [user?.id]);

  const handleManagePreferences = () => {
    router.push('/property-preferences?mode=edit');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutMutation.mutateAsync();
              router.replace('/');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <View className="w-16 h-16 border-4 border-blue-600 border-t-blue-200 rounded-full mb-4" />
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-12">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Profile
          </Text>
          <Text className="text-gray-600 text-lg">
            Manage your account settings
          </Text>
        </View>

        {/* User Info */}
        {user && (
          <View className="mb-8 p-6 bg-gray-50 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-600 mb-2">
              {user.email}
            </Text>
            <Text className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Profile Options */}
        <View className="space-y-4 mb-8">
          <TouchableOpacity className="p-4 border border-gray-300 rounded-lg flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-3">Edit Profile</Text>
          </TouchableOpacity>
          
          {/* Property Preferences */}
          {hasPreferences !== null && (
            <TouchableOpacity
              className="p-4 border border-gray-300 rounded-lg flex-row items-center justify-between"
              onPress={handleManagePreferences}
            >
              <View className="flex-row items-center">
                <Ionicons name="home-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 font-medium ml-3">
                  Property Preferences
                </Text>
              </View>
              <View className="flex-row items-center">
                {hasPreferences && (
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                )}
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity className="p-4 border border-gray-300 rounded-lg flex-row items-center">
            <Ionicons name="heart-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-3">Saved Properties</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="p-4 border border-gray-300 rounded-lg flex-row items-center">
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-3">Search History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="p-4 border border-gray-300 rounded-lg flex-row items-center">
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            <Text className="text-gray-700 font-medium ml-3">Notification Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className={`w-full p-4 bg-red-600 rounded-lg ${signOutMutation.isPending ? 'opacity-50' : ''}`}
          onPress={handleSignOut}
          disabled={signOutMutation.isPending}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {signOutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}