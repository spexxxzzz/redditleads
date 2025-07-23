"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MagnifyingGlassIcon, 
  GlobeAltIcon,
  TagIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { toast } from 'sonner';
import { TargetIcon } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface DiscoveryButtonsProps {
  campaignId: string;
  targetSubreddits: string[];
  onLeadsDiscovered: () => void;
  lastDiscoveryAt?: Date | null;
}

export const DiscoveryButtons: React.FC<DiscoveryButtonsProps> = ({
  campaignId,
  targetSubreddits,
  onLeadsDiscovered,
  lastDiscoveryAt
}) => {
  const { getToken } = useAuth();
  const [isRunningGlobal, setIsRunningGlobal] = useState(false);
  const [isRunningTargeted, setIsRunningTargeted] = useState(false);

  const handleGlobalDiscovery = async () => {
    try {
      setIsRunningGlobal(true);
      const token = await getToken();
      const result = await api.runManualDiscovery(campaignId, token);
      
      toast.success(`Found ${result.length} global leads!`, {
        description: 'Discovered leads from across Reddit using global search'
      });
      
      onLeadsDiscovered();
    } catch (error: any) {
      console.error('Global discovery failed:', error);
      toast.error('Global discovery failed', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsRunningGlobal(false);
    }
  };

  const handleTargetedDiscovery = async () => {
    try {
      setIsRunningTargeted(true);
      const token = await getToken();
      const result = await api.runTargetedDiscovery(campaignId, token);
      
      toast.success(`Found ${result.leads?.length || 0} targeted leads!`, {
        description: `Searched ${result.subredditsSearched?.length || 0} specific subreddits`
      });
      
      onLeadsDiscovered();
    } catch (error: any) {
      console.error('Targeted discovery failed:', error);
      
      if (error.message.includes('No target subreddits')) {
        toast.error('No target subreddits configured', {
          description: 'Please add target subreddits to your campaign first'
        });
      } else {
        toast.error('Targeted discovery failed', {
          description: error.message || 'Please try again later'
        });
      }
    } finally {
      setIsRunningTargeted(false);
    }
  };

  const isAnyRunning = isRunningGlobal || isRunningTargeted;
  const hasTargetSubreddits = targetSubreddits && targetSubreddits.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold text-white ${poppins.className}`}>
            Lead Discovery
          </h3>
          <p className={`text-sm text-gray-400 ${inter.className}`}>
            Choose your discovery method
          </p>
        </div>
        {lastDiscoveryAt && (
          <Badge variant="outline" className="text-xs">
            Last run: {new Date(lastDiscoveryAt).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {/* Discovery Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Global Discovery */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <GlobeAltIcon className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold text-white ${poppins.className}`}>
                    Global Search
                  </h4>
                  <p className={`text-xs text-gray-400 ${inter.className}`}>
                    Search across all Reddit
                  </p>
                </div>
              </div>
              <SparklesIcon className="h-4 w-4 text-orange-400" />
            </div>
            
            <p className={`text-xs text-gray-300 leading-relaxed ${inter.className}`}>
              Searches the entire Reddit platform using AI-powered relevance filtering. 
              Best for discovering new opportunities.
            </p>
            
            <Button
              onClick={handleGlobalDiscovery}
              disabled={isAnyRunning}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
            >
              {isRunningGlobal ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-3 w-3 mr-2" />
                  Run Global Search
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Targeted Discovery */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300" />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <TargetIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold text-white ${poppins.className}`}>
                    Targeted Search
                  </h4>
                  <p className={`text-xs text-gray-400 ${inter.className}`}>
                    Search specific subreddits
                  </p>
                </div>
              </div>
              {hasTargetSubreddits && (
                <Badge variant="outline" className="text-xs">
                  {targetSubreddits.length} subs
                </Badge>
              )}
            </div>
            
            <p className={`text-xs text-gray-300 leading-relaxed ${inter.className}`}>
              {hasTargetSubreddits 
                ? `Searches your ${targetSubreddits.length} configured subreddits for highly relevant leads with less competition.`
                : 'Configure target subreddits in campaign settings to use this feature.'
              }
            </p>
            
            <Button
              onClick={handleTargetedDiscovery}
              disabled={isAnyRunning || !hasTargetSubreddits}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-600 disabled:text-gray-400"
              size="sm"
            >
              {isRunningTargeted ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Searching...
                </>
              ) : !hasTargetSubreddits ? (
                'Configure Subreddits'
              ) : (
                <>
                  <TargetIcon className="h-3 w-3 mr-2" />
                  Run Targeted Search
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Info Note */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
        <p className={`text-xs text-gray-400 ${inter.className}`}>
          <span className="font-medium text-orange-400">Global:</span> Broader reach, AI-filtered results. 
          <span className="font-medium text-blue-400 ml-3">Targeted:</span> Specific subreddits, higher relevance.
        </p>
      </div>
    </div>
  );
};