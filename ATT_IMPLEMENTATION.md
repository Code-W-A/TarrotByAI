# App Tracking Transparency (ATT) Implementation

## Overview
This implementation handles App Tracking Transparency for iOS to comply with Apple's requirements for tracking users across apps and websites for advertising purposes.

## Files Modified/Created

### Configuration Files
- `app.json` - iOS specific configuration with ATT plugin and permissions
- `appandroid.json` - Android specific (unchanged, no ATT required)

### Core Implementation
- `src/hooks/useAppTrackingTransparency.ts` - Custom hook for ATT management
- `src/utils/trackingUtils.ts` - Utilities for tracking services initialization
- `src/utils/adsUtils.ts` - Utilities for ads management (prepared for future implementation)
- `firebase.js` - Updated with conditional analytics initialization
- `App.tsx` - Integrated ATT permission request

## How It Works

### 1. Permission Request Flow
1. App loads and fonts/language are initialized
2. After 2 seconds delay, ATT permission is requested (iOS only)
3. User sees the ATT dialog with message: "This identifier will be used to deliver personalized ads to you."
4. Based on user response, tracking services are initialized accordingly

### 2. Service Initialization
- **Granted Permission**: Personalized ads and full analytics
- **Denied/Restricted**: Non-personalized ads and limited analytics
- **Android**: No ATT required, all services available

### 3. Firebase Analytics
- Conditionally initialized based on ATT permission
- Uses `initializeAnalytics()` function with permission status

## Usage Examples

### Check ATT Status
```typescript
import { useAppTrackingTransparency } from './src/hooks/useAppTrackingTransparency';

const { status, hasPermission, requestPermission } = useAppTrackingTransparency();
```

### Initialize Tracking Services
```typescript
import { initializeTrackingServices } from './src/utils/trackingUtils';

const services = await initializeTrackingServices(hasTrackingPermission);
console.log('Analytics:', services.Analytics);
console.log('Ads Config:', services.adsConfig);
```

## Future Ad Implementation

When ready to implement ads, update the TODO sections in:
- `src/utils/adsUtils.ts` - Uncomment and implement Google Mobile Ads
- `src/utils/trackingUtils.ts` - Add actual analytics event logging

### Example Ad Implementation
```typescript
// In adsUtils.ts
import mobileAds from 'react-native-google-mobile-ads';

// Replace TODO sections with:
await mobileAds().initialize();
await mobileAds().setRequestConfiguration({
  requestNonPersonalizedAdsOnly: !hasTrackingPermission,
});
```

## App Store Connect Settings

After implementation:
1. Go to App Store Connect > Your App > App Privacy
2. Set "Does this app collect data in order to track the user?" to "Yes"
3. Specify what data is tracked and for what purposes
4. Build and submit new version to App Store

## Testing

### iOS Simulator
- ATT dialog will not appear in simulator
- Test on physical device with iOS 14.5+

### Testing Different Responses
- Reset ATT permission: Settings > Privacy & Security > Apple Advertising > Reset Advertising Identifier

### Console Logs
- Check for "ATT Permission status:" logs
- Verify "Tracking services initialized" messages

## Compliance Notes

1. **Permission Timing**: Permission is requested after app is fully loaded to avoid interrupting onboarding
2. **Graceful Degradation**: App works fully even if tracking is denied
3. **Respect User Choice**: No additional prompts or persuasion after denial
4. **Clear Purpose**: Permission message clearly states ads personalization purpose

## Status Codes

- `granted` - User allowed tracking
- `denied` - User denied tracking  
- `restricted` - Tracking restricted by device settings
- `not-determined` - Permission not yet requested
- `not-applicable` - Android or older iOS versions 