import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  },
  {
    id: '4',
    title: 'Studio Loft',
    price: 350000,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 800,
    property_type: 'studio',
    address: '321 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105'
  },
  {
    id: '5',
    title: 'Victorian Townhouse',
    price: 950000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 2000,
    property_type: 'townhouse',
    address: '654 Castro St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94114'
  }
];

// Property Card Component
const PropertyCard = ({ 
  price, 
  type, 
  location, 
  size, 
  distance 
}: {
  price: string;
  type: string;
  location: string;
  size: string;
  distance: string;
}) => (
  <View style={styles.propertyCard}>
    {/* Property Image Placeholder */}
    <View style={styles.propertyImage}>
      <Text style={styles.imagePlaceholderText}>Property Image</Text>
      
      {/* Price Overlay */}
      <View style={styles.priceOverlay}>
        <Text style={styles.priceText}>{price}</Text>
      </View>
      
      {/* Favorite Icon */}
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
    
    {/* Property Details */}
    <View style={styles.propertyDetails}>
      <Text style={styles.propertyType}>{type}</Text>
      <Text style={styles.propertyLocation}>{location}</Text>
      <View style={styles.propertyFooter}>
        <Text style={styles.propertySize}>{size}</Text>
        <View style={styles.distanceContainer}>
          <Ionicons name="location" size={12} color="#6B7280" />
          <Text style={styles.distanceText}>{distance}</Text>
        </View>
      </View>
    </View>
  </View>
);

// Filter Button Component
const FilterButton = ({ 
  title, 
  isActive, 
  onPress,
  showIcon = false 
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
  showIcon?: boolean;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.filterButton, isActive ? styles.activeFilterButton : styles.inactiveFilterButton]}
  >
    <Text style={[styles.filterButtonText, isActive ? styles.activeFilterButtonText : styles.inactiveFilterButtonText]}>
      {title}
    </Text>
    {showIcon && (
      <Ionicons 
        name="chevron-down" 
        size={12} 
        color={isActive ? "#FFFFFF" : "#6B7280"} 
        style={{ marginLeft: 4 }}
      />
    )}
  </TouchableOpacity>
);

export default function SearchScreen() {
  const [activeFilter, setActiveFilter] = useState('Filters');
  const [searchText, setSearchText] = useState('');
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    // Static filtering logic
    let filtered = [...mockProperties];
    
    switch (filter) {
      case 'Price':
        // Show properties under $500k
        filtered = mockProperties.filter(p => p.price < 500000);
        break;
      case 'Type':
        // Show apartments only
        filtered = mockProperties.filter(p => p.property_type === 'apartment');
        break;
      case 'BHK':
        // Show 2+ bedroom properties
        filtered = mockProperties.filter(p => p.bedrooms >= 2);
        break;
      case 'Area':
        // Show properties over 1000 sq ft
        filtered = mockProperties.filter(p => p.square_feet > 1000);
        break;
      case 'AI':
        // Show all properties (AI recommendations)
        filtered = mockProperties;
        break;
      default:
        filtered = mockProperties;
    }
    
    setFilteredProperties(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    
    if (text.trim()) {
      const filtered = mockProperties.filter(property =>
        property.title.toLowerCase().includes(text.toLowerCase()) ||
        property.city.toLowerCase().includes(text.toLowerCase()) ||
        property.property_type.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(mockProperties);
    }
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

  const formatPropertyType = (property: any) => {
    const specs = [];
    if (property.bedrooms) specs.push(`${property.bedrooms} BHK`);
    specs.push(property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Property');
    return specs.join(' ');
  };

  const formatLocation = (property: any) => {
    const location = [];
    if (property.city) location.push(property.city);
    if (property.state) location.push(property.state);
    return location.join(', ');
  };

  const formatSize = (property: any) => {
    if (property.square_feet) {
      return `${property.square_feet.toLocaleString()} sq ft`;
    }
    return 'Size not specified';
  };

  const calculateDistance = (property: any) => {
    // Mock distance calculation
    const distances = ['0.8 km', '1.2 km', '2.5 km', '3.8 km', '5.1 km'];
    return distances[Math.floor(Math.random() * distances.length)];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={handleSearch}
            />
            <TouchableOpacity style={styles.voiceButton}>
              <Ionicons name="mic" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter and Sort Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            <FilterButton 
              title="Filters" 
              isActive={activeFilter === 'Filters'} 
              onPress={() => handleFilterChange('Filters')}
              showIcon={true}
            />
            <FilterButton 
              title="Price" 
              isActive={activeFilter === 'Price'} 
              onPress={() => handleFilterChange('Price')}
            />
            <FilterButton 
              title="Type" 
              isActive={activeFilter === 'Type'} 
              onPress={() => handleFilterChange('Type')}
            />
            <FilterButton 
              title="BHK" 
              isActive={activeFilter === 'BHK'} 
              onPress={() => handleFilterChange('BHK')}
            />
            <FilterButton 
              title="Area" 
              isActive={activeFilter === 'Area'} 
              onPress={() => handleFilterChange('Area')}
            />
            <FilterButton 
              title="AI" 
              isActive={activeFilter === 'AI'} 
              onPress={() => handleFilterChange('AI')}
            />
          </ScrollView>
          
          {/* Results Count */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              {filteredProperties.length} properties found
            </Text>
          </View>
        </View>

        {/* Property Listings */}
        <View style={styles.propertyList}>
          {filteredProperties.map((property) => (
            <View key={property.id} style={styles.propertyCardWrapper}>
              <PropertyCard
                price={formatPrice(property.price)}
                type={formatPropertyType(property)}
                location={formatLocation(property)}
                size={formatSize(property)}
                distance={calculateDistance(property)}
              />
            </View>
          ))}
        </View>

        {/* No Results Message */}
        {filteredProperties.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No properties found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or filters
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  voiceButton: {
    padding: 4,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  activeFilterButton: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  inactiveFilterButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  inactiveFilterButtonText: {
    color: '#374151',
  },
  resultsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  propertyList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  propertyCardWrapper: {
    marginBottom: 16,
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImage: {
    height: 200,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  propertyDetails: {
    padding: 16,
  },
  propertyType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertySize: {
    fontSize: 14,
    color: '#374151',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
});