 import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Hero2 } from "@/components/landing/Hero2";
import { HowItWorks } from "@/components/landing/HowItworks";
import { UseCases } from "@/components/landing/UseCase";
import { WhyRedLead } from "@/components/landing/WhyRedLead";
 

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <div className="space-y-0">
      
        <HowItWorks/>
        <UseCases/>
        <Hero2/>
      
      </div>
    </div>
  );
}
