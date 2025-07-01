"use client";
import React from 'react';
import { Inbox, Send, Bookmark, TrendingUp, Settings, ChevronDown, Users, Target, BarChart3 } from 'lucide-react';

interface Campaign {
  id: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
  targetSubreddits: string[];
}

interface Props {
  campaigns: Campaign[];
  activeCampaign: string | null;
  setActiveCampaign: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  stats: { new: number; replied: number; saved: number; all: number };
}

const FilterButton = ({ icon: Icon, label, count, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive 
        ? 'bg-[#ff4500] text-white shadow-lg' 
        : 'text-gray-300 hover:bg-[#272729] hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
      isActive 
        ? 'bg-white/20 text-white' 
        : 'bg-[#343536] text-gray-400'
    }`}>
      {count}
    </span>
  </button>
);

export const DashboardSidebar = ({ 
  campaigns, 
  activeCampaign, 
  setActiveCampaign, 
  activeFilter, 
  setActiveFilter, 
  stats 
}: Props) => {
  return (
    <div className="sticky top-20 space-y-4">
      
      {/* Lead Filters */}
      <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-[#ff4500]" />
          Inbox
        </h3>
        <div className="space-y-1">
          <FilterButton 
            icon={TrendingUp} 
            label="New Leads" 
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
            label="All Leads" 
            count={stats.all} 
            isActive={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')} 
          />
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#ff4500]" />
            Campaigns
          </h3>
          <button className="text-xs text-[#ff4500] font-medium hover:text-[#ff6b35]">
            Manage
          </button>
        </div>
        
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No campaigns found</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  activeCampaign === campaign.id 
                    ? 'bg-[#ff4500]/10 border border-[#ff4500]/30' 
                    : 'hover:bg-[#272729]'
                }`}
                onClick={() => setActiveCampaign(campaign.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm truncate">
                    {new URL(campaign.analyzedUrl).hostname}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {campaign.generatedKeywords.slice(0, 3).map((keyword) => (
                    <span 
                      key={keyword} 
                      className="px-2 py-1 text-xs bg-[#343536] text-gray-300 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                  {campaign.generatedKeywords.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-[#343536] text-gray-400 rounded-full">
                      +{campaign.generatedKeywords.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-gray-400">
                  {campaign.targetSubreddits.length} subreddits monitored
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      // Around lines 151-165, replace the Quick Actions section:

{/* Navigation & Quick Actions */}
<div className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-4">
  <h3 className="text-sm font-bold text-white mb-3">Navigation</h3>
  <div className="space-y-2">
    <a
      href="/dashboard/insights"
      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#272729] hover:text-white rounded-lg transition-colors flex items-center gap-2"
    >
      <TrendingUp className="w-3 h-3" />
      Market Intel
    </a>
    <a
      href="/dashboard/performance"
      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#272729] hover:text-white rounded-lg transition-colors flex items-center gap-2"
    >
      <BarChart3 className="w-3 h-3" />
      Performance
    </a>
    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#272729] hover:text-white rounded-lg transition-colors">
      Manual Discovery
    </button>
    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#272729] hover:text-white rounded-lg transition-colors">
      Export Leads
    </button>
    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#272729] hover:text-white rounded-lg transition-colors flex items-center gap-2">
      <Settings className="w-3 h-3" />
      Settings
    </button>
  </div>
</div>
    </div>
  );
};