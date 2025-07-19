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
import MapPicker from '../components/MapPicker';
import { useAuthStore } from '../hooks/useAuth';
import { LocationResult, locationService } from '../services/locationService';
import { navigationService } from '../services/navigationService';
import { preferencesService } from '../services/preferencesService';

interface PropertyPreferences {
  location: string;
  locationTags: string[];
  homeTypes: string[];
  minPrice: string;
  maxPrice: string;
  priceRanges: string[];
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export default function PropertyPreferences() {
  const authStore = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Check if we're in edit mode (accessed from profile)
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = mode === 'edit';
  
  const [preferences, setPreferences] = useState({
    location: '',
    locationTags: [] as string[],
    homeTypes: [] as string[],
    minPrice: isEditMode ? 'No minimum' : '',
    maxPrice: isEditMode ? 'No maximum' : '',
    priceRanges: [] as string[],
    bedrooms: isEditMode ? 'Any' : '',
    bathrooms: isEditMode ? 'Any' : '',
    amenities: [] as string[],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [locationSearchResults, setLocationSearchResults] = useState<LocationResult[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const locationTags = ['Downtown', 'Suburbs', 'Near Transit', 'Waterfront'];
  const homeTypes = ['House', 'Apartment', 'Condo', 'Townhouse'];
  const priceRanges = ['Under $300K', '$300K - $500K', '$500K - $750K', '$750K+'];
  const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
  const bathroomOptions = ['Any', '1', '1.5', '2', '2.5', '3', '3.5', '4+'];
  const amenitiesList = [
    { id: 'parking', label: 'Parking' },
    { id: 'pool', label: 'Pool' },
    { id: 'gym', label: 'Gym' },
    { id: 'garden', label: 'Garden/Yard' },
    { id: 'petFriendly', label: 'Pet Friendly' },
    { id: 'fireplace', label: 'Fireplace' },
  ];

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

  // Load existing preferences if user is logged in
  useEffect(() => {
    const loadPreferences = async () => {
      const currentUser = authStore.getCurrentUser();
      
      if (currentUser?.id) {
        try {
          const existingPreferences = await preferencesService.getPreferences(currentUser.id);
          if (existingPreferences) {
            setPreferences({
              location: existingPreferences.location,
              locationTags: existingPreferences.location_tags,
              homeTypes: existingPreferences.home_types,
              minPrice: existingPreferences.min_price,
              maxPrice: existingPreferences.max_price,
              priceRanges: existingPreferences.price_ranges,
              bedrooms: existingPreferences.bedrooms,
              bathrooms: existingPreferences.bathrooms,
              amenities: existingPreferences.amenities,
              latitude: existingPreferences.latitude,
              longitude: existingPreferences.longitude,
            });
          }
        } catch (error: any) {
          console.log('Unable to load existing preferences:', error.message);
          // Don't show error to user for this, just use defaults
        }
      }
    };

    loadPreferences();
  }, [authStore.user, authStore.unconfirmedUser]);

  const handleLocationSearch = async (query: string) => {
    setPreferences(prev => ({ ...prev, location: query }));
    
    if (query.length < 2) {
      setLocationSearchResults([]);
      setShowLocationDropdown(false);
      return;
    }

    setIsSearchingLocation(true);
    setShowLocationDropdown(true);
    
    try {
      const results = await locationService.searchLocations(query);
      setLocationSearchResults(results);
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setPreferences(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
    setShowLocationDropdown(false);
    setLocationSearchResults([]);
  };

  const handleMapLocationSelect = (location: { name: string; latitude: number; longitude: number }) => {
    setPreferences(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
    setShowMapModal(false);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const address = await locationService.reverseGeocode(location.latitude, location.longitude);
        setPreferences(prev => ({
          ...prev,
          location: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        Alert.alert('Success', 'Current location has been set as your preferred location.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location. Please check your location permissions.');
    }
  };

  const toggleLocationTag = (tag: string) => {
    setPreferences(prev => ({
      ...prev,
      locationTags: prev.locationTags.includes(tag)
        ? prev.locationTags.filter(t => t !== tag)
        : [...prev.locationTags, tag]
    }));
  };

  const toggleHomeType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      homeTypes: prev.homeTypes.includes(type)
        ? prev.homeTypes.filter(t => t !== type)
        : [...prev.homeTypes, type]
    }));
  };

  const togglePriceRange = (range: string) => {
    setPreferences(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(range)
        ? prev.priceRanges.filter(r => r !== range)
        : [...prev.priceRanges, range]
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSavePreferences = async () => {
    const currentUser = authStore.getCurrentUser();
    
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please sign in to save preferences');
      return;
    }

    setIsLoading(true);
    try {
      await preferencesService.savePreferences(currentUser.id, {
        location: preferences.location,
        location_tags: preferences.locationTags,
        home_types: preferences.homeTypes,
        min_price: preferences.minPrice,
        max_price: preferences.maxPrice,
        price_ranges: preferences.priceRanges,
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
      Alert.alert(
        'Save Failed', 
        error.message || 'Failed to save preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
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

          {/* Preferred Location */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="location" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Preferred Location
              </Text>
            </View>
            
            <View className="relative mb-4">
              <TextInput
                className="w-full p-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base pr-24"
                placeholder="Enter city, neighborhood, or ZIP code"
                placeholderTextColor="#9CA3AF"
                value={preferences.location}
                onChangeText={handleLocationSearch}
                onFocus={() => setShowLocationDropdown(locationSearchResults.length > 0)}
              />
              <View className="absolute right-3 top-3 flex-row">
                {isSearchingLocation && <ActivityIndicator size="small" color="#6B7280" />}
                <TouchableOpacity onPress={() => setShowMapModal(true)} className="ml-2">
                  <Ionicons name="map" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUseCurrentLocation} className="ml-2">
                  <Ionicons name="locate" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Search Dropdown */}
            {showLocationDropdown && (
              <View className="mb-4 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48">
                <View className="overflow-hidden">
                  {isSearchingLocation ? (
                    <View className="p-4 items-center">
                      <ActivityIndicator size="small" color="#6B7280" />
                      <Text className="text-gray-600 mt-2">Searching...</Text>
                    </View>
                  ) : locationSearchResults.length > 0 ? (
                    <View>
                      {locationSearchResults.map((item, index) => (
                        <TouchableOpacity
                          key={item.id}
                          className={`p-3 ${index < locationSearchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                          onPress={() => handleLocationSelect(item)}
                        >
                          <Text className="font-medium text-gray-900">{item.name}</Text>
                          {item.address && (
                            <Text className="text-sm text-gray-600 mt-1">{item.address}</Text>
                          )}
                          <Text className="text-xs text-blue-600 mt-1 capitalize">{item.type}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View className="p-4">
                      <Text className="text-gray-600 text-center">No results found</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Location Coordinates Display */}
            {preferences.latitude && preferences.longitude && (
              <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-green-800 text-sm ml-2">
                    Location set: {preferences.latitude.toFixed(4)}, {preferences.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row flex-wrap gap-2">
              {locationTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className={`px-4 py-2 rounded-full border ${
                    preferences.locationTags.includes(tag)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => toggleLocationTag(tag)}
                >
                  <Text className={`font-medium ${
                    preferences.locationTags.includes(tag) ? 'text-white' : 'text-gray-700'
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
              <Ionicons name="home" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Home Type
              </Text>
            </View>
            
            <View className="flex-row flex-wrap gap-4">
              {homeTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 min-w-[150px] p-4 border rounded-xl items-center ${
                    preferences.homeTypes.includes(type)
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-white border-gray-300'
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
                    color={preferences.homeTypes.includes(type) ? '#2563EB' : '#6B7280'} 
                  />
                  <Text className={`mt-2 font-medium ${
                    preferences.homeTypes.includes(type) ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="cash" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Price Range
              </Text>
            </View>
            
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Minimum Price</Text>
                <View className="border border-gray-300 rounded-xl">
                  <Text className="p-4 text-gray-900">{preferences.minPrice}</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Maximum Price</Text>
                <View className="border border-gray-300 rounded-xl">
                  <Text className="p-4 text-gray-900">{preferences.maxPrice}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range}
                  className={`px-4 py-2 rounded-full border ${
                    preferences.priceRanges.includes(range)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => togglePriceRange(range)}
                >
                  <Text className={`font-medium ${
                    preferences.priceRanges.includes(range) ? 'text-white' : 'text-gray-700'
                  }`}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Additional Preferences */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="options" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Additional Preferences
              </Text>
            </View>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Bedrooms</Text>
                <View className="border border-gray-300 rounded-xl">
                  <Text className="p-4 text-gray-900">{preferences.bedrooms}</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium mb-2">Bathrooms</Text>
                <View className="border border-gray-300 rounded-xl">
                  <Text className="p-4 text-gray-900">{preferences.bathrooms}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Desired Amenities */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="star" size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Desired Amenities
              </Text>
            </View>
            
            <View className="flex-row flex-wrap gap-4">
              {amenitiesList.map((amenity) => (
                <View key={amenity.id} className="w-full flex-row items-center mb-2">
                  <TouchableOpacity
                    className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${
                      preferences.amenities.includes(amenity.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => toggleAmenity(amenity.id)}
                  >
                    {preferences.amenities.includes(amenity.id) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>
                  <Text className="text-gray-700 font-medium">{amenity.label}</Text>
                </View>
              ))}
            </View>
          </View>

                        {/* Action Buttons */}
              <View className={`gap-4 mb-8 ${isEditMode ? '' : 'flex-row'}`}>
                {isEditMode ? (
                  <>
                    <TouchableOpacity
                      className={`w-full p-4 bg-primary rounded-xl mb-4 shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                      onPress={handleSavePreferences}
                      disabled={isLoading}
                    >
                      <Text className="text-surface text-center font-bold text-lg">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className="w-full p-4 bg-surface border border-border rounded-xl shadow-sm"
                      onPress={() => router.back()}
                      disabled={isLoading}
                    >
                      <Text className="text-text-primary text-center font-semibold text-lg">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      className={`flex-1 p-4 bg-surface border border-border rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                      onPress={handleSkip}
                      disabled={isLoading}
                    >
                      <Text className="text-text-primary text-center font-semibold text-lg">
                        Skip
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className={`flex-1 p-4 bg-accent rounded-xl shadow-sm ${isLoading ? 'opacity-50' : ''}`}
                      onPress={handleSavePreferences}
                      disabled={isLoading}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="search" size={20} color="white" />
                        <Text className="text-surface text-center font-bold text-lg ml-2">
                          {isLoading ? 'Saving...' : 'Find Homes'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
        </View>
      </ScrollView>

      {/* Map Picker Modal */}
      <MapPicker
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={preferences.location}
        initialCoords={preferences.latitude && preferences.longitude ? {
          latitude: preferences.latitude,
          longitude: preferences.longitude
        } : undefined}
      />
    </SafeAreaView>
  );
} 