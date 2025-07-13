"use client";
import React, { useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useInView, MotionValue, Variants } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { Particles } from "./Particles";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

interface KeyMetric {
  metric: string;
  label: string;
  description: string;
}

interface CompetitorFeature {
  feature: string;
  us: { 
    status: string; 
    label: string; 
  };
  competitors: string[];
}

interface Competitor {
  name: string;
  price: string;
  tier: string;
  weakness: string;
}

const keyMetrics: KeyMetric[] = [
  {
    metric: "3x",
    label: "More Leads",
    description: "Than manual monitoring"
  },
  {
    metric: "90%",
    label: "Accuracy",
    description: "AI intent detection"
  },
  {
    metric: "24/7",
    label: "Monitoring",
    description: "Never miss opportunities"
  },
  {
    metric: "2min",
    label: "Setup Time",
    description: "Start generating leads"
  }
];

const competitorFeatures: CompetitorFeature[] = [
  {
    feature: "AI Intent Analysis",
    us: { status: "advanced", label: "GPT-4 Powered" },
    competitors: ["Basic", "Limited", "None", "Manual"]
  },
  {
    feature: "Smart Replies",
    us: { status: "advanced", label: "Context-Aware" },
    competitors: ["Generic", "Templates", "N/A", "Manual"]
  },
  {
    feature: "CRM Integration",
    us: { status: "advanced", label: "All Major CRMs" },
    competitors: ["External", "Basic", "None", "External"]
  },
  {
    feature: "Real-time Alerts",
    us: { status: "advanced", label: "Instant" },
    competitors: ["Delayed", "Standard", "Email Only", "Standard"]
  },
  {
    feature: "Lead Scoring",
    us: { status: "advanced", label: "AI-Powered" },
    competitors: ["Manual", "Basic", "None", "Manual"]
  }
];

const competitors: Competitor[] = [
  { name: "RedReach AI", price: "$19-499", tier: "Limited", weakness: "Reddit-only" },
  { name: "Brand24", price: "$79+", tier: "Enterprise", weakness: "Generic replies" },
  { name: "F5Bot", price: "Free", tier: "Basic", weakness: "No AI features" },
  { name: "Mention", price: "$41+", tier: "Standard", weakness: "Manual work" }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.42, 0, 0.58, 1] }
  }
};

const metricVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }
  }
};

export const AdvantageComponent: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y: MotionValue<string> = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  const backgroundElements = useMemo(() => (
    <>
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-radial from-orange-400/10 via-orange-300/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-orange-500/8 via-orange-400/3 to-transparent rounded-full blur-3xl" />
      </div>
    </>
  ), [y]);

  return (
    <section 
      ref={containerRef} 
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      aria-labelledby="advantage-heading"
    >
      <Particles quantity={40} staticity={50} ease={70} size={0.4} vx={0} vy={0} />
      {backgroundElements}

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-20"
        >
          {/* Header */}
          <motion.header 
            variants={itemVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-full px-6 py-3 mb-6"
            >
              <span className={`text-orange-400 text-sm font-semibold ${inter.className}`}>
                #1 Reddit Lead Gen Tool
              </span>
            </motion.div>

            <h1 
              id="advantage-heading"
              className={`text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6 ${poppins.className}`}
            >
              Why Choose{" "}
              <span className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent">
                Redlead
              </span>{" "}
              Over Others?
            </h1>
            <p className={`text-xl text-white/70 max-w-3xl mx-auto leading-relaxed ${inter.className}`}>
              While others send basic alerts, we deliver qualified leads with AI-powered precision and context-aware engagement.
            </p>
          </motion.header>

          {/* Key Metrics */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={index}
                variants={metricVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  <div className={`text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent mb-3 ${poppins.className}`}>
                    {metric.metric}
                  </div>
                  
                  <div className={`text-white font-semibold mb-2 ${poppins.className}`}>
                    {metric.label}
                  </div>
                  
                  <div className={`text-sm text-white/60 ${inter.className}`}>
                    {metric.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Comparison Table */}
          <motion.section
            variants={itemVariants}
            aria-labelledby="comparison-heading"
            className="relative"
          >
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10">
              <div className="text-center mb-10">
                <h2 
                  id="comparison-heading"
                  className={`text-3xl lg:text-4xl font-black text-white mb-4 ${poppins.className}`}
                >
                  Feature Comparison
                </h2>
                <p className={`text-white/70 max-w-2xl mx-auto ${inter.className}`}>
                  See how Redlead outperforms the competition across all key features
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className={`py-6 text-left text-white/80 font-semibold ${inter.className}`}>
                        Feature
                      </th>
                      <th className={`py-6 text-center ${poppins.className}`}>
                        <div className="flex items-center justify-center">
                          <span className="text-white font-bold bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent">
                            Redlead
                          </span>
                        </div>
                      </th>
                      {competitors.map((comp, index) => (
                        <th key={index} className={`py-6 text-center text-white/70 ${inter.className}`}>
                          <div className="text-sm font-semibold">{comp.name}</div>
                          <div className="text-xs text-white/50 mt-1">{comp.price}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {competitorFeatures.map((feature, index) => (
                      <motion.tr 
                        key={index} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                      >
                        <td className={`py-6 text-white/80 font-medium ${inter.className}`}>
                          {feature.feature}
                        </td>
                        <td className="py-6 text-center">
                          <span className={`text-green-400 font-bold ${poppins.className}`}>
                            ✓ {feature.us.label}
                          </span>
                        </td>
                        {feature.competitors.map((comp, compIndex) => (
                          <td key={compIndex} className="py-6 text-center">
                            {comp === "None" || comp === "N/A" ? (
                              <span className={`text-red-400 text-sm ${inter.className}`}>
                                ✗ {comp}
                              </span>
                            ) : (
                              <span className={`text-yellow-400 text-sm ${inter.className}`}>
                                ✓ {comp}
                              </span>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-6">
                {/* Redlead Card */}
                <motion.div
                  variants={itemVariants}
                  className="relative bg-gradient-to-br from-green-900/30 to-green-800/20 border-2 border-green-500/30 rounded-3xl p-6"
                >
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                      BEST
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent ${poppins.className}`}>
                      Redlead
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {competitorFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-white/80 text-sm ${inter.className}`}>
                          {feature.feature}
                        </span>
                        <span className={`text-green-400 font-semibold text-sm ${poppins.className}`}>
                          ✓ {feature.us.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Competitor Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {competitors.map((comp, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="bg-gray-800/50 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-white font-semibold ${poppins.className}`}>
                          {comp.name}
                        </h4>
                        <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                          {comp.weakness}
                        </div>
                      </div>
                      
                      <div className={`text-white/60 text-sm mb-4 ${inter.className}`}>
                        {comp.price} • {comp.tier}
                      </div>
                      
                      <div className="space-y-2">
                        {competitorFeatures.slice(0, 3).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center justify-between text-sm">
                            <span className={`text-white/70 ${inter.className}`}>
                              {feature.feature}
                            </span>
                            <span className={`text-yellow-400 ${inter.className}`}>
                              {feature.competitors[index]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Enhanced CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <div className="max-w-2xl mx-auto">
              <p className={`text-white/80 mb-8 text-lg ${inter.className}`}>
                Ready to see the difference? Start generating more qualified leads with Redlead today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  <span className={poppins.className}>Start Free Trial →</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Watch Demo
                </motion.button>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-8 text-white/60 text-sm">
                <span className={inter.className}>• 7-day free trial</span>
                <span className={inter.className}>• No credit card required</span>
                <span className={inter.className}>• Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
