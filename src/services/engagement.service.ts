import { PrismaClient } from '@prisma/client';
import { generateAIReplies, refineAIReply } from './ai.service';

const prisma = new PrismaClient();

/**
 * Generates a set of AI-powered reply options for a specific lead.
 * It gathers all necessary context from the database to create high-quality, relevant responses.
 * @param leadId The ID of the lead to generate replies for.
 * @returns A promise that resolves to an array of reply strings.
 */
export const generateReplyOptions = async (leadId: string): Promise<string[]> => {
    // 1. Fetch all required data in parallel for efficiency
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            campaign: { // Include the campaign to get the company description
                include: {
                    user: true // We might need user info later
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

    // 2. Prepare the data for the AI
    const companyDescription = lead.campaign.description;
    // Provide graceful fallbacks if the subreddit profile hasn't been generated yet
    const cultureNotes = subredditProfile?.cultureNotes ?? "No specific culture notes available. Be generally respectful and helpful.";
    const rules = subredditProfile?.rules ?? ["No spam."];

    // 3. Call the AI service to get the reply options
    const replies = await generateAIReplies(
        lead.title,
        lead.body,
        companyDescription || "No company description available.",
        cultureNotes,
        rules
    );

    return replies;
};

/**
 * Takes an existing AI-generated reply and refines it based on a user's instruction.
 * @param originalReply The text of the reply the user wants to modify.
 * @param instruction A string describing the desired change (e.g., "make it more polite", "add a question").
 * @returns A promise that resolves to the newly refined reply string.
 */
export const refineReply = async (originalReply: string, instruction: string): Promise<string> => {
    if (!originalReply || !instruction) {
        throw new Error("Original reply and instruction are required.");
    }

    // This is a direct pass-through to the AI service, which handles the core logic.
    // This keeps our service layer clean and organized.
    const refinedText = await refineAIReply(originalReply, instruction);

    return refinedText;
};