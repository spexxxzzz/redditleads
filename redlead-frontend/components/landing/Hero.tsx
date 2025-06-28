import Link from "next/link";
import { FaReddit } from "react-icons/fa";
import { ArrowRight, Target, Play, Clock, Ban, DollarSign, Bell } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Hero = () => {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-orange-50/30 to-background"></div>
      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full animate-bounce delay-75"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-primary/30 rounded-full animate-bounce delay-150"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-primary/25 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-primary/20 rounded-full animate-bounce delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reddit-themed Glowing Container */}
        <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl border border-primary/30 shadow-[0_0_40px_rgba(255,69,0,0.15)] hover:shadow-[0_0_60px_rgba(255,69,0,0.25)] transition-all duration-500 p-8 sm:p-12 lg:p-16">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              {/* Target Audience Badge - "Indie Hacker" removed */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-primary/30 shadow-sm mb-6 animate-fade-in">
                <Target className="w-4 h-4 text-primary" />
                <span className={`text-lg font-semibold text-slate-700 ${poppins.className}`}>AI Powered Lead Generation</span>

              </div>

              {/* Main Headline - Size Reduced */}
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-6xl font-black tracking-tighter mb-8 leading-[0.9] ${poppins.className}`}>
  <span className="text-foreground">Turn </span>
  <FaReddit className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-12 xl:h-12 inline align-middle mx-1" style={{color: '#ff4500'}} />
  <span className="bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">Reddit</span>
  <br />
  <span className="text-foreground">Into Your </span>
  <span className="bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
    Lead Machine
  </span>
</h1>





              {/* Subheading - Condensed */}
              <p className={`text-lg md:text-3xl lg:text-xl text-slate-600 max-w-xl mb-8 leading-relaxed font-medium ${inter.className}`}>
                AI-powered Reddit monitoring to find warm leads who need your product, without the manual search.
              </p>

              {/* Pain Points Grid - Text shortened */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-slide-up delay-300">
                <div className="flex items-center gap-3 p-3 bg-red-50/80 rounded-xl border border-red-200/50">
                  <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className={`text-sm font-semibold text-slate-700 ${poppins.className}`}>Stop manual searching</span>

                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50/80 rounded-xl border border-orange-200/50">
                  <Bell className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className={`text-sm font-semibold text-slate-700 ${poppins.className}`}>Never miss a lead</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50/80 rounded-xl border border-red-200/50">
                  <Ban className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className={`text-sm font-semibold text-slate-700 ${poppins.className}`}>Avoid spam bans</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50/80 rounded-xl border border-green-200/50">
                  <DollarSign className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className={`text-sm font-semibold text-slate-700 ${poppins.className}`}>Affordable for founders</span>
                </div>
              </div>
              
              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up delay-500">
                <Link
                  href="/signup"
                  className="group bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl  text-xl font-bold ${poppins.className} transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,69,0,0.3)] flex items-center gap-3 justify-center sm:justify-center"
                >
                  Find My First Lead
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group text-foreground hover:text-primary font-bold py-4 px-8 rounded-xl  text-xl font-bold ${poppins.className}  transition-all duration-300 border-2 border-border hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 justify-center sm:justify-center">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Line - Condensed and "Indie Hacker" removed */}
              <div className="animate-slide-up delay-700">
                <p className="text-sm text-muted-foreground">
                  Join 500+ founders • No credit card required
                </p>
              </div>
            </div>

            {/* Right Side - Demo Preview (Unchanged) */}
            <div className="relative animate-slide-up delay-300 hidden lg:block">
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="flex-1 bg-white/10 rounded px-3 py-1 text-xs ml-2">
                      redlead.ai/dashboard
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reddit Lead Monitor</span>
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">3 New Leads</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/20 rounded-lg p-3 border-l-4 border-green-400">
                        <div className="text-sm mb-1">"Looking for a SaaS tool to automate my workflow..."</div>
                        <div className="text-xs text-green-300 flex items-center gap-2">
                          <span>r/entrepreneur</span>
                          <span>•</span>
                          <span className="bg-green-500/20 px-2 py-0.5 rounded">High Intent: 95%</span>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3 border-l-4 border-orange-400">
                        <div className="text-sm mb-1">"Need help with lead generation for my startup..."</div>
                        <div className="text-xs text-orange-300 flex items-center gap-2">
                          <span>r/startups</span>
                          <span>•</span>
                          <span className="bg-orange-500/20 px-2 py-0.5 rounded">Pain Point Detected</span>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3 border-l-4 border-blue-400">
                        <div className="text-sm mb-1">"Frustrated with current marketing tools, any alternatives?"</div>
                        <div className="text-xs text-blue-300 flex items-center gap-2">
                          <span>r/marketing</span>
                          <span>•</span>
                          <span className="bg-blue-500/20 px-2 py-0.5 rounded">Competitor Mention</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <button className="bg-primary hover:bg-primary-hover text-white rounded-full p-6 shadow-xl hover:scale-110 transition-all duration-300">
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 text-foreground text-sm px-3 py-1 rounded-full font-medium">
                  Live Demo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
