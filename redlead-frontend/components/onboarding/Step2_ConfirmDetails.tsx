"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from './MainFlow';
import { ArrowLeft, ArrowRight, Check, Loader, X, AlertCircle, Sparkles, Plus } from 'lucide-react';

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
          className="flex-grow h-12 px-4 bg-orange-50 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all"
        />
        <button 
          onClick={() => handleAdd(type)}
          className="px-6 py-3 bg-orange-100 text-orange-700 border-2 border-orange-200 rounded-xl hover:bg-orange-200 transition-all flex items-center gap-2 font-medium"
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
              className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 text-sm font-medium px-3 py-2 rounded-full border border-orange-200"
            >
              {item}
              <button 
                onClick={() => handleRemove(type, item)}
                className="bg-orange-200 rounded-full p-1 hover:bg-orange-300 transition-colors"
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200 mb-6">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">Step 2 of 3</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-orange-900 mb-4">
          Fine-tune your{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            strategy
          </span>
        </h1>
        
        <p className="text-lg text-orange-800/80 mb-4">
          Our AI analyzed{" "}
          <span className="text-orange-600 font-medium">{analysisResult.websiteUrl}</span>.{" "}
          Review and customize the details below.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-xl shadow-orange-100/30 space-y-8">
        
        {/* Product Description */}
        <div>
          <label className="block text-lg font-semibold text-orange-900 mb-4">
            Product Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-4 bg-orange-50 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all resize-none"
            placeholder="Describe what your product does and who it's for..."
          />
        </div>

        {/* Target Keywords */}
        <div>
          <label className="block text-lg font-semibold text-orange-900 mb-2">
            Target Keywords
          </label>
          <p className="text-sm text-orange-400 mb-4">
            Keywords that describe your product or the problems it solves
          </p>
          {renderTagInput('keywords', keywords)}
        </div>

        {/* Competitors */}
        <div>
          <label className="block text-lg font-semibold text-orange-900 mb-2">
            Competitors
          </label>
          <p className="text-sm text-orange-400 mb-4">
            Add competitor websites or brand names to monitor for lead opportunities
          </p>
          {renderTagInput('competitors', competitors)}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 text-orange-400 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <style jsx>{`
        body, .bg-cream {
          background-color: #fffaf0;
        }
      `}</style>
    </motion.div>
  );
};
