import { GoogleGenerativeAI } from '@google/generative-ai';
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { AIUsageService } from './aitracking.service';
import { getAppAuthenticatedInstance } from './reddit.service';

const prisma = new PrismaClient();

// --- In-memory cache for AI responses ---
const aiCache = new Map<string, any>();

// --- OPTIMIZED: Centralized AI Provider Configuration with CHEAPEST Models ---
const aiProviders = [
    {
        name: 'Gemini',
        generate: async function(prompt: string): Promise<string> {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("Gemini API key is not set in .env file.");
            }
            const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Using gemini-1.5-flash - cheapest and fastest model
            const model = client.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    maxOutputTokens: 500, // Limit tokens to reduce cost
                    temperature: 0.3, // Lower temperature for more focused responses
                }
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    },
    {
        name: 'Perplexity',
        generate: async function(prompt: string): Promise<string> {
            if (!process.env.PERPLEXITY_API_KEY) {
                throw new Error("Perplexity API key is not set in .env file.");
            }

            const { text } = await generateText({
                model: perplexity('sonar'), // Cheapest Perplexity model (not sonar-pro)
                prompt: prompt,
                temperature: 0.3, // Lower temperature for cost efficiency
                maxTokens: 500, // Limit tokens to reduce cost
            });

            return text;
        }
    },
    {
        name: 'OpenAI',
        generate: async function(prompt: string): Promise<string> {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("OpenAI API key is not set in .env file.");
            }
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            // UPDATED: Use a model version that guarantees JSON mode support and enable it.
            const response = await client.chat.completions.create({
                model: 'gpt-3.5-turbo-1106',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }, // Enforce JSON output
                temperature: 0.3,
                max_tokens: 500,
                frequency_penalty: 0.1,
                presence_penalty: 0.1,
            });
            return response.choices[0]?.message?.content ?? "";
        }
    }
];

/**
 * Smart Fallback Function with Enhanced Caching and Optimization
 */
const generateContentWithFallback = async (prompt: string): Promise<string> => {
    // Enhanced cache key with prompt hash for better caching
    const cacheKey = `ai_response:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;

    // Check cache first to avoid API calls
    if (aiCache.has(cacheKey)) {
        console.log('[CACHE HIT] Returning cached AI response');
        return aiCache.get(cacheKey);
    }

    let lastError: Error | null = null;
    for (const provider of aiProviders) {
        try {
            console.log(`[AI Service] Attempting to use ${provider.name}...`);
            const text = await provider.generate(prompt);

            if (!text) {
                throw new Error("Received an empty response from the API.");
            }

            console.log(`[AI Service] Successfully received response from ${provider.name}.`);

            // Cache the successful response
            aiCache.set(cacheKey, text);

            return text;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("An unknown error occurred");
            console.error(`[AI Service] ${provider.name} failed:`, lastError.message);
        }
    }

    throw new Error(`All AI services are currently unavailable. Last error: ${lastError?.message}`);
};

/**
 * OPTIMIZED: Generates verified subreddit suggestions with cost optimization
 */
export const generateSubredditSuggestions = async (businessDescription: string): Promise<string[]> => {
    console.log('[Subreddit Suggestions] Starting process...');
    const cacheKey = `verified_subreddits_v4:${businessDescription.slice(0, 200)}`;

    if (aiCache.has(cacheKey)) {
        console.log('[CACHE HIT] for verified subreddit suggestions.');
        return aiCache.get(cacheKey);
    }

    // Optimized prompt - shorter and more direct to reduce token usage
    const prompt = `List 15-20 subreddits for this business. Return only subreddit names, comma-separated, no "r/" prefix: "${businessDescription.slice(0, 300)}"`;

    const rawText = await generateContentWithFallback(prompt);
    const candidateSubreddits = rawText.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20); // Limit to 20 max
    console.log(`[Subreddit Suggestions] AI suggested ${candidateSubreddits.length} candidates.`);

    const snoowrap = await getAppAuthenticatedInstance();
    const verificationPromises = candidateSubreddits.map(async (name) => {
        try {
            //@ts-expect-error
            await snoowrap.getSubreddit(name).fetch();
            return name;
        } catch (error) {
            return null;
        }
    });

    const results = await Promise.all(verificationPromises);
    const finalSubreddits = results.filter((name): name is string => name !== null);

    console.log(`[Subreddit Suggestions] Verified ${finalSubreddits.length} real subreddits.`);

    // Cache with expiration (24 hours)
    aiCache.set(cacheKey, finalSubreddits);
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);

    return finalSubreddits;
};

/**
 * OPTIMIZED: Generates keywords with reduced token usage
 */
export const generateKeywords = async (websiteText: string): Promise<string[]> => {
    const cacheKey = `keywords_v2:${websiteText.slice(0, 200)}`;
    if (aiCache.has(cacheKey)) {
        console.log(`[CACHE HIT] for keywords.`);
        return aiCache.get(cacheKey);
    }

    // Shortened prompt and input text to reduce costs
    const truncatedText = websiteText.slice(0, 500); // Limit input size
    const prompt = `Extract casual Reddit keywords from: "${truncatedText}". Return comma-separated list only.`;

    const text = await generateContentWithFallback(prompt);
    const keywords = text.split(',').map(k => k.trim()).filter(Boolean).slice(0, 15); // Limit to 15 keywords

    aiCache.set(cacheKey, keywords);
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);

    return keywords;
};

/**
 * OPTIMIZED: Generates company description with cost efficiency
 */
export const generateDescription = async (websiteText: string): Promise<string> => {
    const cacheKey = `description_v2:${websiteText.slice(0, 200)}`;
    if (aiCache.has(cacheKey)) {
        console.log(`[CACHE HIT] for description.`);
        return aiCache.get(cacheKey);
    }

    // Shortened input and prompt
    const truncatedText = websiteText.slice(0, 400);
    const prompt = `Write a 2-sentence company description for: "${truncatedText}"`;

    const description = await generateContentWithFallback(prompt);

    aiCache.set(cacheKey, description);
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);

    return description;
};

/**
 * OPTIMIZED: Generates culture notes with minimal token usage
 */
export const generateCultureNotes = async (description: string, rules: string[]): Promise<string> => {
    const cacheKey = `culture_v2:${description.slice(0, 100)}:${rules.join(',').slice(0, 100)}`;
    if (aiCache.has(cacheKey)) {
        console.log(`[CACHE HIT] for culture notes.`);
        return aiCache.get(cacheKey);
    }

    // Limit rules and description length
    const limitedRules = rules.slice(0, 5).map((rule, index) => `${index + 1}. ${rule.slice(0, 100)}`).join('\n');
    const limitedDescription = description.slice(0, 200);

    const prompt = `Summarize subreddit culture in 1 paragraph. Description: "${limitedDescription}" Rules: "${limitedRules}"`;

    const cultureNotes = await generateContentWithFallback(prompt);

    aiCache.set(cacheKey, cultureNotes.trim());
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);

    return cultureNotes.trim();
};

/**
 * REFINED: Generates high-quality, contextual AI replies.
 */
export const generateAIReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string,
    subredditCultureNotes: string,
    subredditRules: string[]
): Promise<string[]> => {
    // Truncate inputs to reduce token usage
    const truncatedTitle = leadTitle.slice(0, 250);
    const truncatedBody = (leadBody || '').slice(0, 400);
    const truncatedDescription = companyDescription.slice(0, 250);
    const truncatedCulture = subredditCultureNotes.slice(0, 200);
    const limitedRules = subredditRules.slice(0, 4).map(rule => rule.slice(0, 70));

    // UPDATED: Prompt now asks for a JSON object to work with OpenAI's JSON mode.
    const prompt = `You are an expert Reddit commenter. Your goal is to write 3 helpful and natural-sounding replies to a Reddit post. You must sound like a real person, not a corporate bot.

**The Post:**
* **Title:** "${truncatedTitle}"
* **Body:** "${truncatedBody}"

**Your Product:**
* **Description:** "${truncatedDescription}"

**Subreddit Context:**
* **Culture:** "${truncatedCulture}"
* **Key Rules to Follow:** ${limitedRules.join('; ')}

**Your Task:**
Generate 3 distinct replies. Each reply MUST:
1.  **Be Helpful First:** Directly address the user's question or problem in the post. Provide value.
2.  **Sound Human:** Use a casual, conversational tone. Use "I" or "we" naturally.
3.  **Subtly Promote:** After being helpful, you can *casually* mention how your product might be a good fit. Don't be pushy. Frame it as a friendly suggestion. For example: "Oh, and for something like this, I've had good luck with [Your Product]. It's pretty good at [solving the specific problem]." or "Full disclosure, I'm part of the team behind [Your Product], but it might be genuinely useful for you here because..."
4.  **Respect the Rules:** Your reply must not violate the subreddit rules.
5.  **Vary the Style:** Create three different styles of replies (e.g., one very direct, one more story-based, one more inquisitive).

**Bad Reply (What NOT to do):**
"Check out our amazing product! It solves all your problems. Buy now at [link]!"

**Good Reply (Example to follow):**
"Hey, that's a tough spot to be in. I've dealt with [similar problem] before and found that [helpful advice]. It took a bit of tweaking but worked out. On a related note, you might find [Your Product] helpful for the [specific task] part of it. It's designed to make that a bit easier. Hope this helps!"

**Output:**
Return ONLY a valid JSON object with a single key "replies" which contains an array of 3 strings. Example: {"replies": ["reply1", "reply2", "reply3"]}. Do not include any other text, markdown, or explanations.`;

    const responseText = await generateContentWithFallback(prompt);

    try {
        // UPDATED: More robust logic to find and parse the JSON object from the response string.
        const startIndex = responseText.indexOf('{');
        const endIndex = responseText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error("AI response did not contain a valid JSON object.");
        }

        const jsonString = responseText.substring(startIndex, endIndex + 1);
        const responseObject = JSON.parse(jsonString);
        const replies = responseObject.replies;

        if (!Array.isArray(replies)) {
            throw new Error("AI response did not contain a 'replies' array.");
        }
        return replies.slice(0, 3);
    } catch (error) {
        console.error("Failed to parse AI response as JSON:", responseText, error);

        // UPDATED: Fallback message is more graceful if the description is missing.
        let fallbackDescription = `we're building a tool that helps with this`;
        if (truncatedDescription && truncatedDescription !== "No description available.") {
            fallbackDescription = `we're building a tool (${truncatedDescription}) that helps with this`;
        }
        return [`I saw you were asking about "${truncatedTitle}". I might have some ideas, but could you clarify a bit more on what you've tried so far? Also, ${fallbackDescription}, but I want to make sure it's a good fit before recommending.`];
    }
};

/**
 * OPTIMIZED: Refines AI reply with minimal tokens
 */
export const refineAIReply = async (originalText: string, instruction: string): Promise<string> => {
    const truncatedText = originalText.slice(0, 300);
    const truncatedInstruction = instruction.slice(0, 100);

    const prompt = `Rewrite: "${truncatedText}"
Instruction: "${truncatedInstruction}"
New version:`;

    const refinedText = await generateContentWithFallback(prompt);
    return refinedText.trim();
};

/**
 * OPTIMIZED: Discovers competitors with cost efficiency
 */
export const discoverCompetitorsInText = async (text: string, ownProductDescription: string): Promise<string[]> => {
    const cacheKey = `competitors_v2:${text.slice(0, 200)}:${ownProductDescription.slice(0, 100)}`;
    if (aiCache.has(cacheKey)) {
        console.log(`[CACHE HIT] for competitor discovery.`);
        return aiCache.get(cacheKey);
    }

    const truncatedText = text.slice(0, 400);
    const truncatedProduct = ownProductDescription.slice(0, 150);

    const prompt = `Find competitors in text. My product: "${truncatedProduct}" Text: "${truncatedText}" Return JSON array of competitor names or [].`;

    const responseText = await generateContentWithFallback(prompt);
    try {
        // Use the more robust JSON extraction method
        const jsonString = responseText.match(/\[.*\]/s)?.[0] || responseText;
        const competitors = JSON.parse(jsonString);
        const competitorList = Array.isArray(competitors) ? competitors.slice(0, 5) : [];

        aiCache.set(cacheKey, competitorList);
        setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);

        return competitorList;
    } catch {
        return [];
    }
};

/**
 * OPTIMIZED: Generate reply options with usage tracking
 */
export const generateReplyOptions = async (leadId: string): Promise<string[]> => {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
            campaign: {
                include: { user: true }
            }
        }
    });

    if (!lead) {
        throw new Error('Lead not found.');
    }

    const user = lead.campaign.user;
    const aiUsage = AIUsageService.getInstance();

    const canUseAI = await aiUsage.trackAIUsage(user.id, 'manual_discovery', user.plan);
    if (!canUseAI) {
        throw new Error('AI reply quota exceeded. Upgrade your plan or wait for next month.');
    }

    const subredditProfile = await prisma.subredditProfile.findUnique({
        where: { name: lead.subreddit }
    });

    const companyDescription = lead.campaign.generatedDescription || "No description available.";
    const cultureNotes = subredditProfile?.cultureNotes ?? "Be respectful and helpful.";
    const rules = subredditProfile?.rules ?? ["No spam."];

    return await generateAIReplies(
        lead.title,
        lead.body,
        companyDescription,
        cultureNotes,
        rules
    );
};

/**
 * OPTIMIZED: Fun replies with cost efficiency
 */
export const generateFunReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string
): Promise<string[]> => {
    const truncatedTitle = leadTitle.slice(0, 100);
    const truncatedBody = (leadBody || '').slice(0, 200);
    const truncatedDescription = companyDescription.slice(0, 150);

    const prompt = `Create 3 funny promotional replies for unrelated post:
Title: "${truncatedTitle}"
Body: "${truncatedBody}"
Product: "${truncatedDescription}"
Return JSON: ["funny reply 1", "funny reply 2", "funny reply 3"]`;

    const responseText = await generateContentWithFallback(prompt);

    try {
        // Use the more robust JSON extraction method
        const jsonString = responseText.match(/\[.*\]/s)?.[0] || responseText;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse AI response as JSON:", responseText);
        return [
            `I have no idea what "${truncatedTitle}" is about, but have you heard of our amazing product? You should totally check it out!`
        ];
    }
};

/**
 * OPTIMIZED: Analyze lead intent with basic fallback
 */
export const analyzeLeadIntent = async (title: string, body: string | null, userId: string, userPlan: string): Promise<string> => {
    const aiUsage = AIUsageService.getInstance();
    const canUseAI = await aiUsage.trackAIUsage(userId, 'intent', userPlan);

    if (!canUseAI) {
        return determineBasicIntent(title, body);
    }

    const truncatedTitle = title.slice(0, 100);
    const truncatedBody = (body || '').slice(0, 200);

    const prompt = `Classify intent as: pain_point, solution_seeking, brand_comparison, or general_discussion. Title: "${truncatedTitle}" Body: "${truncatedBody}"`;

    const intent = await generateContentWithFallback(prompt);
    return intent.trim().toLowerCase();
};

function determineBasicIntent(title: string, body: string | null): string {
    const text = `${title} ${body || ''}`.toLowerCase();
    if (text.includes('help') || text.includes('recommend') || text.includes('suggest') || text.includes('looking for')) {
        return 'solution_seeking';
    }
    if (text.includes('vs') || text.includes('better than') || text.includes('alternative') || text.includes('compare')) {
        return 'brand_comparison';
    }
    if (text.includes('problem') || text.includes('issue') || text.includes('struggling') || text.includes('broken')) {
        return 'pain_point';
    }
    return 'general_discussion';
}

/**
 * OPTIMIZED: Analyze sentiment with basic fallback
 */
export const analyzeSentiment = async (title: string, body: string | null, userId: string, userPlan: string): Promise<string> => {
    const aiUsage = AIUsageService.getInstance();
    const canUseAI = await aiUsage.trackAIUsage(userId, 'competitor', userPlan);

    if (!canUseAI) {
        return determineBasicSentiment(title, body);
    }

    const truncatedTitle = title.slice(0, 100);
    const truncatedBody = (body || '').slice(0, 200);

    const prompt = `Classify sentiment as: positive, negative, or neutral. Title: "${truncatedTitle}" Body: "${truncatedBody}"`;

    const sentiment = await generateContentWithFallback(prompt);
    return sentiment.trim().toLowerCase();
};

function determineBasicSentiment(title: string, body: string | null): string {
    const text = `${title} ${body || ''}`.toLowerCase();
    const positiveWords = ['love', 'great', 'awesome', 'excellent', 'amazing', 'perfect', 'good', 'best', 'fantastic'];
    const negativeWords = ['hate', 'terrible', 'awful', 'bad', 'worst', 'sucks', 'broken', 'useless', 'disappointed'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

// Cache cleanup to prevent memory leaks
setInterval(() => {
    if (aiCache.size > 1000) {
        console.log('[AI Service] Cleaning up cache...');
        aiCache.clear();
    }
}, 60 * 60 * 1000); // Every hour