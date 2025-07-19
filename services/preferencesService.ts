import { supabase } from '../lib/supabase';
import { authStore } from '../stores/authStore';

export interface PropertyPreferences {
  id?: string;
  user_id?: string;
  preferred_location: string;
  location_type: string[];
  home_types: string[];
  min_price: number;
  max_price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export const preferencesService = {
  async getPreferences(): Promise<PropertyPreferences | null> {
    try {
      // Get current user from auth store
      const currentUser = authStore.getCurrentUser();
      
      if (!currentUser?.id) {
        console.log('🔒 No authenticated user found in auth store');
        return null;
      }

      console.log('📊 DEBUG - Current user from auth store:', {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name
      });
      console.log('📊 Fetching preferences from Supabase for user:', currentUser.id);

      // Double-check user ID right before database call
      const finalUser = authStore.getCurrentUser();
      if (!finalUser?.id || finalUser.id !== currentUser.id) {
        console.log('⚠️ User ID changed during request, aborting');
        return null;
      }

      // Get preferences directly from Supabase
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', finalUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found - this is normal for new users
          console.log('📝 ✅ CORRECT: No preferences found for NEW USER, returning null');
          return null;
        }
        
        console.error('❌ Supabase error fetching preferences:', error);
        throw new Error(`Failed to fetch preferences: ${error.message}`);
      }

      console.log('⚠️ WARNING: Found existing preferences for user:', currentUser.id);
      console.log('📥 Supabase Data:', JSON.stringify(preferences, null, 2));
      console.log('🔍 This user should be NEW - why do they have preferences already?');
      
      return preferences;

    } catch (error: any) {
      console.error('❌ Error fetching preferences from Supabase:', error.message);
      console.error('❌ Full error object:', error);
      
      // Return null on error - user can set new preferences
      return null;
    }
  },

  async savePreferences(preferences: Omit<PropertyPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<PropertyPreferences> {
    try {
      // Get current user from auth store
      const currentUser = authStore.getCurrentUser();
      
      if (!currentUser?.id) {
        console.error('🔒 No authenticated user found in auth store');
        throw new Error('Please sign in before saving preferences');
      }

      console.log('💾 Saving preferences to Supabase for authenticated user:', currentUser.id);
      console.log('📤 Supabase Request - Preferences data to save:', JSON.stringify(preferences, null, 2));

      // Prepare data for Supabase - only include essential columns  
      const preferencesData = {
        user_id: currentUser.id, // Will be updated to finalUser.id after validation
        preferred_location: preferences.preferred_location,
        location_type: preferences.location_type || [],
        home_types: preferences.home_types || [],
        min_price: preferences.min_price || 0,
        max_price: preferences.max_price || 0,
        bedrooms: preferences.bedrooms || 1,
        bathrooms: preferences.bathrooms || 1,
        amenities: preferences.amenities || [],
        // Don't include latitude/longitude - they're optional
      };

      // Validate required fields
      if (!preferencesData.preferred_location) {
        throw new Error('Preferred location is required');
      }

      console.log('💾 Saving to Supabase with data:', JSON.stringify(preferencesData, null, 2));

      // Double-check user ID right before database call
      const finalUser = authStore.getCurrentUser();
      if (!finalUser?.id || finalUser.id !== currentUser.id) {
        console.log('⚠️ User ID changed during save request, aborting');
        throw new Error('User authentication changed during save');
      }

      // Update the preferences data with the confirmed user ID
      preferencesData.user_id = finalUser.id;

      // First, check if preferences already exist for this user
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', finalUser.id)
        .single();

      let savedPreferences;
      let error;

      if (existingPreferences) {
        // Update existing preferences
        console.log('🔄 Updating existing preferences');
        const result = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', finalUser.id)
          .select()
          .single();
        
        savedPreferences = result.data;
        error = result.error;
      } else {
        // Insert new preferences
        console.log('➕ Creating new preferences');
        const result = await supabase
          .from('user_preferences')
          .insert(preferencesData)
          .select()
          .single();
        
        savedPreferences = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Supabase error saving preferences:', error);
        throw new Error(`Failed to save preferences: ${error.message}`);
      }

      console.log('✅ Preferences saved to Supabase successfully:');
      console.log('📥 Supabase Response:', JSON.stringify(savedPreferences, null, 2));
      
      return savedPreferences;

    } catch (error: any) {
      console.error('❌ Error saving preferences to Supabase:', error.message);
      console.error('❌ Full error object:', error);
      
      // Re-throw the error to be handled by the UI
      throw error;
    }
  },

  async checkPreferencesExist(): Promise<boolean> {
    try {
      // Get current user from auth store
      const currentUser = authStore.getCurrentUser();
      
      if (!currentUser?.id) {
        console.log('🔒 No authenticated user found for preferences check');
        return false;
      }

      console.log('🔍 Checking if preferences exist in Supabase for user:', currentUser.id);

      // Check if preferences exist in Supabase
      const { data, error, count } = await supabase
        .from('user_preferences')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('❌ Supabase error checking preferences existence:', error);
        return false;
      }

      const exists = (count || 0) > 0;
      console.log('✅ Supabase preferences exist check result:', exists);
      return exists;

    } catch (error: any) {
      console.error('❌ Error checking preferences existence:', error.message);
      return false;
    }
  }
}; 