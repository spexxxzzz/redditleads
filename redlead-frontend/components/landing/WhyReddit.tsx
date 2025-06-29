"use client";
import React, { JSX } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Search, Eye, Brain, ArrowUp, Target } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit } from "react-icons/fa";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Type definitions
interface CompanyPosition {
  x: number;
  y: number;
}

interface Company {
  icon: () => JSX.Element;
  name: string;
  position: CompanyPosition;
}

interface Stat {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  label: string;
  description: string;
}

interface GrowthData {
  period: string;
  visibility: number;
  ranking: number;
}

interface SearchTrafficData {
  metric: string;
  value: number;
  unit: string;
}

// Company Icons with proper SVG implementations
const CompanyIcons = {
  openai: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10A37F"/>
      </svg>
    </div>
  ),
  google: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
  ),
  anthropic: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
        <path fillRule="evenodd" d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z" fill="#D4A574"/>
      </svg>
    </div>
  ),
  meta: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    </div>
  ),
  mistral: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="10" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="3" y="10" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="10" width="4" height="4" fill="#FF7000"/>
        <rect x="3" y="17" width="4" height="4" fill="#FF7000"/>
        <rect x="10" y="17" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="17" width="4" height="4" fill="#FF7000"/>
      </svg>
    </div>
  )
};

const companies: Company[] = [
  { icon: CompanyIcons.openai, name: "OpenAI", position: { x: -200, y: -150 } },
  { icon: CompanyIcons.google, name: "Google", position: { x: 200, y: -150 } },
  { icon: CompanyIcons.anthropic, name: "Anthropic", position: { x: -250, y: 50 } },
  { icon: CompanyIcons.meta, name: "Meta", position: { x: 250, y: 50 } },
  { icon: CompanyIcons.mistral, name: "Mistral", position: { x: -150, y: 200 } },
];

const stats: Stat[] = [
  {
    icon: Users,
    number: "100M+",
    label: "Daily Active Users",
    description: "Massive engaged audience"
  },
  {
    icon: TrendingUp,
    number: "5B+",
    label: "Daily Page Views",
    description: "Incredible reach potential"
  },
  {
    icon: Search,
    number: "#10",
    label: "Most Visited Website",
    description: "Global web ranking"
  }
];

// Real data from search results
const redditGrowthData: GrowthData[] = [
  { period: "July 2023", visibility: 95.1, ranking: 68 },
  { period: "Oct 2023", visibility: 200, ranking: 45 },
  { period: "Apr 2024", visibility: 800, ranking: 15 },
  { period: "July 2024", visibility: 1370, ranking: 5 }
];

const searchTrafficData: SearchTrafficData[] = [
  { metric: "Organic Search Traffic Growth", value: 374, unit: "%" },
  { metric: "Daily Active Users Growth", value: 47, unit: "%" },
  { metric: "Monthly Google Searches", value: 600, unit: "M+" },
  { metric: "AI Training Data Usage", value: 85, unit: "%" }
];

// Component Props Interfaces
interface BarChartProps {
  data: GrowthData[];
  title: string;
}

interface MetricCardProps {
  metric: string;
  value: number;
  unit: string;
  index: number;
}

// Bar Chart Component
const BarChart: React.FC<BarChartProps> = ({ data, title }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
    <h4 className={`text-lg font-bold text-black mb-4 text-center ${poppins.className}`}>
      {title}
    </h4>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className={`text-sm font-medium text-gray-700 flex-1 ${inter.className}`}>
            {item.period}
          </span>
          <div className="flex-2 mx-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.visibility / 1370) * 100}%` }}
                transition={{ duration: 1.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              />
            </div>
          </div>
          <span className={`text-sm font-bold text-orange-600 min-w-[60px] text-right ${poppins.className}`}>
            #{item.ranking}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Metric Cards Component
const MetricCard: React.FC<MetricCardProps> = ({ metric, value, unit, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/30 text-center"
  >
    <div className="flex items-center justify-center mb-3">
      <ArrowUp className="w-6 h-6 text-green-600 mr-2" />
      <span className={`text-3xl font-black text-blue-900 ${poppins.className}`}>
        {value}{unit}
      </span>
    </div>
    <p className={`text-sm text-blue-800/80 font-medium ${inter.className}`}/>
      {metric}
    
  </motion.div>
);

// Line Chart Component (simplified visual representation)
const LineChart: React.FC = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
    <h4 className={`text-lg font-bold text-black mb-4 text-center ${poppins.className}`}>
      Reddit's SEO Visibility Growth
    </h4>
    <div className="relative h-32">
      <svg width="100%" height="100%" viewBox="0 0 400 120" className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
          <line x1="0" y1="20" x2="400" y2="20" />
          <line x1="0" y1="40" x2="400" y2="40" />
          <line x1="0" y1="60" x2="400" y2="60" />
          <line x1="0" y1="80" x2="400" y2="80" />
          <line x1="0" y1="100" x2="400" y2="100" />
        </g>
        
        {/* Data line */}
        <motion.path
          d="M50,100 L150,85 L250,40 L350,20"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          viewport={{ once: true }}
        />
        
        {/* Data points */}
        {[50, 150, 250, 350].map((x, index) => {
          const y = [100, 85, 40, 20][index];
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r="6"
              fill="#f97316"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.3 }}
              viewport={{ once: true }}
            />
          );
        })}
        
        {/* Labels */}
        <text x="50" y="115" textAnchor="middle" className="text-xs fill-gray-600">Jul '23</text>
        <text x="150" y="115" textAnchor="middle" className="text-xs fill-gray-600">Oct '23</text>
        <text x="250" y="115" textAnchor="middle" className="text-xs fill-gray-600">Apr '24</text>
        <text x="350" y="115" textAnchor="middle" className="text-xs fill-gray-600">Jul '24</text>
      </svg>
    </div>
    <div className="mt-4 text-center">
      <span className={`text-sm text-gray-600 ${inter.className}`}>
        From #68 to #5 in Google rankings
      </span>
    </div>
  </div>
);

export const WhyReddit: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.008]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black mb-6 leading-[1.1] ${poppins.className}`}
          >
            Why{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Reddit
            </span>{" "}
            is the Future of Lead Generation
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-xl text-black/70 max-w-3xl mx-auto leading-relaxed ${inter.className}`}
          >
            Reddit isn't just social media—it's where{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-semibold">
              AI learns
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-semibold">
              Google searches
            </span>{" "}
            for authentic human insights
          </motion.p>
        </div>

        {/* Companies Flowing to Reddit Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden mb-16"
        >
          {/* Reddit Icon in Center */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="relative z-20 w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-orange-500"
          >
            <FaReddit className="text-6xl text-orange-500" />
          </motion.div>

          {/* Companies flowing toward Reddit */}
          {companies.map((company, index) => (
            <motion.div
              key={index}
              initial={{ 
                x: company.position.x, 
                y: company.position.y,
                opacity: 0,
                scale: 0.8
              }}
              whileInView={{ 
                x: [company.position.x, company.position.x * 0.7, company.position.x * 0.4, 0],
                y: [company.position.y, company.position.y * 0.7, company.position.y * 0.4, 0],
                opacity: [0, 1, 1, 0.3],
                scale: [0.8, 1, 1, 0.6]
              }}
              transition={{ 
                duration: 3,
                delay: index * 0.2,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              viewport={{ once: true }}
              className="absolute z-10"
            >
              <div className="relative">
                <company.icon />
                <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-black/70 whitespace-nowrap ${inter.className}`}>
                  {company.name}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Flow lines/arrows */}
          {companies.map((company, index) => (
            <motion.div
              key={`line-${index}`}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              transition={{ 
                duration: 2,
                delay: index * 0.2 + 0.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              viewport={{ once: true }}
              className="absolute z-5"
            >
              <svg 
                width="400" 
                height="400" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <motion.path
                  d={`M ${200 + company.position.x * 0.5} ${200 + company.position.y * 0.5} Q ${200 + company.position.x * 0.25} ${200 + company.position.y * 0.25} 200 200`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          ))}

          {/* Center Text */}
          <div className="absolute bottom-10 text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              viewport={{ once: true }}
              className={`text-sm text-black/60 max-w-lg ${inter.className}`}
            >
              All major tech companies are leveraging Reddit data to train AI models and improve search results
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative h-full bg-white/80 backdrop-blur-sm border border-black/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.12)] transition-all duration-300 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  
                  <div className={`text-3xl font-black text-black mb-1 ${poppins.className}`}>
                    {stat.number}
                  </div>
                  
                  <div className={`text-sm font-semibold text-orange-600 mb-2 ${poppins.className}`}>
                    {stat.label}
                  </div>
                  
                  <p className={`text-xs text-black/60 ${inter.className}`}>
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Visualization Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold text-black mb-4 ${poppins.className}`}>
              Reddit's Explosive Growth in Numbers
            </h3>
            <p className={`text-lg text-black/70 max-w-2xl mx-auto ${inter.className}`}>
              Real data showing Reddit's unprecedented rise in search visibility and AI adoption
            </p>
          </div>

          {/* Growth Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {searchTrafficData.map((item, index) => (
              <MetricCard
                key={index}
                metric={item.metric}
                value={item.value}
                unit={item.unit}
                index={index}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LineChart />
            <BarChart data={redditGrowthData} title="Google Rankings Evolution" />
          </div>
        </motion.div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <blockquote className={`text-2xl lg:text-3xl font-bold text-black/80 italic max-w-4xl mx-auto ${poppins.className}`}>
            "Ignoring Reddit in 2025 is like ignoring{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Google SEO
            </span>{" "}
            a decade ago—a missed opportunity you can't afford."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};
