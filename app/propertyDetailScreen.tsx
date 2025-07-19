import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function PropertyDetailScreen() {
  const [currentImage, setCurrentImage] = useState(1);
  const [loanAmount, setLoanAmount] = useState('96,00,000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  const totalImages = 8;

  return (
    <>
    <Stack.Screen name='propertyDetailScreen' options={{
        title: "Property Detail",
    headerRight: () => (
      <TouchableOpacity style={{ marginRight: 16 }}>
        <Ionicons name="heart-outline" size={24} color="#374151" />
      </TouchableOpacity>
    ),
    }} />
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        {/* <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Property Image Gallery */}
        <View style={styles.imageGallery}>
          <Text style={styles.imageGalleryText}>Property Image Gallery</Text>
          
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          
          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{currentImage}/{totalImages}</Text>
          </View>
        </View>

        {/* Property Overview */}
        <View style={styles.propertyOverview}>
          <Text style={styles.propertyPrice}>₹1.2 Cr</Text>
          
          <View style={styles.propertySpecs}>
            <Text style={styles.specText}>3 BHK</Text>
            <View style={styles.specDot} />
            <Text style={styles.specText}>1,450 sq ft</Text>
            <View style={styles.specDot} />
            <Text style={styles.specText}>Ready to Move</Text>
          </View>
          
          <Text style={styles.propertyName}>Prestige Lakeside Habitat</Text>
          <Text style={styles.propertyLocation}>Varthur, Bangalore</Text>
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
                Based on your preferences, this property offers excellent connectivity, top-rated schools nearby, and strong appreciation potential in the Varthur corridor.
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

        {/* Contact Agent Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Interested in this property?</Text>
          <Text style={styles.contactSubtitle}>Get instant updates and schedule a visit</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact Agent</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  </>
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
  contactSection: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
