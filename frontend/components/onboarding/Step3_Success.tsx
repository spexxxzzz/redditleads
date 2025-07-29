// frontend/components/onboarding/Step3_Success.tsx
"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inter, Poppins } from 'next/font/google';
import { LoaderFive } from "@/components/ui/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '600', '700', '800', '900'] 
});

export const Step3_Success: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/connect-reddit';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-lg mx-auto relative"
    >
      {/* Success Message Card */}
      <Card className="bg-black border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <CardContent className="p-8">
          
          {/* Success Badge */}
          <div className="mb-6">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
              Setup Complete
            </Badge>
          </div>

          <h1 className={`text-2xl font-bold text-white mb-4 ${poppins.className}`}>
            Campaign Successfully Created
          </h1>
          
          <p className={`text-base text-gray-400 mb-8 leading-relaxed ${inter.className}`}>
            Your Reddit lead generation campaign is now active and monitoring conversations.
          </p>

          {/* Clean Redirect Info - No Card Wrapper */}
          <div className="mb-8">
            <LoaderFive text="Redirecting to connect Reddit" />
            <p className={`text-orange-400 text-sm mt-3 ${inter.className}`}>
              Redirecting automatically in a few seconds
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary: Connect Reddit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => window.location.href = '/connect-reddit'}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] transform-gpu active:scale-[0.98]"
              >
                Connect Reddit Account
              </Button>
            </motion.div>

            {/* Secondary: Skip to Dashboard Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="w-full px-6 py-3 text-gray-400 hover:text-white border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 font-medium"
              >
                Skip to Dashboard
              </Button>
            </motion.div>
          </div>

          {/* Helper text */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xs text-gray-500 mt-4 ${inter.className}`}
          >
            You can connect your Reddit account later in settings
          </motion.p>

        </CardContent>
      </Card>
    </motion.div>
  );
};
