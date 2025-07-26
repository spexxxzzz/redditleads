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
// CORRECTED: The Lead type is now imported ONLY from the centralized hook
import { useReplyModal, Lead } from '@/hooks/useReplyModal';
import { ReplyModal } from './ReplyModal';
import { Menu, X } from 'lucide-react';
import { TrashIcon } from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900']
});

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [activeView, setActiveView] = useState<'dashboard' | 'leads'>('dashboard');
  const [activeFilter, setActiveFilter] = useState<Lead['status'] | 'all'>("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("opportunityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { isOpen: isReplyModalOpen, lead: replyModalLead, onClose: onReplyModalClose } = useReplyModal();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
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
          id: lead.id,
          title: lead.title,
          author: lead.author,
          subreddit: lead.subreddit,
          url: lead.url,
          body: lead.body,
          createdAt: lead.createdAt,
          intent: lead.intent,
          summary: lead.summary,
          opportunityScore: lead.opportunityScore,
          status: lead.status || 'new',
          numComments: lead.numComments,
          upvoteRatio: lead.upvoteRatio,
          isGoogleRanked: lead.isGoogleRanked ?? false,
      }));
      setAllLeads(leadsData);
      
      if (activeFilter !== "all") {
        setLeads(leadsData.filter((lead) => lead.status === activeFilter));
      } else {
        setLeads(leadsData);
      }
    } catch (err: any) { // CORRECTED: Added the missing opening brace for the catch block
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
  const handleLeadDelete = (leadId: string) => {
    const updateLeadList = (list: Lead[]) => list.filter(lead => lead.id !== leadId);
    setLeads(updateLeadList(leads));
    setAllLeads(updateLeadList(allLeads));
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
    // Error state UI
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Dashboard Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-white/80 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-white text-black">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative z-10">
        <RedLeadHeader />
        
        <div className="flex relative">
          <motion.aside 
            animate={{ x: isMobile && !isMobileMenuOpen ? -280 : 0, width: isSidebarCollapsed ? 80 : 280 }} 
            transition={{ duration: 0.4, ease: "easeOut" }} 
            className={`flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-sm z-40 ${isMobile ? 'fixed h-full' : 'relative'}`}
            style={{ height: isMobile ? '100vh' : 'auto', top: isMobile ? 0 : 'auto' }}
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
          
          <main className={`flex-1 min-h-screen relative ${isMobile ? 'w-full' : ''}`}>
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' ? (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="relative z-10">
                  <AnalyticalDashboard campaigns={campaigns} activeCampaign={activeCampaign} leadStats={leadStats} allLeads={allLeads} />
                </motion.div>
              ) : (
                <motion.div key="leads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: "easeOut" }} className="p-4 md:p-8 relative z-10">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                    <div className="space-y-2">
                      <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-white ${poppins.className}`}>
                        Lead <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Management</span>
                      </h1>
                      <p className={`text-white/70 text-lg ${inter.className} font-medium`}>Discover and manage potential customers from Reddit</p>
                    </div>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                      <Button onClick={() => setShowDeleteModal(true)} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Leads
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
                    <DiscoveryButtons
                      campaignId={activeCampaign || ''}
                      targetSubreddits={currentCampaign?.targetSubreddits || []}
                      onLeadsDiscovered={handleLeadsDiscovered}
                      lastDiscoveryAt={currentCampaign?.lastManualDiscoveryAt ? new Date(currentCampaign.lastManualDiscoveryAt) : null}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    {isLoading ? (
                      <PulsatingDotsLoaderDashboard/>
                    ) : (
                      <LeadFeed 
                        leads={leads}
                        onManualDiscovery={handleManualDiscovery}
                        isRunningDiscovery={isRunningDiscovery}
                        onDelete={handleLeadDelete}
                        onLeadUpdate={handleLeadUpdate} 
                        activeFilter={activeFilter ?? "all"}
                      />
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
        campaignId={activeCampaign ?? ""}
        leadStats={leadStats}
        onLeadsDeleted={handleLeadsDiscovered}
      />
    </div>
  );
};
