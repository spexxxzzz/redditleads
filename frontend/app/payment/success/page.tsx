"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isSignedIn || !user) {
        router.push('/sign-in');
        return;
      }

      try {
        // Check if this is a mock payment
        const isMockPayment = searchParams.get('mock') === 'true';
        const planId = searchParams.get('plan');
        const reason = searchParams.get('reason');
        
        if (isMockPayment && planId) {
          // Handle mock payment success
          setSubscriptionStatus({
            plan: planId,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            reason: reason
          });
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
          return;
        }
        
        // Handle real payment verification
        const token = await getToken();
        const response = await api.getSubscriptionStatus(token);
        
        if (response.success) {
          setSubscriptionStatus(response.data);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [isSignedIn, user, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {subscriptionStatus?.reason === 'free_plan' ? 'Welcome to RedditLeads!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600">
            {subscriptionStatus?.reason === 'free_plan' 
              ? 'Your free account has been activated successfully.' 
              : 'Your subscription has been activated successfully.'
            }
          </p>
        </div>

        {subscriptionStatus?.plan && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Current Plan</h3>
            <p className="text-lg font-bold text-blue-600 capitalize">
              {typeof subscriptionStatus.plan === 'string' ? subscriptionStatus.plan : subscriptionStatus.plan.name}
            </p>
            {typeof subscriptionStatus.plan === 'object' && (
              <p className="text-sm text-gray-600">
                ${subscriptionStatus.plan.price}/{subscriptionStatus.plan.interval}
              </p>
            )}
            {searchParams.get('mock') === 'true' && (
              <p className="text-xs text-yellow-600 mt-2">
                {subscriptionStatus?.reason === 'free_plan' 
                  ? '🆓 Free Plan - No payment required'
                  : subscriptionStatus?.reason === 'development_mode'
                  ? '🎭 Development Mode - Mock payment for testing'
                  : subscriptionStatus?.reason === 'product_not_found'
                  ? '🎭 Test Mode - Product not found in DodoPayments'
                  : '🎭 Mock Payment - This is a test subscription'
                }
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/pricing"
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            View All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
