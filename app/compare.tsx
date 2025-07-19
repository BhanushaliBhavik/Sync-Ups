import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Property Slot Component
const PropertySlot = ({ 
  isFilled = false, 
  propertyData = null, 
  slotNumber, 
  onAdd, 
  onRemove 
}: {
  isFilled?: boolean;
  propertyData?: any;
  slotNumber: number;
  onAdd: () => void;
  onRemove: () => void;
}) => (
  <View style={[styles.propertySlot, isFilled ? styles.filledSlot : styles.emptySlot]}>
    {isFilled ? (
      <>
        <View style={styles.propertyContent}>
          <View style={styles.propertyImage}>
            <Text style={styles.propertyImageText}>Property</Text>
          </View>
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyName}>{propertyData?.name}</Text>
            <Text style={styles.propertyLocation}>{propertyData?.location}</Text>
            <Text style={styles.propertyPrice}>{propertyData?.price}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </>
    ) : (
      <TouchableOpacity style={styles.addPropertyButton} onPress={onAdd}>
        <Ionicons name="add" size={32} color="#9CA3AF" />
        <Text style={styles.addPropertyText}>Add Property {slotNumber}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Key Difference Item Component
const KeyDifferenceItem = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  showStars = false,
  starRating = 0,
  showCheckmarks = false,
  checkmarkItems = []
}: {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  showStars?: boolean;
  starRating?: number;
  showCheckmarks?: boolean;
  checkmarkItems?: string[];
}) => (
  <View style={styles.keyDifferenceItem}>
    <View style={styles.keyDifferenceHeader}>
      <Ionicons name={icon as any} size={20} color="#6B7280" />
      <Text style={styles.keyDifferenceTitle}>{title}</Text>
    </View>
    
    {showCheckmarks ? (
      <View style={styles.checkmarkList}>
        {checkmarkItems.map((item, index) => (
          <View key={index} style={styles.checkmarkItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.checkmarkText}>{item}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.keyDifferenceValue}>{value}</Text>
    )}
    
    {showStars && (
      <View style={styles.starRating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons 
            key={star}
            name={star <= starRating ? "star" : "star-outline"} 
            size={16} 
            color={star <= starRating ? "#F59E0B" : "#D1D5DB"} 
          />
        ))}
      </View>
    )}
    
    {subtitle && <Text style={styles.keyDifferenceSubtitle}>{subtitle}</Text>}
  </View>
);

export default function CompareScreen() {
  const [properties, setProperties] = useState([
    { id: 1, name: 'Sunset Villa', location: 'Downtown Area', price: '$450,000' },
    null,
    null
  ]);

  const handleAddProperty = (slotIndex: number) => {
    // Handle adding property to specific slot
    console.log('Add property to slot:', slotIndex);
  };

  const handleRemoveProperty = (slotIndex: number) => {
    const newProperties = [...properties];
    newProperties[slotIndex] = null;
    setProperties(newProperties);
  };

  const handleBrowseProperties = () => {
    // Handle browse properties navigation
    console.log('Browse properties');
  };

  const handleGetAIRecommendation = () => {
    // Handle AI recommendation
    console.log('Get AI recommendation');
  };

  const handleSaveComparison = () => {
    // Handle save comparison
    console.log('Save comparison');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Add Properties to Compare Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Properties to Compare</Text>
          <Text style={styles.sectionSubtitle}>Select up to 3 properties side-by-side</Text>
          
          <View style={styles.propertySlots}>
            {properties.map((property, index) => (
              <PropertySlot
                key={index}
                isFilled={property !== null}
                propertyData={property}
                slotNumber={index + 1}
                onAdd={() => handleAddProperty(index)}
                onRemove={() => handleRemoveProperty(index)}
              />
            ))}
          </View>
        </View>

        {/* Browse Properties Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.browseButton} onPress={handleBrowseProperties}>
            <Text style={styles.browseButtonText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>

        {/* Key Differences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Differences</Text>
          
          <KeyDifferenceItem
            icon="cash-outline"
            title="Price"
            value="$450,000"
            subtitle="Sunset Villa"
          />
          
          <KeyDifferenceItem
            icon="star-outline"
            title="Amenities"
            value=""
            showCheckmarks={true}
            checkmarkItems={["Swimming Pool", "Gym", "Parking"]}
          />
          
          <KeyDifferenceItem
            icon="construct-outline"
            title="Build Quality"
            value="Premium"
            showStars={true}
            starRating={4}
          />
          
          <KeyDifferenceItem
            icon="location-outline"
            title="Neighborhood"
            value="Downtown Area"
            subtitle="High walkability, Near transit"
          />
        </View>

        {/* AI Insight Section */}
        <View style={styles.aiInsightCard}>
          <View style={styles.aiInsightHeader}>
            <Ionicons name="hardware-chip-outline" size={24} color="#6B7280" />
            <Text style={styles.aiInsightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.aiInsightQuote}>"Which one suits you better?"</Text>
          <Text style={styles.aiInsightDescription}>
            Add more properties to get personalized recommendations based on your preferences and budget.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetAIRecommendation}>
            <Text style={styles.primaryButtonText}>Get AI Recommendation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveComparison}>
            <Text style={styles.secondaryButtonText}>Save Comparison</Text>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  propertySlots: {
    gap: 16,
  },
  propertySlot: {
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
  },
  filledSlot: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  addPropertyButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  addPropertyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '500',
  },
  propertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyImage: {
    width: 50,
    height: 50,
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  propertyImageText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  propertyDetails: {
    flex: 1,
  },
  propertyName: {
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
    color: '#111827',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  browseButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keyDifferenceItem: {
    marginBottom: 20,
  },
  keyDifferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  keyDifferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  keyDifferenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  keyDifferenceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmarkList: {
    marginBottom: 4,
  },
  checkmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkmarkText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  starRating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  aiInsightCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  aiInsightQuote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  aiInsightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});