"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { RedditConnection } from '@/components/dashboard/RedditSettings';
import { CheckCircle, Loader, SkipForward, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900']
});

// Separate component that uses useSearchParams
function ConnectRedditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [countdown, setCountdown] = useState(30);

  const isSuccessRedirect = searchParams.get('status') === 'success';

  // Force redirect to dashboard after 30 seconds no matter what
  useEffect(() => {
    const forceRedirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 30000); // 30 seconds

    return () => clearTimeout(forceRedirectTimer);
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/dashboard');
    }
  }, [countdown, router]);

  // Manual redirect to dashboard
  const handleDashboardRedirect = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

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
          className="w-full max-w-lg relative group"
        >
          {/* Glow effects */}
          <div className="absolute -inset-4 bg-gradient-radial from-green-500/20 via-green-400/10 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
          
          <div className="relative bg-[#1a1a1b] rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className={`text-3xl font-black text-white mb-2 ${poppins.className}`}>Success!</h1>
            <p className={`text-white/70 mb-6 ${inter.className}`}>
              Your Reddit account is connected. Syncing your session...
            </p>
            <Loader className="w-8 h-8 text-orange-400 mx-auto animate-spin mb-6" />
            
            {/* Countdown and manual redirect */}
            <div className="space-y-4">
              <div className={`flex items-center justify-center gap-3 text-orange-300 font-medium ${inter.className}`}>
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                <span>Redirecting to dashboard in {countdown} seconds...</span>
              </div>
              
              <button
                onClick={handleDashboardRedirect}
                className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] ${inter.className}`}
              >
                <span>Go to Dashboard Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
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
        className="w-full max-w-lg relative group"
      >
        {/* Glow effects */}
        <div className="absolute -inset-4 bg-gradient-radial from-orange-500/20 via-orange-400/10 to-transparent rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
        
        <div className="relative bg-[#1a1a1b] rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
          <h1 className={`text-3xl font-black text-white mb-2 ${poppins.className}`}>Final Step!</h1>
          <p className={`text-white/70 mb-6 ${inter.className}`}>
            Connect your Reddit account to start discovering leads.
          </p>
          
          <div className="mb-6">
            <RedditConnection />
          </div>
          
          {/* Countdown and action buttons */}
          <div className="space-y-4">
            <div className={`flex items-center justify-center gap-3 text-orange-300 font-medium ${inter.className}`}>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <span>Auto-redirect to dashboard in {countdown} seconds</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleDashboardRedirect}
                className={`group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02] ${inter.className}`}
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleDashboardRedirect}
                className={`group inline-flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200 ${inter.className}`}
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Connection</span>
              </button>
            </div>
            
            <p className={`text-white/50 text-sm ${inter.className}`}>
              You can connect your Reddit account later in settings
            </p>
          </div>
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
        className="w-full max-w-lg bg-[#1a1a1b] rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm"
      >
        <Loader className="w-8 h-8 text-orange-400 mx-auto animate-spin mb-4" />
        <h1 className={`text-2xl font-black text-white mb-2 ${poppins.className}`}>Loading...</h1>
        <p className={`text-white/70 ${inter.className}`}>
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
