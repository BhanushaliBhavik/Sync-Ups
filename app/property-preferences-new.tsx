import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../hooks/useAuth';
import { useGetPreferences, useSavePreferences } from '../hooks/usePreferences';
import { navigationService } from '../services/navigationService';

interface LocalPreferences {
  preferred_location: string;
  location_type: string[];
  home_types: string[];
  min_price: number;
  max_price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export default function PropertyPreferences() {
  const authStore = useAuthStore();
  
  // Check if we're in edit mode (accessed from profile)
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = mode === 'edit';
  
  // React Query hooks
  const { data: existingPreferences, isLoading: isLoadingPreferences } = useGetPreferences();
  const savePreferencesMutation = useSavePreferences();
  
  const [preferences, setPreferences] = useState<LocalPreferences>({
    preferred_location: '',
    location_type: [],
    home_types: [],
    min_price: isEditMode ? 300000 : 0,
    max_price: isEditMode ? 700000 : 0,
    bedrooms: isEditMode ? 1 : 0,
    bathrooms: isEditMode ? 1 : 0,
    amenities: [],
    latitude: undefined,
    longitude: undefined,
  });

  const locationTags = ['Downtown', 'Suburbs', 'Near Transit', 'Waterfront'];
  const homeTypes = ['House', 'Apartment', 'Condo', 'Townhouse'];
  const amenities = ['Parking', 'Gym', 'Pet Friendly', 'Swimming Pool', 'Balcony', 'Garden'];

  // Track when user enters this screen (only for initial setup, not edit mode)
  useFocusEffect(
    useCallback(() => {
      const currentUser = authStore.getCurrentUser();
      
      console.log('📍 PropertyPreferences: Screen focused');
      console.log('📊 PropertyPreferences: Auth state:', {
        userId: currentUser?.id,
        hasUser: !!currentUser,
        isConfirmed: !!authStore.user,
        isWaitingForConfirmation: authStore.isWaitingForConfirmation,
        isLoading: authStore.isLoading,
        isEditMode: isEditMode
      });
      
      // Only set navigation state for initial setup, not for editing
      if (!isEditMode && currentUser?.id) {
        navigationService.setPreferencesScreenActive(currentUser.id);
      } else if (isEditMode) {
        console.log('📝 Edit mode: Not updating navigation state');
      } else {
        console.warn('⚠️ PropertyPreferences: No user ID available when screen focused');
      }
    }, [authStore.user, authStore.unconfirmedUser, isEditMode])
  );

  // Load existing preferences from React Query
  useEffect(() => {
    if (existingPreferences) {
      console.log('📝 Loading existing preferences into form');
      setPreferences({
        preferred_location: existingPreferences.preferred_location || '',
        location_type: existingPreferences.location_type || [],
        home_types: existingPreferences.home_types || [],
        min_price: existingPreferences.min_price || 0,
        max_price: existingPreferences.max_price || 0,
        bedrooms: existingPreferences.bedrooms || 0,
        bathrooms: existingPreferences.bathrooms || 0,
        amenities: existingPreferences.amenities || [],
        latitude: existingPreferences.latitude,
        longitude: existingPreferences.longitude,
      });
    }
  }, [existingPreferences]);

  const toggleLocationTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      location_type: prev.location_type.includes(tag)
        ? prev.location_type.filter((t: string) => t !== tag)
        : [...prev.location_type, tag]
    }));
  };

  const toggleHomeType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      home_types: prev.home_types.includes(type)
        ? prev.home_types.filter((t: string) => t !== type)
        : [...prev.home_types, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSavePreferences = async () => {
    const currentUser = authStore.getCurrentUser();
    
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please sign in to save preferences');
      return;
    }

    try {
      await savePreferencesMutation.mutateAsync({
        preferred_location: preferences.preferred_location,
        location_type: preferences.location_type,
        home_types: preferences.home_types,
        min_price: preferences.min_price,
        max_price: preferences.max_price,
        bedrooms: preferences.bedrooms,
        bathrooms: preferences.bathrooms,
        amenities: preferences.amenities,
        latitude: preferences.latitude,
        longitude: preferences.longitude,
      });

      if (isEditMode) {
        // Edit mode - just show success and go back to profile
        Alert.alert(
          'Preferences Updated!',
          'Your property preferences have been successfully updated.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        // Initial setup mode - mark preferences as completed and handle navigation
        await navigationService.setPreferencesCompleted(currentUser.id, false);
        
        if (authStore.isWaitingForConfirmation) {
          Alert.alert(
            'Preferences Saved! 📧',
            'Your preferences are saved! Please check your email and confirm your account to start searching for homes.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Preferences Saved!',
            'Your property preferences have been saved. Let\'s find your perfect home!',
            [
              {
                text: 'Continue',
                onPress: () => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.push('/(tabs)/search');
                  }
                }
              }
            ]
          );
        }
      }
        
    } catch (error: any) {
      console.error('Save preferences error:', error.message);
      // Error is already handled by React Query mutation onError callback
    }
  };

  const handleSkip = () => {
    // Skip is only available in initial setup mode, not in edit mode
    if (isEditMode) return;
    
    const currentUser = authStore.getCurrentUser();
    
    if (authStore.isWaitingForConfirmation) {
      Alert.alert(
        'Skip Setup? 📧',
        'You can set your preferences later. Please check your email and confirm your account to complete registration.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Skip', 
            onPress: async () => {
              if (currentUser?.id) {
                console.log('🔄 User skipped preferences, marking as skipped');
                await navigationService.setPreferencesCompleted(currentUser.id, true);
              }
              // Stay on signup to show confirmation message
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Skip Setup?',
        'You can always set your preferences later in your profile.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Skip', 
            onPress: async () => {
              if (currentUser?.id) {
                console.log('🔄 User skipped preferences, marking as skipped');
                await navigationService.setPreferencesCompleted(currentUser.id, true);
              }
              
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/search');
              }
            }
          }
        ]
      );
    }
  };

  if (isLoadingPreferences) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007C91" />
          <Text className="mt-4 text-text-secondary">Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-text-primary mb-2 text-center">
              {isEditMode ? 'Edit Preferences' : 'Find Your Perfect Home'}
            </Text>
            <Text className="text-text-secondary text-lg text-center">
              {isEditMode 
                ? 'Update your preferences to get better property matches' 
                : 'Tell us your preferences to help us find the best matches for you'
              }
            </Text>
            
            {/* Email Confirmation Status */}
            {authStore.isWaitingForConfirmation && (
              <View className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="mail" size={16} color="#2563EB" />
                  <Text className="text-blue-800 text-sm text-center ml-2">
                    📧 Please check your email to confirm your account
                  </Text>
                </View>
              </View>
            )}
            
            {__DEV__ && (
              <View className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text className="text-yellow-800 text-sm text-center">
                  🚧 Dev Mode: Using mock data until API is connected
                </Text>
                <TouchableOpacity 
                  className="mt-2 p-2 bg-yellow-200 rounded"
                  onPress={() => {
                    const currentUser = authStore.getCurrentUser();
                    console.log('🔍 DEBUG STATE:');
                    console.log('Current User:', currentUser);
                    console.log('Confirmed User:', authStore.user);
                    console.log('Unconfirmed User:', authStore.unconfirmedUser);
                    console.log('Waiting for Confirmation:', authStore.isWaitingForConfirmation);
                    console.log('Auth Loading:', authStore.isLoading);
                    navigationService.debugNavigationState();
                  }}
                >
                  <Text className="text-yellow-800 text-xs text-center">Debug State</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={20} color="#007C91" />
              <Text className="text-xl font-semibold text-text-primary ml-2">
                Preferred Location
              </Text>
            </View>
            
            <TextInput
              className="w-full p-4 border border-border rounded-xl bg-surface text-text-primary text-base mb-4"
              placeholder="Enter your preferred location..."
              placeholderTextColor="#6B7280"
              value={preferences.preferred_location}
              onChangeText={(text) => setPreferences(prev => ({ ...prev, preferred_location: text }))}
            />
            
            <Text className="text-text-primary font-semibold mb-3">Location Type</Text>
            <View className="flex-row flex-wrap gap-3">
              {locationTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className={`px-4 py-2 rounded-full border ${
                    preferences.location_type.includes(tag)
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => toggleLocationTag(tag)}
                >
                  <Text className={`font-medium ${
                    preferences.location_type.includes(tag) ? 'text-surface' : 'text-text-primary'
                  }`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Home Type */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="home" size={20} color="#007C91" />
              <Text className="text-xl font-semibold text-text-primary ml-2">
                Home Type
              </Text>
            </View>
            
            <View className="flex-row flex-wrap gap-4">
              {homeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 min-w-[150px] p-4 border rounded-xl items-center ${
                    preferences.home_types.includes(type)
                      ? 'bg-blue-50 border-primary'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => toggleHomeType(type)}
                >
                  <Ionicons 
                    name={
                      type === 'House' ? 'home' :
                      type === 'Apartment' ? 'business' :
                      type === 'Condo' ? 'business-outline' :
                      'storefront'
                    } 
                    size={24} 
                    color={preferences.home_types.includes(type) ? '#007C91' : '#6B7280'} 
                  />
                  <Text className={`mt-2 font-medium ${
                    preferences.home_types.includes(type) ? 'text-primary' : 'text-text-secondary'
                  }`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="cash" size={20} color="#007C91" />
              <Text className="text-xl font-semibold text-text-primary ml-2">
                Budget
              </Text>
            </View>
            
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-text-primary font-semibold mb-3">Min Price</Text>
                <TextInput
                  className="p-4 border border-border rounded-xl bg-surface text-text-primary"
                  placeholder="$0"
                  placeholderTextColor="#6B7280"
                  value={preferences.min_price ? preferences.min_price.toString() : ''}
                  onChangeText={(text) => setPreferences(prev => ({ 
                    ...prev, 
                    min_price: text ? parseInt(text.replace(/[^0-9]/g, '')) || 0 : 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-text-primary font-semibold mb-3">Max Price</Text>
                <TextInput
                  className="p-4 border border-border rounded-xl bg-surface text-text-primary"
                  placeholder="No limit"
                  placeholderTextColor="#6B7280"
                  value={preferences.max_price ? preferences.max_price.toString() : ''}
                  onChangeText={(text) => setPreferences(prev => ({ 
                    ...prev, 
                    max_price: text ? parseInt(text.replace(/[^0-9]/g, '')) || 0 : 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Bedrooms & Bathrooms */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="bed" size={20} color="#007C91" />
              <Text className="text-xl font-semibold text-text-primary ml-2">
                Rooms
              </Text>
            </View>
            
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text className="text-text-primary font-semibold mb-3">Bedrooms</Text>
                <TextInput
                  className="p-4 border border-border rounded-xl bg-surface text-text-primary"
                  placeholder="Any"
                  placeholderTextColor="#6B7280"
                  value={preferences.bedrooms ? preferences.bedrooms.toString() : ''}
                  onChangeText={(text) => setPreferences(prev => ({ 
                    ...prev, 
                    bedrooms: text ? parseInt(text) || 0 : 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-text-primary font-semibold mb-3">Bathrooms</Text>
                <TextInput
                  className="p-4 border border-border rounded-xl bg-surface text-text-primary"
                  placeholder="Any"
                  placeholderTextColor="#6B7280"
                  value={preferences.bathrooms ? preferences.bathrooms.toString() : ''}
                  onChangeText={(text) => setPreferences(prev => ({ 
                    ...prev, 
                    bathrooms: text ? parseInt(text) || 0 : 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="star" size={20} color="#007C91" />
              <Text className="text-xl font-semibold text-text-primary ml-2">
                Amenities
              </Text>
            </View>
            
            <View className="flex-row flex-wrap gap-3">
              {amenities.map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  className={`px-4 py-2 rounded-full border ${
                    preferences.amenities.includes(amenity)
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => toggleAmenity(amenity)}
                >
                  <Text className={`font-medium ${
                    preferences.amenities.includes(amenity) ? 'text-surface' : 'text-text-primary'
                  }`}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className={`gap-4 mb-8 ${isEditMode ? '' : 'flex-row'}`}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  className={`w-full p-4 bg-primary rounded-xl mb-4 shadow-sm ${savePreferencesMutation.isPending ? 'opacity-50' : ''}`}
                  onPress={handleSavePreferences}
                  disabled={savePreferencesMutation.isPending}
                >
                  <Text className="text-surface text-center font-bold text-lg">
                    {savePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="w-full p-4 bg-surface border border-border rounded-xl shadow-sm"
                  onPress={() => router.back()}
                  disabled={savePreferencesMutation.isPending}
                >
                  <Text className="text-text-primary text-center font-semibold text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className={`flex-1 p-4 bg-surface border border-border rounded-xl shadow-sm ${savePreferencesMutation.isPending ? 'opacity-50' : ''}`}
                  onPress={handleSkip}
                  disabled={savePreferencesMutation.isPending}
                >
                  <Text className="text-text-primary text-center font-semibold text-lg">
                    Skip
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 p-4 bg-accent rounded-xl shadow-sm ${savePreferencesMutation.isPending ? 'opacity-50' : ''}`}
                  onPress={handleSavePreferences}
                  disabled={savePreferencesMutation.isPending}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="search" size={20} color="white" />
                    <Text className="text-surface text-center font-bold text-lg ml-2">
                      {savePreferencesMutation.isPending ? 'Saving...' : 'Find Homes'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 