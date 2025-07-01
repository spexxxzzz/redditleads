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

  // Lead endpoints - CORRECTED to match your actual backend
  getLeads: async (campaignId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/campaign/${campaignId}`);
    if (!response.ok) {
      console.error(`Failed to fetch leads for campaign ${campaignId}:`, response.status, response.statusText);
      throw new Error('Failed to fetch leads');
    }
    const result = await response.json();
    
    // Handle both direct array and paginated response
    return Array.isArray(result) ? result : result.data || [];
  },

  // Manual discovery
  runManualDiscovery: async (campaignId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/discover/manual/${campaignId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to run manual discovery');
    return response.json();
  },

  // Update lead status (we'll need this)
  updateLeadStatus: async (leadId: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update lead status');
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

  postReply: async (leadId: string, replyContent: string) => {
    const response = await fetch(`${API_BASE_URL}/api/engagement/post-reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, replyContent }),
    });
    if (!response.ok) throw new Error('Failed to post reply');
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

   
};

 