"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadCard } from './LeadCard';
import { RefreshCw, Inbox, Send, Bookmark } from 'lucide-react';
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
  activeFilter: string; // Add this prop
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

const emptyStateMessages = {
  new: {
    icon: Inbox,
    title: "No new leads",
    message: "Your inbox is clear. Run a discovery to find new leads.",
  },
  replied: {
    icon: Send,
    title: "No replied leads",
    message: "You haven't replied to any leads yet. Engage with a new lead!",
  },
  saved: {
    icon: Bookmark,
    title: "No saved leads",
    message: "You haven't saved any leads. Save interesting leads for later.",
  },
  all: {
    icon: Inbox,
    title: "No leads found",
    message: "Run a discovery to start finding leads for your campaign.",
  },
};


export const LeadFeed: React.FC<LeadFeedProps> = ({ 
  leads, 
  onManualDiscovery, 
  isRunningDiscovery,
  onLeadUpdate,
  isLoading = false,
  activeFilter 
}) => {
  if (isLoading) {
    return <LoadingLeads />;
  }

  // Show empty state
  if (leads.length === 0) {
    const { icon: Icon, title, message } = emptyStateMessages[activeFilter as keyof typeof emptyStateMessages] || emptyStateMessages.all;

    return (
      <div className="min-h-screen bg-black">
        <div className="text-center py-20">
          <Icon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
            {title}
          </h3>
          <p className={`text-gray-400 mt-2 ${inter.className}`}>
            {message}
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