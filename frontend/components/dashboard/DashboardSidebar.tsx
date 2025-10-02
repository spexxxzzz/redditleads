"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  Send,
  Bookmark,
  Settings,
  ChevronRight,
  Users,
  Target,
  BarChart3,
  Zap,
  Eye,
  ChevronDown,
  ChevronLeft,
  Crown,
  Webhook,
  PieChart,
  Activity,
  FolderOpen, // Add this import for project management
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser, useAuth } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Inter, Poppins } from 'next/font/google';
import { api } from '@/lib/api';
import UsageDashboard from './UsageDashboard';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface Project {
  id: string;
  userId: string;
  name: string;
  analyzedUrl: string;
  generatedKeywords: string[];
  generatedDescription: string;
  targetSubreddits: string[];
  competitors: string[];
  createdAt: string;
  lastManualDiscoveryAt?: string | null;
  lastGlobalDiscoveryAt?: string | null;
  lastTargetedDiscoveryAt?: string | null;
  isActive: boolean;
  _count?: {
    leads: number;
  };
}

interface Props {
  projects: Project[];
  activeProject: string | null;
  setActiveProject: (id: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  stats: {
    new: number;
    replied: number;
    saved: number;
    ignored: number;
    all: number;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeView: 'dashboard' | 'leads';
  setActiveView: (view: 'dashboard' | 'leads') => void;
  isMobile: boolean;
}

export const DashboardSidebar = ({
  projects,
  activeProject,
  setActiveProject,
  activeFilter,
  setActiveFilter,
  stats,
  isCollapsed,
  setIsCollapsed,
  activeView,
  setActiveView,
  isMobile
}: Props) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Debug: Log userPlan changes
  useEffect(() => {
    console.log('🎯 UserPlan state changed to:', userPlan);
  }, [userPlan]);

  // Fetch user's subscription status
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!isSignedIn || !user) {
        setIsLoadingPlan(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await api.getSubscriptionStatus(token);
        
        console.log('🔍 Subscription status response:', response);
        
        if (response.success && response.data?.plan) {
          console.log('✅ Setting user plan to:', response.data.plan);
          setUserPlan(response.data.plan);
        } else {
          console.log('⚠️ No plan found, defaulting to basic');
          setUserPlan('basic');
        }
      } catch (error) {
        console.error('❌ Error fetching user plan:', error);
        // Default to basic plan on error
        setUserPlan('basic');
      } finally {
        setIsLoadingPlan(false);
      }
    };

    fetchUserPlan();
  }, [isSignedIn, user, getToken]);

  // Use a client-side only loading state to prevent hydration mismatch
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  
  useEffect(() => {
    setIsClientLoaded(true);
  }, []);

  if (!isClientLoaded || !isLoaded) {
    return (
      <div className="h-screen flex flex-col bg-black border-r border-zinc-800 sticky top-0 z-20">
        <div className="p-4 border-b border-zinc-800 bg-black">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-zinc-900 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-900 rounded w-24"></div>
                <div className="h-3 bg-zinc-900 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const redditUsername = user.publicMetadata?.redditUsername as string | undefined;
  const isRedditConnected = !!user?.publicMetadata?.hasConnectedReddit;

  const FilterButton = ({ icon: Icon, label, count, isActive, onClick }: any) => (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} h-9 transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
      }`}
      title={isCollapsed ? `${label} (${count})` : ''}
    >
      <Icon className="h-4 w-4 mr-2" />
      {!isCollapsed && (
        <>
          <span className={`flex-1 text-left ${inter.className}`}>{label}</span>
          <Badge 
            variant="outline" 
            className={`ml-auto text-xs ${
              isActive 
                ? 'border-white/30 text-white bg-white/10' 
                : 'border-zinc-700 text-gray-400 bg-transparent hover:bg-zinc-900'
            }`}
          >
            {count}
          </Badge>
        </>
      )}
    </Button>
  );

  const NavButton = ({ href, icon: Icon, label, isActive, onClick }: any) => (
    <Button
      onClick={onClick || (() => {})}
      variant="ghost"
      className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'} h-9 transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
      }`}
      title={isCollapsed ? label : ''}
      asChild={!!href}
    >
      {href ? (
        <Link href={href}>
          <Icon className="h-4 w-4 mr-2" />
          {!isCollapsed && <span className={inter.className}>{label}</span>}
        </Link>
      ) : (
        <>
          <Icon className="h-4 w-4 mr-2" />
          {!isCollapsed && <span className={inter.className}>{label}</span>}
        </>
      )}
    </Button>
  );

  return (
    <div className="h-screen flex flex-col bg-black border-r border-zinc-800 sticky top-0 z-20">
      {/* User Profile Section */}
      <div className="p-4 border-b border-zinc-800 bg-black">
        {(isCollapsed && !isMobile) ? (
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
              <AvatarFallback className="bg-orange-500 text-white">
                {user.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCollapsed(false)}
              className="p-1 h-6 w-6 hover:bg-zinc-900 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate text-white ${poppins.className}`}>
                  {user.fullName || 'User'}
                </p>
                {redditUsername && isRedditConnected && (
                  <p className={`text-xs text-orange-400 truncate ${inter.className}`}>
                    u/{redditUsername}
                  </p>
                )}
              </div>
              {/* Hide collapse button on mobile */}
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 h-6 w-6 hover:bg-zinc-900 text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Badge className={`${
              userPlan === 'basic' 
                ? 'bg-gray-500 hover:bg-gray-600' 
                : userPlan === 'pdt_2A3SVJeAnBgj8XjLeoiaR' 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : userPlan === 'pdt_jhcgzC7RawLnUVJr4bn0a' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : userPlan === 'pdt_mXpMfglw1fhJpQGW2AFnj' 
                ? 'bg-purple-500 hover:bg-purple-600' 
                : 'bg-orange-500 hover:bg-orange-600'
            } text-white border-0`} title={`Current plan: ${userPlan}`}>
              {userPlan === 'basic' ? (
                <Zap className="h-3 w-3 mr-1" />
              ) : userPlan === 'pdt_2A3SVJeAnBgj8XjLeoiaR' ? (
                <Zap className="h-3 w-3 mr-1" />
              ) : userPlan === 'pdt_jhcgzC7RawLnUVJr4bn0a' ? (
                <Crown className="h-3 w-3 mr-1" />
              ) : userPlan === 'pdt_mXpMfglw1fhJpQGW2AFnj' ? (
                <Crown className="h-3 w-3 mr-1" />
              ) : (
                <Crown className="h-3 w-3 mr-1" />
              )}
              {userPlan === 'basic' 
                ? 'Basic' 
                : userPlan === 'pdt_2A3SVJeAnBgj8XjLeoiaR' 
                ? 'Starter' 
                : userPlan === 'pdt_jhcgzC7RawLnUVJr4bn0a' 
                ? 'Pro' 
                : userPlan === 'pdt_mXpMfglw1fhJpQGW2AFnj' 
                ? 'Ultimate' 
                : 'Pro'
              }
            </Badge>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {/* Main Navigation */}
        <div>
          {!isCollapsed && (
            <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
              Main
            </p>
          )}
          <div className="space-y-1">
            <NavButton 
              icon={BarChart3} 
              label="Dashboard" 
              isActive={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />
            <NavButton 
              icon={Inbox} 
              label="Leads" 
              isActive={activeView === 'leads'}
              onClick={() => setActiveView('leads')}
            />
            <NavButton 
              href="/dashboard/projects" 
              icon={FolderOpen} 
              label="Projects" 
              isActive={pathname === '/dashboard/projects'} 
            />
            <NavButton 
              href="/dashboard/settings?view=reddit" 
              icon={ExternalLink} 
              label="Reddit Integration" 
              isActive={pathname === '/dashboard/settings'} 
            />
            <NavButton 
              href="/dashboard/settings?view=billing" 
              icon={CreditCard} 
              label="Billing" 
              isActive={pathname === '/dashboard/settings'} 
            />
            <NavButton 
              href="/dashboard/settings" 
              icon={Settings} 
              label="Settings" 
              isActive={pathname === '/dashboard/settings'} 
            />
          </div>
        </div>

        {/* Inbox Section */}
        {activeView === 'leads' && (
          <>
            <Separator className="bg-zinc-800" />
            <div>
              {!isCollapsed && (
                <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
                  Inbox
                </p>
              )}
              <div className="space-y-1">
                <FilterButton 
                  icon={Zap} 
                  label="New" 
                  count={stats.new} 
                  isActive={activeFilter === 'new'} 
                  onClick={() => setActiveFilter('new')} 
                />
                <FilterButton 
                  icon={Send} 
                  label="Replied" 
                  count={stats.replied} 
                  isActive={activeFilter === 'replied'} 
                  onClick={() => setActiveFilter('replied')} 
                />
                <FilterButton 
                  icon={Bookmark} 
                  label="Saved" 
                  count={stats.saved} 
                  isActive={activeFilter === 'saved'} 
                  onClick={() => setActiveFilter('saved')} 
                />
                <FilterButton 
                  icon={Users} 
                  label="All" 
                  count={stats.all} 
                  isActive={activeFilter === 'all'} 
                  onClick={() => setActiveFilter('all')} 
                />
              </div>
            </div>

            {/* Projects Section */}
            {!isCollapsed && (
              <>
                <Separator className="bg-zinc-800" />
                <div data-tour="projects-section">
                  <p className={`text-xs font-medium text-gray-500 mb-3 px-3 uppercase tracking-wider ${inter.className}`}>
                    Projects
                  </p>
                  <div className="space-y-2">
                    {projects.length === 0 ? (
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-3 text-center">
                          <p className={`text-xs text-gray-400 ${inter.className}`}>No projects</p>
                        </CardContent>
                      </Card>
                    ) : (
                      projects.map((project) => (
                        <div key={project.id}>
                          <Button
                            onClick={() => setActiveProject(project.id)}
                            variant="ghost"
                            className={`w-full justify-between text-left h-auto p-3 rounded-lg transition-all duration-200 ${
                              activeProject === project.id 
                                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                : 'hover:bg-zinc-900 text-gray-300 hover:text-white'
                            }`}
                          >
                            <div className="flex-1">
                              <div className={`font-medium text-sm ${poppins.className}`}>
                                {new URL(project.analyzedUrl).hostname}
                              </div>
                            </div>
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          
                          {activeProject === project.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mx-3 mt-1 mb-2"
                            >
                              <Card className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-3 space-y-3">
                                  <div>
                                    <p className={`text-xs font-medium mb-2 text-gray-300 ${inter.className}`}>
                                      Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {project.generatedKeywords.slice(0, 2).map((keyword) => (
                                        <Badge key={keyword} className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">
                                          {keyword}
                                        </Badge>
                                      ))}
                                      {project.generatedKeywords.length > 2 && (
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs border-zinc-700 text-gray-400"
                                        >
                                          +{project.generatedKeywords.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Eye className="h-3 w-3 text-orange-500" />
                                    <span className={inter.className}>{project.targetSubreddits.length} subreddits</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Usage Dashboard - Always visible */}
        {!isCollapsed && (
          <div className="mt-6">
            <UsageDashboard projectId={activeProject || undefined} />
          </div>
        )}
      </div>
    </div>
  );
};