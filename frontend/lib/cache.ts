// Advanced caching utilities for better performance
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum cache entries

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Get all cache entries for pattern matching
  getEntries(): IterableIterator<[string, { data: any; timestamp: number; ttl: number }]> {
    return this.cache.entries();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      maxSize: this.maxSize
    };
  }
}

// Cache keys for different data types
export const CACHE_KEYS = {
  USER_USAGE: 'user_usage',
  PROJECT_LEADS: (projectId: string) => `project_leads_${projectId}`,
  ANALYTICS: (projectId: string) => `analytics_${projectId}`,
  PROJECTS: 'user_projects',
  SUBREDDIT_PERFORMANCE: (projectId: string) => `subreddit_performance_${projectId}`,
  OPPORTUNITY_DISTRIBUTION: (projectId: string) => `opportunity_distribution_${projectId}`,
  WEEKLY_ACTIVITY: (projectId: string) => `weekly_activity_${projectId}`,
  LEAD_TRENDS: (projectId: string) => `lead_trends_${projectId}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

// React hook for caching
export function useCache() {
  const cache = CacheManager.getInstance();

  const getCachedData = useCallback((key: string) => {
    return cache.get(key);
  }, [cache]);

  const setCachedData = useCallback((key: string, data: any, ttl?: number) => {
    cache.set(key, data, ttl);
  }, [cache]);

  const invalidateCache = useCallback((pattern?: string) => {
    if (pattern) {
      // Invalidate cache entries matching pattern
      const keysToDelete: string[] = [];
      for (const [key] of cache.getEntries()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => cache.delete(key));
    } else {
      cache.clear();
    }
  }, [cache]);

  return {
    get: getCachedData,
    set: setCachedData,
    invalidate: invalidateCache,
    has: cache.has.bind(cache),
    stats: cache.getStats.bind(cache)
  };
}

// Import useCallback
import { useCallback } from 'react';
