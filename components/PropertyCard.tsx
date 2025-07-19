import { useWishlistStatus } from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number | null;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    address?: string;
    city?: string;
    property_images?: Array<{
      image_url: string;
      is_primary?: boolean;
    }>;
  };
  onViewDetails?: (propertyId: string) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const router = useRouter();
  
  // Use wishlist status hook
  const { 
    isInWishlist, 
    loading: wishlistLoading, 
    addToWishlist, 
    removeFromWishlist 
  } = useWishlistStatus({ propertyId: property.id });

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSpecs = () => {
    const specs = [];
    if (property.bedrooms) specs.push(`${property.bedrooms} beds`);
    if (property.bathrooms) specs.push(`${property.bathrooms} baths`);
    if (property.square_feet) specs.push(`${property.square_feet.toLocaleString()} sq ft`);
    return specs.join(' • ');
  };

  const formatLocation = () => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    return parts.join(', ');
  };

  const getPrimaryImage = () => {
    const primaryImage = property.property_images?.find(img => img.is_primary);
    return primaryImage?.image_url || property.property_images?.[0]?.image_url || null;
  };

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist();
      } else {
        await addToWishlist();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id);
    } else {
      router.push({
        pathname: '/PropertyDetailScreen',
        params: { id: property.id }
      });
    }
  };

  return (
    <View className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-4">
      {/* Image Section */}
      <View className="relative">
        <View className="w-full h-56 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center items-center">
          {getPrimaryImage() ? (
            <View className="w-full h-full bg-gray-200 justify-center items-center">
              <View className="bg-white bg-opacity-90 px-4 py-2 rounded-full">
                <Text className="text-gray-600 text-sm font-medium">Property Image</Text>
              </View>
            </View>
          ) : (
            <View className="bg-white bg-opacity-95 px-6 py-3 rounded-2xl shadow-sm">
              <Text className="text-gray-700 text-lg font-bold text-center">
                {property.title?.split(' ')[0] || 'Property'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Price Badge */}
        <View className="absolute bottom-4 left-4 bg-white bg-opacity-95 px-4 py-2 rounded-2xl shadow-lg">
          <Text className="text-primary font-bold text-lg">
            {formatPrice(property.price)}
          </Text>
        </View>
        
        {/* Wishlist Button */}
        <TouchableOpacity 
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full justify-center items-center shadow-lg"
          onPress={handleWishlistToggle}
          disabled={wishlistLoading}
        >
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "#F97316" : "#6B7280"} 
          />
        </TouchableOpacity>

        {/* Property Type Badge */}
        <View className="absolute top-4 left-4 bg-primary bg-opacity-90 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">FOR SALE</Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-6">
        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-2 leading-6" numberOfLines={2}>
          {property.title}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mb-4">
          <View className="w-8 h-8 bg-primary-50 rounded-full justify-center items-center mr-3">
            <Ionicons name="location" size={16} color="#007C91" />
          </View>
          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
            {formatLocation()}
          </Text>
        </View>

        {/* Specs Grid */}
        <View className="flex-row justify-between mb-6">
          {property.bedrooms && (
            <View className="flex-1 items-center bg-gray-50 py-3 rounded-xl mr-2">
              <Ionicons name="bed-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-semibold text-sm mt-1">{property.bedrooms}</Text>
              <Text className="text-gray-500 text-xs">Beds</Text>
            </View>
          )}
          {property.bathrooms && (
            <View className="flex-1 items-center bg-gray-50 py-3 rounded-xl mr-2">
              <Ionicons name="water-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-semibold text-sm mt-1">{property.bathrooms}</Text>
              <Text className="text-gray-500 text-xs">Baths</Text>
            </View>
          )}
          {property.square_feet && (
            <View className="flex-1 items-center bg-gray-50 py-3 rounded-xl">
              <Ionicons name="resize-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-semibold text-sm mt-1">
                {(property.square_feet / 1000).toFixed(1)}k
              </Text>
              <Text className="text-gray-500 text-xs">Sq Ft</Text>
            </View>
          )}
        </View>

        {/* View Details Button */}
        <TouchableOpacity 
          className="bg-primary py-4 rounded-2xl shadow-lg"
          onPress={handleViewDetails}
        >
          <View className="flex-row justify-center items-center">
            <Text className="text-white font-bold text-base mr-2">View Details</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
} 