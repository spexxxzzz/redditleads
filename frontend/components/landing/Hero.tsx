"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit } from "react-icons/fa";
import Image from "next/image";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Hero = () => {
  return (
    <div className="min-h-screen bg-black" style={{
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
      transform: 'translateZ(0)',
      willChange: 'scroll-position'
    }}>
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-5">
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/20 opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.03),transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.02),transparent_70%)] opacity-40"></div>
    
        {/* Enhanced Spotlight Beam */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] bg-gradient-radial from-orange-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-orange-300/30 via-orange-200/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-radial from-orange-200/40 to-transparent rounded-full blur-lg"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 py-4 max-md:px-4 relative z-10 flex items-center justify-center min-h-screen" style={{
        transform: 'translateZ(0)',
        contain: 'layout style paint'
      }}>
        
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mx-auto max-w-[98vw]">
          <div className="absolute inset-0">
            <div className="w-full h-full bg-black"></div>
          </div>

          {/* Main Hero Content */}
          <div className="relative z-10 px-16 pt-20 pb-12 text-center max-md:px-8 max-md:pt-16 max-md:pb-8">

            {/* Single Line Tagline with Reddit Icon */}
            <div className="overflow-visible mb-8">
            <motion.h1 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
  className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] text-white mb-0 overflow-visible ${poppins.className}`}
  style={{ overflow: 'visible' }}
>
  Turn{" "}
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
    className="inline-block relative z-20 overflow-visible"
    style={{ overflow: 'visible', display: 'inline-block' }}
  >
    <FaReddit className="inline size-8 sm:size-10 lg:size-12 xl:size-14 text-orange-500 mx-2 relative z-20" />
  </motion.span>
  <motion.span
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.7 }}
    className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent inline-block overflow-visible"
    style={{ 
      overflow: 'visible',
      lineHeight: '0.9',
      display: 'inline-block'
    }}
  >
    Reddit{"     "}
    </motion.span>
  {" "}
  <motion.span
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
    className="inline-block"
    style={{ overflow: 'visible' }}
  >
    into leads
  </motion.span>
</motion.h1>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
            >
              <Link 
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors"
              >
                <FaReddit className="w-4 h-4 text-orange-500" />
                <span className={`${inter.className} font-semibold`}>Get started for free</span>
              </Link>

              <Link 
                href="/pricing"
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-200"
              >
                <span className={`${inter.className} font-semibold`}>See plans & pricing</span>
              </Link>
            </motion.div>

            {/* Bottom Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className={`${inter.className} text-white/80 font-medium text-sm`}
              style={{ marginTop: '1rem' }}
            >
              Already have Reddit leads?{" "}
              <Link 
                href="/dashboard" 
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
              >
                Open dashboard
              </Link>
            </motion.p>

            {/* Larger Dashboard Image with INTENSE Lightsaber Glow */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
              className="relative max-w-8xl mx-auto mt-12 overflow-visible"
            >
              <div className="relative overflow-visible">
                {/* INTENSIFIED Lightsaber-Style Energy Aura */}
                
                {/* Ultra Outer Energy Field - Massive Extended Glow */}
                <div className="absolute -inset-48 bg-gradient-radial from-orange-500/25 via-orange-400/15 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
                
                {/* Extended Outer Energy Field */}
                <div className="absolute -inset-40 bg-gradient-radial from-orange-400/35 via-orange-300/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>
                
                {/* Outer Energy Field - Very Soft and Extended */}
                <div className="absolute -inset-32 bg-gradient-radial from-orange-500/45 via-orange-400/25 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                
                {/* Mid Energy Field - Medium Glow */}
                <div className="absolute -inset-20 bg-gradient-radial from-orange-400/55 via-orange-300/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                
                {/* Inner Energy Field - Intense Core Glow */}
                <div className="absolute -inset-12 bg-gradient-radial from-orange-300/65 via-orange-200/35 to-transparent rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Core Energy Ring - Bright Inner Glow */}
                <div className="absolute -inset-6 bg-gradient-radial from-orange-200/75 via-orange-100/40 to-transparent rounded-full blur-xl pointer-events-none"></div>
                
                {/* Immediate Aura - Closest to Image */}
                <div className="absolute -inset-3 bg-gradient-radial from-orange-100/60 via-orange-50/30 to-transparent rounded-2xl blur-lg pointer-events-none"></div>

                {/* Enhanced Pulsing Energy Core */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -inset-16 bg-gradient-radial from-orange-300/40 via-orange-200/20 to-transparent rounded-full blur-3xl pointer-events-none"
                />

                {/* Secondary Pulsing Layer */}
                <motion.div
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1.02, 1.12, 1.02]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -inset-24 bg-gradient-radial from-orange-400/30 via-orange-300/15 to-transparent rounded-full blur-[60px] pointer-events-none"
                />

                {/* Larger Dashboard Image */}
                <Image
                  src="/Redlead1.png"
                  alt="RedLead Dashboard Interface"
                  width={5040}
                  height={3360}
                  quality={100}
                  priority
                  className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) drop-shadow(0 0 80px rgba(255, 165, 0, 0.4))'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};
