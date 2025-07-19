import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Property Card Component
const PropertyCard = ({ 
  propertyType,
  title, 
  location, 
  price, 
  specs,
  isSelected = false,
  onSelect,
  onShare,
  onDelete
}: {
  propertyType: string;
  title: string;
  location: string;
  price: string;
  specs: string;
  isSelected?: boolean;
  onSelect: () => void;
  onShare: () => void;
  onDelete: () => void;
}) => (
  <View style={styles.propertyCard}>
    {/* Left Side - Image Placeholder */}
    <TouchableOpacity style={styles.imageContainer} onPress={onSelect}>
      <View style={[styles.imagePlaceholder, isSelected && styles.selectedImage]}>
        <Text style={styles.imageText}>{propertyType}</Text>
        <TouchableOpacity style={styles.heartIcon}>
          <Ionicons name="heart" size={16} color="#FFFFFF" />
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
      <Text style={styles.propertyTitle}>{title}</Text>
      <Text style={styles.propertyLocation}>{location}</Text>
      <Text style={styles.propertyPrice}>{price}</Text>
      <Text style={styles.propertySpecs}>{specs}</Text>
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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);

  const properties = [
    {
      id: 1,
      propertyType: 'Modern House',
      title: 'Modern Family Home',
      location: '123 Oak Street, Downtown',
      price: '$850,000',
      specs: '3 beds 2 baths 2,100 sq ft'
    },
    {
      id: 2,
      propertyType: 'Villa Estate',
      title: 'Luxury Villa Estate',
      location: '456 Pine Avenue, Westside',
      price: '$1,250,000',
      specs: '4 beds 3 baths 3,200 sq ft'
    },
    {
      id: 3,
      propertyType: 'Cozy Condo',
      title: 'Cozy Downtown Condo',
      location: '789 Maple Drive, City Center',
      price: '$425,000',
      specs: '2 beds 1 bath 1,200 sq ft'
    },
    {
      id: 4,
      propertyType: 'Ranch Style',
      title: 'Ranch Style Home',
      location: '321 Elm Street, Suburbs',
      price: '$675,000',
      specs: '3 beds 2 baths 1,800 sq ft'
    }
  ];

  const handlePropertySelect = (propertyId: number) => {
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

  const handleShare = (propertyId: number) => {
    // Handle share functionality
    console.log('Share property:', propertyId);
  };

  const handleDelete = (propertyId: number) => {
    // Handle delete functionality
    console.log('Delete property:', propertyId);
  };

  const handleCompare = () => {
    if (selectedProperties.length === 0) return;
    // Handle compare functionality
    console.log('Compare properties:', selectedProperties);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>12 favorited homes</Text>
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

      {/* Property Listings */}
      <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
        {properties.map((property) => (
          <View key={property.id}>
            <PropertyCard
              propertyType={property.propertyType}
              title={property.title}
              location={property.location}
              price={property.price}
              specs={property.specs}
              isSelected={selectedProperties.includes(property.id)}
              onSelect={() => handlePropertySelect(property.id)}
              onShare={() => handleShare(property.id)}
              onDelete={() => handleDelete(property.id)}
            />
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>

      {/* Compare Button */}
      <View style={styles.compareButtonContainer}>
        <TouchableOpacity 
          style={[styles.compareButton, selectedProperties.length > 0 && styles.compareButtonActive]} 
          onPress={handleCompare}
          disabled={selectedProperties.length === 0}
        >
          <Text style={[styles.compareButtonText, selectedProperties.length > 0 && styles.compareButtonTextActive]}>
            Compare Selected ({selectedProperties.length}/2)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#FFFFFF',
  },
  propertyCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedImage: {
    backgroundColor: '#3B82F6',
  },
  imageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  heartIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 2,
  },
  propertyDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  propertySpecs: {
    fontSize: 14,
    color: '#374151',
  },
  actionIcons: {
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 16,
  },
  compareButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  compareButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  compareButtonActive: {
    backgroundColor: '#374151',
  },
  compareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  compareButtonTextActive: {
    color: '#FFFFFF',
  },
});