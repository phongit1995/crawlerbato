let express = require("express");
require("dotenv").config();
let {getListImages,getCookieCloudflare,getHtmlLink} = require('./getImages');
let app = express();
app.use(express.static('public'))
app.get("/",async(req,res)=>{
    try {
        console.log(req.query.link);
        let listLink = await getListImages(req.query.link);
        return res.json(listLink);
    } catch (error) {
        console.log(error);
        return res.json(error);
    }
})
app.get("/cookie",async(req,res)=>{
    try {
        let cookie = await getCookieCloudflare();
        res.send(cookie);
    } catch (error) {
        console.log(error);
    }
})
app.get("/html",async(req,res)=>{
    try {
        let link = req.query.link ;
        if(req.query.page){
            link = link + "&page="+req.query.page ;
        }
        let html = await getHtmlLink(link);
        return res.send(html);
    } catch (error) {
        return res.json(error);
    }
})
app.listen(3333,function(){
    console.log(process.env.PORT);
    console.log("run success");
})
