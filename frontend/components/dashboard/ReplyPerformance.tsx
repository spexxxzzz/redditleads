"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  MessageCircle,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Loader,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook

interface ReplyPerformance {
  id: string;
  content: string;
  upvotes: number;
  authorReplied: boolean;
  postedAt: string;
  redditUrl: string;
  lead: {
    id: string;
    title: string;
    subreddit: string;
    url: string;
    author: string;
  };
}

interface PerformanceMetrics {
  totalReplies: number;
  totalUpvotes: number;
  averageUpvotes: number;
  responseRate: number;
  repliesWithAuthorResponse: number;
}

export default function PerformancePage() {
  const { getToken } = useAuth(); // Use the Clerk hook
  const [replies, setReplies] = useState<ReplyPerformance[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalReplies: 0,
    totalUpvotes: 0,
    averageUpvotes: 0,
    responseRate: 0,
    repliesWithAuthorResponse: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await api.getReplyPerformance(token); // Pass token to the API call
      setReplies(response.data || []);
      setMetrics(response.metrics || {
        totalReplies: 0,
        totalUpvotes: 0,
        averageUpvotes: 0,
        responseRate: 0,
        repliesWithAuthorResponse: 0
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]); // Add getToken to the dependency array

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getUpvoteColor = (upvotes: number) => {
    if (upvotes >= 10) return 'text-green-400';
    if (upvotes >= 5) return 'text-yellow-400';
    if (upvotes >= 1) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-[#ff4500] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reply Performance</h1>
          <p className="text-gray-400">
            Track the success of your Reddit engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <MetricCard title="Total Replies" value={metrics.totalReplies} icon={MessageCircle} color="blue" />
            <MetricCard title="Total Upvotes" value={metrics.totalUpvotes} icon={ArrowUp} color="green" />
            <MetricCard title="Avg Upvotes" value={metrics.averageUpvotes} icon={TrendingUp} color="yellow" isDecimal />
            <MetricCard title="Response Rate" value={metrics.responseRate} icon={Users} color="purple" suffix="%" isDecimal />
            <MetricCard title="Author Replies" value={metrics.repliesWithAuthorResponse} icon={Target} color="orange" />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {replies.length === 0 ? (
          <div className="text-center py-24">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No replies yet</h3>
            <p className="text-gray-400">
              Start engaging with leads to see your performance metrics here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Replies</h2>
            <AnimatePresence>
              {replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  getTimeAgo={getTimeAgo}
                  getUpvoteColor={getUpvoteColor}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ... (MetricCard and ReplyCard components remain the same)
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  suffix?: string;
  isDecimal?: boolean;
}

const MetricCard = ({ title, value, icon: Icon, color, suffix = '', isDecimal = false }: MetricCardProps) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400'
  };

  const displayValue = isDecimal ? value.toFixed(1) : value.toString();

  return (
    <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#343536]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">
          {displayValue}{suffix}
        </p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );
};

interface ReplyCardProps {
  reply: ReplyPerformance;
  getTimeAgo: (date: string) => string;
  getUpvoteColor: (upvotes: number) => string;
}

const ReplyCard = ({ reply, getTimeAgo, getUpvoteColor }: ReplyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#1a1a1b] rounded-lg border border-[#343536] p-6 hover:border-[#ff4500] transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{reply.lead.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>r/{reply.lead.subreddit}</span>
            <span>•</span>
            <span>u/{reply.lead.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getTimeAgo(reply.postedAt)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ArrowUp className={`w-4 h-4 ${getUpvoteColor(reply.upvotes)}`} />
            <span className={`font-medium ${getUpvoteColor(reply.upvotes)}`}>
              {reply.upvotes}
            </span>
          </div>
          
          {reply.authorReplied && (
            <div className="flex items-center gap-1 text-green-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Author replied</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-300 leading-relaxed">{reply.content}</p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-[#343536]">
        <a 
          href={reply.lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#ff4500] hover:text-[#ff6b35] transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Original Post
        </a>
        
        {reply.redditUrl && (
          <a 
            href={reply.redditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Reply on Reddit
          </a>
        )}
      </div>
    </motion.div>
  );
};