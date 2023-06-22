const express=require('express');
const bodyparser=require('body-parser');
const userinfo=require("../schemas/userschema");
const postinfo=require("../schemas/postschema");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}));

router.get("/",async (req,res,next)=>{

    const payload=createpayload(req.session.user,"chat");
    return res.status(200).render("chatspage",payload);

})

router.get("/newChat",async (req,res,next)=>{
    
    const payload=createpayload(req.session.user,"new Chat");
    return res.status(200).render("newchatspage",payload);

})

function createpayload(userloggedin,string){
    return {
        title:string,
        user:userloggedin,
        userjs:JSON.stringify(userloggedin),
    }
}

module.exports=router;