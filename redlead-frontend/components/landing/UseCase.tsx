"use client";
// 1. You might need to install react-icons: npm install react-icons
import { FaReddit } from "react-icons/fa";
import { ArrowRight, Bot, Code, Gamepad, Palette, ShoppingCart, Smartphone, Sparkles } from "lucide-react";
import React from "react";

// Data arrays are unchanged
const useCases = [
    { icon: <Bot className="w-6 h-6 text-blue-600" />, title: "AI & SaaS Tools", lead: `"I'm looking for a Calendly alternative that has better team features. Any suggestions?"`, subreddit: "r/saas", borderColor: "border-blue-500", glowColor: "hover:shadow-blue-500/20" },
    { icon: <Smartphone className="w-6 h-6 text-green-600" />, title: "Mobile Apps", lead: `"Does anyone know a good mobile app for tracking habits? I've tried a few but nothing sticks."`, subreddit: "r/apps", borderColor: "border-green-500", glowColor: "hover:shadow-green-500/20" },
    { icon: <ShoppingCart className="w-6 h-6 text-purple-600" />, title: "E-commerce Brands", lead: `"Where can I buy high-quality, ethically sourced coffee beans online?"`, subreddit: "r/Coffee", borderColor: "border-purple-500", glowColor: "hover:shadow-purple-500/20" },
    { icon: <Gamepad className="w-6 h-6 text-red-600" />, title: "Game Developers", lead: `"My friends and I are looking for a new co-op indie game to play on Steam, any hidden gems?"`, subreddit: "r/gamingsuggestions", borderColor: "border-red-500", glowColor: "hover:shadow-red-500/20" },
    { icon: <Palette className="w-6 h-6 text-pink-600" />, title: "Creative Agencies", lead: `"We need to hire a freelance graphic designer for a new branding project. Where's the best place to find talent?"`, subreddit: "r/forhire", borderColor: "border-pink-500", glowColor: "hover:shadow-pink-500/20" },
    { icon: <Code className="w-6 h-6 text-yellow-600" />, title: "DevTools", lead: `"I'm so frustrated with Electron. Are there any lighter alternatives for building desktop apps?"`, subreddit: "r/programming", borderColor: "border-yellow-500", glowColor: "hover:shadow-yellow-500/20" },
];

const businessTypes = [ "SaaS Startups", "Mobile Apps", "E-commerce", "Game Devs", "Creative Agencies", "No-Code", "AI Tools", "DevTools", "Marketing", "Creators", "B2B Services", "Design Studios" ];

export const UseCases = () => {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-background to-orange-50/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-orange-200/50 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">One Tool, Every Niche</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            If They're on Reddit,{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              We'll Find Them
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RedLead discovers leads across every business model. If people are discussing problems you solve, you'll know instantly.
          </p>
        </div>

        {/* Floating Marquee */}
        <div className="relative mb-20">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
          <div className="overflow-hidden">
            <div className="flex gap-4 py-4 marquee-content">
              {[...businessTypes, ...businessTypes, ...businessTypes].map((type, index) => (
                <div key={index} className="flex-shrink-0 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-foreground/80 border border-white/20 shadow-sm">
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div key={useCase.title} className={`flex flex-col h-full bg-white/60 backdrop-blur-lg rounded-2xl border border-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${useCase.glowColor} border-t-2 ${useCase.borderColor}`}>
              <div className="p-8 flex-grow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200/80">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">{useCase.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {useCase.lead}
                </p>
              </div>
              <div className="p-8 pt-0">
                {/* 2. Modified this link to include the Reddit logo */}
                <a href="#" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  From 
                  <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5">
                    <FaReddit className="w-4 h-4 text-orange-600" />
                    {useCase.subreddit}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
            {/* ... content unchanged ... */}
        </div>
      </div>

      {/* Modern CSS animations */}
      <style jsx>{`
        .marquee-content {
          animation: scroll 35s linear infinite;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};