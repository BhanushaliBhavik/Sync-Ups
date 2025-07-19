# Nearby Map Feature

## Overview
The Nearby Map feature allows users to open Google Maps directly from the property cards and property detail screens to view the exact location of properties using their latitude and longitude coordinates.

## Implementation

### Components Updated
1. **PropertyCard Component** (`components/PropertyCard.tsx`)
2. **PropertyDetailScreen** (`app/PropertyDetailScreen.tsx`)

### Dependencies
- `expo-linking`: For opening external URLs (Google Maps)

### How It Works

#### 1. Property Card Integration
- Added a "Nearby Map" button below the "View Details" button
- Button uses a map icon and primary color styling
- Only shows if property has valid coordinates

#### 2. Property Detail Screen Integration
- Updated the existing "Nearby Map" tool card
- Now functional with Google Maps integration
- Located in the tools section

#### 3. Google Maps URL Format
```javascript
const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
```

### Features

#### ✅ **Coordinate Validation**
- Checks if property has valid latitude and longitude
- Shows alert if coordinates are missing
- Graceful error handling

#### ✅ **Cross-Platform Support**
- Works on iOS and Android
- Opens Google Maps app if installed
- Falls back to web browser if app not available

#### ✅ **Error Handling**
- Validates URL support before opening
- Shows user-friendly error messages
- Logs errors for debugging

#### ✅ **User Experience**
- Clear visual indicators (map icon)
- Consistent styling across components
- Immediate feedback on tap

### Usage

#### From Property Card
1. Browse properties in search or home screen
2. Tap "Nearby Map" button on any property card
3. Google Maps opens with property location

#### From Property Detail Screen
1. Open property details
2. Scroll to tools section
3. Tap "Nearby Map" tool card
4. Google Maps opens with property location

### Technical Details

#### URL Structure
```
https://www.google.com/maps/search/?api=1&query=LATITUDE,LONGITUDE
```

#### Example URLs
- San Francisco: `https://www.google.com/maps/search/?api=1&query=37.7749,-122.4194`
- New York: `https://www.google.com/maps/search/?api=1&query=40.7589,-73.9851`

#### Error Scenarios
1. **No Coordinates**: Shows "Location Not Available" alert
2. **Maps Not Available**: Shows "Cannot Open Maps" alert
3. **Network Error**: Shows "Failed to open Google Maps" alert

### Database Requirements

#### Property Table Fields
```sql
latitude decimal(10,8)
longitude decimal(11,8)
```

#### Sample Data
```sql
INSERT INTO properties (latitude, longitude) VALUES
(37.7749, -122.4194),  -- San Francisco
(40.7589, -73.9851),   -- New York
(34.0522, -118.2437);  -- Los Angeles
```

### Future Enhancements

#### Potential Improvements
1. **Custom Map Integration**: Embed maps directly in app
2. **Directions**: Add "Get Directions" functionality
3. **Nearby Amenities**: Show nearby schools, restaurants, etc.
4. **Property Clustering**: Show multiple properties on map
5. **Location Sharing**: Share property location via messaging

#### Additional Map Providers
- Apple Maps (iOS)
- OpenStreetMap
- Mapbox
- Here Maps

### Testing

#### Test Cases
1. ✅ Property with valid coordinates
2. ✅ Property without coordinates
3. ✅ Device without Google Maps app
4. ✅ Network connectivity issues
5. ✅ Different coordinate formats

#### Test Data
Use the sample properties from `DB.sql` with coordinates:
- Modern Downtown Apartment: 37.7749, -122.4194
- Luxury Penthouse: 37.7900, -122.4100
- Beach House: 25.7617, -80.1918

### Troubleshooting

#### Common Issues
1. **Maps not opening**: Check if Google Maps is installed
2. **Wrong location**: Verify coordinates in database
3. **Permission denied**: Check location permissions in app.json

#### Debug Steps
1. Check console logs for error messages
2. Verify property coordinates in database
3. Test URL manually in browser
4. Check device permissions

### Security Considerations

#### URL Validation
- Coordinates are validated before use
- No user input directly used in URLs
- Error handling prevents app crashes

#### Privacy
- Only opens external maps (no location tracking)
- No coordinates stored locally
- Respects user's map app preferences 