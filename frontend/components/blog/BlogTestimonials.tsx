"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { Quote, Star, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import Image from "next/image";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  metrics: {
    leads: number;
    revenue: string;
    timeframe: string;
  };
  rating: number;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "David Park",
    role: "Founder & CEO",
    company: "CloudSync Solutions",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "RedditLeads completely transformed our customer acquisition. We went from struggling to find 10 leads per month to consistently generating 200+ high-quality leads. The AI-powered targeting is incredibly accurate.",
    metrics: {
      leads: 1247,
      revenue: "$2.3M ARR",
      timeframe: "8 months"
    },
    rating: 5,
    verified: true
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Growth Marketing Director",
    company: "TechFlow Inc",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "The quality of leads from RedditLeads is unmatched. We're seeing 3x higher conversion rates compared to other channels. It's like having a personal lead generation team working 24/7.",
    metrics: {
      leads: 892,
      revenue: "$1.8M ARR",
      timeframe: "6 months"
    },
    rating: 5,
    verified: true
  },
  {
    id: "3",
    name: "James Chen",
    role: "Indie Hacker",
    company: "DevTools Pro",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "As a solo founder, I needed something that could scale with me. RedditLeads helped me find my first 100 customers and now I'm at $15K MRR. The ROI is incredible.",
    metrics: {
      leads: 456,
      revenue: "$15K MRR",
      timeframe: "4 months"
    },
    rating: 5,
    verified: true
  },
  {
    id: "4",
    name: "Sarah Johnson",
    role: "VP of Sales",
    company: "DataViz Analytics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "The AI-generated replies are so natural and effective. Our sales team loves the quality of conversations we're having with RedditLeads prospects. It's like magic.",
    metrics: {
      leads: 2103,
      revenue: "$4.1M ARR",
      timeframe: "12 months"
    },
    rating: 5,
    verified: true
  },
  {
    id: "5",
    name: "Alex Thompson",
    role: "Co-founder",
    company: "EcoTech Solutions",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "We tried every lead generation tool out there. RedditLeads is the only one that consistently delivers qualified prospects who actually want to buy. Game changer.",
    metrics: {
      leads: 678,
      revenue: "$950K ARR",
      timeframe: "5 months"
    },
    rating: 5,
    verified: true
  },
  {
    id: "6",
    name: "Lisa Wang",
    role: "Head of Marketing",
    company: "FinTech Innovations",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    quote: "The ROI is insane. We're spending 70% less on customer acquisition while getting 3x more qualified leads. RedditLeads pays for itself in the first week.",
    metrics: {
      leads: 1834,
      revenue: "$3.2M ARR",
      timeframe: "9 months"
    },
    rating: 5,
    verified: true
  }
];

export const BlogTestimonials: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-900/10 via-red-900/10 to-pink-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl lg:text-4xl font-black text-white mb-6 ${poppins.className}`}>
            What Our
            <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className={`text-xl text-white/70 max-w-3xl mx-auto ${inter.className}`}>
            Join thousands of founders and growth teams who've transformed their customer acquisition with RedditLeads
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-orange-400/30"
                  />
                  {testimonial.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`text-white font-semibold ${poppins.className}`}>
                    {testimonial.name}
                  </h4>
                  <p className={`text-white/60 text-sm ${inter.className}`}>
                    {testimonial.role} at {testimonial.company}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-orange-400/30" />
                <p className={`text-white/80 leading-relaxed pl-6 ${inter.className}`}>
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className={`text-lg font-bold text-orange-400 ${poppins.className}`}>
                      {testimonial.metrics.leads.toLocaleString()}
                    </span>
                  </div>
                  <div className={`text-white/60 text-xs ${inter.className}`}>Leads</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className={`text-lg font-bold text-green-400 ${poppins.className}`}>
                      {testimonial.metrics.revenue}
                    </span>
                  </div>
                  <div className={`text-white/60 text-xs ${inter.className}`}>Revenue</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className={`text-lg font-bold text-blue-400 ${poppins.className}`}>
                      {testimonial.metrics.timeframe}
                    </span>
                  </div>
                  <div className={`text-white/60 text-xs ${inter.className}`}>Timeframe</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-orange-900/20 via-red-900/20 to-pink-900/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`text-4xl lg:text-5xl font-black text-orange-400 mb-2 ${poppins.className}`}>
                10K+
              </div>
              <div className={`text-white/70 ${inter.className}`}>Active Users</div>
            </div>
            <div>
              <div className={`text-4xl lg:text-5xl font-black text-green-400 mb-2 ${poppins.className}`}>
                2.5M+
              </div>
              <div className={`text-white/70 ${inter.className}`}>Leads Generated</div>
            </div>
            <div>
              <div className={`text-4xl lg:text-5xl font-black text-blue-400 mb-2 ${poppins.className}`}>
                $50M+
              </div>
              <div className={`text-white/70 ${inter.className}`}>Revenue Generated</div>
            </div>
            <div>
              <div className={`text-4xl lg:text-5xl font-black text-purple-400 mb-2 ${poppins.className}`}>
                95%
              </div>
              <div className={`text-white/70 ${inter.className}`}>Customer Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
