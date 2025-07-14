"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Clock,
  Target,
  FileText,
  Loader2,
  Globe2,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ReplyModal } from "./ReplyModal";
import { Inter, Poppins } from "next/font/google";
import { api } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

interface Props {
  lead: Lead;
  onUpdate: (leadId: string, status: Lead['status']) => void;
  currentFilter: string;
}

const MIN_WORDS_FOR_SUMMARY = 40;

export const LeadCard = ({ lead, onUpdate, currentFilter }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [summary, setSummary] = useState<string | null>(lead.summary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const timeAgo = (timestamp: number) => {
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
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case "solution_seeking":
        return "bg-green-500/10 text-green-400";
      case "pain_point":
        return "bg-red-500/10 text-red-400";
      case "brand_comparison":
        return "bg-blue-500/10 text-blue-400";
      case "information_seeking":
        return "bg-purple-500/10 text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const generateSummary = async () => {
    if (isSummarizing) return;
    
    setIsSummarizing(true);
    setSummaryError(null);
    
    try {
      const response = await api.generateSummary(lead.id);
      setSummary(response.summary);
    } catch (error: any) {
      setSummaryError(error.message || "Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const wordCount = lead.body.split(' ').length;
  const shouldShowSummary = wordCount >= MIN_WORDS_FOR_SUMMARY;

  // Determine which buttons to show based on current filter
  const showSaveButton = currentFilter !== "saved";
  const showIgnoreButton = currentFilter !== "ignored";
  const showReplyButton = currentFilter !== "replied";

  // Add debug logging
  console.log(`Lead ${lead.id} - currentFilter: ${currentFilter}, showIgnoreButton: ${showIgnoreButton}`);

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
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#ff4500]" />
                <span className="text-sm font-medium text-[#ff4500]">
                  r/{lead.subreddit}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="w-3 h-3" />
                <span>u/{lead.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{timeAgo(lead.createdAt)}</span>
            </div>
          </div>

          {/* Title - Clickable */}
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-3 group"
          >
            <h3 className={`text-lg font-bold text-white group-hover:text-[#ff4500] transition-colors duration-200 leading-tight ${poppins.className}`}>
              {lead.title}
            </h3>
          </a>

          {/* Metrics */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span className={`text-sm font-medium ${getOpportunityColor(lead.opportunityScore)}`}>
                {lead.opportunityScore}% opportunity
              </span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(lead.intent)}`}>
              {lead.intent.replace('_', ' ')}
            </div>
          </div>

          {/* Body Content */}
          <div className="mb-4">
            <div className={`text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
              {lead.body}
            </div>
            {lead.body.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#ff4500] hover:text-[#ff6b35] text-sm mt-2 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>

          {/* AI Summary Section */}
          {shouldShowSummary && (
            <div className="mb-4">
              {!summary && !isSummarizing && (
                <button
                  onClick={generateSummary}
                  className="flex items-center gap-2 text-sm text-[#ff4500] hover:text-[#ff6b35] transition-colors"
                >
                  <Star className="w-4 h-4" />
                  Generate AI Summary
                </button>
              )}
              
              {isSummarizing && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating summary...
                </div>
              )}
              
              {summary && (
                <div className="p-3 bg-[#2a2a2b] rounded-lg border border-[#404041]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <Star className="w-2 h-2 text-white" />
                    </div>
                    <h4 className={`text-orange-400 font-medium text-xs ${poppins.className}`}>
                      AI Summary
                    </h4>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed">{summary}</p>
                </div>
              )}

              {summaryError && (
                <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {summaryError}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
            {showReplyButton && (
              <button
                onClick={() => setShowReplyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply
              </button>
            )}
            
            {showSaveButton && (
              <button
                onClick={() => {
                  console.log(`Save button clicked for lead ${lead.id}`);
                  onUpdate(lead.id, 'saved');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#343536] hover:bg-[#404041] text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save
              </button>
            )}
            
            {showIgnoreButton && (
              <button
                onClick={() => {
                  console.log(`Ignore button clicked for lead ${lead.id}`);
                  onUpdate(lead.id, 'ignored');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#343536] hover:bg-[#404041] text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Ignore
              </button>
            )}

            <div className="flex-1" />
            
            <div className="flex items-center gap-2">
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-[#ff4500] text-sm transition-colors"
              >
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
        onLeadUpdate={onUpdate}
      />
    </>
  );
};