 "use client";
import Link from "next/link";
import { FaReddit } from "react-icons/fa";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Inter, Poppins } from 'next/font/google';
import { useRef } from "react";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Light Gradient Background Effect */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0"
      >
        {/* Primary Light Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100/30"></div>
        
        {/* Light Glowing Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 via-orange-100/30 to-orange-300/20 opacity-60"></div>
        
        {/* Subtle Radial Light Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.08),transparent_60%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.06),transparent_60%)] opacity-50"></div>
        
        {/* Light Floating Orbs with Glow */}
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
          className="absolute top-1/4 left-1/3 size-96 bg-gradient-to-br from-orange-100/40 to-orange-200/30 rounded-full blur-3xl opacity-60"
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
          className="absolute bottom-1/3 right-1/4 size-80 bg-gradient-to-tl from-orange-200/30 to-orange-300/20 rounded-full blur-3xl opacity-50"
        />
        
        {/* Light Gradient Lines */}
        <div className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-orange-200/30 to-transparent opacity-40"></div>
        <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-orange-300/25 to-transparent opacity-30"></div>
      </motion.div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          
          {/* Light Gradient Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/60 backdrop-blur-xl border border-orange-100/50 shadow-lg"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="size-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            />
            <span className={`text-sm font-medium text-black/80 ${inter.className}`}>AI-Powered Lead Generation</span>
            <Sparkles className="size-4 text-orange-500" />
          </motion.div>

          {/* Light Gradient Typography */}
          <div className="space-y-4">
          <motion.h1 
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
  className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[1.1] text-black pb-4 ${poppins.className}`}
>
  Turn{" "}
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
    className="inline-block relative z-20"
    style={{ overflow: 'visible' }}
  >
    <FaReddit className="inline size-16 sm:size-20 lg:size-24 xl:size-28 text-orange-500 mx-2 relative z-20" />
  </motion.span>
  <motion.span
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.7 }}
    className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent inline-block pb-2"
    style={{ 
      overflow: 'visible',
      lineHeight: '1.2'
    }}
  >
    Reddit
  </motion.span>
</motion.h1>

            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] text-black ${poppins.className}`}
            >
              Into Leads
            </motion.div>
          </div>

          {/* Light Gradient Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className={`text-xl lg:text-2xl text-black/70 max-w-2xl mx-auto leading-relaxed ${inter.className}`}
          >
            AI finds warm prospects on Reddit who need your product.
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-black/50"
            >
              No manual searching required.
            </motion.span>
          </motion.p>

          {/* Light Gradient CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="pt-8"
          >
            <div className="group relative inline-block">
              {/* Light Glowing Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-300/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <Link
                href="/signup"
                className="relative inline-flex items-center gap-3 bg-black/90 backdrop-blur-xl hover:bg-black text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-500 hover:scale-105 border border-white/10"
              >
                {/* Light Shader Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <span className={`relative z-10 ${poppins.className}`}>Find My First Lead</span>
                <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>

          {/* Light Gradient Trust Line */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.7 }}
            className={`text-sm text-black/40 ${inter.className}`}
          >
            <motion.span
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Join 500+ founders
            </motion.span>
            {" • "}
            <motion.span
              animate={{ opacity: [0.7, 0.4, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            >
              No credit card required
            </motion.span>
          </motion.p>

        </div>
      </div>

      {/* Light Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-20 right-20 size-1 bg-gradient-to-r from-orange-300 to-orange-400 rounded-full shadow-lg shadow-orange-300/30"
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          x: [0, 10, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-32 left-16 size-1 bg-gradient-to-r from-orange-200 to-orange-300 rounded-full shadow-lg shadow-orange-200/30"
      />
      
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          x: [0, -15, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 14, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 7
        }}
        className="absolute top-1/2 left-10 size-0.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-md shadow-orange-400/20"
      />
    </section>
  );
};
