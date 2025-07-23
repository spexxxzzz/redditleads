"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnalyticalDashboard } from './AnalyticalDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Inter, Poppins } from 'next/font/google';
import { RedLeadHeader } from './DashboardHeader';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PulsatingDotsLoaderDashboard from '../loading/LoadingDashboard';
import { DeleteLeadsModal } from "./DeleteLead";
import { DiscoveryButtons } from './DiscoveryOptions';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900']
});

// Interface definitions remain the same...
interface Lead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  numComments: number;
  upvoteRatio: number;
  intent: string;
  summary?: string | null;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
}

interface Campaign {
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
  _count?: {
    leads: number;
  };
}

export const DashboardLayout = () => {
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // 🎯 Default to minimized
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [activeView, setActiveView] = useState<'dashboard' | 'leads'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<Lead['status'] | 'all'>("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Updated responsive logic to keep sidebar minimized by default
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
      // 🎯 Removed the else block that was expanding sidebar on desktop
      // Now sidebar stays minimized by default on all screen sizes
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await api.getCampaigns(token);
      setCampaigns(data || []);
      if (data && data.length > 0 && !activeCampaign) {
        setActiveCampaign(data[0].id);
      } else if (!data || data.length === 0) {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(`Failed to load campaigns: ${err.message}`);
    }
  }, [getToken, activeCampaign]);

  const fetchLeads = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const allLeadsResponse = await api.getLeads(campaignId, {
        intent: intentFilter,
        sortBy,
        sortOrder,
        page: 1,
        limit: 1000,
      }, token);
      
      const leadsData: Lead[] = (allLeadsResponse.data || []).map((lead: any) => ({
          ...lead,
          status: lead.status || 'new'
      }));
      setAllLeads(leadsData);
      
      if (activeFilter !== "all") {
        setLeads(leadsData.filter((lead) => lead.status === activeFilter));
      } else {
        setLeads(leadsData);
      }
    } catch (err: any) {
      setError(`Failed to load leads: ${err.message}`);
      setLeads([]);
      setAllLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, activeFilter, intentFilter, sortBy, sortOrder]);

  const handleManualDiscovery = async () => {
    if (!activeCampaign) return;
    setIsRunningDiscovery(true);
    try {
      const token = await getToken();
      await api.runManualDiscovery(activeCampaign, token);
      setTimeout(() => fetchLeads(activeCampaign), 2000);
    } catch (err: any) {
      setError(`Manual discovery failed: ${err.message}`);
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  const handleLeadsDiscovered = () => {
    if (activeCampaign) {
      fetchLeads(activeCampaign);
      fetchCampaigns();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (activeCampaign) {
      fetchLeads(activeCampaign);
    }
  }, [activeCampaign, fetchLeads, activeFilter]);

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

  const currentCampaign = campaigns.find(c => c.id === activeCampaign);

  if (error && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-black" style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        transform: 'translateZ(0)',
        willChange: 'scroll-position'
      }}>
        {/* Hero-inspired Background Effects */}
        <div className="absolute inset-0 z-5">
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
          
          {/* Subtle Orange Glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[600px] h-[600px] bg-gradient-radial from-orange-400/10 via-orange-300/5 to-transparent rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md"
          >
            <Card className="bg-black/60 backdrop-blur-sm border border-white/10 shadow-2xl shadow-orange-500/10">
              <CardHeader>
                <CardTitle className={`text-white text-center ${poppins.className} font-bold text-xl`}>
                  Dashboard Error
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className={`text-white/80 mb-6 ${inter.className}`}>{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-white text-black hover:bg-gray-100 font-semibold transition-colors"
                >
                  <span className={inter.className}>Retry Dashboard</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>
      {/* Hero-inspired Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/60 to-black/30 opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.02),transparent_70%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.01),transparent_70%)] opacity-40"></div>
        
        {/* Ambient Orange Glow */}
        <div className="absolute top-1/3 right-1/4 transform">
          <div className="w-[400px] h-[400px] bg-gradient-radial from-orange-400/8 via-orange-300/4 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 transform">
          <div className="w-[300px] h-[300px] bg-gradient-radial from-orange-500/6 via-orange-400/3 to-transparent rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="relative z-10">
        <RedLeadHeader />
        
        <div className="flex relative">
          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="fixed top-4 left-4 z-50 md:hidden"
            >
              <Button
                onClick={toggleMobileMenu}
                variant="ghost"
                size="sm"
                className="bg-black/80 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
              >
                <span className={`text-sm ${inter.className} font-medium`}>
                  {isMobileMenuOpen ? 'Close' : 'Menu'}
                </span>
              </Button>
            </motion.div>
          )}

          {/* Sidebar - Now defaults to minimized */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ 
              opacity: 1, 
              x: isMobile && !isMobileMenuOpen ? -280 : 0,
              width: isSidebarCollapsed ? 80 : 280 
            }} 
            transition={{ duration: 0.4, ease: "easeOut" }} 
            className={`
              flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-sm z-40
              ${isMobile ? 'fixed h-full' : 'relative'}
              ${isMobile && isMobileMenuOpen ? 'shadow-2xl shadow-orange-500/20' : ''}
            `}
            style={{
              height: isMobile ? '100vh' : 'auto',
              top: isMobile ? 0 : 'auto',
            }}
          >
            <DashboardSidebar 
              campaigns={campaigns} 
              activeCampaign={activeCampaign} 
              setActiveCampaign={setActiveCampaign} 
              activeFilter={activeFilter ?? "all"} 
              setActiveFilter={(filter) => {
                setActiveFilter(filter as Lead['status'] | 'all');
                if (isMobile) setIsMobileMenuOpen(false);
              }} 
              stats={leadStats} 
              isCollapsed={isSidebarCollapsed} 
              setIsCollapsed={setIsSidebarCollapsed}
              activeView={activeView}
              setActiveView={(view) => {
                setActiveView(view);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
            />
          </motion.aside>

          {/* Mobile Overlay */}
          <AnimatePresence>
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              />
            )}
          </AnimatePresence>
          
          {/* Main Content - Now has more space by default */}
          <main className={`
            flex-1 min-h-screen relative
            ${isMobile ? 'w-full' : ''}
            transition-all duration-300
          `}>
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
                  <AnalyticalDashboard 
                    campaigns={campaigns}
                    activeCampaign={activeCampaign}
                    leadStats={leadStats}
                    allLeads={allLeads}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="p-4 md:p-8 relative z-10"
                >
                  {/* Enhanced Header Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6"
                  >
                    <div className="space-y-2">
                      <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-white ${poppins.className}`}>
                        Lead{" "}
                        <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                          Management
                        </span>
                      </h1>
                      <p className={`text-white/70 text-lg ${inter.className} font-medium`}>
                        Discover and manage potential customers from Reddit
                      </p>
                    </div>
                  
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 font-semibold"
                      >
                        <span className={inter.className}>Delete Leads</span>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Discovery Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                  >
                    <DiscoveryButtons
                      campaignId={activeCampaign || ''}
                      targetSubreddits={currentCampaign?.targetSubreddits || []}
                      onLeadsDiscovered={handleLeadsDiscovered}
                      lastDiscoveryAt={currentCampaign?.lastManualDiscoveryAt ? new Date(currentCampaign.lastManualDiscoveryAt) : null}
                    />
                  </motion.div>

                  {/* Content Area */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {isLoading ? (
                      <PulsatingDotsLoaderDashboard/>
                    ) : (
                      <LeadFeed 
                        leads={leads}
                        onManualDiscovery={handleManualDiscovery}
                        isRunningDiscovery={isRunningDiscovery}
                        onLeadUpdate={handleLeadUpdate} 
                        activeFilter={activeFilter ?? "all"}
                      />
                    )}
                  </motion.div>

                  {/* Delete Modal */}
                  <DeleteLeadsModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    campaignId={activeCampaign ?? ""}
                    leadStats={leadStats}
                    onLeadsDeleted={handleLeadsDiscovered}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};
