import { useCallback, useEffect, useState } from 'react';
import {
    addToWishlist,
    getWishlist,
    getWishlistCount,
    isInWishlist,
    removeFromWishlist,
    WishlistItem
} from '../lib/wishlist';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load wishlist data
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const [wishlistResult, countResult] = await Promise.all([
        getWishlist(),
        getWishlistCount()
      ]);

      if (wishlistResult.error) {
        console.error('Error loading wishlist:', wishlistResult.error);
      } else {
        setWishlistItems(wishlistResult.data || []);
      }

      if (countResult.error) {
        console.error('Error loading wishlist count:', countResult.error);
      } else {
        setWishlistCount(countResult.count);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh wishlist
  const refreshWishlist = useCallback(async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  }, [loadWishlist]);

  // Add to wishlist
  const addToWishlistHandler = useCallback(async (propertyId: string) => {
    try {
      const { success, error } = await addToWishlist(propertyId);
      
      if (success) {
        // Refresh the wishlist to get the updated data
        await loadWishlist();
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: 'Failed to add to wishlist' };
    }
  }, [loadWishlist]);

  // Remove from wishlist
  const removeFromWishlistHandler = useCallback(async (propertyId: string) => {
    try {
      const { success, error } = await removeFromWishlist(propertyId);
      
      if (success) {
        // Update local state immediately for better UX
        setWishlistItems(prev => prev.filter(item => item.property_id !== propertyId));
        setWishlistCount(prev => Math.max(0, prev - 1));
        return { success: true };
      } else {
        return { success: false, error };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: 'Failed to remove from wishlist' };
    }
  }, []);

  // Check if property is in wishlist
  const checkWishlistStatus = useCallback(async (propertyId: string) => {
    try {
      const { isInWishlist: status, error } = await isInWishlist(propertyId);
      if (error) {
        console.error('Error checking wishlist status:', error);
        return false;
      }
      return status;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }, []);

  // Toggle wishlist status
  const toggleWishlist = useCallback(async (propertyId: string) => {
    const isInWishlistStatus = await checkWishlistStatus(propertyId);
    
    if (isInWishlistStatus) {
      return await removeFromWishlistHandler(propertyId);
    } else {
      return await addToWishlistHandler(propertyId);
    }
  }, [checkWishlistStatus, addToWishlistHandler, removeFromWishlistHandler]);

  // Load initial data
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return {
    wishlistItems,
    wishlistCount,
    loading,
    refreshing,
    loadWishlist,
    refreshWishlist,
    addToWishlist: addToWishlistHandler,
    removeFromWishlist: removeFromWishlistHandler,
    checkWishlistStatus,
    toggleWishlist,
  };
}; 