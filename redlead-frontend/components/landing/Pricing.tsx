"use client";
import React, { useState } from "react";
import { Check, X, Zap, Crown, Building, Gift } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

const PricingComponent = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out RedLead",
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Gift,
      color: "gray",
      features: [
        "1 Project",
        "5 Keywords",
        "10 Subreddits to Monitor",
        "25 Leads per Month",
        "Basic Lead Scoring",
        "Email Support"
      ],
      limitations: [
        "No AI Intent Analysis",
        "No AI Reply Generation",
        "No Competitor Tracking"
      ],
      popular: false,
      cta: "Get Started Free"
    },
    {
      name: "Starter",
      description: "For solopreneurs & indie hackers",
      monthlyPrice: 19,
      yearlyPrice: 15, // 21% discount
      icon: Zap,
      color: "blue",
      features: [
        "1 Project",
        "15 Keywords",
        "50 Subreddits to Monitor",
        "200 Leads per Month",
        "AI-Powered Intent Analysis",
        "AI Reply Generation (75/month)",
        "Priority Email Support"
      ],
      limitations: [
        "No Competitor Tracking",
        "Limited Projects"
      ],
      popular: false,
      cta: "Start 7-Day Trial"
    },
    {
      name: "Pro",
      description: "Best for growing startups & agencies",
      monthlyPrice: 49,
      yearlyPrice: 39, // 20% discount
      icon: Crown,
      color: "orange",
      features: [
        "3 Projects",
        "50 Keywords",
        "Unlimited Subreddits",
        "1,000 Leads per Month",
        "AI Reply Generation (300/month)",
        "Competitor Tracking & Analysis",
        "Opportunity Hijacking",
        "Priority Chat & Email Support"
      ],
      limitations: [],
      popular: true,
      cta: "Start 7-Day Trial"
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
        "Dedicated Account Manager",
        "CRM Integrations",
        "API Access",
        "Custom Webhooks"
      ],
      limitations: [],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const getPrice = (plan : any) => {
    if (plan.monthlyPrice === "Custom") return "Custom";
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan : any) => {
    if (plan.monthlyPrice === "Custom" || plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice * 12;
    const savings = monthlyCost - yearlyCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

  return (
    <section className="relative py-20 sm:py-24 bg-gradient-to-br from-white via-orange-50/20 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.008]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl sm:text-5xl font-black tracking-tighter text-black mb-4 leading-tight ${poppins.className}`}>
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className={`text-xl text-black/70 max-w-2xl mx-auto leading-relaxed ${inter.className}`}>
            Choose the perfect plan to supercharge your Reddit lead generation
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 shadow-lg">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  !isYearly
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                } ${poppins.className}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative ${
                  isYearly
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                } ${poppins.className}`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => {
            const savings = getSavings(plan);
            const IconComponent = plan.icon;
            
            return (
              <div
                key={index}
                className={`relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.popular
                    ? 'border-orange-300 shadow-xl shadow-orange-500/20'
                    : 'border-gray-200/50 shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.color === 'gray' ? 'bg-gray-100' :
                      plan.color === 'blue' ? 'bg-blue-100' :
                      plan.color === 'orange' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${
                        plan.color === 'gray' ? 'text-gray-600' :
                        plan.color === 'blue' ? 'text-blue-600' :
                        plan.color === 'orange' ? 'text-orange-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    
                    <h3 className={`text-2xl font-bold text-black mb-2 ${poppins.className}`}>
                      {plan.name}
                    </h3>
                    
                    <p className={`text-sm text-gray-600 mb-4 ${inter.className}`}>
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className={`text-4xl font-black text-black ${poppins.className}`}>
                          {getPrice(plan) === "Custom" ? "Custom" : `$${getPrice(plan)}`}
                        </span>
                        {getPrice(plan) !== "Custom" && (
                          <span className={`text-gray-500 ml-2 ${inter.className}`}>
                            /{isYearly ? 'month' : 'month'}
                          </span>
                        )}
                      </div>
                      
                      {isYearly && savings && (
                        <div className="mt-2">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Save ${savings.amount}/year ({savings.percentage}% off)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={`text-sm text-gray-700 ${inter.className}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start space-x-3">
                        <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className={`text-sm text-gray-500 ${inter.className}`}>
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                        : plan.name === 'Free'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-800'
                    } ${poppins.className}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Features Comparison */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-8">
          <h3 className={`text-2xl font-bold text-center text-black mb-8 ${poppins.className}`}>
            Why Choose RedLead Over Competitors?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h4 className={`text-lg font-bold text-black mb-2 ${poppins.className}`}>
                AI-Powered Intent Analysis
              </h4>
              <p className={`text-sm text-gray-600 ${inter.className}`}>
                Our AI identifies high-intent leads that competitors miss
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className={`text-lg font-bold text-black mb-2 ${poppins.className}`}>
                Opportunity Hijacking
              </h4>
              <p className={`text-sm text-gray-600 ${inter.className}`}>
                Automatically capture leads from competitor mentions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className={`text-lg font-bold text-black mb-2 ${poppins.className}`}>
                Better Value
              </h4>
              <p className={`text-sm text-gray-600 ${inter.className}`}>
                More features at 40% less cost than RedReach
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className={`text-green-800 font-semibold ${inter.className}`}>
             Cancel anytime
              
            </span>
            <button className="px-8 py-4 bg-white/50 backdrop-blur-sm text-slate-700 font-semibold rounded-full border border-slate-200 hover:bg-white/80 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Watch Demo
              </button>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default PricingComponent;
