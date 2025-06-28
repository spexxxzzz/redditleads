"use client";
import React from "react";
import { motion } from "framer-motion";
import { Globe, Brain, Target, MessageSquare, TrendingUp } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const steps = [
  {
    icon: Globe,
    title: "Connect Your Business",
    description: "Simply enter your website URL. Our AI analyzes your business and automatically generates relevant keywords and target subreddits.",
    detail: "No manual setup required - we understand your business in seconds"
  },
  {
    icon: Brain,
    title: "AI Monitors Reddit 24/7",
    description: "Our intelligent system continuously scans Reddit for warm leads discussing problems your product solves.",
    detail: "Advanced AI identifies high-intent prospects and competitor mentions"
  },
  {
    icon: Target,
    title: "Get Qualified Leads",
    description: "Receive a curated inbox of potential customers actively seeking solutions like yours, scored by opportunity level.",
    detail: "Only see leads that matter - filtered by intent and relevance"
  },
  {
    icon: MessageSquare,
    title: "Engage Naturally",
    description: "Get AI-generated reply suggestions that match each subreddit's culture and tone for authentic engagement.",
    detail: "Professional responses that don't sound like spam"
  },
  {
    icon: TrendingUp,
    title: "Track Performance",
    description: "Monitor your engagement success and discover new market insights to refine your lead generation strategy.",
    detail: "Data-driven insights to improve your conversion rates"
  }
];

export const HowItWorks = () => {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-orange-50 to-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-2 h-2 bg-orange-300 rounded-full opacity-30"></div>
        <div className="absolute bottom-40 right-20 w-2 h-2 bg-orange-300 rounded-full opacity-30"></div>
        <div className="absolute top-60 right-40 w-1 h-1 bg-orange-400 rounded-full opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-orange-50 backdrop-blur-sm border border-orange-200 shadow-sm mb-8">
            <Brain className="w-5 h-5 text-orange-600" />
            <span className={`text-lg font-semibold text-black ${poppins.className}`}>Simple Process</span>
          </div>
          
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black mb-8 leading-[1.1] ${poppins.className}`}>
            From Setup to{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Sales Ready
            </span>
          </h2>
          
          <p className={`text-xl md:text-2xl text-black max-w-3xl mx-auto leading-relaxed font-medium ${inter.className}`}>
            RedLead transforms Reddit into your personal lead generation machine in just minutes
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-200 hidden lg:block"></div>
          
          <div className="space-y-16 lg:space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 relative">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                      {index + 1}
                    </div>
                    
                    {/* Icon Container */}
                    <div className="w-16 h-16 bg-white border-2 border-orange-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <h3 className={`text-2xl lg:text-3xl font-bold text-black ${poppins.className}`}>
                      {step.title}
                    </h3>
                    
                    <p className={`text-lg lg:text-xl text-black leading-relaxed font-medium ${inter.className}`}>
                      {step.description}
                    </p>
                    
                    <p className={`text-base text-orange-600 ${inter.className}`}>
                      {step.detail}
                    </p>
                  </div>

                  {/* Visual Element Removed */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-orange-200 shadow-lg p-12">
            <h3 className={`text-3xl lg:text-4xl font-bold text-black mb-6 ${poppins.className}`}>
              Ready to turn Reddit into your lead machine?
            </h3>
            
            <p className={`text-lg text-black mb-8 max-w-2xl mx-auto ${inter.className}`}>
              Join 500+ founders who've already discovered their next customers on Reddit
            </p>
            
            <button className={`bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:shadow-lg ${poppins.className}`}>
              Start Finding Leads Now
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
