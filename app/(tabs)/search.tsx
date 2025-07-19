import PropertyCard from '@/components/PropertyCard';
import { useSearchByFilters, useSearchProperties } from '@/hooks/useProperties';
import { PropertyFilters } from '@/services/propertyService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    className={`px-5 py-3 rounded-xl mr-3 shadow-sm ${isActive ? 'bg-primary shadow-lg' : 'bg-surface border border-border'}`}
  >
    <View className="flex-row items-center">
      <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-text-primary'}`}>
        {title}
      </Text>
      {showIcon && (
        <Ionicons 
          name="chevron-down" 
          size={14} 
          color={isActive ? "#FFFFFF" : "#007C91"} 
          style={{ marginLeft: 6 }}
        />
      )}
    </View>
  </TouchableOpacity>
);

export default function SearchScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [filters, setFilters] = useState<PropertyFilters>({
    city: '',
    min_price: undefined,
    max_price: undefined,
    bedrooms: undefined,
    bathrooms: undefined
  });

  // Use search hooks
  const { 
    properties: searchResults, 
    loading: searchLoading, 
    error: searchError,
    search 
  } = useSearchProperties();

  const { 
    properties: filterResults, 
    loading: filterLoading, 
    error: filterError,
    searchByFilters 
  } = useSearchByFilters();

  // Determine which results to show
  const currentProperties = activeFilter === 'All' ? searchResults : filterResults;
  const currentLoading = activeFilter === 'All' ? searchLoading : filterLoading;
  const currentError = activeFilter === 'All' ? searchError : filterError;

  // Debounce search text to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Load all properties on component mount
  useEffect(() => {
    loadAllProperties();
  }, []);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      performSearch(debouncedSearchText.trim());
    } else if (debouncedSearchText === '') {
      loadAllProperties();
    }
  }, [debouncedSearchText]);

  // Load all properties function
  const loadAllProperties = useCallback(async () => {
    try {
      await search('');
      setSearchQuery('');
      setActiveFilter('All');
    } catch (error) {
      console.error('Error loading all properties:', error);
    }
  }, [search]);

  // Perform search function
  const performSearch = useCallback(async (query: string) => {
    try {
      setSearchQuery(query);
      await search(query);
      setActiveFilter('All');
    } catch (error) {
      console.error('Error performing search:', error);
    }
  }, [search]);

  // Handle search text changes
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  // Handle search submission (immediate search)
  const handleSearch = async () => {
    if (searchText.trim()) {
      await performSearch(searchText.trim());
    } else {
      await loadAllProperties();
    }
  };

  // Handle filter changes
  const handleFilterChange = async (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === 'All') {
      // Show all products without any filters
      const allFilters: PropertyFilters = {};
      setFilters(allFilters);
      try {
        await searchByFilters(allFilters);
      } catch (error) {
        console.error('Error applying all filter:', error);
        // Fallback to loading all properties
        await loadAllProperties();
      }
      return;
    }

    // Apply different filters
    let newFilters = { ...filters };
    
    switch (filter) {
      case 'Price':
        newFilters = { 
          min_price: 300000, 
          max_price: 800000
        };
        break;
      case 'Type':
        newFilters = { 
          type: 'buy'
        };
        break;
      case 'BHK':
        newFilters = { 
          bedrooms: 2
        };
        break;
      default:
        newFilters = {};
    }
    
    setFilters(newFilters);
    try {
      await searchByFilters(newFilters);
    } catch (error) {
      console.error('Error applying filter:', filter, error);
      Alert.alert('Filter Error', 'Failed to apply filter. Please try again.');
    }
  };

  // Handle view details
  const handleViewDetails = (propertyId: string) => {
    router.push({
      pathname: '/PropertyDetailScreen',
      params: { id: propertyId }
    });
  };

  // Handle clear filters
  const handleClearFilters = async () => {
    setSearchText('');
    setSearchQuery('');
    setActiveFilter('All');
    setFilters({
      city: '',
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      bathrooms: undefined
    });
    await loadAllProperties();
  };

  // Handle popular city search
  const handlePopularCitySearch = async (city: string) => {
    setSearchText(city);
    setSearchQuery(city);
    await performSearch(city);
  };

  // Show loading state
  if (currentLoading && currentProperties.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007C91" />
          <Text className="text-text-secondary text-base mt-4">
            {searchQuery ? `Searching for "${searchQuery}"...` : 'Loading properties...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (currentError && currentProperties.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-24 h-24 bg-red-100 rounded-full justify-center items-center mb-6">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-text-primary mb-3 text-center">Search Error</Text>
          <Text className="text-text-secondary text-center text-base leading-6 mb-8">
            {currentError.includes('Failed to fetch') 
              ? 'Unable to connect to the server. Please check your internet connection.'
              : currentError
            }
          </Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity 
              className="bg-primary px-6 py-3 rounded-xl shadow-lg"
              onPress={handleClearFilters}
            >
              <Text className="text-white font-semibold text-base">Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-gray-200 px-6 py-3 rounded-xl"
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text className="text-gray-700 font-semibold text-base">Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="bg-surface px-6 py-6 shadow-sm border-b border-border">
          <View className="flex-row items-center bg-white rounded-2xl px-5 py-4 shadow-sm border-2 border-border">
            <Ionicons name="search" size={22} color="#007C91" className="mr-4" />
            <TextInput
              className="flex-1 text-text-primary text-base font-medium"
              placeholder="Search properties by city, type, or features..."
              placeholderTextColor="#6B7280"
              value={searchText}
              onChangeText={handleSearchTextChange}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              className="ml-4 w-10 h-10 bg-primary-100 rounded-full justify-center items-center"
              onPress={handleSearch}
            >
              <Ionicons name="search" size={20} color="#007C91" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter and Sort Section */}
        <View className="bg-surface px-6 py-6 border-b border-border">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <FilterButton 
              title="All" 
              isActive={activeFilter === 'All'} 
              onPress={() => handleFilterChange('All')}
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
            
          </ScrollView>
          
          {/* Results Count and Actions */}
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base font-medium">
              {currentProperties.length} properties found
              {searchQuery && ` for "${searchQuery}"`}
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="bg-secondary-50 px-4 py-2 rounded-lg"
                onPress={() => Alert.alert('Sort', 'Sort functionality coming soon!')}
              >
                <Text className="text-secondary-600 font-semibold">Sort</Text>
              </TouchableOpacity>
              {(searchQuery || activeFilter !== 'All') && (
                <TouchableOpacity 
                  className="bg-primary-50 px-4 py-2 rounded-lg"
                  onPress={handleClearFilters}
                >
                  <Text className="text-primary-600 font-semibold">Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Property Listings */}
        <View className="px-6 py-6">
          {currentLoading && currentProperties.length > 0 && (
            <View className="py-4 justify-center items-center">
              <ActivityIndicator size="small" color="#007C91" />
              <Text className="text-text-secondary text-sm mt-2">
                {searchQuery ? `Updating results for "${searchQuery}"...` : 'Updating results...'}
              </Text>
            </View>
          )}
          
          {currentProperties.map((property) => (
            <View key={property.id} className="mb-6">
              <PropertyCard
                property={property}
                onViewDetails={handleViewDetails}
              />
            </View>
          ))}
        </View>

        {/* No Results Message */}
        {currentProperties.length === 0 && !currentLoading && !currentError && (
          <View className="flex-1 justify-center items-center px-8 py-20">
            <View className="w-24 h-24 bg-primary-100 rounded-full justify-center items-center mb-6">
              <Ionicons name="search-outline" size={48} color="#007C91" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-3 text-center">
              {searchQuery ? 'No properties found' : 'Start exploring properties'}
            </Text>
            <Text className="text-text-secondary text-center text-base leading-6 mb-8">
              {searchQuery 
                ? `No properties found for "${searchQuery}". Try adjusting your search criteria or browse all properties.`
                : 'Search for properties by entering a city, property type, or features to get started.'
              }
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity 
                className="bg-primary px-6 py-3 rounded-xl shadow-lg"
                onPress={handleClearFilters}
              >
                <Text className="text-white font-semibold text-base">
                  {searchQuery ? 'Clear Search' : 'Browse All Properties'}
                </Text>
              </TouchableOpacity>
              {searchQuery && (
                <TouchableOpacity 
                  className="bg-gray-200 px-6 py-3 rounded-xl"
                  onPress={() => setSearchText('')}
                >
                  <Text className="text-gray-700 font-semibold text-base">Try Different Search</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Search Suggestions */}
        {currentProperties.length === 0 && !searchQuery && !currentLoading && !currentError && (
          <View className="px-6 py-6">
            <Text className="text-lg font-semibold text-text-primary mb-4">Popular Searches</Text>
            <View className="flex-row flex-wrap gap-2">
              {['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Miami'].map((city) => (
                <TouchableOpacity
                  key={city}
                  className="bg-surface border border-border px-4 py-2 rounded-full"
                  onPress={() => handlePopularCitySearch(city)}
                >
                  <Text className="text-text-primary font-medium">{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="mt-6">
              <Text className="text-lg font-semibold text-text-primary mb-4">Quick Filters</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: 'Under $500K', filter: 'Price' },
                  { label: '2+ Bedrooms', filter: 'BHK' },
                  { label: 'Buy Properties', filter: 'Type' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.filter}
                    className="bg-primary-50 border border-primary-200 px-4 py-2 rounded-full"
                    onPress={() => handleFilterChange(item.filter)}
                  >
                    <Text className="text-primary font-medium">{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}