"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  GlobeAltIcon,
  TagIcon,
  EyeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
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
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    analyzedUrl: '',
    generatedDescription: '',
    generatedKeywords: [] as string[],
    targetSubreddits: [] as string[],
    competitors: [] as string[],
    isActive: true
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        analyzedUrl: project.analyzedUrl || '',
        generatedDescription: project.generatedDescription || '',
        generatedKeywords: [...project.generatedKeywords],
        targetSubreddits: [...project.targetSubreddits],
        competitors: [...project.competitors],
        isActive: project.isActive
      });
      
      // Automatically switch to preview mode when description exists
      if (project.generatedDescription) {
        setShowPreview(true);
      }
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    try {
      const token = await getToken();
      await api.updateProject(project.id, formData, token);
      toast.success('Project updated successfully');
      onProjectUpdated();
    } catch (error: any) {
      toast.error('Failed to update project', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.generatedKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        generatedKeywords: [...prev.generatedKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      generatedKeywords: prev.generatedKeywords.filter(k => k !== keyword)
    }));
  };

  const addSubreddit = () => {
    if (newSubreddit.trim() && !formData.targetSubreddits.includes(newSubreddit.trim())) {
      setFormData(prev => ({
        ...prev,
        targetSubreddits: [...prev.targetSubreddits, newSubreddit.trim()]
      }));
      setNewSubreddit('');
    }
  };

  const removeSubreddit = (subreddit: string) => {
    setFormData(prev => ({
      ...prev,
      targetSubreddits: prev.targetSubreddits.filter(s => s !== subreddit)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor('');
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  if (!isOpen || !project) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black rounded-xl border border-zinc-800 shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-black border-b border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold text-white ${poppins.className}`}>
                  Edit Project
                </h2>
                <p className={`text-zinc-400 mt-1 ${inter.className}`}>
                  Update your project settings and targeting
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                  <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium text-zinc-300 mb-2 ${inter.className}`}>
                    Project Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="My Lead Generation Project"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-zinc-300 mb-2 ${inter.className}`}>
                    <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                    Website URL
                  </label>
                  <Input
                    value={formData.analyzedUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, analyzedUrl: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className={`block text-sm font-medium text-zinc-300 ${inter.className}`}>
                      <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                      Description
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                  </div>
                  {showPreview ? (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-md p-3 min-h-[100px]">
                      <MarkdownRenderer content={formData.generatedDescription} />
                    </div>
                  ) : (
                    <Textarea
                      value={formData.generatedDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, generatedDescription: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                      placeholder="Describe your business and what you're looking for..."
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className={`text-sm font-medium text-zinc-300 ${inter.className}`}>
                      Project Status
                    </label>
                    <p className={`text-xs text-zinc-500 ${inter.className}`}>
                      Enable or disable lead discovery for this project
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                  <TagIcon className="w-5 h-5 text-orange-500" />
                  Target Keywords ({formData.generatedKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Add keyword..."
                  />
                  <Button
                    type="button"
                    onClick={addKeyword}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.generatedKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="border-orange-500/20 text-orange-400 flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Target Subreddits */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                  <EyeIcon className="w-5 h-5 text-orange-500" />
                  Target Subreddits ({formData.targetSubreddits.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSubreddit}
                    onChange={(e) => setNewSubreddit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubreddit())}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="subreddit name (without r/)"
                  />
                  <Button
                    type="button"
                    onClick={addSubreddit}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.targetSubreddits.map((subreddit) => (
                    <Badge
                      key={subreddit}
                      variant="outline"
                      className="border-blue-500/20 text-blue-400 flex items-center gap-1"
                    >
                      r/{subreddit}
                      <button
                        type="button"
                        onClick={() => removeSubreddit(subreddit)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitors */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className={`text-white flex items-center gap-2 ${poppins.className}`}>
                  <BuildingOfficeIcon className="w-5 h-5 text-orange-500" />
                  Competitors ({formData.competitors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Competitor name or URL"
                  />
                  <Button
                    type="button"
                    onClick={addCompetitor}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.competitors.map((competitor) => (
                    <Badge
                      key={competitor}
                      variant="outline"
                      className="border-purple-500/20 text-purple-400 flex items-center gap-1"
                    >
                      {competitor}
                      <button
                        type="button"
                        onClick={() => removeCompetitor(competitor)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
              >
                {loading ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};