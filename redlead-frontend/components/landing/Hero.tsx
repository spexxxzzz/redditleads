import Link from "next/link";
import { FaReddit } from "react-icons/fa";
import { ArrowRight, Zap, Target, TrendingUp, Play, Search, Bell, Users, BarChart3 } from "lucide-react";

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
              {/* Simple Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-primary/30 shadow-sm mb-8 animate-fade-in">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">AI-Powered Lead Generation</span>
              </div>

              {/* Clean Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-slide-up leading-tight">
                <span className="text-foreground">Turn </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary rounded-xl text-white shadow-xl align-middle">
                  <FaReddit className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-black">Reddit</span>
                </span>
                <br />
                <span className="text-foreground">Into </span>
                <span className="bg-gradient-to-r from-primary to-red-500 bg-clip-text text-transparent">
                  Revenue
                </span>
              </h1>

              {/* Simple Subtitle */}
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mb-8 leading-relaxed animate-slide-up delay-150">
                Stop scrolling endlessly. Our AI finds customers who are{" "}
                <span className="text-primary font-semibold">actively buying</span> on Reddit.
              </p>

              {/* Clean One-Line Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-slide-up delay-300">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-primary/10">
                  <Search className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">AI finds ready-to-buy customers on Reddit</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-primary/10">
                  <Bell className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">Get instant alerts for high-intent mentions</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-primary/10">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">Monitor competitors and industry trends</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">Track engagement and conversion metrics</span>
                </div>
              </div>

              {/* Side by Side Rectangular Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up delay-500">
                <Link
                  href="/signup"
                  className="group bg-primary hover:bg-primary-hover text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,69,0,0.3)] flex items-center gap-3 justify-center sm:justify-center min-w-[220px]"
                >
                  Get Early Access
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group text-foreground hover:text-primary font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 border-2 border-border hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 justify-center sm:justify-center min-w-[220px]">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              {/* Simple Trust Line */}
              <div className="animate-slide-up delay-700">
                <p className="text-sm text-muted-foreground">
                  Join the waitlist to be first when we launch
                </p>
              </div>
            </div>

            {/* Right Side - Clean Demo Preview */}
            <div className="relative animate-slide-up delay-300 hidden lg:block">
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                {/* Clean Dashboard Preview */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="flex-1 bg-white/10 rounded px-3 py-1 text-xs ml-2">
                      redlead.ai/dashboard
                    </div>
                  </div>
                  
                  {/* Simple Dashboard Preview */}
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Reddit Lead Monitor</span>
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Beta</span>
                    </div>
                    
                    {/* Clean Lead Examples */}
                    <div className="space-y-3">
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm mb-1">"Looking for a marketing automation tool..."</div>
                        <div className="text-xs text-gray-300">r/entrepreneur • High intent detected</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm mb-1">"Need help with lead generation for SaaS..."</div>
                        <div className="text-xs text-gray-300">r/startups • Potential customer</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-sm mb-1">"What's the best Reddit marketing strategy?"</div>
                        <div className="text-xs text-gray-300">r/marketing • Opportunity</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Clean Play Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <button className="bg-primary hover:bg-primary-hover text-white rounded-full p-6 shadow-xl hover:scale-110 transition-all duration-300">
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                </div>
                
                {/* Simple Demo Label */}
                <div className="absolute top-4 right-4 bg-white/90 text-foreground text-sm px-3 py-1 rounded-full font-medium">
                  Product Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};