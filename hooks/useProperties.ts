import { Property, PropertyFilters, propertyService } from '@/services/propertyService';
import { useCallback, useEffect, useState } from 'react';

interface UsePropertiesOptions {
  filters?: PropertyFilters;
  autoFetch?: boolean;
}

interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { filters, autoFetch = true } = options;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.fetchProperties(filters);
      setProperties(data);
    } catch (err) {
      console.error('Error in useProperties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProperties();
    }
  }, [fetchProperties, autoFetch]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    clearError,
  };
}

interface UsePropertyByIdOptions {
  autoFetch?: boolean;
}

interface UsePropertyByIdReturn {
  property: Property | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function usePropertyById(id: string, options: UsePropertyByIdOptions = {}): UsePropertyByIdReturn {
  const { autoFetch = true } = options;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.fetchPropertyById(id);
      setProperty(data);
    } catch (err) {
      console.error('Error in usePropertyById:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch property');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && id) {
      fetchProperty();
    }
  }, [fetchProperty, autoFetch, id]);

  return {
    property,
    loading,
    error,
    refetch: fetchProperty,
    clearError,
  };
}

interface UseSearchPropertiesOptions {
  filters?: PropertyFilters;
  autoSearch?: boolean;
}

interface UseSearchPropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearError: () => void;
}

export function useSearchProperties(options: UseSearchPropertiesOptions = {}): UseSearchPropertiesReturn {
  const { filters, autoSearch = false } = options;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProperties([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.searchProperties(query, filters);
      setProperties(data);
    } catch (err) {
      console.error('Error in useSearchProperties:', err);
      setError(err instanceof Error ? err.message : 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    search,
    clearError,
  };
}

interface UseSearchByFiltersOptions {
  autoSearch?: boolean;
}

interface UseSearchByFiltersReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  searchByFilters: (filters: PropertyFilters) => Promise<void>;
  clearError: () => void;
}

export function useSearchByFilters(options: UseSearchByFiltersOptions = {}): UseSearchByFiltersReturn {
  const { autoSearch = false } = options;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByFilters = useCallback(async (filters: PropertyFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.searchPropertiesByFilters(filters);
      setProperties(data);
    } catch (err) {
      console.error('Error in useSearchByFilters:', err);
      setError(err instanceof Error ? err.message : 'Failed to search properties');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    searchByFilters,
    clearError,
  };
}

interface UseTrendingPropertiesOptions {
  limit?: number;
  autoFetch?: boolean;
}

interface UseTrendingPropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useTrendingProperties(options: UseTrendingPropertiesOptions = {}): UseTrendingPropertiesReturn {
  const { limit = 5, autoFetch = true } = options;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.fetchTrendingProperties(limit);
      setProperties(data);
    } catch (err) {
      console.error('Error in useTrendingProperties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending properties');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTrending();
    }
  }, [fetchTrending, autoFetch]);

  return {
    properties,
    loading,
    error,
    refetch: fetchTrending,
    clearError,
  };
}

interface UseTopMatchesOptions {
  userId?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseTopMatchesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useTopMatches(options: UseTopMatchesOptions = {}): UseTopMatchesReturn {
  const { userId, limit = 3, autoFetch = true } = options;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await propertyService.fetchTopMatches(userId, limit);
      setProperties(data);
    } catch (err) {
      console.error('Error in useTopMatches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top matches');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTopMatches();
    }
  }, [fetchTopMatches, autoFetch]);

  return {
    properties,
    loading,
    error,
    refetch: fetchTopMatches,
    clearError,
  };
} 