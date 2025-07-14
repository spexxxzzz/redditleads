"use client";
import React from "react";
import { Poppins } from "next/font/google";
import { motion } from "framer-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const RedLeadHeader = () => {
  return (
    <div className="relative w-full mb-8 overflow-hidden">
      {/* Black Background - Matching Hero Component */}
      <div className="absolute inset-0 z-10">
        {/* Primary Black Base */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
       
        {/* Minimal Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
      </div>
      
      {/* Centered RedLead Text */}
      <div className="relative z-20 flex justify-center items-center py-6">
        <h1 className={`text-5xl font-black text-white ${poppins.className}`}>
          red<span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">lead</span>
        </h1>
      </div>
      
      {/* Bottom border */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent z-20"></div>

      {/* Minimal Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-2 right-8 size-1 bg-white/20 rounded-full z-20"
      />
    </div>
  );
};
