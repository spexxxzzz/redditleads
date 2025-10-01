import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { AIUsageService } from './aitracking.service';
import { generateQueriesFromDNA } from './reddit.service';
const NodeCache = require('node-cache');

const prisma = new PrismaClient();
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);

// Environment variable to control primary model (default: pro)
const PRIMARY_MODEL = (process.env.GEMINI_PRIMARY_MODEL || 'pro') as 'pro' | 'flash';

const proModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0,
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ]
});

const flashModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        temperature: 0.2,
    },
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ]
});


function safeJsonParse<T>(jsonString: string, validator: (obj: any) => obj is T): T | null {
    try {
        let cleanedString = jsonString.trim();
        if (cleanedString.includes('```json')) {
            cleanedString = cleanedString.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedString.includes('```')) {
            cleanedString = cleanedString.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        cleanedString = cleanedString.trim();
        const jsonMatch = cleanedString.match(/{[\s\S]*}/) || cleanedString.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return null;
        }
        let potentialJson = jsonMatch[0];
        potentialJson = potentialJson.replace(/,(\s*[}\]])/g, '$1').replace(/,(\s*$)/g, '');
        const parsed = JSON.parse(potentialJson);
        if (validator(parsed)) {
            return parsed;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

function extractRepliesManually(text: string): string[] {
    const replies: string[] = [];
    const quoteMatches = text.match(/"([^"]{50,}?)"/g);
    if (quoteMatches) {
        for (const match of quoteMatches) {
            const reply = match.slice(1, -1);
            if (reply.length > 50 && reply.length < 1000) {
                replies.push(reply);
            }
        }
    }
    return replies;
}

/**
 * A robust function to generate content using the Gemini API with a fallback mechanism.
 * It now supports selecting between a 'pro' and 'flash' model for different performance needs.
 */
export async function generateContentWithFallback(
    prompt: string,
    expectJson: boolean,
    cacheKey: string,
    modelType: 'pro' | 'flash' = PRIMARY_MODEL // Use environment variable or default to 'pro'
): Promise<string> {
    if (!prompt) {
        throw new Error("Prompt cannot be empty.");
    }

    const cacheResult = cache.get(cacheKey) as string | undefined;
    if (cacheResult) {
        return cacheResult;
    }

    // Try primary model first, then fallback to secondary model
    const primaryModel = modelType === 'flash' ? flashModel : proModel;
    const fallbackModel = modelType === 'flash' ? proModel : flashModel;
    const primaryModelName = modelType === 'flash' ? 'flash' : 'pro';
    const fallbackModelName = modelType === 'flash' ? 'pro' : 'flash';
    
    const generationConfig = {
        responseMimeType: expectJson ? "application/json" : "text/plain",
    };

    const maxRetries = 5; // Increased retries
    let lastError: any;

    // First try with primary model
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new Error("Gemini API key is not set.");
            
            // Dynamic timeout based on content length and attempt
            const baseTimeout = expectJson ? 300000 : 120000; // 5min for JSON, 2min for text
            const timeoutMs = Math.min(baseTimeout * attempt, 600000); // Max 10 minutes
            
            console.log(`[AI Service] Attempt ${attempt}/${maxRetries} with ${primaryModelName} model (${timeoutMs}ms timeout)`);
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`AI generation timeout after ${timeoutMs/1000} seconds`)), timeoutMs);
            });
            
            const generationPromise = primaryModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: generationConfig
            });

            const result = await Promise.race([generationPromise, timeoutPromise]) as any;

            if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
                // Check for safety block
                const safetyFeedback = result.response.promptFeedback;
                if (safetyFeedback && safetyFeedback.blockReason) {
                    console.log(`⚠️ [AI Service] Content blocked: ${safetyFeedback.blockReason}`);
                    throw new Error(`Response blocked due to ${safetyFeedback.blockReason}. Details: ${JSON.stringify(safetyFeedback.safetyRatings)}`);
                }
                throw new Error("Invalid AI response structure: No candidates found.");
            }

            const text = result.response.candidates[0].content.parts[0].text;
            if (!text) {
                throw new Error("Invalid AI response: No text found in the first candidate.");
            }
            
            await cache.set(cacheKey, text);
            console.log(`✅ [AI Service] Success on attempt ${attempt}/${maxRetries}`);
            return text;

        } catch (error: any) {
            lastError = error;
            console.error(`[AI Service] Attempt ${attempt}/${maxRetries} failed for key ${cacheKey}:`, error.message);
            
            // Handle different types of errors
            if (error.status === 429 || error.message.includes('429') || error.message.includes('quota')) {
                const retryDelay = Math.min(2000 * Math.pow(2, attempt - 1), 60000); // Exponential backoff, max 60s
                console.log(`[AI Service] Rate limit hit. Waiting ${retryDelay}ms before retry ${attempt + 1}/${maxRetries}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }
            
            // Handle 503 Service Unavailable
            if (error.status === 503 || error.message.includes('503') || error.message.includes('Service Unavailable')) {
                const retryDelay = Math.min(10000 * attempt, 60000); // Longer backoff for service issues
                console.log(`[AI Service] Service unavailable. Waiting ${retryDelay}ms before retry ${attempt + 1}/${maxRetries}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                const retryDelay = Math.min(5000 * attempt, 30000); // Wait before retry
                console.log(`[AI Service] Timeout on attempt ${attempt}. Waiting ${retryDelay}ms before retry...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue; // Try again with longer timeout
                }
            }
            
            // For other errors, don't retry immediately
            if (attempt === maxRetries) {
                break;
            }
            
            // Small delay before retry for other errors
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }

    // If primary model failed, try fallback model
    console.log(`[AI Service] Primary model (${primaryModelName}) failed, trying fallback model (${fallbackModelName})...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new Error("Gemini API key is not set.");
            
            // Dynamic timeout based on content length and attempt
            const baseTimeout = expectJson ? 300000 : 120000; // 5min for JSON, 2min for text
            const timeoutMs = Math.min(baseTimeout * attempt, 600000); // Max 10 minutes
            
            console.log(`[AI Service] Fallback attempt ${attempt}/${maxRetries} with ${fallbackModelName} model (${timeoutMs}ms timeout)`);
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`AI generation timeout after ${timeoutMs/1000} seconds`)), timeoutMs);
            });
            
            const generationPromise = fallbackModel.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: generationConfig
            });

            const result = await Promise.race([generationPromise, timeoutPromise]) as any;

            if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
                throw new Error("No response generated from the model");
            }

            const responseText = result.response.candidates[0].content.parts[0].text;
            
            if (!responseText) {
                throw new Error("Empty response from the model");
            }

            // Cache the successful result
            cache.set(cacheKey, responseText);
            console.log(`[AI Service] Success on fallback attempt ${attempt}/${maxRetries} with ${fallbackModelName} model`);
            return responseText;

        } catch (error: any) {
            lastError = error;
            console.log(`[AI Service] Fallback attempt ${attempt}/${maxRetries} failed: ${error.message}`);

            // Handle specific error types
            if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
                const retryDelay = Math.min(10000 * attempt, 60000); // Longer delay for service unavailable
                console.log(`[AI Service] Service unavailable. Waiting ${retryDelay}ms before retry ${attempt + 1}/${maxRetries}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }
            
            // Handle rate limiting
            if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit')) {
                const retryDelay = Math.min(5000 * attempt, 30000); // Wait before retry
                console.log(`[AI Service] Rate limit hit. Waiting ${retryDelay}ms before retry ${attempt + 1}/${maxRetries}`);
                
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue;
                }
            }
            
            // Handle timeout errors
            if (error.message.includes('timeout')) {
                const retryDelay = Math.min(5000 * attempt, 30000); // Wait before retry
                console.log(`[AI Service] Timeout on fallback attempt ${attempt}. Waiting ${retryDelay}ms before retry...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    continue; // Try again with longer timeout
                }
            }
            
            // For other errors, don't retry immediately
            if (attempt === maxRetries) {
                break;
            }
            
            // Small delay before retry for other errors
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }

    // If we get here, both models failed
    console.error(`[AI Service] Both primary (${primaryModelName}) and fallback (${fallbackModelName}) models failed for key ${cacheKey}. Last error:`, lastError);
    throw new Error(`[AI Service] Failed to generate content with both models after ${maxRetries} retries each. Last error: ${lastError?.message || 'Unknown error'}`);
}

export const generateAIReplies = async (
    leadTitle: string,
    leadBody: string | null,
    companyDescription: string,
    businessName: string,
    subredditCultureNotes: string,
    subredditRules: string[],
    companyUrl?: string
): Promise<string[]> => {
    const truncatedTitle = leadTitle.slice(0, 250);
    const truncatedBody = (leadBody || '').slice(0, 400);
    const truncatedDescription = companyDescription.slice(0, 250);
    const truncatedCulture = subredditCultureNotes.slice(0, 200);
    const limitedRules = subredditRules.slice(0, 4).map(rule => rule.slice(0, 70));
    const cacheKey = `replies_v7:${truncatedTitle}:${truncatedBody.slice(0, 100)}:${companyUrl || 'no-url'}`;

    const prompt = `
    === ROLE & PERSONA ===
    You are an expert Reddit commenter and an enthusiastic user of a product. You are NOT a salesperson or marketer. Your goal is to naturally engage in a conversation by sharing a helpful experience you had with a product that solved a problem similar to the OP's. Your tone should be authentic, helpful, and align with the culture of the subreddit.

    === MISSION ===
    Analyze the Reddit post and product description. Generate three distinct replies that subtly promote the product by framing it as a solution to a personal struggle.
    1. Start by empathizing with the OP's problem (e.g., "I struggled with the exact same thing...").
    2. Share your experience of how the product, ${businessName}, helped you solve that same problem. (e.g., "...I started using ${businessName} and it was a game-changer for me.").
    3. The goal is to sound like a helpful peer sharing a discovery, not a marketer.
    
    === COMPANY INFORMATION ===
    - Company Name: ${businessName}
    - Company Website: ${companyUrl || 'Not available'}
    - Company Description: ${truncatedDescription}
    
    === HYPERLINK EXAMPLE ===
    If the company name is "Axory.ai" and URL is "https://axory.ai", the hyperlink should be: [Axory.ai](https://axory.ai)
    NEVER use generic terms like "My Business" or "this tool" in the hyperlink.

    === STRICT RULES ===
    - DO NOT be excessively promotional: Avoid phrases like "You should check out...". Instead, be subtle: "I found ${businessName} automates this and it helped me a lot."
    - Mention the product name, ${businessName}, ONCE and only once in each reply, in a natural way.
    - When mentioning the company name, ALWAYS hyperlink it to the company website using this exact format: [${businessName}](${companyUrl || '#'})${companyUrl ? '' : ' (Note: Company URL not available)'}
    - CRITICAL: The company name is "${businessName}". You MUST use this exact name in the hyperlink. NEVER use "My Business", "this tool", "the platform", or any other generic term.
    - The hyperlink format must be: [${businessName}](${companyUrl || '#'}) - replace ${businessName} with the actual company name provided above.
    - Keep it concise: Replies should be 2-4 sentences long.
    - Generate 3 DIFFERENT replies, each with a slightly different angle.
    - End with a question to encourage conversation.
    - Output ONLY a valid JSON object: {"replies": ["reply text 1", "reply text 2", "reply text 3"]}. Do not add any other text or markdown.

    === CONTEXT ===
    **Subreddit Culture Notes:**
    ${truncatedCulture}

    **Subreddit Rules to Respect:**
    ${JSON.stringify(limitedRules)}

    **Product Description (Your experience is based on this):**
    ${truncatedDescription}

    **OP's Post Title:**
    ${truncatedTitle}

    **OP's Post Body:**
    ${truncatedBody}
    `;

    try {
        const responseText = await generateContentWithFallback(
            prompt, 
            true, 
            cacheKey,
            'flash' // Use the high-speed model for replies
        );
        const parsed = safeJsonParse<{ replies: string[] }>(responseText, (obj): obj is { replies: string[] } =>
            obj && typeof obj === 'object' && 'replies' in obj && Array.isArray(obj.replies) && obj.replies.length > 0 && obj.replies.every((item: any) => typeof item === 'string' && item.trim().length > 0)
        );
        if (parsed && parsed.replies.length >= 3) {
            // Post-process to fix any "My Business" references
            const correctedReplies = parsed.replies.map(reply => {
                // Replace any instances of "My Business" with the actual business name
                return reply.replace(/\[My Business\]/g, `[${businessName}]`);
            });
            return correctedReplies.slice(0, 3);
        }
        const manuallyExtracted = extractRepliesManually(responseText);
        if (manuallyExtracted.length >= 3) {
            // Post-process to fix any "My Business" references
            const correctedReplies = manuallyExtracted.map(reply => {
                // Replace any instances of "My Business" with the actual business name
                return reply.replace(/\[My Business\]/g, `[${businessName}]`);
            });
            return correctedReplies.slice(0, 3);
        }
        return [`I saw you were asking about "${truncatedTitle}". Could you clarify a bit more? We're building a tool that might help, but I want to ensure it's a good fit before recommending.`];
    } catch (error) {
        return [`I saw you were asking about "${truncatedTitle}". Could you clarify a bit more? We're building a tool that might help, but I want to ensure it's a good fit before recommending.`];
    }
};

export const generateReplyOptions = async (leadId: string): Promise<string[]> => {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { project: { include: { user: true } } }
        });
        if (!lead) throw new Error('Lead not found.');
        if (!lead.project) throw new Error('Campaign not found for lead.');

        const user = lead.project.user;
        if (!user) throw new Error('User could not be found for the project.');

        const aiUsage = AIUsageService.getInstance();
        const canUseAI = await aiUsage.trackAIUsage(user.id, 'reply', user.plan);
        if (!canUseAI) throw new Error('AI reply quota exceeded.');
        const subredditProfile = await prisma.subredditProfile.findUnique({ where: { name: lead.subreddit } });

        const companyDescription = lead.project.generatedDescription || "No description available.";
        
        let businessName = lead.project.name; // Fallback to project name
        if (lead.project.businessDNA && typeof lead.project.businessDNA === 'object' && 'businessName' in lead.project.businessDNA) {
            const dna = lead.project.businessDNA as { businessName?: string };
            if (dna.businessName) {
                businessName = dna.businessName;
            }
        }

        const cultureNotes = subredditProfile?.cultureNotes ?? "Be respectful and helpful.";
        const rules = subredditProfile?.rules ?? ["No spam."];
        const companyUrl = lead.project.analyzedUrl;
        
        console.log(`[AI Service] Generating replies with businessName: "${businessName}", companyUrl: "${companyUrl}"`);
        
        return await generateAIReplies(lead.title, lead.body, companyDescription, businessName, cultureNotes, rules, companyUrl);
    } catch (error) {
        throw error;
    }
};

interface BusinessDNA {
    businessName: string;
    oneLiner: string;
    coreProblem: string;
    solutionValue: string;
    customerProfile: { description: string; commonTitles: string[]; };
    naturalLanguageVocabulary: { painPoints: string[]; solutionKeywords: string[]; useCases: string[]; competitors: string[]; };
    suggestedSubreddits: string[]; // 15-20 highly relevant subreddits for maximum lead quality
}

const BUSINESS_DNA_EXTRACTION_PROMPT = `
=== ROLE ===
You are an ELITE Market Research Analyst and Business Strategist. Your mission is to perform a deep semantic analysis of a business based on its website content and extract its core "Business DNA."
=== MISSION ===
Analyze the provided website text and extract a structured JSON object representing the Business DNA. Think deeply about the underlying problems, the customer psychology, and the specific language used.
=== ANALYSIS FRAMEWORK ===
1.  **Business Name & One-Liner:**
    *   Identify the company/product name.
    *   Synthesize a single, powerful sentence that describes what it does and for whom.
2.  **Core Problem Identification:**
    *   What is the fundamental pain point this business solves?
3.  **Solution Value Proposition:**
    *   How, specifically, does the product solve this core problem?
4.  **Ideal Customer Profile:**
    *   Describe the ideal customer in a sentence.
    *   What are their common job titles or roles?
5.  **Natural Language Vocabulary (CRITICAL):**
    *   **Pain Points:** What phrases describe their frustrations?
    *   **Solution Keywords:** What terms describe the category of solution they are looking for?
    *   **Use Cases:** What specific tasks or goals are they trying to accomplish?
    *   **Core Concepts & Intellectual Topics:** For niche or deep-tech businesses, list 3-5 abstract concepts, technologies, or high-level ideas central to the business's value proposition that experts in the field might discuss.
    *   **Competitors:** Are any alternative solutions or companies mentioned or implied?
6.  **Geographical Focus:**
    *   What is the primary geographical market (e.g., "Global", "USA", "India", "Europe")? If a specific country, mention it.
7.  **Disqualifiers / Negative Keywords:**
    *   What are some closely related topics that are NOT a good fit? (e.g., For a B2B SaaS, this might be "job seekers", "students", "hiring"). This is critical for filtering.
8.  **Suggested Subreddits (CRITICAL FOR LEAD QUALITY):**
    *   Based on the customer profile, problems, and industry, suggest 15-20 highly relevant subreddits.
    *   Think broadly across different angles: industry-specific, role-specific, problem-specific, and community-specific subreddits.
    *   Include both large general communities and smaller niche communities where your ideal customers are active.
    *   Consider: industry subreddits, professional role subreddits, problem-solving communities, technology subreddits, business communities, and relevant hobby/interest subreddits.
    *   IMPORTANT: Do NOT include "r/" prefix in subreddit names. Just provide the subreddit name (e.g., "entrepreneur" not "r/entrepreneur").
=== OUTPUT FORMAT ===
You MUST return ONLY a valid, raw JSON object. Do NOT wrap it in Markdown backticks or any other text.
EXAMPLE JSON STRUCTURE:
{
  "businessName": "SalesFlow CRM",
  "oneLiner": "An automated CRM for B2B sales teams to close deals faster.",
  "coreProblem": "Sales teams spend too much time on manual data entry and follow-ups, causing valuable leads to be missed and slowing down the entire sales cycle.",
  "solutionValue": "SalesFlow automates CRM data entry, prioritizes the hottest leads, and schedules follow-ups, allowing sales reps to focus exclusively on selling and closing deals.",
  "customerProfile": { "description": "B2B companies with a dedicated sales team of 5 or more people.", "commonTitles": ["Sales Development Representative", "Account Executive", "VP of Sales", "Sales Manager"] },
  "naturalLanguageVocabulary": { "painPoints": ["manual crm update", "leads falling through cracks"], "solutionKeywords": ["CRM automation", "sales pipeline tool"], "useCases": ["track deal progress", "automate follow-up emails"], "competitors": ["Salesforce", "HubSpot"] },
  "suggestedSubreddits": ["sales", "startups", "smallbusiness", "entrepreneur", "marketing", "b2b", "saas", "crm", "salesforce", "hubspot", "salesops", "revenue", "growth", "leadgen", "prospecting", "closing", "salesenablement", "salesstrategy", "business", "technology"]
}
=== WEBSITE CONTENT TO ANALYZE ===
"""
{websiteText}
"""
`;

export const extractBusinessDNA = async (websiteText: string): Promise<BusinessDNA> => {
    console.log('[AI Service] Starting Business DNA extraction...');
    try {
        const prompt = BUSINESS_DNA_EXTRACTION_PROMPT.replace('{websiteText}', websiteText);
        const response = await generateContentWithFallback(
            prompt, 
            true, 
            `business_dna:${websiteText.slice(0, 150)}`,
            'pro' // Always use the 'pro' model for this critical task
        );
        
        // Clean the response to remove markdown fences
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const dna = JSON.parse(cleanedResponse) as BusinessDNA;
        console.log(`[AI Service] Extracted Business DNA:`, JSON.stringify(dna, null, 2));
        console.log(`[AI Service] Business Name extracted: "${dna.businessName}"`);
        
        if (!dna.businessName || !dna.coreProblem || !dna.naturalLanguageVocabulary.painPoints.length) {
            throw new Error('Extracted Business DNA is missing critical fields.');
        }
        console.log(`[AI Service] ✅ Business DNA extraction successful.`);
        return dna;
    } catch (error) {
        console.error('[AI Service] ❌ Critical error during Business DNA extraction:', error);
        throw new Error(`Failed to extract Business DNA. The AI response may have been malformed or the analysis failed.`);
    }
};

export const SUMMARIZATION_PROMPT = `
You are an expert Sales Analyst. Your task is to provide a concise, actionable summary of a potential sales lead from a Reddit post.
Your response must consist of two distinct paragraphs. Do NOT use any markdown formatting, titles, or headings.
When referring to the post's author, you MUST use the term "OP" (which stands for Original Poster).

The first paragraph should be a very brief, neutral summary of the post, focusing on the OP's core problem or question. This summary must be 3-4 lines maximum.

The second paragraph should be a detailed analysis of WHY this post is a good lead for the specified business and HOW the business's solution can specifically help the OP. Use the provided "Business DNA" for your analysis.

---
BUSINESS DNA:
{businessDNA}
---
POST CONTENT TO ANALYZE:
{textContent}
---
`;

const DYNAMIC_QUERY_GENERATION_PROMPT = `
You are an expert Reddit search strategist. Generate diverse, creative search queries to find potential customers discussing problems related to this business.

BUSINESS CONTEXT:
{businessDNA}

MISSION:
Generate 8-12 unique Reddit search queries that would find people discussing problems this business solves. Use different angles, phrasings, and approaches.

QUERY DIVERSITY STRATEGIES:
1. Direct problem statements: "struggling with X", "problem with Y"
2. Solution-seeking: "best tool for X", "how to solve Y"
3. Comparison requests: "X vs Y", "alternative to Z"
4. Experience sharing: "experience with X", "thoughts on Y"
5. Industry discussions: "trends in X", "future of Y"
6. Pain point variations: "frustrated with X", "tired of Y"

OUTPUT FORMAT:
Return ONLY a JSON array of search query strings. No other text.
Example: ["query1", "query2", "query3"]

QUERIES:
`;

export const generateDynamicSearchQueries = async (businessDNA: any, variationLevel: number = 0): Promise<string[]> => {
    try {
        const prompt = DYNAMIC_QUERY_GENERATION_PROMPT.replace('{businessDNA}', JSON.stringify(businessDNA, null, 2));
        
        // Use different models and temperatures based on variation level
        const modelType = variationLevel > 1 ? 'flash' : 'pro';
        const temperature = variationLevel > 0 ? 0.3 : 0.1; // Slightly more creative for variation
        
        // Create a unique cache key that includes variation level and timestamp for more diversity
        const cacheKey = `dynamic_queries_v${variationLevel}:${businessDNA.businessName}:${Math.floor(Date.now() / (1000 * 60 * 30))}`; // Cache for 30 minutes instead of 24 hours
        
        const response = await generateContentWithFallback(
            prompt,
            true, // Expect JSON
            cacheKey,
            modelType
        );
        
        const queries = JSON.parse(response);
        if (Array.isArray(queries) && queries.length > 0) {
            return queries.slice(0, 12); // Limit to 12 queries
        }
        
        // Fallback to basic queries if AI fails
        return generateQueriesFromDNA(businessDNA, variationLevel);
    } catch (error) {
        console.error('[AI Service] Failed to generate dynamic queries:', error);
        return generateQueriesFromDNA(businessDNA, variationLevel);
    }
};

export async function summarizeText(textContent: string, businessDNA: any): Promise<string> {
    try {
        const prompt = SUMMARIZATION_PROMPT
            .replace('{textContent}', textContent)
            .replace('{businessDNA}', JSON.stringify(businessDNA, null, 2));
            
        const response = await generateContentWithFallback(
            prompt,
            false, // Not expecting JSON
            `summarize_v2:${textContent.slice(0, 50)}`,
            'flash' // Use the new, high-speed model
        );
        return response;
    } catch (error) {
        console.error(`[AI Service] Failed to summarize text:`, error);
        throw new Error('The AI failed to generate a summary for the provided text.');
    }
}

export const generateCultureNotes = async (description: string, rules: string[]): Promise<string> => {
    const cacheKey = `culture_v2:${description.slice(0, 100)}:${rules.join(',').slice(0, 100)}`;
    const prompt = `Summarize subreddit culture in 1 paragraph. Description: "${description.slice(0,200)}" Rules: "${rules.slice(0,5).map(r => r.slice(0,100)).join('\n')}"`;
    
    try {
        const result = await generateContentWithFallback(prompt, false, cacheKey);
        return result.trim();
    } catch (error) {
        console.error("Error in generateCultureNotes:", error);
        return "Be respectful, helpful, and follow community guidelines.";
    }
};

setInterval(() => {
    if (cache.getStats().keys > 1000) {
        console.log('[AI Service] Cleaning up cache...');
        cache.flushAll();
    }
}, 60 * 60 * 1000);