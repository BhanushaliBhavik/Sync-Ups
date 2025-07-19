import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { propertyHelpers } from '../lib/supabase';
import {
    calculateDownPayment,
    calculateEMI,
    filterProperties,
    formatLocation,
    formatPrice,
    formatSpecs,
    getPropertyStats,
    sortProperties
} from '../utils/propertyUtils';

// Demo component showing various Supabase functions
export const PropertyDemo = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Load all properties
  const loadAllProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyHelpers.getProperties();
      setProperties(data);
      setFilteredProperties(data);
      setStats(getPropertyStats(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Search properties
  const searchProperties = async (query: string) => {
    if (!query.trim()) {
      setFilteredProperties(properties);
      return;
    }
    
    setLoading(true);
    try {
      const data = await propertyHelpers.searchProperties(query);
      setFilteredProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  // Filter by property type
  const filterByType = async (type: string) => {
    setLoading(true);
    try {
      const data = await propertyHelpers.getPropertiesByType(type as any);
      setFilteredProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter properties');
    } finally {
      setLoading(false);
    }
  };

  // Filter by price range
  const filterByPriceRange = async (min: number, max: number) => {
    setLoading(true);
    try {
      const data = await propertyHelpers.getPropertiesByPriceRange(min, max);
      setFilteredProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by price range');
    } finally {
      setLoading(false);
    }
  };

  // Filter by location
  const filterByLocation = async (city: string, state: string) => {
    setLoading(true);
    try {
      const data = await propertyHelpers.getPropertiesByLocation(city, state);
      setFilteredProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by location');
    } finally {
      setLoading(false);
    }
  };

  // Filter by specifications
  const filterBySpecs = async (bedrooms: number, bathrooms: number) => {
    setLoading(true);
    try {
      const data = await propertyHelpers.getPropertiesBySpecs(bedrooms, bathrooms);
      setFilteredProperties(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by specifications');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filterByPrice = (minPrice: number, maxPrice: number) => {
    const filtered = filterProperties(properties, { minPrice, maxPrice });
    setFilteredProperties(filtered);
  };

  // Client-side sorting
  const sortByPrice = (ascending: boolean) => {
    const sorted = sortProperties(filteredProperties, ascending ? 'price' : 'price_desc');
    setFilteredProperties(sorted);
  };

  // Calculate mortgage for a property
  const calculateMortgage = (property: any) => {
    if (!property.price) return null;
    
    const downPayment = calculateDownPayment(property.price);
    const loanAmount = property.price - downPayment;
    const monthlyPayment = calculateEMI(loanAmount, 4.5, 30); // 4.5% interest, 30 years
    
    return {
      downPayment: formatPrice(downPayment),
      monthlyPayment: formatPrice(monthlyPayment),
      loanAmount: formatPrice(loanAmount)
    };
  };

  useEffect(() => {
    loadAllProperties();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Property Functions Demo</Text>
      
      {/* Statistics */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Property Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalProperties}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.activeProperties}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.soldProperties}</Text>
              <Text style={styles.statLabel}>Sold</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatPrice(stats.avgPrice)}</Text>
              <Text style={styles.statLabel}>Avg Price</Text>
            </View>
          </View>
        </View>
      )}

      {/* Function Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Functions</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => searchProperties('apartment')}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Search "Apartment"</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => filterByType('house')}
        >
          <Ionicons name="home" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Filter by House Type</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => filterByPriceRange(200000, 500000)}
        >
          <Ionicons name="cash" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Price Range $200K-$500K</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => filterByLocation('San Francisco', 'CA')}
        >
          <Ionicons name="location" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Filter by Location</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => filterBySpecs(2, 2)}
        >
          <Ionicons name="bed" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>2 Bed, 2 Bath</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={loadAllProperties}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Load All Properties</Text>
        </TouchableOpacity>
      </View>

      {/* Client-side Functions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client-side Functions</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => filterByPrice(300000, 600000)}
        >
          <Ionicons name="filter" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Filter $300K-$600K (Client)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => sortByPrice(true)}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Sort by Price (Low to High)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => sortByPrice(false)}
        >
          <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Sort by Price (High to Low)</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Results ({filteredProperties.length} properties)
        </Text>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {filteredProperties.slice(0, 5).map((property, index) => {
          const mortgage = calculateMortgage(property);
          
          return (
            <View key={property.id || index} style={styles.propertyCard}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyLocation}>{formatLocation(property)}</Text>
              <Text style={styles.propertySpecs}>{formatSpecs(property)}</Text>
              <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
              
              {mortgage && (
                <View style={styles.mortgageInfo}>
                  <Text style={styles.mortgageTitle}>Mortgage Calculator:</Text>
                  <Text style={styles.mortgageText}>Down Payment: {mortgage.downPayment}</Text>
                  <Text style={styles.mortgageText}>Monthly Payment: {mortgage.monthlyPayment}</Text>
                  <Text style={styles.mortgageText}>Loan Amount: {mortgage.loanAmount}</Text>
                </View>
              )}
            </View>
          );
        })}

        {filteredProperties.length === 0 && !loading && (
          <Text style={styles.noResults}>No properties found</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  propertyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  propertySpecs: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  mortgageInfo: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  mortgageTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  mortgageText: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
}); 