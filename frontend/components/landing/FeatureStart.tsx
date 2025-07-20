/* components/FeaturesSection.tsx */
"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Poppins, Inter } from "next/font/google";
import { Play } from "lucide-react";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

export  function FeaturesStart() {
  return (
    <section id="features" className="relative py-24 px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className={`inline-block text-sm font-semibold tracking-wide uppercase text-orange-400 mb-4 ${inter.className}`}>
            Features
          </span>
          <h2 className={`text-5xl md:text-6xl font-bold text-white tracking-tight ${poppins.className}`}>
            Generate leads like a boss
          </h2>
        </motion.header>

        {/* Main River Breakout Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-32 bg-gradient-to-br from-orange-900/10 via-gray-900/50 to-black rounded-3xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Large Media Section */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Orange glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-transparent to-orange-600/10 blur-2xl" />
              
              {/* Demo Image Container */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <Image
                  src="/Dashboard.png"
                  alt="RedLead Dashboard Demo showing automated lead discovery"
                  width={1248}
                  height={647}
                  className="relative z-10 w-full h-auto rounded-xl"
                  priority
                />
                
                {/* Play Button Overlay */}
                <button className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group z-20">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/90 hover:bg-white rounded-full transition-colors">
                    <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                  </div>
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
              <div className="space-y-6">
                <p className={`text-lg md:text-xl text-white/80 leading-relaxed ${inter.className}`}>
                  <em className="text-white">Your manual prospecting days are over.</em> Set your keywords and target subreddits, then let RedLead automatically discover, analyze, and organize warm leads from Reddit conversations in the background.
                </p>
                
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors text-lg"
                >
                  Watch RedLead in action
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06z"
                      fill="currentColor"
                    />
                    <path
                      d="M1.75 8h7.69"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="origin-left group-hover:scale-x-110 transition-transform"
                    />
                  </svg>
                </Link>
              </div>

              {/* Timeline Features */}
              <ul className="space-y-6 border-l-2 border-orange-500/30 pl-6">
                <li className={`text-white/70 leading-relaxed ${inter.className}`}>
                  <em className="text-white">Discovers your prospects.</em> When you set keywords and subreddits, RedLead scans Reddit conversations, identifies solution-seeking posts, and delivers ready-to-engage leads.
                </li>
                <li className={`text-white/70 leading-relaxed ${inter.className}`}>
                  <em className="text-white">Analyzes like an expert.</em> RedLead uses AI to score each lead for opportunity potential, intent analysis, and engagement timing—working like an experienced sales researcher from day one.
                </li>
                <li className={`text-white/70 leading-relaxed ${inter.className}`}>
                  <em className="text-white">Human and AI in the loop.</em> Review AI-generated summaries, reply directly from the dashboard, or mark leads as saved for later follow-up.
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 50-50 River Sections */}
        <div className="space-y-24">
          
          {/* AI Analysis Feature */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-6">
              <h3 className={`text-3xl md:text-4xl font-bold text-white tracking-tight ${poppins.className}`}>
                Because AI analysis beats manual scanning
              </h3>
              <p className={`text-lg text-white/70 leading-relaxed ${inter.className}`}>
                Smart analysis helps identify high-potential leads by analyzing post sentiment, engagement levels, solution-seeking intent, and timing across multiple Reddit conversations.
              </p>
              <Link
                href="/features/ai-analysis"
                className="group inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Learn about AI analysis
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.75 8h7.69"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="origin-left group-hover:scale-x-110 transition-transform"
                  />
                </svg>
              </Link>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-orange-600/10 blur-xl" />
              <Image
                src="/Dashboard.png"
                alt="AI analysis feature showing lead scoring and intent detection"
                width={708}
                height={472}
                className="relative z-10 w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          </motion.section>

          {/* Speed vs Depth Feature */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-orange-600/10 blur-xl" />
              <Image
                src="/Dashboard.png"
                alt="Campaign settings showing keyword and subreddit targeting options"
                width={708}
                height={472}
                className="relative z-10 w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
            
            <div className="space-y-6 lg:order-2">
              <h3 className={`text-3xl md:text-4xl font-bold text-white tracking-tight ${poppins.className}`}>
                Get volume when you need it. Precision when you don't.
              </h3>
              <p className={`text-lg text-white/70 leading-relaxed ${inter.className}`}>
                Switch between broad keyword discovery and precise subreddit targeting. Cast a wide net for maximum lead volume or focus on specific communities where your ideal customers gather.
              </p>
            </div>
          </motion.section>

          {/* Pipeline Management Feature */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-6">
              <h3 className={`text-3xl md:text-4xl font-bold text-white tracking-tight ${poppins.className}`}>
                Set one campaign. RedLead handles the pipeline.
              </h3>
              <p className={`text-lg text-white/70 leading-relaxed ${inter.className}`}>
                Pipeline management tracks every lead from discovery to conversion. Reply, save, ignore, or request AI summaries—keeping your entire lead workflow organized and actionable.
              </p>
              <Link
                href="/features/pipeline"
                className="group inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Explore pipeline features
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.75 8h7.69"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="origin-left group-hover:scale-x-110 transition-transform"
                  />
                </svg>
              </Link>
            </div>
            
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-orange-600/10 blur-xl" />
              <Image
                src="/Dashboard.png"
                alt="Lead pipeline management interface showing status filters and action buttons"
                width={708}
                height={472}
                className="relative z-10 w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
          </motion.section>

          {/* Security & Privacy Feature */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-orange-600/10 blur-xl" />
              <Image
                src="/Dashboard.png"
                alt="User dashboard showing secure, private lead data and analytics"
                width={708}
                height={472}
                className="relative z-10 w-full h-auto rounded-2xl"
                loading="lazy"
              />
            </div>
            
            <div className="space-y-6 lg:order-2">
              <h3 className={`text-3xl md:text-4xl font-bold text-white tracking-tight ${poppins.className}`}>
                Your lead data's guardian
              </h3>
              <p className={`text-lg text-white/70 leading-relaxed ${inter.className}`}>
                Secure authentication protects your campaigns and lead data. Each user's leads are completely isolated and private—ensuring your competitive advantages stay yours alone.
              </p>
              <Link
                href="/security"
                className="group inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                Learn about security
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06z"
                    fill="currentColor"
                  />
                  <path
                    d="M1.75 8h7.69"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="origin-left group-hover:scale-x-110 transition-transform"
                  />
                </svg>
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </section>
  );
}
