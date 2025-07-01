"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Edit3, Send, Loader, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

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

interface ReplyOption {
  id: string;
  text: string;
  isEditing: boolean;
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
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [refinementInstruction, setRefinementInstruction] = useState('');

  // Generate initial AI reply options
  const generateReplies = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await api.generateReply(lead.id, lead.body);
      const replies = response.replies || [];
      
      setReplyOptions(replies.map((text: string, index: number) => ({
        id: `reply_${index}`,
        text,
        isEditing: false,
        isRefining: false
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine a specific reply option
  const refineReply = async (replyId: string, instruction: string) => {
    const reply = replyOptions.find(r => r.id === replyId);
    if (!reply) return;

    setReplyOptions(prev => prev.map(r => 
      r.id === replyId ? { ...r, isRefining: true } : r
    ));

    try {
      const response = await api.refineReply(reply.text, instruction);
      setReplyOptions(prev => prev.map(r => 
        r.id === replyId 
          ? { ...r, text: response.refinedReply, isRefining: false }
          : r
      ));
      setRefinementInstruction('');
    } catch (err: any) {
      setError(err.message);
      setReplyOptions(prev => prev.map(r => 
        r.id === replyId ? { ...r, isRefining: false } : r
      ));
    }
  };

  // Post reply to Reddit
  const postReply = async (text: string) => {
    setIsPosting(true);
    setError(null);

    try {
      await api.postReply(lead.id, text);
      setSuccess('Reply posted successfully to Reddit!');
      onLeadUpdate(lead.id, 'replied');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPosting(false);
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
                      index={index}
                      activeEditId={activeEditId}
                      editText={editText}
                      refinementInstruction={refinementInstruction}
                      isPosting={isPosting}
                      onStartEdit={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setActiveEditId(null)}
                      onEditTextChange={setEditText}
                      onRefinementChange={setRefinementInstruction}
                      onRefine={refineReply}
                      onPost={postReply}
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
  index: number;
  activeEditId: string | null;
  editText: string;
  refinementInstruction: string;
  isPosting: boolean;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onRefinementChange: (instruction: string) => void;
  onRefine: (id: string, instruction: string) => void;
  onPost: (text: string) => void;
}

const ReplyOptionCard = ({
  reply,
  index,
  activeEditId,
  editText,
  refinementInstruction,
  isPosting,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onRefinementChange,
  onRefine,
  onPost
}: ReplyOptionCardProps) => {
  const [showRefinement, setShowRefinement] = useState(false);
  const isEditing = activeEditId === reply.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#272729] rounded-lg border border-[#343536] overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-400">Option {index + 1}</span>
          <div className="flex items-center gap-2">
            {reply.isRefining && (
              <Loader className="w-4 h-4 text-[#ff4500] animate-spin" />
            )}
          </div>
        </div>

        {/* Reply Text */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="w-full h-32 p-3 bg-[#1a1a1b] text-white rounded-lg border border-[#343536] focus:ring-2 focus:ring-[#ff4500] focus:outline-none resize-none"
              placeholder="Edit your reply..."
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
            <button
              onClick={() => onStartEdit(reply.id, reply.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#343536] rounded-lg transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={() => setShowRefinement(!showRefinement)}
              disabled={reply.isRefining}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-[#343536] rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refine
            </button>

            <div className="flex-1" />

            <button
              onClick={() => onPost(reply.text)}
              disabled={isPosting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#ff4500] text-white rounded-lg hover:bg-[#ff5722] transition-colors text-sm disabled:opacity-50"
            >
              {isPosting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Post to Reddit
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};