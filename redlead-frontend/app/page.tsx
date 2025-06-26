import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { WhyRedLead } from "@/components/landing/WhyRedLead";
import { Features } from "@/components/landing/Features";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <WhyRedLead />
      <Features />
    </div>
  );
}