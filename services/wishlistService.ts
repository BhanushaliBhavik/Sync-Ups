import { Property } from './propertyService';

export interface WishlistItem {
  id: string;
  property_id: string;
  created_at: string;
  property: Property & {
    square_feet?: number;
  };
}

export interface WishlistResponse {
  wishlist: WishlistItem[];
}

class WishlistService {
  private baseUrl = 'https://home-hub-ten.vercel.app';

  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/buyers/wishlist`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WishlistResponse = await response.json();
      return data.wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(propertyId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/buyers/wishlist`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ property_id: propertyId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(wishlistItemId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/buyers/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  async isInWishlist(propertyId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some(item => item.property_id === propertyId);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }
}

export const wishlistService = new WishlistService(); 