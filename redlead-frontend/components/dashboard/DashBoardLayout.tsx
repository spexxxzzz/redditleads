"use client";
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, RefreshCw, AlertCircle, BarChart3, Target, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

// Types matching your actual backend models
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
    opportunityScore: number;
    status?: 'new' | 'replied' | 'saved' | 'ignored';
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

const TEST_USER_ID = 'clerk_test_user_123';

export const DashboardLayout = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningDiscovery, setIsRunningDiscovery] = useState(false);
  const [activeFilter, setActiveFilter] = useState('new');
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug function to log what we're receiving
  const debugLog = (message: string, data?: any) => {
    console.log(`🔍 [Dashboard Debug] ${message}`, data);
  };

  // Fetch campaigns for the test user
  const fetchCampaigns = async () => {
    try {
      debugLog('Fetching campaigns for user:', TEST_USER_ID);
      const data = await api.getCampaigns(TEST_USER_ID);
      debugLog('Campaigns received:', data);
      setCampaigns(data);
      
      if (data.length > 0 && !activeCampaign) {
        setActiveCampaign(data[0].id);
        debugLog('Set active campaign to:', data[0].id);
      }
    } catch (err: any) {
      console.error('❌ Error fetching campaigns:', err);
      setError(`Failed to load campaigns: ${err.message}`);
    }
  };
 
  // Fetch leads for the active campaign
  const fetchLeads = async (campaignId: string) => {
    try {
      debugLog('Fetching leads for campaign:', campaignId);
      const data = await api.getLeads(campaignId);
      debugLog('Leads received:', data);
      
      // Handle both array and object responses
      const leadsArray = Array.isArray(data) ? data : data.leads || data.data || [];
      setLeads(leadsArray);
      debugLog('Leads set in state:', leadsArray);
    } catch (err: any) {
      console.error('❌ Error fetching leads:', err);
      setError(`Failed to load leads: ${err.message}`);
      setLeads([]); // Clear leads on error
    }
  };

  // Run manual discovery
  const handleManualDiscovery = async () => {
    if (!activeCampaign) {
      debugLog('No active campaign for manual discovery');
      return;
    }
    
    setIsRunningDiscovery(true);
    try {
      debugLog('Running manual discovery for campaign:', activeCampaign);
      const result = await api.runManualDiscovery(activeCampaign);
      debugLog('Manual discovery result:', result);
      
      // Wait a moment for the backend to process, then refresh leads
      setTimeout(() => {
        fetchLeads(activeCampaign);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error running manual discovery:', err);
      setError(`Manual discovery failed: ${err.message}`);
    } finally {
      setIsRunningDiscovery(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await fetchCampaigns();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Load leads when campaign changes
  useEffect(() => {
    if (activeCampaign) {
      debugLog('Active campaign changed, fetching leads for:', activeCampaign);
      fetchLeads(activeCampaign);
    }
  }, [activeCampaign]);

  // In the filteredLeads calculation, handle missing status
const filteredLeads = leads.filter(lead => {
    const leadStatus = lead.status || 'new'; // Default to 'new' if status is missing
    if (activeFilter === 'all') return true;
    return leadStatus === activeFilter;
  });
  
  // In the leadStats calculation, handle missing status
  const leadStats = {
    new: leads.filter(l => (l.status || 'new') === 'new').length,
    replied: leads.filter(l => l.status === 'replied').length,
    saved: leads.filter(l => l.status === 'saved').length,
    all: leads.length
  };

  // Handle lead status updates
  const handleLeadUpdate = async (leadId: string, status: Lead['status']) => {
    try {
      // Optimistically update UI - add default status if not present
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : { ...lead, status: lead.status || 'new' }
      ));
      
      // Update in backend
      //@ts-expect-error
      await api.updateLeadStatus(leadId, status);
      debugLog('Lead status updated:', { leadId, status });
    } catch (err: any) {
      console.error('❌ Error updating lead status:', err);
      // Revert optimistic update on error
      if (activeCampaign) fetchLeads(activeCampaign);
    }
  };

  if (error && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchCampaigns();
            }}
            className="px-4 py-2 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
            <strong>Debug:</strong> Campaigns: {campaigns.length} | Active: {activeCampaign} | Leads: {leads.length} | Filtered: {filteredLeads.length}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Lead Dashboard</h1>
            <p className="text-gray-400">
              {activeCampaign && campaigns.find(c => c.id === activeCampaign) && (
                <>Monitoring {campaigns.find(c => c.id === activeCampaign)?.targetSubreddits.length} subreddits</>
              )}
            </p>
          </div>
          
          <button
            onClick={handleManualDiscovery}
            disabled={isRunningDiscovery || !activeCampaign}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? 'animate-spin' : ''}`} />
            {isRunningDiscovery ? 'Finding Leads...' : 'Find New Leads'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-96"
                >
                  <div className="text-center">
                    <Loader className="w-8 h-8 text-[#ff4500] animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your leads...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LeadFeed 
                    leads={filteredLeads} 
                    onLeadUpdate={handleLeadUpdate}
                    onManualDiscovery={handleManualDiscovery}
                    isRunningDiscovery={isRunningDiscovery}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <DashboardSidebar 
              campaigns={campaigns}
              activeCampaign={activeCampaign}
              setActiveCampaign={setActiveCampaign}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              stats={leadStats}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};