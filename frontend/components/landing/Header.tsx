"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl border-b border-orange-500/20 shadow-lg shadow-orange-500/10">
      {/* Dark Mode Background - Same as Hero */}
      <div className="absolute inset-0">
        {/* Primary Dark Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/90"></div>
        
        {/* Dark Glowing Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 via-gray-800/30 to-orange-900/10 opacity-60"></div>
        
        {/* Subtle Radial Dark Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),transparent_60%)] opacity-70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.12),transparent_60%)] opacity-50"></div>
        
        {/* Dark Gradient Lines */}
        <div className="absolute inset-y-0 left-1/4 w-px bg-gradient-to-b from-transparent via-orange-500/20 to-transparent opacity-40"></div>
        <div className="absolute inset-y-0 right-1/3 w-px bg-gradient-to-b from-transparent via-orange-500/15 to-transparent opacity-30"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className={`flex items-center text-3xl font-black text-white ${poppins.className}`}>
            <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
            red<span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">lead</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative group px-4 py-2 text-lg font-semibold text-white/80 hover:text-orange-400 transition-all duration-300 rounded-lg ${poppins.className}`}
              >
                {link.label}
                <span className="absolute inset-0 -z-10 scale-95 rounded-lg bg-white/5 border border-orange-500/20 opacity-0 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 backdrop-blur-sm"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={`text-lg font-semibold text-white/80 hover:text-orange-400 transition-all duration-300 px-6 py-3 rounded-lg border-2 border-orange-500/20 hover:border-orange-400 hover:bg-orange-500/10 backdrop-blur-sm ${poppins.className}`}
            >
              Login
            </Link>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <Link
                href="/signup"
                className={`relative bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 border border-orange-500/20 ${poppins.className}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-white/70 hover:text-orange-400 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Same Dark Background as Hero for Mobile Menu */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 via-gray-800/30 to-orange-900/10 opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),transparent_60%)] opacity-70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.12),transparent_60%)] opacity-50"></div>
          
          <div className="relative p-4">
            <div className="flex justify-between items-center mb-8 h-20">
              <Link href="/" className={`flex items-center text-3xl font-black text-white ${poppins.className}`}>
                <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
                red<span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">lead</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-white/70 hover:text-orange-400 transition-colors"
                aria-label="Close menu"
              >
                <X className="size-6" />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-6 text-center mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xl font-semibold text-white/80 hover:text-orange-400 transition-colors px-4 py-2 rounded-lg hover:bg-white/5 backdrop-blur-sm ${poppins.className}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="w-full border-t border-orange-500/20 my-4"></div>
              
              <Link
                href="/login"
                className={`text-lg font-semibold text-white/80 hover:text-orange-400 transition-all duration-300 px-6 py-3 rounded-lg border-2 border-orange-500/20 hover:border-orange-400 hover:bg-orange-500/10 backdrop-blur-sm ${poppins.className}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                <Link
                  href="/signup"
                  className={`relative bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 border border-orange-500/20 ${poppins.className}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-S-to-r from-transparent via-orange-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
