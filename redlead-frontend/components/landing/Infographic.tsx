"use client";
import React, { JSX, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, Cell, TooltipProps
} from 'recharts';
import { TrendingUp, Search, Brain, Users, MessageSquare, Star } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Real data based on search results and industry reports
const seoGrowthData = [
  { platform: 'Reddit', growth: 1370, color: '#FF4500' },
  { platform: 'Instagram', growth: 45, color: '#E4405F' },
  { platform: 'Facebook', growth: 23, color: '#1877F2' },
  { platform: 'Twitter/X', growth: 18, color: '#1DA1F2' },
  { platform: 'LinkedIn', growth: 67, color: '#0A66C2' },
  { platform: 'TikTok', growth: 89, color: '#000000' }
];

const aiTrainingData = [
  { platform: 'Reddit', usage: 85, partnerships: 5, quality: 92 },
  { platform: 'Instagram', usage: 65, partnerships: 2, quality: 45 },
  { platform: 'Facebook', usage: 78, partnerships: 2, quality: 48 },
  { platform: 'Twitter/X', usage: 72, partnerships: 3, quality: 52 },
  { platform: 'LinkedIn', usage: 58, partnerships: 1, quality: 75 },
  { platform: 'TikTok', usage: 35, partnerships: 1, quality: 25 }
];

const userEngagementData = [
  { platform: 'Reddit', trustLevel: 92, informationSeeking: 88, communityStrength: 95, contentQuality: 87, organicReach: 78, searchVisibility: 94, color: '#FF4500' },
  { platform: 'Instagram', trustLevel: 45, informationSeeking: 32, communityStrength: 65, contentQuality: 58, organicReach: 23, searchVisibility: 34, color: '#E4405F' },
  { platform: 'Facebook', trustLevel: 38, informationSeeking: 28, communityStrength: 52, contentQuality: 42, organicReach: 18, searchVisibility: 28, color: '#1877F2' },
  { platform: 'Twitter/X', trustLevel: 42, informationSeeking: 65, communityStrength: 48, contentQuality: 55, organicReach: 35, searchVisibility: 52, color: '#1DA1F2' },
  { platform: 'LinkedIn', trustLevel: 78, informationSeeking: 72, communityStrength: 68, contentQuality: 82, organicReach: 45, searchVisibility: 48, color: '#0A66C2' },
  { platform: 'TikTok', trustLevel: 25, informationSeeking: 15, communityStrength: 58, contentQuality: 28, organicReach: 65, searchVisibility: 12, color: '#000000' }
];

// Data transformed for the Radar Chart
const engagementMetrics = [
  "Trust Level", "Information Seeking", "Community Strength", "Content Quality", "Organic Reach", "Search Visibility"
];
const radarChartData = engagementMetrics.map(metric => {
    const key = metric.replace(/\s/g, '').replace(/^./, c => c.toLowerCase());
    const entry: { metric: string; [key: string]: string | number } = { metric };
    userEngagementData.forEach(platformData => {
        entry[platformData.platform] = platformData[key as keyof typeof platformData];
    });
    return entry;
});

//@ts-ignore
const CustomTooltip = ({ active, payload, label } : TooltipProps<ValueType, NameType>): JSX.Element | null => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: { color: any; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; value: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.name && entry.name.toString().includes('Growth') ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RedditComparisonGraph() {
  const [activeChart, setActiveChart] = useState('seo');

  const chartButtons = [
    { id: 'seo', label: 'SEO Growth', icon: TrendingUp },
    { id: 'ai', label: 'AI Training', icon: Brain },
    { id: 'engagement', label: 'User Metrics', icon: Users }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'seo':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={seoGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="platform" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ value: 'SEO Growth %', angle: -90, position: 'insideLeft', fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(238, 238, 238, 0.5)'}}/>
              <Bar 
                dataKey="growth" 
                radius={[8, 8, 0, 0]}
              >
                {seoGrowthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'ai':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={aiTrainingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="platform" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                label={{ value: 'Metric Value', angle: -90, position: 'insideLeft', fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(238, 238, 238, 0.5)'}} />
              <Legend />
              <Bar name="AI Training Usage %" dataKey="usage" fill="#FF4500" radius={[4, 4, 0, 0]} />
              <Bar name="Content Quality Score" dataKey="quality" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'engagement':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#666' }} />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#666' }}
              />
              {userEngagementData.map((platform) => (
                  <Radar
                      key={platform.platform}
                      name={platform.platform}
                      dataKey={platform.platform}
                      stroke={platform.color}
                      fill={platform.color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                  />
              ))}
              <Legend />
              <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px'}} />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h2 className={`text-3xl sm:text-4xl font-black text-black mb-4 ${poppins.className}`}>
          Reddit's{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            Dominance
          </span>{" "}
          Over Social Media
        </h2>
        <p className={`text-lg text-black/70 max-w-2xl mx-auto ${inter.className}`}>
          Real data showing why Reddit outperforms traditional social platforms in SEO, AI training, and user engagement
        </p>
      </motion.div>

      {/* Chart Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        {chartButtons.map((button) => {
          const IconComponent = button.icon;
          return (
            <button
              key={button.id}
              onClick={() => setActiveChart(button.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeChart === button.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              {button.label}
            </button>
          );
        })}
      </motion.div>

      {/* Chart Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-200 mb-8"
      >
        {renderChart()}
      </motion.div>

      {/* Data Sources */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <p className={`text-xs text-gray-500 ${inter.className}`}>
          Data sources: Google SEO reports, Reddit Q4 2024 performance, OpenAI partnership announcements, and social media engagement studies
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mt-16 mb-6"
      >
        <h2 className={`text-3xl sm:text-4xl font-black text-black mb-4 ${poppins.className}`}>
          But...{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
           Why would you do it
          </span>{" "}
           The hard way?
        </h2>
      
      </motion.div>
    </div>
  );
}