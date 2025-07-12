import { DashboardLayout } from "@/components/dashboard/DashBoardLayout";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { DashboardPreview } from "@/components/landing/ProductShowcase";

export default function Home() {
  return (
     <>
       <div className="relative">
         <Header />
         <Hero />
         {/* DashboardPreview will overlap with Hero */}
         <div className="relative -mt-16 z-30">
           <DashboardPreview />
         </div>
       </div>
     </>
  );
}