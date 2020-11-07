let express = require("express");
require("dotenv").config();
let {getListImages,getCookieBato} = require('./getImages');
let app = express();
app.use(express.static('public'))
app.get("/",async(req,res)=>{
    try {
        let listLink = await getListImages(req.query.link);
        return res.json(listLink);
    } catch (error) {
        return res.json(error);
    }
})
app.get("/cookie",async(req,res)=>{
    try {
        let cookie = await getCookieBato();
        res.send(cookie);
    } catch (error) {
        
    }
})
app.listen(process.env.PORT|3000,function(){
    console.log("run success");
})
