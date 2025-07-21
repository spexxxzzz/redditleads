"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Sparkles, Globe } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface Props {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const Step1_AnalyzeUrl = ({ onAnalyze, isLoading, error }: Props) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !isLoading) {
      onAnalyze(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-400/30 mb-6 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className={`text-sm font-medium text-orange-300 ${inter.className}`}>Step 1 of 3</span>
        </div>
        
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6 ${poppins.className}`}>
          Tell us about your{" "}
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            product
          </span>
        </h1>
        
        <p className={`text-xl text-white/80 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
          Share your website URL and our AI will analyze your product to create the perfect Reddit lead generation strategy.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="relative group">
        {/* Glow effects */}
        <div className="absolute -inset-6 bg-gradient-radial from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
        <div className="absolute -inset-3 bg-gradient-radial from-orange-400/15 via-orange-300/5 to-transparent rounded-3xl blur-lg transition-transform duration-500" />
        
        <div className="relative bg-[#1a1a1b] rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* URL Input */}
            <div className="relative">
              <label className={`block text-lg font-semibold text-white mb-4 ${inter.className}`}>
                Website URL
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400">
                  <Globe className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-awesome-product.com"
                  className={`w-full h-16 pl-12 pr-6 text-lg bg-white/5 border-2 border-white/20 rounded-2xl shadow-inner focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:outline-none transition-all text-white placeholder-white/50 hover:border-white/30 ${inter.className}`}
                  disabled={isLoading}
                  required
                />
              </div>
              <p className={`text-sm text-white/60 mt-2 ${inter.className}`}>
                We'll analyze your landing page, features, and target audience
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading || !url}
                className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] ${inter.className}`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Analyzing your website...
                  </>
                ) : (
                  <>
                    <span>Analyze My Website</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className={`text-red-300 ${inter.className}`}>{error}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-center mt-8">
        <p className={`text-sm text-white/60 ${inter.className}`}>
          This usually takes 10-30 seconds • We never store your data without permission
        </p>
      </div>
    </motion.div>
  );
};
