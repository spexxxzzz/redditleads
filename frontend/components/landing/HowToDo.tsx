"use client";
import React from "react";
import { NeonGradientCard } from "../magicui/neon-gradient-card"; // Adjust import path as needed
import { Poppins } from "next/font/google";
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const REDDIT_ORANGE = "#FF4500";
const REDDIT_YELLOW = "#FFD635";

const steps = [
  {
    title: "Connect Your Business",
    description:
      "Paste your website URL. Our AI instantly analyzes your business and identifies your ideal customers.",
    icon: LinkIcon,
    neon: { firstColor: REDDIT_ORANGE, secondColor: REDDIT_YELLOW },
  },
  {
    title: "AI Finds Your Leads",
    description:
      "Our intelligent system scans Reddit 24/7, identifying warm prospects who are actively seeking solutions like yours.",
    icon: MagnifyingGlassIcon,
    neon: { firstColor: REDDIT_YELLOW, secondColor: REDDIT_ORANGE },
  },
  {
    title: "Start Converting",
    description:
      "Get qualified leads delivered to your inbox with AI-generated responses ready to send. No manual work required.",
    icon: ChatBubbleLeftRightIcon,
    neon: { firstColor: REDDIT_ORANGE, secondColor: REDDIT_YELLOW },
  },
];

export function HowToDo() {
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-br from-[#1a1a1b] via-[#272729] to-[#1a1a1b] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            className={`text-4xl sm:text-5xl font-bold text-white tracking-tight ${poppins.className}`}
          >
            Onboard in{" "}
            <span className="bg-gradient-to-r from-[#FF4500] via-[#FFD635] to-[#FF4500] bg-clip-text text-transparent">
              3 Simple Steps
            </span>
          </h2>
          <p
            className={`mt-4 text-lg text-gray-400 max-w-2xl mx-auto ${poppins.className}`}
          >
            Start generating leads from Reddit in under 2 minutes with our seamless onboarding experience.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
          {/* Step Circles Above Cards */}
          <div className="absolute w-full flex justify-between pointer-events-none" style={{ top: -32 }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                className="flex justify-center w-1/3"
                style={{
                  position: "relative",
                  left: idx === 0 ? "0%" : idx === 2 ? "0%" : undefined,
                  right: idx === 2 ? "0%" : undefined,
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF4500] shadow-lg border-4 border-white/10">
                  <span className={`text-white font-bold text-lg ${poppins.className}`}>
                    {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {steps.map((step, idx) => (
            <NeonGradientCard
              key={step.title}
              borderSize={4}
              borderRadius={20}
              neonColors={step.neon}
              className="transition-transform duration-300 hover:scale-105 pt-4"
            >
              <div className="flex flex-col items-center text-center space-y-6 min-h-[320px] relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] shadow-lg mb-2">
                  <step.icon className="w-8 h-8 text-gray-300" />
                </div>
                <h3
                  className={`text-2xl font-semibold text-white ${poppins.className}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-gray-400 text-base leading-relaxed ${poppins.className}`}
                >
                  {step.description}
                </p>
              </div>
            </NeonGradientCard>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <button
            className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#FF4500] to-[#FFD635] text-white font-semibold rounded-2xl text-lg shadow-xl hover:scale-105 transition-transform duration-300 ${poppins.className}`}
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  );
}
