"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Step3_Success: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="text-center max-w-2xl mx-auto bg-cream rounded-3xl p-10 shadow-lg relative"
    >
      {/* Success Icon */}
      <div className="relative mb-10 inline-block">
        <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-green-400/30 mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full flex items-center justify-center">
            <Check className="w-14 h-14 text-green-600" />
          </div>
        </div>
        
        {/* Floating sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -top-3 -right-3"
        >
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>
      </div>

      {/* Success Message Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-xl shadow-orange-100/40">
        <h1 className={`text-4xl sm:text-5xl font-bold text-orange-900 mb-6 ${poppins.className}`}>
          🎉 You're all set!
        </h1>
        
        <p className={`text-xl text-orange-800/90 mb-10 leading-relaxed ${inter.className}`}>
          Your Reddit lead generation campaign is now live. We're already scanning thousands of conversations to find your perfect customers.
        </p>

        {/* Stats Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
            <div className="text-3xl font-extrabold text-orange-600 mb-1">15,000+</div>
            <div className="text-sm text-orange-500 font-medium">Subreddits monitored</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="text-3xl font-extrabold text-green-600 mb-1">24/7</div>
            <div className="text-sm text-green-500 font-medium">Active monitoring</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="text-3xl font-extrabold text-blue-600 mb-1">Real-time</div>
            <div className="text-sm text-blue-500 font-medium">Lead alerts</div>
          </div>
        </div>

        {/* Redirect Info */}
        <div className="flex items-center justify-center gap-3 text-orange-600 mb-8 font-medium">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <span>Redirecting to your dashboard in a few seconds...</span>
        </div>

        {/* Manual Continue Button */}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <style jsx>{`
        .bg-cream {
          background-color: #fffaf0;
        }
      `}</style>
    </motion.div>
  );
};
