"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Step3_Success: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/connect-reddit';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="text-center max-w-2xl mx-auto relative"
    >
      {/* Success Icon */}
      <div className="relative mb-10 inline-block">
        <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 mx-auto border border-green-400/30 backdrop-blur-sm">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full flex items-center justify-center border border-green-400/40 backdrop-blur-sm">
            <Check className="w-14 h-14 text-green-400" />
          </div>
        </div>
        
        {/* Floating sparkles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -top-3 -right-3"
        >
          <Sparkles className="w-8 h-8 text-orange-400" />
        </motion.div>
      </div>

      {/* Success Message Card */}
      <div className="relative group">
        {/* Glow effects */}
        <div className="absolute -inset-6 bg-gradient-radial from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
        <div className="absolute -inset-3 bg-gradient-radial from-orange-400/15 via-orange-300/5 to-transparent rounded-3xl blur-lg transition-transform duration-500" />
        
        <div className="relative bg-[#1a1a1b] rounded-3xl p-8 sm:p-12 border border-white/10 backdrop-blur-sm shadow-2xl">
          <h1 className={`text-4xl sm:text-5xl font-black text-white mb-6 ${poppins.className}`}>
            🎉 You're all set!
          </h1>
          
          <p className={`text-xl text-white/80 mb-10 leading-relaxed ${inter.className}`}>
            Your Reddit lead generation campaign is now live. We're already scanning thousands of conversations to find your perfect customers.
          </p>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-400/30 backdrop-blur-sm hover:bg-orange-500/15 transition-colors">
              <div className={`text-3xl font-black text-orange-400 mb-1 ${poppins.className}`}>15,000+</div>
              <div className={`text-sm text-orange-300/80 font-medium ${inter.className}`}>Subreddits monitored</div>
            </div>
            <div className="bg-green-500/10 rounded-2xl p-6 border border-green-400/30 backdrop-blur-sm hover:bg-green-500/15 transition-colors">
              <div className={`text-3xl font-black text-green-400 mb-1 ${poppins.className}`}>24/7</div>
              <div className={`text-sm text-green-300/80 font-medium ${inter.className}`}>Active monitoring</div>
            </div>
            <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/15 transition-colors">
              <div className={`text-3xl font-black text-blue-400 mb-1 ${poppins.className}`}>Real-time</div>
              <div className={`text-sm text-blue-300/80 font-medium ${inter.className}`}>Lead alerts</div>
            </div>
          </div>

          {/* Redirect Info */}
          <div className={`flex items-center justify-center gap-3 text-orange-300 mb-8 font-medium ${inter.className}`}>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <span>Redirecting to connect Reddit in a few seconds...</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary: Connect Reddit Button */}
            <button
              onClick={() => window.location.href = '/connect-reddit'}
              className={`group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] ${inter.className}`}
            >
              <span>Connect Reddit Account</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary: Skip to Dashboard Button */}
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={`group inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white border border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all duration-200 ${inter.className}`}
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip to Dashboard</span>
            </button>
          </div>

          {/* Helper text */}
          <p className={`text-sm text-white/50 mt-6 ${inter.className}`}>
            You can connect your Reddit account later in settings
          </p>
        </div>
      </div>
    </motion.div>
  );
};
