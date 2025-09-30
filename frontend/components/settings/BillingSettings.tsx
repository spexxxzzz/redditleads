"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser, useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface BillingData {
  plan: string;
  planName: string;
  subscription: {
    status: string;
    currentPeriodEnd?: string;
  };
  usage: {
    leads: { used: number; limit: number | string };
    projects: { used: number; limit: number | string };
    aiSummaries: { used: number; limit: number | string };
    aiReplies: { used: number; limit: number | string };
  };
}

export function BillingSettings() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = async () => {
    if (!user || !isLoaded) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const [usageResponse, subscriptionData] = await Promise.all([
        api.getUsage(token),
        api.getSubscriptionStatus(token).catch(() => null) // Handle if subscription endpoint doesn't exist
      ]);

      // Extract the actual usage data from the response
      const usageData = usageResponse.data || usageResponse;

      setBillingData({
        plan: usageData.plan,
        planName: usageData.planName,
        subscription: subscriptionData || { status: 'active' },
        usage: {
          leads: { used: usageData.leads.current, limit: usageData.leads.limit },
          projects: { used: usageData.projects.current, limit: usageData.projects.limit },
          aiSummaries: { used: usageData.aiSummaries.current, limit: usageData.aiSummaries.limit },
          aiReplies: { used: usageData.aiReplies.current, limit: usageData.aiReplies.limit }
        }
      });
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError('Failed to load billing information');
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [user, isLoaded]);

  const handleManageSubscription = () => {
    // Redirect to pricing page
    window.location.href = '/dashboard/pricing';
  };

  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Manage your subscription and payment details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="ml-2 text-white/70">Loading billing information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Manage your subscription and payment details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchBillingData} variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          Billing
        </CardTitle>
        <CardDescription>
          Manage your subscription and payment details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="flex justify-between items-center p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
          <div>
            <h4 className="font-semibold text-white">Your Plan</h4>
            <p className="text-2xl font-bold text-orange-500 capitalize">
              {billingData?.planName || 'Free'}
            </p>
            <p className="text-sm text-white/60 mt-1">
              Status: <span className="text-green-400 capitalize">
                {billingData?.subscription.status || 'Active'}
              </span>
            </p>
          </div>
          <Button 
            onClick={handleManageSubscription}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Manage Subscription
          </Button>
        </div>

        {/* Usage Overview */}
        <div className="space-y-4">
          <h4 className="font-semibold text-white">Usage This Month</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Leads</span>
                <span className="text-orange-500 font-semibold">
                  {billingData?.usage.leads.used || 0} / {billingData?.usage.leads.limit || '∞'}
                </span>
              </div>
            </div>
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Projects</span>
                <span className="text-orange-500 font-semibold">
                  {billingData?.usage.projects.used || 0} / {billingData?.usage.projects.limit || '∞'}
                </span>
              </div>
            </div>
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <div className="flex justify-between items-center">
                <span className="text-white/80">AI Summaries</span>
                <span className="text-orange-500 font-semibold">
                  {billingData?.usage.aiSummaries.used || 0} / {billingData?.usage.aiSummaries.limit || '∞'}
                </span>
              </div>
            </div>
            <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/30">
              <div className="flex justify-between items-center">
                <span className="text-white/80">AI Replies</span>
                <span className="text-orange-500 font-semibold">
                  {billingData?.usage.aiReplies.used || 0} / {billingData?.usage.aiReplies.limit || '∞'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60">
          You will be redirected to our pricing page to manage your subscription.
        </p>
      </CardContent>
    </Card>
  );
}
