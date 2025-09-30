"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChatBubbleLeftIcon,
  PencilSquareIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  PaperAirplaneIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid'; // Using solid for a filled look
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import  {Textarea}  from  "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ReplyLoader, RefiningLoader } from '@/components/loading/reply-loader';
import { Lead } from '@/hooks/useReplyModal';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface ReplyOption {
  id: string;
  text: string;
  isRefining: boolean;
  isPreparing?: boolean;
}

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdate: (leadId: string, status: Lead['status']) => void;
}

export const ReplyModal = ({ lead, isOpen, onClose, onLeadUpdate }: Props) => {
  const { getToken } = useAuth();
  const [replyOptions, setReplyOptions] = useState<ReplyOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [copiedReplyId, setCopiedReplyId] = useState<string | null>(null);

  const generateReplies = useCallback(async (currentLead: Lead) => {
    console.log('🚀 [ReplyModal] Starting AI reply generation for lead:', currentLead.id);
    setIsGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      console.log('🔐 [ReplyModal] Token received:', token ? 'Present' : 'Missing');
      console.log('📋 [ReplyModal] Making API call to generate replies...');
      
      const data = await api.generateReply(currentLead.id, token);
      console.log('✅ [ReplyModal] Replies generated successfully:', data);
      
      if (Array.isArray(data.replies)) {
        setReplyOptions(data.replies.map((text: string, index: number) => ({
          id: `${currentLead.id}-${index}`, text, isRefining: false
        })));
        
        // Trigger usage dashboard refresh
        window.dispatchEvent(new CustomEvent('usageRefresh'));
      } else {
        throw new Error("Invalid response format from API.");
      }
    } catch (err: any) {
      console.error('❌ [ReplyModal] Reply generation failed:', err);
      console.error('❌ [ReplyModal] Error message:', err.message);
      console.error('❌ [ReplyModal] Error type:', typeof err);
      console.error('❌ [ReplyModal] Error details:', err);
      
      if (err.message && err.message.includes('limit reached')) {
        setError("You have exhausted the limits of AI Reply Generation. Kindly upgrade your plan to generate more replies.");
      } else {
        setError(err.message || 'Failed to generate replies.');
      }
    } finally {
      console.log('🏁 [ReplyModal] Reply generation finished');
      setIsGenerating(false);
    }
  }, [getToken]);

  const copyReply = async (replyId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReplyId(replyId);
      setTimeout(() => setCopiedReplyId(null), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const startEditing = (replyId: string, text: string) => {
    setActiveEditId(replyId);
    setEditText(text);
  };

  const saveEdit = () => {
    if (!activeEditId) return;
    setReplyOptions(prev => prev.map(r => r.id === activeEditId ? { ...r, text: editText } : r));
    setActiveEditId(null);
    setEditText('');
  };

  const handleManualReply = async (replyId: string, text: string) => {
    if (!lead) return;

    setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isPreparing: true } : r));
    setError(null);

    try {
      const token = await getToken();
      // 1. Tell backend to prepare for tracking
      await api.prepareReplyForTracking(lead.id, text, token);

      // 2. Copy text to clipboard for user
      await navigator.clipboard.writeText(text);

      // 3. Update lead status locally
      onLeadUpdate(lead.id, 'replied');

      // 4. Open Reddit in a new tab
      window.open(lead.url, '_blank');

      // 5. Close the modal
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to prepare reply for tracking.');
      setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isPreparing: false } : r));
    }
  };

  const handleAutoReply = async (replyId: string, text: string) => {
    if (!lead) return;

    setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isPreparing: true } : r));
    setError(null);

    try {
      const token = await getToken();
      // Post reply automatically to Reddit
      const result = await api.postRedditReply(lead.id, text, token);

      // Update lead status locally
      onLeadUpdate(lead.id, 'replied');

      // Show success message
      setError(null);
      console.log('✅ Reply posted successfully:', result);

      // Close the modal
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post reply automatically.');
      setReplyOptions(prev => prev.map(r => r.id === replyId ? { ...r, isPreparing: false } : r));
    }
  };

  useEffect(() => {
    if (isOpen && lead) {
      setReplyOptions([]);
      setError(null);
      setActiveEditId(null);
      setEditText('');
      setCopiedReplyId(null);
      generateReplies(lead);
    }
  }, [isOpen, lead, generateReplies]);

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-6xl max-h-[90vh] bg-black rounded-xl border border-zinc-800 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg"><ChatBubbleLeftIcon className="w-6 h-6 text-orange-500" /></div>
                <div>
                  <h2 className={`text-xl font-bold text-white ${poppins.className}`}>AI Reply Generator</h2>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>r/{lead.subreddit} • u/{lead.author}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white p-2"><XMarkIcon className="w-5 h-5" /></Button>
            </div>


            <div className="flex flex-grow min-h-0">
              {/* Left Panel */}
              <div className="w-1/3 p-6 border-r border-zinc-800 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-semibold text-white mb-3 ${poppins.className}`}>Original Post</h3>
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardContent className="p-4">
                        <h4 className={`font-medium text-white mb-2 ${poppins.className}`}>{lead.title}</h4>
                        <div className={`text-sm text-gray-300 leading-relaxed ${inter.className}`}>
                          <MarkdownRenderer content={lead.body || ''} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">{lead.opportunityScore}% opportunity</Badge>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{lead.intent.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-6 border-b border-zinc-800 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-white ${poppins.className}`}>AI-Generated Replies</h3>
                  </div>
                </div>

                {error && (
                  <div className="p-4">
                    <Card className="bg-red-500/5 border-red-500/20">
                      <CardContent className="p-3 flex items-center gap-2 text-red-400 text-sm"><ExclamationCircleIcon className="w-4 h-4" />{error}</CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isGenerating ? <ReplyLoader /> : (
                    <AnimatePresence>
                      {replyOptions.map((reply, index) => (
                        <ReplyOptionCard
                          key={reply.id}
                          reply={reply}
                          index={index}
                          activeEditId={activeEditId}
                          editText={editText}
                          copiedReplyId={copiedReplyId}
                          onStartEdit={startEditing}
                          onSaveEdit={saveEdit}
                          onCancelEdit={() => setActiveEditId(null)}
                          onEditTextChange={setEditText}
                          onCopy={copyReply}
                          onReply={handleManualReply}
                          onAutoReply={handleAutoReply}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ReplyOptionCardProps {
  reply: ReplyOption;
  index: number;
  activeEditId: string | null;
  editText: string;
  copiedReplyId: string | null;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onCopy: (id: string, text: string) => void;
  onReply: (id: string, text: string) => void;
  onAutoReply: (id: string, text: string) => void;
}

const ReplyOptionCard = ({ reply, index, activeEditId, editText, copiedReplyId, onStartEdit, onSaveEdit, onCancelEdit, onEditTextChange, onCopy, onReply, onAutoReply }: ReplyOptionCardProps) => {
  const isEditing = activeEditId === reply.id;
  const isCopied = copiedReplyId === reply.id;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className={`text-sm font-medium text-gray-400 ${inter.className}`}>Option {index + 1}</CardTitle>
            {(reply.isRefining || reply.isPreparing) && <RefiningLoader />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea value={editText} onChange={(e) => onEditTextChange(e.target.value)} className="min-h-[100px] bg-zinc-900 border-zinc-700 text-white focus:border-orange-500" placeholder="Edit your reply..." />
              <div className="flex items-center gap-2">
                <Button onClick={onSaveEdit} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
                <Button onClick={onCancelEdit} variant="outline" size="sm" className="border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className={`text-white leading-relaxed ${inter.className}`}>
              <MarkdownRenderer content={reply.text} />
            </div>
          )}
          {!isEditing && (
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <Button onClick={() => onCopy(reply.id, reply.text)} variant="outline" size="sm" className={`${isCopied ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'border-zinc-700 text-gray-300 hover:bg-zinc-800 hover:text-white'}`}>
                {isCopied ? <CheckIcon className="w-4 h-4 mr-1" /> : <DocumentDuplicateIcon className="w-4 h-4 mr-1" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={() => onReply(reply.id, reply.text)} disabled={reply.isPreparing} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1" />
                {reply.isPreparing ? 'Preparing...' : 'Copy & Reply Manually'}
              </Button>
              <Button onClick={() => onAutoReply(reply.id, reply.text)} disabled={reply.isPreparing} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                {reply.isPreparing ? 'Posting...' : 'Post Automatically'}
              </Button>
              <Button onClick={() => onStartEdit(reply.id, reply.text)} variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-zinc-800">
                <PencilSquareIcon className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};