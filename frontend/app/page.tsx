import { DashboardLayout } from "@/components/dashboard/DashBoardLayout";
import  Features  from "@/components/landing/Feature";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { DashboardPreview } from "@/components/landing/ProductShowcase";
import { HowToDo } from "@/components/landing/HowToDo";
import { WhyReddit } from "@/components/landing/WhyReddit";
import { WhyUs } from "@/components/landing/WhyUs";

export default function Home() {
  return (
     <>
       <div className="relative">
         <Header />
         <Hero />
         <div className="relative -mt-16 z-30">
           <DashboardPreview />
         </div>
          <Features/>
          <WhyReddit />
          <WhyUs />
          <HowToDo/>
        
         
       </div>
     </>
  );
}