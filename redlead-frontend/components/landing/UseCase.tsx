"use client";
import { ArrowRight, Bot, Code, Gamepad, Palette, ShoppingCart, Smartphone, Sparkles } from "lucide-react";
import React from "react";

const useCases = [
  {
    icon: <Bot className="w-6 h-6 text-blue-500" />,
    title: "AI & SaaS Tools",
    lead: `"I'm looking for a Calendly alternative that has better team features. Any suggestions?"`,
    subreddit: "r/saas",
    color: "from-blue-50 to-indigo-50 border-blue-200/30"
  },
  {
    icon: <Smartphone className="w-6 h-6 text-green-500" />,
    title: "Mobile Apps",
    lead: `"Does anyone know a good mobile app for tracking habits? I've tried a few but nothing sticks."`,
    subreddit: "r/apps",
    color: "from-green-50 to-emerald-50 border-green-200/30"
  },
  {
    icon: <ShoppingCart className="w-6 h-6 text-purple-500" />,
    title: "E-commerce Brands",
    lead: `"Where can I buy high-quality, ethically sourced coffee beans online?"`,
    subreddit: "r/Coffee",
    color: "from-purple-50 to-violet-50 border-purple-200/30"
  },
  {
    icon: <Gamepad className="w-6 h-6 text-red-500" />,
    title: "Game Developers",
    lead: `"My friends and I are looking for a new co-op indie game to play on Steam, any hidden gems?"`,
    subreddit: "r/gamingsuggestions",
    color: "from-red-50 to-pink-50 border-red-200/30"
  },
  {
    icon: <Palette className="w-6 h-6 text-pink-500" />,
    title: "Creative Agencies",
    lead: `"We need to hire a freelance graphic designer for a new branding project. Where's the best place to find talent?"`,
    subreddit: "r/forhire",
    color: "from-pink-50 to-rose-50 border-pink-200/30"
  },
  {
    icon: <Code className="w-6 h-6 text-yellow-600" />,
    title: "DevTools",
    lead: `"I'm so frustrated with Electron. Are there any lighter alternatives for building desktop apps?"`,
    subreddit: "r/programming",
    color: "from-yellow-50 to-orange-50 border-yellow-200/30"
  },
];

const businessTypes = [
  "SaaS Startups", "Mobile Apps", "E-commerce", "Game Devs",
  "Creative Agencies", "No-Code", "AI Tools", "DevTools",
  "Marketing", "Creators", "B2B Services", "Design Studios"
];

export const UseCases = () => {
  return (
    // Set a container to prevent overall section overflow issues
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
        {/*
          * FIX: The outer div now acts as a mask.
          * `overflow-hidden` is the key property here. It clips anything that goes outside its bounds.
          * This prevents the horizontal scrollbar on the page.
          * The gradients are moved to this parent container to properly fade the edges.
        */}
        <div className="relative mb-20">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>

          {/* This is the new masking container */}
          <div className="overflow-hidden">
            <div 
              className="flex gap-4 py-4"
              style={{
                // Tripling the array ensures smooth looping without any visible jumps
                animation: 'scroll 35s linear infinite',
              }}
            >
              {[...businessTypes, ...businessTypes, ...businessTypes].map((type, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-foreground/80 border border-white/20 shadow-sm"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Modern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${useCase.color} backdrop-blur-sm rounded-3xl p-8 border transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/5`}
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent opacity-60"></div>
              
              <div className="relative">
                {/* Icon and Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{useCase.title}</h3>
                </div>

                {/* Quote */}
                <div className="mb-6">
                  <p className="text-foreground/70 leading-relaxed italic">
                    "{useCase.lead}"
                  </p>
                </div>

                {/* Subreddit tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-foreground/80">{useCase.subreddit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            And hundreds more niches automatically monitored 24/7
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-orange-200/50 text-sm font-medium text-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Live monitoring active across 15,000+ subreddits
          </div>
        </div>
      </div>

      {/* Modern CSS animations */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* * We translate by one-third of the total width because we have triplicated the array.
              * This ensures a seamless loop. When the first set of items has moved completely
              * out of view, the second set has moved into its place, and the animation resets.
            */
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
};