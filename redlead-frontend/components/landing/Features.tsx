"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Modern 2025 SaaS Feature Icons (Different from previous ones)
const FeatureIcons = {
  Sparkles: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="url(#gradient1)" stroke="currentColor" strokeWidth="1"/>
      <path d="M5 3L5.5 5.5L8 6L5.5 6.5L5 9L4.5 6.5L2 6L4.5 5.5L5 3Z" fill="url(#gradient1)"/>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Zap: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#gradient2)" stroke="currentColor" strokeWidth="1"/>
      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Shield: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <path d="M12 22S2 16 2 10V5L12 2L22 5V10C22 16 12 22 12 22Z" fill="url(#gradient3)" stroke="currentColor" strokeWidth="1"/>
      <path d="M9 12L11 14L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Radar: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="url(#gradient4)" strokeWidth="1" fill="none"/>
      <circle cx="12" cy="12" r="6" stroke="url(#gradient4)" strokeWidth="1" fill="none"/>
      <circle cx="12" cy="12" r="2" fill="url(#gradient4)"/>
      <path d="M12 2L12 12L18 18" stroke="url(#gradient4)" strokeWidth="2"/>
      <defs>
        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  )
};

const features = [
  {
    icon: FeatureIcons.Sparkles,
    title: "AI-Powered Discovery",
    description: "Analyzes your website to find customers based on actual problems, not just keywords.",
    gradient: "from-orange-500 to-orange-600"
  },
  {
    icon: FeatureIcons.Zap,
    title: "Intent-Based Scoring",
    description: "Prioritizes solution-seekers with clear pain points at the top of your feed.",
    gradient: "from-orange-600 to-red-500"
  },
  {
    icon: FeatureIcons.Shield,
    title: "Context-Aware Replies",
    description: "Generates authentic responses tailored to each subreddit's culture.",
    gradient: "from-red-500 to-orange-500"
  },
  {
    icon: FeatureIcons.Radar,
    title: "Competitor Monitoring",
    description: "Alerts you when users express frustration with competitors.",
    gradient: "from-orange-500 to-amber-500"
  }
];

export const Features = () => {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-white via-orange-50/20 to-white overflow-hidden">
      {/* 2025 Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.03),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_49%,rgba(249,115,22,0.01)_50%,transparent_51%)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2025 Modern Header with Enhanced Gradients */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black mb-4 leading-[1.1] ${poppins.className}`}
          >
            <motion.span 
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ backgroundSize: "200% 100%" }}
            >
              Features
            </motion.span>{" "}
            You{" "}
            <motion.span 
              className="bg-gradient-to-r from-red-500 via-orange-600 to-orange-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 2
              }}
              style={{ backgroundSize: "200% 100%" }}
            >
              Can't Miss
            </motion.span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-xl text-black/60 max-w-2xl mx-auto ${inter.className}`}
          >
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent font-semibold">
              AI-driven
            </span>{" "}
            capabilities that transform{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-600 to-orange-500 bg-clip-text text-transparent font-semibold">
              Reddit
            </span>{" "}
            into your lead generation channel
          </motion.p>
        </div>

        {/* 2025 Modern Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Modern Glass Card with Gradient Border */}
              <div className="relative h-full bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.12)] transition-all duration-500 overflow-hidden">
                
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                  <div className="h-full w-full bg-white/80 backdrop-blur-xl rounded-2xl"></div>
                </div>
                
                {/* Floating Gradient Orb */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
                
                <div className="relative z-10 text-center">
                  {/* Modern Icon Container */}
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-orange-600 group-hover:text-orange-700 transition-colors duration-300">
                      <feature.icon />
                    </div>
                  </motion.div>

                  {/* Enhanced Typography */}
                  <h3 className={`text-lg font-bold text-black mb-3 group-hover:text-orange-900 transition-colors duration-300 ${poppins.className}`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm text-black/60 leading-relaxed ${inter.className}`}>
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
