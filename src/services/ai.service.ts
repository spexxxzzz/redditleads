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