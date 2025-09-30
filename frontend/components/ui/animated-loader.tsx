import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AnimatedLoaderProps {
  title: string;
  description: string;
  websiteUrl: string;
  className?: string;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  title,
  description,
  websiteUrl,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Outer rotating circle */}
      <div className="relative mx-auto mb-6 w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-orange-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          className="absolute inset-2 border-2 border-orange-500/40 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Center icon with bounce animation */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-full w-12 h-12 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Animated text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-semibold text-white mb-3">
          {title}
        </h3>
        <p className="text-zinc-400 mb-2">
          {description}
        </p>
        <motion.p
          className="text-orange-400 font-medium"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Analyzing: {websiteUrl}
        </motion.p>
      </motion.div>

      {/* Progress dots */}
      <motion.div
        className="flex justify-center space-x-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-orange-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
