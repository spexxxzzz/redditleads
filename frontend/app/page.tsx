import { DashboardLayout } from "@/components/dashboard/DashBoardLayout";
import  Features  from "@/components/landing/Feature";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { DashboardPreview } from "@/components/landing/ProductShowcase";
import { HowToDo } from "@/components/landing/HowToDo";
import { WhyReddit } from "@/components/landing/WhyReddit";
import { WhyUs } from "@/components/landing/WhyUs";
import { AdvantageComponent } from "@/components/landing/RedReach";
import PricingComponent from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { Vort } from "@/components/landing/Vort";

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
         
          <PricingComponent/>
         
          <div>
       
          </div>
          
         
          <Footer />
        
         
       </div>
      
     </>
  );
}