import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  }
];

// Property Card Component
const PropertyCard = ({ 
  title, 
  location, 
  specs, 
  price, 
  isTopMatch = false, 
  showViewDetails = false,
  matchPercentage = null 
}: {
  title: string;
  location: string;
  specs: string;
  price: string;
  isTopMatch?: boolean;
  showViewDetails?: boolean;
  matchPercentage?: number | null;
}) => (
  <View style={styles.propertyCard}>
    {/* Property Image Placeholder */}
    <View style={styles.propertyImage}>
      <Text style={styles.imagePlaceholderText}>Property Image</Text>
      
      {/* AI Pick and Match Labels for Top Match */}
      {isTopMatch && (
        <>
          <View style={styles.aiPickLabel}>
            <Text style={styles.labelText}>AI Pick</Text>
          </View>
          <View style={styles.matchLabel}>
            <Text style={styles.labelText}>{matchPercentage}% Match</Text>
          </View>
        </>
      )}
    </View>
    
    {/* Property Details */}
    <View style={styles.propertyDetails}>
      <View style={styles.propertyHeader}>
        <Text style={styles.propertyTitle}>{title}</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.propertyLocation}>{location}</Text>
      <Text style={styles.propertySpecs}>{specs}</Text>
      
      <View style={styles.propertyFooter}>
        <Text style={styles.propertyPrice}>{price}</Text>
        {showViewDetails && (
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
)

// Action Button Component
const ActionButton = ({ title, isActive, onPress }: {
  title: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.actionButton, isActive ? styles.activeActionButton : styles.inactiveActionButton]}
  >
    <Text style={[styles.actionButtonText, isActive ? styles.activeActionButtonText : styles.inactiveActionButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
)

// Utility functions for formatting
const formatLocation = (property: any) => {
  const location = [];
  if (property.address) location.push(property.address);
  if (property.city) location.push(property.city);
  if (property.state) location.push(property.state);
  return location.join(', ');
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

const formatSpecs = (property: any) => {
  const specs = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} beds`);
  if (property.bathrooms) specs.push(`${property.bathrooms} baths`);
  if (property.square_feet) specs.push(`${property.square_feet.toLocaleString()} sq ft`);
  return specs.join(' • ');
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('Buy')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Static implementation - no actual filtering needed
  }

  // Get top match (first property) and trending properties (next 2)
  const topMatch = mockProperties[0]
  const trendingProperties = mockProperties.slice(1, 3)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* User Greeting and Navigation */}
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.greeting}>Good morning</Text>
                <Text style={styles.userName}>Sarah</Text>
              </View>
            </View>
            
            <View style={styles.navigationIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="menu-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Selector */}
          <View style={styles.locationSection}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.locationText}>Downtown, San Francisco</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeLocationText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <ActionButton 
              title="Buy" 
              isActive={activeTab === 'Buy'} 
              onPress={() => handleTabChange('Buy')} 
            />
            <ActionButton 
              title="Rent" 
              isActive={activeTab === 'Rent'} 
              onPress={() => handleTabChange('Rent')} 
            />
            <ActionButton 
              title="Plot" 
              isActive={activeTab === 'Plot'} 
              onPress={() => handleTabChange('Plot')} 
            />
          </View>
        </View>

        {/* Top Match Section */}
        {topMatch && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Match for You</Text>
            <Text style={styles.sectionSubtitle}>Looks like something you'll love</Text>
            
            <PropertyCard
              title={topMatch.title}
              location={formatLocation(topMatch)}
              specs={formatSpecs(topMatch)}
              price={formatPrice(topMatch.price)}
              isTopMatch={true}
              showViewDetails={true}
              matchPercentage={90}
            />
          </View>
        )}

        {/* Trending Homes Section */}
        {trendingProperties.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Homes Nearby</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.trendingList}>
              {trendingProperties.map((property) => (
                <View key={property.id} style={styles.propertyCardWrapper}>
                  <PropertyCard
                    title={property.title}
                    location={formatLocation(property)}
                    specs={formatSpecs(property)}
                    price={formatPrice(property.price)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#D1D5DB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greeting: {
    color: '#6B7280',
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  navigationIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 4,
    marginLeft: 16,
  },
  locationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  changeLocationText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeActionButton: {
    backgroundColor: '#000000',
  },
  inactiveActionButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  activeActionButtonText: {
    color: '#FFFFFF',
  },
  inactiveActionButtonText: {
    color: '#374151',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#6B7280',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  trendingList: {
    // Gap will be handled by marginBottom on individual items
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
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  propertyImage: {
    height: 192,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  aiPickLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  matchLabel: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  propertyDetails: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  propertyLocation: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  propertySpecs: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 12,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewDetailsButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  refreshButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
})