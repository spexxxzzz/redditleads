"use client";
import React from 'react';
import { Bell, Search, PlusCircle, Menu } from 'lucide-react';

export const DashboardHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-[#1a1a1b] border-b border-[#343536]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo and App Name */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#ff4500] rounded-full flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span className="text-lg font-bold text-white">RedLead</span>
            <span className="text-xs text-gray-500 bg-[#ff4500] px-2 py-1 rounded-full">BETA</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block w-full max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads, subreddits, keywords..."
                className="w-full h-9 pl-10 pr-4 bg-[#272729] text-white placeholder-gray-400 rounded-lg border border-[#343536] focus:ring-1 focus:ring-[#ff4500] focus:border-[#ff4500] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Actions and User */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[#272729] text-gray-400 hover:text-white transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[#272729] text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff4500] rounded-full text-xs"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-[#ff4500] to-[#ff6b35] rounded-full flex items-center justify-center text-white text-sm font-bold">
              T
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};