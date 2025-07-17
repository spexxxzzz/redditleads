// frontend/components/onboarding/MainFlow.tsx

"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step1_AnalyzeUrl } from './Step1_AnalyzeUrl';
import { Step2_ConfirmDetails } from './Step2_ConfirmDetails';
import { Step3_Success } from './Step3_Success';
import { Inter, Poppins } from 'next/font/google';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

export interface AnalysisResult {
  websiteUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
}

export const OnboardingFlow = () => {
  const { getToken } = useAuth(); // Use the Clerk hook
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This endpoint can remain public as it's the first step
      const response = await fetch('http://localhost:5000/api/onboarding/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze website.');
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (details: { description: string; keywords: string[]; competitors: string[] }) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken(); // Get the authentication token

      const response = await fetch('http://localhost:5000/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the Authorization header
        },
        body: JSON.stringify({
          // The userId is no longer needed in the body; the backend gets it from the token
          websiteUrl: analysisResult?.websiteUrl,
          generatedDescription: details.description,
          generatedKeywords: details.keywords,
          competitors: details.competitors,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding.');
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Analyze Website", description: "AI analyzes your site" },
    { number: 2, title: "Confirm Details", description: "Review & customize" },
    { number: 3, title: "Complete Setup", description: "Start finding leads" }
  ];

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* ... (Rest of the JSX remains the same) ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-4xl sm:text-5xl font-black tracking-tighter text-primary mb-4 ${poppins.className}`}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              RedLead
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-xl text-primary/80 max-w-2xl mx-auto ${inter.className}`}
          >
            Let's set up your AI-powered Reddit lead generation in just 3 simple steps
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {steps.map((stepInfo, index) => (
              <motion.div 
                key={stepInfo.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center flex-1"
              >
                <div className="relative flex items-center w-full">
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-500 ${
                    step >= stepInfo.number 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                      : 'bg-white/90 text-primary border border-primary/40'
                  }`}>
                    {step > stepInfo.number ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <span className={poppins.className}>{stepInfo.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className="h-1 bg-primary/30 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: step > stepInfo.number ? "100%" : "0%" }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center mt-4 max-w-32">
                  <h3 className={`text-sm font-bold text-primary mb-1 ${poppins.className}`}>
                    {stepInfo.title}
                  </h3>
                  <p className={`text-xs text-primary/70 ${inter.className}`}>
                    {stepInfo.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 pb-20">
        <motion.div 
          className="w-full max-w-2xl bg-white rounded-3xl p-10 shadow-lg"
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Step1_AnalyzeUrl 
                  onAnalyze={handleAnalyze} 
                  isLoading={isLoading} 
                  error={error} 
                />
              </motion.div>
            )}
            {step === 2 && analysisResult && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Step2_ConfirmDetails
                  analysisResult={analysisResult}
                  onComplete={handleComplete}
                  isLoading={isLoading}
                  error={error}
                  onBack={() => {
                    setError(null);
                    setStep(1);
                  }}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Step3_Success />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <style jsx>{`
        .bg-cream {
          background-color: #fffaf0;
        }
        .text-primary {
          color: #b45309; /* warm orange */
        }
      `}</style>
    </div>
  );
};