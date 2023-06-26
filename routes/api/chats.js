const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const fs=require('fs');
const path=require('path');
const userinfo=require("../../schemas/userschema");
const chatinfo=require("../../schemas/chatschema");
const messageinfo=require("../../schemas/messageschema");
const multer=require("multer");


const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})

const upload=multer({storage})

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",async (req,res,next)=>{
    await chatinfo.find({users :{$elemMatch : {$eq : req.session.user._id}}})
    .populate("users")
    .populate("latestmessage")
    .sort({updatedAt:-1})
    .then(async (results)=>{
        results=await userinfo.populate(results,{path:"latestmessage.sentuser"})
        return res.status(200).send(results)
    })
    .catch(err=>console.log(err));
})

router.get("/:chatid",async (req,res,next)=>{
    await chatinfo.findOne({_id:req.params.chatid,users :{$elemMatch : {$eq : req.session.user._id}}})
    .populate("users")
    .populate("latestmessage")
    .sort({updatedAt:-1})
    .then(async (results)=>{
        results=await userinfo.populate(results,{path:"latestmessage.sentuser"})
        return res.status(200).send(results)
    })
    .catch(err=>console.log(err));
})

router.post("/",async (req,res,next)=>{
    var selectedusers=JSON.parse(req.body.data);
    var chatname=createname(selectedusers)
    selectedusers.push(req.session.user._id);
    chatname+=",you";
    const obj={
        chatname:chatname,
        users:selectedusers,
    }
    if(selectedusers.length>2){
        obj.groupchat=true;   
    }

    await chatinfo.create(obj)
    .then((results)=>res.status(202).send(results))
    .catch(err=>console.log(err));
})

router.put("/:id",async (req,res,next)=>{

    var chatid=req.params.id;
    var results=await chatinfo.findByIdAndUpdate(chatid,req.body,{new:true})
    .catch(err=>console.log(err));

    return res.status(202).send(results);
})
function createname(result){
    chatname="";
    result.forEach(x=>{
        chatname+=x.username
        chatname+=','
    });
    chatname=chatname.slice(0,-1);
    return chatname;
}

router.get("/:chatid/messages",async (req,res,next)=>{
    
    await messageinfo.find({chatid:req.params.chatid})
    .populate("sentuser")
    .then(async (results)=>{
        return res.status(200).send(results)
    })
    .catch(err=>console.log(err));
})


module.exports=router;