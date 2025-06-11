import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdsConfig } from '../utils/adsUtils';

interface AdsContextType {
  adsConfig: AdsConfig | null;
  setAdsConfig: (config: AdsConfig) => void;
  isAdsReady: boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

interface AdsProviderProps {
  children: ReactNode;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
  const [adsConfig, setAdsConfigState] = useState<AdsConfig | null>(null);
  const [isAdsReady, setIsAdsReady] = useState(false);
  
  const setAdsConfig = (config: AdsConfig) => {
    setAdsConfigState(config);
    setIsAdsReady(true);
  };
  
  return (
    <AdsContext.Provider value={{
      adsConfig,
      setAdsConfig,
      isAdsReady,
    }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAdsContext = (): AdsContextType => {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAdsContext must be used within an AdsProvider');
  }
  return context;
}; 