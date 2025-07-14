const API_BASE_URL = 'http://localhost:5000';

export const api = {
  // Campaign endpoints
  getCampaigns: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  getCampaign: async (campaignId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}`);
    if (!response.ok) throw new Error('Failed to fetch campaign');
    return response.json();
  },
  generateSummary: async (leadId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/summarize`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to generate summary');
    return response.json();
  },
  updateLeadStatus: async (leadId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update lead status');
    return response.json();
  },
  // Lead endpoints - CORRECTED to match your actual backend
  getLeads: async (campaignId: string, params: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/leads/campaign/${campaignId}?${query}`);
    if (!response.ok) throw new Error('Failed to fetch leads');
    const result = await response.json();
    return result; // The backend now returns the full paginated object
  },

  // Manual discovery
  runManualDiscovery: async (campaignId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/discover/manual/${campaignId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to run manual discovery');
    return response.json();
  },

  // Engagement endpoints
  generateReply: async (leadId: string, context: string) => {
    const response = await fetch(`${API_BASE_URL}/api/engagement/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, context }),
    });
    if (!response.ok) throw new Error('Failed to generate reply');
    return response.json();
  },

  postReply: async (leadId: string, replyContent: string, userId?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/engagement/post-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'x-user-id': userId } : {})
      },
      body: JSON.stringify({ leadId, content: replyContent }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to post reply');
    }
    return response.json();
  },
  refineReply: async (originalReply: string, instruction: string) => {
    const response = await fetch(`${API_BASE_URL}/api/engagement/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalReply, instruction }),
    });
    if (!response.ok) throw new Error('Failed to refine reply');
    return response.json();
  },
  getMarketInsights: async (campaignId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/insights/campaign/${campaignId}`);
    if (!response.ok) throw new Error('Failed to fetch market insights');
    return response.json();
  },

  updateInsightStatus: async (insightId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/insights/${insightId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update insight status');
    return response.json();
  },

  addCompetitorToCampaign: async (insightId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/insights/${insightId}/add-competitor`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to add competitor to campaign');
    return response.json();
  },

  // Performance Analytics endpoints
  getReplyPerformance: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/performance/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch reply performance');
    return response.json();
  },

  getReplyDetails: async (replyId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/performance/reply/${replyId}`);
    if (!response.ok) throw new Error('Failed to fetch reply details');
    return response.json();
  },

  // User management
  getUser: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // Reddit authentication
  getRedditAuthUrl: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/reddit/auth/${userId}`);
    if (!response.ok) throw new Error('Failed to get Reddit auth URL');
    return response.json();
  },

  disconnectReddit: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/reddit/disconnect/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to disconnect Reddit account');
    return response.json();
  },

  // Google/Gmail authentication
  getGoogleAuthUrl: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/google/auth/${userId}`);
    if (!response.ok) throw new Error('Failed to get Google auth URL');
    return response.json();
  },

  disconnectGoogle: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/google/disconnect/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to disconnect Google account');
    return response.json();
  },
  
    // Enhanced webhook endpoints
    createWebhook: async (userId: string, webhookData: any) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });
      if (!response.ok) throw new Error('Failed to create webhook');
      return response.json();
    },
  
    getWebhooks: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return response.json();
    },
  
    getWebhookStats: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/user/${userId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch webhook stats');
      return response.json();
    },
  
    updateWebhook: async (webhookId: string, updates: any) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/${webhookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update webhook');
      return response.json();
    },
  
    deleteWebhook: async (webhookId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete webhook');
      return response.json();
    },
  
    testWebhook: async (webhookId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/webhooks/${webhookId}/test`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to test webhook');
      return response.json();
    },

};