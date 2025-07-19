"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import PulsatingDotsLoader from '../loading/LoadingLeads';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from '../loading/LoadingWrapper';
import PulsatingDotsLoaderReplies from '../loading/LoadingReplies';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

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
  const { getToken } = useAuth();
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
      const response = await api.getReplyPerformance(token);
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
  }, [getToken]);

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
    <PulsatingDotsLoaderReplies/>
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h1 className={`text-3xl font-bold text-white ${poppins.className}`}>
              Reply Performance
            </h1>
            <p className={`text-gray-400 ${inter.className}`}>
              Track the success of your Reddit engagement
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <MetricCard 
              title="Total Replies" 
              value={metrics.totalReplies} 
              icon={ChatBubbleLeftIcon} 
              color="blue" 
            />
            <MetricCard 
              title="Total Upvotes" 
              value={metrics.totalUpvotes} 
              icon={ArrowUpIcon} 
              color="green" 
            />
            <MetricCard 
              title="Avg Upvotes" 
              value={metrics.averageUpvotes} 
              icon={ArrowTrendingUpIcon} 
              color="yellow" 
              isDecimal 
            />
            <MetricCard 
              title="Response Rate" 
              value={metrics.responseRate} 
              icon={UsersIcon} 
              color="purple" 
              suffix="%" 
              isDecimal 
            />
            <MetricCard 
              title="Author Replies" 
              value={metrics.repliesWithAuthorResponse} 
              icon={CursorArrowRaysIcon} 
              color="orange" 
            />
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 bg-red-500/5 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
                  <span className={`text-red-400 ${inter.className}`}>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State or Reply List */}
          {replies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-24">
                <ChartBarIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <CardTitle className={`text-xl font-semibold mb-2 ${poppins.className}`}>
                  No replies yet
                </CardTitle>
                <p className={`text-muted-foreground ${inter.className}`}>
                  Start engaging with leads to see your performance metrics here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h2 className={`text-xl font-semibold text-white ${poppins.className}`}>
                Recent Replies
              </h2>
              <div className="space-y-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium text-muted-foreground ${inter.className}`}>
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${colors[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${poppins.className}`}>
              {displayValue}{suffix}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className={`text-lg font-semibold mb-2 ${poppins.className}`}>
                {reply.lead.title}
              </CardTitle>
              <div className={`flex items-center gap-2 text-sm text-muted-foreground ${inter.className}`}>
                <Badge variant="outline" className="text-orange-400 border-orange-400/20">
                  r/{reply.lead.subreddit}
                </Badge>
                <span>u/{reply.lead.author}</span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {getTimeAgo(reply.postedAt)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowUpIcon className={`w-4 h-4 ${getUpvoteColor(reply.upvotes)}`} />
                <span className={`font-medium ${getUpvoteColor(reply.upvotes)} ${inter.className}`}>
                  {reply.upvotes}
                </span>
              </div>
              
              {reply.authorReplied && (
                <Badge variant="outline" className="text-green-400 border-green-400/20">
                  <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                  <span className={`text-xs ${inter.className}`}>Author replied</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-4">
            <p className={`text-muted-foreground leading-relaxed ${inter.className}`}>
              {reply.content}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={reply.lead.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 ${inter.className}`}
              >
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                View Original Post
              </a>
            </Button>
            
            {reply.redditUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={reply.redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 ${inter.className}`}
                >
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  View Reply
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
