import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationCoords, LocationResult, locationService } from '../services/locationService';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { name: string; latitude: number; longitude: number }) => void;
  initialLocation?: string;
  initialCoords?: LocationCoords;
}

export default function MapPicker({
  visible,
  onClose,
  onLocationSelect,
  initialLocation = '',
  initialCoords
}: MapPickerProps) {
  const [region, setRegion] = useState<Region>({
    latitude: initialCoords?.latitude || 37.7749,
    longitude: initialCoords?.longitude || -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markerCoord, setMarkerCoord] = useState<LocationCoords>({
    latitude: initialCoords?.latitude || 37.7749,
    longitude: initialCoords?.longitude || -122.4194,
  });

  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialLocation);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const results = await locationService.searchLocations(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = (result: LocationResult) => {
    const newRegion = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    setRegion(newRegion);
    setMarkerCoord({ latitude: result.latitude, longitude: result.longitude });
    setSelectedAddress(result.name);
    setSearchQuery(result.name);
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkerCoord(coordinate);
    
    // Reverse geocode to get address
    locationService.reverseGeocode(coordinate.latitude, coordinate.longitude)
      .then(address => {
        if (address) {
          setSelectedAddress(address);
          setSearchQuery(address);
        }
      });
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(newRegion);
        setMarkerCoord(location);
        
        // Get address for current location
        const address = await locationService.reverseGeocode(location.latitude, location.longitude);
        if (address) {
          setSelectedAddress(address);
          setSearchQuery(address);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get current location');
    }
  };

  const handleConfirmSelection = () => {
    onLocationSelect({
      name: selectedAddress || searchQuery || `${markerCoord.latitude.toFixed(4)}, ${markerCoord.longitude.toFixed(4)}`,
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Select Location</Text>
          <TouchableOpacity onPress={handleConfirmSelection} className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="p-4 border-b border-gray-200">
          <View className="relative">
            <TextInput
              className="w-full p-3 pr-12 border border-gray-300 rounded-xl bg-white text-gray-900"
              placeholder="Search for a location..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => setShowSearchResults(searchResults.length > 0)}
            />
            <View className="absolute right-3 top-3 flex-row">
              {isSearching && <ActivityIndicator size="small" color="#6B7280" />}
              <TouchableOpacity onPress={handleCurrentLocation} className="ml-2">
                <Ionicons name="locate" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <View className="max-h-48 border-b border-gray-200">
            <View className="overflow-hidden">
              {isSearching ? (
                <View className="p-4 items-center">
                  <ActivityIndicator size="small" color="#6B7280" />
                  <Text className="text-gray-600 mt-2">Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <View>
                  {searchResults.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      className={`p-4 ${index < searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
                      onPress={() => handleSearchResultSelect(item)}
                    >
                      <Text className="font-medium text-gray-900">{item.name}</Text>
                      {item.address && (
                        <Text className="text-sm text-gray-600 mt-1">{item.address}</Text>
                      )}
                      <Text className="text-xs text-blue-600 mt-1 capitalize">{item.type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="p-4">
                  <Text className="text-gray-600 text-center">No results found</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Map */}
        <View className="flex-1">
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            <Marker
              coordinate={markerCoord}
              draggable={true}
              onDragEnd={handleMapPress}
            >
              <View className="bg-blue-600 p-2 rounded-full">
                <Ionicons name="location" size={20} color="white" />
              </View>
            </Marker>
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            className="absolute bottom-8 right-4 bg-white p-3 rounded-full shadow-lg"
            onPress={handleCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Selected Location Display */}
        {selectedAddress && (
          <View className="p-4 bg-gray-50 border-t border-gray-200">
            <Text className="text-sm text-gray-600 mb-1">Selected Location:</Text>
            <Text className="font-medium text-gray-900">{selectedAddress}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {markerCoord.latitude.toFixed(6)}, {markerCoord.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
} 