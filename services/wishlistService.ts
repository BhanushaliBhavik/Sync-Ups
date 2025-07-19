import { supabase } from '@/lib/supabase';
import { authStore } from '../stores/authStore';
import { Property } from './propertyService';

export interface WishlistItem {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
  property: Property & {
    square_feet?: number;
  };
}

export interface WishlistResponse {
  wishlist: WishlistItem[];
}

export interface AddToWishlistRequest {
  user_id: string;
  property_id: string;
}

export interface RemoveFromWishlistRequest {
  user_id: string;
  property_id: string;
}

export interface UpdateWishlistRequest {
  id: string;
  notes?: string;
}

class WishlistService {
  private getCurrentUserId(): string | null {
    const currentUser = authStore.getCurrentUser();
    return currentUser?.id || null;
  }

  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        console.warn('No authenticated user found for wishlist fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          user_id,
          created_at,
          property:properties (
            id,
            title,
            description,
            price,
            property_type,
            status,
            bedrooms,
            bathrooms,
            square_feet,
            lot_size,
            year_built,
            address,
            city,
            state,
            zip_code,
            latitude,
            longitude,
            agent_id,
            seller_id,
            created_at,
            updated_at,
            property_images (
              id,
              property_id,
              image_url,
              caption,
              is_primary,
              order_index,
              created_at
            ),
            agent:users!properties_agent_id_fkey (
              id,
              name,
              email,
              phone,
              profile_image_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist from Supabase:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully fetched wishlist from Supabase:', data?.length || 0, 'items');
      return data || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(propertyId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to add to wishlist');
      }

      // Check if already in wishlist
      const { data: existingItem } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (existingItem) {
        console.log('Property already in wishlist:', propertyId);
        return; // Already exists, no need to add again
      }

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          property_id: propertyId
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully added property to wishlist:', propertyId);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(propertyId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to remove from wishlist');
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully removed property from wishlist:', propertyId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  async updateWishlistItem(wishlistItemId: string, notes?: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to update wishlist');
      }

      // Note: The favorites table doesn't have a notes column in the current schema
      // If you want to add notes functionality, you'll need to add a notes column to the favorites table
      console.warn('Notes functionality not implemented in current schema');
      
      // For now, we'll just log the request
      console.log('Update wishlist item request:', { wishlistItemId, notes });
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      throw error;
    }
  }

  async isInWishlist(propertyId: string): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        return false;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - not in wishlist
          return false;
        }
        console.error('Error checking wishlist status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }

  async getWishlistItemByPropertyId(propertyId: string): Promise<WishlistItem | null> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          user_id,
          created_at,
          property:properties (
            id,
            title,
            description,
            price,
            property_type,
            status,
            bedrooms,
            bathrooms,
            square_feet,
            lot_size,
            year_built,
            address,
            city,
            state,
            zip_code,
            latitude,
            longitude,
            agent_id,
            seller_id,
            created_at,
            updated_at,
            property_images (
              id,
              property_id,
              image_url,
              caption,
              is_primary,
              order_index,
              created_at
            ),
            agent:users!properties_agent_id_fkey (
              id,
              name,
              email,
              phone,
              profile_image_url
            )
          )
        `)
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting wishlist item by property ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting wishlist item by property ID:', error);
      return null;
    }
  }

  // Helper method to get wishlist count
  async getWishlistCount(): Promise<number> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        return 0;
      }

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting wishlist count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
}

export const wishlistService = new WishlistService(); 