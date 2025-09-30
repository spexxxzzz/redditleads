// frontend/contexts/UsageContext.tsx

'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useUsage } from '@/hooks/useUsage';

interface UsageContextType {
  refreshUsage: () => void;
  usageData: any;
  loading: boolean;
  error: string | null;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usageData, loading, error, refreshUsage } = useUsage();

  return (
    <UsageContext.Provider value={{ refreshUsage, usageData, loading, error }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsageContext = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsageContext must be used within a UsageProvider');
  }
  return context;
};
