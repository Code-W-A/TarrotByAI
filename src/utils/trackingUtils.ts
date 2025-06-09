import { Platform } from 'react-native';
import { initializeAnalytics } from '../../firebase';
import { initializeAds, AdsConfig } from './adsUtils';

export interface TrackingServices {
Analytics: any;
adsConfig: AdsConfig | null;
isPersonalized: boolean;
}

export const initializeTrackingServices = async (hasTrackingPermission: boolean): Promise<TrackingServices> => {
console.log('Initializing tracking services with permission:', hasTrackingPermission);

let analytics = null;
let adsConfig = null;
const isPersonalized = hasTrackingPermission;

try {
// Initialize Firebase Analytics
if (Platform.OS !== 'android' || hasTrackingPermission) {
analytics = initializeAnalytics(hasTrackingPermission);
}

// Initialize ads
adsConfig = await initializeAds(hasTrackingPermission);

console.log('Tracking services initialized successfully');
} catch (error) {
console.error('Error initializing tracking services:', error);
}

return {
Analytics: analytics,
adsConfig,
isPersonalized,
};
};

export const logEvent = (eventName: string, parameters?: any) => {
// This will be used to log events respecting ATT permission
console.log('Logging event:', eventName, parameters);
// TODO: Implement actual event logging when analytics is set up
};

export const setUserProperties = (properties: any) => {
// This will be used to set user properties respecting ATT permission  
console.log('Setting user properties:', properties);
// TODO: Implement actual user properties when analytics is set up
}; 