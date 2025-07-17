"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadCard } from './LeadCard';
import { RefreshCw, Inbox } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600']
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

interface LeadFeedProps {
  leads: Lead[];
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
  onManualDiscovery: () => void;
  isRunningDiscovery: boolean;
  currentFilter: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const LeadFeed: React.FC<LeadFeedProps> = ({ 
  leads, 
  onLeadUpdate, 
  onManualDiscovery, 
  isRunningDiscovery,
  currentFilter 
}) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-20">
        <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>No leads found</h3>
        <p className={`text-gray-400 mt-2 ${inter.className}`}>Try adjusting your filters or run a new discovery.</p>
        <button
          onClick={onManualDiscovery}
          disabled={isRunningDiscovery}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? 'animate-spin' : ''}`} />
          {isRunningDiscovery ? 'Discovering...' : 'Run Discovery'}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      <AnimatePresence>
        {leads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};