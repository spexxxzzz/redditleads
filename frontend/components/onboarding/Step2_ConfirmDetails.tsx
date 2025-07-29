// frontend/components/onboarding/Step2_ConfirmDetails.tsx
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from './MainFlow';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  RocketLaunchIcon,
  Cog6ToothIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Inter, Poppins } from 'next/font/google';
import { LoaderFive } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Professional campaign launch loader - clean version
const CampaignLaunchLoader = () => {
  return (
    <div className="space-y-6">
      <LoaderFive text="Launching your campaign..." />
      
      <div className="space-y-4 mt-8">
        {[
          { text: "Configuring monitoring systems", delay: 0 },
          { text: "Setting up AI filters", delay: 1.2 },
          { text: "Activating lead detection", delay: 2.4 }
        ].map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: stage.delay, duration: 0.6 }}
            className="text-center"
          >
            <motion.span 
              className={`text-lg font-medium text-gray-400 ${inter.className}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity, 
                delay: stage.delay * 0.3,
                ease: "easeInOut" 
              }}
            >
              {stage.text}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

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
          className={`flex-grow h-12 px-4 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all text-white placeholder-gray-500 hover:border-zinc-700 ${inter.className}`}
        />
        <Button 
          onClick={() => handleAdd(type)}
          variant="outline"
          className="px-6 py-3 bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-400 transition-all flex items-center gap-2 font-semibold"
        >
          <PlusIcon className="w-4 h-4" />
          Add
        </Button>
      </div>
      
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map(item => (
            <motion.div 
              key={item} 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-orange-500/10 text-orange-400 text-sm font-medium px-3 py-2 rounded-full border border-orange-500/20"
            >
              <span className={inter.className}>{item}</span>
              <button 
                onClick={() => handleRemove(type, item)}
                className="bg-orange-400/20 rounded-full p-1 hover:bg-orange-400/30 transition-colors"
              >
                <XMarkIcon className="w-3 h-3" />
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
      {/* Clean Header */}
      <div className="text-center mb-12">
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 mb-6">
          Step 2 of 3
        </Badge>
        
        <h1 className={`text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4 ${poppins.className}`}>
          Fine-tune your{" "}
          <span className="text-orange-500">
            strategy
          </span>
        </h1>
        
        <p className={`text-lg text-gray-400 mb-4 ${inter.className}`}>
          Our AI analyzed{" "}
          <span className="text-orange-400 font-medium">{analysisResult.websiteUrl}</span>.{" "}
          Review and customize the details below.
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <CardContent className="p-8 sm:p-12">
          {!isLoading ? (
            <div className="space-y-8">
              {/* Product Description */}
              <div className="space-y-4">
                <label className={`block text-lg font-semibold text-white ${inter.className}`}>
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full p-4 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-all resize-none text-white placeholder-gray-500 hover:border-zinc-700 ${inter.className}`}
                  placeholder="Describe what your product does and who it's for..."
                />
              </div>

              {/* Target Keywords */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-lg font-semibold text-white mb-2 ${inter.className}`}>
                    Target Keywords
                  </label>
                  <p className={`text-sm text-gray-400 mb-4 ${inter.className}`}>
                    Keywords that describe your product or the problems it solves
                  </p>
                </div>
                {renderTagInput('keywords', keywords)}
              </div>

              {/* Competitors */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-lg font-semibold text-white mb-2 ${inter.className}`}>
                    Competitors
                  </label>
                  <p className={`text-sm text-gray-400 mb-4 ${inter.className}`}>
                    Add competitor websites or brand names to monitor for lead opportunities
                  </p>
                </div>
                {renderTagInput('competitors', competitors)}
              </div>

              {/* Error Display */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Alert className="bg-red-500/10 border-red-500/30 text-red-300">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                    <AlertDescription className={inter.className}>
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white hover:bg-zinc-900"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transform-gpu active:scale-[0.98]"
                >
                  <CheckIcon className="w-5 h-5" />
                  <span>Launch My Campaign</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ) : (
            /* Professional Loading State */
            <div className="text-center py-16">
              <CampaignLaunchLoader />
              
              <Card className="mt-8 bg-orange-500/5 border-orange-500/20">
                <CardContent className="p-4">
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Setting up your personalized Reddit monitoring system...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
