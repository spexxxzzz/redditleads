import { PrismaClient } from '@prisma/client';
import { generateAIReplies, refineAIReply } from './ai.service';

const prisma = new PrismaClient();

export const generateReplyOptions = async (leadId: string): Promise<string[]> => {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            campaign: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!lead) {
        throw new Error('Lead not found.');
    }

    const subredditProfile = await prisma.subredditProfile.findUnique({
        where: { name: lead.subreddit }
    });

    const companyDescription = lead.campaign.generatedDescription;
    const cultureNotes = subredditProfile?.cultureNotes ?? "No specific culture notes available. Be generally respectful and helpful.";
    const rules = subredditProfile?.rules ?? ["No spam."];

    const replies = await generateAIReplies(
        lead.title,
        lead.body,
        companyDescription || "No company description available.",
        cultureNotes,
        rules
    );

    return replies;
};

export const refineReply = async (originalReply: string, instruction: string): Promise<string> => {
    if (!originalReply || !instruction) {
        throw new Error("Original reply and instruction are required.");
    }
    
    const refinedText = await refineAIReply(originalReply, instruction);

    return refinedText;
};