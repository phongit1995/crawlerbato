let request = require("request-promise");
var CryptoJS = require("crypto-js");
require("dotenv").config();
let fs = require('fs');
var _eval = require('eval')
let path = require('path');
const BASE_URL="https://bato.to";
var cache = require('memory-cache');
let cheerio = require("cheerio");
const listUserAgent = JSON.parse(fs.readFileSync(path.join(__dirname,"./userAgent.json"),'utf-8'));
const getListImages = async (url)=>{
    const id_chapter = url.slice(url.lastIndexOf("/")+1,url.length);
    let DataImageCache = cache.get("DATA_"+id_chapter);
    if(DataImageCache){
        return DataImageCache;
    }
    let cookie = cache.get("COOKIE");
    if(!cookie){
         cookie = await getCookieBato();
         cache.put("COOKIE",cookie,1000*60*60*24);
    }
    let options = {
        uri:url,
        method:"GET",
        headers:{
            Referer:BASE_URL,
            'User-Agent': listUserAgent[Math.floor(Math.random()*listUserAgent.length)],
            cookie:cookie
        }
    }
    let data = await request(options);
    let result = data.toString().slice(data.toString().indexOf("const batojs"),data.toString().indexOf("const pages"));
    let {batojs,server,images} = _eval(result +";exports.batojs = batojs;exports.server = server;exports.images = images;");
    let link = JSON.parse(CryptoJS.AES.decrypt(server, batojs).toString(CryptoJS.enc.Utf8));
    link  = link.replace("//","https://");
    let listImages = images.map((item)=>{
        return link+item.replace("//","https://") ;
    })
    
    const PATH_SAVE= urlPath = path.join(__dirname,"public",id_chapter);
    if (!fs.existsSync(PATH_SAVE)){
        fs.mkdirSync(PATH_SAVE,{recursive: true});
    }
    else {
        fs.readdir(PATH_SAVE, (err, files) => {
            if (err) throw err;
            for (const file of files) {
              fs.unlink(path.join(PATH_SAVE, file), errr=> {
                if (errr) throw errr;
              });
            }
          });
    }
    let ArrayPromise = listImages.map((item,index)=>{
        return SaveImages(item,PATH_SAVE,id_chapter);
    })
    let resultPromise = await Promise.all(ArrayPromise);
    cache.put("DATA_"+id_chapter,resultPromise,1000*60*60*24);
    return resultPromise;
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
    getCookieBato
} ;