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

interface CompetitorFeature {
  feature: string;
  us: { 
    status: string; 
    label: string; 
  };
  competitors: string[];
}

const competitorFeatures: CompetitorFeature[] = [
  {
    feature: "AI Intent Analysis",
    us: { status: "advanced", label: "Culmination of models" },
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
  },
  {
    feature: "Platform Coverage",
    us: { status: "advanced", label: "Reddit only" },
    competitors: ["Reddit Only", "Limited", "Reddit Only", "Multi"]
  },
  {
    feature: "Response Automation",
    us: { status: "advanced", label: "Fully Automated" },
    competitors: ["Semi-Auto", "Manual", "None", "Basic"]
  }
];

const competitors = [
  { name: "RedReach AI", price: "$19-499" },
  { name: "Brand24", price: "$79+" },
  { name: "F5Bot", price: "Free" },
  { name: "Mention", price: "$41+" }
];

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
    transition: { duration: 0.7, ease: [0.42, 0, 0.58, 1] }
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
          className="space-y-16"
        >
          {/* Header */}
          <motion.header 
            variants={itemVariants}
            className="text-center max-w-4xl mx-auto"
          >
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
              Simple feature comparison across all major Reddit lead generation tools
            </p>
          </motion.header>

          {/* Clean Comparison Table */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-x-auto"
          >
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b-2 border-orange-400/30">
                  <th className={`text-left py-6 px-4 text-white/80 font-semibold ${inter.className}`}>
                    Feature
                  </th>
                  <th className={`text-center py-6 px-4 ${poppins.className}`}>
                    <div className="text-center">
                      <div className="text-lg font-bold bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent">
                        Redlead
                      </div>
                      <div className="text-xs text-orange-400 mt-1">Starting at $19</div>
                    </div>
                  </th>
                  {competitors.map((comp, index) => (
                    <th key={index} className={`text-center py-6 px-4 text-white/70 ${inter.className}`}>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">{comp.name}</div>
                        <div className="text-xs text-white/50 mt-1">{comp.price}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {competitorFeatures.map((feature, index) => (
                  <motion.tr 
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <td className={`py-4 px-4 text-white/80 font-medium ${inter.className}`}>
                      {feature.feature}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-green-400 font-bold text-sm ${poppins.className}`}>
                        ✓ {feature.us.label}
                      </span>
                    </td>
                    {feature.competitors.map((comp, compIndex) => (
                      <td key={compIndex} className="py-4 px-4 text-center">
                        {comp === "None" || comp === "N/A" ? (
                          <span className={`text-red-400 text-sm ${inter.className}`}>
                            ✗ {comp}
                          </span>
                        ) : (
                          <span className={`text-orange-300 text-sm ${inter.className}`}>
                            ✓ {comp}
                          </span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Simple CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <button className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white px-12 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
              Start Free Trial →
            </button>
            <p className={`text-white/60 text-sm mt-4 ${inter.className}`}>
              No credit card required • 7-day trial
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
