"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Target, 
  Eye,
  Zap,
  Send,
  Bookmark,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'framer-motion';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
});

interface Campaign {
  id: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  targetSubreddits: string[];
  createdAt: string;
}

interface Lead {
  id: string;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
  createdAt: number;
  subreddit: string;
  numComments: number;
  upvoteRatio: number;
}

interface Props {
  campaigns: Campaign[];
  activeCampaign: string | null;
  leadStats: { new: number; replied: number; saved: number; all: number };
  allLeads: Lead[];
}

export const AnalyticalDashboard = ({ campaigns, activeCampaign, leadStats, allLeads }: Props) => {
  const leadTrendData = [
    { date: 'Jan', leads: 45, conversions: 12 },
    { date: 'Feb', leads: 52, conversions: 18 },
    { date: 'Mar', leads: 48, conversions: 15 },
    { date: 'Apr', leads: 61, conversions: 22 },
    { date: 'May', leads: 55, conversions: 19 },
    { date: 'Jun', leads: 67, conversions: 28 }
  ];

  const subredditPerformance = [
    { name: 'r/entrepreneur', leads: 34 },
    { name: 'r/startups', leads: 28 },
    { name: 'r/business', leads: 22 },
    { name: 'r/technology', leads: 19 },
    { name: 'r/marketing', leads: 15 }
  ];

  const opportunityDistribution = [
    { name: 'High', value: 28, color: '#22c55e' },
    { name: 'Medium', value: 45, color: '#f59e0b' },
    { name: 'Low', value: 27, color: '#ef4444' }
  ];

  const weeklyActivity = [
    { day: 'Mon', activity: 85 },
    { day: 'Tue', activity: 92 },
    { day: 'Wed', activity: 78 },
    { day: 'Thu', activity: 96 },
    { day: 'Fri', activity: 73 },
    { day: 'Sat', activity: 45 },
    { day: 'Sun', activity: 38 }
  ];

  const avgOpportunityScore = allLeads.length > 0 
    ? (allLeads.reduce((sum, lead) => sum + lead.opportunityScore, 0) / allLeads.length).toFixed(1)
    : "8.4";

  const conversionRate = leadStats.all > 0 
    ? ((leadStats.replied / leadStats.all) * 100).toFixed(1)
    : "24.3";

  const activeCampaignData = campaigns.find(c => c.id === activeCampaign);

  const MetricCard = ({ title, value, change, description, icon: Icon, trend, isOrange = false }: any) => (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-3">
              <p className={`text-sm font-medium text-gray-400 ${inter.className}`}>
                {title}
              </p>
              <div>
                <div className={`text-2xl font-bold text-white ${poppins.className}`}>
                  {value}
                </div>
                <div className="flex items-center mt-2">
                  {trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : trend === 'down' ? (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <Activity className="h-4 w-4 text-orange-500 mr-1" />
                  )}
                  <p className={`text-xs ${
                    trend === 'up' 
                      ? 'text-green-500' 
                      : trend === 'down' 
                        ? 'text-red-500' 
                        : 'text-orange-500'
                  } ${inter.className}`}>
                    {change}
                  </p>
                  <p className={`text-xs text-gray-500 ml-2 ${inter.className}`}>
                    {description}
                  </p>
                </div>
              </div>
            </div>
            <div className="h-4 w-4">
              <Icon className={`h-4 w-4 ${isOrange ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="p-8 space-y-8">
        {/* Header with Campaign Name */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold text-white ${poppins.className}`}>
              Dashboard
            </h1>
            <p className={`text-gray-400 ${inter.className}`}>
              Lead generation insights and performance metrics
            </p>
          </div>
          
          {/* Campaign Info with proper spacing */}
          {activeCampaignData && (
            <div className="flex items-center gap-4 ml-12">
              <div className="w-1 h-12 bg-orange-500 rounded-full"></div>
              <div>
                <p className={`text-sm font-medium text-orange-500 ${inter.className}`}>
                  Active Campaign
                </p>
                <p className={`text-lg font-semibold text-white ${poppins.className}`}>
                  {new URL(activeCampaignData.analyzedUrl).hostname}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Leads"
            value={leadStats.all}
            change="+12.5%"
            description="Trending up this month"
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="New Leads"
            value={leadStats.new}
            change="+4.5%"
            description="Steady performance increase"
            icon={Zap}
            trend="up"
            isOrange={true}
          />
          <MetricCard
            title="Active Accounts"
            value={`${conversionRate}%`}
            change="+12.5%"
            description="Strong user retention"
            icon={TrendingUp}
            trend="up"
          />
          <MetricCard
            title="Growth Rate"
            value={`${avgOpportunityScore}/10`}
            change="+0.3"
            description="Meets growth projections"
            icon={Target}
            trend="steady"
            isOrange={true}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lead Trend Chart */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Lead Generation Trend
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Visitors for the last 6 months
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={leadTrendData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4500" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff4500" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#ff4500" 
                    fillOpacity={1} 
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subreddit Performance */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Top Subreddits
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Performance by community
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subredditPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="leads" fill="#ff4500" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Opportunity Distribution */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Lead Quality
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Distribution by score
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={opportunityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {opportunityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {opportunityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={`text-gray-300 ${inter.className}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`font-medium text-white ${poppins.className}`}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Weekly Activity
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Discovery patterns
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontFamily: inter.style.fontFamily }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#000000',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="activity" fill="#ff6a00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card className="bg-black border-zinc-800">
            <CardHeader>
              <CardTitle className={`text-white ${poppins.className}`}>
                Campaign Details
              </CardTitle>
              <p className={`text-sm text-gray-400 ${inter.className}`}>
                Current configuration
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCampaignData ? (
                <>
                  <div>
                    <p className={`text-sm font-medium mb-1 text-gray-300 ${inter.className}`}>
                      Keywords Tracked
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {activeCampaignData.generatedKeywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                          {keyword}
                        </Badge>
                      ))}
                      {activeCampaignData.generatedKeywords.length > 3 && (
                        <Badge variant="outline" className="border-zinc-700 text-gray-400">
                          +{activeCampaignData.generatedKeywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-3 w-3 text-orange-500" />
                    <span className={`text-gray-300 ${inter.className}`}>
                      {activeCampaignData.targetSubreddits.length} subreddits monitored
                    </span>
                  </div>
                </>
              ) : (
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  No campaign selected
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lead Status Overview */}
        <Card className="bg-black border-zinc-800">
          <CardHeader>
            <CardTitle className={`text-white ${poppins.className}`}>
              Lead Pipeline Status
            </CardTitle>
            <p className={`text-sm text-gray-400 ${inter.className}`}>
              Current lead breakdown by status
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                    {leadStats.new}
                  </p>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    New Leads
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Send className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                    {leadStats.replied}
                  </p>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Replied
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Bookmark className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                    {leadStats.saved}
                  </p>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Saved
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Users className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${poppins.className}`}>
                    {leadStats.all}
                  </p>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Total Leads
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
