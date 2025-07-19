import { usePropertyById } from '@/hooks/useProperties';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Interactive Tool Card Component
const ToolCard = ({ 
  title, 
  subtitle, 
  icon, 
  onPress 
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.toolCard} onPress={onPress}>
    <View style={styles.toolCardContent}>
      <View>
        <Text style={styles.toolCardTitle}>{title}</Text>
        <Text style={styles.toolCardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name={icon as any} size={24} color="#6B7280" />
    </View>
  </TouchableOpacity>
);

// Action Button Component
const ActionButton = ({ 
  title, 
  icon, 
  onPress, 
  isPrimary = false 
}: {
  title: string;
  icon: string;
  onPress: () => void;
  isPrimary?: boolean;
}) => (
  <TouchableOpacity 
    style={[styles.actionButton, isPrimary ? styles.primaryActionButton : styles.secondaryActionButton]} 
    onPress={onPress}
  >
    <Ionicons name={icon as any} size={20} color={isPrimary ? "#FFFFFF" : "#374151"} />
    <Text style={[styles.actionButtonText, isPrimary ? styles.primaryActionButtonText : styles.secondaryActionButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Input Field Component
const InputField = ({ 
  label, 
  value, 
  suffix, 
  onChangeText 
}: {
  label: string;
  value: string;
  suffix?: string;
  onChangeText: (text: string) => void;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputField}>
      <TextInput
        style={styles.inputText}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
      {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
    </View>
  </View>
);

// Utility functions for formatting
const formatPrice = (price: number | null) => {
  if (!price) return 'Price on request';
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatSpecs = (property: any) => {
  const specs = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} BHK`);
  if (property.bathrooms) specs.push(`${property.bathrooms} bath`);
  return specs.join(' • ');
};

const formatLocation = (property: any) => {
  const location = [];
  if (property.address) location.push(property.address);
  if (property.city) location.push(property.city);
  return location.join(', ');
};

// Enhanced function to get property images - handles multiple formats
const getPropertyImages = (property: any) => {
  // Case 1: property_images is an array (standard format)
  if (property.property_images && Array.isArray(property.property_images)) {
    return property.property_images;
  }
  
  // Case 2: property_images is a single string
  if (property.property_images && typeof property.property_images === 'string') {
    return [{ image_url: property.property_images, is_primary: true }];
  }
  
  // Case 3: Check for single 'image' field (alternative format)
  if (property.image && typeof property.image === 'string') {
    return [{ image_url: property.image, is_primary: true }];
  }
  
  // Case 4: Check for 'image_url' field (alternative format)
  if (property.image_url && typeof property.image_url === 'string') {
    return [{ image_url: property.image_url, is_primary: true }];
  }
  
  // Case 5: Check for 'images' field that could be array or string
  const imagesProp = property.images;
  if (imagesProp) {
    if (Array.isArray(imagesProp)) {
      return imagesProp.map((img: string | { image_url: string; is_primary?: boolean }, index: number) => {
        if (typeof img === 'string') {
          return { image_url: img, is_primary: false };
        }
        return img;
      });
    } else if (typeof imagesProp === 'string') {
      return [{ image_url: imagesProp, is_primary: true }];
    }
  }
  
  return [];
};

const getPrimaryImage = (property: any) => {
  const images = getPropertyImages(property);
  const primaryImage = images.find((img: any) => img.is_primary);
  return primaryImage?.image_url || images[0]?.image_url || null;
};

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentImage, setCurrentImage] = useState(0);
  const [loanAmount, setLoanAmount] = useState('96,00,000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  // Fetch property data using the ID
  const { property, loading, error, refetch } = usePropertyById(id || '', { autoFetch: !!id });

  // Get all images for the property
  const images = property ? getPropertyImages(property) : [];
  const totalImages = images.length || 1;
  const hasImages = images.length > 0;

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen name='PropertyDetailScreen' options={{
          title: "Property Detail",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="heart-outline" size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007C91" />
            <Text style={styles.loadingText}>Loading property details...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <>
        <Stack.Screen name='PropertyDetailScreen' options={{
          title: "Property Detail",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="heart-outline" size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Property</Text>
            <Text style={styles.errorText}>{error || 'Property not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
    <Stack.Screen name='PropertyDetailScreen' options={{
        title: property.title || "Property Detail",
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 16 }}>
        <Ionicons name="heart-outline" size={24} color="#374151" />
      </TouchableOpacity>
    ),
    }} />
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Property Image Gallery */}
          <View style={styles.imageGallery}>
            {hasImages ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: images[currentImage]?.image_url }}
                  style={styles.propertyImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Property detail image failed to load:', error);
                  }}
                  onLoad={() => {
                    console.log('Property detail image loaded:', images[currentImage]?.image_url);
                  }}
                />
                
                {/* Image navigation buttons */}
                {images.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={styles.imageNavButton}
                      onPress={() => setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    >
                      <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.imageNavButton, styles.imageNavButtonRight]}
                      onPress={() => setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.imageContainer}>
                <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                <Text style={styles.noImageText}>No Images Available</Text>
              </View>
            )}
            
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {Array.from({ length: Math.min(totalImages, 5) }).map((_, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.dot, 
                    index === currentImage ? styles.activeDot : {}
                  ]}
                  onPress={() => setCurrentImage(index)}
                />
              ))}
            </View>
            
            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{currentImage + 1}/{totalImages}</Text>
            </View>
          </View>

          {/* Property Overview */}
          <View style={styles.propertyOverview}>
            <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
            
            <View style={styles.propertySpecs}>
              <Text style={styles.specText}>{formatSpecs(property)}</Text>
            </View>
            
            <Text style={styles.propertyName}>{property.title}</Text>
            <Text style={styles.propertyLocation}>{formatLocation(property)}</Text>
          </View>

          {/* Interactive Tools - Section 1 */}
          <View style={styles.toolsSection}>
            <ToolCard
              title="EMI Calculator"
              subtitle="Calculate monthly payment"
              icon="calculator-outline"
              onPress={() => {}}
              />
            
            <View style={styles.actionButtons}>
              <ActionButton
                title="Call Now"
                icon="call-outline"
                onPress={() => {}}
              />
              <ActionButton
                title="Chat"
                icon="chatbubble-outline"
                onPress={() => {}}
                />
            </View>
          </View>

          {/* Interactive Tools - Section 2 */}
          <View style={styles.viewersSection}>
            <ToolCard
              title="3D Viewer"
              subtitle="Virtual Tour"
              icon="cube-outline"
              onPress={() => {}}
              />
            <ToolCard
              title="Nearby Map"
              subtitle="Location View"
              icon="location-outline"
              onPress={() => {}}
            />
          </View>

          {/* AI Insight Section */}
          <View style={styles.aiInsightCard}>
            <View style={styles.aiInsightHeader}>
              <View style={styles.aiInsightIcon}>
                <Ionicons name="information-circle" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.aiInsightContent}>
                <Text style={styles.aiInsightTitle}>AI Insight: Why this is a good match</Text>
                <Text style={styles.aiInsightDescription}>
                  Based on your preferences, this property offers excellent connectivity, top-rated schools nearby, and strong appreciation potential in the {property.city} area.
                </Text>
              </View>
            </View>
          </View>

          {/* Mortgage Calculator */}
          <View style={styles.mortgageCard}>
            <View style={styles.mortgageHeader}>
              <Ionicons name="calculator-outline" size={24} color="#374151" />
              <Text style={styles.mortgageTitle}>Mortgage Calculator</Text>
            </View>
            
            <InputField
              label="Loan Amount"
              value={loanAmount}
              suffix="₹"
              onChangeText={setLoanAmount}
              />
            
            <InputField
              label="Interest Rate"
              value={interestRate}
              suffix="%"
              onChangeText={setInterestRate}
            />
            
            <InputField
              label="Tenure"
              value={tenure}
              suffix="yrs"
              onChangeText={setTenure}
            />
            
            <View style={styles.emiResult}>
              <Text style={styles.emiResultText}>Monthly EMI: ₹82,745</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
      flex: 1,
    },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  imageGallery: {
    height: 300,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNavButtonRight: {
    right: 16,
    left: 'auto',
  },
  noImageText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 8,
  },
  imageGalleryText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  activeDot: {
    opacity: 1,
    backgroundColor: '#007C91',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  propertyOverview: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  propertyPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  propertySpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  specDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
    marginHorizontal: 8,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  toolsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toolCardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryActionButton: {
    backgroundColor: '#374151',
  },
  secondaryActionButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
  },
  secondaryActionButtonText: {
    color: '#374151',
  },
  viewersSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  aiInsightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiInsightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiInsightContent: {
    flex: 1,
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  aiInsightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  mortgageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mortgageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mortgageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputSuffix: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  emiResult: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  emiResultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
