import { useInquiry } from '@/hooks/useInquiry';
import { usePropertyById } from '@/hooks/useProperties';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [emiAmount, setEmiAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  
  // Inquiry state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');

  // Fetch property data using the ID
  const { property, loading, error, refetch } = usePropertyById(id || '', { autoFetch: !!id });

  // Use inquiry hook
  const { 
    inquiry, 
    hasInquired, 
    loading: inquiryLoading, 
    error: inquiryError, 
    isAuthenticated: inquiryAuthenticated,
    createInquiry, 
    clearError: clearInquiryError 
  } = useInquiry({ propertyId: id, autoCheck: !!id });

  // Get all images for the property
  const images = property ? getPropertyImages(property) : [];
  const totalImages = images.length || 1;
  const hasImages = images.length > 0;

  // Debug logging for property detail images
  console.log('🖼️ PropertyDetailScreen - Property ID:', id);
  console.log('🖼️ PropertyDetailScreen - Raw property data keys:', property ? Object.keys(property) : 'No property');
  console.log('🖼️ PropertyDetailScreen - property_images:', property?.property_images);
  console.log('🖼️ PropertyDetailScreen - Processed images:', images);
  console.log('🖼️ PropertyDetailScreen - hasImages:', hasImages);
  console.log('🖼️ PropertyDetailScreen - Current image index:', currentImage);

  // Single Stack.Screen header definition for all states
  const headerTitle = property?.title || "Property Detail";
  const headerOptions = {
    title: headerTitle,
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 16 }}>
        <Ionicons name="heart-outline" size={24} color="#374151" />
      </TouchableOpacity>
    ),
  };

  // Calculate EMI when inputs change
  const calculateEMI = useCallback(() => {
    const principal = parseFloat(loanAmount.replace(/,/g, '')) || 0;
    const rate = parseFloat(interestRate) || 0;
    const time = parseFloat(tenure) || 0;

    if (principal > 0 && rate > 0 && time > 0) {
      const monthlyRate = rate / (12 * 100);
      const numberOfPayments = time * 12;
      
      // EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
                  (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      const total = emi * numberOfPayments;
      const interest = total - principal;
      
      setEmiAmount(emi);
      setTotalAmount(total);
      setTotalInterest(interest);
    } else {
      setEmiAmount(0);
      setTotalAmount(0);
      setTotalInterest(0);
    }
  }, [loanAmount, interestRate, tenure]);

  // Update loan amount when property price changes
  useEffect(() => {
    if (property?.price) {
      // Set loan amount to property price (full property price as loan)
      const propertyPrice = Math.floor(property.price);
      setLoanAmount(propertyPrice.toLocaleString());
    }
  }, [property?.price]);

  // Recalculate EMI when inputs change
  useEffect(() => {
    calculateEMI();
  }, [calculateEMI]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle loan amount input with formatting
  const handleLoanAmountChange = (text: string) => {
    // Remove all non-numeric characters except commas
    const cleaned = text.replace(/[^\d,]/g, '');
    // Remove commas and convert to number
    const number = parseInt(cleaned.replace(/,/g, '')) || 0;
    // Format with commas
    const formatted = number.toLocaleString();
    setLoanAmount(formatted);
  };

  // Handle interest rate input
  const handleInterestRateChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setInterestRate(cleaned);
    }
  };

  // Handle tenure input
  const handleTenureChange = (text: string) => {
    // Allow only numbers
    const cleaned = text.replace(/[^\d]/g, '');
    setTenure(cleaned);
  };

  // Inquiry handlers
  const handleOpenInquiryModal = () => {
    if (!inquiryAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to create an inquiry about this property.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => {
            // Navigate to sign in - you can implement this based on your navigation
            console.log('Navigate to sign in');
          }}
        ]
      );
      return;
    }
    setShowInquiryModal(true);
  };

  const handleCloseInquiryModal = () => {
    setShowInquiryModal(false);
    setInquiryMessage('');
    clearInquiryError();
  };

  const handleSubmitInquiry = async () => {
    try {
      await createInquiry(inquiryMessage);
      setShowInquiryModal(false);
      setInquiryMessage('');
      Alert.alert(
        'Inquiry Sent!',
        'Your inquiry has been submitted successfully. We will get back to you soon.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Error is handled by the hook
      console.error('Error submitting inquiry:', error);
    }
  };

  const getInquiryButtonText = () => {
    if (inquiryLoading) return 'Loading...';
    if (hasInquired) return 'Inquiry Sent';
    return 'Send Inquiry';
  };

  const getInquiryButtonColor = () => {
    if (hasInquired) return '#10B981'; // Green for sent
    return '#007C91'; // Primary blue
  };

  // Handle opening Google Maps
  const handleOpenMap = async () => {
    if (!property?.latitude || !property?.longitude) {
      Alert.alert(
        'Location Not Available',
        'This property does not have location coordinates available.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Cannot Open Maps',
          'Google Maps is not available on this device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening map:', error);
      Alert.alert(
        'Error',
        'Failed to open Google Maps. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle Call Now button
  const handleCallNow = () => {
    const phone = property?.agent?.phone;
    if (!phone) {
      Alert.alert('No Phone Number', 'Agent phone number is not available.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen name='PropertyDetailScreen' options={headerOptions} />
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
        <Stack.Screen name='PropertyDetailScreen' options={headerOptions} />
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
      <Stack.Screen name='PropertyDetailScreen' options={headerOptions} />
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
                <View>
                  <View className="relative">
                    <Image
                      source={{ uri: images[currentImage]?.image_url }}
                      style={styles.propertyImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('❌ Property detail image failed to load:', error);
                        console.log('❌ Failed URL:', images[currentImage]?.image_url);
                      }}
                      onLoad={() => {
                        console.log('✅ Property detail image loaded:', images[currentImage]?.image_url);
                      }}
                      onLoadStart={() => {
                        console.log('🔄 Property detail image loading started:', images[currentImage]?.image_url);
                      }}
                      onLoadEnd={() => {
                        console.log('🔚 Property detail image loading ended:', images[currentImage]?.image_url);
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

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <ScrollView 
                      horizontal 
                      className="px-4 py-3 bg-gray-50"
                      showsHorizontalScrollIndicator={false}
                    >
                      {images.map((image: any, index: number) => (
                        <TouchableOpacity
                          key={index}
                          className={`mr-2 rounded-lg overflow-hidden border-2 ${
                            currentImage === index ? 'border-primary' : 'border-transparent'
                          }`}
                          onPress={() => setCurrentImage(index)}
                        >
                          <Image
                            source={{ uri: image.image_url }}
                            className="w-16 h-16"
                            resizeMode="cover"
                            onError={(error) => {
                              console.log(`❌ Thumbnail ${index} failed:`, error);
                            }}
                            onLoad={() => {
                              console.log(`✅ Thumbnail ${index} loaded`);
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              ) : (
                <View style={{ width: '100%', height: 300 }} className="bg-gray-200 justify-center items-center">
                  <Ionicons name="home-outline" size={64} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">No Images Available</Text>
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
                onPress={handleCallNow}
              />
              {/* <ActionButton
                title="Chat"
                icon="chatbubble-outline"
                onPress={() => {}} */}
                {/* /> */}
            </View>
            
            {/* Inquiry Button */}
            <TouchableOpacity
              style={[
                styles.inquiryButton,
                { backgroundColor: getInquiryButtonColor() },
                hasInquired && styles.inquiryButtonSent
              ]}
              onPress={handleOpenInquiryModal}
              disabled={inquiryLoading || hasInquired}
            >
              <Ionicons 
                name={hasInquired ? "checkmark-circle" : "mail-outline"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.inquiryButtonText}>
                {getInquiryButtonText()}
              </Text>
            </TouchableOpacity>
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
                onPress={handleOpenMap}
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
              label="Loan Amount (Property Price)"
              value={loanAmount}
              suffix="₹"
              onChangeText={handleLoanAmountChange}
              />
            
            <InputField
              label="Interest Rate"
              value={interestRate}
              suffix="%"
              onChangeText={handleInterestRateChange}
            />
            
            <InputField
              label="Tenure"
              value={tenure}
              suffix="yrs"
              onChangeText={handleTenureChange}
            />
            
            <View style={styles.emiResult}>
              <View style={styles.emiResultRow}>
                <Text style={styles.emiResultLabel}>Monthly EMI:</Text>
                <Text style={styles.emiResultValue}>{formatCurrency(emiAmount)}</Text>
              </View>
              <View style={styles.emiResultRow}>
                <Text style={styles.emiResultLabel}>Total Amount:</Text>
                <Text style={styles.emiResultValue}>{formatCurrency(totalAmount)}</Text>
              </View>
              <View style={styles.emiResultRow}>
                <Text style={styles.emiResultLabel}>Total Interest:</Text>
                <Text style={styles.emiResultValue}>{formatCurrency(totalInterest)}</Text>
              </View>
            </View>
            {/* Note about loan amount */}
            <View className="bg-blue-50 rounded-md p-3 mt-2">
              <Text className="text-blue-700 text-sm">
                💡 Loan amount is set to the property price. You can adjust it based on your down payment.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>

    {/* Inquiry Modal */}
    <Modal
      visible={showInquiryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseInquiryModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Inquiry</Text>
            <TouchableOpacity onPress={handleCloseInquiryModal}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Tell us more about your interest in this property
          </Text>
          
          {inquiryError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{inquiryError}</Text>
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
              placeholder="I'm interested in this property. Please provide more details about..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseInquiryModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: inquiryLoading ? '#9CA3AF' : '#007C91' }
              ]}
              onPress={handleSubmitInquiry}
              disabled={inquiryLoading}
            >
              {inquiryLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Send Inquiry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  emiResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  emiResultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  emiResultValue: {
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
  // Inquiry Button Styles
  inquiryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  inquiryButtonSent: {
    opacity: 0.8,
  },
  inquiryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
