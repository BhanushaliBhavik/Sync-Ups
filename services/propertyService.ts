// Property interface based on API response
export interface Property {
  id: string;
  title: string;
  city: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
  agent: {
    name: string;
    phone: string;
    email: string;
  };
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
}

class PropertyService {
  private baseUrl = 'https://home-hub-ten.vercel.app';

  async fetchProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let url = `${this.baseUrl}/api/properties`;
      
      // Add query parameters if filters are provided
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      console.log('Fetching properties from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Invalid response format: expected JSON');
      }
      
      const data: PropertyResponse = await response.json();
      console.log('Successfully fetched properties:', data.properties?.length || 0);
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async fetchPropertyById(id: string): Promise<Property | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SinglePropertyResponse = await response.json();
      return data.property || null;
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  }

  async searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]> {
    try {
      let url = `${this.baseUrl}/api/properties/search?q=${encodeURIComponent(query)}`;
      
      // Add additional filters if provided
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
        if (params.toString()) {
          url += `&${params.toString()}`;
        }
      }

      console.log('Searching properties from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PropertyResponse = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }

  async searchPropertiesByFilters(filters: PropertyFilters): Promise<Property[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/api/properties/search?${params.toString()}`;
      console.log('Searching properties by filters from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PropertyResponse = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error searching properties by filters:', error);
      throw error;
    }
  }

  async fetchTrendingProperties(limit: number = 5): Promise<Property[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/properties/trending?limit=${limit}`);
      
      if (!response.ok) {
        // If trending endpoint doesn't exist, fall back to regular properties
        if (response.status === 404) {
          console.log('Trending endpoint not found, falling back to regular properties');
          return this.fetchProperties();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        console.error('Response text:', await response.text());
        throw new Error('Invalid response format: expected JSON');
      }
      
      const data: PropertyResponse = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching trending properties:', error);
      
      // Fallback to regular properties if trending fails
      try {
        console.log('Falling back to regular properties due to trending error');
        return this.fetchProperties();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  }

  async fetchTopMatches(userId?: string, limit: number = 3): Promise<Property[]> {
    try {
      let url = `${this.baseUrl}/api/properties/top-matches?limit=${limit}`;
      if (userId) {
        url += `&userId=${userId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        // If top-matches endpoint doesn't exist, fall back to regular properties
        if (response.status === 404) {
          console.log('Top-matches endpoint not found, falling back to regular properties');
          return this.fetchProperties();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        console.error('Response text:', await response.text());
        throw new Error('Invalid response format: expected JSON');
      }
      
      const data: PropertyResponse = await response.json();
      return data.properties || [];
    } catch (error) {
      console.error('Error fetching top matches:', error);
      
      // Fallback to regular properties if top-matches fails
      try {
        console.log('Falling back to regular properties due to top-matches error');
        return this.fetchProperties();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  }
}

export const propertyService = new PropertyService(); 