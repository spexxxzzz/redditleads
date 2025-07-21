"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from './MainFlow';
import { ArrowLeft, ArrowRight, Check, Loader, X, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface Props {
  analysisResult: AnalysisResult;
  onComplete: (details: { description: string; keywords: string[]; competitors: string[] }) => void;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
}

export const Step2_ConfirmDetails = ({ analysisResult, onComplete, isLoading, error, onBack }: Props) => {
  const [description, setDescription] = useState(analysisResult.generatedDescription);
  const [keywords, setKeywords] = useState(analysisResult.generatedKeywords);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState({ keywords: '', competitors: '' });

  const handleAdd = (type: 'keywords' | 'competitors') => {
    const value = inputValue[type].trim();
    if (value) {
      if (type === 'keywords' && !keywords.includes(value)) {
        setKeywords([...keywords, value]);
      }
      if (type === 'competitors' && !competitors.includes(value)) {
        setCompetitors([...competitors, value]);
      }
      setInputValue({ ...inputValue, [type]: '' });
    }
  };

  const handleRemove = (type: 'keywords' | 'competitors', itemToRemove: string) => {
    if (type === 'keywords') setKeywords(keywords.filter(k => k !== itemToRemove));
    if (type === 'competitors') setCompetitors(competitors.filter(c => c !== itemToRemove));
  };

  const handleSubmit = () => {
    onComplete({ description, keywords, competitors });
  };

  const renderTagInput = (type: 'keywords' | 'competitors', list: string[]) => (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue[type]}
          onChange={(e) => setInputValue({ ...inputValue, [type]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd(type))}
          placeholder={type === 'keywords' ? 'e.g., project management' : 'e.g., notion.so'}
          className={`flex-grow h-12 px-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:outline-none transition-all text-white placeholder-white/50 hover:border-white/30 ${inter.className}`}
        />
        <button 
          onClick={() => handleAdd(type)}
          className={`px-6 py-3 bg-white/10 text-white border-2 border-white/20 rounded-xl hover:bg-white/20 hover:border-orange-400/50 transition-all flex items-center gap-2 font-medium backdrop-blur-sm ${inter.className}`}
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map(item => (
            <motion.div 
              key={item} 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-200 text-sm font-medium px-3 py-2 rounded-full border border-orange-400/30 backdrop-blur-sm ${inter.className}`}
            >
              {item}
              <button 
                onClick={() => handleRemove(type, item)}
                className="bg-orange-400/20 rounded-full p-1 hover:bg-orange-400/30 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-400/30 mb-6 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className={`text-sm font-medium text-orange-300 ${inter.className}`}>Step 2 of 3</span>
        </div>
        
        <h1 className={`text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 ${poppins.className}`}>
          Fine-tune your{" "}
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            strategy
          </span>
        </h1>
        
        <p className={`text-lg text-white/80 mb-4 ${inter.className}`}>
          Our AI analyzed{" "}
          <span className="text-orange-400 font-medium">{analysisResult.websiteUrl}</span>.{" "}
          Review and customize the details below.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="relative group">
        {/* Glow effects */}
        <div className="absolute -inset-6 bg-gradient-radial from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
        <div className="absolute -inset-3 bg-gradient-radial from-orange-400/15 via-orange-300/5 to-transparent rounded-3xl blur-lg transition-transform duration-500" />
        
        <div className="relative bg-[#1a1a1b] rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-sm shadow-2xl space-y-8">
          
          {/* Product Description */}
          <div>
            <label className={`block text-lg font-semibold text-white mb-4 ${inter.className}`}>
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`w-full p-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 focus:outline-none transition-all resize-none text-white placeholder-white/50 hover:border-white/30 ${inter.className}`}
              placeholder="Describe what your product does and who it's for..."
            />
          </div>

          {/* Target Keywords */}
          <div>
            <label className={`block text-lg font-semibold text-white mb-2 ${inter.className}`}>
              Target Keywords
            </label>
            <p className={`text-sm text-white/60 mb-4 ${inter.className}`}>
              Keywords that describe your product or the problems it solves
            </p>
            {renderTagInput('keywords', keywords)}
          </div>

          {/* Competitors */}
          <div>
            <label className={`block text-lg font-semibold text-white mb-2 ${inter.className}`}>
              Competitors
            </label>
            <p className={`text-sm text-white/60 mb-4 ${inter.className}`}>
              Add competitor websites or brand names to monitor for lead opportunities
            </p>
            {renderTagInput('competitors', competitors)}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className={`text-red-300 ${inter.className}`}>{error}</span>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              onClick={onBack}
              className={`inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-orange-400 transition-colors ${inter.className}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] ${inter.className}`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Launching Campaign...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Launch My Campaign</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
