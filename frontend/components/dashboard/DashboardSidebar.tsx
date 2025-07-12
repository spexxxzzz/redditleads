"use client";
import React, { useState } from 'react';
import { 
  Inbox, 
  Send, 
  Bookmark, 
  TrendingUp, 
  Settings, 
  ChevronRight, 
  Users, 
  Target, 
  BarChart3, 
  Zap, 
  Eye,
  ChevronDown,
  ChevronLeft,
  User,
  Crown
} from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'] 
});

interface Campaign {
  id: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
  targetSubreddits: string[];
}

interface UserInfo {
  name: string;
  email: string;
  avatar: string;
  plan: string;
  planColor: string;
}

interface Props {
  campaigns: Campaign[];
  activeCampaign: string | null;
  setActiveCampaign: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  stats: { new: number; replied: number; saved: number; all: number };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user: UserInfo;
}

export const DashboardSidebar = ({ 
  campaigns, 
  activeCampaign, 
  setActiveCampaign, 
  activeFilter, 
  setActiveFilter, 
  stats,
  isCollapsed,
  setIsCollapsed,
  user
}: Props) => {
  const [expandedSections, setExpandedSections] = useState({
    inbox: true,
    campaigns: false,
    actions: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    if (isCollapsed) return;
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterButton = ({ icon: Icon, label, count, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 text-sm transition-colors rounded ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
      title={isCollapsed ? `${label} (${count})` : ''}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {!isCollapsed && <span className={inter.className}>{label}</span>}
      </div>
      {!isCollapsed && (
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-700 text-gray-300'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const SectionHeader = ({ icon: Icon, title, isExpanded, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors`}
      title={isCollapsed ? title : ''}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {!isCollapsed && <span className={`text-sm font-medium ${poppins.className}`}>{title}</span>}
      </div>
      {!isCollapsed && (
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      )}
    </button>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* User Profile Section with Collapse Button */}
      <div className="border-b border-gray-800 p-4">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${user.planColor} rounded-full border-2 border-gray-900 flex items-center justify-center`}>
                {user.plan === 'Pro' && <Crown className="w-1.5 h-1.5 text-white" />}
                {user.plan === 'Free' && <User className="w-1.5 h-1.5 text-white" />}
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className={`absolute -top-1 -right-1 w-4 h-4 ${user.planColor} rounded-full border-2 border-gray-900 flex items-center justify-center`}>
                {user.plan === 'Pro' && <Crown className="w-2 h-2 text-white" />}
                {user.plan === 'Free' && <User className="w-2 h-2 text-white" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium text-white truncate ${poppins.className}`}>
                {user.name}
              </p>
              <p className={`text-xs text-gray-400 truncate ${inter.className}`}>
                {user.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.planColor} text-white`}>
                  {user.plan}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Inbox Section */}
        <div className="border-b border-gray-800 pb-4">
          <SectionHeader
            icon={Inbox}
            title="Inbox"
            isExpanded={expandedSections.inbox}
            onClick={() => toggleSection('inbox')}
          />
          <AnimatePresence>
            {expandedSections.inbox && !isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1"
              >
                <FilterButton 
                  icon={Zap} 
                  label="New" 
                  count={stats.new} 
                  isActive={activeFilter === 'new'} 
                  onClick={() => setActiveFilter('new')} 
                />
                <FilterButton 
                  icon={Send} 
                  label="Replied" 
                  count={stats.replied} 
                  isActive={activeFilter === 'replied'} 
                  onClick={() => setActiveFilter('replied')} 
                />
                <FilterButton 
                  icon={Bookmark} 
                  label="Saved" 
                  count={stats.saved} 
                  isActive={activeFilter === 'saved'} 
                  onClick={() => setActiveFilter('saved')} 
                />
                <FilterButton 
                  icon={Users} 
                  label="All" 
                  count={stats.all} 
                  isActive={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')} 
                />
              </motion.div>
            )}
            {/* Collapsed state filters */}
            {isCollapsed && (
              <div className="mt-2 space-y-1">
                <FilterButton 
                  icon={Zap} 
                  label="New" 
                  count={stats.new} 
                  isActive={activeFilter === 'new'} 
                  onClick={() => setActiveFilter('new')} 
                />
                <FilterButton 
                  icon={Send} 
                  label="Replied" 
                  count={stats.replied} 
                  isActive={activeFilter === 'replied'} 
                  onClick={() => setActiveFilter('replied')} 
                />
                <FilterButton 
                  icon={Bookmark} 
                  label="Saved" 
                  count={stats.saved} 
                  isActive={activeFilter === 'saved'} 
                  onClick={() => setActiveFilter('saved')} 
                />
                <FilterButton 
                  icon={Users} 
                  label="All" 
                  count={stats.all} 
                  isActive={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')} 
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Campaigns Section */}
        {!isCollapsed && (
          <div className="border-b border-gray-800 pb-4">
            <SectionHeader
              icon={Target}
              title="Campaigns"
              isExpanded={expandedSections.campaigns}
              onClick={() => toggleSection('campaigns')}
            />
            <AnimatePresence>
              {expandedSections.campaigns && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-2"
                >
                  {campaigns.length === 0 ? (
                    <div className="px-3 py-4 text-center">
                      <p className={`text-gray-500 text-xs ${inter.className}`}>No campaigns</p>
                    </div>
                  ) : (
                    campaigns.map((campaign) => (
                      <div key={campaign.id} className="space-y-1">
                        <button
                          onClick={() => setActiveCampaign(campaign.id)}
                          className={`w-full px-3 py-2 text-left rounded transition-colors ${
                            activeCampaign === campaign.id 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium truncate ${poppins.className}`}>
                              {new URL(campaign.analyzedUrl).hostname}
                            </span>
                            <ChevronDown className="w-3 h-3 flex-shrink-0" />
                          </div>
                        </button>
                        
                        {activeCampaign === campaign.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="px-3 py-2 bg-gray-800/50 rounded text-xs space-y-2"
                          >
                            <div>
                              <p className="text-gray-400 mb-1">Keywords</p>
                              <div className="flex flex-wrap gap-1">
                                {campaign.generatedKeywords.slice(0, 2).map((keyword) => (
                                  <span 
                                    key={keyword} 
                                    className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {campaign.generatedKeywords.length > 2 && (
                                  <span className="px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-xs">
                                    +{campaign.generatedKeywords.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <Eye className="w-3 h-3" />
                              <span>{campaign.targetSubreddits.length} subreddits</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions Section */}
        {!isCollapsed && (
          <div>
            <SectionHeader
              icon={BarChart3}
              title="Actions"
              isExpanded={expandedSections.actions}
              onClick={() => toggleSection('actions')}
            />
            <AnimatePresence>
              {expandedSections.actions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-1"
                >
                  <button className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className={inter.className}>Analytics</span>
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className={inter.className}>Discovery</span>
                  </button>
                  <button className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className={inter.className}>Settings</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
