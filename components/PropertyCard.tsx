import { useWishlistStatus } from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description?: string;
    price: number;
    property_type?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
    status?: 'active' | 'sold' | 'pending' | 'inactive';
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
    lot_size?: number;
    year_built?: number;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    latitude?: number;
    longitude?: number;
    agent_id?: string;
    seller_id?: string;
    created_at?: string;
    updated_at?: string;
    property_images?: Array<{
      id: string;
      property_id: string;
      image_url: string;
      caption?: string;
      is_primary: boolean;
      order_index: number;
      created_at: string;
    }>;
    agent?: {
      id: string;
      name?: string;
      email: string;
      phone?: string;
      profile_image_url?: string;
    };
  };
  onViewDetails?: (propertyId: string) => void;
  onWishlistChange?: () => void; // Callback when wishlist changes
}

export default function PropertyCard({ property, onViewDetails, onWishlistChange }: PropertyCardProps) {
  const router = useRouter();
  
  // Use wishlist status hook
  const { 
    isInWishlist, 
    loading: wishlistLoading, 
    addToWishlist, 
    removeFromWishlist 
  } = useWishlistStatus({ 
    propertyId: property.id,
    onWishlistChange 
  });

  const formatPrice = (price: number) => {
    if (!price || price <= 0) return 'Price on request';
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
    if (property.state) parts.push(property.state);
    return parts.join(', ');
  };

  // Enhanced function to get property images - handles multiple formats
  const getPropertyImages = () => {
    // Case 1: property_images is an array (standard format)
    if (property.property_images && Array.isArray(property.property_images)) {
      return property.property_images;
    }
    
    // Case 2: property_images is a single string
    if (property.property_images && typeof property.property_images === 'string') {
      return [{ image_url: property.property_images, is_primary: true }];
    }
    
    // Case 3: Check for single 'image' field (alternative format)
    if ((property as any).image && typeof (property as any).image === 'string') {
      return [{ image_url: (property as any).image, is_primary: true }];
    }
    
    // Case 4: Check for 'image_url' field (alternative format)
    if ((property as any).image_url && typeof (property as any).image_url === 'string') {
      return [{ image_url: (property as any).image_url, is_primary: true }];
    }
    
    // Case 5: Check for 'images' field that could be array or string
    const imagesProp = (property as any).images;
    if (imagesProp) {
      if (Array.isArray(imagesProp)) {
        return imagesProp.map((img: string | { image_url: string; is_primary?: boolean }) => {
          if (typeof img === 'string') {
            return { image_url: img, is_primary: false };
          }
          return img;
        });
      } else if (typeof imagesProp === 'string') {
        return [{ image_url: imagesProp, is_primary: true }];
      }
    }
    
    return [];
  };

  const getPrimaryImage = () => {
    const images = getPropertyImages();
    const primaryImage = images.find((img: any) => img.is_primary);
    return primaryImage?.image_url || images[0]?.image_url || null;
  };

  const getPropertyTypeLabel = () => {
    if (!property.property_type) return 'Property';
    return property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1);
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

  const imageUrl = getPrimaryImage();
  
  // Debug logging to understand the image data
  console.log('🖼️ PropertyCard Debug - Property ID:', property.id);
  console.log('🖼️ PropertyCard Debug - All property keys:', Object.keys(property));
  console.log('🖼️ PropertyCard Debug - property_images:', property.property_images);
  console.log('🖼️ PropertyCard Debug - property.image:', (property as any).image);
  console.log('🖼️ PropertyCard Debug - property.image_url:', (property as any).image_url);
  console.log('🖼️ PropertyCard Debug - property.images:', (property as any).images);
  console.log('🖼️ PropertyCard Debug - Final imageUrl:', imageUrl);
  const handleOpenMap = async () => {
    if (!property.latitude || !property.longitude) {
      Alert.alert(
        'Location Not Available',
        'This property does not have location coordinates available.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Maps',
          'Google Maps is not available on this device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert(
        'Error',
        'Failed to open Google Maps. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-4">
      {/* Image Section */}
      <View className="relative">
        <View style={{ width: '100%', height: 224, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
          {imageUrl ? (
            <>
              {console.log('🖼️ Rendering Image component with URL:', imageUrl)}
              <Image
                source={{ uri: imageUrl }}
                style={{ 
                  width: '100%', 
                  height: 224,
                  backgroundColor: '#E5E7EB'
                }}
                resizeMode="cover"
                onError={(error) => {
                  console.log('❌ Property image failed to load:', error);
                  console.log('❌ Failed URL:', imageUrl);
                  console.log('❌ Error details:', JSON.stringify(error));
                }}
                onLoad={(event) => {
                  console.log('✅ Property image loaded successfully:', imageUrl);
                  console.log('✅ Image dimensions:', event.nativeEvent);
                }}
                onLoadStart={() => {
                  console.log('🔄 Started loading image:', imageUrl);
                }}
                onLoadEnd={() => {
                  console.log('🔚 Finished loading image (success or fail):', imageUrl);
                }}
              />
            </>
          ) : (
            <>
              {console.log('❌ No imageUrl found, showing placeholder')}
              <View style={{ 
                width: '100%', 
                height: 224, 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#D1D5DB' 
              }}>
                <Ionicons name="home-outline" size={48} color="#9CA3AF" />
                <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>No Image Available</Text>
              </View>
            </>
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
          <Text className="text-white text-xs font-semibold">{getPropertyTypeLabel().toUpperCase()}</Text>
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
          className="bg-primary py-4 rounded-2xl shadow-lg mb-3"
          onPress={handleViewDetails}
        >
          <View className="flex-row justify-center items-center">
            <Text className="text-white font-bold text-base mr-2">View Details</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Nearby Map Button */}
        <TouchableOpacity 
          className="bg-gray-100 py-3 rounded-2xl border border-gray-200"
          onPress={handleOpenMap}
        >
          <View className="flex-row justify-center items-center">
            <Ionicons name="map-outline" size={18} color="#007C91" />
            <Text className="text-primary font-semibold text-base ml-2">Nearby Map</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
} 