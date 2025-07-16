"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, RefreshCw, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '@/lib/api';
import { Inter, Poppins } from 'next/font/google';
import { RedLeadHeader } from './DashboardHeader';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

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
  const { getToken } = useAuth(); // Get the getToken function from Clerk
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debugLog = (message: string, data?: any) => {
    console.log(`🔍 [Dashboard Debug] ${message}`, data);
  };

  const fetchCampaigns = useCallback(async () => {
    try {
      debugLog('Fetching campaigns for current user...');
      const token = await getToken();
      const data = await api.getCampaigns(token);
      setCampaigns(data);
      if (data.length > 0 && !activeCampaign) {
        setActiveCampaign(data[0].id);
      }
    } catch (err: any) {
      console.error('❌ Error fetching campaigns:', err);
      setError(`Failed to load campaigns: ${err.message}`);
    }
  }, [getToken, activeCampaign]);

  const fetchLeads = useCallback(async (campaignId: string) => {
    setIsLoading(true);
    try {
      debugLog('Fetching leads for campaign:', campaignId);
      const token = await getToken();
      
      const allLeadsResponse = await api.getLeads(campaignId, {
        intent: intentFilter,
        sortBy,
        sortOrder,
        page: 1,
        limit: 1000,
      }, token);
      
      setAllLeads(allLeadsResponse.data || []);
      
      let filteredLeads = allLeadsResponse.data || [];
      
      if (activeFilter !== "all") {
        filteredLeads = filteredLeads.filter((lead: Lead) => {
          const status = lead.status || 'new';
          return status === activeFilter;
        });
      }
      
      setLeads(filteredLeads);
      debugLog('All leads received:', allLeadsResponse.data);
      debugLog('Filtered leads for display:', filteredLeads);
      
    } catch (err: any) {
      console.error('❌ Error fetching leads:', err);
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await fetchCampaigns();
    };
    loadData();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (activeCampaign) {
      fetchLeads(activeCampaign);
    }
  }, [activeCampaign, fetchLeads]);

  const leadStats = {
    new: allLeads.filter(l => (l.status || 'new') === 'new').length,
    replied: allLeads.filter(l => l.status === 'replied').length,
    saved: allLeads.filter(l => l.status === 'saved').length,
    all: allLeads.length
  };

  const handleLeadUpdate = async (leadId: string, status: Lead['status']) => {
    try {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));
      
      setAllLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));
      
      if (activeFilter !== "all" && status !== activeFilter) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
      }
      
      if(status){
        const token = await getToken();
        await api.updateLeadStatus(leadId, status, token);
      }
   
    } catch (err: any) {
      if (activeCampaign) fetchLeads(activeCampaign);
    }
  };

  if (error && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className={`text-lg font-semibold text-white mb-2 ${poppins.className}`}>Error Loading Dashboard</h2>
            <p className={`text-gray-400 text-sm mb-4 ${inter.className}`}>{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-full blur-3xl opacity-30" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 25, 0], scale: [1, 0.9, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }} className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-white/3 to-white/1 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10">
        <RedLeadHeader />
        <div className="flex pt--2 pb--1">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, width: isSidebarCollapsed ? 80 : 280 }} transition={{ duration: 0.3 }} className="flex-shrink-0 border-r border-gray-800 bg-black/50">
            {/* The user prop will be passed from a higher-level component or context */}
            <DashboardSidebar campaigns={campaigns} activeCampaign={activeCampaign} setActiveCampaign={setActiveCampaign} activeFilter={activeFilter} setActiveFilter={setActiveFilter} stats={leadStats} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
          </motion.aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="all">All Intents</option>
                <option value="solution_seeking">Solution Seeking</option>
                <option value="pain_point">Pain Point</option>
                <option value="brand_comparison">Brand Comparison</option>
              </select>
              <div className="flex items-center gap-2 ml-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="opportunityScore">Opportunity Score</option>
                  <option value="postedAt">Most Recent</option>
                  <option value="upvoteRatio">Upvotes</option>
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700">
                  {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className={`text-gray-400 text-sm ${inter.className}`}>Loading leads...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="feed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <LeadFeed 
                    leads={leads} 
                    onLeadUpdate={handleLeadUpdate} 
                    onManualDiscovery={handleManualDiscovery} 
                    isRunningDiscovery={isRunningDiscovery}
                    currentFilter={activeFilter}
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