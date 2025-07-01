"use client";
import React from 'react';
import { LeadCard } from './LeadCard';
import { RefreshCw } from 'lucide-react';

 // Update the Lead interface to match
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

interface Props {
  leads: Lead[];
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
  onManualDiscovery: () => void;
  isRunningDiscovery: boolean;
}

export const LeadFeed = ({ leads, onLeadUpdate, onManualDiscovery, isRunningDiscovery }: Props) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 bg-[#343536] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
        <p className="text-gray-400 mb-6">
          Run a manual discovery to find new opportunities or check back later.
        </p>
        <button 
          onClick={onManualDiscovery}
          disabled={isRunningDiscovery}
          className="inline-flex items-center gap-2 px-6 py-2 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? 'animate-spin' : ''}`} />
          {isRunningDiscovery ? 'Finding Leads...' : 'Find New Leads'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map(lead => (
        <LeadCard 
          key={lead.id} 
          lead={lead} 
          onUpdate={onLeadUpdate}
         
        />
      ))}
    </div>
  );
};