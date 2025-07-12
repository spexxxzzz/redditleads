"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader, AlertCircle, Sparkles, Globe } from 'lucide-react';

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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200 mb-6">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">Step 1 of 3</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-orange-900 mb-6">
          Tell us about your{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            product
          </span>
        </h1>
        
        <p className="text-xl text-orange-800/80 max-w-2xl mx-auto leading-relaxed">
          Share your website URL and our AI will analyze your product to create the perfect Reddit lead generation strategy.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-xl shadow-orange-100/30">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* URL Input */}
          <div className="relative">
            <label className="block text-lg font-semibold text-orange-900 mb-4">
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
                className="w-full h-16 pl-12 pr-6 text-lg bg-orange-50 border-2 border-orange-200 rounded-2xl shadow focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all"
                disabled={isLoading}
                required
              />
            </div>
            <p className="text-sm text-orange-400 mt-2">
              We'll analyze your landing page, features, and target audience
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading || !url}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-center mt-8">
        <p className="text-sm text-orange-400">
          This usually takes 10-30 seconds • We never store your data without permission
        </p>
      </div>

      <style jsx>{`
        body, .bg-cream {
          background-color: #fffaf0;
        }
      `}</style>
    </motion.div>
  );
};
