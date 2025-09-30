"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Inter, Poppins } from "next/font/google";
import { Mail, ArrowRight, CheckCircle, TrendingUp, Users, Zap, Loader2 } from "lucide-react";
import { api } from '@/lib/api';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const BlogNewsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.subscribeToNewsletter(email, 'blog');
      
      if (response.success) {
        setIsSubscribed(true);
        setMessage(response.message);
        setEmail(''); // Clear the form
        
        // Reset after 5 seconds
        setTimeout(() => {
          setIsSubscribed(false);
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-orange-900/20 via-red-900/20 to-pink-900/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 lg:p-12 text-center relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-red-400/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 mb-6"
            >
              <Zap className="w-4 h-4" />
              <span className={inter.className}>Weekly Insights</span>
            </motion.div>

            <h2 className={`text-3xl lg:text-4xl font-black text-white mb-6 ${poppins.className}`}>
              Stay Ahead of the
              <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Competition
              </span>
            </h2>

            <p className={`text-xl text-white/70 mb-8 max-w-2xl mx-auto ${inter.className}`}>
              Get exclusive Reddit lead generation strategies, success stories, and insider tips delivered to your inbox every week.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className={inter.className}>Weekly case studies</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className={inter.className}>Exclusive strategies</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className={inter.className}>Early access to features</span>
              </div>
            </div>

            {!isSubscribed ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${inter.className}`}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className={inter.className}>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span className={inter.className}>Subscribe</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
                <p className={`text-white/60 text-sm mt-3 ${inter.className}`}>
                  Join 5,000+ founders and growth teams. Unsubscribe anytime.
                </p>
                
                {/* Error/Success Message */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg text-sm font-medium ${inter.className} ${
                      isSubscribed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 text-green-400"
              >
                <CheckCircle className="w-6 h-6" />
                <span className={`text-lg font-semibold ${inter.className}`}>
                  {message || 'Successfully subscribed! Check your email.'}
                </span>
              </motion.div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center w-12 h-12 bg-orange-400/20 rounded-lg mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${poppins.className}`}>
                  Growth Strategies
                </h3>
                <p className={`text-white/60 text-sm ${inter.className}`}>
                  Proven tactics from successful founders
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center w-12 h-12 bg-green-400/20 rounded-lg mb-4 mx-auto">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${poppins.className}`}>
                  Community Insights
                </h3>
                <p className={`text-white/60 text-sm ${inter.className}`}>
                  Real stories from our user community
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center w-12 h-12 bg-blue-400/20 rounded-lg mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className={`text-white font-semibold mb-2 ${poppins.className}`}>
                  Product Updates
                </h3>
                <p className={`text-white/60 text-sm ${inter.className}`}>
                  New features and improvements
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
