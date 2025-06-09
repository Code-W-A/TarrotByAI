import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

export interface ATTState {
  status: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  hasPermission: boolean;
}

export const useAppTrackingTransparency = (): ATTState => {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = async () => {
    if (Platform.OS !== 'ios') {
      setStatus('not-applicable');
      return;
    }

    setIsLoading(true);
    try {
      const { status: newStatus } = await TrackingTransparency.requestTrackingPermissionsAsync();
      setStatus(newStatus);
      console.log('ATT Permission requested, status:', newStatus);
    } catch (error) {
      console.error('Error requesting ATT permission:', error);
      setStatus('error');
    }
    setIsLoading(false);
  };

  const getTrackingStatus = async () => {
    if (Platform.OS !== 'ios') {
      setStatus('not-applicable');
      return;
    }

    try {
      const { status: currentStatus } = await TrackingTransparency.getTrackingPermissionsAsync();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error getting ATT status:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    getTrackingStatus();
  }, []);

  const hasPermission = status === 'granted';

  return {
    status,
    isLoading,
    requestPermission,
    hasPermission,
  };
}; 