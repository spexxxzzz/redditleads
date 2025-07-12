"use client";
import { motion } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { useRef } from "react";
import { 
  Brain, 
  Target, 
  MessageSquare, 
  Eye,
  Zap,
  TrendingUp,
  Users,
  Shield
} from "lucide-react";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Features data with icons and detailed descriptions
const features = [
  {
    icon: Brain,
    title: "AI-Powered Discovery",
    description: "Analyzes your website to find customers based on actual problems, not just keywords.",
    highlights: ["Problem-based matching", "Website analysis", "Smart targeting"],
    gradient: "from-purple-500/20 to-blue-500/20",
    iconColor: "text-purple-400"
  },
  {
    icon: Target,
    title: "Intent-Based Scoring",
    description: "Prioritizes solution-seekers with clear pain points at the top of your feed.",
    highlights: ["Pain point detection", "Priority scoring", "Quality leads"],
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  },
  {
    icon: MessageSquare,
    title: "Context-Aware Replies",
    description: "Generates authentic responses tailored to each subreddit's culture.",
    highlights: ["Cultural adaptation", "Authentic tone", "Subreddit-specific"],
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400"
  },
  {
    icon: Eye,
    title: "Competitor Monitoring",
    description: "Alerts you when users express frustration with competitors.",
    highlights: ["Real-time alerts", "Competitor mentions", "Opportunity detection"],
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400"
  }
];

export const Features = () => {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section ref={containerRef} className="relative min-h-screen py-20 overflow-hidden">
      {/* Clean Background without Dot Pattern */}
      <div className="absolute inset-0">
        {/* Primary Dark Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/95"></div>
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-gray-800/50 to-gray-900/30 opacity-70"></div>
        
        {/* Minimal Radial Gradients for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(255,255,255,0.02),transparent_70%)] opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_center,rgba(249,115,22,0.03),transparent_70%)] opacity-40"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 ${poppins.className}`}
          >
            Features You{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              Can't Miss
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className={`text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed ${inter.className}`}
          >
            AI-driven capabilities that transform Reddit into your lead generation channel
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut" 
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                {/* Card Background */}
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
                  
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-6">
                      <div className="relative inline-flex">
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <IconComponent className={`h-8 w-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-2xl lg:text-3xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-300 ${poppins.className}`}>
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-lg text-white/70 mb-6 leading-relaxed group-hover:text-white/80 transition-colors duration-300 ${inter.className}`}>
                      {feature.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, highlightIndex) => (
                        <motion.div
                          key={highlight}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: (index * 0.2) + (highlightIndex * 0.1) + 0.5,
                            ease: "easeOut" 
                          }}
                          viewport={{ once: true }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          <span className={`text-sm text-white/60 group-hover:text-white/70 transition-colors duration-300 ${inter.className}`}>
                            {highlight}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Hover Effect Lines */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            
            <button className="relative bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-500 hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className={`relative z-10 ${poppins.className}`}>Experience These Features</span>
            </button>
          </div>
          
          <p className={`text-sm text-white/40 mt-4 ${inter.className}`}>
            Start your free trial • No credit card required
          </p>
        </motion.div>
      </div>

      {/* Minimal Floating Elements */}
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
        className="absolute top-20 right-20 w-1 h-1 bg-white/20 rounded-full"
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
        className="absolute bottom-32 left-16 w-1 h-1 bg-white/15 rounded-full"
      />
    </section>
  );
};
