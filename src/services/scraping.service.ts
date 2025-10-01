import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export const scrapeWebsiteTextSimple = async (url: string): Promise<string> => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        $('script, style, head, nav, footer, iframe').remove();
        const text = $('body').text().replace(/\s\s+/g, ' ').trim();
        console.log(`[Scraping] Simple scrape extracted ${text.length} characters`);
        return text;
    } catch (error) {
        console.error(`[Scraping] Simple scrape failed for ${url}:`, error);
        throw error;
    }
};

export const scrapeWebsiteTextAdvanced = async (url: string): Promise<string> => {
    let browser = null;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const text = await page.evaluate(() => document.body.innerText);
        const cleanText = text.replace(/\s\s+/g, ' ').trim();
        console.log(`[Scraping] Advanced scrape extracted ${cleanText.length} characters`);
        return cleanText;
    } catch (error) {
        console.error(`[Scraping] Advanced scrape failed for ${url}:`, error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
