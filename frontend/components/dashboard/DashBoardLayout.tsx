"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnalyticalDashboard } from './AnalyticalDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, AlertCircle, RefreshCw, Menu, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Inter, Poppins } from 'next/font/google';
import { RedLeadHeader } from './DashboardHeader';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingLeads from '../loading/LoadingLeads';
import PulsatingDotsLoaderDashboard from '../loading/LoadingDashboard';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

// This interface is local to DashboardLayout
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [activeView, setActiveView] = useState<'dashboard' | 'leads'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<Lead['status'] | 'all'>("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Responsive logic
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on mobile, expand on desktop
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
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

  if (error && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <RedLeadHeader />
      
      <div className="flex relative">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            onClick={toggleMobileMenu}
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-50 md:hidden bg-black/80 backdrop-blur-sm border border-zinc-800 text-white hover:bg-zinc-800"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}

        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ 
            opacity: 1, 
            x: isMobile && !isMobileMenuOpen ? -280 : 0,
            width: isSidebarCollapsed ? 80 : 280 
          }} 
          transition={{ duration: 0.3, ease: "easeInOut" }} 
          className={`
            flex-shrink-0 border-r border-zinc-800 bg-black z-40
            ${isMobile ? 'fixed h-full' : 'relative'}
            ${isMobile && isMobileMenuOpen ? 'shadow-2xl' : ''}
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
              // Close mobile menu when filter is selected
              if (isMobile) setIsMobileMenuOpen(false);
            }} 
            stats={leadStats} 
            isCollapsed={isSidebarCollapsed} 
            setIsCollapsed={setIsSidebarCollapsed}
            activeView={activeView}
            setActiveView={(view) => {
              setActiveView(view);
              // Close mobile menu when view is selected
              if (isMobile) setIsMobileMenuOpen(false);
            }}
          />
        </motion.aside>

        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
        
        {/* Main Content */}
        <main className={`
          flex-1 min-h-screen
          ${isMobile ? 'w-full' : ''}
          transition-all duration-300
        `}>
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h1 className={`text-2xl md:text-3xl font-bold tracking-tight text-white ${poppins.className}`}>
                      Lead Management
                    </h1>
                    <p className={`text-gray-400 ${inter.className}`}>
                      Discover and manage potential customers from Reddit
                    </p>
                  </div>
                  <Button 
                    onClick={handleManualDiscovery} 
                    disabled={isRunningDiscovery || !activeCampaign}
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto"
                  >
                    {isRunningDiscovery ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        <span className={inter.className}>Discovering...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span className={inter.className}>Discover Leads</span>
                      </>
                    )}
                  </Button>
                </div>

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
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
