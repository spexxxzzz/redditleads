"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-20">
          <Link href="/" className="text-3xl font-bold text-foreground">
            red<span className="text-primary">lead</span>
          </Link>

          {/* Desktop Menu with Glowing Effect */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative group px-4 py-2 text-lg font-semibold text-foreground hover:text-primary transition-colors duration-300"
              >
                {link.label}
                <span className="absolute inset-0 -z-10 scale-95 rounded-lg bg-primary/10 border border-primary/20 opacity-0 shadow-[0_0_20px_rgba(255,69,0,0.4)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,69,0,0.5)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-muted-foreground"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-50 flex flex-col p-4">
          <div className="flex justify-between items-center mb-8 h-20">
            <Link href="/" className="text-3xl font-bold text-foreground">
              red<span className="text-primary">lead</span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md text-muted-foreground"
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
                className="text-xl font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-full border-t border-border my-4"></div>
            <Link
              href="/login"
              className="text-xl font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg text-xl transition-colors mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};