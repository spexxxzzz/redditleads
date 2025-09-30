import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

interface ProjectLimits {
  canCreateProject: boolean;
  currentProjects: number;
  maxProjects: number | 'unlimited';
  isLoading: boolean;
  error: string | null;
}

export function useProjectLimits() {
  const { getToken } = useAuth();
  const [limits, setLimits] = useState<ProjectLimits>({
    canCreateProject: true,
    currentProjects: 0,
    maxProjects: 1,
    isLoading: true,
    error: null
  });

  const checkProjectLimits = async () => {
    try {
      setLimits(prev => ({ ...prev, isLoading: true, error: null }));
      
      const token = await getToken();
      const [usageResponse, projects] = await Promise.all([
        api.getUsage(token),
        api.getProjects(token)
      ]);

      const currentProjects = projects?.length || 0;
      const usageData = usageResponse?.data || usageResponse;
      const maxProjects = usageData?.projects?.limit || 1;
      
      // Debug logging
      console.log('🔍 [Project Limits] Raw usage data:', usageData);
      console.log('🔍 [Project Limits] Projects data:', projects);
      console.log('🔍 [Project Limits] Current projects:', currentProjects);
      console.log('🔍 [Project Limits] Max projects:', maxProjects);
      console.log('🔍 [Project Limits] Max projects type:', typeof maxProjects);
      
      // Handle unlimited projects (when limit is 'unlimited' or -1)
      const canCreateProject = maxProjects === 'unlimited' || maxProjects === -1 || currentProjects < maxProjects;

      setLimits({
        canCreateProject,
        currentProjects,
        maxProjects: maxProjects === 'unlimited' || maxProjects === -1 ? 'unlimited' : maxProjects,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error checking project limits:', error);
      setLimits(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to check project limits'
      }));
    }
  };

  useEffect(() => {
    checkProjectLimits();
  }, []);

  return {
    ...limits,
    refetch: checkProjectLimits
  };
}
