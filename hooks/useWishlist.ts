import { WishlistItem, wishlistService } from '@/services/wishlistService';
import { authStore } from '@/stores/authStore';
import { useCallback, useEffect, useState } from 'react';

interface UseWishlistOptions {
  autoFetch?: boolean;
}

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  addToWishlist: (propertyId: string) => Promise<void>;
  removeFromWishlist: (propertyId: string) => Promise<void>;
  updateWishlistItem: (wishlistItemId: string, notes?: string) => Promise<void>;
  clearError: () => void;
}

export function useWishlist(options: UseWishlistOptions = {}): UseWishlistReturn {
  const { autoFetch = true } = options;
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const currentUser = authStore.getCurrentUser();
    const authenticated = !!currentUser;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      console.log('User not authenticated, skipping wishlist fetch');
      setWishlist([]);
      return;
    }

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
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to add properties to your wishlist');
      return;
    }

    try {
      await wishlistService.addToWishlist(propertyId);
      // Refresh the wishlist after adding
      await fetchWishlist();
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (propertyId: string) => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to remove properties from your wishlist');
      return;
    }

    try {
      await wishlistService.removeFromWishlist(propertyId);
      // Remove from local state immediately for better UX
      setWishlist(prev => prev.filter(item => item.property_id !== propertyId));
      // Always refetch to ensure consistency
      await fetchWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
      // Refresh the wishlist to ensure consistency
      await fetchWishlist();
    }
  }, [fetchWishlist]);

  const updateWishlistItem = useCallback(async (wishlistItemId: string, notes?: string) => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to update your wishlist');
      return;
    }

    try {
      await wishlistService.updateWishlistItem(wishlistItemId, notes);
      // Refresh the wishlist to get updated data
      await fetchWishlist();
    } catch (err) {
      console.error('Error updating wishlist item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update wishlist item');
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
    isAuthenticated,
    refetch: fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    clearError,
  };
}

interface UseWishlistStatusOptions {
  propertyId: string;
  autoCheck?: boolean;
  onWishlistChange?: () => void; // Callback to notify parent components
}

interface UseWishlistStatusReturn {
  isInWishlist: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  addToWishlist: () => Promise<void>;
  removeFromWishlist: () => Promise<void>;
  clearError: () => void;
}

export function useWishlistStatus(options: UseWishlistStatusOptions): UseWishlistStatusReturn {
  const { propertyId, autoCheck = true, onWishlistChange } = options;
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    if (!propertyId) return;
    
    const currentUser = authStore.getCurrentUser();
    const authenticated = !!currentUser;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      console.log('User not authenticated, skipping wishlist status check');
      setIsInWishlist(false);
      return;
    }
    
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
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to add properties to your wishlist');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await wishlistService.addToWishlist(propertyId);
      setIsInWishlist(true);
      
      // Notify parent components that wishlist has changed
      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist');
    } finally {
      setLoading(false);
    }
  }, [propertyId, onWishlistChange]);

  const removeFromWishlist = useCallback(async () => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to remove properties from your wishlist');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await wishlistService.removeFromWishlist(propertyId);
      setIsInWishlist(false);
      
      // Notify parent components that wishlist has changed
      if (onWishlistChange) {
        onWishlistChange();
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  }, [propertyId, onWishlistChange]);

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
    isAuthenticated,
    addToWishlist,
    removeFromWishlist,
    clearError,
  };
} 