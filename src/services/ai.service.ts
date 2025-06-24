import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generates a list of keywords based on website text.
 */
export const generateKeywords = async (websiteText: string): Promise<string[]> => {
    const prompt = `Based on the following website text, generate a list of 15 relevant, high-intent keywords that potential customers might search for. Return the list as a simple comma-separated string. Do not include any other text or explanation. Website Text: "${websiteText}"`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text.split(',').map(k => k.trim());
};

/**
 * Generates a company description based on website text.
 */
export const generateDescription = async (websiteText: string): Promise<string> => {
    const prompt = `You are a marketing expert. Based on the following website text, write a compelling, one-paragraph company description. Website Text: "${websiteText}"`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
};


/**
 * Generates a list of relevant subreddit suggestions based on a business description.
 */
export const generateSubredditSuggestions = async (businessDescription: string): Promise<string[]> => {
    const prompt = `You are a Reddit marketing expert. Based on the following business description, recommend a list of 10 to 15 relevant subreddits where potential customers or interested users might be found. Include a mix of large, general subreddits and smaller, niche ones. Return the list as a simple comma-separated string of just the subreddit names (e.g., "gaming,playtoearn,web3"). Do not include "r/" or any other text. Business Description: "${businessDescription}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response and return as an array
    return text.split(',').map(s => s.trim()).filter(s => s); // filter(s => s) removes any empty strings
};

export const analyzeLeadIntent = async (title: string, body: string | null): Promise<string> => {
    const prompt = `Analyze the following Reddit post for user intent. Classify it as 'pain_point', 'solution_seeking', 'brand_comparison', or 'general_discussion'. Return only the single classification. Post Title: "${title}". Post Body: "${body}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};