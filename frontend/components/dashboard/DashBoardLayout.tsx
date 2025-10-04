"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Inter, Poppins } from 'next/font/google';
import { RedditLeadsHeader } from './DashboardHeader';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { batchLeadsForSession, getLeadBatchingMessage, LeadBatchingOptions } from '@/utils/leadBatching';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, LoadingOverlay } from '../ui/LoadingState';
import { DeleteLeadsModal } from "./DeleteLead";
import { DiscoveryButtons } from './DiscoveryOptions';
import { useReplyModal, Lead } from '@/hooks/useReplyModal';
import { ReplyModal } from './ReplyModal';
import { Menu, X } from 'lucide-react';
import { TrashIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
import { useUserUsage, useProjectLeads } from '@/hooks/useOptimizedAPI';
import { useRealTimeLeads, useRealTimeUsage } from '@/hooks/useWebSocket';
import { PerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { ResponsiveContainer, ResponsiveGrid } from '../ui/ResponsiveContainer';

// Dynamic imports for heavy components
const AnalyticalDashboard = dynamic(() => import('./AnalyticalDashboard').then(mod => ({ default: mod.AnalyticalDashboard })), {
  loading: () => <LoadingState message="Loading analytics..." size="md" />,
  ssr: false
});

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900']
});

interface Project {
  id: string;
  userId: string;
  name: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
  targetSubreddits: string[];
  competitors: string[];
  createdAt: string;
  lastManualDiscoveryAt?: string | null;
  lastGlobalDiscoveryAt?: string | null;
  lastTargetedDiscoveryAt?: string | null;
  _count?: {
    leads: number;
  };
}

export const DashboardLayout = () => {
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isFetchingLeads = useRef(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [activeView, setActiveView] = useState<'dashboard' | 'leads'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<Lead['status'] | 'all'>("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { isOpen: isReplyModalOpen, lead: replyModalLead, onClose: onReplyModalClose } = useReplyModal();

  // Lead batching state
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [userRemainingLeads, setUserRemainingLeads] = useState<number>(25);
  const [leadBatchingMessage, setLeadBatchingMessage] = useState<string>('');
  const [batchedLeads, setBatchedLeads] = useState<Lead[]>([]);
  const [isLeadLimitExceeded, setIsLeadLimitExceeded] = useState<boolean>(false);



  // Handle URL project parameter
  useEffect(() => {
    const projectIdFromUrl = searchParams.get('project');
    if (projectIdFromUrl && projects.length > 0) {
      const projectExists = projects.find(p => p.id === projectIdFromUrl);
      if (projectExists) {
        console.log('🎯 Setting active project from URL:', projectIdFromUrl);
        setActiveProject(projectIdFromUrl);
      }
    }
  }, [searchParams, projects]);

  // Responsive
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        return;
      }
      
      const data = await api.getProjects(token);
      console.log('📋 Fetched projects:', data?.map((p: Project) => ({ id: p.id, name: p.name })));
      console.log('🎯 Current active project:', activeProject);
      setProjects(data || []);
      
      if (data && data.length > 0) {
        // Check if current active project still exists
        const currentProjectExists = activeProject ? data.find((p: Project) => p.id === activeProject) : null;
        console.log('🔍 Current project exists:', !!currentProjectExists);
        
        if (!activeProject || !currentProjectExists) {
          // Either no active project or current active project doesn't exist anymore
          console.log('🔄 Setting active project to:', data[0].id);
          setActiveProject(data[0].id);
        } else {
          console.log('✅ Active project still exists, keeping:', activeProject);
        }
      } else if (!data || data.length === 0) {
        // New user with no projects - this is normal, not an error
        setError(null); // Clear any previous errors
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      
      // Check if it's a 404 or similar "no data" error
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setProjects([]);
        setError(null); // Don't show error for new users
        setIsLoading(false);
      } else {
        setError(`Failed to load projects: ${err.message}`);
      }
    }
  }, [getToken, activeProject]);

  const fetchLeads = useCallback(async (projectId: string) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingLeads.current) {
      return;
    }
    
    isFetchingLeads.current = true;
    setIsLoading(true);
    
    try {
      const token = await getToken();
      
      const allLeadsResponse = await api.getLeads(projectId, {
        intent: intentFilter,
        sortBy,
        sortOrder,
        page: 1,
        limit: 1000,
      }, token);
      
      const leadsData: Lead[] = (allLeadsResponse.data || []).map((lead: any) => ({
        id: lead.id,
        title: lead.title,
        author: lead.author,
        subreddit: lead.subreddit,
        url: lead.url,
        body: lead.body,
        createdAt: lead.createdAt,
        postedAt: lead.postedAt, // Add this line
        intent: lead.intent,
        summary: lead.summary,
        opportunityScore: lead.opportunityScore,
        status: lead.status || 'new',
        numComments: lead.numComments,
        upvoteRatio: lead.upvoteRatio,
        isGoogleRanked: lead.isGoogleRanked ?? false,
      }));
      
      setAllLeads(leadsData);

      // Show ALL leads for the current project - no artificial limiting
      setBatchedLeads(leadsData);
      setLeadBatchingMessage('');

      if (activeFilter !== "all") {
        setLeads(leadsData.filter((lead) => lead.status === activeFilter));
      } else {
        setLeads(leadsData);
      }
    } catch (err: any) {
      console.error('Failed to load leads:', err);
      setError(`Failed to load leads: ${err.message}`);
      // Don't clear existing leads on error - keep them visible
    } finally {
      setIsLoading(false);
      isFetchingLeads.current = false;
    }
  }, [getToken, activeFilter, intentFilter, sortBy, sortOrder]);

  // REMOVED: This function was redundant - DiscoveryOptions handles discovery

  const handleLeadsDiscovered = () => {
    if (activeProject) {
      fetchLeads(activeProject);
      fetchProjects();
    }
  };

  const handleProjectDeleted = () => {
    // Reset active project when a project is deleted
    setActiveProject(null);
    setLeads([]);
    setAllLeads([]);
    fetchProjects(); // This will set a new active project if available
  };

  const resetDiscoveryState = () => {
    setIsRunningDiscovery(false);
    setError(null);
    // Also reset the API's internal state
    api.resetDiscoveryState();
  };

  // Simplified reset function
  const forceResetDiscovery = () => {
    setIsRunningDiscovery(false);
    setError(null);
    api.resetDiscoveryState();
    fetchUserUsage();
  };

  const handleLeadDelete = (leadId: string) => {
    const updateLeadList = (list: Lead[]) => list.filter(lead => lead.id !== leadId);
    setLeads(updateLeadList(leads));
    setAllLeads(updateLeadList(allLeads));
    setBatchedLeads(updateLeadList(batchedLeads));
  };

  // Fetch user usage data for lead batching
  const fetchUserUsage = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const usageData = await api.getUsage(token);
      if (usageData.success) {
        setUserPlan(usageData.data.plan);
        setUserRemainingLeads(usageData.data.leadsRemaining);
        
        // Check if lead limit is exceeded
        const isExceeded = usageData.data.leads.current > usageData.data.leads.limit;
        setIsLeadLimitExceeded(isExceeded);
        
      }
    } catch (error) {
      console.error('Error fetching user usage:', error);
    }
  }, [getToken]);

  // Show all leads for the current project - no artificial limiting
  const applyLeadBatching = useCallback((allLeads: Lead[]) => {
    setBatchedLeads(allLeads);
    setLeadBatchingMessage('');
  }, [userRemainingLeads, userPlan]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    fetchProjects();
    fetchUserUsage();
    // Force reset discovery state on mount in case it was left stuck
    forceResetDiscovery();
  }, [fetchProjects, fetchUserUsage]);

  // Single useEffect for initial fetch and polling
  useEffect(() => {
    if (activeProject) {
      // Initial fetch
      fetchLeads(activeProject);
      
      // Set up polling interval
      const interval = setInterval(() => {
        if (activeProject) {
          fetchLeads(activeProject);
        }
      }, 60000); // Poll every 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeProject, fetchLeads]);

  // Fetch leads when switching to leads view
  useEffect(() => {
    if (activeView === 'leads' && activeProject) {
      fetchLeads(activeProject);
    }
  }, [activeView, activeProject, fetchLeads]);

  const leadStats = {
    new: allLeads.filter(l => l.status === 'new').length,
    replied: allLeads.filter(l => l.status === 'replied').length,
    saved: allLeads.filter(l => l.status === 'saved').length,
    all: allLeads.length,
    ignored: allLeads.filter(l => l.status === 'ignored').length,
  };

  const handleLeadUpdate = (leadId: string, status: Lead['status']) => {
    const updateLeadList = (list: Lead[]) =>
      list.map(lead =>
        lead.id === leadId ? { ...lead, status } : lead
      );
    setLeads(updateLeadList(leads));
    setAllLeads(updateLeadList(allLeads));
  };

  const currentProject = projects.find(c => c.id === activeProject);

  if (error && projects.length === 0) {
    // Check if this is a new user (no projects) vs a real error
    const isNewUser = error.includes('Failed to load projects') && !error.includes('401') && !error.includes('403');
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {isNewUser ? "Welcome to RedditLeads!" : "Dashboard Error"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/80 mb-6">
              {isNewUser 
                ? "You're all set! Create your first project to start finding leads on Reddit."
                : error
              }
            </p>
            <div className="space-y-3">
              {isNewUser ? (
                <Button 
                  onClick={() => {
                    setError(null);
                    setIsLoading(false);
                  }} 
                  className="w-full bg-white text-black"
                >
                  Get Started
                </Button>
              ) : (
                <Button onClick={() => window.location.reload()} className="w-full bg-white text-black">
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Removed blocking loading overlay - discovery runs in background */}
      
      <div className="relative z-10">
        <RedditLeadsHeader />

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-5 right-5 z-50">
          <Button
            onClick={toggleMobileMenu}
            variant="ghost"
            size="icon"
            className="bg-black/50 text-white backdrop-blur-sm rounded-full"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex relative">
          <motion.aside
            animate={{
              width: isMobile ? 260 : (isSidebarCollapsed ? 72 : 260),
              x: isMobile ? (isMobileMenuOpen ? 0 : -260) : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`flex-shrink-0 border-r border-white/10 bg-black/60 backdrop-blur-lg z-40 h-screen top-0 ${isMobile ? 'fixed' : 'sticky'}`}
            style={{ minWidth: isMobile ? undefined : (isSidebarCollapsed ? 72 : 260) }}
          >
            <DashboardSidebar
              projects={projects.map(c => ({
                ...c,
                isActive: c.id === activeProject
              }))}
              activeProject={activeProject}
              setActiveProject={setActiveProject}
              activeFilter={activeFilter ?? "all"}
              setActiveFilter={(filter) => {
                setActiveFilter(filter as Lead['status'] | 'all');
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              stats={leadStats}
              isCollapsed={isMobile ? false : isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              activeView={activeView}
              setActiveView={(view) => {
                setActiveView(view);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              isMobile={isMobile}
            />
          </motion.aside>

          <AnimatePresence>
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-30"
              />
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-h-screen relative bg-black/80 px-0 py-0">
            {/* Lead Limit Exceeded Banner */}
            {isLeadLimitExceeded && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/20 border-l-4 border-orange-500 p-4 mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-2xl"
                    >
                      🔒
                    </motion.div>
                    <div>
                      <h3 className={`text-orange-400 font-bold ${poppins.className}`}>
                        Lead Limit Exceeded
                      </h3>
                      <p className={`text-orange-300 text-sm ${inter.className}`}>
                        You've reached your monthly lead limit. You can view your existing leads but cannot generate new ones.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/pricing')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative z-10"
                >
                  <AnalyticalDashboard projects={projects} activeProject={activeProject} leadStats={leadStats} allLeads={allLeads} />
                </motion.div>
              ) : (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="p-2 sm:p-4 md:p-8 relative z-10 max-w-7xl mx-auto w-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-5 md:mb-8 gap-4 md:gap-8"
                  >
                    <div className="space-y-2">
                      <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white ${poppins.className}`}>
                        Lead <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Management</span>
                      </h1>
                      <p className={`text-white/70 text-base sm:text-lg ${inter.className} font-medium`}>
                        Discover and manage potential customers from Reddit
                      </p>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                      <Button 
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20
                          h-9 sm:h-10 px-4 text-sm sm:text-base font-semibold transition rounded-lg flex items-center
                        "
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Leads
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Discovery Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-6 sm:mb-8"
                  >
                    {(() => {
                      return activeProject ? (
                        <div className="relative">
                          <DiscoveryButtons
                            projectId={activeProject}
                            targetSubreddits={currentProject?.targetSubreddits || []}
                            onLeadsDiscovered={handleLeadsDiscovered}
                            lastDiscoveryAt={currentProject?.lastManualDiscoveryAt ? new Date(currentProject.lastManualDiscoveryAt) : null}
                            isDiscoveryRunning={isRunningDiscovery}
                            onDiscoveryStart={() => {
                              console.log('🚀 [DashBoardLayout] Discovery started');
                              setIsRunningDiscovery(true);
                            }}
                            onDiscoveryComplete={() => {
                              console.log('✅ [DashBoardLayout] Discovery completed');
                              setIsRunningDiscovery(false);
                              fetchLeads(activeProject);
                              fetchUserUsage();
                            }}
                            disabled={isLeadLimitExceeded}
                          />
                          
                          {/* Upgrade Lock Overlay - Only covers discovery section */}
                          {isLeadLimitExceeded && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
                            >
                              <div className="text-center p-6">
                                <motion.div
                                  animate={{ 
                                    rotate: [0, 10, -10, 10, -10, 0],
                                    scale: [1, 1.1, 1, 1.1, 1]
                                  }}
                                  transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="text-6xl mb-4"
                                >
                                  🔒
                                </motion.div>
                                <h3 className={`text-xl font-bold text-white mb-2 ${poppins.className}`}>
                                  Lead Limit Exceeded
                                </h3>
                                <p className={`text-white/70 mb-4 ${inter.className}`}>
                                  You've reached your monthly lead limit. Upgrade your plan to discover more leads.
                                </p>
                                <Button
                                  onClick={() => router.push('/pricing')}
                                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg"
                                >
                                  Upgrade Plan
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-white/70 mb-4">Please select a project to start discovery</p>
                          <Button 
                            onClick={() => {
                              // Navigate to projects page
                              router.push('/dashboard/projects');
                            }}
                            className="bg-white text-black hover:bg-white/90"
                          >
                            Go to Projects
                          </Button>
                        </div>
                      );
                    })()}
                    
                    {/* Reset Discovery State Button */}
                    {isRunningDiscovery && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center"
                      >
                        <Button
                          onClick={forceResetDiscovery}
                          className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20
                            h-8 px-3 text-xs font-medium transition rounded-lg"
                        >
                          Force Reset Discovery
                        </Button>
                      </motion.div>
                    )}
                    
                  </motion.div>

                  {/* The Main Lead Feed */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {isLoading ? (
                      <LoadingState 
                        message={projects.length === 0 ? "Setting up your dashboard..." : "Loading your projects..."}
                        size="lg"
                        className="py-8"
                      />
                    ) : (
                      <>
                        {/* Welcome message for new users */}
                        {projects.length === 0 && !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                          >
                            <div className="max-w-md mx-auto">
                              <div className="text-6xl mb-4">🚀</div>
                              <h3 className="text-2xl font-bold text-white mb-4">Welcome to RedditLeads!</h3>
                              <p className="text-white/70 mb-6">
                                You're all set! Create your first project to start finding high-quality leads on Reddit.
                              </p>
                              <Button 
                                onClick={() => {
                                  // Navigate to the projects page
                                  router.push('/dashboard/projects');
                                }}
                                className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                              >
                                Create Your First Project
                              </Button>
                            </div>
                          </motion.div>
                        )}

                        {/* Lead Batching Message */}
                        {leadBatchingMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <p className="text-sm text-blue-700 font-medium">
                              {leadBatchingMessage}
                            </p>
                          </motion.div>
                        )}
                        
                        {projects.length > 0 && (
                          <LeadFeed
                            leads={leads}
                            isRunningDiscovery={isRunningDiscovery}
                            onDelete={handleLeadDelete}
                            onLeadUpdate={handleLeadUpdate}
                            activeFilter={activeFilter ?? "all"}
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <ReplyModal
        isOpen={isReplyModalOpen}
        onClose={onReplyModalClose}
        lead={replyModalLead}
        onLeadUpdate={handleLeadUpdate}
      />
      <DeleteLeadsModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        projectId={activeProject ?? ""}
        leadStats={leadStats}
        onLeadsDeleted={handleLeadsDiscovered}
      />

    </div>
  );
};