import { useState, useEffect, useCallback, useRef } from 'react';
import { useCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

interface UseOptimizedAPIOptions {
  cacheKey: string;
  ttl?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useOptimizedAPI<T>(
  apiCall: () => Promise<T>,
  options: UseOptimizedAPIOptions
): APIState<T> {
  const {
    cacheKey,
    ttl = CACHE_TTL.MEDIUM,
    enabled = true,
    refetchOnWindowFocus = true,
    retryOnError = true,
    maxRetries = 3
  } = options;

  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      
      if (isMounted.current) {
        setData(result);
        cache.set(cacheKey, result, ttl);
        retryCount.current = 0; // Reset retry count on success
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);

        // Retry on error if enabled
        if (retryOnError && retryCount.current < maxRetries) {
          retryCount.current++;
          setTimeout(() => {
            if (isMounted.current) {
              fetchData(true);
            }
          }, Math.pow(2, retryCount.current) * 1000); // Exponential backoff
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiCall, cacheKey, ttl, enabled, retryOnError, maxRetries, cache]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.invalidate(cacheKey);
    setData(null);
  }, [cache, cacheKey]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

// Specialized hooks for common API patterns
export function useUserUsage() {
  return useOptimizedAPI(
    () => api.getUsage(null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.USER_USAGE,
      ttl: CACHE_TTL.SHORT
    }
  );
}

export function useProjectLeads(projectId: string) {
  return useOptimizedAPI(
    () => api.getLeads(projectId, { intent: 'all', sortBy: 'opportunityScore', sortOrder: 'desc', page: 1, limit: 1000 }, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.PROJECT_LEADS(projectId),
      ttl: CACHE_TTL.MEDIUM
    }
  );
}

export function useAnalytics(projectId: string) {
  return useOptimizedAPI(
    () => api.getAnalyticsMetrics(projectId, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.ANALYTICS(projectId),
      ttl: CACHE_TTL.LONG
    }
  );
}

export function useSubredditPerformance(projectId: string) {
  return useOptimizedAPI(
    () => api.getSubredditPerformance(projectId, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.SUBREDDIT_PERFORMANCE(projectId),
      ttl: CACHE_TTL.LONG
    }
  );
}

export function useOpportunityDistribution(projectId: string) {
  return useOptimizedAPI(
    () => api.getOpportunityDistribution(projectId, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.OPPORTUNITY_DISTRIBUTION(projectId),
      ttl: CACHE_TTL.LONG
    }
  );
}

export function useWeeklyActivity(projectId: string) {
  return useOptimizedAPI(
    () => api.getWeeklyActivity(projectId, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.WEEKLY_ACTIVITY(projectId),
      ttl: CACHE_TTL.LONG
    }
  );
}

export function useLeadTrends(projectId: string) {
  return useOptimizedAPI(
    () => api.getLeadTrends(projectId, null).then((res: any) => res),
    {
      cacheKey: CACHE_KEYS.LEAD_TRENDS(projectId),
      ttl: CACHE_TTL.LONG
    }
  );
}

// Import api
import { api } from '@/lib/api';
