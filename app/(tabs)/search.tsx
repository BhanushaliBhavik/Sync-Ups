import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  <View className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
    {/* Property Image Placeholder */}
    <View className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 justify-center items-center">
      <View className="absolute inset-0 bg-black bg-opacity-5" />
      <View className="bg-white bg-opacity-90 px-4 py-2 rounded-full">
        <Text className="text-gray-600 text-sm font-medium">Property Image</Text>
      </View>
      
      {/* Price Overlay */}
      <View className="absolute bottom-4 left-4 bg-black bg-opacity-80 px-4 py-2 rounded-xl backdrop-blur-sm">
        <Text className="text-white font-bold text-lg">{price}</Text>
      </View>
      
      {/* Favorite Icon */}
      <TouchableOpacity className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-90 rounded-full justify-center items-center shadow-lg">
        <Ionicons name="heart-outline" size={24} color="#374151" />
      </TouchableOpacity>
    </View>
    
    {/* Property Details */}
    <View className="p-6">
      <Text className="text-xl font-bold text-gray-900 mb-2">{type}</Text>
      <View className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text className="text-gray-600 text-sm ml-1">{location}</Text>
      </View>
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-700 font-medium">{size}</Text>
        <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
          <Ionicons name="location" size={14} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-1 font-medium">{distance}</Text>
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
    className={`px-5 py-3 rounded-xl mr-3 shadow-sm ${isActive ? 'bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg' : 'bg-white border border-gray-200'}`}
  >
    <View className="flex-row items-center">
      <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
        {title}
      </Text>
      {showIcon && (
        <Ionicons 
          name="chevron-down" 
          size={14} 
          color={isActive ? "#FFFFFF" : "#6B7280"} 
          style={{ marginLeft: 6 }}
        />
      )}
    </View>
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="bg-white px-6 py-6 shadow-sm border-b border-gray-100">
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 py-4 shadow-sm">
            <Ionicons name="search" size={22} color="#6B7280" className="mr-4" />
            <TextInput
              className="flex-1 text-gray-900 text-base font-medium"
              placeholder="Search properties..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={handleSearch}
            />
            <TouchableOpacity className="ml-4 w-10 h-10 bg-gray-100 rounded-full justify-center items-center">
              <Ionicons name="mic" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter and Sort Section */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
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
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-base font-medium">
              {filteredProperties.length} properties found
            </Text>
            <TouchableOpacity className="bg-blue-50 px-4 py-2 rounded-lg">
              <Text className="text-blue-600 font-semibold">Sort by</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Listings */}
        <View className="px-6 py-6">
          {filteredProperties.map((property) => (
            <View key={property.id} className="mb-6">
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
          <View className="flex-1 justify-center items-center px-8 py-20">
            <View className="w-24 h-24 bg-gray-100 rounded-full justify-center items-center mb-6">
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">No properties found</Text>
            <Text className="text-gray-600 text-center text-base leading-6 mb-8">
              Try adjusting your search criteria or filters to find what you're looking for
            </Text>
            <TouchableOpacity className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-4 rounded-xl shadow-lg">
              <Text className="text-white font-semibold text-base">Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}