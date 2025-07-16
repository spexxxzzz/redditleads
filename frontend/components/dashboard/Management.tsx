// // Update the existing component to be production-ready:

// "use client";
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Plus, 
//   Settings, 
//   Trash2, 
//   TestTube, 
//   AlertCircle, 
//   CheckCircle,
//   Clock,
//   Filter,
//   Zap,
//   MessageSquare,
//   Bell,
//   Globe,
//   Mail,
//   Smartphone,
//   ExternalLink,
//   Copy,
//   CheckCheck
// } from 'lucide-react';
// import { api } from '@/lib/api';

// // Replace TEST_USER_ID with actual user authentication
// const getCurrentUserId = () => {
//   // In production, get this from your auth system
//   // For now, using the test user
//   return 'clerk_test_user_123';
// };

// interface Webhook {
//   id: string;
//   name: string;
//   url: string;
//   type: 'discord' | 'slack' | 'generic' | 'email' | 'sms';
//   isActive: boolean;
//   events: string[];
//   createdAt: string;
//   lastTriggered?: string;
//   filters?: {
//     minOpportunityScore?: number;
//     subreddits?: string[];
//     keywords?: string[];
//     priority?: string[];
//   };
//   rateLimitMinutes?: number;
// }

// const WEBHOOK_TYPES = {
//   discord: { 
//     icon: MessageSquare, 
//     label: 'Discord', 
//     color: 'bg-indigo-500',
//     description: 'Get notifications in your Discord server',
//     setupUrl: 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks'
//   },
//   slack: { 
//     icon: Bell, 
//     label: 'Slack', 
//     color: 'bg-green-500',
//     description: 'Send alerts to your Slack workspace',
//     setupUrl: 'https://api.slack.com/messaging/webhooks'
//   },
//   generic: { 
//     icon: Globe, 
//     label: 'Generic', 
//     color: 'bg-gray-500',
//     description: 'Send to any HTTP endpoint',
//     setupUrl: null
//   },
//   email: { 
//     icon: Mail, 
//     label: 'Email', 
//     color: 'bg-blue-500',
//     description: 'Email notifications (coming soon)',
//     setupUrl: null
//   },
//   sms: { 
//     icon: Smartphone, 
//     label: 'SMS', 
//     color: 'bg-purple-500',
//     description: 'Text message alerts (coming soon)',
//     setupUrl: null
//   },
// };

// const EVENT_TYPES = [
//   { 
//     id: 'lead.discovered', 
//     label: 'Lead Discovered', 
//     description: 'New high-value leads found',
//     icon: '🎯',
//     recommended: true
//   },
//   { 
//     id: 'lead.replied', 
//     label: 'Reply Posted', 
//     description: 'When you reply to a lead',
//     icon: '💬',
//     recommended: false
//   },
//   { 
//     id: 'discovery.completed', 
//     label: 'Discovery Completed', 
//     description: 'Campaign discovery finished',
//     icon: '✅',
//     recommended: true
//   },
//   { 
//     id: 'performance.daily', 
//     label: 'Daily Report', 
//     description: 'Daily performance summary',
//     icon: '📊',
//     recommended: false
//   },
//   { 
//     id: 'system.alert', 
//     label: 'System Alerts', 
//     description: 'Important system notifications',
//     icon: '⚠️',
//     recommended: true
//   },
// ];

// const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'];

// export const WebhookManagement: React.FC = () => {
//   const [webhooks, setWebhooks] = useState<Webhook[]>([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showSetupGuide, setShowSetupGuide] = useState(false);
//   const [selectedWebhookType, setSelectedWebhookType] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<any>(null);
//   const [testingWebhook, setTestingWebhook] = useState<string>('');

//   const userId = getCurrentUserId();

//   useEffect(() => {
//     loadWebhooks();
//     loadStats();
//   }, []);

//   const loadWebhooks = async () => {
//     try {
//       const response = await api.getWebhooks(userId);
//       setWebhooks(response.webhooks || []);
//     } catch (error) {
//       console.error('Failed to load webhooks:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await api.getWebhookStats(userId);
//       setStats(response);
//     } catch (error) {
//       console.error('Failed to load webhook stats:', error);
//     }
//   };

//   const deleteWebhook = async (webhookId: string) => {
//     if (!confirm('Are you sure you want to delete this webhook?')) return;
    
//     try {
//       await api.deleteWebhook(webhookId);
//       setWebhooks(webhooks.filter(w => w.id !== webhookId));
//       loadStats();
//     } catch (error) {
//       console.error('Failed to delete webhook:', error);
//       alert('Failed to delete webhook');
//     }
//   };

//   const testWebhook = async (webhookId: string) => {
//     setTestingWebhook(webhookId);
//     try {
//       await api.testWebhook(webhookId);
//       alert('Test webhook sent successfully! Check your endpoint.');
//     } catch (error) {
//       console.error('Failed to test webhook:', error);
//       alert('Failed to send test webhook');
//     } finally {
//       setTestingWebhook('');
//     }
//   };

//   const toggleWebhook = async (webhookId: string, isActive: boolean) => {
//     try {
//       await api.updateWebhook(webhookId, { isActive });
//       setWebhooks(webhooks.map(w => 
//         w.id === webhookId ? { ...w, isActive } : w
//       ));
//     } catch (error) {
//       console.error('Failed to update webhook:', error);
//       alert('Failed to update webhook');
//     }
//   };

//   const openSetupGuide = (type: string) => {
//     setSelectedWebhookType(type);
//     setShowSetupGuide(true);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-white">Webhook Management</h1>
//           <p className="text-gray-400 mt-2">Get real-time notifications when leads are discovered</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowSetupGuide(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
//           >
//             <ExternalLink className="w-4 h-4" />
//             Setup Guide
//           </button>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Webhook
//           </button>
//         </div>
//       </div>

//       {/* Quick Start Guide */}
//       <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
//         <div className="flex items-start gap-4">
//           <div className="p-2 bg-blue-500/20 rounded-lg">
//             <Zap className="w-5 h-5 text-blue-400" />
//           </div>
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-white mb-2">Get Started in 3 Steps</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
//                 <span className="text-gray-300">Choose your platform (Discord, Slack, etc.)</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
//                 <span className="text-gray-300">Create webhook URL in your platform</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
//                 <span className="text-gray-300">Add webhook here and test!</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-gray-800 rounded-lg p-4">
//             <div className="flex items-center gap-2">
//               <Zap className="w-5 h-5 text-blue-400" />
//               <h3 className="font-semibold text-white">Total Webhooks</h3>
//             </div>
//             <p className="text-2xl font-bold text-white mt-2">{stats.totalWebhooks}</p>
//           </div>
//           <div className="bg-gray-800 rounded-lg p-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-400" />
//               <h3 className="font-semibold text-white">Active</h3>
//             </div>
//             <p className="text-2xl font-bold text-white mt-2">{stats.activeWebhooks}</p>
//           </div>
//           <div className="bg-gray-800 rounded-lg p-4">
//             <div className="flex items-center gap-2">
//               <Clock className="w-5 h-5 text-yellow-400" />
//               <h3 className="font-semibold text-white">Last Triggered</h3>
//             </div>
//             <p className="text-sm text-gray-400 mt-2">
//               {stats.lastTriggered 
//                 ? new Date(stats.lastTriggered).toLocaleString()
//                 : 'Never'
//               }
//             </p>
//           </div>
//           <div className="bg-gray-800 rounded-lg p-4">
//             <div className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-purple-400" />
//               <h3 className="font-semibold text-white">Most Used</h3>
//             </div>
//             <p className="text-sm text-gray-400 mt-2">
//               {Object.entries(stats.webhooksByType || {})
//                 .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Webhooks List */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-white">Your Webhooks</h2>
//           {webhooks.length > 0 && (
//             <span className="text-sm text-gray-400">
//               {webhooks.filter(w => w.isActive).length} active of {webhooks.length} total
//             </span>
//           )}
//         </div>
        
//         {webhooks.length === 0 ? (
//           <div className="text-center py-12 bg-gray-800 rounded-lg">
//             <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-white mb-2">No webhooks configured</h3>
//             <p className="text-gray-400 mb-6">Set up your first webhook to start receiving real-time notifications</p>
//             <div className="flex justify-center gap-3">
//               <button
//                 onClick={() => setShowSetupGuide(true)}
//                 className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
//               >
//                 View Setup Guide
//               </button>
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//               >
//                 Create Your First Webhook
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="grid gap-4">
//             {webhooks.map((webhook) => (
//               <WebhookCard
//                 key={webhook.id}
//                 webhook={webhook}
//                 onDelete={() => deleteWebhook(webhook.id)}
//                 onTest={() => testWebhook(webhook.id)}
//                 onToggle={(isActive) => toggleWebhook(webhook.id, isActive)}
//                 onSetupGuide={() => openSetupGuide(webhook.type)}
//                 testing={testingWebhook === webhook.id}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <AnimatePresence>
//         {showCreateModal && (
//           <CreateWebhookModal
//             onClose={() => setShowCreateModal(false)}
//             onCreated={() => {
//               loadWebhooks();
//               loadStats();
//               setShowCreateModal(false);
//             }}
//             userId={userId}
//           />
//         )}
//         {showSetupGuide && (
//           <SetupGuideModal
//             onClose={() => setShowSetupGuide(false)}
//             selectedType={selectedWebhookType}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// const WebhookCard: React.FC<{
//   webhook: Webhook;
//   onDelete: () => void;
//   onTest: () => void;
//   onToggle: (isActive: boolean) => void;
//   onSetupGuide: () => void;
//   testing: boolean;
// }> = ({ webhook, onDelete, onTest, onToggle, onSetupGuide, testing }) => {
//   const [copied, setCopied] = useState(false);
//   const TypeIcon = WEBHOOK_TYPES[webhook.type].icon;
  
//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex items-start gap-4 flex-1">
//           <div className={`p-3 rounded-lg ${WEBHOOK_TYPES[webhook.type].color}`}>
//             <TypeIcon className="w-5 h-5 text-white" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-2">
//               <h3 className="text-lg font-semibold text-white truncate">{webhook.name}</h3>
//               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                 webhook.isActive 
//                   ? 'bg-green-500/20 text-green-400' 
//                   : 'bg-gray-500/20 text-gray-400'
//               }`}>
//                 {webhook.isActive ? 'Active' : 'Inactive'}
//               </span>
//             </div>
            
//             <p className="text-sm text-gray-400 mb-3">{WEBHOOK_TYPES[webhook.type].label}</p>
            
//             <div className="flex items-center gap-2 mb-3">
//               <p className="text-xs text-gray-500 truncate flex-1">{webhook.url}</p>
//               <button
//                 onClick={() => copyToClipboard(webhook.url)}
//                 className="p-1 text-gray-400 hover:text-white transition-colors"
//                 title="Copy URL"
//               >
//                 {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
//               </button>
//             </div>
            
//             {/* Events */}
//             <div className="flex flex-wrap gap-2 mb-3">
//               {webhook.events.map((event) => (
//                 <span
//                   key={event}
//                   className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
//                 >
//                   {EVENT_TYPES.find(e => e.id === event)?.label || event}
//                 </span>
//               ))}
//             </div>

//             {/* Filters */}
//             {webhook.filters && (
//               <div className="space-y-1 text-sm text-gray-400">
//                 {webhook.filters.minOpportunityScore && (
//                   <p>Min Score: {webhook.filters.minOpportunityScore}%</p>
//                 )}
//                 {webhook.filters.subreddits && webhook.filters.subreddits.length > 0 && (
//                   <p>Subreddits: {webhook.filters.subreddits.join(', ')}</p>
//                 )}
//                 {webhook.filters.keywords && webhook.filters.keywords.length > 0 && (
//                   <p>Keywords: {webhook.filters.keywords.join(', ')}</p>
//                 )}
//                 {webhook.filters.priority && webhook.filters.priority.length > 0 && (
//                   <p>Priority: {webhook.filters.priority.join(', ')}</p>
//                 )}
//               </div>
//             )}

//             {/* Last triggered */}
//             {webhook.lastTriggered && (
//               <p className="text-xs text-gray-500 mt-2">
//                 Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             onClick={onTest}
//             disabled={testing}
//             className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
//             title="Test webhook"
//           >
//             <TestTube className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
//           </button>
//           <button
//             onClick={() => onToggle(!webhook.isActive)}
//             className={`p-2 rounded-lg transition-colors ${
//               webhook.isActive
//                 ? 'text-green-400 hover:bg-green-500/10'
//                 : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'
//             }`}
//             title={webhook.isActive ? 'Disable webhook' : 'Enable webhook'}
//           >
//             <Zap className="w-4 h-4" />
//           </button>
//           <button
//             onClick={onSetupGuide}
//             className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
//             title="Setup guide"
//           >
//             <ExternalLink className="w-4 h-4" />
//           </button>
//           <button
//             onClick={onDelete}
//             className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
//             title="Delete webhook"
//           >
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const CreateWebhookModal: React.FC<{
//   onClose: () => void;
//   onCreated: () => void;
//   userId: string;
// }> = ({ onClose, onCreated, userId }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     url: '',
//     type: 'discord' as const,
//     events: ['lead.discovered'] as string[],
//     filters: {
//       minOpportunityScore: 70,
//       subreddits: [] as string[],
//       keywords: [] as string[],
//       priority: ['high', 'urgent'] as string[],
//     },
//     rateLimitMinutes: 5,
//   });
//   const [loading, setLoading] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [subredditInput, setSubredditInput] = useState('');
//   const [keywordInput, setKeywordInput] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.createWebhook(userId, formData);
//       onCreated();
//     } catch (error) {
//       console.error('Failed to create webhook:', error);
//       alert('Failed to create webhook. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addSubreddit = () => {
//     if (subredditInput.trim() && !formData.filters.subreddits.includes(subredditInput.trim())) {
//       setFormData({
//         ...formData,
//         filters: {
//           ...formData.filters,
//           subreddits: [...formData.filters.subreddits, subredditInput.trim()]
//         }
//       });
//       setSubredditInput('');
//     }
//   };

//   const addKeyword = () => {
//     if (keywordInput.trim() && !formData.filters.keywords.includes(keywordInput.trim())) {
//       setFormData({
//         ...formData,
//         filters: {
//           ...formData.filters,
//           keywords: [...formData.filters.keywords, keywordInput.trim()]
//         }
//       });
//       setKeywordInput('');
//     }
//   };

//   const removeSubreddit = (subreddit: string) => {
//     setFormData({
//       ...formData,
//       filters: {
//         ...formData.filters,
//         subreddits: formData.filters.subreddits.filter(s => s !== subreddit)
//       }
//     });
//   };

//   const removeKeyword = (keyword: string) => {
//     setFormData({
//       ...formData,
//       filters: {
//         ...formData.filters,
//         keywords: formData.filters.keywords.filter(k => k !== keyword)
//       }
//     });
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-white">Create New Webhook</h2>
//           <span className="text-sm text-gray-400">Step {currentStep} of 3</span>
//         </div>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {currentStep === 1 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Webhook Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="e.g., Team Discord Notifications"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Webhook Type
//                 </label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {Object.entries(WEBHOOK_TYPES).map(([key, type]) => (
//                     <button
//                       key={key}
//                       type="button"
//                       onClick={() => setFormData({ ...formData, type: key as any })}
//                       className={`p-3 rounded-lg border-2 transition-colors ${
//                         formData.type === key
//                           ? 'border-blue-500 bg-blue-500/10'
//                           : 'border-gray-600 hover:border-gray-500'
//                       }`}
//                     >
//                       <type.icon className="w-5 h-5 mx-auto mb-2 text-white" />
//                       <p className="text-sm font-medium text-white">{type.label}</p>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Webhook URL
//                 </label>
//                 <input
//                   type="url"
//                   value={formData.url}
//                   onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                   className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="https://discord.com/api/webhooks/..."
//                   required
//                 />
//                 <p className="text-xs text-gray-400 mt-1">
//                   {WEBHOOK_TYPES[formData.type].setupUrl && (
//                     <a
//                       href={WEBHOOK_TYPES[formData.type].setupUrl!}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-400 hover:text-blue-300"
//                     >
//                       How to get your {WEBHOOK_TYPES[formData.type].label} webhook URL →
//                     </a>
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-white">Event Configuration</h3>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Events to Monitor
//                 </label>
//                 <div className="space-y-2">
//                   {EVENT_TYPES.map((event) => (
//                     <label key={event.id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
//                       <input
//                         type="checkbox"
//                         checked={formData.events.includes(event.id)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setFormData({
//                               ...formData,
//                               events: [...formData.events, event.id]
//                             });
//                           } else {
//                             setFormData({
//                               ...formData,
//                               events: formData.events.filter(id => id !== event.id)
//                             });
//                           }
//                         }}
//                         className="rounded text-blue-500 focus:ring-blue-500 mt-1"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <span className="text-lg">{event.icon}</span>
//                           <span className="text-white font-medium">{event.label}</span>
//                           {event.recommended && (
//                             <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
//                               Recommended
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-400 mt-1">{event.description}</p>
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Rate Limit
//                 </label>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="number"
//                     min="1"
//                     max="60"
//                     value={formData.rateLimitMinutes}
//                     onChange={(e) => setFormData({ ...formData, rateLimitMinutes: parseInt(e.target.value) })}
//                     className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                   <span className="text-gray-400">minutes between notifications</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {currentStep === 3 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-white">Filters (Optional)</h3>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Minimum Opportunity Score: {formData.filters.minOpportunityScore}%
//                 </label>
//                 <input
//                   type="range"
//                   min="0"
//                   max="100"
//                   value={formData.filters.minOpportunityScore}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     filters: { ...formData.filters, minOpportunityScore: parseInt(e.target.value) }
//                   })}
//                   className="w-full accent-blue-500"
//                 />
//                 <div className="flex justify-between text-xs text-gray-400 mt-1">
//                   <span>0% (All leads)</span>
//                   <span>100% (Only highest quality)</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Priority Levels
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   {PRIORITY_LEVELS.map((priority) => (
//                     <label key={priority} className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={formData.filters.priority.includes(priority)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setFormData({
//                               ...formData,
//                               filters: {
//                                 ...formData.filters,
//                                 priority: [...formData.filters.priority, priority]
//                               }
//                             });
//                           } else {
//                             setFormData({
//                               ...formData,
//                               filters: {
//                                 ...formData.filters,
//                                 priority: formData.filters.priority.filter(p => p !== priority)
//                               }
//                             });
//                           }
//                         }}
//                         className="rounded text-blue-500 focus:ring-blue-500"
//                       />
//                       <span className="text-white capitalize">{priority}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Subreddits Filter
//                 </label>
//                 <div className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={subredditInput}
//                     onChange={(e) => setSubredditInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubreddit())}
//                     className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="e.g., startups, entrepreneur"
//                   />
//                   <button
//                     type="button"
//                     onClick={addSubreddit}
//                     className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.filters.subreddits.map((subreddit) => (
//                     <span
//                       key={subreddit}
//                       className="px-2 py-1 bg-gray-700 text-white rounded text-sm flex items-center gap-1"
//                     >
//                       r/{subreddit}
//                       <button
//                         type="button"
//                         onClick={() => removeSubreddit(subreddit)}
//                         className="text-red-400 hover:text-red-300"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-300 mb-2">
//                   Keywords Filter
//                 </label>
//                 <div className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={keywordInput}
//                     onChange={(e) => setKeywordInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
//                     className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="e.g., project management, productivity"
//                   />
//                   <button
//                     type="button"
//                     onClick={addKeyword}
//                     className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.filters.keywords.map((keyword) => (
//                     <span
//                       key={keyword}
//                       className="px-2 py-1 bg-gray-700 text-white rounded text-sm flex items-center gap-1"
//                     >
//                       {keyword}
//                       <button
//                         type="button"
//                         onClick={() => removeKeyword(keyword)}
//                         className="text-red-400 hover:text-red-300"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Navigation */}
//           <div className="flex justify-between pt-4">
//             <div className="flex gap-2">
//               {currentStep > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => setCurrentStep(currentStep - 1)}
//                   className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
//                 >
//                   Previous
//                 </button>
//               )}
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//             <div className="flex gap-2">
//               {currentStep < 3 ? (
//                 <button
//                   type="button"
//                   onClick={() => setCurrentStep(currentStep + 1)}
//                   disabled={currentStep === 1 && (!formData.name || !formData.url)}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
//                 >
//                   Next
//                 </button>
//               ) : (
//                 <button
//                   type="submit"
//                   disabled={loading || formData.events.length === 0}
//                   className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
//                 >
//                   {loading ? 'Creating...' : 'Create Webhook'}
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// };

// interface SetupStep {
//   title: string;
//   description: string;
//   image?: string;
//   code?: string;
// }

// const SetupGuideModal: React.FC<{
//   onClose: () => void;
//   selectedType: string;
// }> = ({ onClose, selectedType }) => {
//   const [activeTab, setActiveTab] = useState(selectedType || 'discord');

//   const guides = {
//     discord: {
//       title: 'Discord Webhook Setup',
//       icon: MessageSquare,
//       color: 'text-indigo-400',
//       steps: [
//         {
//           title: 'Open Discord Server Settings',
//           description: 'Go to your Discord server and click on the server name dropdown',
//           image: 'https://support.discord.com/hc/article_attachments/1500000463501/Screen_Shot_2020-12-15_at_4.51.38_PM.png'
//         },
//         {
//           title: 'Navigate to Integrations',
//           description: 'Click on "Server Settings" → "Integrations" → "Webhooks"',
//           image: 'https://support.discord.com/hc/article_attachments/360101553853/Screen_Shot_2020-12-15_at_4.51.38_PM.png'
//         },
//         {
//           title: 'Create New Webhook',
//           description: 'Click "Create Webhook" and choose the channel for notifications',
//           image: 'https://support.discord.com/hc/article_attachments/360101553853/Screen_Shot_2020-12-15_at_4.51.38_PM.png'
//         },
//         {
//           title: 'Copy Webhook URL',
//           description: 'Click "Copy Webhook URL" and paste it in the RedLead webhook form',
//           image: 'https://support.discord.com/hc/article_attachments/360101553853/Screen_Shot_2020-12-15_at_4.51.38_PM.png'
//         }
//       ] as SetupStep[]
//     },
//     slack: {
//       title: 'Slack Webhook Setup',
//       icon: Bell,
//       color: 'text-green-400',
//       steps: [
//         {
//           title: 'Create Slack App',
//           description: 'Go to api.slack.com/apps and create a new app',
//           image: 'https://a.slack-edge.com/80588/img/api/articles/incoming-webhooks/slack_app_incoming_webhooks.png'
//         },
//         {
//           title: 'Enable Incoming Webhooks',
//           description: 'In your app settings, enable "Incoming Webhooks"',
//           image: 'https://a.slack-edge.com/80588/img/api/articles/incoming-webhooks/slack_app_incoming_webhooks.png'
//         },
//         {
//           title: 'Add Webhook to Workspace',
//           description: 'Click "Add New Webhook to Workspace" and select a channel',
//           image: 'https://a.slack-edge.com/80588/img/api/articles/incoming-webhooks/slack_app_incoming_webhooks.png'
//         },
//         {
//           title: 'Copy Webhook URL',
//           description: 'Copy the webhook URL and paste it in RedLead',
//           image: 'https://a.slack-edge.com/80588/img/api/articles/incoming-webhooks/slack_app_incoming_webhooks.png'
//         }
//       ] as SetupStep[]
//     },
//     generic: {
//       title: 'Generic Webhook Setup',
//       icon: Globe,
//       color: 'text-gray-400',
//       steps: [
//         {
//           title: 'Prepare Your Endpoint',
//           description: 'Ensure your endpoint accepts POST requests with JSON data',
//           code: `
// POST /your-endpoint HTTP/1.1
// Content-Type: application/json

// {
//   "event": "lead.discovered",
//   "data": {
//     "title": "Looking for project management tools",
//     "opportunityScore": 85,
//     "author": "startup_founder",
//     "subreddit": "startups",
//     "url": "https://reddit.com/r/startups/...",
//     "intent": "solution_seeking"
//   },
//   "timestamp": 1643723400000,
//   "userId": "user_123",
//   "priority": "high"
// }
//           `
//         },
//         {
//           title: 'Set Up Authentication (Optional)',
//           description: 'If your endpoint requires authentication, ensure it\'s properly configured',
//           code: `
// // Example: API Key in header
// headers: {
//   'Authorization': 'Bearer your-api-key',
//   'Content-Type': 'application/json'
// }
//           `
//         },
//         {
//           title: 'Test Your Endpoint',
//           description: 'Use tools like Postman or curl to test your endpoint',
//           code: `
// curl -X POST https://your-domain.com/webhook \\
//   -H "Content-Type: application/json" \\
//   -d '{"event": "test", "data": {"message": "Hello World"}}'
//           `
//         },
//         {
//           title: 'Add URL to RedLead',
//           description: 'Copy your endpoint URL and add it to RedLead webhook configuration'
//         }
//       ] as SetupStep[]
//     }
//   };

//   const currentGuide = guides[activeTab as keyof typeof guides];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-white">Webhook Setup Guide</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white transition-colors"
//           >
//             ×
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-2 mb-6">
//           {Object.entries(guides).map(([key, guide]) => (
//             <button
//               key={key}
//               onClick={() => setActiveTab(key)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//                 activeTab === key
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//               }`}
//             >
//               <guide.icon className="w-4 h-4" />
//               {guide.title}
//             </button>
//           ))}
//         </div>

//         {/* Guide Content */}
//         <div className="space-y-6">
//           <div className="flex items-center gap-3">
//             <currentGuide.icon className={`w-8 h-8 ${currentGuide.color}`} />
//             <h3 className="text-xl font-semibold text-white">{currentGuide.title}</h3>
//           </div>

//           <div className="grid gap-6">
//             {currentGuide.steps.map((step, index) => (
//               <div key={index} className="flex gap-4">
//                 <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
//                   {index + 1}
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="text-lg font-semibold text-white mb-2">{step.title}</h4>
//                   <p className="text-gray-300 mb-3">{step.description}</p>
//                   {step.code && (
//                     <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
//                       <code>{step.code.trim()}</code>
//                     </pre>
//                   )}
//                   {step.image && (
//                     <img
//                       src={step.image}
//                       alt={step.title}
//                       className="rounded-lg border border-gray-600 max-w-full h-auto"
//                     />
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 pt-4 border-t border-gray-700">
//           <div className="flex justify-between items-center">
//             <div className="text-sm text-gray-400">
//               Need help? Contact our support team
//             </div>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
//             >
//               Got it!
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };