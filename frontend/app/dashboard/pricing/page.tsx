"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Check, X, Zap, Crown, Building, Gift, Star, ArrowRight } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';
import { PaymentButton } from '@/components/payment/PaymentButton';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

// Interfaces and variants
interface PricingPlan {
  id: string;
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

export default function PricingPage() {
  const [isYearly, setIsYearly] = React.useState(false);
  const { isSignedIn } = useUser();

  const plans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for trying out RedditLeads",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Gift,
      color: "gray",
      features: [
        "1 Project",
        "25 Leads per month",
        "5 AI Summaries",
        "5 AI Replies"
      ],
      limitations: [],
      popular: false,
      cta: "Get Started Free"
    },
    {
      id: "pdt_2A3SVJeAnBgj8XjLeoiaR",
      name: "Starter",
      description: "For SaaS builders, in the validation phase and finding their first potential customers",
      monthlyPrice: 13,
      yearlyPrice: 10,
      icon: Zap,
      color: "blue",
      features: [
        "1 Project",
        "500 Leads per month",
        "Unlimited AI Summaries",
        "Unlimited AI Replies"
      ],
      limitations: [],
      popular: false,
      cta: "Start 7-Day Trial"
    },
    {
      id: "pdt_jhcgzC7RawLnUVJr4bn0a",
      name: "Pro",
      description: "For Solopreneurs finding their initial customers",
      monthlyPrice: 39,
      yearlyPrice: 31,
      icon: Crown,
      color: "orange",
      features: [
        "5 Projects",
        "5,000 Leads per month",
        "Unlimited AI Summaries",
        "Automated AI Replies",
        "Unlimited AI Replies",
        "Webhook Integrations",
        "Priority Support"
      ],
      limitations: [],
      popular: true,
      cta: "Start 7-Day Trial",
    },
    {
      id: "pdt_mXpMfglw1fhJpQGW2AFnj",
      name: "Ultimate",
      description: "Best for growing startups to get aggressive leads",
      monthlyPrice: 90,
      yearlyPrice: 72,
      icon: Building,
      color: "purple",
      features: [
        "Unlimited Projects",
        "Unlimited Leads",
        "Unlimited AI Summaries",
        "Automated AI Replies",
        "Unlimited AI Replies",
        "Webhook Integrations",
        "Priority Support",
        "Dedicated Manager"
      ],
      limitations: [],
      popular: false,
      cta: "Start 7-Day Trial"
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

  return (
    <>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        @keyframes diamond-shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translateX(200%) skewX(-12deg); opacity: 0.3; }
        }
        .diamond-shimmer {
          animation: diamond-shimmer 4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-black">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <h1 className={`text-2xl font-bold tracking-tight ${poppins.className}`}>
                  <span className="text-white">Reddit</span><span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Leads</span>
                </h1>
              </Link>
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="relative py-20 sm:py-32 overflow-hidden bg-black">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-orange-400/5 rounded-full blur-3xl opacity-50"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 25, 0], scale: [1, 0.9, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute bottom-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tl from-orange-500/8 to-orange-400/4 rounded-full blur-3xl opacity-30"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-12"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center">
                <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
                  Choose Your <span className="text-orange-500">Plan</span>
                </h2>
                <p className={`text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
                  Upgrade your Reddit lead generation with our powerful plans
                </p>
              </motion.div>

              {/* Billing Toggle */}
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="flex w-fit overflow-hidden rounded-md border border-gray-700 bg-gray-800">
                  <button
                    onClick={() => setIsYearly(false)}
                    className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 ${
                      !isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'
                    } ${inter.className}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsYearly(true)}
                    className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 ${
                      isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'
                    } ${inter.className}`}
                  >
                    Yearly (save 20%)
                  </button>
                </div>
              </motion.div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                  const price = getPrice(plan);
                  
                  return (
                    <motion.div
                      key={plan.name}
                      variants={itemVariants}
                      className={`relative h-full rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                        plan.name === 'Ultimate' ? 'hover:shadow-cyan-400/50' : ''
                      } ${
                        plan.name === 'Pro' ? 'hover:shadow-orange-400/30' : ''
                      } ${
                        plan.name === 'Pro' && plan.popular
                          ? 'border-orange-400/50 bg-gradient-to-br from-orange-600/20 via-orange-500/15 via-orange-400/10 to-orange-300/5 shadow-orange-500/30 backdrop-blur-sm relative overflow-hidden group'
                          : plan.name === 'Starter'
                          ? 'border-gray-300/50 bg-gradient-to-br from-gray-400/20 via-gray-300/15 via-gray-200/10 to-gray-100/5 shadow-gray-300/30 backdrop-blur-sm hover:border-gray-200/60'
                          : plan.name === 'Ultimate'
                          ? 'border-2 border-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-gradient-to-br from-cyan-50/50 via-blue-50/40 via-indigo-50/35 to-purple-50/30 shadow-cyan-300/60 backdrop-blur-sm hover:border-cyan-200/90 hover:shadow-cyan-200/70 relative overflow-hidden group'
                          : 'border-gray-700 bg-gray-900/30 hover:border-gray-600 backdrop-blur-sm'
                      }`}
                    >
                      <div className="relative flex h-full flex-col justify-between p-6">
                        {/* Animated glitter border for Ultimate plan */}
                        {plan.name === 'Ultimate' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-300 via-blue-200 via-cyan-300 to-blue-200 rounded-2xl animate-spin-slow opacity-60 pointer-events-none"></div>
                        )}
                        {plan.name === 'Ultimate' && (
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl pointer-events-none"></div>
                        )}
                        {/* Premium shimmer effect for Ultimate plan */}
                        {plan.name === 'Ultimate' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent -skew-x-12 animate-pulse opacity-30 pointer-events-none"></div>
                        )}
                        {/* Diamond sparkle effect */}
                        {plan.name === 'Ultimate' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 diamond-shimmer opacity-40 pointer-events-none"></div>
                        )}
                        {/* Premium glow effect for Ultimate plan */}
                        {plan.name === 'Ultimate' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-300 to-blue-200 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
                        )}
                        
                        {/* Pro plan animation effects */}
                        {plan.name === 'Pro' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/15 to-transparent -skew-x-12 animate-pulse opacity-20 pointer-events-none"></div>
                        )}
                        {plan.name === 'Pro' && (
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-300/20 to-orange-200/20 rounded-2xl blur-sm opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
                        )}
                        
                        <div className="flex flex-col gap-4 relative z-10 pointer-events-none">
                          {/* Plan Header and Features */}
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              {plan.name === 'Ultimate' && (
                                <Crown className="w-6 h-6 text-cyan-600 animate-bounce drop-shadow-lg" />
                              )}
                              {plan.name === 'Pro' && (
                                <Crown className="w-5 h-5 text-orange-500 animate-pulse drop-shadow-md" />
                              )}
                              <h3 className={`text-lg font-bold ${plan.name === 'Ultimate' ? 'text-cyan-800 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm' : 'text-white'} ${poppins.className}`}>
                                {plan.name}
                              </h3>
                              {plan.name === 'Ultimate' && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full shadow-lg">
                                  <Star className="w-3 h-3 text-cyan-900 animate-pulse drop-shadow-sm" />
                                  <span className="text-xs font-black text-cyan-900 tracking-wide drop-shadow-sm">PREMIUM</span>
                                </div>
                              )}
                              {plan.name === 'Pro' && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-md">
                                  <Star className="w-3 h-3 text-orange-900 animate-pulse drop-shadow-sm" />
                                  <span className="text-xs font-bold text-orange-900 tracking-wide drop-shadow-sm">POPULAR</span>
                                </div>
                              )}
                            </div>
                            <p className={`text-sm font-medium ${plan.name === 'Ultimate' ? 'text-cyan-700 drop-shadow-sm' : 'text-gray-400'} ${inter.className}`}>
                              {plan.description}
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-3xl font-black ${plan.name === 'Ultimate' ? 'text-cyan-800 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm' : 'text-white'} ${poppins.className}`}>
                                {price === "Custom" ? "Custom" : (price === 0 ? "Free" : `$${price}`)}
                              </span>
                              {price !== "Custom" && price !== 0 && (
                                <span className={`text-sm font-bold ${plan.name === 'Ultimate' ? 'text-cyan-700 drop-shadow-sm' : 'text-gray-400'} ${inter.className}`}>/mo</span>
                              )}
                            </div>
                            {/* Customer Expectations */}
                            {plan.name === "Starter" && (
                              <p className={`text-sm font-medium text-orange-400 ${inter.className}`}>
                                expect 8-10 customers
                              </p>
                            )}
                            {plan.name === "Pro" && (
                              <p className={`text-sm font-medium text-orange-400 ${inter.className}`}>
                                expect 25-30 customers
                              </p>
                            )}
                            {plan.name === "Ultimate" && (
                              <p className={`text-sm font-medium text-orange-400 ${inter.className}`}>
                                expect 99+ customers
                              </p>
                            )}
                          </div>
                          <hr className={`${plan.name === 'Ultimate' ? 'border-cyan-300' : 'border-gray-700'}`} />
                          <div className="flex flex-col gap-4">
                            <p className={`text-sm font-bold ${plan.name === 'Ultimate' ? 'text-cyan-700 bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm' : 'text-gray-400'} ${inter.className}`}>
                              {plan.name === "Basic" ? "Includes" : plan.name === "Starter" ? "Everything in Basic, plus" : plan.name === "Pro" ? "Everything in Starter, plus" : plan.name === "Ultimate" ? "Everything in Pro, plus" : "Includes"}
                            </p>
                            <div className="flex flex-col gap-2">
                              {plan.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center gap-2">
                                  <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                                  <span className={`text-sm font-semibold ${plan.name === 'Ultimate' ? 'text-cyan-800 drop-shadow-sm' : 'text-gray-200'} ${inter.className}`}>{feature}</span>
                                </div>
                              ))}
                              {plan.limitations.map((limitation, limitIndex) => (
                                <div key={limitIndex} className="flex items-center gap-2">
                                  <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                                  <span className={`text-sm ${plan.name === 'Ultimate' ? 'text-gray-500' : 'text-gray-500'} ${inter.className}`}>{limitation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Payment Button */}
                        <div className="mt-6 relative z-50 pointer-events-auto">
                          <PaymentButton
                            planId={plan.id}
                            planName={plan.name}
                            price={typeof price === 'number' ? price : 0}
                            isYearly={isYearly}
                            className={`w-full ${poppins.className}`}
                            onSuccess={() => {
                              console.log(`Successfully subscribed to ${plan.name}`);
                              // Redirect to dashboard after successful payment
                              window.location.href = '/dashboard?subscription=success';
                            }}
                            onError={(error) => {
                              console.error(`Payment error for ${plan.name}:`, error);
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Additional Info */}
              <motion.div variants={itemVariants} className="text-center">
                <p className={`text-sm text-gray-400 ${inter.className}`}>
                  All plans include 7-day free trial. No credit card required.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
