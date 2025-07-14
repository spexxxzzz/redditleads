"use client";
import React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Poppins, Inter } from "next/font/google";
import { Search, Link, BarChart2, Rocket, Target, TrendingUp } from "lucide-react";
import { useRef } from "react";
import { VelocityScroll } from "../magicui/scroll-based-velocity";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const DashboardPreview = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-36 pb-20">
      {/* Black Background with Minimal Orange - Matching Hero Component */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 z-10"
      >
        {/* Primary Black Base */}
        <div className="absolute inset-0 bg-black"></div>
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
       
        {/* Minimal Radial Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
        {/* Subtle Floating Orbs */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-white/5 to-white/2 rounded-full blur-3xl opacity-30"
        />
        
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 25, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-white/3 to-white/1 rounded-full blur-3xl opacity-20"
        />
      </motion.div>

      
      <div className="max-w-full mx-auto px-8 sm:px-12 lg:px-16 relative z-20">
        {/* Side by Side Layout - Enhanced with Features */}
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-32 sticky top-24 z-30">
          
          {/* Left Side - Enhanced Text & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="lg:w-3/12 lg:max-w-lg sticky top-24 mt-16 space-y-8"
          >
            {/* Main Heading */}
            <h2 className={`${poppins.className} text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter
              bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent
              cursor-default select-none
              transition-all duration-300 ease-out
              hover:drop-shadow-[0_0_25px_rgba(249,115,22,0.8)]
              hover:scale-[1.01]
              relative overflow-visible text-left leading-tight`}
              style={{
                lineHeight: '1.2',
                overflow: 'visible'
              }}
            >
              Not just an AI wrapper.
            </h2>
            {/* VelocityScroll Section */}
     
        <VelocityScroll 
          defaultVelocity={10} 
          numRows={2} 
          className={`${poppins.className} text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter
          bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 
        `}
        >
        Much more than that.
        </VelocityScroll>
       
      

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${inter.className} text-lg text-white/80 leading-relaxed`}
            >
              RedLead transforms Reddit into your personal lead generation machine with advanced AI-powered insights.
            </motion.p>

           
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className={`${poppins.className} text-xl font-bold text-white mb-4`}>
                  Features that get you customers
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-orange-400" />
                  </div>
                  <span className={`${inter.className} text-white/90 text-sm`}>
                    Intelligent subreddit scanning
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Link className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className={`${inter.className} text-white/90 text-sm`}>
                    Seamless App integrations
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className={`${inter.className} text-white/90 text-sm`}>
                    Advanced analytics dashboard
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className={`${inter.className} text-white/90 text-sm`}>
                    Automated outreach templates
                  </span>
                </div>
              </div>
            </motion.div> 

         
            
            {/* Hover-only Background Glow */}
            <div className="absolute inset-0 -z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-full bg-gradient-to-r from-orange-500/5 via-orange-400/10 to-orange-500/5 rounded-lg blur-xl"></div>
            </div>
          </motion.div>

          {/* Right Side - Image (3x Bigger with More Space) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:w-9/12 lg:ml-auto lg:mr-4 relative sticky top-24 mt-16"
          >
            <div className="relative border-2 border-orange-500/40 rounded-2xl shadow-[0_0_60px_rgba(249,115,22,0.3)] p-3 bg-gray-800/50">
              <Image
                src="/Reddd.png"
                alt="RedLead Dashboard Interface"
                width={3600}
                height={2400}
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
      </div>

      {/* Minimal Floating Elements - From Hero */}
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
        className="absolute top-20 right-20 size-1 bg-white/20 rounded-full z-20"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, 10, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-32 left-16 size-1 bg-white/15 rounded-full z-20"
      />
    </section>
  );
};
