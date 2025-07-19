import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnhjeglfzrwvwirbsgff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaGplZ2xmenJ3dndpcmJzZ2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4OTUzODQsImV4cCI6MjA2ODQ3MTM4NH0.y_G7sbdOMD3TT_Wep4iwxQg_xO7-zRo2XC_J1DFDHPM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your actual schema
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number | null;
          property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
          status: 'active' | 'sold' | 'pending' | 'inactive';
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          lot_size: number | null;
          year_built: number | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          latitude: number | null;
          longitude: number | null;
          agent_id: string | null;
          seller_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price?: number | null;
          property_type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
          status?: 'active' | 'sold' | 'pending' | 'inactive';
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          agent_id?: string | null;
          seller_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          property_type?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land' | 'commercial';
          status?: 'active' | 'sold' | 'pending' | 'inactive';
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          agent_id?: string | null;
          seller_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          city: string | null;
          budget_range: string | null;
          property_type_preference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          city?: string | null;
          budget_range?: string | null;
          property_type_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          city?: string | null;
          budget_range?: string | null;
          property_type_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper functions for property operations
export const propertyHelpers = {
  // Get all properties
  async getProperties() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get property by ID
  async getPropertyById(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search properties by title, description, or location
  async searchProperties(query: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get properties by type
  async getPropertiesByType(propertyType: Database['public']['Tables']['properties']['Row']['property_type']) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('property_type', propertyType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get properties by price range
  async getPropertiesByPriceRange(minPrice: number, maxPrice: number) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('price', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get properties by location (city/state)
  async getPropertiesByLocation(city?: string, state?: string) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');
    
    if (city) {
      query = query.eq('city', city);
    }
    
    if (state) {
      query = query.eq('state', state);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get properties by bedrooms/bathrooms
  async getPropertiesBySpecs(bedrooms?: number, bathrooms?: number) {
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active');
    
    if (bedrooms) {
      query = query.eq('bedrooms', bedrooms);
    }
    
    if (bathrooms) {
      query = query.eq('bathrooms', bathrooms);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get properties near coordinates (simple distance calculation)
  async getPropertiesNearLocation(lat: number, lng: number, radiusKm: number = 10) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter by distance (simple calculation)
    return data.filter(property => {
      if (!property.latitude || !property.longitude) return false;
      
      const distance = calculateDistance(
        lat, lng,
        property.latitude, property.longitude
      );
      
      return distance <= radiusKm;
    });
  },

  // Create new property
  async createProperty(propertyData: Database['public']['Tables']['properties']['Insert']) {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update property
  async updateProperty(id: string, updates: Database['public']['Tables']['properties']['Update']) {
    const { data, error } = await supabase
      .from('properties')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete property (soft delete by setting status to inactive)
  async deleteProperty(id: string) {
    const { data, error } = await supabase
      .from('properties')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default supabase; 