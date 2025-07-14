"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Edit3, Loader, AlertCircle, CheckCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
const TEST_USER_ID = 'clerk_test_user_123'; // Replace with actual user ID logic

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

interface ReplyOption {
  id: string;
  text: string;
  isRefining: boolean;
}

interface Props {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
}

export const ReplyModal = ({ lead, isOpen, onClose, onLeadUpdate }: Props) => {
  const [replyOptions, setReplyOptions] = useState<ReplyOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [copiedReplyId, setCopiedReplyId] = useState<string | null>(null);

  // Generate AI replies
  const generateReplies = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await api.generateReply(lead.id, TEST_USER_ID);
      // Ensure data is an array before mapping
      if (Array.isArray(data)) {
        setReplyOptions(data.map((reply: any) => ({ ...reply, isRefining: false })));
      } else if (data && typeof data === 'object') {
        // If it's a single object, wrap it in an array
        setReplyOptions([{ ...data, isRefining: false }]);
      } else {
        throw new Error("Invalid response format from API.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate replies.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine a specific reply
  const refineReply = async (replyId: string, instruction: string) => {
    setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isRefining: true } : r));
    try {
      const data = await api.refineReply(replyId, instruction);
      setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...data, isRefining: false } : r));
    } catch (err: any) {
      setError(err.message || 'Failed to refine reply.');
      setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isRefining: false } : r));
    }
  };

  // Copy reply to clipboard
  const copyReply = async (replyId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReplyId(replyId);
      setTimeout(() => setCopiedReplyId(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Start editing a reply
  const startEditing = (replyId: string, text: string) => {
    setActiveEditId(replyId);
    setEditText(text);
  };

  // Save edited reply
  const saveEdit = () => {
    if (!activeEditId) return;
    
    setReplyOptions(prev => prev.map(r => 
      r.id === activeEditId ? { ...r, text: editText } : r
    ));
    setActiveEditId(null);
    setEditText('');
  };

  // Handle reply and mark as replied
  const handleReply = (text: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(text);
    
    // Mark lead as replied
    onLeadUpdate(lead.id, 'replied');
    
    // Open Reddit comments in new tab
    window.open(lead.url, '_blank');
    
    // Close modal
    onClose();
  };

  // Generate replies on modal open
  React.useEffect(() => {
    if (isOpen && replyOptions.length === 0) {
      generateReplies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#1a1a1b] rounded-xl border border-[#343536] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#343536]">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#ff4500]" />
            <div>
              <h2 className="text-xl font-bold text-white">AI Reply Generator</h2>
              <p className="text-sm text-gray-400">r/{lead.subreddit} • {lead.author}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#272729] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Original Post */}
          <div className="w-1/3 p-6 border-r border-[#343536] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Original Post</h3>
                <div className="p-4 bg-[#272729] rounded-lg">
                  <h4 className="font-medium text-white mb-2">{lead.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{lead.body}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full bg-orange-500/10 text-orange-400`}>
                  {lead.opportunityScore}/100 opportunity
                </span>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  {lead.intent.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Reply Options */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-[#343536]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">AI-Generated Replies</h3>
                <button
                  onClick={generateReplies}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ff4500] text-white text-sm rounded-lg hover:bg-[#ff5722] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply Options */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader className="w-8 h-8 text-[#ff4500] animate-spin mb-4" />
                  <p className="text-gray-400">Generating AI replies...</p>
                </div>
              ) : (
                <AnimatePresence>
                  {replyOptions.map((reply, index) => (
                    <ReplyOptionCard
                      key={reply.id}
                      reply={reply}
                      lead={lead}
                      index={index}
                      activeEditId={activeEditId}
                      editText={editText}
                      refinementInstruction={refinementInstruction}
                      copiedReplyId={copiedReplyId}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setActiveEditId(null)}
                      onEditTextChange={setEditText}
                      onRefinementChange={setRefinementInstruction}
                      onRefine={refineReply}
                      onCopy={copyReply}
                      onReply={handleReply}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Individual Reply Option Component
interface ReplyOptionCardProps {
  reply: ReplyOption;
  lead: Lead;
  index: number;
  activeEditId: string | null;
  editText: string;
  refinementInstruction: string;
  copiedReplyId: string | null;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onRefinementChange: (text: string) => void;
  onRefine: (id: string, instruction: string) => void;
  onCopy: (id: string, text: string) => void;
  onReply: (text: string) => void;
}

const ReplyOptionCard = ({
  reply,
  lead,
  index,
  activeEditId,
  editText,
  refinementInstruction,
  copiedReplyId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onRefinementChange,
  onRefine,
  onCopy,
  onReply
}: ReplyOptionCardProps) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const isEditing = activeEditId === reply.id;
  const isCopied = copiedReplyId === reply.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#272729] p-4 rounded-lg border border-[#343536]"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-400">Option {index + 1}</span>
        {reply.isRefining && (
          <Loader className="w-4 h-4 text-[#ff4500] animate-spin" />
        )}
      </div>

      {/* Reply Text */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full p-2 bg-[#1a1a1b] text-white rounded-md border border-[#343536] focus:border-[#ff4500] focus:outline-none"
            rows={4}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveEdit}
              className="px-3 py-1.5 bg-[#ff4500] text-white text-sm rounded-lg hover:bg-[#ff5722] transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1.5 bg-[#343536] text-white text-sm rounded-lg hover:bg-[#404041] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white leading-relaxed mb-4">{reply.text}</p>
      )}

      {/* Refinement Section */}
      {showRefinement && !isEditing && (
        <div className="mt-4 p-3 bg-[#1a1a1b] rounded-lg border border-[#343536]">
          <input
            type="text"
            value={refinementInstruction}
            onChange={(e) => onRefinementChange(e.target.value)}
            placeholder="How would you like to refine this reply? (e.g., 'make it shorter', 'be more technical')"
            className="w-full p-2 bg-transparent text-white border-b border-[#343536] focus:border-[#ff4500] focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => {
                onRefine(reply.id, refinementInstruction);
                setShowRefinement(false);
              }}
              disabled={!refinementInstruction.trim() || reply.isRefining}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Apply Refinement
            </button>
            <button
              onClick={() => setShowRefinement(false)}
              className="px-3 py-1.5 text-gray-400 text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex items-center gap-2 pt-3 border-t border-[#343536]">
          {/* Copy Button */}
          <button
            onClick={() => onCopy(reply.id, reply.text)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              isCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copied!' : 'Copy'}
          </button>

          {/* Reply Button */}
          <button
            onClick={() => onReply(reply.text)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Reply on Reddit
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onStartEdit(reply.id, reply.text)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#343536] rounded-lg transition-colors text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>

          {/* Refine Button */}
          <button
            onClick={() => setShowRefinement(!showRefinement)}
            disabled={reply.isRefining}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#343536] rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refine
          </button>
        </div>
      )}
    </motion.div>
  );
};