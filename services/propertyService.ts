import { supabase } from '@/lib/supabase';

// Property interface based on Supabase database schema
export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
  status: 'active' | 'sold' | 'pending' | 'inactive';
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  agent_id?: string;
  seller_id?: string;
  created_at: string;
  updated_at: string;
  property_images?: PropertyImage[];
  agent?: Agent;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface Agent {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
}

export interface PropertyResponse {
  properties: Property[];
}

export interface SinglePropertyResponse {
  property: Property;
}

export interface PropertyFilters {
  type?: 'buy' | 'rent' | 'plot';
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

class PropertyService {
  // Fetch all properties with optional filters
  async fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.min_price) {
          query = query.gte('price', filters.min_price);
        }
        if (filters.max_price) {
          query = query.lte('price', filters.max_price);
        }
        if (filters.bedrooms) {
          query = query.gte('bedrooms', filters.bedrooms);
        }
        if (filters.bathrooms) {
          query = query.gte('bathrooms', filters.bathrooms);
        }
        if (filters.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully fetched properties:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  // Fetch property by ID
  async fetchPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          ),
          seller:users!properties_seller_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching property by ID:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  }

  // Search properties by text query
  async searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]> {
    try {
      let searchQuery = supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          )
        `)
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      // Apply additional filters
      if (filters) {
        if (filters.city) {
          searchQuery = searchQuery.ilike('city', `%${filters.city}%`);
        }
        if (filters.min_price) {
          searchQuery = searchQuery.gte('price', filters.min_price);
        }
        if (filters.max_price) {
          searchQuery = searchQuery.lte('price', filters.max_price);
        }
        if (filters.bedrooms) {
          searchQuery = searchQuery.gte('bedrooms', filters.bedrooms);
        }
        if (filters.bathrooms) {
          searchQuery = searchQuery.gte('bathrooms', filters.bathrooms);
        }
        if (filters.property_type) {
          searchQuery = searchQuery.eq('property_type', filters.property_type);
        }
      }

      const { data, error } = await searchQuery;

      if (error) {
        console.error('Error searching properties:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Search results:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  // Search properties by filters only
  async searchPropertiesByFilters(filters: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.min_price) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching properties by filters:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Filter results:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error searching properties by filters:', error);
      throw error;
    }
  }

  // Fetch trending properties (most viewed in last 30 days)
  async fetchTrendingProperties(limit: number = 5): Promise<Property[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          ),
          property_views!inner (
            id
          )
        `)
        .eq('status', 'active')
        .gte('property_views.viewed_at', thirtyDaysAgo.toISOString())
        .order('property_views(id)', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending properties:', error);
        // Fallback to recent properties
        return this.fetchRecentProperties(limit);
      }

      console.log('Trending properties:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching trending properties:', error);
      // Fallback to recent properties
      return this.fetchRecentProperties(limit);
    }
  }

  // Fetch recent properties as fallback
  async fetchRecentProperties(limit: number = 5): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent properties:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent properties:', error);
      throw error;
    }
  }

  // Fetch top matches (properties with high ratings)
  async fetchTopMatches(userId?: string, limit: number = 3): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          agent:users!properties_agent_id_fkey (
            id,
            name,
            email,
            phone,
            profile_image_url
          ),
          reviews!inner (
            rating
          )
        `)
        .eq('status', 'active')
        .gte('reviews.rating', 4)
        .order('reviews(rating)', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching top matches:', error);
        // Fallback to recent properties
        return this.fetchRecentProperties(limit);
      }

      console.log('Top matches:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching top matches:', error);
      // Fallback to recent properties
      return this.fetchRecentProperties(limit);
    }
  }

  // Record property view for analytics
  async recordPropertyView(propertyId: string, userId?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording property view:', error);
      }
    } catch (error) {
      console.error('Error recording property view:', error);
    }
  }
}

export const propertyService = new PropertyService(); 