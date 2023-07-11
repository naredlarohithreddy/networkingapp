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
    
    const payload=createpayload(req.session.user,"Chat");
    return res.status(200).render("otherchatspage",payload);

})

router.get("/newChat",async (req,res,next)=>{
    
    const payload=createpayload(req.session.user,"new Chat");
    return res.status(200).render("newchatspage",payload);

})

router.get("/:id",async (req,res,next)=>{

    if(req.session.user===undefined)return res.sendStatus(400);
    var id=req.params.id;
    var loggedin=req.session.user;
    
    var loggedinid=req.session.user._id;
    var isvalid=mongoose.isValidObjectId(id);

    const payload=createpayload(loggedin,"Chat");

    if(!(isvalid)){
        return res.status(200).render("emptypage",payload);
    }

    var chat=await chatinfo.findOne({_id:id},{users:{$elemMatch:{$eq:loggedinid}}})
    .populate("users");

    if(chat==null){
        var otheruser=await userinfo.findOne({_id:id});

        if(otheruser==null){
            return res.status(200).render("emptypage",payload);
        }

        var username=otheruser.username;
        var newchat=await chatinfo.findOneAndUpdate({
                groupchat:false,
                users:{
                    $size:2,
                    $all:[
                        {$elemMatch:{$eq:loggedin._id}},
                        {$elemMatch:{$eq:otheruser._id}}
                    ],
                }
            },
            {
                groupchat:false,
                chatname:username,
                $setOnInsert:{
                    users:[loggedin._id,otheruser._id]
                }
            },
            {
                new:true,
                upsert:true
            },
        ).populate("users");

        payload.chat=newchat;
        payload.isgroupchat=false;
        return res.status(200).render("personalchatpage",payload);

    }

    payload.chat=chat;
    payload.isgroupchat=true;
    return res.status(200).render("personalchatpage",payload);

})

function createpayload(userloggedin,string){
    return {
        title:string,
        user:userloggedin,
        userjs:JSON.stringify(userloggedin),
    }
}

module.exports=router;