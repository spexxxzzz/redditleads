"use client";
import React from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { Calendar, Clock, ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";
import Image from "next/image";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
  metrics: {
    leads: number;
    revenue: string;
    conversion: string;
  };
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "From 0 to $50K MRR: How I Found My First 100 Customers on Reddit",
    excerpt: "Sarah Chen, founder of TaskFlow AI, shares her journey of using RedditLeads to discover high-intent customers and scale from idea to $50K monthly recurring revenue in just 6 months.",
    author: {
      name: "Sarah Chen",
      role: "Founder & CEO",
      company: "TaskFlow AI",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Success Story",
    featured: true,
    metrics: {
      leads: 847,
      revenue: "$50K MRR",
      conversion: "12.3%"
    },
    tags: ["SaaS", "AI", "Productivity"]
  },
  {
    id: "2",
    title: "The Reddit Strategy That Generated 2,000+ Qualified Leads for My B2B Startup",
    excerpt: "Marcus Rodriguez reveals his systematic approach to finding enterprise customers through Reddit communities, including the exact subreddits and messaging strategies that worked.",
    author: {
      name: "Marcus Rodriguez",
      role: "Growth Lead",
      company: "DataSync Pro",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-12",
    readTime: "6 min read",
    category: "Growth Strategy",
    featured: false,
    metrics: {
      leads: 2047,
      revenue: "$2.1M ARR",
      conversion: "8.7%"
    },
    tags: ["B2B", "Enterprise", "Data"]
  },
  {
    id: "3",
    title: "How I Built a $1M E-commerce Brand Using Reddit for Customer Discovery",
    excerpt: "Elena Petrov shares her complete playbook for identifying trending products and building a community-driven brand that generated $1M in sales within 18 months.",
    author: {
      name: "Elena Petrov",
      role: "Founder",
      company: "EcoGear Co",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-10",
    readTime: "10 min read",
    category: "E-commerce",
    featured: false,
    metrics: {
      leads: 3240,
      revenue: "$1M Sales",
      conversion: "15.2%"
    },
    tags: ["E-commerce", "Sustainability", "Community"]
  },
  {
    id: "4",
    title: "The Psychology of Reddit Lead Generation: What Actually Works in 2025",
    excerpt: "Dr. James Wilson, a behavioral psychologist and serial entrepreneur, breaks down the psychological triggers that make Reddit users convert into paying customers.",
    author: {
      name: "Dr. James Wilson",
      role: "Behavioral Psychologist",
      company: "Conversion Labs",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-08",
    readTime: "12 min read",
    category: "Psychology",
    featured: false,
    metrics: {
      leads: 1560,
      revenue: "$750K ARR",
      conversion: "22.1%"
    },
    tags: ["Psychology", "Conversion", "Research"]
  },
  {
    id: "5",
    title: "From Side Project to $10K MRR: My Reddit-First Launch Strategy",
    excerpt: "Alex Kim documents his complete journey from building a weekend project to achieving $10K MRR using RedditLeads for customer discovery and validation.",
    author: {
      name: "Alex Kim",
      role: "Indie Hacker",
      company: "CodeCraft Tools",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-05",
    readTime: "7 min read",
    category: "Indie Hacking",
    featured: false,
    metrics: {
      leads: 892,
      revenue: "$10K MRR",
      conversion: "18.5%"
    },
    tags: ["Indie Hacking", "Developer Tools", "Side Project"]
  },
  {
    id: "6",
    title: "Reddit vs. Other Platforms: A Data-Driven Comparison for Lead Generation",
    excerpt: "Marketing analyst Priya Patel shares her comprehensive study comparing Reddit's lead generation effectiveness against LinkedIn, Twitter, and Facebook for B2B startups.",
    author: {
      name: "Priya Patel",
      role: "Marketing Analyst",
      company: "Growth Metrics",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"
    },
    date: "2025-01-03",
    readTime: "9 min read",
    category: "Analytics",
    featured: false,
    metrics: {
      leads: 2100,
      revenue: "$1.5M ARR",
      conversion: "11.8%"
    },
    tags: ["Analytics", "B2B", "Comparison"]
  }
];

export const BlogGrid: React.FC = () => {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  // Helper function to format dates consistently
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-orange-900/20 via-red-900/20 to-pink-900/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 lg:p-12 overflow-hidden relative">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 ${inter.className}`}>
                    Featured Story
                  </span>
                  <div className="flex items-center text-white/60 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className={inter.className}>{formatDate(featuredPost.date)}</span>
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className={inter.className}>{featuredPost.readTime}</span>
                  </div>
                </div>

                <h2 className={`text-3xl lg:text-4xl font-black text-white mb-6 leading-tight ${poppins.className}`}>
                  {featuredPost.title}
                </h2>

                <p className={`text-xl text-white/70 mb-8 leading-relaxed ${inter.className}`}>
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-orange-400/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                      <h4 className={`text-white font-semibold ${poppins.className}`}>
                        {featuredPost.author.name}
                      </h4>
                      <p className={`text-white/60 text-sm ${inter.className}`}>
                        {featuredPost.author.role} at {featuredPost.author.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold text-orange-400 ${poppins.className}`}>
                        {featuredPost.metrics.leads.toLocaleString()}
                      </div>
                      <div className={`text-white/60 text-sm ${inter.className}`}>Leads Found</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold text-green-400 ${poppins.className}`}>
                        {featuredPost.metrics.revenue}
                      </div>
                      <div className={`text-white/60 text-sm ${inter.className}`}>Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold text-blue-400 ${poppins.className}`}>
                        {featuredPost.metrics.conversion}
                      </div>
                      <div className={`text-white/60 text-sm ${inter.className}`}>Conversion</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm text-orange-300 bg-orange-400/10 border border-orange-400/20 ${inter.className}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 ${inter.className}`}>
                  {post.category}
                </span>
                <div className="flex items-center text-white/60 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span className={inter.className}>{formatDate(post.date)}</span>
                </div>
              </div>

              <h3 className={`text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors duration-300 ${poppins.className}`}>
                {post.title}
              </h3>

              <p className={`text-white/70 mb-4 leading-relaxed ${inter.className}`}>
                {post.excerpt}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full border border-orange-400/30"
                />
                <div>
                  <h4 className={`text-white font-semibold text-sm ${poppins.className}`}>
                    {post.author.name}
                  </h4>
                  <p className={`text-white/60 text-xs ${inter.className}`}>
                    {post.author.role} at {post.author.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className={inter.className}>{post.metrics.leads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className={inter.className}>{post.metrics.revenue}</span>
                  </div>
                </div>
                <div className="flex items-center text-white/60 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className={inter.className}>{post.readTime}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`px-2 py-1 rounded-full text-xs text-orange-300 bg-orange-400/10 border border-orange-400/20 ${inter.className}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 text-orange-400 hover:text-orange-300 transition-colors duration-300 group">
                <span className={`font-semibold ${inter.className}`}>Read Full Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
