"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} text-orange-500`} />
      </motion.div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
};

export const LoadingCard: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <LoadingState message={message} />
    </div>
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <LoadingState message={message} size="lg" />
      </div>
    </div>
  );
};
