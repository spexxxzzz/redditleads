"use client";
import React, { useState } from "react";
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Send,
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
} from "lucide-react";
import { motion } from "framer-motion";
import { ReplyModal } from "./ReplyModal";
import { Inter, Poppins } from "next/font/google";

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
  summary?: string | null;
  createdAt: number;
  numComments: number;
  upvoteRatio: number;
  intent: string;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  isGoogleRanked?: boolean;
}

interface Props {
  lead: Lead;
  onUpdate: (leadId: string, status: Lead["status"]) => void;
}

const MIN_WORDS_FOR_SUMMARY = 40;

export const LeadCard = ({ lead, onUpdate }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState(lead.summary);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const wordCount = lead.body?.split(/\s+/).length || 0;
  const canSummarize = wordCount > MIN_WORDS_FOR_SUMMARY && !summary;

  const handleSummarize = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    setSummaryError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/leads/${lead.id}/summarize`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to get summary.');
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "replied":
        return {
          borderColor: "border-l-emerald-500",
          bgColor: "bg-emerald-500/5",
          shadowColor: "shadow-emerald-500/10",
        };
      case "saved":
        return {
          borderColor: "border-l-blue-500",
          bgColor: "bg-blue-500/5",
          shadowColor: "shadow-blue-500/10",
        };
      case "ignored":
        return {
          borderColor: "border-l-gray-500",
          bgColor: "bg-gray-500/5",
          shadowColor: "shadow-gray-500/10",
        };
      default:
        return {
          borderColor: "border-l-orange-500",
          bgColor: "bg-orange-500/5",
          shadowColor: "shadow-orange-500/10",
        };
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const getOpportunityConfig = (score: number) => {
    if (score >= 70) return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
    if (score >= 40) return {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
    return {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    };
  };

  const getIntentConfig = (intent: string) => {
    switch (intent) {
      case "solution_seeking":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          label: "Solution Seeking"
        };
      case "pain_point":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          label: "Pain Point"
        };
      case "information_seeking":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          label: "Information Seeking"
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          label: intent.replace("_", " ")
        };
    }
  };

  const statusConfig = getStatusConfig(lead.status);
  const opportunityConfig = getOpportunityConfig(lead.opportunityScore);
  const intentConfig = getIntentConfig(lead.intent);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -1 }}
        className={`group relative overflow-hidden rounded-xl border ${statusConfig.borderColor} ${statusConfig.bgColor} ${statusConfig.shadowColor} shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-xl`}
      >
        {/* Status Indicator */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"></div>
        
        {/* Google Ranked Badge */}
        {lead.isGoogleRanked && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium text-xs border border-blue-500/20 backdrop-blur-sm">
              <Globe2 className="w-3 h-3" />
              <span>Ranked</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-4">
          {/* Header with Metadata */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  r
                </div>
                <span className={`font-medium text-white hover:text-orange-400 cursor-pointer transition-colors text-sm ${poppins.className}`}>
                  {lead.subreddit}
                </span>
              </div>
              <div className="text-gray-500 text-xs">•</div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <User className="w-3 h-3" />
                <span>{lead.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{getTimeAgo(lead.createdAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-base font-bold text-white mb-2 leading-tight hover:text-orange-400 cursor-pointer transition-colors ${poppins.className}`}>
            {lead.title}
          </h3>

          {/* Metrics Row */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${opportunityConfig.bg} ${opportunityConfig.color} border ${opportunityConfig.border} text-xs font-medium`}>
              <Target className="w-2.5 h-2.5" />
              <span>{lead.opportunityScore}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-full ${intentConfig.bg} ${intentConfig.color} border ${intentConfig.border} text-xs font-medium`}>
              {intentConfig.label}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-300 border border-gray-500/20 text-xs">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>{Math.round((lead.upvoteRatio || 0) * 100)}%</span>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mb-2">
            {lead.body ? (
              <div className="text-gray-300 leading-relaxed text-sm">
                <p className={isExpanded ? "" : "line-clamp-2"}>
                  {isExpanded ? lead.body : 
                    (lead.body.length > 180 ? `${lead.body.substring(0, 180)}...` : lead.body)
                  }
                </p>
                {lead.body.length > 180 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 mt-1 text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        More
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No content available</p>
            )}
          </div>

          {/* AI Summary Section */}
          {summary && (
            <div className="mb-2 p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
              <div className="flex items-center gap-1.5 mb-1">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
            <button
              onClick={() => setShowReplyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>

            {canSummarize && (
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 text-xs"
              >
                {isSummarizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{isSummarizing ? 'Working...' : 'Summary'}</span>
              </button>
            )}

            <button
              onClick={() => onUpdate(lead.id, lead.status === "saved" ? "new" : "saved")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border text-xs ${
                lead.status === "saved"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20"
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={lead.status === "saved" ? "currentColor" : "none"}
              />
              <span>{lead.status === "saved" ? "Saved" : "Save"}</span>
            </button>

            <div className="flex items-center gap-1 ml-auto">
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View</span>
              </a>
              <button className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lead.numComments}</span>
              </button>
              <button
                onClick={() => onUpdate(lead.id, "ignored")}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200"
              >
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
