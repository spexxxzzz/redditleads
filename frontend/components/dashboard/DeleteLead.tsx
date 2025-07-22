"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrashIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

interface DeleteLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  leadStats: { new: number; replied: number; saved: number; ignored: number; all: number };
  onLeadsDeleted: () => void;
}

export const DeleteLeadsModal: React.FC<DeleteLeadsModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  leadStats,
  onLeadsDeleted
}) => {
  const { getToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'all' | 'status' | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      await api.deleteAllLeads(campaignId, token);
      onLeadsDeleted();
      onClose();
    } catch (error) {
      console.error('Failed to delete all leads:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteByStatus = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      await api.deleteLeadsByStatus(campaignId, selectedStatus, token);
      onLeadsDeleted();
      onClose();
    } catch (error) {
      console.error(`Failed to delete ${selectedStatus} leads:`, error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black border border-red-800 rounded-xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500/10">
                  <TrashIcon className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold text-white ${poppins.className}`}>
                    Delete Leads
                  </h2>
                  <p className={`text-sm text-gray-400 ${inter.className}`}>
                    Permanently remove leads from your campaign
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className={`text-sm font-medium text-red-400 ${inter.className}`}>
                  Warning: This action cannot be undone
                </p>
                <p className={`text-xs text-red-300/80 mt-1 ${inter.className}`}>
                  Deleted leads will be permanently removed from your account.
                </p>
              </div>
            </div>

            {/* Delete Options */}
            <div className="space-y-4 mb-6">
              {/* Delete All */}
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  deleteType === 'all' 
                    ? 'border-red-500 bg-red-500/5' 
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => setDeleteType('all')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium text-white ${poppins.className}`}>
                      Delete All Leads
                    </p>
                    <p className={`text-sm text-gray-400 ${inter.className}`}>
                      Remove all {leadStats.all} leads from this campaign
                    </p>
                  </div>
                  <Badge variant="outline" className="border-red-500/20 text-red-400">
                    {leadStats.all} leads
                  </Badge>
                </div>
              </div>

              {/* Delete by Status */}
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  deleteType === 'status' 
                    ? 'border-red-500 bg-red-500/5' 
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => setDeleteType('status')}
              >
                <div>
                  <p className={`font-medium text-white mb-3 ${poppins.className}`}>
                    Delete by Status
                  </p>
                  
                  {deleteType === 'status' && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'ignored', label: 'Ignored', count: leadStats.ignored },
                        { key: 'replied', label: 'Replied', count: leadStats.replied },
                        { key: 'saved', label: 'Saved', count: leadStats.saved },
                        { key: 'new', label: 'New', count: leadStats.new }
                      ].map(status => (
                        <div
                          key={status.key}
                          className={`p-2 rounded border text-sm cursor-pointer transition-all ${
                            selectedStatus === status.key
                              ? 'border-red-500 bg-red-500/10 text-red-400'
                              : 'border-zinc-700 text-gray-400 hover:border-zinc-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStatus(status.key);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className={inter.className}>{status.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {status.count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteType === 'all' ? handleDeleteAll : handleDeleteByStatus}
                disabled={isDeleting || !deleteType || (deleteType === 'status' && !selectedStatus)}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Leads'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};