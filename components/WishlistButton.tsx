import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { addToWishlist, isInWishlist, removeFromWishlist } from '../lib/wishlist';

interface WishlistButtonProps {
  propertyId: string;
  size?: number;
  color?: string;
  selectedColor?: string;
  onToggle?: (isInWishlist: boolean) => void;
  style?: any;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  propertyId,
  size = 24,
  color = '#6B7280',
  selectedColor = '#EF4444',
  onToggle,
  style,
}) => {
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [propertyId]);

  const checkWishlistStatus = async () => {
    try {
      const { isInWishlist: status, error } = await isInWishlist(propertyId);
      if (error) {
        console.error('Error checking wishlist status:', error);
        return;
      }
      setIsInWishlistState(status);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isInWishlistState) {
        // Remove from wishlist
        const { success, error } = await removeFromWishlist(propertyId);
        if (success) {
          setIsInWishlistState(false);
          onToggle?.(false);
        } else {
          Alert.alert('Error', error || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const { success, error } = await addToWishlist(propertyId);
        if (success) {
          setIsInWishlistState(true);
          onToggle?.(true);
        } else {
          Alert.alert('Error', error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleToggle}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isInWishlistState ? 'heart' : 'heart-outline'}
        size={size}
        color={isInWishlistState ? selectedColor : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 