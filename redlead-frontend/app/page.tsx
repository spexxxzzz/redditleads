 import { Features } from "@/components/landing/Features";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Hero2 } from "@/components/landing/Hero2";
import { HowItWorks } from "@/components/landing/HowItworks";
import { UseCases } from "@/components/landing/UseCase";
 import { WhyReddit } from "@/components/landing/WhyReddit";
 

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <div className="space-y-0">
        <Features/>
        <HowItWorks/>
        <WhyReddit/>
        <UseCases/>
        <Hero2/>
      
      </div>
    </div>
  );
}
