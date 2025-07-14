"use client";
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { LeadFeed } from './LeadFeed';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Inter, Poppins } from 'next/font/google';
import { RedLeadHeader } from './DashboardHeader';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'] 
});

// Types (unchanged)
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mock user data - replace with actual user data from your auth system
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format',
    plan: 'Pro',
    planColor: 'bg-yellow-500' // Could be 'bg-green-500' for free, 'bg-purple-500' for enterprise, etc.
  };

  // All existing methods remain the same...
  const debugLog = (message: string, data?: any) => {
    console.log(`🔍 [Dashboard Debug] ${message}`, data);
  };

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

  const fetchLeads = async (campaignId: string) => {
    try {
      debugLog('Fetching leads for campaign:', campaignId);
      const data = await api.getLeads(campaignId);
      debugLog('Leads received:', data);
      
      const leadsArray = Array.isArray(data) ? data : data.leads || data.data || [];
      setLeads(leadsArray);
      debugLog('Leads set in state:', leadsArray);
    } catch (err: any) {
      console.error('❌ Error fetching leads:', err);
      setError(`Failed to load leads: ${err.message}`);
      setLeads([]);
    }
  };

  const handleManualDiscovery = async () => {
    if (!activeCampaign) return;
    
    setIsRunningDiscovery(true);
    try {
      const result = await api.runManualDiscovery(activeCampaign);
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
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeCampaign) fetchLeads(activeCampaign);
  }, [activeCampaign]);

  const filteredLeads = leads.filter(lead => {
    const leadStatus = lead.status || 'new';
    return activeFilter === 'all' || leadStatus === activeFilter;
  });

  const leadStats = {
    new: leads.filter(l => (l.status || 'new') === 'new').length,
    replied: leads.filter(l => l.status === 'replied').length,
    saved: leads.filter(l => l.status === 'saved').length,
    all: leads.length
  };

  const handleLeadUpdate = async (leadId: string, status: Lead['status']) => {
    try {
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status } : lead
      ));
      //@ts-ignore
      await api.updateLeadStatus(leadId, status);
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
            <h2 className={`text-lg font-semibold text-white mb-2 ${poppins.className}`}>
              Error Loading Dashboard
            </h2>
            <p className={`text-gray-400 text-sm mb-4 ${inter.className}`}>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchCampaigns();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div> 
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Black Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
       
        {/* Minimal Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
        {/* Subtle Floating Orbs */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-full blur-3xl opacity-30"
        />
        
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-white/3 to-white/1 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10">
        <RedLeadHeader/>
      
        <div className="flex pt--2 pb--1">
          
          {/* Collapsible Left Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              width: isSidebarCollapsed ? 80 : 280
            }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 border-r border-gray-800 bg-black/50"
          >
            <DashboardSidebar 
              campaigns={campaigns}
              activeCampaign={activeCampaign}
              setActiveCampaign={setActiveCampaign}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              stats={leadStats}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
              user={mockUser}
            />
          </motion.aside>

          {/* Main Content - Takes Remaining Space */}
          <main className="flex-1 p-4">
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
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className={`text-gray-400 text-sm ${inter.className}`}>Loading leads...</p>
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
          </main>
        </div>
      </div>
    </div>
  );
};
