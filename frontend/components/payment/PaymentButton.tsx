"use client";
import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface PaymentButtonProps {
  planId: string;
  planName: string;
  price: number;
  isYearly: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  planId,
  planName,
  price,
  isYearly,
  className = '',
  onSuccess,
  onError
}) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePayment = async () => {
    console.log('🔍 [PaymentButton] Button clicked:', { planId, planName, price, isSignedIn, user: !!user });
    console.log('🔍 [PaymentButton] Button element:', document.querySelector(`[data-plan-id="${planId}"]`));
    
    if (!isSignedIn || !user) {
      // Redirect to sign in page
      window.location.href = '/sign-in';
      return;
    }

    if (price === 0) {
      // Handle free plan
      try {
        setIsLoading(true);
        console.log('Creating free subscription for plan:', planId);
        const response = await api.createSubscription(
          planId,
          user.emailAddresses[0].emailAddress,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          null, // No token needed for free plan
          user.id
        );
        
        console.log('Free subscription response:', response);
        if (response.success && response.data?.checkoutUrl) {
          // Redirect to success page
          window.location.href = response.data.checkoutUrl;
        } else {
          throw new Error(response.error || 'Failed to create subscription');
        }
      } catch (error: any) {
        console.error('Payment error:', error);
        setStatus('error');
        onError?.(error.message || 'Failed to create subscription');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle paid plans
    try {
      setIsLoading(true);
      console.log('Creating paid subscription for plan:', planId);
      const token = await getToken();
      
      const response = await api.createSubscription(
        planId,
        user.emailAddresses[0].emailAddress,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        token,
        user.id
      );

      console.log('Paid subscription response:', response);
      if (response.success && response.data?.checkoutUrl) {
        // Redirect to Dodo Payments checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error(response.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setStatus('error');
      onError?.(error.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (status === 'success') return 'Success! Redirecting...';
    if (status === 'error') return 'Try Again';
    if (isLoading) return 'Processing...';
    if (!isSignedIn || !user) {
      if (price === 0) return 'Get Started Free';
      return `Subscribe for $${price}/${isYearly ? 'year' : 'month'}`;
    }
    if (price === 0) return 'Get Started Free';
    return `Subscribe for $${price}/${isYearly ? 'year' : 'month'}`;
  };

  const getButtonIcon = () => {
    if (status === 'success') return <CheckCircle className="w-4 h-4" />;
    if (status === 'error') return <XCircle className="w-4 h-4" />;
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <CreditCard className="w-4 h-4" />;
  };

  return (
    <button
      data-plan-id={planId}
      onClick={(e) => {
        console.log('🔍 [PaymentButton] Click event fired for plan:', planName);
        e.preventDefault();
        e.stopPropagation();
        handlePayment();
      }}
      disabled={isLoading || status === 'success'}
      className={`
        w-full flex items-center justify-center gap-2 px-6 py-3 
        font-semibold rounded-lg transition-all duration-200
        ${status === 'success' 
          ? 'bg-green-600 text-white cursor-not-allowed' 
          : status === 'error'
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : (!isSignedIn || !user)
          ? 'bg-orange-600 hover:bg-orange-700 text-white'
          : price === 0
          ? 'bg-gray-600 hover:bg-gray-700 text-white'
          : planName === 'Ultimate'
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/25'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
        }
        ${isLoading ? 'cursor-not-allowed opacity-75' : 'hover:scale-105 cursor-pointer'}
        ${className}
        relative z-50
      `}
    >
      {getButtonIcon()}
      {getButtonText()}
    </button>
  );
};
