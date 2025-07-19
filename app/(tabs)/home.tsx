import PropertyCard from '@/components/PropertyCard';
import { useTopMatches, useTrendingProperties } from '@/hooks/useProperties';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  
  // Fetch data using custom hooks
  const { 
    properties: topMatches, 
    loading: topMatchesLoading, 
    error: topMatchesError 
  } = useTopMatches();
  
  const { 
    properties: trendingProperties, 
    loading: trendingLoading, 
    error: trendingError 
  } = useTrendingProperties();

  const handleViewDetails = (propertyId: string) => {
    router.push({
      pathname: '/PropertyDetailScreen',
      params: { id: propertyId }
    });
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  const handleWishlistPress = () => {
    router.push('/(tabs)/wishlist');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-6 py-6 shadow-sm border-b border-border">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-text-primary">Find Your Dream Home</Text>
            <Text className="text-text-secondary text-base mt-1">Discover amazing properties</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
      >
        {/* Top Matches Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-text-primary">Top Matches</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary font-semibold text-base mr-1">View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#007C91" />
            </TouchableOpacity>
          </View>

          {topMatchesLoading ? (
            <View className="py-8 justify-center items-center">
              <ActivityIndicator size="large" color="#007C91" />
              <Text className="text-text-secondary text-base mt-4">Loading top matches...</Text>
            </View>
          ) : topMatchesError ? (
            <View className="py-8 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="text-text-secondary text-base mt-4 text-center">
                {topMatchesError}
              </Text>
            </View>
          ) : topMatches.length === 0 ? (
            <View className="py-8 justify-center items-center">
              <Ionicons name="home-outline" size={48} color="#6B7280" />
              <Text className="text-text-secondary text-base mt-4 text-center">
                No top matches available
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {topMatches.slice(0, 3).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </View>
          )}
        </View>

        {/* Trending Properties Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-text-primary">Trending Properties</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-primary font-semibold text-base mr-1">View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#007C91" />
            </TouchableOpacity>
          </View>

          {trendingLoading ? (
            <View className="py-8 justify-center items-center">
              <ActivityIndicator size="large" color="#007C91" />
              <Text className="text-text-secondary text-base mt-4">Loading trending properties...</Text>
            </View>
          ) : trendingError ? (
            <View className="py-8 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text className="text-text-secondary text-base mt-4 text-center">
                {trendingError}
              </Text>
            </View>
          ) : trendingProperties.length === 0 ? (
            <View className="py-8 justify-center items-center">
              <Ionicons name="trending-up-outline" size={48} color="#6B7280" />
              <Text className="text-text-secondary text-base mt-4 text-center">
                No trending properties available
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {trendingProperties.slice(0, 3).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}