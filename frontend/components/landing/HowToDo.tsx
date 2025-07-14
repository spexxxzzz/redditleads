"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const REDDIT_ORANGE = "#FF4500";
const REDDIT_DEEP_ORANGE = "#FF6B00";
const REDDIT_LIGHT_ORANGE = "#FF7A00";

const steps = [
  {
    title: "Connect Your Business",
    description:
      "Paste your website URL. Our AI instantly analyzes your business and identifies your ideal customers.",
    icon: LinkIcon,
    color: REDDIT_ORANGE,
  },
  {
    title: "AI Finds Your Leads",
    description:
      "Our intelligent system scans Reddit 24/7, identifying warm prospects who are actively seeking solutions like yours.",
    icon: MagnifyingGlassIcon,
    color: REDDIT_DEEP_ORANGE,
  },
  {
    title: "Start Converting",
    description:
      "Get qualified leads delivered to your inbox with AI-generated responses ready to send. No manual work required.",
    icon: ChatBubbleLeftRightIcon,
    color: REDDIT_LIGHT_ORANGE,
  },
];

/* ────────────────────────────────────────────────────────────────── */
/* Card that can be expanded into a full-screen modal                */
/* ────────────────────────────────────────────────────────────────── */
const ExpandableStepCard = ({
  step,
  onExpand,
}: {
  step: (typeof steps)[number];
  onExpand: () => void;
}) => (
  <CardSpotlight
    onClick={onExpand}
    color={step.color}
    radius={350}
    className="cursor-pointer h-[340px] flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] border-white/10 bg-gray-900/50 backdrop-blur-xl"
  >
    <div className="relative z-20 flex flex-col items-center text-center px-6 py-8 space-y-6 overflow-hidden h-full">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] shadow-lg">
        <step.icon className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className={`text-2xl font-semibold text-white ${poppins.className}`}>
        {step.title}
      </h3>
      <p
        className={`text-gray-400 text-base leading-relaxed line-clamp-3 flex-1 ${poppins.className}`}
      >
        {step.description}
      </p>
      <span className="text-sm text-orange-400 mt-auto">Click for details →</span>
    </div>
  </CardSpotlight>
);

/* ────────────────────────────────────────────────────────────────── */
/* Full-screen modal shown when a card is expanded                   */
/* ────────────────────────────────────────────────────────────────── */
const ModalStep = ({
  step,
  onClose,
}: {
  step: (typeof steps)[number];
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 w-full max-w-xl"
    >
      <CardSpotlight
        color={step.color}
        radius={400}
        className="p-10 border-white/20 bg-gray-900/80 backdrop-blur-xl"
      >
        <div className="relative z-20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-orange-300 hover:text-white text-xl"
          >
            ✕
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-white/[0.06] shadow-lg">
              <step.icon className="w-10 h-10 text-gray-200" />
            </div>

            <h3 className={`text-3xl font-bold text-white ${poppins.className}`}>
              {step.title}
            </h3>

            <p className={`text-gray-300 text-lg ${poppins.className}`}>
              {step.description}
            </p>

            <div className="pt-6">
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gray-800/70 rounded-2xl font-semibold text-white hover:bg-gray-700/80 transition-colors border border-gray-600/50"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  </motion.div>
);

/* ────────────────────────────────────────────────────────────────── */
/* Main exported section                                             */
/* ────────────────────────────────────────────────────────────────── */
export function HowToDo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Clean Background with Minimal Orange - Matching Hero Component */}
      <div className="absolute inset-0 z-10">
        {/* Primary Dark Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/95"></div>
       
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-gray-800/40 to-gray-900/20 opacity-70"></div>
       
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
      </div>
      
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
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold text-white tracking-tight ${poppins.className}`}
          >
            Onboard in{" "}
            <span className="bg-gradient-to-r from-[#FF4500] via-[#FF6B00] to-[#FF7A00] bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p
            className={`mt-4 text-lg text-gray-400 max-w-2xl mx-auto ${poppins.className}`}
          >
            Start generating leads from Reddit in under two minutes with our
            seamless onboarding experience.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div key={step.title} variants={itemVariants}>
              <ExpandableStepCard
                step={step}
                onExpand={() => setOpenIndex(idx)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openIndex !== null && (
          <ModalStep
            step={steps[openIndex]}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
