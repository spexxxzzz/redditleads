// This interface now serves as the single source of truth for what a Lead object looks like.
export interface Lead {
    id: string;
    title: string;
    author: string;
    subreddit: string;
    url: string;
    body: string;
    createdAt: number;
    postedAt: string | number; // Add postedAt property
    numComments: number;
    upvoteRatio: number;
    intent: string;
    summary?: string | null;
    opportunityScore: number;
    semanticScore?: number; // Add semanticScore property
    isGoogleRanked?: boolean; // Add isGoogleRanked property
    // This is the correct, specific type for the lead's status.
    status?: "new" | "replied" | "saved" | "ignored" | undefined;
  }
  
  // Interface for a Project
  export interface Project {
    id: string;
    name: string;
    userId: string;
    analyzedUrl: string;
    generatedKeywords: string[];
    generatedDescription: string;
    targetSubreddits: string[];
    competitors: string[];
    createdAt: string;
    _count?: {
      leads: number;
    };
  }