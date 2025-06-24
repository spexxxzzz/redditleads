import { RequestHandler } from 'express';
import { findLeadsOnReddit } from '../services/reddit.service';

// To save leads, you would uncomment the following lines:
import { PrismaClient } from '../../generated/prisma';
import { calculateLeadScore } from '../services/scoring.service';
const prisma = new PrismaClient();

export const discoverLeads: RequestHandler = async (req, res, next) => {
    const { keywords, subreddits } = req.query;

    if (!keywords || typeof keywords !== 'string') {
        res.status(400).json({ message: 'Keywords are required as a comma-separated string in query params.' });
        // This plain 'return' satisfies the RequestHandler type (returns void)
        return;
    }
  
    // Because of the 'return' above, TypeScript now knows 'keywords' MUST be a string here.
    const keywordList = keywords.split(',').map(k => k.trim());
    const subredditsToSearch = (subreddits && typeof subreddits === 'string')
        ? subreddits.split(',').map(s => s.trim())
        : ['forhire', 'jobbit', 'freelance_for_hire'];  

    try {
         // 1. Fetch the enriched leads from Reddit
         const leads = await findLeadsOnReddit(keywordList, subredditsToSearch);

         // 2. Calculate a score for each lead and add it to the object
         const scoredLeads = leads.map(lead => ({
             ...lead,
             opportunityScore: calculateLeadScore(lead)
         }));
 
         // 3. Sort the leads by the new score in descending order
         const sortedLeads = scoredLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);
 
         // 4. Return the prioritized list
         res.status(200).json(sortedLeads);
    } catch (error) {
        next(error);
    }
};