import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface PreferenceState {
  location: string;
  selectedLocationType: string | null;
  selectedHomeType: string | null;
  minPrice: string;
  maxPrice: string;
  selectedPriceRange: string | null;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
}

const locationTypes = ['Downtown', 'Suburbs', 'Near Transit', 'Waterfront'];
const homeTypes = ['House', 'Apartment', 'Condo', 'Townhouse'];
const priceRanges = ['Under $300K', '$300K - $500K', '$500K - $750K', '$750K+'];
const amenities = ['Parking', 'Garden/Yard', 'Pool', 'Pet Friendly', 'Gym', 'Fireplace'];

export default function AfterSignUpScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferenceState>({
    location: '',
    selectedLocationType: null,
    selectedHomeType: 'House',
    minPrice: '',
    maxPrice: '',
    selectedPriceRange: null,
    bedrooms: 'Any',
    bathrooms: 'Any',
    amenities: [],
  });

  const handleLocationTypeSelect = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedLocationType: prev.selectedLocationType === type ? null : type,
    }));
  };

  const handleHomeTypeSelect = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedHomeType: type,
    }));
  };

  const handlePriceRangeSelect = (range: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedPriceRange: prev.selectedPriceRange === range ? null : range,
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSavePreferences = () => {
    // Here you would typically save to Supabase
    Alert.alert(
      'Preferences Saved!',
      'Your preferences have been saved successfully.',
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Preferences',
      'You can always update your preferences later in your profile.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: () => router.replace('/(tabs)/home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Perfect Home</Text>
          <Text style={styles.subtitle}>
            Tell us your preferences to help us find the best matches for you
          </Text>
        </View>

        {/* Preferred Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Preferred Location</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter city, neighborhood, or ZIP code"
              value={preferences.location}
              onChangeText={(text) => setPreferences(prev => ({ ...prev, location: text }))}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.chipContainer}>
            {locationTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  preferences.selectedLocationType === type && styles.chipSelected,
                ]}
                onPress={() => handleLocationTypeSelect(type)}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferences.selectedLocationType === type && styles.chipTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Home Type Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home" size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Home Type</Text>
          </View>
          
          <View style={styles.homeTypeContainer}>
            {homeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.homeTypeButton,
                  preferences.selectedHomeType === type && styles.homeTypeButtonSelected,
                ]}
                onPress={() => handleHomeTypeSelect(type)}
              >
                <Ionicons
                  name={type === 'House' ? 'home' : type === 'Apartment' ? 'business' : type === 'Condo' ? 'business' : 'home'}
                  size={24}
                  color={preferences.selectedHomeType === type ? '#FFFFFF' : '#4F46E5'}
                />
                <Text
                  style={[
                    styles.homeTypeText,
                    preferences.selectedHomeType === type && styles.homeTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Price Range</Text>
          </View>
          
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Minimum Price</Text>
              <TextInput
                style={styles.priceTextInput}
                placeholder="No minimum"
                value={preferences.minPrice}
                onChangeText={(text) => setPreferences(prev => ({ ...prev, minPrice: text }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceInput}>
              <Text style={styles.priceLabel}>Maximum Price</Text>
              <TextInput
                style={styles.priceTextInput}
                placeholder="No maximum"
                value={preferences.maxPrice}
                onChangeText={(text) => setPreferences(prev => ({ ...prev, maxPrice: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.chipContainer}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.chip,
                  preferences.selectedPriceRange === range && styles.chipSelected,
                ]}
                onPress={() => handlePriceRangeSelect(range)}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferences.selectedPriceRange === range && styles.chipTextSelected,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Additional Preferences</Text>
          </View>
          
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Bedrooms</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{preferences.bedrooms}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Bathrooms</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{preferences.bathrooms}</Text>
                <Ionicons name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Desired Amenities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Desired Amenities</Text>
          </View>
          
          <View style={styles.amenitiesContainer}>
            {amenities.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                style={styles.amenityItem}
                onPress={() => handleAmenityToggle(amenity)}
              >
                <View style={[
                  styles.checkbox,
                  preferences.amenities.includes(amenity) && styles.checkboxSelected,
                ]}>
                  {preferences.amenities.includes(amenity) && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.amenityText}>{amenity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.findHomesButton} onPress={handleSavePreferences}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
            <Text style={styles.findHomesButtonText}>Find Homes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    padding: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  homeTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  homeTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  homeTypeButtonSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  homeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  homeTypeTextSelected: {
    color: '#FFFFFF',
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  priceTextInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  preferencesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  preferenceItem: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  findHomesButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    gap: 8,
  },
  findHomesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
