const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require("dotenv").config();
let fs = require('fs');
let path = require('path');
let cache = require('memory-cache');
const USER_ARGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36";
const getListImages = async (url) => {
    let urlLink = url;
    if (url.endsWith("/")) urlLink = url.slice(0, -1);
    const urlParts = urlLink.split('/');
    const mangaName = urlParts[urlParts.length - 2];
    const chapterName = urlParts[urlParts.length - 1];
    if (!mangaName || !chapterName) throw new Error("Invalid URL");
    const outputDir = path.join(process.cwd(), 'public', mangaName, chapterName);
    let dataImageCache = cache.get(url);
    if (dataImageCache) {
        return dataImageCache;
    }
    let browser;
    let imagePaths = [];

    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', ],
            // headless: false
        });
        const page = await browser.newPage();
        await page.setUserAgent(USER_ARGENT);
        await page.authenticate();
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        const elements = await page.$$('.reading-content div.page-break');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {
                recursive: true
            });
        }
        imagePaths = Array.from({
            length: elements.length
        }, (_, idx) => {
            return `/${mangaName}/${chapterName}/${idx + 1}.png`;
        });

        // Process screenshots sequentially to reduce memory usage
        for (let idx = 0; idx < elements.length; idx++) {
            const element = elements[idx];
            const index = idx + 1;
            const outputPath = path.join(outputDir, `${index}.png`);
            
            try {
                await element.screenshot({ path: outputPath });
            } catch (error) {
                imagePaths[idx] = null;
            }
        }

        cache.put(url, imagePaths, 1000 * 60 * 60 * 24);
    } catch (error) {
        console.error("Error in getListImages:", error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    return imagePaths.filter(Boolean);
}
module.exports = {
    getListImages,
};