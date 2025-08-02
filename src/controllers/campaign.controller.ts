import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetches all campaigns for the currently authenticated user
 */
export const getCampaignsForUser: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk
    const { userId } = req.auth;

    // Ensure the user is authenticated
    if (!userId) {
         res.status(401).json({ message: 'User not authenticated.' });
         return;
    }

    try {
        const campaigns = await prisma.campaign.findMany({
            where: { userId }, // Use the authenticated userId
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        next(error);
    }
};

/**
 * Fetches a specific campaign by ID, ensuring it belongs to the authenticated user
 */
export const getCampaignById: RequestHandler = async (req: any, res, next) => {
    // Get the authenticated user's ID from Clerk
    const { userId } = req.auth;
    const { campaignId } = req.params;

    // Ensure the user is authenticated
    if (!userId) {
         res.status(401).json({ message: 'User not authenticated.' });
         return
    }

    if (!campaignId) {
         res.status(400).json({ message: 'Campaign ID is required.' });
         return
    }

    try {
        const campaign = await prisma.campaign.findUnique({
            // Secure the query by checking for both campaignId AND userId
            where: { 
                id: campaignId,
                userId: userId 
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        plan: true,
                        subscriptionStatus: true
                    }
                },
                _count: {
                    select: {
                        leads: true
                    }
                }
            }
        });

        if (!campaign) {
            // Return 404 whether the campaign doesn't exist or doesn't belong to the user
            // This prevents leaking information about the existence of campaigns.
             res.status(404).json({ message: 'Campaign not found.' });
             return
        }

        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        next(error);
    }
};


export const updateCampaignById : RequestHandler = async (req : any, res, next) =>{
    const {userId} = req.auth;
    const {campaignId} = req.params;
    const {generatedDescription,
        generatedKeywords,
        targetSubreddits,
        competitors,
        name} = req.body;
     if(!userId){
        res.status(401).json({message : "theres no user id, gng"})
        return;
     }

     if(!campaignId){
        res.status(401).json({message :"chat, please lemme know your campaign id, or sybau"})
        return;
     }
      const updatedCampaign = await prisma.campaign.update({
            where : { id : campaignId},
            data : {
                 generatedDescription,
                 generatedKeywords,
                 targetSubreddits,
                 competitors,
                 name,
            }

      })
      return updatedCampaign;

}

export const deleteCampaignById : RequestHandler = async(req: any, res, next) =>{
     const {userId} = req.auth;
     const campaignId = req.params;

     if(!userId){
        res.status(200).json()
     }
      
    prisma.campaign.delete({
        where: {
            id : campaignId,
            userId : userId,
        }
    })

    res.status(200).json({message :  "yo chat, deleted your campaign, happy now??? ts pmo icl whyd you delete your campaign"})
  return;

}


