"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, Bell, CreditCard, Cog, ExternalLink, Webhook, Activity } from "lucide-react"; // Import Cog, ExternalLink, Webhook, Activity
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Sidebar navigation items
const sidebarNavItems = [
  {
    title: "Profile",
    icon: <User className="mr-2 h-4 w-4" />,
    view: "profile",
  },
  {
    title: "Account",
    icon: <Cog className="mr-2 h-4 w-4" />, // Added Account section
    view: "account",
  },
  {
    title: "Webhooks",
    icon: <Webhook className="mr-2 h-4 w-4" />,
    view: "webhooks",
  },
  {
    title: "Notifications",
    icon: <Bell className="mr-2 h-4 w-4" />,
    view: "notifications",
  },
  {
    title: "Performance",
    icon: <Activity className="mr-2 h-4 w-4" />,
    view: "performance",
  },
];

interface SettingsSidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  activeView: string;
  setActiveView: (view: string) => void;
}

function SettingsSidebarNavContent({
  className,
  activeView,
  setActiveView,
  ...props
}: SettingsSidebarNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (view: string) => {
    setActiveView(view);
    // Update URL to reflect the current view
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`/dashboard/settings?${params.toString()}`);
  };

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Button
          key={item.view}
          onClick={() => handleViewChange(item.view)}
          variant="ghost"
          className={cn(
            "w-full justify-start hover:bg-zinc-800 hover:text-white",
            activeView === item.view
              ? "bg-zinc-800 text-white"
              : "text-muted-foreground"
          )}
        >
          {item.icon}
          {item.title}
        </Button>
      ))}
    </nav>
  );
}

export function SettingsSidebarNav(props: SettingsSidebarNavProps) {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SettingsSidebarNavContent {...props} />
    </Suspense>
  );
}