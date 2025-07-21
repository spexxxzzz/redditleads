"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RedditConnection } from '@/components/dashboard/RedditSettings';
import { CheckCircle, Loader } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

// Separate component that uses useSearchParams
function ConnectRedditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const isSuccessRedirect = searchParams.get('status') === 'success';

  // This effect will run when the component mounts or when the `user` object updates.
  useEffect(() => {
    // If the user object is loaded and already has the flag, redirect immediately.
    if (isLoaded && user?.publicMetadata?.hasConnectedReddit === true) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  // This effect runs ONLY when the page is loaded with a `status=success` param.
  useEffect(() => {
    const handleSuccessRedirect = async () => {
      if (isSuccessRedirect && user) {
        // This is the key change. We manually tell Clerk to fetch the latest user data.
        // This will update the `user` object from the hook and trigger the effect above.
        await user.reload();
      }
    };

    handleSuccessRedirect();
  }, [isSuccessRedirect, user]); // Only run this when the success param or user object is available.

  // If this is a success redirect, show the loading/syncing state
  // while the reload and subsequent redirect happen.
  if (isSuccessRedirect) {
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

  // The default view for users who need to connect
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
          </p>
          <RedditConnection />
          <p className="text-gray-500 mt-6">
            Already connected? <a href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Loading fallback component
function ConnectRedditLoading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#1a1a1b] rounded-xl border border-[#343536] p-8 text-center"
      >
        <Loader className="w-8 h-8 text-gray-500 mx-auto animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
        <p className="text-gray-400">
          Preparing your Reddit connection...
        </p>
      </motion.div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ConnectRedditPage() {
  return (
    <Suspense fallback={<ConnectRedditLoading />}>
      <ConnectRedditContent />
    </Suspense>
  );
}
