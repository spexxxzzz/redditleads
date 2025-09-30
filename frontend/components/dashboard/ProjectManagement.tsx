"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  GlobeAltIcon,
  TagIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditProjectModal } from '@/components/dashboard/EditProjectModal';
import { DeleteProjectModal } from '@/components/dashboard/DeleteProjectModal';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { toast } from 'sonner';
import PulsatingDotsLoaderDashboard from '@/components/loading/LoadingDashboard';
import { useProjectLimits } from '@/hooks/useProjectLimits';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900']
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

export default function ProjectsManagementPage() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { canCreateProject, currentProjects, maxProjects, isLoading: limitsLoading } = useProjectLimits();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await api.getProjects(token);
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleProjectDeleted = () => {
    fetchProjects();
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleProjectCreated = () => {
    fetchProjects();
    setShowCreateModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <PulsatingDotsLoaderDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <h1 className={`text-4xl font-black tracking-tight text-white ${poppins.className}`}>
                Project <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className={`text-xl text-zinc-400 font-medium ${inter.className}`}>
                Create, edit, and manage your lead generation projects
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                data-tour="create-project-button"
                onClick={() => setShowCreateModal(true)}
                disabled={!canCreateProject || limitsLoading}
                className={`h-12 px-6 text-base font-semibold ${
                  canCreateProject 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                }`}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                {limitsLoading ? "Checking limits..." : "Create Project"}
              </Button>
              {!canCreateProject && (
                <div className="text-right">
                  <p className="text-sm text-zinc-400">
                    Project limit reached ({currentProjects}/{maxProjects === 'unlimited' ? '∞' : maxProjects})
                  </p>
                  <p className="text-xs text-orange-400">
                    <a href="/dashboard/pricing" className="underline hover:text-orange-300">
                      Upgrade to create more projects
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="bg-black/60 border-white/10">
              <CardContent className="text-center py-16">
                <BuildingOfficeIcon className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                <h3 className={`text-xl font-bold text-white mb-2 ${poppins.className}`}>
                  No projects yet
                </h3>
                <p className={`text-zinc-400 mb-6 ${inter.className}`}>
                  Create your first project to start discovering leads
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!canCreateProject || limitsLoading}
                  className={`${
                    canCreateProject 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {limitsLoading ? "Checking limits..." : "Create Your First Project"}
                </Button>
                {!canCreateProject && (
                  <p className="text-sm text-orange-400 mt-2">
                    <a href="/dashboard/pricing" className="underline hover:text-orange-300">
                      Upgrade to create projects
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group"
                  >
                    <Card className="bg-black/60 border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl">
                    <CardHeader className="pb-3">
  <div className="flex items-start justify-between gap-3">
    <div className="flex-1 min-w-0">
      <CardTitle className={`text-white font-bold text-lg truncate ${poppins.className}`}>
        {project.name || new URL(project.analyzedUrl).hostname}
      </CardTitle>
      <div className="flex items-center gap-2 mt-1">
        <GlobeAltIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <span className={`text-sm text-zinc-400 truncate ${inter.className}`}>
          {project.analyzedUrl}
        </span>
      </div>
    </div>
    <div className="flex-shrink-0">
      <Badge 
        variant={project.isActive ? "default" : "secondary"}
        className={`text-xs px-2 py-1 font-medium ${
          project.isActive 
            ? "bg-green-500/20 text-green-400 border-green-500/30" 
            : "bg-zinc-700/50 text-zinc-400 border-zinc-600/30"
        }`}
      >
        {project.isActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  </div>
</CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Keywords */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TagIcon className="w-4 h-4 text-orange-500" />
                            <span className={`text-sm font-medium text-white ${inter.className}`}>
                              Keywords ({project.generatedKeywords.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.generatedKeywords.slice(0, 3).map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs border-orange-500/20 text-orange-400">
                                {keyword}
                              </Badge>
                            ))}
                            {project.generatedKeywords.length > 3 && (
                              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                +{project.generatedKeywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Subreddits */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <EyeIcon className="w-4 h-4 text-orange-500" />
                            <span className={`text-sm font-medium text-white ${inter.className}`}>
                              Subreddits ({project.targetSubreddits.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.targetSubreddits.slice(0, 2).map((subreddit) => (
                              <Badge key={subreddit} variant="outline" className="text-xs border-blue-500/20 text-blue-400">
                                r/{subreddit}
                              </Badge>
                            ))}
                            {project.targetSubreddits.length > 2 && (
                              <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                +{project.targetSubreddits.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="pt-2 border-t border-zinc-800">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                              <span className={`text-zinc-400 ${inter.className}`}>
                                Created {formatDate(project.createdAt)}
                              </span>
                            </div>
                            <div className={`text-zinc-400 ${inter.className}`}>
                              {project._count?.leads || 0} leads
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            className="flex-1 border-zinc-700 text-white hover:bg-zinc-800"
                          >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        project={selectedProject}
        onProjectDeleted={handleProjectDeleted}
      />

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}