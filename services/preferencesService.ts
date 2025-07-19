export interface PropertyPreferences {
  id?: string;
  user_id: string;
  location: string;
  location_tags: string[];
  home_types: string[];
  min_price: string;
  max_price: string;
  price_ranges: string[];
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  nearby_areas?: string[]; // Will be calculated on your backend
  created_at?: string;
  updated_at?: string;
}

// API endpoints - replace with your actual URLs when available
const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your actual API URL
const ENDPOINTS = {
  SAVE_PREFERENCES: `${API_BASE_URL}/preferences`,
  GET_PREFERENCES: `${API_BASE_URL}/preferences`,
  DELETE_PREFERENCES: `${API_BASE_URL}/preferences`,
  SEARCH_LOCATIONS: `${API_BASE_URL}/locations/search`,
};

const isDevelopment = __DEV__;

export const preferencesService = {
  async savePreferences(userId: string, preferences: Omit<PropertyPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PropertyPreferences> {
    try {
      // When you have latitude/longitude, your backend will calculate nearby areas
      const response = await fetch(ENDPOINTS.SAVE_PREFERENCES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`, // You might want to use actual JWT token
        },
        body: JSON.stringify({
          user_id: userId,
          ...preferences,
          // Your backend will calculate nearby_areas using lat/lng
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (isDevelopment) {
        console.log('💡 Dev Mode: Using mock data since API is not available yet');
      } else {
        console.error('Error saving preferences:', error);
      }
      
      // For development, return mock data. In production, throw the error
      if (isDevelopment) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          id: 'mock-id-' + Date.now(),
          user_id: userId,
          ...preferences,
          nearby_areas: preferences.latitude && preferences.longitude ? [
            'Downtown Core',
            'Marina District', 
            'Shopping Center',
            'University Area'
          ] : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as PropertyPreferences;
      }
      
      throw new Error('Failed to save preferences. Please check your connection and try again.');
    }
  },

  async getPreferences(userId: string): Promise<PropertyPreferences | null> {
    try {
      const response = await fetch(`${ENDPOINTS.GET_PREFERENCES}/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userId}`, // You might want to use actual JWT token
        },
      });

      if (response.status === 404) {
        return null; // No preferences found
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (isDevelopment) {
        console.log('💡 Dev Mode: No preferences found (API not available)');
        return null; // Return null so user can create new preferences
      } else {
        console.error('Error getting preferences:', error);
        throw new Error('Failed to load preferences. Please try again.');
      }
    }
  },

  async deletePreferences(userId: string): Promise<void> {
    try {
      const response = await fetch(`${ENDPOINTS.DELETE_PREFERENCES}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userId}`, // You might want to use actual JWT token
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (isDevelopment) {
        console.log('💡 Dev Mode: Mock deletion (API not available)');
        return; // Pretend it worked
      } else {
        console.error('Error deleting preferences:', error);
        throw new Error('Failed to delete preferences. Please try again.');
      }
    }
  },

  async searchLocations(query: string): Promise<any[]> {
    try {
      const response = await fetch(`${ENDPOINTS.SEARCH_LOCATIONS}?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      if (isDevelopment) {
        console.log('💡 Dev Mode: Using mock location search results');
      } else {
        console.error('Error searching locations:', error);
      }
      
      // Return mock data for both development and production fallback
      return [
        { 
          id: '1', 
          name: `${query} - Downtown`, 
          latitude: 37.7749 + Math.random() * 0.1, 
          longitude: -122.4194 + Math.random() * 0.1,
          type: 'neighborhood',
          address: `${query} Downtown, City Center`
        },
        { 
          id: '2', 
          name: `${query} - Suburbs`, 
          latitude: 37.7749 + Math.random() * 0.1, 
          longitude: -122.4194 + Math.random() * 0.1,
          type: 'area',
          address: `${query} Suburbs, Residential Area`
        },
        { 
          id: '3', 
          name: `${query} - City Center`, 
          latitude: 37.7749 + Math.random() * 0.1, 
          longitude: -122.4194 + Math.random() * 0.1,
          type: 'district',
          address: `${query} City Center, Commercial District`
        }
      ];
    }
  }
}; 