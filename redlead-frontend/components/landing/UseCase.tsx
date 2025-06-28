"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaReddit } from "react-icons/fa";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const useCases = [
  {
    title: "AI & SaaS Tools",
    lead: `"I'm looking for a Calendly alternative that has better team features. Any suggestions?"`,
    subreddit: "r/saas",
    color: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100"
  },
  {
    title: "Local Business",
    lead: `"Where can I find the best artisan coffee in downtown? Looking for a cozy spot to work."`,
    subreddit: "r/Coffee",
    color: "from-amber-600 to-orange-600",
    bgGradient: "from-amber-50 to-orange-100"
  },
  {
    title: "E-commerce Brands",
    lead: `"Where can I buy high-quality, ethically sourced products online?"`,
    subreddit: "r/BuyItForLife",
    color: "from-purple-400 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100"
  },
  {
    title: "Game Developers",
    lead: `"My friends and I are looking for a new co-op indie game to play on Steam, any hidden gems?"`,
    subreddit: "r/gamingsuggestions",
    color: "from-red-400 to-red-600",
    bgGradient: "from-red-50 to-red-100"
  },
  {
    title: "Creative Agencies",
    lead: `"We need to hire a freelance graphic designer for a new branding project. Where's the best place to find talent?"`,
    subreddit: "r/forhire",
    color: "from-pink-400 to-pink-600",
  },
  {
    title: "Tech Startups",
    lead: `"I'm so frustrated with current solutions. Are there any better alternatives for building modern apps?"`,
    subreddit: "r/programming",
    color: "from-green-400 to-green-600",
    bgGradient: "from-green-50 to-green-100"
  },
];

export const UseCases = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % useCases.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % useCases.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + useCases.length) % useCases.length);

  return (
    <>
      {/* Tailwind CSS v4 CSS-first configuration */}
      <style jsx global>{`
        @import "tailwindcss";
        
        @theme {
          --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
          --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
          --color-orange-primary: oklch(0.84 0.18 117.33);
          --color-orange-secondary: oklch(0.53 0.12 118.34);
        }
        
        .modern-nav-button {
          background: color-mix(in oklch, white 60%, transparent);
          backdrop-filter: blur(var(--blur-xl));
          border: 1px solid color-mix(in oklch, white 20%, transparent);
          box-shadow: 0 8px 32px color-mix(in oklch, black 6%, transparent);
          transition: all 0.5s var(--ease-fluid);
        }
        
        .modern-nav-button:hover {
          box-shadow: 0 16px 48px color-mix(in oklch, black 12%, transparent);
          transform: scale(1.1);
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, color-mix(in oklch, white 20%, transparent), transparent);
          transform: translateX(-100%);
          transition: transform 1s var(--ease-fluid);
        }
        
        .modern-nav-button:hover .shimmer-effect {
          transform: translateX(100%);
        }
        
        .progress-gradient {
          stroke: color-mix(in oklch, var(--color-orange-primary) 100%, transparent);
        }
        
        @keyframes morphArrowLeft {
          0%, 100% { transform: translateX(-1px); }
          50% { transform: translateX(1px); }
        }
        
        @keyframes morphArrowRight {
          0%, 100% { transform: translateX(1px); }
          50% { transform: translateX(-1px); }
        }
        
        .morph-arrow-left {
          animation: morphArrowLeft 2s ease-in-out infinite;
        }
        
        .morph-arrow-right {
          animation: morphArrowRight 2s ease-in-out infinite;
        }
      `}</style>

      <section className="relative h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full px-8 max-w-6xl mx-auto">
          
          {/* Content Area */}
          <div className="relative w-full h-96 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-6"
              >
                <h3 className={`text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-r ${useCases[currentIndex].color} bg-clip-text text-transparent ${poppins.className}`}>
                  {useCases[currentIndex].title}
                </h3>
                
                <p className={`text-2xl lg:text-3xl xl:text-4xl text-gray-500 leading-relaxed italic font-medium max-w-4xl ${inter.className}`}>
                  "{useCases[currentIndex].lead}"
                </p>

                <div className="inline-flex items-center gap-4 text-xl lg:text-2xl font-semibold text-gray-400 bg-white/80 backdrop-blur-sm py-3 px-6 rounded-full border border-white/50 shadow-lg">
                  <span>Found in</span>
                  <span className={`font-bold text-slate-800 inline-flex items-center gap-2 bg-gradient-to-r ${useCases[currentIndex].color} bg-clip-text text-transparent`}>
                    <FaReddit className="w-5 h-5 text-orange-500" />
                    {useCases[currentIndex].subreddit}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ultra-Modern 2025 Navigation Controls */}
          <div className="flex items-center gap-8 mt-8">
            {/* Previous Button - Tailwind v4 Style */}
            <motion.button 
              onClick={goToPrev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="modern-nav-button group relative w-14 h-14 rounded-2xl overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'color-mix(in oklch, var(--color-orange-primary) 10%, transparent)'
                }}
              />
              
              {/* Morphing Arrow */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="morph-arrow-left text-black/70 group-hover:text-orange-600 transition-colors duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="shimmer-effect absolute inset-0" />
            </motion.button>

            {/* Modern Progress Ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                {/* Background Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Progress Ring */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="progress-gradient"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - (currentIndex + 1) / useCases.length)}`}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>
              
              {/* Center Counter */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span 
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-sm font-bold text-black/70 ${poppins.className}`}
                >
                  {currentIndex + 1}/{useCases.length}
                </motion.span>
              </div>
            </div>

            {/* Next Button - Tailwind v4 Style */}
            <motion.button 
              onClick={goToNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="modern-nav-button group relative w-14 h-14 rounded-2xl overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'color-mix(in oklch, var(--color-orange-primary) 10%, transparent)'
                }}
              />
              
              {/* Morphing Arrow */}
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="morph-arrow-right text-black/70 group-hover:text-orange-600 transition-colors duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Shimmer Effect */}
              <div className="shimmer-effect absolute inset-0" />
            </motion.button>
          </div>

          {/* Modern Dot Indicators */}
          <div className="flex gap-3 mt-8">
            {useCases.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="relative group"
              >
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === currentIndex 
                      ? 'scale-150' 
                      : 'hover:bg-black/40'
                  }`}
                  style={{
                    background: index === currentIndex 
                      ? 'linear-gradient(to right, var(--color-orange-primary), var(--color-orange-secondary))'
                      : 'color-mix(in oklch, black 20%, transparent)'
                  }}
                />
                
                {/* Glow Effect for Active */}
                {index === currentIndex && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 w-2 h-2 rounded-full blur-sm"
                    style={{
                      background: 'color-mix(in oklch, var(--color-orange-primary) 30%, transparent)'
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
