import { useEffect, useState } from 'react';
import { Database, propertyHelpers } from '../lib/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getProperties();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const searchProperties = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.searchProperties(query);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const getPropertiesByType = async (type: Property['property_type']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getPropertiesByType(type);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties by type');
    } finally {
      setLoading(false);
    }
  };

  const getPropertiesByPriceRange = async (minPrice: number, maxPrice: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getPropertiesByPriceRange(minPrice, maxPrice);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties by price range');
    } finally {
      setLoading(false);
    }
  };

  const getPropertiesByLocation = async (city?: string, state?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getPropertiesByLocation(city, state);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties by location');
    } finally {
      setLoading(false);
    }
  };

  const getPropertiesBySpecs = async (bedrooms?: number, bathrooms?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getPropertiesBySpecs(bedrooms, bathrooms);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties by specs');
    } finally {
      setLoading(false);
    }
  };

  return {
    properties,
    loading,
    error,
    fetchProperties,
    searchProperties,
    getPropertiesByType,
    getPropertiesByPriceRange,
    getPropertiesByLocation,
    getPropertiesBySpecs,
  };
};

export const useProperty = (id: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await propertyHelpers.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch property');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
  };
}; 