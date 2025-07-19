import { Inquiry, inquiryService } from '@/services/inquiryService';
import { authStore } from '@/stores/authStore';
import { useCallback, useEffect, useState } from 'react';

interface UseInquiryOptions {
  propertyId?: string;
  autoCheck?: boolean;
}

interface UseInquiryReturn {
  inquiry: Inquiry | null;
  hasInquired: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  createInquiry: (message?: string) => Promise<void>;
  clearError: () => void;
}

interface UseInquiriesReturn {
  inquiries: Inquiry[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useInquiry(options: UseInquiryOptions = {}): UseInquiryReturn {
  const { propertyId, autoCheck = true } = options;
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [hasInquired, setHasInquired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkInquiryStatus = useCallback(async () => {
    if (!propertyId) return;
    
    const currentUser = authStore.getCurrentUser();
    const authenticated = !!currentUser;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      console.log('User not authenticated, skipping inquiry check');
      setHasInquired(false);
      setInquiry(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const inquiryData = await inquiryService.getInquiryByPropertyId(propertyId);
      setInquiry(inquiryData);
      setHasInquired(!!inquiryData);
    } catch (err) {
      console.error('Error checking inquiry status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check inquiry status');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const createInquiry = useCallback(async (message?: string) => {
    if (!propertyId) {
      setError('Property ID is required to create an inquiry');
      return;
    }

    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setError('You must be signed in to create an inquiry');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newInquiry = await inquiryService.createInquiry(propertyId, message);
      setInquiry(newInquiry);
      setHasInquired(true);
    } catch (err) {
      console.error('Error creating inquiry:', err);
      setError(err instanceof Error ? err.message : 'Failed to create inquiry');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoCheck && propertyId) {
      checkInquiryStatus();
    }
  }, [checkInquiryStatus, autoCheck, propertyId]);

  return {
    inquiry,
    hasInquired,
    loading,
    error,
    isAuthenticated,
    createInquiry,
    clearError,
  };
}

export function useInquiries(): UseInquiriesReturn {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchInquiries = useCallback(async () => {
    const currentUser = authStore.getCurrentUser();
    const authenticated = !!currentUser;
    setIsAuthenticated(authenticated);

    if (!authenticated) {
      console.log('User not authenticated, skipping inquiries fetch');
      setInquiries([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await inquiryService.getUserInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Error in useInquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    inquiries,
    loading,
    error,
    isAuthenticated,
    refetch: fetchInquiries,
    clearError,
  };
} 