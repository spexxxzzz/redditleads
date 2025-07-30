import { GoogleGenerativeAI } from '@google/generative-ai';
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { AIUsageService } from './aitracking.service';
import { getAppAuthenticatedInstance } from './reddit.service';

const prisma = new PrismaClient();
const aiCache = new Map<string, any>();

function safeJsonParse<T>(jsonString: string, validator: (obj: any) => obj is T): T | null {
    try {
        const potentialJson = jsonString.match(/{[\s\S]*}/)?.[0] || jsonString.match(/\[[\s\S]*\]/)?.[0] || jsonString;
        const parsed = JSON.parse(potentialJson);
        if (validator(parsed)) {
            return parsed;
        }
        return null;
    } catch (error) {
        console.error("JSON parsing failed:", error);
        return null;
    }
}

const aiProviders = [
    {
        name: 'Gemini',
        generate: async function(prompt: string, expectJson: boolean): Promise<string> {
            if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key is not set.");
            const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = client.getGenerativeModel({ 
                model: 'gemini-1.5-flash',
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.3,
                    responseMimeType: expectJson ? "application/json" : "text/plain",
                }
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    },
    {
        name: 'Perplexity',
        generate: async function(prompt: string): Promise<string> {
            if (!process.env.PERPLEXITY_API_KEY) throw new Error("Perplexity API key is not set.");
            const { text } = await generateText({
                model: perplexity('sonar-large-32k-online'),
                prompt: prompt,
                temperature: 0.3,
                maxTokens: 1024,
            });
            return text;
        }
    },
    {
        name: 'OpenAI',
        generate: async function(prompt: string, expectJson: boolean): Promise<string> {
            if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key is not set.");
            const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await client.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: expectJson ? "json_object" : "text" },
                temperature: 0.3, 
                max_tokens: 1024,
            });
            return response.choices[0]?.message?.content ?? "";
        }
    }
];

const generateContentWithFallback = async (prompt: string, expectJson: boolean, cacheKey?: string): Promise<string> => {
    const finalCacheKey = cacheKey || `ai_response:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
    
    if (aiCache.has(finalCacheKey)) {
        console.log(`[CACHE HIT] Returning cached AI response for key: ${finalCacheKey}`);
        return aiCache.get(finalCacheKey);
    }

    let lastError: Error | null = null;
    for (const provider of aiProviders) {
        try {
            console.log(`[AI Service] Attempting to use ${provider.name}...`);
            const text = await provider.generate(prompt, expectJson);
            if (!text) throw new Error("Received an empty response from the API.");
            console.log(`[AI Service] Successfully received response from ${provider.name}.`);
            aiCache.set(finalCacheKey, text);
            return text;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`[AI Service] ${provider.name} failed:`, lastError.message);
        }
    }
    throw new Error(`All AI services are currently unavailable. Last error: ${lastError?.message}`);
};

export const generateAIReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string,
    subredditCultureNotes: string,
    subredditRules: string[]
): Promise<string[]> => {
    const truncatedTitle = leadTitle.slice(0, 250);
    const truncatedBody = (leadBody || '').slice(0, 400);
    const truncatedDescription = companyDescription.slice(0, 250);
    const truncatedCulture = subredditCultureNotes.slice(0, 200);
    const limitedRules = subredditRules.slice(0, 4).map(rule => rule.slice(0, 70));
    
    const cacheKey = `replies_v3:${truncatedTitle}:${truncatedBody.slice(0, 100)}`;
    
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

**Output:**
Return ONLY a valid JSON object with a single key "replies" which contains an array of 3 strings. Example: {"replies": ["reply1", "reply2", "reply3"]}. Do not include any other text, markdown, or explanations.`;

    const responseText = await generateContentWithFallback(prompt, true, cacheKey);

    const parsed = safeJsonParse<{ replies: string[] }>(responseText, (obj): obj is { replies: string[] } =>
        obj && typeof obj === 'object' && 'replies' in obj && Array.isArray(obj.replies) && obj.replies.every((item: any) => typeof item === 'string')
    );
    
    if (parsed) {
        return parsed.replies.slice(0, 3);
    }

    console.error("Failed to parse AI response for replies as JSON:", responseText);
    return [`I saw you were asking about "${truncatedTitle}". Could you clarify a bit more? We're building a tool that might help, but I want to ensure it's a good fit before recommending.`];
};

export const generateSubredditSuggestions = async (businessDescription: string): Promise<string[]> => {
    console.log('[Subreddit Suggestions] Starting process...');
    const cacheKey = `verified_subreddits_v4:${businessDescription.slice(0, 200)}`;

    const prompt = `List 15-20 subreddits for this business: "${businessDescription.slice(0, 300)}".
    
    Return ONLY a valid JSON object with a single key "subreddits" which is an array of subreddit names (as strings), without the "r/" prefix.`;

    const responseText = await generateContentWithFallback(prompt, true, cacheKey);
    
    const parsed = safeJsonParse<{ subreddits: string[] }>(responseText, (obj): obj is { subreddits: string[] } => 
        obj && typeof obj === 'object' && 'subreddits' in obj && Array.isArray(obj.subreddits) && obj.subreddits.every((item: any) => typeof item === 'string')
    );

    if (!parsed) {
        console.error("Failed to get valid subreddit JSON from AI. Falling back to comma-separated parsing.");
        return responseText.split(',').map(s => s.trim().replace(/^r\//, '')).filter(Boolean);
    }

    const candidateSubreddits = parsed.subreddits;
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
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);
    
    return finalSubreddits;
};

export const generateKeywords = async (websiteText: string): Promise<string[]> => {
    const cacheKey = `keywords_v2:${websiteText.slice(0, 200)}`;
    const truncatedText = websiteText.slice(0, 500);
    const prompt = `Extract 10-15 casual Reddit keywords from this text: "${truncatedText}".
    
    Return ONLY a valid JSON object with a key "keywords" containing an array of strings.`;

    const responseText = await generateContentWithFallback(prompt, true, cacheKey);
    const parsed = safeJsonParse<{ keywords: string[] }>(responseText, (obj): obj is { keywords: string[] } =>
        obj && typeof obj === 'object' && 'keywords' in obj && Array.isArray(obj.keywords) && obj.keywords.every((item: any) => typeof item === 'string')
    );
    
    const keywords = parsed ? parsed.keywords : responseText.split(',').map(k => k.trim());
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);
    
    return keywords.filter(Boolean).slice(0, 15);
};

export const discoverCompetitorsInText = async (text: string, ownProductDescription: string): Promise<string[]> => {
    const cacheKey = `competitors_v2:${text.slice(0, 200)}:${ownProductDescription.slice(0, 100)}`;
    const prompt = `Find competitor names in the following text. My product is "${ownProductDescription.slice(0,150)}". Text: "${text.slice(0,400)}".
    
    Return ONLY a valid JSON object with a key "competitors" containing an array of names. If none are found, return an empty array.`;
    
    const responseText = await generateContentWithFallback(prompt, true, cacheKey);
    const parsed = safeJsonParse<{ competitors: string[] }>(responseText, (obj): obj is { competitors: string[] } =>
        obj && typeof obj === 'object' && 'competitors' in obj && Array.isArray(obj.competitors) && obj.competitors.every((item: any) => typeof item === 'string')
    );

    const competitorList = parsed ? parsed.competitors : [];
    setTimeout(() => aiCache.delete(cacheKey), 24 * 60 * 60 * 1000);
    return competitorList.slice(0, 5);
};

export const generateDescription = async (websiteText: string): Promise<string> => {
    const cacheKey = `description_v2:${websiteText.slice(0, 200)}`;
    const prompt = `Write a 2-sentence company description for: "${websiteText.slice(0, 400)}"`;
    return generateContentWithFallback(prompt, false, cacheKey);
};

export const generateCultureNotes = async (description: string, rules: string[]): Promise<string> => {
    const cacheKey = `culture_v2:${description.slice(0, 100)}:${rules.join(',').slice(0, 100)}`;
    const prompt = `Summarize subreddit culture in 1 paragraph. Description: "${description.slice(0,200)}" Rules: "${rules.slice(0,5).map(r => r.slice(0,100)).join('\n')}"`;
    return (await generateContentWithFallback(prompt, false, cacheKey)).trim();
};

export const refineAIReply = async (originalText: string, instruction: string): Promise<string> => {
    const prompt = `Rewrite: "${originalText.slice(0, 300)}" \nInstruction: "${instruction.slice(0, 100)}" \nNew version:`;
    return (await generateContentWithFallback(prompt, false)).trim();
};

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

export const generateFunReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string
): Promise<string[]> => {
    const truncatedTitle = leadTitle.slice(0, 100);
    const truncatedBody = (leadBody || '').slice(0, 200);
    const truncatedDescription = companyDescription.slice(0, 150);
    
    const prompt = `Create 3 funny promotional replies for an unrelated post.
Title: "${truncatedTitle}"
Body: "${truncatedBody}"  
Product: "${truncatedDescription}"

Return ONLY a valid JSON array of 3 strings. Example: ["funny reply 1", "funny reply 2", "funny reply 3"]`;

    const responseText = await generateContentWithFallback(prompt, true);

    const parsed = safeJsonParse<string[]>(responseText, (obj): obj is string[] => 
        Array.isArray(obj) && obj.every(item => typeof item === 'string')
    );

    if (parsed) {
        return parsed;
    }
    
    console.error("Failed to parse AI response as JSON for fun replies:", responseText);
    return [
        `I have no idea what "${truncatedTitle}" is about, but have you heard of our amazing product? You should totally check it out!`
    ];
};

export const analyzeLeadIntent = async (title: string, body: string | null, userId: string, userPlan: string): Promise<string> => {
    const aiUsage = AIUsageService.getInstance();
    const canUseAI = await aiUsage.trackAIUsage(userId, 'intent', userPlan);

    if (!canUseAI) {
        return determineBasicIntent(title, body);
    }

    const truncatedTitle = title.slice(0, 100);
    const truncatedBody = (body || '').slice(0, 200);
    
    const prompt = `Classify intent as one of: pain_point, solution_seeking, brand_comparison, or general_discussion. Title: "${truncatedTitle}" Body: "${truncatedBody}"`;
    
    const intent = await generateContentWithFallback(prompt, false);
    return intent.trim().toLowerCase().replace(/_ /g, '_');
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

export const analyzeSentiment = async (title: string, body: string | null, userId: string, userPlan: string): Promise<string> => {
    const aiUsage = AIUsageService.getInstance();
    const canUseAI = await aiUsage.trackAIUsage(userId, 'competitor', userPlan);

    if (!canUseAI) {
        return determineBasicSentiment(title, body);
    }

    const truncatedTitle = title.slice(0, 100);
    const truncatedBody = (body || '').slice(0, 200);
    
    const prompt = `Classify sentiment as one of: positive, negative, or neutral. Title: "${truncatedTitle}" Body: "${truncatedBody}"`;
    
    const sentiment = await generateContentWithFallback(prompt, false);
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

setInterval(() => {
    if (aiCache.size > 1000) {
        console.log('[AI Service] Cleaning up cache...');
        aiCache.clear();
    }
}, 60 * 60 * 1000);