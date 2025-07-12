import axios from 'axios';
const APYHUB_SERP_API_URL = 'https://api.apyhub.com/extract/google-search-results';

const APYHUB_TOKEN = process.env.APYHUB_TOKEN;

/**
 * Checks if a given URL ranks on Google for a specific query.
 * @param query The search query (e.g., the Reddit post title).
 * @param urlToCheck The URL to look for in the search results (the Reddit post URL).
 * @returns A promise that resolves to true if the URL is found, false otherwise.
 */
export const checkGoogleRanking = async (query: string, urlToCheck: string): Promise<boolean> => {
    if (!APYHUB_TOKEN) {
        console.warn('ApyHub API token is not configured. Skipping Google ranking check.');
        return false;
    }

    try {
        const response = await axios.post(
            APYHUB_SERP_API_URL,
            { query },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apy-token': APYHUB_TOKEN,
                },
            }
        );

        // The API returns { data: [ ...results ] }
        if (response.data && Array.isArray(response.data.data)) {
            const searchResults: { link: string }[] = response.data.data;
            return searchResults.some(result => result.link.includes(urlToCheck));
        }
        return false;
    } catch (error: any) {
        console.error(
            'Error calling ApyHub SERP API:',
            error.response?.data?.message || error.message
        );
        return false;
    }
};
