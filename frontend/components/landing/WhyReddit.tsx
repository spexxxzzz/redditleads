"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { ArrowRight, X } from "lucide-react";
import { Particles } from "./Particles"; // Assuming this is your particles component
import { BoxReveal } from "@/components/magicui/box-reveal"; // Assuming this is your BoxReveal component

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

export function WhyReddit() {
  const containerRef = useRef<HTMLElement>(null);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      <section ref={containerRef} className="relative py-24 sm:py-32 overflow-hidden">
        {/* Particles Background */}
        <Particles quantity={80} staticity={40} ease={60} size={0.8} vx={0} vy={0} />

        {/* Black Background - Matching Hero Component */}
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

        {/* Enhanced Spotlight Beam */}
        <div className="absolute inset-0 pointer-events-none z-5">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Main spotlight */}
            <div className="w-[800px] h-[800px] bg-gradient-radial from-orange-400/20 via-orange-300/10 to-transparent rounded-full blur-2xl"></div>
            {/* Inner glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-orange-300/30 via-orange-200/15 to-transparent rounded-full blur-xl"></div>
            {/* Core light */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-gradient-radial from-orange-200/40 to-transparent rounded-full blur-lg"></div>
          </div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            {/* Left Text Section (Takes 2/5 columns) */}
            <div className="md:col-span-2 space-y-6">
              <BoxReveal boxColor="#FF4500" duration={0.5}>
                <h2 className={`text-4xl lg:text-5xl font-black text-white ${poppins.className}`}>
                  Why <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Reddit</span> Wins the AI Era
                </h2>
              </BoxReveal>

              <BoxReveal boxColor="#FF4500" duration={0.5}>
                <p className={`text-lg lg:text-xl text-white/70 ${inter.className}`}>
                  AI and search engines now favor authentic, human-centric conversations—making <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Reddit</span> the new goldmine for high-intent leads.
                </p>
              </BoxReveal>

              <div className="space-y-4 pt-4">
                <BoxReveal boxColor="#FF4500" duration={0.5}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className={`text-base lg:text-lg text-white/80 ${inter.className}`}>
                      <span className="font-bold text-white">73%</span> of Google's first-page results feature <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Reddit</span>.
                    </p>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#FF4500" duration={0.5}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className={`text-base lg:text-lg text-white/80 ${inter.className}`}>
                      <span className="font-bold text-white">90%</span> of users add '<span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">reddit</span>' for trusted answers.
                    </p>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor="#FF4500" duration={0.5}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p className={`text-base lg:text-lg text-white/80 ${inter.className}`}>
                      <span className="font-bold text-white">#1</span> source for solution-seeking AI queries.
                    </p>
                  </div>
                </BoxReveal>
              </div>

              <BoxReveal boxColor="#FF4500" duration={0.5}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group mt-6 inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:shadow-xl transition-all duration-300"
                >
                  <span className={poppins.className}>Tap into Reddit Leads</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </BoxReveal>
            </div>

            {/* Right Infographic Image Section (Takes 3/5 columns) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative md:col-span-3 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              {/* Glowing Border Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/50 via-orange-400/60 to-orange-500/50 rounded-2xl blur-lg opacity-75 transition duration-500 hover:opacity-100"></div>
              
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl shadow-orange-500/20 bg-gray-900/50 p-4">
                <img
                  src="/redd.png" // Assumes image is in public folder
                  alt="Infographic showing Reddit's dominance in AI and Search"
                  className="w-full h-auto object-contain rounded-lg"
                />
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-4xl w-full p-4"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 z-10"
              >
                <X size={24} />
              </button>
              <img
                src="/redd.png"
                alt="Infographic showing Reddit's dominance in AI and Search - Full screen view"
                className="w-full h-auto object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
