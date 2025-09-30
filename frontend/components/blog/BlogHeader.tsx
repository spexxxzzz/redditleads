"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { ArrowRight, Calendar, User, TrendingUp } from "lucide-react";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const BlogHeader: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Black Background */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 ${inter.className}`}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Latest Insights
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 ${poppins.className}`}
          >
            RedditLeads
            <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Success Stories
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed ${inter.className}`}
          >
            Discover how entrepreneurs, founders, and growth teams are finding their first customers and scaling their businesses using RedditLeads.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="flex items-center text-white/60 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span className={inter.className}>Updated weekly</span>
            </div>
            <div className="flex items-center text-white/60 text-sm">
              <User className="w-4 h-4 mr-2" />
              <span className={inter.className}>Real founder stories</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
