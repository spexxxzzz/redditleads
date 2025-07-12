"use client";
import React from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const RedLeadHeader = () => {
  return (
    <div className="relative w-full mb-8">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/5 via-gray-800/10 to-orange-900/5 rounded-lg"></div>
      
      {/* Centered RedLead Text */}
      <div className="relative flex justify-center items-center py-6">
        <h1 className={`text-5xl font-black text-white ${poppins.className}`}>
          red<span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">lead</span>
        </h1>
      </div>
      
      {/* Bottom border */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>
    </div>
  );
};
