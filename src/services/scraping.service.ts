import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export const scrapeWebsiteTextSimple = async (url: string): Promise<string> => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        $('script, style, head, nav, footer, iframe').remove();
        return $('body').text().replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        return '';
    }
};

export const scrapeWebsiteTextAdvanced = async (url: string): Promise<string> => {
    let browser = null;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const text = await page.evaluate(() => document.body.innerText);
        return text.replace(/\s\s+/g, ' ').trim();
    } catch (error) {
        return '';
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
