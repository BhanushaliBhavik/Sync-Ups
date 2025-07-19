import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  address?: string;
}

class LocationService {
  private hasPermission: boolean = false;

  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      if (!this.hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to help you find properties in your preferred areas and get nearby suggestions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Location.requestForegroundPermissionsAsync()
            }
          ]
        );
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      if (!this.hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure location services are enabled.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  async geocodeAddress(address: string): Promise<LocationCoords | null> {
    try {
      if (!address.trim()) return null;

      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length > 0) {
        return {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const reverseGeocoded = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocoded.length > 0) {
        const location = reverseGeocoded[0];
        const parts = [
          location.name,
          location.street,
          location.city,
          location.region,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Mock location search - replace with your API
  async searchLocations(query: string): Promise<LocationResult[]> {
    if (!query.trim()) return [];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data - replace with actual API call
    const mockResults: LocationResult[] = [
      {
        id: '1',
        name: `${query} Downtown`,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        type: 'neighborhood',
        address: `${query} Downtown, City Center`
      },
      {
        id: '2',
        name: `${query} Heights`,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        type: 'district',
        address: `${query} Heights, Residential Area`
      },
      {
        id: '3',
        name: `${query} Marina`,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        type: 'waterfront',
        address: `${query} Marina, Waterfront District`
      },
      {
        id: '4',
        name: `${query} Tech District`,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        type: 'business',
        address: `${query} Tech District, Commercial Area`
      }
    ];

    return mockResults;
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService(); 