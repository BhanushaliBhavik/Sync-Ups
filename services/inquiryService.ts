import { supabase } from '@/lib/supabase';
import { authStore } from '../stores/authStore';

export interface Inquiry {
  id: string;
  property_id: string;
  user_id: string;
  message?: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    price: number;
    address?: string;
    city?: string;
  };
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface CreateInquiryRequest {
  property_id: string;
  message?: string;
}

export interface InquiryResponse {
  inquiry: Inquiry;
}

class InquiryService {
  private getCurrentUserId(): string | null {
    const currentUser = authStore.getCurrentUser();
    return currentUser?.id || null;
  }

  async createInquiry(propertyId: string, message?: string): Promise<Inquiry> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to create an inquiry');
      }

      // Check if user has already inquired about this property
      const { data: existingInquiry } = await supabase
        .from('inquiries')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (existingInquiry) {
        throw new Error('You have already inquired about this property');
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          property_id: propertyId,
          user_id: userId,
          message: message || null,
          status: 'pending'
        })
        .select(`
          id,
          property_id,
          user_id,
          message,
          status,
          created_at,
          updated_at,
          property:properties (
            id,
            title,
            price,
            address,
            city
          ),
          user:users (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        console.error('Error creating inquiry:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully created inquiry:', data);
      return data;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }
  }

  async getUserInquiries(): Promise<Inquiry[]> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        console.warn('No authenticated user found for inquiry fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          property_id,
          user_id,
          message,
          status,
          created_at,
          updated_at,
          property:properties (
            id,
            title,
            price,
            address,
            city
          ),
          user:users (
            id,
            name,
            email
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user inquiries:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully fetched user inquiries:', data?.length || 0, 'inquiries');
      return data || [];
    } catch (error) {
      console.error('Error fetching user inquiries:', error);
      throw error;
    }
  }

  async hasUserInquired(propertyId: string): Promise<boolean> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        return false;
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user hasn't inquired
          return false;
        }
        console.error('Error checking inquiry status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking inquiry status:', error);
      return false;
    }
  }

  async getInquiryByPropertyId(propertyId: string): Promise<Inquiry | null> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          id,
          property_id,
          user_id,
          message,
          status,
          created_at,
          updated_at,
          property:properties (
            id,
            title,
            price,
            address,
            city
          ),
          user:users (
            id,
            name,
            email
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
        console.error('Error getting inquiry by property ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting inquiry by property ID:', error);
      return null;
    }
  }

  async updateInquiryStatus(inquiryId: string, status: 'pending' | 'contacted' | 'closed'): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to update inquiry');
      }

      const { error } = await supabase
        .from('inquiries')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating inquiry status:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully updated inquiry status:', inquiryId, status);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  }

  async deleteInquiry(inquiryId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      
      if (!userId) {
        throw new Error('User must be authenticated to delete inquiry');
      }

      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', inquiryId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting inquiry:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully deleted inquiry:', inquiryId);
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      throw error;
    }
  }
}

export const inquiryService = new InquiryService(); 