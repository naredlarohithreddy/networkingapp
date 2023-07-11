const express=require('express');
const bodyparser=require('body-parser');
const chatinfo=require("../schemas/chatschema");
const userinfo=require("../schemas/userschema");
const mongoose=require("mongoose");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}));

router.get("/",async (req,res,next)=>{
    
    const payload=createpayload(req.session.user,"Notifications");
    return res.status(200).render("notificationspage",payload);

})

function createpayload(userloggedin,string){
    return {
        title:string,
        user:userloggedin,
        userjs:JSON.stringify(userloggedin),
    }
}

module.exports=router;