import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Static mock data for wishlist items
const mockWishlistItems = [
  {
    id: '1',
    property_id: '1',
    property: {
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
    }
  },
  {
    id: '2',
    property_id: '2',
    property: {
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
    }
  },
  {
    id: '3',
    property_id: '3',
    property: {
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
  }
];

// Property Card Component
const PropertyCard = ({ 
  item,
  isSelected = false,
  onSelect,
  onShare,
  onDelete
}: {
  item: any;
  isSelected?: boolean;
  onSelect: () => void;
  onShare: () => void;
  onDelete: () => void;
}) => {
  const property = item.property;
  if (!property) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return `$${price.toLocaleString()}`;
  };

  const formatSpecs = () => {
    const specs = [];
    if (property.bedrooms) specs.push(`${property.bedrooms} beds`);
    if (property.bathrooms) specs.push(`${property.bathrooms} baths`);
    if (property.square_feet) specs.push(`${property.square_feet.toLocaleString()} sq ft`);
    return specs.join(' ');
  };

  const formatLocation = () => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    return parts.join(', ');
  };

  return (
    <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 border border-gray-100">
      <View className="p-6">
        <View className="flex-row">
          {/* Left Side - Image Placeholder */}
          <TouchableOpacity className="mr-5" onPress={onSelect}>
            <View className={`relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl justify-center items-center ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
              <View className="bg-white bg-opacity-90 px-3 py-1 rounded-lg">
                <Text className="text-gray-600 text-xs font-semibold text-center">{property.property_type}</Text>
              </View>
              <TouchableOpacity className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full justify-center items-center shadow-lg">
                <Ionicons name="heart" size={12} color="#FFFFFF" />
              </TouchableOpacity>
              {isSelected && (
                <View className="absolute inset-0 bg-blue-500 bg-opacity-20 justify-center items-center rounded-xl">
                  <View className="w-8 h-8 bg-blue-500 rounded-full justify-center items-center shadow-lg">
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Middle Section - Property Details */}
          <View className="flex-1 justify-center">
            <Text className="text-xl font-bold text-gray-900 mb-2 leading-6">{property.title}</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">{formatLocation()}</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">{formatPrice(property.price)}</Text>
            <Text className="text-gray-500 text-sm font-medium">{formatSpecs()}</Text>
          </View>
          
          {/* Right Side - Action Icons */}
          <View className="justify-center space-y-3">
            <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-full justify-center items-center shadow-sm" onPress={onShare}>
              <Ionicons name="share-outline" size={22} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-red-50 rounded-full justify-center items-center shadow-sm" onPress={onDelete}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ 
  isEnabled, 
  onToggle 
}: {
  isEnabled: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity 
    className={`w-14 h-7 rounded-full shadow-sm ${isEnabled ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'}`}
    onPress={onToggle}
  >
    <View className={`w-6 h-6 bg-white rounded-full shadow-lg ${isEnabled ? 'ml-7' : 'ml-0.5'} mt-0.5`} />
  </TouchableOpacity>
);

export default function WishlistScreen() {
  const router = useRouter();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState(mockWishlistItems);

  const handlePropertySelect = (propertyId: string) => {
    if (!compareMode) return;
    
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else if (prev.length < 2) {
        return [...prev, propertyId];
      }
      return prev;
    });
  };

  const handleShare = (propertyId: string) => {
    // Handle share functionality
    console.log('Share property:', propertyId);
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const handleDelete = async (propertyId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this property from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setWishlistItems(prev => prev.filter(item => item.property_id !== propertyId));
            setSelectedProperties(prev => prev.filter(id => id !== propertyId));
          },
        },
      ]
    );
  };

  const handleCompare = () => {
    if (selectedProperties.length === 0) return;
    
    // Navigate to compare screen with selected properties
    const selectedItems = wishlistItems.filter(item => 
      selectedProperties.includes(item.property_id)
    );
    
    console.log('Compare properties:', selectedItems);
    Alert.alert('Compare', 'Compare functionality coming soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-6 shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">
              {wishlistItems.length} favorited {wishlistItems.length === 1 ? 'home' : 'homes'}
            </Text>
            <Text className="text-gray-600 text-base mt-1">Your saved properties</Text>
          </View>
          <View className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full justify-center items-center shadow-lg">
            <Ionicons name="heart" size={24} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Compare Mode Section */}
      <View className="bg-white px-6 py-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">Compare Mode</Text>
            <Text className="text-gray-600 text-base">Select up to 2 homes to compare</Text>
          </View>
          <ToggleSwitch 
            isEnabled={compareMode} 
            onToggle={() => setCompareMode(!compareMode)} 
          />
        </View>
      </View>

      {/* Compare Button */}
      {compareMode && selectedProperties.length > 0 && (
        <View className="bg-white px-6 py-4 border-b border-gray-100">
          <TouchableOpacity 
            className="bg-gradient-to-r from-blue-500 to-blue-600 py-4 rounded-xl shadow-lg"
            onPress={handleCompare}
          >
            <View className="flex-row justify-center items-center">
              <Ionicons name="git-compare" size={20} color="#FFFFFF" />
              <Text className="text-white text-center font-bold text-base ml-2">
                Compare {selectedProperties.length} Properties
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Property Listings */}
      <ScrollView 
        className="flex-1 px-6 py-6" 
        showsVerticalScrollIndicator={false}
      >
        {wishlistItems.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full justify-center items-center mb-8 shadow-lg">
              <Ionicons name="heart-outline" size={64} color="#EF4444" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">Your wishlist is empty</Text>
            <Text className="text-gray-600 text-center text-lg leading-7 mb-10 max-w-xs">
              Start exploring properties and add them to your wishlist to save them for later
            </Text>
            <TouchableOpacity 
              className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-4 rounded-xl shadow-lg"
              onPress={() => router.push('/(tabs)/search')}
            >
              <View className="flex-row items-center">
                <Ionicons name="search" size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-lg ml-2">Browse Properties</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          wishlistItems.map((item) => (
            <PropertyCard
              key={item.id}
              item={item}
              isSelected={selectedProperties.includes(item.property_id)}
              onSelect={() => handlePropertySelect(item.property_id)}
              onShare={() => handleShare(item.property_id)}
              onDelete={() => handleDelete(item.property_id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}