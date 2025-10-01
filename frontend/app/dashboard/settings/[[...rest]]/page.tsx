"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SettingsSidebarNav } from "@/components/settings/SettingsSidebar";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { RedditConnection } from "@/components/dashboard/RedditSettings";
import { WebhookManagement } from '@/components/dashboard/Management';
import PerformancePage from '@/components/dashboard/ReplyPerformance';

// Component that uses searchParams
function SettingsPageContent() {
  const searchParams = useSearchParams();
  // State to manage the currently active settings view
  const [activeView, setActiveView] = useState("profile");

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const view = searchParams.get('view');
    if (view && ['profile', 'account', 'reddit', 'billing', 'webhooks', 'notifications', 'performance'].includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);

  // Function to render the component based on the active view
  const renderView = () => {
    switch (activeView) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings/>;
      case "reddit":
        return <RedditConnection />;
      case "billing":
        return <BillingSettings />;
      case "webhooks":
        return <WebhookManagement />;
      case "notifications":
        return <NotificationSettings />;
      case "performance":
        return <PerformancePage />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="hidden space-y-6 p-4 md:p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and billing.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/6 lg:flex-shrink-0">
          <SettingsSidebarNav activeView={activeView} setActiveView={setActiveView} />
        </aside>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl mx-auto px-4 lg:px-8">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
