// frontend/hooks/useUsage.ts

import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

interface UsageData {
  leads: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  projects: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  aiSummaries: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  aiReplies: {
    current: number;
    limit: number | 'unlimited';
    percentage: number;
    isUnlimited: boolean;
  };
  plan: string;
  planName: string;
}

export const useUsage = (projectId?: string) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 [useUsage] User loaded:', userLoaded, 'Auth loaded:', authLoaded, 'User:', user ? 'Present' : 'Not present');

  const fetchUsageData = useCallback(async () => {
    if (!userLoaded || !authLoaded) {
      console.log('🔍 [useUsage] User or auth not loaded yet');
      return;
    }
    
    if (!user || !getToken) {
      console.log('🔍 [useUsage] No user or getToken available after loading');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      console.log('🔍 [useUsage] Got token:', token ? 'Token present' : 'No token');
      // Use project-specific usage if projectId is provided
      const response = projectId 
        ? await api.getProjectUsage(projectId, token)
        : await api.getUsage(token);
      
      if (response.success) {
        setUsageData(response.data);
      } else {
        setError('Failed to load usage data');
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    if (userLoaded && authLoaded) {
      fetchUsageData();
    }
  }, [userLoaded, authLoaded, fetchUsageData]);

  useEffect(() => {
    if (userLoaded && authLoaded && user) {
      // Refresh usage data every 30 seconds
      const interval = setInterval(fetchUsageData, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userLoaded, authLoaded, user, fetchUsageData]);

  // Listen for manual refresh events (e.g., when summaries are generated)
  useEffect(() => {
    const handleUsageRefresh = () => {
      console.log('🔄 [useUsage] Manual refresh triggered');
      fetchUsageData();
    };

    window.addEventListener('usageRefresh', handleUsageRefresh);
    return () => window.removeEventListener('usageRefresh', handleUsageRefresh);
  }, [fetchUsageData]);

  // Function to manually refresh usage data (useful after actions that change usage)
  const refreshUsage = useCallback(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  // Function to reset usage data (useful when switching accounts)
  const resetUsage = useCallback(async () => {
    try {
      console.log('🔄 [useUsage] Resetting usage data...');
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/usage/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ [useUsage] Usage data reset successfully');
        await fetchUsageData(); // Refresh after reset
      } else {
        console.error('❌ [useUsage] Failed to reset usage data');
      }
    } catch (error) {
      console.error('❌ [useUsage] Error resetting usage:', error);
    }
  }, [getToken, fetchUsageData]);

  return {
    usageData,
    loading,
    error,
    refreshUsage,
    resetUsage
  };
};
