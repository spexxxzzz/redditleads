// frontend/components/dashboard/UsageDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useUsage } from '@/hooks/useUsage';

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

interface UsageDashboardProps {
  className?: string;
  projectId?: string;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({ className = '', projectId }) => {
  const { usageData, loading, error, refreshUsage, resetUsage } = useUsage(projectId);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (usageData) {
      setLastUpdated(new Date());
    }
  }, [usageData]);

  const getProgressBarColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (percentage >= 90) return 'bg-gradient-to-r from-red-400 to-red-500';
    if (percentage >= 75) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-r from-orange-400 to-orange-500';
  };

  const getTextColor = (percentage: number, isUnlimited: boolean) => {
    if (isUnlimited) return 'text-green-400';
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-gray-300';
  };

  const UsageItem = ({ 
    label, 
    icon, 
    usage 
  }: { 
    label: string; 
    icon: string; 
    usage: { current: number; limit: number | 'unlimited'; percentage: number; isUnlimited: boolean; };
  }) => (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${getTextColor(usage.percentage, usage.isUnlimited)}`}>
          {usage.isUnlimited ? '∞' : `${usage.current}/${usage.limit}`}
        </span>
      </div>
      
      {!usage.isUnlimited && (
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(usage.percentage, usage.isUnlimited)}`}
            style={{ width: `${Math.min(usage.percentage, 100)}%` }}
          />
        </div>
      )}
      
      {usage.isUnlimited && (
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-800 rounded mb-3"></div>
          <div className="h-2 bg-zinc-800 rounded mb-2"></div>
          <div className="h-2 bg-zinc-800 rounded mb-2"></div>
          <div className="h-2 bg-zinc-800 rounded mb-2"></div>
          <div className="h-2 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !usageData) {
    return (
      <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 ${className}`}>
        <div className="text-center text-red-400 text-sm">
          {error || 'Failed to load usage data'}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/30 rounded-lg p-4 border border-zinc-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Usage Dashboard</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full border border-orange-600/30">
            {usageData.planName}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <UsageItem 
          label="Leads" 
          icon="" 
          usage={usageData.leads} 
        />
        <UsageItem 
          label="Projects" 
          icon="" 
          usage={usageData.projects} 
        />
        <UsageItem 
          label="AI Summaries" 
          icon="" 
          usage={usageData.aiSummaries} 
        />
        <UsageItem 
          label="AI Replies" 
          icon="" 
          usage={usageData.aiReplies} 
        />
      </div>

      {/* Upgrade prompt for free users */}
      {usageData.plan === 'basic' && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-600/10 to-orange-500/10 rounded-lg border border-orange-600/20">
          <div className="text-xs text-orange-400 font-medium mb-1">
            Need more capacity?
          </div>
          <div className="text-xs text-orange-300">
            Upgrade to unlock unlimited features
          </div>
        </div>
      )}

      {/* Last updated indicator */}
      {lastUpdated && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default UsageDashboard;
