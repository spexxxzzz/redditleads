import { Lead } from '@/types';

export interface LeadBatchingOptions {
  maxLeadsPerSession: number;
  userRemainingLeads: number;
  showDiversity: boolean;
}

export interface LeadBatchingResult {
  filteredLeads: Lead[];
  totalFound: number;
  showingCount: number;
  remainingAfterSession: number;
  diversityInfo: {
    subreddits: string[];
    postTypes: string[];
  };
}

/**
 * Smart lead batching system that filters and sorts leads for optimal user experience
 */
export function batchLeadsForSession(
  allLeads: Lead[],
  options: LeadBatchingOptions
): LeadBatchingResult {
  const { maxLeadsPerSession, userRemainingLeads, showDiversity } = options;
  
  // Calculate how many leads we can actually show
  // Always show at least 10 leads if available, regardless of quota
  const minLeadsToShow = 10;
  const maxLeadsToShow = Math.max(minLeadsToShow, Math.min(maxLeadsPerSession, userRemainingLeads));
  
  if (allLeads.length === 0) {
    return {
      filteredLeads: [],
      totalFound: 0,
      showingCount: 0,
      remainingAfterSession: userRemainingLeads,
      diversityInfo: { subreddits: [], postTypes: [] }
    };
  }

  // Step 1: Sort leads by combined relevance score
  const sortedLeads = sortLeadsByRelevance(allLeads);
  
  // Step 2: Apply diversity filtering if enabled
  const diverseLeads = showDiversity 
    ? ensureDiversity(sortedLeads, maxLeadsToShow)
    : sortedLeads.slice(0, maxLeadsToShow);
  
  // Step 3: Final filtering to respect user limits
  const finalLeads = diverseLeads.slice(0, maxLeadsToShow);
  
  // Calculate diversity info
  const diversityInfo = calculateDiversityInfo(finalLeads);
  
  return {
    filteredLeads: finalLeads,
    totalFound: allLeads.length,
    showingCount: finalLeads.length,
    remainingAfterSession: userRemainingLeads - finalLeads.length,
    diversityInfo
  };
}

/**
 * Sort leads by combined relevance score (opportunityScore + semanticScore)
 */
function sortLeadsByRelevance(leads: Lead[]): Lead[] {
  return leads.sort((a, b) => {
    // Calculate combined score for each lead
    const scoreA = calculateCombinedScore(a);
    const scoreB = calculateCombinedScore(b);
    
    // Sort in descending order (highest scores first)
    return scoreB - scoreA;
  });
}

/**
 * Calculate combined relevance score for a lead
 */
function calculateCombinedScore(lead: Lead): number {
  const opportunityScore = lead.opportunityScore || 0;
  const semanticScore = lead.semanticScore || 0;
  
  // Weighted combination: 60% opportunity, 40% semantic
  // This prioritizes business potential while maintaining relevance
  const combinedScore = (opportunityScore * 0.6) + (semanticScore * 0.4);
  
  // Add bonus for recent posts (within last 7 days)
  const postAge = Date.now() - new Date(lead.postedAt).getTime();
  const daysSincePost = postAge / (1000 * 60 * 60 * 24);
  const recencyBonus = daysSincePost <= 7 ? 0.1 : 0;
  
  return combinedScore + recencyBonus;
}

/**
 * Ensure diversity across subreddits and post types
 */
function ensureDiversity(leads: Lead[], maxCount: number): Lead[] {
  const diverseLeads: Lead[] = [];
  const usedSubreddits = new Set<string>();
  const usedPostTypes = new Set<string>();
  
  // First pass: Add leads from different subreddits
  for (const lead of leads) {
    if (diverseLeads.length >= maxCount) break;
    
    const subreddit = lead.subreddit.toLowerCase();
    const postType = getPostType(lead);
    
    // Prioritize leads from new subreddits
    if (!usedSubreddits.has(subreddit)) {
      diverseLeads.push(lead);
      usedSubreddits.add(subreddit);
      usedPostTypes.add(postType);
    }
  }
  
  // Second pass: Fill remaining slots with best remaining leads
  for (const lead of leads) {
    if (diverseLeads.length >= maxCount) break;
    
    if (!diverseLeads.includes(lead)) {
      diverseLeads.push(lead);
    }
  }
  
  return diverseLeads;
}

/**
 * Determine post type based on lead content
 */
function getPostType(lead: Lead): string {
  const title = lead.title.toLowerCase();
  const body = lead.body.toLowerCase();
  
  if (title.includes('looking for') || title.includes('need') || title.includes('want')) {
    return 'request';
  } else if (title.includes('recommend') || title.includes('suggest') || title.includes('advice')) {
    return 'recommendation';
  } else if (title.includes('review') || title.includes('experience') || title.includes('thoughts')) {
    return 'review';
  } else if (title.includes('question') || title.includes('?')) {
    return 'question';
  } else {
    return 'discussion';
  }
}

/**
 * Calculate diversity information for the selected leads
 */
function calculateDiversityInfo(leads: Lead[]): {
  subreddits: string[];
  postTypes: string[];
} {
  const subreddits = [...new Set(leads.map(lead => lead.subreddit))];
  const postTypes = [...new Set(leads.map(lead => getPostType(lead)))];
  
  return { subreddits, postTypes };
}

/**
 * Get user-friendly message about lead batching
 */
export function getLeadBatchingMessage(result: LeadBatchingResult, userPlan: string): string {
  const { showingCount, totalFound, remainingAfterSession } = result;
  const { subreddits, postTypes } = result.diversityInfo;
  
  let message = `Showing ${showingCount} of ${totalFound} leads found`;
  
  if (remainingAfterSession < 0) {
    message += ` (quota exceeded - showing best leads anyway)`;
  } else if (remainingAfterSession < 10) {
    message += ` (${remainingAfterSession} leads remaining in your ${userPlan} plan)`;
  }
  
  if (subreddits.length > 1) {
    message += ` from ${subreddits.length} different subreddits`;
  }
  
  if (postTypes.length > 1) {
    message += ` (${postTypes.join(', ')} posts)`;
  }
  
  return message;
}
