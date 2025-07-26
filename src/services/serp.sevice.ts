import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SERPER_API_KEY) {
    console.warn("⚠️ SERPER_API_KEY is not set. Google ranking feature will be disabled.");
}

/**
 * Checks if a specific Reddit URL is indexed and ranked on Google.
 * This helps identify posts that have high visibility outside of Reddit.
 * * @param leadUrl The full URL of the Reddit post to check.
 * @param leadTitle The title of the Reddit post, used for a more specific search query.
 * @returns A promise that resolves to true if the URL is found on Google, false otherwise.
 */
export const isRankedOnGoogle = async (leadUrl: string, leadTitle: string): Promise<boolean> => {
    // If the API key is missing, we can't perform the check.
    if (!SERPER_API_KEY) {
        return false;
    }

    // We create a very specific search query to see if Google has indexed this exact post.
    // Searching for the title within the specific URL is highly effective.
    const searchQuery = `site:${leadUrl} "${leadTitle}"`;

    try {
        console.log(`[SERP] Checking Google rank for URL: ${leadUrl}`);
        
        const response = await axios.post('https://google.serper.dev/search', {
            q: searchQuery,
        }, {
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        // If the 'organic' results array exists and has one or more items,
        // it means Google found a match for our specific query.
        if (response.data && response.data.organic && response.data.organic.length > 0) {
            console.log(`[SERP] ✅ SUCCESS: URL is ranked on Google.`);
            return true;
        } else {
            console.log(`[SERP] ❌ URL not found on Google.`);
            return false;
        }

    } catch (error: any) {
        // Log any errors that occur during the API call.
        console.error(`[SERP] 🚨 Error calling Serper API:`, error.response ? error.response.data : error.message);
        return false;
    }
};
