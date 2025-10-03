import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

interface DiscoveryProgress {
  status: 'running' | 'completed' | 'failed';
  stage: string;
  leadsFound: number;
  message: string;
  estimatedTimeLeft: number;
}

interface UseDiscoveryProgressOptions {
  projectId: string | null;
  enabled?: boolean;
  pollInterval?: number;
  onComplete?: (progress: DiscoveryProgress) => void;
  onError?: (error: Error) => void;
}

export function useDiscoveryProgress({
  projectId,
  enabled = true,
  pollInterval = 5000, // 5 seconds
  onComplete,
  onError
}: UseDiscoveryProgressOptions) {
  const { getToken } = useAuth();
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!projectId || !enabled) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/leads/discover/progress/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.status}`);
      }

      const progressData: DiscoveryProgress = await response.json();
      setProgress(progressData);
      setError(null);

      // Call onComplete if discovery is finished
      if (progressData.status === 'completed' || progressData.status === 'failed') {
        setIsPolling(false);
        onComplete?.(progressData);
      }

    } catch (err: any) {
      console.error('Error fetching discovery progress:', err);
      setError(err.message);
      onError?.(err);
    }
  }, [projectId, enabled, getToken, onComplete, onError]);

  const startPolling = useCallback(() => {
    if (!projectId || !enabled) return;

    setIsPolling(true);
    setError(null);
    
    // Initial fetch
    fetchProgress();
  }, [projectId, enabled, fetchProgress]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Set up polling interval
  useEffect(() => {
    if (!isPolling || !projectId || !enabled) return;

    const interval = setInterval(fetchProgress, pollInterval);
    return () => clearInterval(interval);
  }, [isPolling, projectId, enabled, pollInterval, fetchProgress]);

  // Auto-start polling when projectId changes and enabled is true
  useEffect(() => {
    if (projectId && enabled) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [projectId, enabled, startPolling, stopPolling]);

  return {
    progress,
    isPolling,
    error,
    startPolling,
    stopPolling,
    fetchProgress
  };
}
