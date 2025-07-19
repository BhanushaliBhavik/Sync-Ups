import { useWishlist } from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Property Card Component
const PropertyCard = ({ 
  item,
  isSelected = false,
  onSelect,
  onDelete
}: {
  item: any;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  const router = useRouter();
  const property = item.property;
  if (!property) return null;

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
    return specs.join(' ');
  };

  const formatLocation = () => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    return parts.join(', ');
  };

  // Enhanced function to get property images - handles multiple formats
  const getPropertyImages = (property: any) => {
    // Case 1: property_images is an array (standard format)
    if (property.property_images && Array.isArray(property.property_images)) {
      return property.property_images;
    }
    
    // Case 2: property_images is a single string
    if (property.property_images && typeof property.property_images === 'string') {
      return [{ image_url: property.property_images, is_primary: true }];
    }
    
    // Case 3: Check for single 'image' field (alternative format)
    if (property.image && typeof property.image === 'string') {
      return [{ image_url: property.image, is_primary: true }];
    }
    
    // Case 4: Check for 'image_url' field (alternative format)
    if (property.image_url && typeof property.image_url === 'string') {
      return [{ image_url: property.image_url, is_primary: true }];
    }
    
    // Case 5: Check for 'images' field that could be array or string
    const imagesProp = property.images;
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

  const getPrimaryImage = (property: any) => {
    const images = getPropertyImages(property);
    const primaryImage = images.find((img: any) => img.is_primary);
    return primaryImage?.image_url || images[0]?.image_url || null;
  };

  const handlePropertyPress = () => {
    try {
      // Navigate to property detail screen
      router.push({
        pathname: '/PropertyDetailScreen',
        params: { id: property.id }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push(`/property/${property.id}`);
    }
  };

  return (
    <TouchableOpacity 
      className="bg-surface rounded-2xl shadow-lg overflow-hidden mb-6 border border-border"
      onPress={handlePropertyPress}
      activeOpacity={0.7}
    >
      <View className="p-6">
        <View className="flex-row">
          {/* Left Side - Image Placeholder */}
          <TouchableOpacity 
            className="mr-5" 
            onPress={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            activeOpacity={0.8}
          >
            <View className={`relative w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl justify-center items-center ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
              {getPrimaryImage(property) ? (
                <>
                  {console.log('🖼️ Wishlist - Property ID:', property.id)}
                  {console.log('🖼️ Wishlist - property_images:', property.property_images)}
                  {console.log('🖼️ Wishlist - Primary image URL:', getPrimaryImage(property))}
                  <Image
                    source={{ uri: getPrimaryImage(property)! }}
                    style={{ 
                      width: 96, // w-24 = 24 * 4 = 96px
                      height: 96, // h-24 = 24 * 4 = 96px
                      borderRadius: 12 // rounded-xl
                    }}
                    resizeMode="cover"
                    onError={(error: any) => {
                      console.log('❌ Wishlist image failed to load:', error);
                      console.log('❌ Wishlist failed URL:', getPrimaryImage(property));
                    }}
                    onLoad={() => {
                      console.log('✅ Wishlist image loaded successfully');
                    }}
                    onLoadStart={() => {
                      console.log('🔄 Wishlist image load started');
                    }}
                    onLoadEnd={() => {
                      console.log('🔚 Wishlist image load ended');
                    }}
                  />
                </>
              ) : (
                <>
                  {console.log('❌ Wishlist - No image found, showing fallback')}
                  <View className="bg-surface bg-opacity-90 px-3 py-1 rounded-lg">
                    <Text className="text-text-secondary text-xs font-semibold text-center">{property.title?.split(' ')[0] || 'Property'}</Text>
                  </View>
                </>
              )}
              <TouchableOpacity className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full justify-center items-center shadow-lg">
                <Ionicons name="heart" size={12} color="#FFFFFF" />
              </TouchableOpacity>
              {isSelected && (
                <View className="absolute inset-0 bg-primary bg-opacity-20 justify-center items-center rounded-xl">
                  <View className="w-8 h-8 bg-primary rounded-full justify-center items-center shadow-lg">
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Middle Section - Property Details */}
          <View className="flex-1 justify-center">
            <Text className="text-xl font-bold text-text-primary mb-2 leading-6">{property.title}</Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-text-secondary text-sm ml-1">{formatLocation()}</Text>
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-2">{formatPrice(property.price)}</Text>
            <Text className="text-text-secondary text-sm font-medium">{formatSpecs()}</Text>
          </View>
          
          {/* Right Side - Action Icons */}
          <View className="justify-center">
            <TouchableOpacity 
              className="w-12 h-12 bg-accent/10 rounded-full justify-center items-center shadow-sm" 
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={22} color="#F97316" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    className={`w-14 h-7 rounded-full shadow-sm ${isEnabled ? 'bg-primary' : 'bg-gray-300'}`}
    onPress={onToggle}
  >
    <View className={`w-6 h-6 bg-white rounded-full shadow-lg ${isEnabled ? 'ml-7' : 'ml-0.5'} mt-0.5`} />
  </TouchableOpacity>
);

export default function WishlistScreen() {
  const router = useRouter();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  // Use the new wishlist hook
  const { 
    wishlist, 
    loading, 
    error, 
    isAuthenticated,
    refetch, 
    removeFromWishlist 
  } = useWishlist();

  // Refetch wishlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      }
    }, [refetch, isAuthenticated])
  );

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

  const handleDelete = async (propertyId: string) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this property from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromWishlist(propertyId);
              // Remove from selected properties if it was selected
              setSelectedProperties(prev => prev.filter(id => id !== propertyId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove from wishlist');
            }
          },
        },
      ]
    );
  };

  const handleCompare = () => {
    if (selectedProperties.length === 0) return;
    
    // Navigate to compare screen with selected properties
    const selectedItems = wishlist.filter(item => 
      selectedProperties.includes(item.property_id)
    );
    
    console.log('Compare properties:', selectedItems);
    Alert.alert('Compare', 'Compare functionality coming soon!');
  };

  const handleNavigateToSearch = () => {
    try {
      router.push('/search');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/(tabs)/search');
    }
  };

  const handleNavigateToSignIn = () => {
    try {
      router.push('/auth/signin');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      router.push('/auth/signin');
    }
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary-100 rounded-full justify-center items-center mb-8 shadow-lg">
            <Ionicons name="lock-closed" size={64} color="#007C91" />
          </View>
          <Text className="text-3xl font-bold text-text-primary mb-3 text-center">Sign In Required</Text>
          <Text className="text-text-secondary text-center text-lg leading-7 mb-10 max-w-xs">
            Please sign in to view and manage your wishlist
          </Text>
          <TouchableOpacity 
            className="bg-primary px-8 py-4 rounded-xl shadow-lg"
            onPress={handleNavigateToSignIn}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-in" size={20} color="#FFFFFF" />
              <Text className="text-white font-bold text-lg ml-2">Sign In</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007C91" />
          <Text className="text-text-secondary text-base mt-4">Loading wishlist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-24 h-24 bg-red-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-3 text-center">Error Loading Wishlist</Text>
          <Text className="text-text-secondary text-center text-base leading-6 mb-8">
            {error}
          </Text>
          <TouchableOpacity 
            className="bg-primary px-8 py-4 rounded-xl shadow-lg"
            onPress={refetch}
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-surface px-6 py-6 shadow-sm border-b border-border">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-text-primary">
                {wishlist.length} favorited {wishlist.length === 1 ? 'home' : 'homes'}
              </Text>
              <Text className="text-text-secondary text-base mt-1">Your saved properties</Text>
            </View>
            <View className="w-12 h-12 bg-gradient-to-br from-accent to-orange-500 rounded-full justify-center items-center shadow-lg">
              <Ionicons name="heart" size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Compare Mode Section */}
        <View className="bg-surface px-6 py-6 border-b border-border">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-xl font-bold text-text-primary mb-1">Compare Mode</Text>
              <Text className="text-text-secondary text-base">Select up to 2 homes to compare</Text>
            </View>
            <ToggleSwitch 
              isEnabled={compareMode} 
              onToggle={() => setCompareMode(!compareMode)} 
            />
          </View>
        </View>

        {/* Compare Button */}
        {compareMode && selectedProperties.length > 0 && (
          <View className="bg-surface px-6 py-4 border-b border-border">
            <TouchableOpacity 
              className="bg-primary py-4 rounded-xl shadow-lg"
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
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {wishlist.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-32 h-32 bg-gradient-to-br from-accent/20 to-orange-100 rounded-full justify-center items-center mb-8 shadow-lg">
                <Ionicons name="heart-outline" size={64} color="#F97316" />
              </View>
              <Text className="text-3xl font-bold text-text-primary mb-3 text-center">Your wishlist is empty</Text>
              <Text className="text-text-secondary text-center text-lg leading-7 mb-10 max-w-xs">
                Start exploring properties and add them to your wishlist to save them for later
              </Text>
              <TouchableOpacity 
                className="bg-primary px-8 py-4 rounded-xl shadow-lg"
                onPress={handleNavigateToSearch}
              >
                <View className="flex-row items-center">
                  <Ionicons name="search" size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-lg ml-2">Browse Properties</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            wishlist.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                isSelected={selectedProperties.includes(item.property_id)}
                onSelect={() => handlePropertySelect(item.property_id)}
                onDelete={() => handleDelete(item.property_id)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}