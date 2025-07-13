"use client";
import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { ArrowRight, XCircle, CheckCircle2 } from "lucide-react";
import { Particles } from "./Particles"; // Assuming this is your particles component
import { cn } from "@/lib/utils"; // Assuming you have a utility file for classnames
import { RedButton } from "./Button";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

//**********************************************
// 1. WOBBLE CARD COMPONENT DEFINITION
//**********************************************
const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
      style={{
        backgroundImage: "url(/noise.webp)", // Make sure you have this image in your public folder
        backgroundSize: "30%",
      }}
    ></div>
  );
};

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };
  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        "mx-auto w-full bg-indigo-800 relative rounded-2xl overflow-hidden",
        containerClassName
      )}
    >
      <div
        className="relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.07),rgba(255,255,255,0))] sm:mx-0 sm:rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)",
        }}
      >
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
          className={cn("h-full px-4 py-8 sm:px-10", className)}
        >
          <Noise />
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};


//**********************************************
// 2. MAIN COMPONENT USING WOBBLE CARD
//**********************************************
const manualMarketingPainPoints = [
  "Endless manual scrolling through irrelevant posts.",
  "Missing high-intent conversations that happen 24/7.",
  "Risking your brand's reputation with inauthentic outreach.",
  "Wasting hours on unqualified leads and dead ends.",
];

const platformBenefits = [
  "AI pinpoints solution-seeking customers automatically.",
  "Never miss a lead with continuous, targeted monitoring.",
  "Engage authentically with AI-assisted, context-aware replies.",
  "Focus only on warm, pre-qualified prospects.",
];

export function WhyUs() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 overflow-hidden">
      <Particles quantity={330} staticity={40} ease={60} size={0.8} vx={0} vy={0} />
    
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-gray-800/40 to-gray-900/20 opacity-70"></div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] bg-gradient-radial from-orange-400/10 via-orange-300/5 to-transparent rounded-full blur-2xl"></div>
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
        >
          <h2 className={`text-4xl lg:text-5xl font-black text-white ${poppins.className}`}>
            Stop Losing Customers on <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Reddit</span>
          </h2>
          <p className={`mt-4 text-lg lg:text-xl text-white/70 max-w-3xl mx-auto ${inter.className}`}>
            Manual marketing is a losing game. While you're searching, your competitors are engaging with warm leads you're missing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Problem Card using WobbleCard */}
          <WobbleCard containerClassName="bg-red-900/40 border border-red-500/30">
            <div className="flex items-center gap-4 mb-6">
              <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
              <div>
                <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>The Old Way: Manual Struggle</h3>
                <p className={`text-white/60 ${inter.className}`}>Time-consuming and ineffective.</p>
              </div>
            </div>
            <ul className="space-y-4">
              {manualMarketingPainPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500/50 flex-shrink-0"></div>
                  <span className={`text-white/80 ${inter.className}`}>{point}</span>
                </li>
              ))}
            </ul>
          </WobbleCard>

          {/* The Solution Card using WobbleCard */}
          <WobbleCard containerClassName="bg-green-900/40 border border-green-500/30">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" />
              <div>
                <h3 className={`text-2xl font-bold text-white ${poppins.className}`}>The New Way: AI-Powered Growth</h3>
                <p className={`text-white/60 ${inter.className}`}>Automated, precise, and efficient.</p>
              </div>
            </div>
            <ul className="space-y-4">
              {platformBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span className={`text-white/80 ${inter.className}`}>{benefit}</span>
                </li>
              ))}
            </ul>
          </WobbleCard>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-20"
        >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:shadow-xl transition-all duration-300"
            >
              <span className={poppins.className}>Turn Missed Opportunities into Wins</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
