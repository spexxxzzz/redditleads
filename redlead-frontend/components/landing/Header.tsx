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
    <header className="w-full sticky top-0 z-50 backdrop-blur-xl border-b border-orange-100/50 shadow-lg">
      {/* Exact Same Background as Hero */}
      <div className="absolute inset-0">
        {/* Primary Gradient Base - Same as Hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100/20"></div>
        
        {/* Aesthetic Mesh Gradient Overlay - Same as Hero */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.08),transparent_50%),radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)]"></div>
        
        {/* Subtle Geometric Pattern - Same as Hero */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0 bg-[linear-gradient(30deg,#f97316_12%,transparent_12.5%,transparent_87%,#f97316_87.5%,#f97316),linear-gradient(150deg,#f97316_12%,transparent_12.5%,transparent_87%,#f97316_87.5%,#f97316),linear-gradient(30deg,#f97316_12%,transparent_12.5%,transparent_87%,#f97316_87.5%,#f97316),linear-gradient(150deg,#f97316_12%,transparent_12.5%,transparent_87%,#f97316_87.5%,#f97316)] bg-[length:80px_140px] bg-[position:0_0,0_0,40px_70px,40px_70px]"></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-20">
          <Link href="/" className={`text-3xl font-black text-black ${poppins.className}`}>
            red<span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">lead</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative group px-4 py-2 text-lg font-semibold text-black/80 hover:text-orange-600 transition-all duration-300 rounded-lg ${poppins.className}`}
              >
                {link.label}
                <span className="absolute inset-0 -z-10 scale-95 rounded-lg bg-white/40 border border-orange-200/50 opacity-0 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 backdrop-blur-sm"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={`text-lg font-semibold text-black/80 hover:text-white transition-all duration-300 px-6 py-3 rounded-lg border-2 border-orange-200/50 hover:border-orange-500 hover:bg-orange-500 backdrop-blur-sm ${poppins.className}`}
            >
              Login
            </Link>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-300/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              
              <Link
                href="/signup"
                className={`relative bg-black/90 backdrop-blur-xl hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 border border-white/10 ${poppins.className}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-black/70 hover:text-orange-600 transition-colors"
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
          {/* Same Background as Hero for Mobile Menu */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(249,115,22,0.08),transparent_50%),radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)]"></div>
          
          <div className="relative p-4">
            <div className="flex justify-between items-center mb-8 h-20">
              <Link href="/" className={`text-3xl font-black text-black ${poppins.className}`}>
                red<span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">lead</span>
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-black/70 hover:text-orange-600 transition-colors"
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
                  className={`text-xl font-semibold text-black/80 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-white/40 backdrop-blur-sm ${poppins.className}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="w-full border-t border-orange-200/50 my-4"></div>
              
              <Link
                href="/login"
                className={`text-lg font-semibold text-black/80 hover:text-white transition-all duration-300 px-6 py-3 rounded-lg border-2 border-orange-200/50 hover:border-orange-500 hover:bg-orange-500 backdrop-blur-sm ${poppins.className}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-300/30 via-orange-400/40 to-orange-500/30 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                <Link
                  href="/signup"
                  className={`relative bg-black/90 backdrop-blur-xl hover:bg-black text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 border border-white/10 ${poppins.className}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
