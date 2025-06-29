"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, TrendingDown, AlertTriangle, CheckCircle, Zap, BarChart3, Shield } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const manualProblems = [
  {
    icon: Clock,
    title: "Time-Consuming",
    description: "Manual subreddit search and posts",
    impact: "80+ hrs/month"
  },
  {
    icon: AlertTriangle,
    title: "Ban Risk",
    description: "High chance of bans",
    impact: "60% rate"
  },
  {
    icon: TrendingDown,
    title: "Poor Targeting",
    description: "Guesswork on audience",
    impact: "2-5% engagement"
  },
  {
    icon: Target,
    title: "No Analytics",
    description: "No data insights",
    impact: "0% optimization"
  },
  {
    icon: AlertTriangle,
    title: "Missed Opportunities",
    description: "Can't hijack competitor leads",
    impact: "Lost revenue"
  }
];

const redleadBenefits = [
  {
    icon: Zap,
    title: "AI Speed",
    description: "Automated discovery & optimization",
    impact: "10x faster"
  },
  {
    icon: Shield,
    title: "Safe & Compliant",
    description: "Rule checks prevent bans",
    impact: "99% safe"
  },
  {
    icon: BarChart3,
    title: "Smart Targeting",
    description: "AI finds ideal audience",
    impact: "25-40% engagement"
  },
  {
    icon: CheckCircle,
    title: "Real-Time Analytics",
    description: "Track & optimize campaigns",
    impact: "5x ROI"
  },
  {
    icon: Zap,
    title: "Opportunity Hijacking",
    description: "Auto-capture competitor leads",
    impact: "3x more leads"
  }
];

export const RedditComparisons= () => {
  return (
    <section className="relative py-12 sm:py-16 bg-gradient-to-br from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.008]"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-16 right-16 w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-16 left-16 w-32 h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className={`text-3xl sm:text-4xl font-black tracking-tighter text-black mb-4 leading-tight ${poppins.className}`}
          >
            Manual Reddit Marketing{" "}
            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              vs
            </span>{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              RedLead
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-lg text-black/70 max-w-2xl mx-auto leading-relaxed ${inter.className}`}
          >
            Stop wasting time and missing leads.{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-semibold">
              RedLead AI
            </span>{" "}
            automates everything and captures opportunities.
          </motion.p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Manual Problems */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <motion.div 
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-3"
              >
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </motion.div>
              <h3 className={`text-xl font-bold text-red-600 ${poppins.className}`}>
                Manual Marketing
              </h3>
            </div>

            {manualProblems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(239, 68, 68, 0.15)"
                }}
                className="bg-red-50/80 border border-red-200/50 rounded-xl p-4 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <problem.icon className="w-5 h-5 text-red-600" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold text-red-800 mb-1 ${poppins.className}`}>
                      {problem.title}
                    </h4>
                    <p className={`text-sm text-red-700/80 mb-2 ${inter.className}`}>
                      {problem.description}
                    </p>
                    <span className={`inline-block px-2 py-1 bg-red-200/50 rounded-full text-xs font-semibold text-red-700 ${poppins.className}`}>
                      {problem.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* RedLead Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <motion.div 
                whileHover={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-3"
              >
                <Zap className="w-6 h-6 text-orange-600" />
              </motion.div>
              <h3 className={`text-xl font-bold text-orange-600 ${poppins.className}`}>
                RedLead AI
              </h3>
            </div>

            {redleadBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(34, 197, 94, 0.15)"
                }}
                className="bg-green-50/80 border border-green-200/50 rounded-xl p-4 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"
                  >
                    <benefit.icon className="w-5 h-5 text-green-600" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold text-green-800 mb-1 ${poppins.className}`}>
                      {benefit.title}
                    </h4>
                    <p className={`text-sm text-green-700/80 mb-2 ${inter.className}`}>
                      {benefit.description}
                    </p>
                    <span className={`inline-block px-2 py-1 bg-green-200/50 rounded-full text-xs font-semibold text-green-700 ${poppins.className}`}>
                      {benefit.impact}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className={`text-2xl font-black mb-1 ${poppins.className}`}>10x</div>
              <div className={`text-sm text-orange-100 ${inter.className}`}>Faster Setup</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className={`text-2xl font-black mb-1 ${poppins.className}`}>99%</div>
              <div className={`text-sm text-orange-100 ${inter.className}`}>Ban-Free Rate</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <div className={`text-2xl font-black mb-1 ${poppins.className}`}>5x</div>
              <div className={`text-sm text-orange-100 ${inter.className}`}>Better ROI</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
