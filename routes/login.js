const express=require('express');
const http=require("http");
const bodyparser=require('body-parser');
const userinfo=require("../schemas/userschema");
const bcrypt=require("bcrypt");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",(req,res,next)=>{
    res.status(200).render("login");
})

router.post("/",async (req,res,next)=>{
    const session=req.session;

    const payload=req.body;

    if(payload.logUsername && payload.logPassword){

        let user= await userinfo.findOne({
            '$or' : [
                {username:req.body.logUsername},
                {email:req.body.logUsername}
            ]
        })
        .catch((error)=>{

            console.log(error);
            payload.error="Something Went wrong";
            res.status(200).render("login",payload);

        })
        
        if(user!=null){
            
            const password=await bcrypt.compare(payload.logPassword,user.password);

            if(password===true){
                req.session.user=user;
                return res.redirect("/");
            }
            
            payload.error="fill the credentials correctly";
            return res.status(200).render("login",payload);

        }

    }

    payload.error="user doesn't exist";
    return res.status(200).render("login",payload);
})

module.exports=router;