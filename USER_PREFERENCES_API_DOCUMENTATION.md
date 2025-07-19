# User Preferences API Documentation

## Overview

This API provides endpoints for managing user property preferences. Users can save, retrieve, and check the existence of their property search preferences. All endpoints require user authentication via the `X-User-ID` header.

## Base URL

```
/api/user
```

---

## Endpoints

### 1. Save User Preferences

**POST** `/api/user/preferences`

Save or update user property preferences.

**Headers:**
- `X-User-ID` (string, required): The authenticated user ID
- `Content-Type` (string): application/json

**Request Body:**
```json
{
  "preferred_location": "San Francisco, CA",
  "location_type": ["Downtown", "Near Transit"],
  "home_types": ["Apartment", "Condo"],
  "min_price": 300000,
  "max_price": 800000,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["Parking", "Gym", "Pool"],
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response:**
```json
{
  "preferences": {
    "id": "pref_1642545600000_abc123def",
    "user_id": "016da864-6e60-4a29-8a89-4365dd9b9756",
    "preferred_location": "San Francisco, CA",
    "location_type": ["Downtown", "Near Transit"],
    "home_types": ["Apartment", "Condo"],
    "min_price": 300000,
    "max_price": 800000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym", "Pool"],
    "latitude": 37.7749,
    "longitude": -122.4194,
    "created_at": "2024-01-18T12:00:00.000Z",
    "updated_at": "2024-01-18T12:05:30.000Z"
  }
}
```

---

### 2. Get User Preferences

**GET** `/api/user/preferences`

Retrieve saved preferences for the authenticated user.

**Headers:**
- `X-User-ID` (string, required): The authenticated user ID

**Query Parameters:**
- `userId` (string, optional): Alternative way to pass user ID (header preferred)

**Response:**
```json
{
  "preferences": {
    "id": "pref_1642545600000_abc123def",
    "user_id": "016da864-6e60-4a29-8a89-4365dd9b9756",
    "preferred_location": "San Francisco, CA",
    "location_type": ["Downtown", "Near Transit"],
    "home_types": ["Apartment", "Condo"],
    "min_price": 300000,
    "max_price": 800000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym", "Pool"],
    "latitude": 37.7749,
    "longitude": -122.4194,
    "created_at": "2024-01-18T12:00:00.000Z",
    "updated_at": "2024-01-18T12:05:30.000Z"
  }
}
```

**404 Response (No preferences found):**
```json
{
  "error": "No preferences found"
}
```

---

### 3. Check Preferences Existence

**GET** `/api/user/preferences/exists`

Check if the authenticated user has saved preferences.

**Headers:**
- `X-User-ID` (string, required): The authenticated user ID

**Query Parameters:**
- `userId` (string, optional): Alternative way to pass user ID (header preferred)

**Response:**
```json
{
  "exists": true
}
```

---

## Data Schema

### PropertyPreferences Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Auto-generated unique identifier |
| `user_id` | string | Yes | User ID (auto-set from header) |
| `preferred_location` | string | Yes | Primary location preference |
| `location_type` | string[] | No | Location type preferences |
| `home_types` | string[] | No | Property type preferences |
| `min_price` | number | No | Minimum price (default: 0) |
| `max_price` | number | No | Maximum price (default: 0) |
| `bedrooms` | number | No | Minimum bedrooms (default: 1) |
| `bathrooms` | number | No | Minimum bathrooms (default: 1) |
| `amenities` | string[] | No | Desired amenities |
| `latitude` | number | No | Location latitude |
| `longitude` | number | No | Location longitude |
| `created_at` | string | No | ISO timestamp (auto-generated) |
| `updated_at` | string | No | ISO timestamp (auto-updated) |

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing user ID or validation errors)
- `404`: Not Found (no preferences exist)
- `405`: Method Not Allowed
- `500`: Internal Server Error

---

## Authentication

All endpoints require user authentication via the `X-User-ID` header:

```javascript
headers: {
  'X-User-ID': 'user-uuid-here',
  'Content-Type': 'application/json'
}
```

---

## Example Usage

### JavaScript Example

```javascript
const userId = '016da864-6e60-4a29-8a89-4365dd9b9756';
const baseUrl = 'https://home-hub-ten.vercel.app';

// Save preferences
const saveResponse = await fetch(`${baseUrl}/api/user/preferences`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-ID': userId
  },
  body: JSON.stringify({
    preferred_location: 'San Francisco, CA',
    location_type: ['Downtown'],
    home_types: ['Apartment'],
    min_price: 300000,
    max_price: 800000,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['Parking', 'Gym']
  })
});
const saveData = await saveResponse.json();

// Get preferences
const getResponse = await fetch(`${baseUrl}/api/user/preferences`, {
  headers: {
    'X-User-ID': userId
  }
});
const getData = await getResponse.json();

// Check existence
const existsResponse = await fetch(`${baseUrl}/api/user/preferences/exists`, {
  headers: {
    'X-User-ID': userId
  }
});
const existsData = await existsResponse.json();
```

### cURL Example

```bash
# Save preferences
curl -X POST "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756" \
  -d '{
    "preferred_location": "San Francisco, CA",
    "location_type": ["Downtown"],
    "home_types": ["Apartment"],
    "min_price": 300000,
    "max_price": 800000,
    "bedrooms": 2,
    "bathrooms": 2,
    "amenities": ["Parking", "Gym"]
  }'

# Get preferences
curl -X GET "https://home-hub-ten.vercel.app/api/user/preferences" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756"

# Check existence
curl -X GET "https://home-hub-ten.vercel.app/api/user/preferences/exists" \
  -H "X-User-ID: 016da864-6e60-4a29-8a89-4365dd9b9756"
```

---

## Database Integration

The current implementation uses an in-memory store for quick testing. For production, replace the `preferencesDB.js` module with your actual database implementation (PostgreSQL, MongoDB, etc.).

### Migration Path

1. **Testing Phase**: Use current in-memory implementation
2. **Development**: Connect to development database
3. **Production**: Use production database with proper error handling and connection pooling

---

## Integration with Frontend

This API is designed to work seamlessly with the React Native frontend `preferencesService.ts`. The service automatically handles:

- User authentication via auth store
- Error handling and fallback strategies  
- Request/response logging
- Development mode mock data fallbacks 