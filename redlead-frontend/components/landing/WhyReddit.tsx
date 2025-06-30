"use client";
import React, { JSX } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUp, Target } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';
import { FaReddit } from "react-icons/fa";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Type definitions
interface CompanyPosition {
  x: number;
  y: number;
}

interface Company {
  icon: () => JSX.Element;
  name: string;
  position: CompanyPosition;
}

// Company Icons with proper SVG implementations
const CompanyIcons = {
  openai: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#10A37F"/>
      </svg>
    </div>
  ),
  google: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </div>
  ),
  anthropic: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
        <path fillRule="evenodd" d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z" fill="#D4A574"/>
      </svg>
    </div>
  ),
  meta: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    </div>
  ),
  mistral: (): JSX.Element => (
    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-200 hover:scale-110 transition-transform duration-300">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="10" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="3" width="4" height="4" fill="#FF7000"/>
        <rect x="3" y="10" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="10" width="4" height="4" fill="#FF7000"/>
        <rect x="3" y="17" width="4" height="4" fill="#FF7000"/>
        <rect x="10" y="17" width="4" height="4" fill="#FF7000"/>
        <rect x="17" y="17" width="4" height="4" fill="#FF7000"/>
      </svg>
    </div>
  )
};

const companies: Company[] = [
  { icon: CompanyIcons.openai, name: "OpenAI", position: { x: -220, y: -120 } },
  { icon: CompanyIcons.google, name: "Google", position: { x: 220, y: -120 } },
  { icon: CompanyIcons.anthropic, name: "Anthropic", position: { x: -180, y: 140 } },
  { icon: CompanyIcons.meta, name: "Meta", position: { x: 180, y: 140 } },
  { icon: CompanyIcons.mistral, name: "Mistral", position: { x: 0, y: -220 } },
];

export default function MinimalistRedditSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.008]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black mb-6 leading-[1.1] ${poppins.className}`}
          >
            Why{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Reddit
            </span>{" "}
            is the Future of Lead Generation
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className={`text-xl text-black/70 max-w-3xl mx-auto leading-relaxed ${inter.className}`}
          >
            Reddit isn't just social media—it's where{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-semibold">
              AI learns
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-semibold">
              Google searches
            </span>{" "}
            for authentic human insights
          </motion.p>
        </div>

        {/* Central Infographic - Companies Flowing to Reddit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative flex h-[700px] w-full flex-col items-center justify-center overflow-hidden mb-20"
        >
          {/* Reddit Icon in Center */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-20 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-orange-500"
          >
            <FaReddit className="text-7xl text-orange-500" />
            
            {/* Pulsing rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-orange-300 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.6, 1],
                opacity: [0.2, 0, 0.2]
              }}
              transition={{ 
                duration: 3,
                delay: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-orange-200 rounded-full"
            />
          </motion.div>

          {/* Companies flowing toward Reddit */}
          {companies.map((company, index) => (
            <motion.div
              key={index}
              initial={{ 
                x: company.position.x, 
                y: company.position.y,
                opacity: 0,
                scale: 0.8
              }}
              whileInView={{ 
                x: [company.position.x, company.position.x * 0.6, company.position.x * 0.3, 0],
                y: [company.position.y, company.position.y * 0.6, company.position.y * 0.3, 0],
                opacity: [0, 1, 1, 0.4],
                scale: [0.8, 1, 1, 0.7]
              }}
              transition={{ 
                duration: 4,
                delay: index * 0.3,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              viewport={{ once: true }}
              className="absolute z-10"
            >
              <div className="relative">
                <company.icon />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-slate-700 whitespace-nowrap opacity-80">
                  {company.name}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Animated flow lines */}
          {companies.map((company, index) => (
            <svg 
              key={`line-${index}`}
              width="800" 
              height="800" 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
              <motion.path
                d={`M ${400 + company.position.x * 0.8} ${400 + company.position.y * 0.8} Q ${400 + company.position.x * 0.4} ${400 + company.position.y * 0.4} 400 400`}
                stroke={`url(#gradient-${index})`}
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ 
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: 4,
                  delay: index * 0.3,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                viewport={{ once: true }}
              />
            </svg>
          ))}

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              animate={{
                x: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                y: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <blockquote className={`text-2xl lg:text-3xl font-bold text-black/80 italic max-w-4xl mx-auto ${poppins.className}`}>
            "Ignoring Reddit in 2025 is like ignoring{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Google SEO
            </span>{" "}
            a decade ago—a missed opportunity you can't afford."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}