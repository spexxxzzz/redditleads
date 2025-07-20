"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }
  }
};

const steps = [
  {
    title: "Connect Your Business",
    description: "Paste your website URL. Our AI instantly analyzes your business and identifies your ideal customers.",
    icon: LinkIcon,
    features: [
      "Instant business analysis",
      "Customer persona detection",
      "Market opportunity mapping",
      "Competitive landscape scan"
    ]
  },
  {
    title: "AI Finds Your Leads", 
    description: "Our intelligent system scans Reddit 24/7, identifying warm prospects who are actively seeking solutions like yours.",
    icon: MagnifyingGlassIcon,
    features: [
      "24/7 Reddit monitoring",
      "Intent-based lead detection",
      "Real-time opportunity alerts",
      "Qualified prospect scoring"
    ]
  },
  {
    title: "Start Converting",
    description: "Get qualified leads delivered to your inbox with AI-generated responses ready to send. No manual work required.",
    icon: ChatBubbleLeftRightIcon,
    features: [
      "AI-generated responses",
      "Ready-to-send messages",
      "Automated lead delivery",
      "Conversion tracking"
    ]
  },
];

export function HowToDo() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated background orbs - Orange only, no blue */}
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
          className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-full blur-3xl opacity-50"
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
          className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-orange-500/8 to-orange-400/4 rounded-full blur-3xl opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
              Get Started in{" "}
              <span className="text-orange-500">
                3 Simple Steps
              </span>
            </h2>
            <p className={`text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
              From setup to your first qualified lead in under 5 minutes
            </p>
          </motion.div>

          {/* Steps Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative h-full rounded-2xl border border-gray-700 bg-gray-900/30 hover:border-gray-600 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
                >
                  <div className="relative flex h-full flex-col justify-between p-6">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 left-6">
                      <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {index + 1}
                      </div>
                    </div>

                    {/* Step Header */}
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex flex-col gap-3">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700">
                          <IconComponent className="w-6 h-6 text-orange-400" />
                        </div>
                        
                        <h3 className={`text-xl font-semibold text-white ${poppins.className}`}>
                          {step.title}
                        </h3>
                        
                        <p className={`text-gray-400 text-sm leading-relaxed ${inter.className}`}>
                          {step.description}
                        </p>
                      </div>

                      <hr className="border-gray-700" />

                      {/* Features */}
                      <div className="flex flex-col gap-3">
                        <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${inter.className}`}>
                          What you get
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                              <span className={`text-sm text-gray-300 ${inter.className}`}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 text-white hover:from-orange-700 hover:via-orange-600 hover:to-orange-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 ${poppins.className}`}
            >
              Start Your 7-Day Free Trial
            </motion.button>
            <p className={`text-sm text-gray-400 mt-4 ${inter.className}`}>
              No credit card required • Get started in seconds
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
