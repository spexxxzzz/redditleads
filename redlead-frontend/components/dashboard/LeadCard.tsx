"use client";
import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, Share, MoreHorizontal, Send, ExternalLink, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReplyModal } from './ReplyModal';

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
  lead: Lead;
  onUpdate: (leadId: string, status: Lead['status']) => void;
}

export const LeadCard = ({ lead, onUpdate }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'new':
        return 'border-l-[#ff4500]';
      case 'replied':
        return 'border-l-green-500';
      case 'saved':
        return 'border-l-blue-500';
      case 'ignored':
        return 'border-l-gray-600';
      default:
        return 'border-l-[#ff4500]';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - (timestamp * 1000);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-400/10';
    if (score >= 40) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'solution_seeking':
        return 'text-green-400 bg-green-400/10';
      case 'pain_point':
        return 'text-orange-400 bg-orange-400/10';
      case 'information_seeking':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const estimatedUpvotes = Math.round((lead.numComments || 0) * (lead.upvoteRatio || 0.5) * 3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-[#1a1a1b] border-l-4 ${getStatusStyles(lead.status)} rounded-lg hover:bg-[#1e1e1f] transition-all duration-200 group`}
      >
        <div className="flex">
          {/* Voting Section */}
          <div className="flex flex-col items-center p-3 bg-[#161617] rounded-l-lg border-r border-[#343536]">
            <button className="p-1 rounded hover:bg-[#ff4500]/10 text-gray-400 hover:text-[#ff4500] transition-colors">
              <ArrowBigUp className="w-5 h-5" fill="currentColor" />
            </button>
            <span className="text-sm font-bold text-white my-1">{estimatedUpvotes}</span>
            <button className="p-1 rounded hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors">
              <ArrowBigDown className="w-5 h-5" fill="currentColor" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-4 flex-grow">
            {/* Header with metadata */}
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <span className="font-bold text-white hover:text-[#ff4500] cursor-pointer">
                r/{lead.subreddit}
              </span>
              <span>•</span>
              <span>Posted by u/{lead.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeAgo(lead.createdAt)}
              </span>
            </div>

            {/* Scoring and Intent Tags */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getOpportunityColor(lead.opportunityScore)}`}>
                <Target className="w-3 h-3" />
                {lead.opportunityScore}/100 opportunity
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(lead.intent)}`}>
                {lead.intent.replace('_', ' ')}
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-300">
                {Math.round((lead.upvoteRatio || 0) * 100)}% upvoted
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 hover:text-[#ff4500] cursor-pointer leading-tight">
              {lead.title}
            </h3>

            {/* Content Preview */}
            <div className="text-sm text-gray-300 leading-relaxed mb-3">
              {lead.body ? (
                <>
                  {isExpanded ? (
                    <p>{lead.body}</p>
                  ) : (
                    <p className="line-clamp-2">
                      {lead.body.length > 200 
                        ? `${lead.body.substring(0, 200)}...` 
                        : lead.body
                      }
                    </p>
                  )}
                  {lead.body.length > 200 && (
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[#ff4500] hover:text-[#ff6b35] text-xs font-medium mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">No content preview available</p>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
              <button className="flex items-center gap-1.5 hover:bg-[#272729] p-2 rounded-md transition-colors hover:text-white">
                <MessageSquare className="w-4 h-4" />
                <span>{lead.numComments} Comments</span>
              </button>

              {/* UPDATED: Now opens the reply modal instead of just changing status */}
              <button 
                onClick={() => setShowReplyModal(true)}
                className="flex items-center gap-1.5 hover:bg-[#ff4500]/10 hover:text-[#ff4500] p-2 rounded-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>AI Reply</span>
              </button>

              <button 
                onClick={() => onUpdate(lead.id, lead.status === 'saved' ? 'new' : 'saved')}
                className={`flex items-center gap-1.5 p-2 rounded-md transition-colors ${
                  lead.status === 'saved' 
                    ? 'text-blue-400 bg-blue-500/10' 
                    : 'hover:bg-blue-500/10 hover:text-blue-400'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={lead.status === 'saved' ? 'currentColor' : 'none'} />
                <span>{lead.status === 'saved' ? 'Saved' : 'Save'}</span>
              </button>

              <a 
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:bg-[#272729] p-2 rounded-md transition-colors hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Post</span>
               </a>

              <button 
                onClick={() => onUpdate(lead.id, 'ignored')}
                className="hover:bg-[#272729] p-2 rounded-md transition-colors hover:text-white"
              >
                <MoreHorizontal className="w-4 h-4" />
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