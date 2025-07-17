// frontend/app/connect-reddit/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RedditConnection } from '@/components/dashboard/RedditSettings';
import { CheckCircle, Loader } from 'lucide-react';
import { useUser } from '@clerk/nextjs'; // Import the useUser hook

export default function ConnectRedditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser(); // Get user object and loading state

  const isSuccess = searchParams.get('status') === 'success';

  useEffect(() => {
    // This effect runs when the user object changes or after the page loads.
    // If the user object is loaded AND has the connected flag, we can redirect.
    if (isLoaded && user?.publicMetadata?.hasConnectedReddit === true) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]); // Dependency array ensures this runs when user data updates

  // If we are in the success state from the redirect, show the loading spinner.
  // The useEffect above will handle the redirect once the session is synced.
  if (isSuccess && !user?.publicMetadata?.hasConnectedReddit) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[#1a1a1b] rounded-xl border border-[#343536] p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Success!</h1>
          <p className="text-gray-400 mb-6">
            Your Reddit account is connected. Syncing your session...
          </p>
          <Loader className="w-8 h-8 text-gray-500 mx-auto animate-spin" />
        </motion.div>
      </div>
    );
  }

  // The default state for users who land here initially
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
       <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
        >
            <div className="bg-[#1a1a1b] rounded-xl border border-[#343536] p-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Final Step!</h1>
                <p className="text-gray-400 mb-6">
                    Connect your Reddit account to start discovering leads. 
                    This allows RedLead to perform actions securely on your behalf.
                </p>
                
                <RedditConnection />
            </div>
       </motion.div>
    </div>
  );
}