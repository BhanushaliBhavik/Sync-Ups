import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Settings Item Component
const SettingsItem = ({ 
  icon, 
  title, 
  subtitle, 
  value, 
  showChevron = true,
  showToggle = false,
  toggleValue = false,
  onToggle,
  onPress 
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}) => (
  <TouchableOpacity 
    style={styles.settingsItem} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        {value && <Text style={styles.settingsItemValue}>{value}</Text>}
      </View>
    </View>
    <View style={styles.settingsItemRight}>
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#374151' }}
          thumbColor="#FFFFFF"
        />
      )}
      {showChevron && !showToggle && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </View>
  </TouchableOpacity>
);

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

export default function ProfileScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleEditProfile = () => {
    // Handle edit profile navigation
    console.log('Edit profile');
  };

  const handleLogout = () => {
    // Handle logout functionality
    console.log('Logout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@email.com</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <SectionHeader title="PERSONAL INFORMATION" />
          
          <SettingsItem
            icon="person-outline"
            title="Full Name"
            value="John Doe"
            onPress={() => console.log('Edit full name')}
          />
          
          <SettingsItem
            icon="mail-outline"
            title="Email"
            value="john.doe@email.com"
            onPress={() => console.log('Edit email')}
          />
          
          <SettingsItem
            icon="call-outline"
            title="Phone Number"
            value="+1 (555) 123-4567"
            onPress={() => console.log('Edit phone number')}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <SectionHeader title="PREFERENCES" />
          
          <SettingsItem
            icon="location-outline"
            title="City"
            value="New York, NY"
            onPress={() => console.log('Edit city')}
          />
          
          <SettingsItem
            icon="cash-outline"
            title="Budget Range"
            value="$1,500 - $2,500"
            onPress={() => console.log('Edit budget range')}
          />
          
          <SettingsItem
            icon="home-outline"
            title="Property Type"
            value="Apartment, Studio"
            onPress={() => console.log('Edit property type')}
          />
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <SectionHeader title="NOTIFICATION SETTINGS" />
          
          <SettingsItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get alerts for new listings"
            showChevron={false}
            showToggle={true}
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          
          <SettingsItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Weekly digest and updates"
            showChevron={false}
            showToggle={true}
            toggleValue={emailNotifications}
            onToggle={setEmailNotifications}
          />
        </View>

        {/* Other Settings Section */}
        <View style={styles.section}>
          <SettingsItem
            icon="shield-outline"
            title="Privacy & Security"
            onPress={() => console.log('Privacy & Security')}
          />
          
          <SettingsItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => console.log('Help & Support')}
          />
          
          <SettingsItem
            icon="log-out-outline"
            title="Logout"
            showChevron={false}
            onPress={handleLogout}
          />
        </View>

        {/* Navigation Buttons for Testing */}
        <View style={styles.testSection}>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => router.push("/propertyDetailScreen")}
          >
            <Text style={styles.testButtonText}>Property Detail Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => router.push("/scheduleVisit")}
          >
            <Text style={styles.testButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => router.push("/compare")}
          >
            <Text style={styles.testButtonText}>Compare</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => router.push("/AfterSignUpScreen")}
          >
            <Text style={styles.testButtonText}>Ater sign Up</Text>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  settingsItemValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsItemRight: {
    alignItems: 'center',
  },
  testSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  testButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});