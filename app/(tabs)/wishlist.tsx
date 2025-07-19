import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <View style={styles.propertyCard}>
      {/* Left Side - Image Placeholder */}
      <TouchableOpacity style={styles.imageContainer} onPress={onSelect}>
        <View style={[styles.imagePlaceholder, isSelected && styles.selectedImage]}>
          <Text style={styles.imageText}>{property.property_type}</Text>
          <TouchableOpacity style={styles.heartIcon}>
            <Ionicons name="heart" size={16} color="#EF4444" />
          </TouchableOpacity>
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* Middle Section - Property Details */}
      <View style={styles.propertyDetails}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyLocation}>{formatLocation()}</Text>
        <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
        <Text style={styles.propertySpecs}>{formatSpecs()}</Text>
      </View>
      
      {/* Right Side - Action Icons */}
      <View style={styles.actionIcons}>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#374151" />
        </TouchableOpacity>
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
    style={[styles.toggleContainer, isEnabled && styles.toggleEnabled]} 
    onPress={onToggle}
  >
    <View style={[styles.toggleHandle, isEnabled && styles.toggleHandleEnabled]} />
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {wishlistItems.length} favorited {wishlistItems.length === 1 ? 'home' : 'homes'}
        </Text>
      </View>

      {/* Compare Mode Section */}
      <View style={styles.compareSection}>
        <View style={styles.compareInfo}>
          <Text style={styles.compareTitle}>Compare Mode</Text>
          <Text style={styles.compareSubtitle}>Select up to 2 homes to compare</Text>
        </View>
        <ToggleSwitch 
          isEnabled={compareMode} 
          onToggle={() => setCompareMode(!compareMode)} 
        />
      </View>

      {/* Compare Button */}
      {compareMode && selectedProperties.length > 0 && (
        <View style={styles.compareButtonContainer}>
          <TouchableOpacity 
            style={styles.compareButton}
            onPress={handleCompare}
          >
            <Text style={styles.compareButtonText}>
              Compare {selectedProperties.length} Properties
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Property Listings */}
      <ScrollView 
        style={styles.propertyList} 
        showsVerticalScrollIndicator={false}
      >
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Start exploring properties and add them to your wishlist
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.browseButtonText}>Browse Properties</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wishlistItems.map((item) => (
            <View key={item.id} style={styles.propertyCardWrapper}>
              <PropertyCard
                item={item}
                isSelected={selectedProperties.includes(item.property_id)}
                onSelect={() => handlePropertySelect(item.property_id)}
                onShare={() => handleShare(item.property_id)}
                onDelete={() => handleDelete(item.property_id)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  compareSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  compareInfo: {
    flex: 1,
  },
  compareTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  compareSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleContainer: {
    width: 48,
    height: 24,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    padding: 2,
  },
  toggleEnabled: {
    backgroundColor: '#3B82F6',
  },
  toggleHandle: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  toggleHandleEnabled: {
    transform: [{ translateX: 24 }],
  },
  propertyList: {
    flex: 1,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedImage: {
    backgroundColor: '#4F46E5',
  },
  imageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  heartIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  propertySpecs: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionIcons: {
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  compareButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  compareButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  compareButtonActive: {
    backgroundColor: '#4F46E5',
  },
  compareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  compareButtonTextActive: {
    color: '#FFFFFF',
  },
  propertyCardWrapper: {
    // This style is needed to apply marginHorizontal to the individual card
    // as the card itself already has marginHorizontal.
    marginHorizontal: 16,
  },
});