import { Database } from '../lib/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

// Format price with currency
export const formatPrice = (price: number | null): string => {
  if (!price) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format property specifications (bedrooms, bathrooms, square feet)
export const formatSpecs = (property: Property): string => {
  const specs = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} bed`);
  if (property.bathrooms) specs.push(`${property.bathrooms} bath`);
  if (property.square_feet) specs.push(`${property.square_feet.toLocaleString()} sqft`);
  return specs.join(' ');
};

// Format property type with BHK
export const formatPropertyType = (property: Property): string => {
  const specs = [];
  if (property.bedrooms) specs.push(`${property.bedrooms} BHK`);
  specs.push(property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Property');
  return specs.join(' ');
};

// Format location (city, state)
export const formatLocation = (property: Property): string => {
  const location = [];
  if (property.city) location.push(property.city);
  if (property.state) location.push(property.state);
  return location.join(', ');
};

// Format full address
export const formatFullAddress = (property: Property): string => {
  const address = [];
  if (property.address) address.push(property.address);
  if (property.city) address.push(property.city);
  if (property.state) address.push(property.state);
  if (property.zip_code) address.push(property.zip_code);
  return address.join(', ');
};

// Format size
export const formatSize = (property: Property): string => {
  if (property.square_feet) {
    return `${property.square_feet.toLocaleString()} sq ft`;
  }
  return 'Size not specified';
};

// Format lot size
export const formatLotSize = (property: Property): string => {
  if (property.lot_size) {
    return `${property.lot_size.toLocaleString()} sq ft`;
  }
  return 'Lot size not specified';
};

// Calculate distance (mock implementation - replace with real calculation)
export const calculateDistance = (property: Property): string => {
  const distances = ['0.8 km', '1.2 km', '2.5 km', '3.8 km', '5.1 km'];
  return distances[Math.floor(Math.random() * distances.length)];
};

// Get property status color
export const getStatusColor = (status: Property['status']): string => {
  switch (status) {
    case 'active':
      return '#10B981'; // Green
    case 'sold':
      return '#EF4444'; // Red
    case 'pending':
      return '#F59E0B'; // Yellow
    case 'inactive':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
};

// Get property status text
export const getStatusText = (status: Property['status']): string => {
  switch (status) {
    case 'active':
      return 'Available';
    case 'sold':
      return 'Sold';
    case 'pending':
      return 'Pending';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

// Get property type icon
export const getPropertyTypeIcon = (propertyType: Property['property_type']): string => {
  switch (propertyType) {
    case 'house':
      return 'home';
    case 'apartment':
      return 'business';
    case 'condo':
      return 'business';
    case 'townhouse':
      return 'home';
    case 'land':
      return 'map';
    case 'commercial':
      return 'storefront';
    default:
      return 'home';
  }
};

// Calculate EMI (monthly payment)
export const calculateEMI = (principal: number, rate: number, years: number): number => {
  const monthlyRate = rate / 12 / 100;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(emi);
};

// Calculate down payment (20% of price)
export const calculateDownPayment = (price: number): number => {
  return price * 0.2;
};

// Calculate total interest paid
export const calculateTotalInterest = (principal: number, rate: number, years: number): number => {
  const emi = calculateEMI(principal, rate, years);
  const totalPayments = emi * years * 12;
  return totalPayments - principal;
};

// Filter properties by multiple criteria
export const filterProperties = (
  properties: Property[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    propertyType?: Property['property_type'];
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    city?: string;
    state?: string;
    status?: Property['status'];
  }
): Property[] => {
  return properties.filter(property => {
    // Price filter
    if (filters.minPrice && property.price && property.price < filters.minPrice) return false;
    if (filters.maxPrice && property.price && property.price > filters.maxPrice) return false;
    
    // Property type filter
    if (filters.propertyType && property.property_type !== filters.propertyType) return false;
    
    // Bedrooms filter
    if (filters.minBedrooms && property.bedrooms && property.bedrooms < filters.minBedrooms) return false;
    if (filters.maxBedrooms && property.bedrooms && property.bedrooms > filters.maxBedrooms) return false;
    
    // Bathrooms filter
    if (filters.minBathrooms && property.bathrooms && property.bathrooms < filters.minBathrooms) return false;
    if (filters.maxBathrooms && property.bathrooms && property.bathrooms > filters.maxBathrooms) return false;
    
    // Location filter
    if (filters.city && property.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.state && property.state && property.state.toLowerCase() !== filters.state.toLowerCase()) return false;
    
    // Status filter
    if (filters.status && property.status !== filters.status) return false;
    
    return true;
  });
};

// Sort properties
export const sortProperties = (
  properties: Property[],
  sortBy: 'price' | 'price_desc' | 'date' | 'date_desc' | 'size' | 'size_desc'
): Property[] => {
  const sorted = [...properties];
  
  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'date':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'size':
      return sorted.sort((a, b) => (a.square_feet || 0) - (b.square_feet || 0));
    case 'size_desc':
      return sorted.sort((a, b) => (b.square_feet || 0) - (a.square_feet || 0));
    default:
      return sorted;
  }
};

// Get property statistics
export const getPropertyStats = (properties: Property[]) => {
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const soldProperties = properties.filter(p => p.status === 'sold').length;
  
  const prices = properties.map(p => p.price).filter(p => p !== null) as number[];
  const avgPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  return {
    totalProperties,
    activeProperties,
    soldProperties,
    avgPrice: Math.round(avgPrice),
    minPrice,
    maxPrice,
  };
};

// Validate property data
export const validateProperty = (property: Partial<Property>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!property.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!property.property_type) {
    errors.push('Property type is required');
  }
  
  if (property.price !== null && property.price !== undefined && property.price < 0) {
    errors.push('Price must be positive');
  }
  
  if (property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms < 0) {
    errors.push('Bedrooms must be positive');
  }
  
  if (property.bathrooms !== null && property.bathrooms !== undefined && property.bathrooms < 0) {
    errors.push('Bathrooms must be positive');
  }
  
  if (property.square_feet !== null && property.square_feet !== undefined && property.square_feet < 0) {
    errors.push('Square feet must be positive');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}; 