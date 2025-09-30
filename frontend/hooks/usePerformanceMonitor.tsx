import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiResponseTime: number;
  cacheHitRate: number;
}

interface UsePerformanceMonitorOptions {
  trackApiCalls?: boolean;
  trackRenders?: boolean;
  trackMemory?: boolean;
  reportInterval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    trackApiCalls = true,
    trackRenders = true,
    trackMemory = true,
    reportInterval = 30000, // 30 seconds
    onMetricsUpdate
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    apiResponseTime: 0,
    cacheHitRate: 0
  });

  const renderStartTime = useRef<number>(0);
  const apiCallTimes = useRef<Map<string, number>>(new Map());
  const cacheHits = useRef<number>(0);
  const cacheMisses = useRef<number>(0);
  const reportIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track page load time
  useEffect(() => {
    const loadTime = performance.now();
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);

  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name.includes('render')) {
          setMetrics(prev => ({ 
            ...prev, 
            renderTime: Math.max(prev.renderTime, entry.duration) 
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, [trackRenders]);

  // Track memory usage
  useEffect(() => {
    if (!trackMemory) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
        }));
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, [trackMemory]);

  // Track API call performance
  useEffect(() => {
    if (!trackApiCalls) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        apiCallTimes.current.set(url, duration);
        
        // Update average API response time
        const times = Array.from(apiCallTimes.current.values());
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        
        setMetrics(prev => ({ ...prev, apiResponseTime: avgTime }));
        
        return response;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [trackApiCalls]);

  // Track cache performance
  const trackCacheHit = () => {
    cacheHits.current++;
    updateCacheHitRate();
  };

  const trackCacheMiss = () => {
    cacheMisses.current++;
    updateCacheHitRate();
  };

  const updateCacheHitRate = () => {
    const total = cacheHits.current + cacheMisses.current;
    const hitRate = total > 0 ? (cacheHits.current / total) * 100 : 0;
    setMetrics(prev => ({ ...prev, cacheHitRate: hitRate }));
  };

  // Periodic metrics reporting
  useEffect(() => {
    if (reportInterval > 0) {
      reportIntervalRef.current = setInterval(() => {
        onMetricsUpdate?.(metrics);
      }, reportInterval);
    }

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [metrics, onMetricsUpdate, reportInterval]);

  // Get current performance metrics
  const getCurrentMetrics = () => {
    return {
      ...metrics,
      timestamp: Date.now()
    };
  };

  // Reset metrics
  const resetMetrics = () => {
    setMetrics({
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      apiResponseTime: 0,
      cacheHitRate: 0
    });
    cacheHits.current = 0;
    cacheMisses.current = 0;
    apiCallTimes.current.clear();
  };

  // Performance recommendations
  const getRecommendations = () => {
    const recommendations: string[] = [];

    if (metrics.loadTime > 3000) {
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }

    if (metrics.renderTime > 100) {
      recommendations.push('Optimize component rendering with React.memo or useMemo');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('Check for memory leaks or excessive object creation');
    }

    if (metrics.apiResponseTime > 2000) {
      recommendations.push('Consider implementing API response caching');
    }

    if (metrics.cacheHitRate < 50) {
      recommendations.push('Improve caching strategy to increase hit rate');
    }

    return recommendations;
  };

  return {
    metrics,
    getCurrentMetrics,
    resetMetrics,
    trackCacheHit,
    trackCacheMiss,
    getRecommendations
  };
}

// Performance monitoring component
interface PerformanceMonitorProps {
  enabled?: boolean;
  showMetrics?: boolean;
  className?: string;
}

export function PerformanceMonitor({ 
  enabled = false, 
  showMetrics = false,
  className = '' 
}: PerformanceMonitorProps) {
  const { metrics, getRecommendations } = usePerformanceMonitor({
    onMetricsUpdate: (metrics) => {
      if (enabled) {
        console.log('Performance Metrics:', metrics);
      }
    }
  });

  if (!enabled || !showMetrics) return null;

  const recommendations = getRecommendations();

  return (
    <div className={`fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs ${className}`}>
      <h3 className="font-bold mb-2">Performance Monitor</h3>
      <div className="space-y-1">
        <div>Load Time: {metrics.loadTime.toFixed(0)}ms</div>
        <div>Render Time: {metrics.renderTime.toFixed(0)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
        <div>API Avg: {metrics.apiResponseTime.toFixed(0)}ms</div>
        <div>Cache Hit: {metrics.cacheHitRate.toFixed(1)}%</div>
      </div>
      {recommendations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="font-semibold text-yellow-400">Recommendations:</div>
          <ul className="text-xs space-y-1">
            {recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-yellow-200">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
