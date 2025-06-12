const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require("dotenv").config();
let fs = require('fs');
let path = require('path');
var cache = require('memory-cache');
let cheerio = require("cheerio");
const USER_ARGENT ="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36";
const  { isCloudflareJSChallenge} = require('./common');
const listUserAgent = JSON.parse(fs.readFileSync(path.join(__dirname,"./userAgent.json"),'utf-8'));
const getListImages = async (url)=>{
    // const id_chapter = url.slice(url.lastIndexOf("/")+1,url.length);
    // let DataImageCache = cache.get("DATA_"+id_chapter);
    // if(DataImageCache){
    //     return DataImageCache;
    // }
    let browser
    try {
        browser = await puppeteer.launch({
        args : ['--no-sandbox', '--disable-setuid-sandbox',],
        headless: false
        });
        const page = await browser.newPage();
        await page.setUserAgent(USER_ARGENT);
        await page.authenticate();
        await page.goto(url,{
            waitUntil: 'networkidle0'
        });
        const elements = await page.$$('.reading-content div.page-break');
        
        // Create directory if it doesn't exist
        const outputDir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Process screenshots with better error handling
        let index = 1;
        for (const element of elements) {
            try {
                const outputPath = path.join(outputDir, `div-page-break-${index}.png`);
                await element.screenshot({
                    path: outputPath,
                });
                console.log(`Screenshot saved: ${outputPath}`);
                index++;
            } catch (error) {
                console.error(`Failed to capture screenshot ${index}:`, error.message);
                index++;
            }
        }
        // await browser.close();
    } catch (error) {
        
    }finally {
        if (browser) {
            await browser?.close();
        }
    }
    
    

}
module.exports = {
    getListImages,
} ;