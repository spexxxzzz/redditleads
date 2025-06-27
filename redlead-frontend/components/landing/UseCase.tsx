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

// 3D CSS Model Components
const CoffeeModel = ({ className } : ModelProps) => (
  <div className={`relative ${className}`}>
    <div className="coffee-cup">
      <div className="cup-body bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-3xl shadow-2xl border-4 border-amber-300"></div>
      <div className="cup-handle bg-amber-200 rounded-full shadow-lg"></div>
      <div className="coffee-liquid bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-sm"></div>
      <div className="steam">
        <div className="steam-line bg-gray-300 opacity-60 rounded-full animate-pulse"></div>
        <div className="steam-line bg-gray-300 opacity-40 rounded-full animate-pulse delay-300"></div>
        <div className="steam-line bg-gray-300 opacity-50 rounded-full animate-pulse delay-700"></div>
      </div>
    </div>
  </div>
);

const RobotModel = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="robot">
      <div className="robot-head bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl shadow-2xl border-2 border-blue-300">
        <div className="robot-eyes">
          <div className="eye bg-white rounded-full shadow-inner">
            <div className="pupil bg-blue-600 rounded-full animate-pulse"></div>
          </div>
          <div className="eye bg-white rounded-full shadow-inner">
            <div className="pupil bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="robot-mouth bg-blue-800 rounded-full"></div>
      </div>
      <div className="robot-body bg-gradient-to-b from-blue-500 to-blue-700 rounded-xl shadow-xl border-2 border-blue-400"></div>
    </div>
  </div>
);

const ShoppingBagModel = ({ className } : ModelProps) => (
  <div className={`relative ${className}`}>
    <div className="shopping-bag">
      <div className="bag-body bg-gradient-to-b from-purple-300 to-purple-500 rounded-b-2xl shadow-2xl border-2 border-purple-400"></div>
      <div className="bag-handles">
        <div className="handle bg-purple-600 rounded-full shadow-lg"></div>
        <div className="handle bg-purple-600 rounded-full shadow-lg"></div>
      </div>
      <div className="bag-logo bg-white rounded-full shadow-inner opacity-80"></div>
    </div>
  </div>
);

const GamepadModel = ({ className } : ModelProps) => (
  <div className={`relative ${className}`}>
    <div className="gamepad">
      <div className="gamepad-body bg-gradient-to-b from-red-400 to-red-600 rounded-3xl shadow-2xl border-2 border-red-300"></div>
      <div className="gamepad-buttons">
        <div className="button bg-yellow-400 rounded-full shadow-lg"></div>
        <div className="button bg-green-400 rounded-full shadow-lg"></div>
        <div className="button bg-blue-400 rounded-full shadow-lg"></div>
        <div className="button bg-red-400 rounded-full shadow-lg"></div>
      </div>
      <div className="gamepad-dpad bg-gray-700 rounded-sm shadow-inner"></div>
    </div>
  </div>
);

const PaletteModel = ({ className } : ModelProps) => (
  <div className={`relative ${className}`}>
    <div className="palette">
      <div className="palette-body bg-gradient-to-br from-pink-200 to-pink-400 rounded-full shadow-2xl border-2 border-pink-300"></div>
      <div className="paint-spots">
        <div className="spot bg-red-500 rounded-full shadow-lg"></div>
        <div className="spot bg-blue-500 rounded-full shadow-lg"></div>
        <div className="spot bg-yellow-500 rounded-full shadow-lg"></div>
        <div className="spot bg-green-500 rounded-full shadow-lg"></div>
        <div className="spot bg-purple-500 rounded-full shadow-lg"></div>
      </div>
      <div className="brush bg-amber-600 rounded-full shadow-lg"></div>
    </div>
  </div>
);

const LaptopModel = ({ className } : ModelProps) => (
  <div className={`relative ${className}`}>
    <div className="laptop">
      <div className="laptop-screen bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-xl shadow-2xl border-2 border-gray-600">
        <div className="screen-content bg-gradient-to-br from-green-400 to-blue-500 rounded-lg m-2 opacity-80"></div>
      </div>
      <div className="laptop-base bg-gradient-to-b from-gray-300 to-gray-500 rounded-b-xl shadow-xl border-2 border-gray-400"></div>
      <div className="keyboard bg-gray-600 rounded-sm shadow-inner mx-4 mb-2"></div>
    </div>
  </div>
);

const getModelComponent = (index: number) => {
  const models = [RobotModel, CoffeeModel, ShoppingBagModel, GamepadModel, PaletteModel, LaptopModel];
  return models[index] || RobotModel;
};

export const UseCases = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <>
      <style jsx>{`
        .coffee-cup {
          width: 120px;
          height: 140px;
          position: relative;
          transform-style: preserve-3d;
          animation: float 3s ease-in-out infinite;
        }
        
        .cup-body {
          width: 80px;
          height: 100px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) rotateX(-10deg);
        }
        
        .cup-handle {
          width: 20px;
          height: 40px;
          position: absolute;
          right: -15px;
          top: 30px;
          border: 4px solid #f59e0b;
          border-left: none;
          border-radius: 0 20px 20px 0;
        }
        
        .coffee-liquid {
          width: 70px;
          height: 8px;
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .steam {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .steam-line {
          width: 3px;
          height: 20px;
          margin: 0 2px;
          display: inline-block;
        }
        
        .robot {
          width: 100px;
          height: 120px;
          position: relative;
          animation: float 4s ease-in-out infinite;
        }
        
        .robot-head {
          width: 60px;
          height: 60px;
          position: relative;
          margin: 0 auto 10px;
        }
        
        .robot-eyes {
          display: flex;
          justify-content: space-between;
          padding: 12px 8px 0;
        }
        
        .eye {
          width: 12px;
          height: 12px;
          position: relative;
        }
        
        .pupil {
          width: 6px;
          height: 6px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .robot-mouth {
          width: 20px;
          height: 8px;
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .robot-body {
          width: 80px;
          height: 50px;
          margin: 0 auto;
        }
        
        .shopping-bag {
          width: 100px;
          height: 120px;
          position: relative;
          animation: float 3.5s ease-in-out infinite;
        }
        
        .bag-body {
          width: 80px;
          height: 90px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .bag-handles {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 30px;
        }
        
        .handle {
          width: 6px;
          height: 30px;
          border-radius: 10px 10px 0 0;
        }
        
        .bag-logo {
          width: 20px;
          height: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .gamepad {
          width: 120px;
          height: 80px;
          position: relative;
          animation: float 4.2s ease-in-out infinite;
        }
        
        .gamepad-body {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .gamepad-buttons {
          position: absolute;
          right: 15px;
          top: 15px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        
        .button {
          width: 12px;
          height: 12px;
        }
        
        .gamepad-dpad {
          position: absolute;
          left: 15px;
          top: 20px;
          width: 20px;
          height: 20px;
        }
        
        .palette {
          width: 100px;
          height: 80px;
          position: relative;
          animation: float 3.8s ease-in-out infinite;
        }
        
        .palette-body {
          width: 80px;
          height: 60px;
          position: relative;
          margin: 0 auto;
        }
        
        .paint-spots {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          width: 50px;
        }
        
        .spot {
          width: 8px;
          height: 8px;
        }
        
        .brush {
          position: absolute;
          right: -10px;
          top: 20px;
          width: 4px;
          height: 40px;
        }
        
        .laptop {
          width: 120px;
          height: 80px;
          position: relative;
          animation: float 4.5s ease-in-out infinite;
        }
        
        .laptop-screen {
          width: 100px;
          height: 60px;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%) rotateX(-20deg);
          transform-origin: bottom;
        }
        
        .screen-content {
          height: calc(100% - 16px);
        }
        
        .laptop-base {
          width: 110px;
          height: 20px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .keyboard {
          height: 8px;
          margin-top: 4px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateY(0deg); }
          50% { transform: translateY(-10px) rotateY(5deg); }
        }
        
        @keyframes parallaxFloat {
          0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
          33% { transform: translateY(-15px) rotateX(5deg) rotateY(10deg); }
          66% { transform: translateY(-5px) rotateX(-3deg) rotateY(-5deg); }
        }
      `}</style>

      {/* Hero Section */}
 <section className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-50 via-white to-orange-50 py-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-12 shadow-lg">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <span className={`text-lg font-semibold text-slate-700 ${poppins.className}`}>One Tool, Every Niche</span>
          </div>
          
          <h1 className={`text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-slate-900 mb-8 max-w-6xl leading-[0.9] ${poppins.className}`}>
            If They're on{" "}
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
              Reddit
            </span>
            <br />
            <span className="text-slate-600 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold">
              We'll Find Them
            </span>
          </h1>
          
          <p className={`text-2xl md:text-3xl lg:text-4xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium ${inter.className}`}>
            RedLead discovers leads across{" "}
            <span className="text-orange-600 font-semibold">every business model</span>.
            <br />
            If people are discussing problems you solve,{" "}
            <span className="text-slate-900 font-semibold">you'll know instantly</span>.
          </p>
        </div>
      </section>
 
 
 

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

            const ModelComponent = getModelComponent(i);

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