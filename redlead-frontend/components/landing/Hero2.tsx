"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Hero2 = () => {
  return (
    <>
      <section className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-50 via-white to-orange-50 py-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-12 shadow-lg">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className={`text-lg font-semibold text-slate-700 ${poppins.className}`}>One Tool, Every Niche</span>
          </div>
          
          <h1 className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-slate-900 mb-8 max-w-6xl leading-[0.9] ${poppins.className}`}>
            If They're on{" "}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
              Reddit
            </span>
            <br />
            <span className="text-slate-600 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold">
              We'll Find Them
            </span>
          </h1>
          
          <p className={`text-2xl md:text-3xl lg:text-4xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium ${inter.className}`}>
            RedLead discovers leads across{" "}
            <span className="text-orange-600 font-semibold">every business model</span>.
            <br />
            If people are discussing problems you solve,{" "}
            <span className="text-slate-900 font-semibold">you'll know instantly</span>.
          </p>
        </div>
      </section>

      

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </>
  );
};
