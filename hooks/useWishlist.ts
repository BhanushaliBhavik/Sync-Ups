import { WishlistItem, wishlistService } from '@/services/wishlistService';
import { useCallback, useEffect, useState } from 'react';

interface UseWishlistOptions {
  autoFetch?: boolean;
}

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addToWishlist: (propertyId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  clearError: () => void;
}

export function useWishlist(options: UseWishlistOptions = {}): UseWishlistReturn {
  const { autoFetch = true } = options;
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error('Error in useWishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (propertyId: string) => {
    try {
      await wishlistService.addToWishlist(propertyId);
      // Refresh the wishlist after adding
      await fetchWishlist();
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (wishlistItemId: string) => {
    try {
      await wishlistService.removeFromWishlist(wishlistItemId);
      // Remove from local state immediately for better UX
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      // Refresh the wishlist to ensure consistency
      await fetchWishlist();
    }
  }, [fetchWishlist]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchWishlist();
    }
  }, [fetchWishlist, autoFetch]);

  return {
    wishlist,
    loading,
    error,
    refetch: fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearError,
  };
}

interface UseWishlistStatusOptions {
  propertyId: string;
  autoCheck?: boolean;
}

interface UseWishlistStatusReturn {
  isInWishlist: boolean;
  loading: boolean;
  error: string | null;
  addToWishlist: () => Promise<void>;
  removeFromWishlist: () => Promise<void>;
  clearError: () => void;
}

export function useWishlistStatus(options: UseWishlistStatusOptions): UseWishlistStatusReturn {
  const { propertyId, autoCheck = true } = options;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWishlistStatus = useCallback(async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const status = await wishlistService.isInWishlist(propertyId);
      setIsInWishlist(status);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check wishlist status');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const addToWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await wishlistService.addToWishlist(propertyId);
      setIsInWishlist(true);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const removeFromWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the wishlist to find the item ID
      const wishlist = await wishlistService.getWishlist();
      const wishlistItem = wishlist.find(item => item.property_id === propertyId);
      
      if (wishlistItem) {
        await wishlistService.removeFromWishlist(wishlistItem.id);
        setIsInWishlist(false);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoCheck && propertyId) {
      checkWishlistStatus();
    }
  }, [checkWishlistStatus, autoCheck, propertyId]);

  return {
    isInWishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearError,
  };
} 