import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Property Search</Text>
          <TouchableOpacity style={styles.favoriteHeaderButton}>
            <Ionicons name="heart-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View> */}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.voiceButton}>
              <Ionicons name="mic" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Search Section */}
        {/* <View style={styles.imageSearchSection}>
          <View style={styles.imageSearchHeader}>
            <Text style={styles.imageSearchTitle}>Image Search</Text>
            <Ionicons name="camera" size={20} color="#6B7280" />
          </View>
          <TouchableOpacity style={styles.imageUploadArea}>
            <Ionicons name="image" size={40} color="#9CA3AF" />
            <Text style={styles.uploadText}>Upload desired interior</Text>
          </TouchableOpacity>
        </View> */}

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
              onPress={() => setActiveFilter('Filters')}
              showIcon={true}
            />
            <FilterButton 
              title="Price" 
              isActive={activeFilter === 'Price'} 
              onPress={() => setActiveFilter('Price')}
            />
            <FilterButton 
              title="Type" 
              isActive={activeFilter === 'Type'} 
              onPress={() => setActiveFilter('Type')}
            />
            <FilterButton 
              title="BHK" 
              isActive={activeFilter === 'BHK'} 
              onPress={() => setActiveFilter('BHK')}
            />
            <FilterButton 
              title="Area" 
              isActive={activeFilter === 'Area'} 
              onPress={() => setActiveFilter('Area')}
            />
            <FilterButton 
              title="AI" 
              isActive={activeFilter === 'AI'} 
              onPress={() => setActiveFilter('AI')}
            />
          </ScrollView>
          
          <View style={styles.resultsSection}>
            <Text style={styles.resultsCount}>248 properties found</Text>
            <View style={styles.sortSection}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <TouchableOpacity style={styles.sortDropdown}>
                <Text style={styles.sortText}>Relevance</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Property Listings */}
        <View style={styles.propertyList}>
          <PropertyCard
            price="₹2.5 Cr"
            type="3 BHK Apartment"
            location="Bandra West, Mumbai"
            size="1,200 sq ft"
            distance="2.5 km"
          />
          
          <PropertyCard
            price="₹1.8 Cr"
            type="2 BHK Apartment"
            location="Andheri East, Mumbai"
            size="950 sq ft"
            distance="1.2 km"
          />
          
          <PropertyCard
            price="₹3.2 Cr"
            type="4 BHK Villa"
            location="Juhu, Mumbai"
            size="2,100 sq ft"
            distance="3.8 km"
          />
          
          <PropertyCard
            price="₹1.5 Cr"
            type="1 BHK Apartment"
            location="Powai, Mumbai"
            size="650 sq ft"
            distance="0.8 km"
          />
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  favoriteHeaderButton: {
    padding: 4,
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
  imageSearchSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  imageSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageSearchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  sortText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  propertyList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginBottom: 16,
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
});