"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Poppins, Inter } from "next/font/google";
import { Sparkles, TrendingUp, Target, Zap } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const DashboardPreview = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         

        {/* Main Dashboard Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-6xl mb-20"
        >
          <div className="relative border-2 border-orange-500/40 rounded-2xl shadow-[0_0_60px_rgba(249,115,22,0.3)] p-3 bg-gray-800/50 backdrop-blur-xl">
            <Image
              src="/redlead.png"
              alt="RedLead Dashboard Interface"
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl shadow-2xl"
              priority
            />
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </motion.div>

        
      </div>
    </section>
  );
};