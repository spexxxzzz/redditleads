import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generates a list of keywords based on website text.
 */
export const generateKeywords = async (websiteText: string): Promise<string[]> => {
    const prompt = `Based on the following website text, Generate keywords that real Reddit users would naturally use in casual conversation, not technical marketing terms. Focus on problems people have and simple language    Return the list as a simple comma-separated string. Do not include any other text or explanation. Website Text: "${websiteText}"`;
    
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
/**
 * Analyzes a subreddit's rules and description to generate a summary of its culture.
 * @param description The public description or sidebar text of the subreddit.
 * @param rules An array of the subreddit's official rules.
 * @returns A promise that resolves to a string containing the AI-generated cultural notes.
 */
export const generateCultureNotes = async (description: string, rules: string[]): Promise<string> => {
    const rulesText = rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');
    const prompt = `You are a Reddit community analyst. Based on the following subreddit description and rules, provide a brief, one-paragraph summary of the community's culture and posting etiquette. Focus on the general vibe (e.g., "highly technical," "meme-friendly," "strictly moderated") and what a new user should know before posting.

Subreddit Description:
"${description}"

Subreddit Rules:
"${rulesText}"

Cultural Summary:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};


/**
 * Generates multiple, context-aware reply options for a given lead.
 * @param leadTitle The title of the lead's post.
 * @param leadBody The body of the lead's post.
 * @param companyDescription A description of the user's company/product.
 * @param subredditCultureNotes The AI-generated notes about the subreddit's culture.
 * @param subredditRules The official rules of the subreddit.
 * @returns A promise that resolves to an array of 3-5 distinct reply options.
 */
export const generateAIReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string,
    subredditCultureNotes: string,
    subredditRules: string[]
): Promise<string[]> => {
    const rulesText = subredditRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');

    const prompt = `
You are a world-class Reddit marketing expert who specializes in subtle, helpful, and non-spammy engagement. Your primary goal is to be helpful to the user first, and promotional second.

**Your Task:**
Generate 3 distinct, high-quality response options to the following Reddit post.

**Context:**
1.  **The Lead's Post:**
    *   Title: "${leadTitle}"
    *   Body: "${leadBody}"

2.  **My Product/Company:**
    *   Description: "${companyDescription}"

3.  **Subreddit Intelligence (CRITICAL):**
    *   Culture & Vibe: "${subredditCultureNotes}"
    *   Rules to Follow:
${rulesText}

**Instructions for Replies:**
-   Acknowledge the user's post directly.
-   Subtly connect their need to a feature of "My Product/Company".
-   Adhere strictly to the subreddit's culture and rules. If the culture is technical, be technical. If it's casual, be casual.
-   Do NOT use corporate jargon or sound like a press release.
-   Each reply option should have a slightly different tone (e.g., one purely helpful, one more direct, one asking a question).
-   Return the response as a JSON array of strings. Example: ["Response 1", "Response 2", "Response 3"]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up the response and parse it as JSON
    try {
        // The AI might wrap the JSON in markdown backticks, so we remove them.
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Failed to parse AI response as JSON:", responseText);
        // Fallback: return an error message as a single option
        return ["Sorry, I couldn't generate a valid response. Please try again."];
    }
};
/**
 * Refines a given text based on a specific instruction.
 * @param originalText The AI-generated reply that the user wants to change.
 * @param instruction The user's command (e.g., "make it shorter", "be more polite").
 * @returns A promise that resolves to the refined text.
 */
export const refineAIReply = async (originalText: string, instruction: string): Promise<string> => {
    const prompt = `
You are a text editing assistant. Your task is to rewrite the following text based on the user's instruction.
Do not add any commentary or explanation. Only return the refined text.

**Original Text:**
"${originalText}"

**User's Instruction:**
"${instruction}"

**Refined Text:**`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

export const analyzeLeadIntent = async (title: string, body: string | null): Promise<string> => {
    const prompt = `Analyze the following Reddit post for user intent. Classify it as 'pain_point', 'solution_seeking', 'brand_comparison', or 'general_discussion'. Return only the single classification. Post Title: "${title}". Post Body: "${body}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
};

/**
 * Analyzes a Reddit post that mentions a competitor to determine the sentiment.
 * @param title The title of the post.
 * @param body The body of the post.
 * @returns A promise that resolves to 'positive', 'negative', or 'neutral'.
 */
export const analyzeSentiment = async (title: string, body: string | null): Promise<string> => {
    const prompt = `Analyze the sentiment of the following Reddit post. Is the user expressing a 'positive', 'negative', or 'neutral' opinion? Return only the single classification. Post Title: "${title}". Post Body: "${body}"`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim().toLowerCase();
};

/**
 * Discovers potential competitor products or companies mentioned in a text.
 * @param text The text of the Reddit post or comment to analyze.
 * @param ownProductDescription A description of the user's own product for context.
 * @returns A promise that resolves to an array of discovered competitor names.
 */
export const discoverCompetitorsInText = async (text: string, ownProductDescription: string): Promise<string[]> => {
    const prompt = `
You are a market intelligence analyst. Your task is to identify potential competitor products or companies mentioned in the provided text.

**My Product:**
"${ownProductDescription}"

**Text to Analyze:**
"${text}"

Based on my product description, analyze the text and extract the names of any other products or companies mentioned that seem to be in a similar market.
Return the list as a simple JSON array of strings. Example: ["Competitor A", "Product B"]. If no competitors are found, return an empty array [].
`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json\n?|\n?```/g, '');
    try {
        const competitors = JSON.parse(responseText);
        return Array.isArray(competitors) ? competitors : [];
    } catch {
        return []; // Return empty array if parsing fails
    }
};