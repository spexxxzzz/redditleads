"use client";
import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Check, X, Zap, Crown, Building, Gift, Star, ArrowRight } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  cta: string;
  badge?: string;
}

interface Savings {
  amount: number;
  percentage: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] }
  }
};

const PricingComponent: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans: PricingPlan[] = [
    {
      name: "Free",
      description: "Perfect for trying out Redlead",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Gift,
      color: "gray",
      features: [
        "1 Project",
        "5 Keywords",
        "25 Leads per month",
        "Basic support"
      ],
      limitations: [
        "No AI features",
        "No competitor tracking"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Starter",
      description: "For solopreneurs & indie hackers",
      monthlyPrice: 19,
      yearlyPrice: 15,
      icon: Zap,
      color: "blue",
      features: [
        "1 Project",
        "15 Keywords",
        "200 Leads per month",
        "AI Intent Analysis",
        "AI Replies (75/month)"
      ],
      limitations: [
        "No competitor tracking"
      ],
      popular: false,
      cta: "Start 7-Day Trial"
    },
    {
      name: "Pro",
      description: "Best for growing startups",
      monthlyPrice: 49,
      yearlyPrice: 39,
      icon: Crown,
      color: "orange",
      features: [
        "3 Projects",
        "50 Keywords",
        "1,000 Leads per month",
        "AI Replies (300/month)",
        "Competitor Tracking",
        "Priority Support"
      ],
      limitations: [],
      popular: true,
      cta: "Start 7-Day Trial",
    },
    {
      name: "Enterprise",
      description: "For large teams & agencies",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      icon: Building,
      color: "purple",
      features: [
        "Unlimited Projects",
        "Unlimited Keywords",
        "Unlimited Leads",
        "Team Collaboration",
        "Dedicated Manager",
        "API Access"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const getPrice = (plan: PricingPlan): string | number => {
    if (plan.monthlyPrice === "Custom") return "Custom";
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: PricingPlan): Savings | null => {
    if (plan.monthlyPrice === "Custom" || plan.monthlyPrice === 0) return null;
    const monthlyCost = (plan.monthlyPrice as number) * 12;
    const yearlyCost = (plan.yearlyPrice as number) * 12;
    const savings = monthlyCost - yearlyCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border') => {
    const colorMap = {
      gray: {
        bg: 'bg-gray-900/20',
        text: 'text-gray-400',
        border: 'border-gray-700/30'
      },
      blue: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        border: 'border-blue-700/30'
      },
      orange: {
        bg: 'bg-orange-900/20',
        text: 'text-orange-400',
        border: 'border-orange-700/30'
      },
      purple: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-400',
        border: 'border-purple-700/30'
      }
    };
    return colorMap[color as keyof typeof colorMap][variant];
  };

  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-gray-800/40 to-gray-900/20 opacity-70" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className={`text-xl text-white/70 max-w-3xl mx-auto leading-relaxed ${inter.className}`}>
              Choose the perfect plan to supercharge your Reddit lead generation
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div variants={itemVariants} className="flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-xl">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    !isYearly
                      ? 'bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  } ${poppins.className}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 relative ${
                    isYearly
                      ? 'bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white shadow-lg'
                      : 'text-white/70 hover:text-white'
                  } ${poppins.className}`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => {
              const savings = getSavings(plan);
              const IconComponent = plan.icon;
              const price = getPrice(plan);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative bg-gray-900/50 backdrop-blur-xl rounded-3xl border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-orange-500/50 shadow-2xl shadow-orange-500/20'
                      : 'border-white/10 hover:border-white/20'
                  } overflow-hidden`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div className="relative p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl ${getColorClasses(plan.color, 'bg')} border ${getColorClasses(plan.color, 'border')} flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${getColorClasses(plan.color, 'text')}`} />
                      </div>
                      
                      <h3 className={`text-xl font-bold text-white mb-1 ${poppins.className}`}>
                        {plan.name}
                      </h3>
                      
                      <p className={`text-xs text-white/60 mb-4 ${inter.className}`}>
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center">
                          <span className={`text-3xl font-black text-white ${poppins.className}`}>
                            {price === "Custom" ? "Custom" : `$${price}`}
                          </span>
                          {price !== "Custom" && (
                            <span className={`text-white/50 ml-1 text-sm ${inter.className}`}>
                              /month
                            </span>
                          )}
                        </div>
                        
                        {isYearly && savings && (
                          <div className="mt-2">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                              Save ${savings.amount}/year
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className={`text-xs text-white/80 ${inter.className}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start space-x-2">
                          <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className={`text-xs text-white/50 ${inter.className}`}>
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#FF4500] to-[#FF6B00] text-white shadow-lg hover:shadow-xl'
                          : plan.name === 'Free'
                          ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      } ${poppins.className}`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingComponent;
