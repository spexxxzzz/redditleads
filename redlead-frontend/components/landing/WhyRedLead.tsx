import { Target, Zap, Sparkles } from "lucide-react";

const features = [
  {
    name: "True Purchase Intent",
    description: "Our AI goes beyond keywords. It understands context, nuance, and sarcasm to find users genuinely looking to buy, not just browsing.",
    icon: Target,
  },
  {
    name: "Real-Time Opportunity Engine",
    description: "The moment a high-intent conversation begins, you're notified. Be the first to engage with potential customers, not the last.",
    icon: Zap,
  },
  {
    name: "Discover Untapped Markets",
    description: "Uncover new customer segments and subreddits you never knew were discussing problems your product solves. Expand your reach effortlessly.",
    icon: Sparkles,
  },
];

export const WhyRedLead = () => {
  return (
    <section className="relative bg-gray-900 py-20 sm:py-24 border-y border-primary/20">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wider uppercase">
            The RedLead Difference
          </h2>
          <p className="mt-2 text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
            Why Settle for Noise? Get Pure Signal.
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">
            Stop chasing dead ends. Our AI is trained to distinguish between casual chatter and genuine buying signals, so you only spend time on leads that matter.
          </p>
        </div>

        <div className="relative mt-20">
          {/* The connecting line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div key={feature.name} className="relative flex items-start">
                <div className="flex-1 text-right pr-12">
                  {index % 2 === 0 && (
                    <div className="animate-slide-up">
                      <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                      <p className="mt-2 text-base text-gray-400">{feature.description}</p>
                    </div>
                  )}
                </div>
                
                {/* The glowing number and icon */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border-2 border-primary/50 shadow-[0_0_20px_rgba(255,69,0,0.4)]">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>

                <div className="flex-1 pl-12">
                  {index % 2 !== 0 && (
                    <div className="animate-slide-up">
                      <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                      <p className="mt-2 text-base text-gray-400">{feature.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};