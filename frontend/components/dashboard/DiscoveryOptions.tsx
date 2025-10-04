"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth, useUser } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { toast } from 'sonner';
import { useDiscoveryProgress } from '@/hooks/useDiscoveryProgress';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface DiscoveryButtonsProps {
  projectId: string;
  targetSubreddits: string[];
  onLeadsDiscovered: () => void;
  lastDiscoveryAt: Date | null;
  disabled?: boolean;
  isDiscoveryRunning?: boolean;
  onDiscoveryStart?: () => void;
  onDiscoveryComplete?: () => void;
}

interface ApiResponse {
  length?: number;
  leads?: unknown[];
  subredditsSearched?: string[];
  message?: string;
  discoveryStarted?: boolean;
}

export const DiscoveryButtons: React.FC<DiscoveryButtonsProps> = ({
  projectId,
  targetSubreddits,
  onLeadsDiscovered,
  lastDiscoveryAt,
  disabled = false,
  isDiscoveryRunning = false,
  onDiscoveryStart,
  onDiscoveryComplete
}) => {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [isRunningGlobal, setIsRunningGlobal] = useState<boolean>(false);
  
  // Use the real-time discovery progress hook - coordinate with parent state
  const { 
    progress: realProgress, 
    isPolling, 
    error: progressError,
    startPolling,
    stopPolling 
  } = useDiscoveryProgress({
    projectId: (isRunningGlobal || isDiscoveryRunning) ? projectId : null,
    enabled: isRunningGlobal || isDiscoveryRunning,
    onComplete: (progress) => {
      console.log('Discovery completed:', progress);
      setIsRunningGlobal(false);
      onDiscoveryComplete?.(); // Notify parent component
      if (progress.status === 'completed') {
        toast.success(`Discovery completed! Found ${progress.leadsFound} leads.`);
        onLeadsDiscovered();
      } else if (progress.status === 'failed') {
        toast.error('Discovery failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Discovery progress error:', error);
      toast.error('Failed to track discovery progress.');
      setIsRunningGlobal(false);
      onDiscoveryComplete?.(); // Notify parent component
    }
  });

  // Reset discovery state on mount to prevent stuck states
  useEffect(() => {
    console.log('🔄 Resetting discovery state on mount');
    api.resetDiscoveryState();
    setIsRunningGlobal(false);
  }, []);

  // Sync Reddit connection on mount to ensure accurate status (ONCE ONLY)
  useEffect(() => {
    let hasSynced = false;
    
    const syncRedditConnection = async () => {
      if (isLoaded && user && !hasSynced) {
        hasSynced = true;
        try {
          const token = await getToken();
          await api.syncRedditConnection(token);
          await user.reload();
        } catch (error) {
          console.error('Failed to sync Reddit connection:', error);
          hasSynced = false; // Allow retry on error
        }
      }
    };

    syncRedditConnection();
  }, [isLoaded]); // Only run when isLoaded changes, not on every user change

  // Simplified: No cooldown needed - user can run discovery anytime
  
  // Check Reddit connection status
  const isRedditConnected = !!user?.publicMetadata?.hasConnectedReddit;

  // Simplified: No cooldown logic needed

  const handleGlobalDiscovery = async (): Promise<void> => {
    console.log('🚀 [DiscoveryOptions] handleGlobalDiscovery called');
    console.log('🚀 [DiscoveryOptions] isRunningGlobal:', isRunningGlobal);
    console.log('🚀 [DiscoveryOptions] isDiscoveryRunning:', isDiscoveryRunning);
    console.log('🚀 [DiscoveryOptions] isLoaded:', isLoaded);
    console.log('🚀 [DiscoveryOptions] isSignedIn:', isSignedIn);
    console.log('🚀 [DiscoveryOptions] projectId:', projectId);
    console.log('🚀 [DiscoveryOptions] userId:', userId);
    
    // Check if user is authenticated
    if (!isLoaded) {
      toast.error('Please wait while we verify your authentication');
      return;
    }

    if (!isSignedIn) {
      toast.error('Please sign in to run discovery');
      return;
    }

    // Simplified: No cooldown check needed

    // Prevent multiple simultaneous requests - check both local and parent state
    if (isRunningGlobal || isDiscoveryRunning) {
      console.log('🚀 [DiscoveryOptions] Discovery already running, preventing duplicate request');
      toast.error('Discovery is already running. Please wait for it to complete.');
      return;
    }

    // Validate projectId before proceeding
    if (!projectId) {
      console.error('❌ [DiscoveryOptions] No project ID available for discovery');
      toast.error('No project selected', {
        description: 'Please select a project before running discovery'
      });
      return;
    }

    // Check if user is properly authenticated
    if (!isSignedIn || !isLoaded) {
      console.error('❌ [DiscoveryOptions] User not properly authenticated');
      toast.error('Authentication required', {
        description: 'Please sign in again to run discovery'
      });
      return;
    }

    try {
      console.log('🚀 [DiscoveryOptions] Starting discovery process...');
      console.log('🔑 [DiscoveryOptions] Auth state - isSignedIn:', isSignedIn);
      console.log('🔑 [DiscoveryOptions] Auth state - isLoaded:', isLoaded);
      console.log('🔑 [DiscoveryOptions] Auth state - userId:', userId);
      
      setIsRunningGlobal(true);
      onDiscoveryStart?.(); // Notify parent component that discovery is starting
      
      // Always get a fresh token for each request
      console.log('🔄 Getting fresh token for discovery...');
      let token = await getToken();
      console.log('🔐 Fresh token attempt:', token ? 'Present' : 'Missing');
      
      // If we have a token, validate it by making a test request
      if (token) {
        console.log('🔍 Validating token with test request...');
        try {
          const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projects`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.status === 401) {
            console.log('❌ Token is invalid, refreshing...');
            token = null; // Force refresh
          } else {
            console.log('✅ Token is valid');
          }
        } catch (error) {
          console.log('❌ Token validation failed:', error);
          token = null; // Force refresh
        }
      }
      
      // If no token, try different methods
      if (!token) {
        console.log('🔄 No token found, trying alternative methods...');
        try {
          // Try with template
          token = await getToken({ template: 'api' });
          console.log('🔐 Template token attempt:', token ? 'Present' : 'Missing');
        } catch (error) {
          console.error('❌ Error getting template token:', error);
        }
        
        // If still no token, try regular method again
        if (!token) {
          try {
            token = await getToken();
            console.log('🔐 Regular token retry:', token ? 'Present' : 'Missing');
          } catch (error) {
            console.error('❌ Error getting regular token:', error);
          }
        }
      }
      
      console.log('🔐 Token received:', token ? 'Present' : 'Missing');
      console.log('🔐 Token length:', token ? token.length : 0);
      console.log('🔐 Token preview:', token ? `${token.substring(0, 50)}...` : 'None');
      console.log('📋 Project ID:', projectId);
      
      if (!token) {
        console.error('❌ No authentication token available');
        console.error('❌ User signed in:', isSignedIn);
        console.error('❌ Auth loaded:', isLoaded);
        console.error('❌ User ID:', userId);
        
        // If user is not signed in, redirect to sign in
        if (!isSignedIn) {
          console.log('🔄 User not signed in, redirecting to sign in...');
          window.location.href = '/sign-in';
          return;
        }
        
        throw new Error('Authentication token not available. Please sign in again.');
      }

      console.log('🚀 Making API request...');
      
      // Start polling for real progress updates
      startPolling();
      
      try {
        const result = await api.runManualDiscovery(projectId, token) as ApiResponse;

        // Check if discovery was started successfully
        if (result.discoveryStarted) {
          console.log('✅ Discovery started successfully in background, polling for progress...');
          // The progress will be handled by the useDiscoveryProgress hook
          // No need to manually handle success here as the hook will call onComplete
        } else {
          console.log('Discovery API call completed, waiting for progress updates...');
        }
      } catch (discoveryError: unknown) {
        stopPolling();
        console.error('Discovery API call failed:', discoveryError);
        throw discoveryError; // Re-throw to be caught by outer catch
      }
    } catch (error: unknown) {
      console.error('Global discovery failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error('Global discovery failed', {
        description: errorMessage || 'Please try again later'
      });
    } finally {
      // Don't set isRunningGlobal to false here - let the hook handle it
      // The hook will call onComplete which will set isRunningGlobal to false
    }
  };

  const isAnyRunning = isRunningGlobal;

  return (
    <div className="space-y-6">
      {/* Discovery Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6"
      >
        {/* Global Discovery */}
        <motion.div
          whileHover={!isAnyRunning ? { scale: 1.02 } : {}}
          whileTap={!isAnyRunning ? { scale: 0.98 } : {}}
          className="group relative h-full flex flex-col"
        >
          <div className={`bg-black/40 backdrop-blur-sm border rounded-lg p-3 sm:p-4 flex flex-col h-full min-h-[210px] transition-all duration-300 ${
            isAnyRunning ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/10'
          }`}>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-base sm:text-lg font-bold text-white ${poppins.className}`}>
                  Global Search
                </h3>
                {/* Simplified - no cooldown display */}
              </div>
              <p className={`text-white/60 text-sm ${inter.className}`}>
                AI-powered search across the entire Reddit platform for discovering new opportunities.
              </p>
              
              {/* Animated Progress Display */}
              {realProgress && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 relative overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 relative">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 animate-pulse"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <motion.div 
                            className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 180, 360]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div 
                            className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-30"
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 0, 0.3]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                        <motion.span 
                          key={realProgress.message}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-orange-300 text-sm font-semibold"
                        >
                          {realProgress.stage === 'not_started' ? 'Initializing discovery process...' :
                           realProgress.message || 'Processing your discovery request...'}
                        </motion.span>
                      </div>
                      
                      {realProgress.leadsFound > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 text-orange-200 text-xs"
                        >
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                          <span>Found {realProgress.leadsFound} high-quality leads so far!</span>
                        </motion.div>
                      )}
                      
                      {/* Special completion animation */}
                      {realProgress.stage === 'completed' && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
                            realProgress.leadsFound > 0 ? 'text-green-300' : 'text-orange-300'
                          }`}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-lg"
                          >
                            {realProgress.leadsFound > 0 ? '🎉' : '🔍'}
                          </motion.div>
                          <span>
                            {realProgress.leadsFound > 0 
                              ? 'Your leads are ready to explore!' 
                              : 'Keep trying for better results!'
                            }
                          </span>
                        </motion.div>
                      )}
                      
                      {/* Interactive Discovery Stats */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className="flex items-center gap-1 text-orange-300"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <span>AI Scanning</span>
                          </motion.div>
                          <motion.div
                            className="flex items-center gap-1 text-red-300"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          >
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <span>Quality Filter</span>
                          </motion.div>
                          <motion.div
                            className="flex items-center gap-1 text-pink-300"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                          >
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                            <span>Lead Scoring</span>
                          </motion.div>
                        </div>
                        
                        {/* Dynamic Stage Indicator */}
                        <motion.div
                          className="flex items-center gap-2 text-orange-400 font-semibold"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {realProgress.stage === 'completed' ? (
                            <>
                              <span>
                                ✓
                              </span>
                              <span>Complete</span>
                            </>
                          ) : (
                            <>
                              <motion.div
                                className="w-2 h-2 bg-orange-400 rounded-full"
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [1, 0.5, 1]
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                              <span>
                                {realProgress.stage === 'not_started' ? 'Starting...' :
                                 realProgress.stage === 'searching' ? 'Scanning...' :
                                 realProgress.stage === 'analyzing' ? 'Analyzing...' :
                                 realProgress.stage === 'scoring' ? 'Scoring...' :
                                 realProgress.stage === 'saving' ? 'Saving...' : 'Processing...'}
                              </span>
                            </>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <Button
              data-tour="discovery-button"
              onClick={() => {
                if (!isRedditConnected) {
                  toast.error('Please connect your Reddit account first');
                  return;
                }
                console.log('🔘 Button clicked!');
                console.log('🔘 isAnyRunning:', isAnyRunning);
                // Simplified logging
                console.log('🔘 isRunningGlobal:', isRunningGlobal);
                console.log('🔘 projectId:', projectId);
                console.log('🔘 Button disabled:', isAnyRunning || !isRedditConnected);
                handleGlobalDiscovery();
              }}
              disabled={isAnyRunning || disabled || !isRedditConnected}
              className={`w-full border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base rounded-md ${
                !isRedditConnected
                  ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/20'
                  : isAnyRunning
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/20'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
              }`}
            >
              {isAnyRunning ? (
                <span className={poppins.className}>Discovering...</span>
              ) : !isRedditConnected ? (
                <span className={poppins.className}>Connect Reddit to Start</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className={poppins.className}>Start Discovery</span>
                  <span className="text-xs text-green-400">✓ Reddit</span>
                </div>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Indicator */}
      {isAnyRunning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              animate={{
                width: ['0%', '100%'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <p className={`text-center text-white/60 text-sm ${inter.className}`}>
            {isRunningGlobal 
              ? 'Scanning Reddit globally for opportunities...' 
              : 'Analyzing targeted subreddits for leads...'
            }
          </p>
        </motion.div>
      )}

      {/* Last Discovery Info */}
      {lastDiscoveryAt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className={`text-white/50 text-sm ${inter.className}`}>
            Last discovery: {new Date(lastDiscoveryAt).toLocaleDateString()}
          </p>
        </motion.div>
      )}
    </div>
  );
};