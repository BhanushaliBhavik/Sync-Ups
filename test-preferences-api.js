#!/usr/bin/env node

// Test script for User Preferences API
const BASE_URL = 'https://home-hub-ten.vercel.app';
const TEST_USER_ID = '016da864-6e60-4a29-8a89-4365dd9b9756';

const testPreferences = {
  preferred_location: 'San Francisco, CA',
  location_type: ['Downtown', 'Near Transit'],
  home_types: ['Apartment', 'Condo'],
  min_price: 300000,
  max_price: 800000,
  bedrooms: 2,
  bathrooms: 2,
  amenities: ['Parking', 'Gym', 'Pool'],
  latitude: 37.7749,
  longitude: -122.4194
};

async function testAPI() {
  console.log('🚀 Testing User Preferences API');
  console.log('=====================================\n');

  // Test 1: Check if preferences exist (should be false initially)
  console.log('1. 🔍 Testing preferences existence check...');
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences/exists?userId=${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'X-User-ID': TEST_USER_ID
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    console.log(`   ✅ Preferences exist: ${data.exists}\n`);
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  // Test 2: Try to get preferences (should return 404)
  console.log('2. 📥 Testing get preferences (expecting 404)...');
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences?userId=${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'X-User-ID': TEST_USER_ID
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 404) {
      console.log(`   ✅ Correctly returned 404 for non-existent preferences\n`);
    } else {
      console.log(`   ⚠️ Unexpected status code\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  // Test 3: Save preferences
  console.log('3. 💾 Testing save preferences...');
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': TEST_USER_ID
      },
      body: JSON.stringify(testPreferences)
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log(`   ✅ Preferences saved successfully\n`);
    } else {
      console.log(`   ❌ Failed to save preferences\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  // Test 4: Get preferences (should work now)
  console.log('4. 📥 Testing get preferences (should work now)...');
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences?userId=${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'X-User-ID': TEST_USER_ID
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log(`   ✅ Preferences retrieved successfully\n`);
    } else {
      console.log(`   ❌ Failed to retrieve preferences\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  // Test 5: Check existence again (should be true now)
  console.log('5. 🔍 Testing preferences existence check (should be true now)...');
  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences/exists?userId=${TEST_USER_ID}`, {
      method: 'GET',
      headers: {
        'X-User-ID': TEST_USER_ID
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    console.log(`   ✅ Preferences exist: ${data.exists}\n`);
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  // Test 6: Update preferences
  console.log('6. 🔄 Testing update preferences...');
  const updatedPreferences = {
    ...testPreferences,
    preferred_location: 'Los Angeles, CA',
    min_price: 400000,
    amenities: ['Parking', 'Gym', 'Pool', 'Balcony']
  };

  try {
    const response = await fetch(`${BASE_URL}/api/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': TEST_USER_ID
      },
      body: JSON.stringify(updatedPreferences)
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.preferences.preferred_location === 'Los Angeles, CA') {
      console.log(`   ✅ Preferences updated successfully\n`);
    } else {
      console.log(`   ❌ Failed to update preferences\n`);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message, '\n');
  }

  console.log('🎉 API Testing Complete!');
  console.log('=====================================');
}

// Run tests
testAPI().catch(console.error); 