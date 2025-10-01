import { scrapeWebsiteTextSimple, scrapeWebsiteTextAdvanced } from '../services/scraping.service';

const MIN_CONTENT_LENGTH = 300;

export async function scrapeAndProcessWebsite(websiteUrl: string): Promise<string> {
    let scrapedText = '';
    try {
        scrapedText = await scrapeWebsiteTextSimple(websiteUrl);
        if (scrapedText.length < MIN_CONTENT_LENGTH) {
            console.log(`[Scraping] Simple scrape content too short (${scrapedText.length}), trying advanced scraper...`);
            scrapedText = await scrapeWebsiteTextAdvanced(websiteUrl);
        }
    } catch (error) {
        console.error(`[Scraping] Initial scraping failed, trying advanced scraper as fallback...`, error);
        try {
            scrapedText = await scrapeWebsiteTextAdvanced(websiteUrl);
        } catch (advancedError) {
            console.error(`[Scraping] Both simple and advanced scraping failed for ${websiteUrl}.`, advancedError);
            throw new Error(`Failed to scrape content from the provided URL. The website may be protected or inaccessible.`);
        }
    }
    console.log(`[Scraping] Final scraped content length: ${scrapedText.length}`);
    return scrapedText;
}
