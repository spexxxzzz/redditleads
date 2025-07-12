"use client";
import React from "react";
import { LeadCard } from "./LeadCard";
import { RefreshCw, Search, Sparkles } from "lucide-react";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface Lead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  numComments: number;
  upvoteRatio: number;
  intent: string;
  summary?: string | null;
  opportunityScore: number;
  status?: "new" | "replied" | "saved" | "ignored";
}

interface Props {
  leads: Lead[];
  onLeadUpdate: (leadId: string, status: Lead["status"]) => void;
  onManualDiscovery: () => void;
  isRunningDiscovery: boolean;
}

export const LeadFeed = ({
  leads,
  onLeadUpdate,
  onManualDiscovery,
  isRunningDiscovery,
}: Props) => {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="text-center max-w-md">
          <h3 className={`text-xl font-bold text-white mb-3 ${poppins.className}`}>
            No leads discovered yet
          </h3>
          <p className={`text-gray-400 mb-6 leading-relaxed ${inter.className}`}>
            Start your lead discovery journey to find new opportunities and connect with potential customers.
          </p>
          
          <button
            onClick={onManualDiscovery}
            disabled={isRunningDiscovery}
            className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 ${isRunningDiscovery ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-300`} />
            <span>
              {isRunningDiscovery ? "Discovering Leads..." : "Start Discovery"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {leads.map((lead, index) => (
        <div
          key={lead.id}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
          className="animate-in fade-in slide-in-from-bottom-4"
        >
          <LeadCard lead={lead} onUpdate={onLeadUpdate} />
        </div>
      ))}
    </div>
  );
};
