import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Static mock data
const mockProperties = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1200,
    property_type: 'apartment',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94102'
  },
  {
    id: '2',
    title: 'Cozy Family Home',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1800,
    property_type: 'house',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94110'
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 2500,
    property_type: 'penthouse',
    address: '789 Pine St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94108'
  }
];

// Property Card Component
const PropertyCard = ({ 
  title, 
  location, 
  specs, 
  price, 
  isTopMatch = false, 
  showViewDetails = false,
  matchPercentage = null 
}: {
  title: string;
  location: string;
  specs: string;
  price: string;
  isTopMatch?: boolean;
  showViewDetails?: boolean;
  matchPercentage?: number | null;
}) => (
  <View className="bg-white rounded-xl shadow-sm overflow-hidden">
    {/* Property Image Placeholder */}
    <View className="relative h-48 bg-gray-100 justify-center items-center">
      <Text className="text-gray-500 text-sm">Property Image</Text>
      
      {/* AI Pick and Match Labels for Top Match */}
      {isTopMatch && (
        <>
          <View className="absolute top-3 left-3 bg-blue-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-medium">AI Pick</Text>
          </View>
          <View className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-medium">{matchPercentage}% Match</Text>
          </View>
        </>
      )}
    </View>
    
    {/* Property Details */}
    <View className="p-4">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">{title}</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text className="text-gray-600 text-sm mb-2">{location}</Text>
      <Text className="text-gray-500 text-sm mb-3">{specs}</Text>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">{price}</Text>
        {showViewDetails && (
          <TouchableOpacity className="bg-gray-900 px-4 py-2 rounded-lg">
            <Text className="text-white text-sm font-medium">View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
)

// Action Button Component
const ActionButton = ({ title, isActive, onPress }: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`px-6 py-3 rounded-lg ${isActive ? 'bg-gray-900' : 'bg-gray-100'}`}
  >
    <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
      {title}
    </Text>
  </TouchableOpacity>
)

// Utility functions for formatting
const formatLocation = (property: any) => {
  const location = [];
  if (property.address) location.push(property.address);
  if (property.city) location.push(property.city);
  if (property.state) location.push(property.state);
  return location.join(', ');
};

const formatPrice = (price: number | null) => {
  if (!price) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatSpecs = (property: any) => {
  const specs = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} beds`);
  if (property.bathrooms) specs.push(`${property.bathrooms} baths`);
  if (property.square_feet) specs.push(`${property.square_feet.toLocaleString()} sq ft`);
  return specs.join(' • ');
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('Buy')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Static implementation - no actual filtering needed
  }

  // Get top match (first property) and trending properties (next 2)
  const topMatch = mockProperties[0]
  const trendingProperties = mockProperties.slice(1, 3)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="bg-white px-4 pt-4 pb-6">
          {/* User Greeting and Navigation */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-200 rounded-full justify-center items-center mr-3">
                <Ionicons name="person" size={20} color="#6B7280" />
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Good morning</Text>
                <Text className="text-gray-900 font-semibold">Sarah</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
                <Ionicons name="notifications-outline" size={24} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
                <Ionicons name="menu-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Selector */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">Downtown, San Francisco</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Change</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3">
            <ActionButton 
              title="Buy" 
              isActive={activeTab === 'Buy'} 
              onPress={() => handleTabChange('Buy')} 
            />
            <ActionButton 
              title="Rent" 
              isActive={activeTab === 'Rent'} 
              onPress={() => handleTabChange('Rent')} 
            />
            <ActionButton 
              title="Plot" 
              isActive={activeTab === 'Plot'} 
              onPress={() => handleTabChange('Plot')} 
            />
          </View>
        </View>

        {/* Top Match Section */}
        {topMatch && (
          <View className="px-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-1">Top Match for You</Text>
            <Text className="text-gray-600 mb-4">Looks like something you'll love</Text>
            
            <PropertyCard
              title={topMatch.title}
              location={formatLocation(topMatch)}
              specs={formatSpecs(topMatch)}
              price={formatPrice(topMatch.price)}
              isTopMatch={true}
              showViewDetails={true}
              matchPercentage={90}
            />
          </View>
        )}

        {/* Trending Homes Section */}
        {trendingProperties.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Trending Homes Nearby</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              {trendingProperties.map((property) => (
                <View key={property.id}>
                  <PropertyCard
                    title={property.title}
                    location={formatLocation(property)}
                    specs={formatSpecs(property)}
                    price={formatPrice(property.price)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}