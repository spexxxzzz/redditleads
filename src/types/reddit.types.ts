// src/types/reddit.types.ts

export interface RawLead {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  body: string;
  createdAt: number;
  numComments: number;
  upvoteRatio: number;
  authorKarma: number; // Added this field for consistency
  type: 'DIRECT_LEAD' | 'COMPETITOR_MENTION';
}