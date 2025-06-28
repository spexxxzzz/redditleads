"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaReddit } from "react-icons/fa";
import { Sparkles } from "lucide-react";

// Import Google Fonts
import { Inter, Poppins } from 'next/font/google';
import { Mode } from "fs";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

type ModelProps = {
  className?: string;
};
const useCases = [
  {
    title: "AI & SaaS Tools",
    lead: `"I'm looking for a Calendly alternative that has better team features. Any suggestions?"`,
    subreddit: "r/saas", // We'll replace this with CSS 3D
    color: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100"
  },
  {
    title: "Local Coffee Shops",
    lead: `"Where can I find the best artisan coffee in downtown? Looking for a cozy spot to work."`,
    subreddit: "r/Coffee",
    color: "from-amber-600 to-orange-600",
    bgGradient: "from-amber-50 to-orange-100"
  },
  {
    title: "E-commerce Brands",
    lead: `"Where can I buy high-quality, ethically sourced products online?"`,
    subreddit: "r/BuyItForLife",
    color: "from-purple-400 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100"
  },
  {
    title: "Game Developers",
    lead: `"My friends and I are looking for a new co-op indie game to play on Steam, any hidden gems?"`,
    subreddit: "r/gamingsuggestions",
  
    color: "from-red-400 to-red-600",
    bgGradient: "from-red-50 to-red-100"
  },
  {
    title: "Creative Agencies",
    lead: `"We need to hire a freelance graphic designer for a new branding project. Where's the best place to find talent?"`,
    subreddit: "r/forhire",
    
    color: "from-pink-400 to-pink-600",
    
  },
  {
    title: "Tech Startups",
    lead: `"I'm so frustrated with current solutions. Are there any better alternatives for building modern apps?"`,
    subreddit: "r/programming",
    color: "from-green-400 to-green-600",
    bgGradient: "from-green-50 to-green-100"
  },
];



export const UseCases = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <>
     <style jsx>{`
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotateY(0deg); }
    50% { transform: translateY(-10px) rotateY(5deg); }
  }
  
  @keyframes gradient-x {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }
  
  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
  }
  
  .bg-grid-pattern {
    background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
    background-size: 20px 20px;
  }
`}</style>

     


      {/* Use Cases Section */}
      <section ref={targetRef} className="relative h-[650vh] bg-gradient-to-b from-slate-50 to-white">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
          {useCases.map((useCase, i) => {
            const segmentStart = i / useCases.length;
            const segmentEnd = (i + 1) / useCases.length;

            const fadeInPoint = segmentStart + 0.08;
            const fadeOutPoint = segmentEnd - 0.08;

            const opacity = useTransform(
              scrollYProgress,
              [segmentStart, fadeInPoint, fadeOutPoint, segmentEnd],
              [0, 1, 1, 0]
            );

            const scale = useTransform(
              scrollYProgress,
              [segmentStart, fadeInPoint, fadeOutPoint, segmentEnd],
              [0.8, 1, 1, 0.8]
            );

            const y = useTransform(
              scrollYProgress,
              [segmentStart, segmentEnd],
              ["100px", "-100px"]
            );

            const rotateY = useTransform(
              scrollYProgress,
              [segmentStart, segmentEnd],
              [0, 360]
            );

         

            return (
              <motion.div
                key={useCase.title}
                style={{ opacity, scale, y }}
                className="absolute flex flex-col items-center justify-center text-center px-8 max-w-4xl"
              >

                {/* Content */}
                <div className="space-y-6">
                <h3 className={`text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent ${poppins.className}`}>

                    {useCase.title}
                  </h3>
                  
                  <div className="max-w-4xl overflow-hidden">
  <motion.div
    style={{
      x: useTransform(
        scrollYProgress,
        [segmentStart, fadeInPoint, fadeOutPoint, segmentEnd],
        ["-100%", "0%", "0%", "100%"]
      )
    }}
    className="whitespace-nowrap"
  > 
  <p className={`text-3xl lg:text-4xl xl:text-5xl text-gray-500 leading-relaxed italic font-medium ${inter.className}`}>
       {useCase.lead}
    </p>
  </motion.div>
</div>

<div className="inline-flex items-center gap-4 text-2xl lg:text-3xl font-semibold text-gray-400 bg-white/80 backdrop-blur-sm py-4 px-8 rounded-full border border-white/50 shadow-lg">

                    <span>Found in</span>
                    <span className={`font-bold text-slate-800 inline-flex items-center gap-2 bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent`}>
                      <FaReddit className="w-6 h-6 text-orange-500" />
                      {useCase.subreddit}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </>
  );
};