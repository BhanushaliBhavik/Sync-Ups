import { supabase } from './supabase';

export interface WishlistItem {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    square_feet: number | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    images?: string[];
  };
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  property_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  images?: string[];
}

// Add property to wishlist
export const addToWishlist = async (propertyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if property is already in wishlist
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    if (existingItem) {
      return { success: false, error: 'Property already in wishlist' };
    }

    // Add to wishlist
    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        property_id: propertyId,
      });

    if (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: 'Failed to add to wishlist' };
  }
};

// Remove property from wishlist
export const removeFromWishlist = async (propertyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error: 'Failed to remove from wishlist' };
  }
};

// Get user's wishlist
export const getWishlist = async (): Promise<{ data: WishlistItem[] | null; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        user_id,
        property_id,
        created_at,
        property:properties (
          id,
          title,
          description,
          price,
          property_type,
          bedrooms,
          bathrooms,
          square_feet,
          address,
          city,
          state,
          zip_code
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return { data: null, error: error.message };
    }

    // Transform the data to match our interface
    const transformedData: WishlistItem[] = (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      property_id: item.property_id,
      created_at: item.created_at,
      property: item.property ? {
        id: item.property.id,
        title: item.property.title,
        description: item.property.description,
        price: item.property.price,
        property_type: item.property.property_type,
        bedrooms: item.property.bedrooms,
        bathrooms: item.property.bathrooms,
        square_feet: item.property.square_feet,
        address: item.property.address,
        city: item.property.city,
        state: item.property.state,
        zip_code: item.property.zip_code,
      } : undefined,
    }));

    return { data: transformedData };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { data: null, error: 'Failed to fetch wishlist' };
  }
};

// Check if property is in wishlist
export const isInWishlist = async (propertyId: string): Promise<{ isInWishlist: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { isInWishlist: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking wishlist status:', error);
      return { isInWishlist: false, error: error.message };
    }

    return { isInWishlist: !!data };
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return { isInWishlist: false, error: 'Failed to check wishlist status' };
  }
};

// Get wishlist count
export const getWishlistCount = async (): Promise<{ count: number; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { count: 0, error: 'User not authenticated' };
    }

    const { count, error } = await supabase
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist count:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return { count: 0, error: 'Failed to fetch wishlist count' };
  }
}; 