import { BrainCircuit, BotMessageSquare, Target } from "lucide-react";

const features = [
  {
    name: "AI Intent Analysis",
    description: "Our AI reads posts and tells you who is ready to buy versus who is just browsing.",
    icon: BrainCircuit,
  },
  {
    name: "Subreddit Intelligence",
    description: "Analyze any subreddit's culture and rules instantly so you never look like a spammer.",
    icon: Target,
  },
  {
    name: "AI-Powered Replies",
    description: "Generate context-aware replies that sound human and respect community guidelines.",
    icon: BotMessageSquare,
  },
];

export const Features = () => {
  return (
    <section className="py-20 sm:py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground">
            A Smarter Way to Market
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our entire platform is built to make you look good.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-card p-8 rounded-2xl border border-border shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <feature.icon className="h-10 w-10 text-primary" />
              <h3 className="mt-6 text-xl font-bold text-foreground">{feature.name}</h3>
              <p className="mt-2 text-base text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};