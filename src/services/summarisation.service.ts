import axios from 'axios';

// --- NEW: Use the summarize-text endpoint ---
const APYHUB_API_URL = 'https://api.apyhub.com/ai/summarize-text';
const APYHUB_TOKEN = process.env.APYHUB_TOKEN;

/**
 * Summarizes a given block of text using the ApyHub API.
 * The summary will be of medium length and in English.
 * @param text The text content to summarize (e.g., a Reddit post body).
 * @returns A promise that resolves to the summarized text.
 */
export const summarizeTextContent = async (text: string): Promise<string> => {
    if (!APYHUB_TOKEN) {
        throw new Error('ApyHub API token is not configured. Please set APYHUB_TOKEN in .env');
    }

    try {
        const response = await axios.post(
            APYHUB_API_URL,
            {
                text: text, // Send the text directly
                summary_length: 'medium',
                output_language: 'en'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apy-token': APYHUB_TOKEN,
                },
            }
        );

        if (response.data && response.data.data && response.data.data.summary) {
            return response.data.data.summary;
        } else {
            throw new Error('Invalid response structure from ApyHub API.');
        }
    } catch (error: any) {
        console.error('Error calling ApyHub Summarize API:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Failed to summarize content.';
        throw new Error(errorMessage);
    }
};