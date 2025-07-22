/* components/FeaturesSection.tsx */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Poppins, Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export function FeaturesStart() {
  return (
    <section id="features" className="relative py-32 px-8 bg-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-orange-400/8 rounded-full blur-3xl" />
      
      <div className="relative max-w-8xl mx-auto">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className={`inline-block text-sm font-semibold tracking-wide uppercase text-orange-400 mb-4 ${inter.className}`}>
            Powerful Features
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
            Turn Reddit into your <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              lead generation machine
            </span>
          </h2>
        </motion.header>

        {/* Main Hero Feature */}
        <section className="relative flex flex-col items-center gap-16 py-32 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Stop scrolling. Start <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">selling.</span>
            </h3>

            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              While you waste hours manually searching Reddit for prospects, RedLead works 24/7 to discover and organize high-intent leads who are actively asking for solutions like yours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              {/* Enhanced glow effects without border */}
              <div className="absolute -inset-16 bg-gradient-radial from-orange-500/50 via-orange-400/25 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-100 animate-pulse transition-opacity duration-1000" />
              <div className="absolute -inset-12 bg-gradient-radial from-orange-500/40 via-orange-400/20 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-8 bg-gradient-radial from-orange-400/30 via-orange-300/15 to-transparent rounded-3xl blur-xl group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle shadow effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] backdrop-blur-sm group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <Image
                  src="/LeadDisplay.png"
                  alt="RedLead Dashboard - Automated Reddit lead discovery and management"
                  width={2000}
                  height={1250}
                  quality={100}
                  priority
                  className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.25)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI-Generated Replies */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Every reply feels <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">authentically human</span>
            </h3>

            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              Smart AI that understands context and community vibes to craft replies that actually help people—not spammy sales pitches that get you banned from every subreddit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              {/* Enhanced glow effects without border */}
              <div className="absolute -inset-16 bg-gradient-radial from-orange-500/45 via-orange-400/22 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-95 animate-pulse transition-opacity duration-1000" />
              <div className="absolute -inset-12 bg-gradient-radial from-orange-500/35 via-orange-400/18 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-8 bg-gradient-radial from-orange-400/25 via-orange-300/12 to-transparent rounded-3xl blur-xl group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle shadow effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <Image
                  src="/AIreply1.png"
                  alt="AI-powered reply generation interface showing contextual responses"
                  width={2000}
                  height={1250}
                  quality={100}
                  className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.25)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* AI Summaries */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Skip the noise. Get the <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">insights.</span>
            </h3>

            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              No more scrolling through endless comment threads. Get instant summaries that highlight the pain points, buying signals, and opportunities you actually care about.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              {/* Enhanced glow effects without border */}
              <div className="absolute -inset-16 bg-gradient-radial from-orange-500/45 via-orange-400/22 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-95 animate-pulse transition-opacity duration-1000" />
              <div className="absolute -inset-12 bg-gradient-radial from-orange-500/35 via-orange-400/18 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-8 bg-gradient-radial from-orange-400/25 via-orange-300/12 to-transparent rounded-3xl blur-xl group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle shadow effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <Image
                  src="/AISummary.png"
                  alt="AI thread summarization showing key insights and sentiment analysis"
                  width={2000}
                  height={1250}
                  quality={100}
                  className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.25)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Simple Integrations */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Connect to your favorite <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">tools</span>
            </h3>

            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              Export leads to your CRM, get Slack notifications, or webhook to any service you use. Simple integrations that actually work—no enterprise sales calls required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              {/* Enhanced glow effects without border */}
              <div className="absolute -inset-16 bg-gradient-radial from-orange-500/45 via-orange-400/22 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-95 animate-pulse transition-opacity duration-1000" />
              <div className="absolute -inset-12 bg-gradient-radial from-orange-500/35 via-orange-400/18 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-8 bg-gradient-radial from-orange-400/25 via-orange-300/12 to-transparent rounded-3xl blur-xl group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle shadow effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <Image
                  src="/Dashboard.png"
                  alt="Integration options for CRM, Slack, and webhook connections"
                  width={2000}
                  height={1250}
                  quality={100}
                  className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.25)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Lead Analytics */}
        <section className="relative flex flex-col items-center gap-16 py-24 px-8 max-w-8xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            viewport={{ once: true }}
            className="w-full max-w-4xl text-center space-y-8"
          >
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tighter leading-[0.9] text-white ${poppins.className}`}>
              Track what actually <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">converts</span>
            </h3>

            <p className={`text-base font-medium text-white/80 leading-relaxed max-w-3xl mx-auto ${inter.className}`}>
              See which subreddits and keywords bring you the best leads. Simple analytics that help you double down on what's working and ditch what isn't.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .2 }}
            viewport={{ once: true }}
            className="w-full max-w-6xl"
          >
            <div className="relative group">
              {/* Enhanced glow effects without border */}
              <div className="absolute -inset-16 bg-gradient-radial from-orange-500/45 via-orange-400/22 to-transparent rounded-full blur-3xl opacity-70 group-hover:opacity-95 animate-pulse transition-opacity duration-1000" />
              <div className="absolute -inset-12 bg-gradient-radial from-orange-500/35 via-orange-400/18 to-transparent rounded-full blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-8 bg-gradient-radial from-orange-400/25 via-orange-300/12 to-transparent rounded-3xl blur-xl group-hover:scale-105 transition-transform duration-500" />
              
              {/* Subtle shadow effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-[0_35px_100px_rgba(251,146,60,0.15)] group-hover:shadow-[0_50px_150px_rgba(251,146,60,0.25)] transition-all duration-700">
                <Image
                  src="/ReplyTracker.png"
                  alt="Simple analytics dashboard showing lead sources and conversion data"
                  width={2000}
                  height={1250}
                  quality={100}
                  className="relative z-10 w-full h-auto transform group-hover:scale-[1.01] transition-transform duration-700"
                  style={{
                    imageRendering: 'crisp-edges',
                    backfaceVisibility: 'hidden',
                    filter: 'contrast(1.2) brightness(1.1) saturate(1.25)',
                    WebkitBackfaceVisibility: 'hidden',
                    WebkitTransform: 'translate3d(0, 0, 0)',
                    transform: 'translate3d(0, 0, 0)'
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </section>
  );
}