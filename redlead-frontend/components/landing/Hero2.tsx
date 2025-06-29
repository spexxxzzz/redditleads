"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Github, Twitter, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Hero2 = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="relative bg-gradient-to-br from-slate-50 via-white to-orange-50 text-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-500"></div>
        
        {/* Main Content */}
        <div className="relative z-10 px-6 py-20">
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-8 shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-orange-500" />
              <span className={`text-xl font-semibold text-slate-700 ${poppins.className}`}>
                Stay Connected
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 max-w-4xl mx-auto leading-[0.9] ${poppins.className}`}
            >
              Ready to{" "}
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                Transform
              </span>
              <br />
              <span className="text-slate-600 text-4xl sm:text-5xl lg:text-6xl font-bold">
                Your Lead Game?
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium mb-12 ${inter.className}`}
            >
              Join thousands of businesses already using{" "}
              <span className="text-orange-400 font-semibold">RedLead</span> to discover
              their next customers on Reddit.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25">
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-white/50 backdrop-blur-sm text-slate-700 font-semibold rounded-full border border-slate-200 hover:bg-white/80 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Product */}
              <div>
                <h3 className={`text-xl font-bold mb-6 text-orange-600 ${poppins.className}`}>
                  Product
                </h3>
                <ul className="space-y-3">
                  {['Features', 'Pricing', 'How it Works'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className={`text-xl font-bold mb-6 text-orange-600 ${poppins.className}`}>
                  Support
                </h3>
                <ul className="space-y-3">
                  {['Help Center', 'Contact', 'Privacy Policy'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-slate-600 hover:text-orange-600 transition-colors duration-300">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Social Links & Copyright */}
            <div className="border-t border-slate-200/50 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                    <span className={`text-xl font-bold text-slate-900 ${poppins.className}`}>
                      RedLead
                    </span>
                  </div>
                  <span className="text-slate-500 text-sm">
                    © 2024 RedLead. All rights reserved.
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Social Icons */}
                  <div className="flex gap-4">
                    {[
                      { icon: Twitter, label: 'Twitter' },
                      { icon: Mail, label: 'Email' }
                    ].map(({ icon: Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        className="p-2 bg-white/50 backdrop-blur-sm rounded-full hover:bg-orange-100 transition-all duration-300 hover:scale-110 border border-slate-200/50"
                        aria-label={label}
                      >
                        <Icon className="w-5 h-5 text-slate-600 hover:text-orange-600" />
                      </a>
                    ))}
                  </div>
                  
                  {/* Back to Top */}
                  <button
                    onClick={scrollToTop}
                    className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full hover:from-orange-600 hover:to-red-600 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                    aria-label="Back to top"
                  >
                    <ArrowUp className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
          animation: gradient-x 4s ease infinite;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
    </>
  );
};