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
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-20">
          <Link href="/" className={`text-3xl font-black text-slate-900 ${poppins.className}`}>
            red<span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">lead</span>
          </Link>

          {/* Desktop Menu with Glowing Effect */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative group px-4 py-2 text-lg font-semibold text-slate-700 hover:text-orange-600 transition-colors duration-300 ${poppins.className}`}
              >
                {link.label}
                <span className="absolute inset-0 -z-10 scale-95 rounded-lg bg-orange-50 border border-orange-200 opacity-0 shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className={`text-lg font-semibold text-slate-700 hover:text-orange-600 transition-colors px-4 py-2 ${poppins.className}`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.5)] ${poppins.className}`}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-slate-600"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-8 h-20">
            <Link href="/" className={`text-3xl font-black text-slate-900 ${poppins.className}`}>
              red<span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">lead</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md text-slate-600"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 text-center mt-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xl font-semibold text-slate-700 hover:text-orange-600 transition-colors ${poppins.className}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-full border-t border-slate-200 my-4"></div>
            {/* <Link
  href="/login"
  className={`text-lg font-semibold text-slate-700 hover:text-orange-600 transition-all duration-300 px-6 py-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 ${poppins.className}`}
>
  Login
</Link>

<Link
  href="/signup"
  className={`bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:scale-105 transform ${poppins.className}`}
>
  Get Started
</Link> */}
{/* Login Button - Ghost Style */}
<Link
  href="/login"
  className={`text-lg font-semibold text-slate-700 hover:text-white transition-all duration-300 px-6 py-3 rounded-lg border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-500 ${poppins.className}`}
>
  Login
</Link>

{/* Get Started - Enhanced Gradient */}
<Link
  href="/signup"
  className={`bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,146,60,0.7)] hover:scale-105 transform relative overflow-hidden ${poppins.className}`}
>
  <span className="relative z-10">Get Started</span>
  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
</Link>


          </div>
        </div>
      )}
    </header>
  );
};
