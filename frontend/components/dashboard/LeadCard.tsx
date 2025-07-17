"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Clock,
  Target,
  Loader2,
  Globe2,
  ChevronDown,
  ChevronUp,
  Star,
  User,
  XCircle,
  BookmarkCheck,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ReplyModal } from "./ReplyModal";
import { Inter, Poppins } from "next/font/google";
import { api } from "@/lib/api";

// Custom ApiError definition
export class ApiError extends Error {
  upgradeRequired?: boolean;
  constructor(message: string, upgradeRequired?: boolean) {
    super(message);
    this.name = "ApiError";
    this.upgradeRequired = upgradeRequired;
  }
}
import { useAuth } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// TYPES
interface Lead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  intent: string;
  summary?: string | null;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  numComments: number;
  upvoteRatio: number;
}

interface Props {
  lead: Lead;
  // onUpdate and currentFilter are no longer needed as the card manages its own state.
}

const MIN_WORDS_FOR_SUMMARY = 40;

export const LeadCard = ({ lead }: Props) => {
  const { getToken } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [summary, setSummary] = useState<string | null>(lead.summary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // ✅ Status Management: Local state for status and loading indicators
  const [status, setStatus] = useState<Lead['status']>(lead.status || 'new');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);


  const timeAgo = (timestamp: number) => {
    // ... (timeAgo function remains the same)
    const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getOpportunityColor = (score: number) => {
    // ... (getOpportunityColor function remains the same)
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getIntentColor = (intent: string) => {
    // ... (getIntentColor function remains the same)
    switch (intent) {
      case "solution_seeking": return "bg-green-500/10 text-green-400";
      case "pain_point": return "bg-red-500/10 text-red-400";
      case "brand_comparison": return "bg-blue-500/10 text-blue-400";
      case "information_seeking": return "bg-purple-500/10 text-purple-400";
      default: return "bg-gray-500/10 text-gray-400";
    }
  };
  
  const getStatusStyle = (s: Lead['status']) => {
    switch (s) {
      case 'saved': return { icon: BookmarkCheck, color: 'bg-blue-500/10 text-blue-400' };
      case 'replied': return { icon: CheckCircle, color: 'bg-green-500/10 text-green-400' };
      case 'ignored': return { icon: XCircle, color: 'bg-gray-500/10 text-gray-400' };
      default: return null;
    }
  };
  const statusStyle = getStatusStyle(status);

  // ✅ Proper Authentication & Loading States for summary
  const generateSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const token = await getToken();
      const response = await api.generateSummary(lead.id, token);
      setSummary(response.summary);
    } catch (error: any) {
      // ✅ Upgrade Integration & Error Handling
      if (error instanceof ApiError && error.upgradeRequired) {
        setShowUpgradeModal(true);
      } else {
        setSummaryError(error.message || "Failed to generate summary.");
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  // ✅ Proper Authentication & Loading States for status updates
  const handleUpdateStatus = async (newStatus: NonNullable<Lead['status']>) => {
    if (isUpdatingStatus) return;
    const previousStatus = status;
    setStatus(newStatus); // Optimistic UI update
    setIsUpdatingStatus(true);
    try {
      const token = await getToken();
      await api.updateLeadStatus(lead.id, newStatus, token);
    } catch (error) {
      console.error("Failed to update status:", error);
      setStatus(previousStatus); // Revert on error
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ Null Safety
  const wordCount = lead.body?.split(' ').length || 0;
  const shouldShowSummary = wordCount >= MIN_WORDS_FOR_SUMMARY;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#1a1a1b] rounded-lg border border-[#343536] hover:border-[#ff4500] transition-all duration-200 overflow-hidden"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Globe2 className="w-4 h-4 text-[#ff4500]" />
                <span className="text-sm font-medium text-[#ff4500]">r/{lead.subreddit}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 truncate">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">u/{lead.author}</span>
              </div>
            </div>
            {/* ✅ Status Indicators */}
            <div className="flex items-center gap-2">
                {statusStyle && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                        <statusStyle.icon className="w-3.5 h-3.5" />
                        {(status ?? 'New').charAt(0).toUpperCase() + (status ?? 'New').slice(1)}
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(lead.createdAt)}</span>
                </div>
            </div>
          </div>

          {/* Title */}
          <a href={lead.url} target="_blank" rel="noopener noreferrer" className="block mb-3 group">
            <h3 className={`text-lg font-bold text-white group-hover:text-[#ff4500] transition-colors duration-200 leading-tight ${poppins.className}`}>
              {lead.title}
            </h3>
          </a>

          {/* Metrics */}
          <div className="flex items-center gap-4 mb-4">
             {/* ... (Metrics JSX remains the same) ... */}
          </div>

          {/* Body Content */}
          {lead.body && (
            <div className="mb-4">
                <div className={`text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>{lead.body}</div>
                {wordCount > 50 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#ff4500] hover:text-[#ff6b35] text-sm mt-2 flex items-center gap-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
          )}

          {/* AI Summary Section */}
          {shouldShowSummary && (
             // ... (AI Summary JSX remains the same, it already has loading states) ...
             <div className="mb-4">
                 {/* ... */}
             </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
            {/* ✅ Button State Logic */}
            {status !== 'replied' && (
              <button onClick={() => setShowReplyModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-lg text-sm font-medium transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
            
            {status === 'saved' ? (
                <button disabled className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium cursor-default">
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Saved
                </button>
            ) : status !== 'ignored' && status !== 'replied' && (
                <button onClick={() => handleUpdateStatus('saved')} disabled={isUpdatingStatus} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#343536] hover:bg-[#404041] text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Bookmark className="w-3.5 h-3.5" />}
                    Save
                </button>
            )}
            
            {status !== 'ignored' && status !== 'replied' && status !== 'saved' && (
                <button onClick={() => handleUpdateStatus('ignored')} disabled={isUpdatingStatus} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#343536] hover:bg-[#404041] text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <XCircle className="w-3.5 h-3.5" />}
                    Ignore
                </button>
            )}

            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <a href={lead.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-400 hover:text-[#ff4500] text-sm transition-colors">
                <ExternalLink className="w-3 h-3" />
                View
              </a>
              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reply Modal */}
      <ReplyModal
        lead={lead}
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onLeadUpdate={(id, newStatus) => setStatus(newStatus)}
      />
      
      {/* TODO: Create an actual Upgrade Modal component */}
      {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg text-white">
                  <h3 className="text-lg font-bold">Upgrade Required</h3>
                  <p>This feature requires a Pro plan.</p>
                  <button onClick={() => setShowUpgradeModal(false)} className="mt-4 px-4 py-2 bg-blue-600 rounded">Close</button>
              </div>
          </div>
      )}
    </>
  );
};