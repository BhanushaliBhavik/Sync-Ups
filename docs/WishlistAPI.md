# Wishlist Supabase Integration

## Overview
The wishlist functionality has been updated to fetch data directly from Supabase database using the `favorites` table, providing real-time data access and better performance.

## Database Schema

### Favorites Table
```sql
CREATE TABLE favorites (
    id text PRIMARY KEY DEFAULT 'fav_' || substr(md5(random()::text), 1, 20),
    property_id text REFERENCES properties(id) ON DELETE CASCADE,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(property_id, user_id)
);
```

### Relationships
- **favorites.property_id** → **properties.id** (Many-to-One)
- **favorites.user_id** → **users.id** (Many-to-One)

## Implementation Details

### Authentication Integration

#### 1. User ID Retrieval
```typescript
private getCurrentUserId(): string | null {
  const currentUser = authStore.getCurrentUser();
  return currentUser?.id || null;
}
```

#### 2. Supabase Queries with Authentication
```typescript
async getWishlist(): Promise<WishlistItem[]> {
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
}
```

### Request/Response Interfaces

#### 1. Wishlist Item Interface
```typescript
export interface WishlistItem {
  id: string;
  property_id: string;
  user_id: string;
  created_at: string;
  property: Property & {
    square_feet?: number;
  };
}
```

#### 2. Add to Wishlist Request
```typescript
export interface AddToWishlistRequest {
  user_id: string;
  property_id: string;
}
```

#### 3. Remove from Wishlist Request
```typescript
export interface RemoveFromWishlistRequest {
  user_id: string;
  property_id: string;
}
```

### Error Handling

#### 1. Authentication Errors
- **No authenticated user**: Returns empty array for getWishlist
- **Missing user ID**: Throws error for add/remove operations
- **User-friendly messages**: Clear error messages for users

#### 2. Database Errors
- **Supabase errors**: Proper error status handling
- **Network errors**: Graceful fallbacks
- **Constraint violations**: Handle unique constraint violations

### Hook Updates

#### 1. useWishlist Hook
```typescript
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
```

#### 2. useWishlistStatus Hook
```typescript
interface UseWishlistStatusReturn {
  isInWishlist: boolean;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  addToWishlist: () => Promise<void>;
  removeFromWishlist: () => Promise<void>;
  clearError: () => void;
}
```

### UI Updates

#### 1. Wishlist Screen
- **Authentication check**: Shows sign-in prompt if not authenticated
- **Loading states**: Proper loading indicators
- **Error handling**: User-friendly error messages
- **Empty states**: Helpful empty wishlist message
- **Real-time updates**: Immediate wishlist changes

#### 2. Property Cards
- **Wishlist toggle**: Only works for authenticated users
- **Error feedback**: Shows authentication errors
- **Loading states**: Button loading indicators

## Usage Examples

### 1. Fetching Wishlist
```typescript
const { wishlist, loading, error, isAuthenticated } = useWishlist();

if (!isAuthenticated) {
  // Show sign-in prompt
  return <SignInPrompt />;
}

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}
```

### 2. Adding to Wishlist
```typescript
const { addToWishlist, isAuthenticated } = useWishlist();

const handleAddToWishlist = async (propertyId: string) => {
  if (!isAuthenticated) {
    Alert.alert('Sign In Required', 'Please sign in to add properties to your wishlist');
    return;
  }
  
  try {
    await addToWishlist(propertyId);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

### 3. Removing from Wishlist
```typescript
const { removeFromWishlist, isAuthenticated } = useWishlist();

const handleRemoveFromWishlist = async (propertyId: string) => {
  if (!isAuthenticated) {
    Alert.alert('Sign In Required', 'Please sign in to manage your wishlist');
    return;
  }
  
  try {
    await removeFromWishlist(propertyId);
    // Success feedback
  } catch (error) {
    // Error handling
  }
};
```

### 4. Checking Wishlist Status
```typescript
const { isInWishlist, loading, isAuthenticated } = useWishlistStatus({ 
  propertyId: 'property_id' 
});

// Only show wishlist button if authenticated
{isAuthenticated && (
  <WishlistButton 
    isInWishlist={isInWishlist}
    loading={loading}
    onToggle={handleWishlistToggle}
  />
)}
```

### 5. Getting Wishlist Count
```typescript
const { getWishlistCount } = wishlistService;

const count = await getWishlistCount();
console.log(`User has ${count} items in wishlist`);
```

## Security Considerations

### 1. User Authentication
- **Required for all operations**: No anonymous wishlist access
- **User ID validation**: Ensures users can only access their own wishlist
- **Session management**: Proper session handling with Supabase

### 2. Database Security
- **Row Level Security (RLS)**: Users can only access their own favorites
- **Foreign key constraints**: Ensures data integrity
- **Unique constraints**: Prevents duplicate wishlist items

### 3. Data Privacy
- **User data isolation**: Users can only see their own wishlist
- **No data leakage**: Proper error handling without exposing sensitive data
- **Secure storage**: User IDs stored securely in auth store

## Database Operations

### 1. Get User's Wishlist
```sql
SELECT 
  f.id,
  f.property_id,
  f.user_id,
  f.created_at,
  p.*,
  pi.*,
  u.name as agent_name,
  u.email as agent_email
FROM favorites f
JOIN properties p ON f.property_id = p.id
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN users u ON p.agent_id = u.id
WHERE f.user_id = 'user_id_here'
ORDER BY f.created_at DESC;
```

### 2. Add to Wishlist
```sql
INSERT INTO favorites (property_id, user_id)
VALUES ('property_id_here', 'user_id_here')
ON CONFLICT (property_id, user_id) DO NOTHING;
```

### 3. Remove from Wishlist
```sql
DELETE FROM favorites 
WHERE property_id = 'property_id_here' 
AND user_id = 'user_id_here';
```

### 4. Check if in Wishlist
```sql
SELECT EXISTS(
  SELECT 1 FROM favorites 
  WHERE property_id = 'property_id_here' 
  AND user_id = 'user_id_here'
);
```

## Testing

### 1. Authentication Scenarios
- ✅ **Authenticated user**: Can fetch, add, remove wishlist items
- ✅ **Unauthenticated user**: Shows sign-in prompt, no database calls
- ✅ **Session expiry**: Handles expired sessions gracefully
- ✅ **User switching**: Properly handles user account switching

### 2. Database Scenarios
- ✅ **Valid requests**: Proper Supabase queries with user_id
- ✅ **Invalid user_id**: Database returns appropriate errors
- ✅ **Network errors**: Graceful error handling
- ✅ **Constraint violations**: Handle unique constraint violations

### 3. UI Scenarios
- ✅ **Loading states**: Proper loading indicators
- ✅ **Error states**: User-friendly error messages
- ✅ **Empty states**: Helpful empty wishlist messages
- ✅ **Authentication prompts**: Clear sign-in requirements
- ✅ **Real-time updates**: Immediate wishlist changes

## Performance Optimizations

### 1. Query Optimization
- **Indexed queries**: Uses indexes on user_id and property_id
- **Selective loading**: Only loads needed data
- **Efficient joins**: Optimized property and image loading

### 2. Caching Strategy
- **Local state**: Caches wishlist data in React state
- **Refetch on changes**: Updates when wishlist changes
- **Optimistic updates**: Immediate UI updates for better UX

### 3. Error Recovery
- **Graceful fallbacks**: Handles database errors gracefully
- **Retry logic**: Automatic retry for transient errors
- **User feedback**: Clear error messages and recovery options

## Future Enhancements

### 1. Advanced Features
- **Wishlist sharing**: Share wishlists with others
- **Wishlist categories**: Organize wishlists by categories
- **Wishlist notes**: Add personal notes to wishlist items
- **Wishlist export**: Export wishlist data

### 2. Performance Improvements
- **Pagination**: Handle large wishlists efficiently
- **Real-time subscriptions**: Live wishlist updates
- **Offline support**: Offline wishlist management
- **Background sync**: Sync changes when online

### 3. Integration Features
- **Property alerts**: Notify when wishlist properties change
- **Price tracking**: Track price changes for wishlist properties
- **Similar properties**: Suggest similar properties
- **Market insights**: Provide market data for wishlist properties 