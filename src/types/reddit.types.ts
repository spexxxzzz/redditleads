// src/types/reddit.types.ts

export type LeadType = 'DIRECT_LEAD' | 'COMPETITOR_MENTION';

export interface RawLead {
    id: string;
    title: string;
    author: string;
    subreddit: string;
    url: string;
    body: string | null;
    createdAt: number; // UTC timestamp
    numComments?: number;
    upvoteRatio?: number;
    authorKarma?: number;
    type: LeadType;
    score?: number;
    commentCount?: number;
}

export interface EnrichedLead extends RawLead {
    intent?: string;
    opportunityScore?: number;
    isGoogleRanked?: boolean;
    summary?: string;
    relevanceReasoning?: string;
}