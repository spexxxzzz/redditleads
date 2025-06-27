 import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { UseCases } from "@/components/landing/UseCase";
import { WhyRedLead } from "@/components/landing/WhyRedLead";
 

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <UseCases/>
     
    
    
    </div>
  );
}