let request = require("request-promise");
var CryptoJS = require("crypto-js");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require("dotenv").config();
let fs = require('fs');
var _eval = require('eval')
let path = require('path');
const BASE_URL="https://bato.to";
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
    browser = await puppeteer.launch({
        args : ['--no-sandbox', '--disable-setuid-sandbox','--proxy-server=http://198.23.239.134:6540'],
        headless: false
    });
    const page = await browser.newPage();
     await page.authenticate({
        username: 'grkhceck',
        password: '3448dawy7xjr'
    });
    await page.setUserAgent(USER_ARGENT);
    // await page.authenticate();
    await page.goto(url,{
        waitUntil: 'domcontentloaded'
    });
    let data = await page.content();
    let result = data.toString();
    console.log(result);
    // await browser.close();
    

}
const  getHtmlLink = async(url,proxy)=>{
    const KEY_CACHE="KEY_CACHE"+"Home";
    const dataCache = cache.get(KEY_CACHE);
    let newProxyUrl ,  browser;
    if(proxy){
        newProxyUrl = await proxyChain.anonymizeProxy(proxy);
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox',`--proxy-server=${newProxyUrl}`],
            //headless: false
        });
    }else {
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox'],
            // headless: false
        });
    }
    console.log(url);
    const page = await browser.newPage();
    await page.setUserAgent(USER_ARGENT);
    await page.authenticate();
    await page.goto(url,{
        timeout:45000,
        waitUntil: 'domcontentloaded'
    })
    
    let count = 1;
    let content = await page.content();
    while(isCloudflareJSChallenge(content)){
        response = await page.waitForNavigation({
            timeout: 50000,
            waitUntil: 'domcontentloaded'
        });
        content = await page.content();
        if (count++ === 20) {
          throw new Error('timeout on just a moment');
        }
    }
    if(newProxyUrl){
        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
    }
    const cookies = await page.cookies();
    let result ="";
    for(let cookie of cookies){
        result+= `${cookie.name}=${cookie.value};` ;
    }
    cache.put(KEY_CACHE,result,1000*60*30);
    let data = await page.content()
    await browser.close();
    return data ;
}
const getCookieCloudflare=async(proxy)=>{
    const KEY_CACHE="KEY_CACHE"+proxy;
    const dataCache = cache.get(KEY_CACHE);
    if(dataCache){
        return dataCache;
    }
    let newProxyUrl ,  browser;
    if(proxy){
        newProxyUrl = await proxyChain.anonymizeProxy(proxy);
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox',`--proxy-server=${newProxyUrl}`]
        });
    }else {
        browser = await puppeteer.launch({
            args : ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    
    const page = await browser.newPage();
    await page.setUserAgent(USER_ARGENT);
    await page.authenticate();
    await page.goto("https://bato.to/",{
        timeout:45000,
        waitUntil: 'domcontentloaded'
    })
    
    let count = 1;
    let content = await page.content();
    while(isCloudflareJSChallenge(content)){
        response = await page.waitForNavigation({
            timeout: 50000,
            waitUntil: 'domcontentloaded'
        });
        content = await page.content();
        if (count++ === 10) {
          throw new Error('timeout on just a moment');
        }
    }
    const cookies = await page.cookies();
    let result ="";
    for(let cookie of cookies){
        result+= `${cookie.name}=${cookie.value};` ;
    }
    if(newProxyUrl){
        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
    }
    await browser.close();
    cache.put(KEY_CACHE,result,1000*60*30);
    return result ;

}
const getCookieBato = async ()=>{
    let options = {
        uri:"https://id.bato.to/gateway/login",
        method:"POST",
        resolveWithFullResponse:true,
        headers:{
            Referer:BASE_URL,
            'User-Agent': listUserAgent[Math.floor(Math.random()*listUserAgent.length)],
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"cacha":"03AGdBq27Y-OTdC6FwJJ5oCX7oQpa0dEQJV8MjM-Z6SOs4mP6MsPkGmDLqWZpP3gIo9oH7tUhrjJ52I_SQPZ5TpsoG89hKNzlMVb2pHLhuw568DaqrZ29-akhiZ59Mzek7A_lv-Qdp0Zre7z9No4ib5naww75wvX6zkZsb-D3fvInGdmwcM5myM9RqeitF78TzHhYgDiHbqmYA3TshoVVujH4nrtLCw4LfHkf4TtNK1EHnB0gReeDy3_oO4TvrrjL0eZLurlfcH8cPwXw2YgS4e5BsQhkDm2ksfE76OOoNH5JbyxIJGW3PuRg19vPWjT-4O1LVxK4Kckyi2QpKEaP3jStKsMkyFC_TZpB_Wg87N3vxGz3Bj9h30B6eIQ435dyxv7Td7bt5d0GX55NavUenmkjK1rHVku-iNFSm-uc14hYhE3B2qIxaAmOZmd6u56EjKGsHN5VCvIv_","email":"hindi22@gmail.com","pass0":"123456"})
    }
    let resultData = await request(options);
    return resultData.headers['set-cookie'].join(";")
}
const SaveImages = (urlImages,urlPath,idChapter)=>{
    return new Promise((resolve,reject)=>{
        let FileName = urlImages.slice(urlImages.lastIndexOf("/")+1,urlImages.lastIndexOf("?"));
        let FileUrl = path.join(urlPath,FileName);
        let fileStream = fs.createWriteStream(FileUrl);
        let options = {
        method:"GET",
        uri:urlImages,
        headers:{
            Referer:BASE_URL,
            'User-Agent': listUserAgent[Math.floor(Math.random()*listUserAgent.length)]
            }
        }
        request(options).pipe(fileStream);
        fileStream.on("finish",()=>{
            resolve( `${idChapter}/${FileName}`);
        })
        fileStream.on("error",(error)=>{
            reject(error);
        })
    })    
}
module.exports = {
    getListImages,
    getCookieBato,
    getCookieCloudflare,
    getHtmlLink
} ;