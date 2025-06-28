"use client";
import React from "react";
import { motion } from "framer-motion";
import { Globe, Brain, Target, MessageSquare, TrendingUp } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const steps = [
  {
    icon: Globe,
    title: "Connect",
    description: "Enter your URL, AI analyzes your business"
  },
  {
    icon: Brain,
    title: "Monitor",
    description: "AI scans Reddit 24/7 for warm leads"
  },
  {
    icon: Target,
    title: "Qualify",
    description: "Get scored leads in your inbox"
  },
  {
    icon: MessageSquare,
    title: "Engage",
    description: "AI-generated authentic replies"
  },
  {
    icon: TrendingUp,
    title: "Convert",
    description: "Track performance & insights"
  }
];

export const HowItWorks = () => {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 overflow-hidden">
      {/* Enhanced Background with SaaS-style patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.02]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-15"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header with 2025 Animations */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg mb-8"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
            <span className={`text-lg font-semibold text-black ${poppins.className}`}>Simple Process</span>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black mb-6 leading-[1.1] ${poppins.className}`}
          >
            From Setup to{" "}
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
              viewport={{ once: true }}
              className="relative inline-block"
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent"
                style={{ backgroundSize: "200% 100%" }}
              >
                Sales Ready
              </motion.span>
              
              {/* Subtle glow effect */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent blur-sm -z-10"
              >
                Sales Ready
              </motion.div>
            </motion.span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className={`text-xl text-black/70 max-w-2xl mx-auto leading-relaxed font-medium ${inter.className}`}
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Transform Reddit into your lead generation machine in 5 simple steps
            </motion.span>
          </motion.p>
        </div>

        {/* Enhanced Horizontal Steps with Neon Light Beam Animation */}
        <div className="relative mb-16">
          {/* Connection Line with Neon Light Beam */}
          <div className="absolute top-10 left-10 right-10 h-0.5 bg-orange-300 rounded-full overflow-hidden hidden lg:block">
            {/* Neon Moving Light Beam */}
            <div 
              className="absolute top-0 h-full w-16 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #ff4da6, #ff4da6, transparent)',
                boxShadow: `
                  0 0 5px #fff,
                  0 0 10px #fff,
                  0 0 15px #ff4da6,
                  0 0 20px #ff4da6,
                  0 0 35px #ff4da6,
                  0 0 40px #ff4da6,
                  0 0 50px #ff4da6,
                  0 0 75px #ff4da6
                `,
                filter: 'brightness(4.0)',
                animation: 'neonBeam 2.5s ease-in-out infinite'
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Step Container with Perfect Alignment */}
                <div className="flex flex-col items-center text-center relative">
                  {/* Step Number & Icon Container - Perfectly Aligned */}
                  <div className="relative mb-6">
                    {/* Step Number - Aligned to top-right */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold z-20 shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Icon Container with Enhanced Styling */}
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm border-2 border-orange-200 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                      <step.icon className="w-9 h-9 text-orange-600 group-hover:text-orange-700 transition-colors" />
                    </div>
                  </div>

                  {/* Content with Enhanced Typography */}
                  <div className="space-y-3">
                    <h3 className={`text-xl font-bold text-black group-hover:text-orange-900 transition-colors ${poppins.className}`}>
                      {step.title}
                    </h3>
                    
                    <p className={`text-sm text-black/60 leading-relaxed max-w-[140px] ${inter.className}`}>
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Enhanced Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fixed CTA with Proper Sizing */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200 shadow-xl p-8 max-w-2xl mx-auto overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white opacity-50"></div>
            
            <div className="relative z-10">
              <h3 className={`text-2xl lg:text-3xl font-bold text-black mb-3 ${poppins.className}`}>
                Ready to start finding leads?
              </h3>
              
              <p className={`text-base text-black/70 mb-6 ${inter.className}`}>
                Join 500+ founders who've discovered their next customers on Reddit
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button className={`group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl text-base transition-all duration-300 hover:shadow-xl hover:scale-105 ${poppins.className}`}>
                  Start Finding Leads Now
                </button>
                
                <span className={`text-xs text-black/50 ${inter.className}`}>
                  No credit card required • 5-minute setup
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CSS Animation for the neon beam effect */}
      <style jsx>{`
        @keyframes neonBeam {
          0% { 
            left: -64px; 
            opacity: 0;
            box-shadow: 
              0 0 5px #fff,
              0 0 10px #fff,
              0 0 15px #ff4da6,
              0 0 20px #ff4da6,
              0 0 35px #ff4da6,
              0 0 40px #ff4da6;
          }
          10% { 
            opacity: 1;
            box-shadow: 
              0 0 10px #fff,
              0 0 20px #fff,
              0 0 25px #ff4da6,
              0 0 30px #ff4da6,
              0 0 45px #ff4da6,
              0 0 50px #ff4da6,
              0 0 60px #ff4da6,
              0 0 85px #ff4da6;
          }
          50% { 
            opacity: 1;
            box-shadow: 
              0 0 15px #fff,
              0 0 25px #fff,
              0 0 30px #ff4da6,
              0 0 35px #ff4da6,
              0 0 50px #ff4da6,
              0 0 55px #ff4da6,
              0 0 65px #ff4da6,
              0 0 90px #ff4da6;
          }
          90% { 
            opacity: 1;
            box-shadow: 
              0 0 10px #fff,
              0 0 20px #fff,
              0 0 25px #ff4da6,
              0 0 30px #ff4da6,
              0 0 45px #ff4da6,
              0 0 50px #ff4da6,
              0 0 60px #ff4da6,
              0 0 85px #ff4da6;
          }
          100% { 
            left: calc(100% + 64px); 
            opacity: 0;
            box-shadow: 
              0 0 5px #fff,
              0 0 10px #fff,
              0 0 15px #ff4da6,
              0 0 20px #ff4da6,
              0 0 35px #ff4da6,
              0 0 40px #ff4da6;
          }
        }
      `}</style>
    </section>
  );
};
