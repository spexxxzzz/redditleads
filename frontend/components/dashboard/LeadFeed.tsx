"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadCard } from './LeadCard';
import { RefreshCw, Inbox } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';
import LoadingLeads from '../loading/LoadingLeads';

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

interface LeadFeedProps {
  leads: Lead[];
  onManualDiscovery: () => void;
  isRunningDiscovery: boolean;
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
  isLoading?: boolean;
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
  onManualDiscovery, 
  isRunningDiscovery,
  onLeadUpdate,
  isLoading = false
}) => {
  if (isLoading) {
    return <LoadingLeads />;
  }

  // Show empty state
  if (leads.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-20">
          <Inbox className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
            No leads in this view
          </h3>
          <p className={`text-gray-400 mt-2 ${inter.className}`}>
            Try adjusting your filters or run a new discovery.
          </p>
          <button
            onClick={onManualDiscovery}
            disabled={isRunningDiscovery}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? 'animate-spin' : ''}`} />
            {isRunningDiscovery ? 'Discovering...' : 'Run Discovery'}
          </button>
        </div>
      </div>
    );
  }

  // Show leads
  return (
    <div className="min-h-screen bg-black">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-4"
      >
        <AnimatePresence>
          {leads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onStatusChange={onLeadUpdate} 
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
