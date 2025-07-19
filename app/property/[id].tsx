import { usePropertyById } from '@/hooks/useProperties';
import { useWishlistStatus } from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch property data
  const { property, loading, error } = usePropertyById(id as string);
  
  // Wishlist functionality
  const { 
    isInWishlist, 
    loading: wishlistLoading, 
    addToWishlist, 
    removeFromWishlist 
  } = useWishlistStatus({ propertyId: id as string });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007C91" />
          <Text className="text-gray-600 mt-4">Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !property) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            Property Not Found
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            {error || 'The property you\'re looking for doesn\'t exist or has been removed.'}
          </Text>
          <TouchableOpacity 
            className="bg-primary px-6 py-3 rounded-xl mt-6"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatLocation = () => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    return parts.join(', ');
  };

  // Handle different image formats
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
        return imagesProp.map((img: string | { image_url: string; is_primary?: boolean }, index: number) => {
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

  const images = getPropertyImages();
  const hasImages = images.length > 0;

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist();
        Alert.alert('Removed', 'Property removed from wishlist');
      } else {
        await addToWishlist();
        Alert.alert('Added', 'Property added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleContactAgent = () => {
    if (property.agent?.phone) {
      Alert.alert(
        'Contact Agent',
        `Call ${property.agent.name || 'Agent'} at ${property.agent.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {
            // In a real app, you would use Linking.openURL(`tel:${property.agent.phone}`)
            Alert.alert('Would call', property.agent.phone);
          }}
        ]
      );
    } else {
      Alert.alert('Contact Info', 'Agent contact information not available');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-900">Property Details</Text>
        
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          onPress={handleWishlistToggle}
          disabled={wishlistLoading}
        >
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={20} 
            color={isInWishlist ? "#F97316" : "#6B7280"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {hasImages ? (
          <View>
            <View className="relative">
              <Image
                source={{ uri: images[currentImageIndex]?.image_url }}
                style={{ width, height: 300 }}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Property detail image failed to load:', error);
                }}
                onLoad={() => {
                  console.log('Property detail image loaded:', images[currentImageIndex]?.image_url);
                }}
              />
              
              {/* Image Counter */}
              <View className="absolute bottom-4 right-4 bg-black bg-opacity-60 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </Text>
              </View>
            </View>

            {/* Image Navigation */}
            {images.length > 1 && (
              <ScrollView 
                horizontal 
                className="px-4 py-3 bg-gray-50"
                showsHorizontalScrollIndicator={false}
              >
                {images.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`mr-2 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onPress={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      source={{ uri: image.image_url }}
                      className="w-16 h-16"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={{ width, height: 300 }} className="bg-gray-200 justify-center items-center">
            <Ionicons name="home-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No Images Available</Text>
          </View>
        )}

        {/* Property Information */}
        <View className="px-6 py-6">
          {/* Price and Title */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-primary mb-2">
              {formatPrice(property.price)}
            </Text>
            <Text className="text-xl font-bold text-gray-900 mb-3">
              {property.title}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {formatLocation()}
              </Text>
            </View>
          </View>

          {/* Property Stats */}
          <View className="flex-row justify-around mb-8 bg-gray-50 rounded-2xl p-6">
            <View className="items-center">
              <Ionicons name="bed-outline" size={28} color="#007C91" />
              <Text className="text-gray-900 font-bold text-xl mt-2">{property.bedrooms}</Text>
              <Text className="text-gray-600 text-sm">Bedrooms</Text>
            </View>
            <View className="items-center">
              <Ionicons name="water-outline" size={28} color="#007C91" />
              <Text className="text-gray-900 font-bold text-xl mt-2">{property.bathrooms}</Text>
              <Text className="text-gray-600 text-sm">Bathrooms</Text>
            </View>
            <View className="items-center">
              <Ionicons name="home-outline" size={28} color="#007C91" />
              <Text className="text-gray-900 font-bold text-xl mt-2">For Sale</Text>
              <Text className="text-gray-600 text-sm">Type</Text>
            </View>
          </View>

          {/* Property Details */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Property Details</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Property Type</Text>
                <Text className="text-gray-900 font-medium">House</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Bedrooms</Text>
                <Text className="text-gray-900 font-medium">{property.bedrooms}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-gray-100">
                <Text className="text-gray-600">Bathrooms</Text>
                <Text className="text-gray-900 font-medium">{property.bathrooms}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Price</Text>
                <Text className="text-gray-900 font-medium">{formatPrice(property.price)}</Text>
              </View>
            </View>
          </View>

          {/* Agent Information */}
          {property.agent && (
            <View className="bg-gray-50 rounded-2xl p-6 mb-8">
              <Text className="text-xl font-bold text-gray-900 mb-4">Listed By</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {property.agent.name || 'Real Estate Agent'}
                  </Text>
                  {property.agent.email && (
                    <Text className="text-gray-600 mt-1">{property.agent.email}</Text>
                  )}
                  {property.agent.phone && (
                    <Text className="text-gray-600 mt-1">{property.agent.phone}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  className="bg-primary px-4 py-2 rounded-xl"
                  onPress={handleContactAgent}
                >
                  <Text className="text-white font-bold">Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            className="flex-1 bg-primary py-4 rounded-2xl"
            onPress={handleContactAgent}
          >
            <Text className="text-white font-bold text-center text-lg">Contact Agent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="px-6 py-4 bg-gray-100 rounded-2xl"
            onPress={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            <Ionicons 
              name={isInWishlist ? "heart" : "heart-outline"} 
              size={24} 
              color={isInWishlist ? "#F97316" : "#6B7280"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}