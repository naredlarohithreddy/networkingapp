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

// router.get("/",async (req,res,next)=>{
//     await chatinfo.find({users :{$elemMatch : {$eq : req.session.user._id}}})
//     .populate("users")
//     .sort({updatedAt:-1})
//     .then((results)=>{return res.status(200).send(results)})
//     .catch(err=>console.log(err));
// })

// router.get("/:chatid",async (req,res,next)=>{
//     await chatinfo.findOne({_id:req.params.chatid,users :{$elemMatch : {$eq : req.session.user._id}}})
//     .populate("users")
//     .sort({updatedAt:-1})
//     .then((results)=>{return res.status(200).send(results)})
//     .catch(err=>console.log(err));
// })

router.post("/:id",async (req,res,next)=>{
    
    var content=req.body.content;
    const obj={
        content:content,
        sentuser:req.session.user,
        chatid:req.params.id,
    }

    await messageinfo.create(obj)
    .then(async (results)=>{
        results=await results.populate("sentuser");
        results=await results.populate("chatid");
        results=await userinfo.populate(results,{path:"chatid.users"});

        chatinfo.findByIdAndUpdate(req.params.id,{latestmessage:results})
        .catch(err=>console.log(err));

        res.status(202).send(results)
    })
    .catch(err=>console.log(err));
})

// router.put("/:id",async (req,res,next)=>{

//     var chatid=req.params.id;
//     var results=await chatinfo.findByIdAndUpdate(chatid,req.body,{new:true})
//     .catch(err=>console.log(err));

//     return res.status(202).send(results);
// })
// function createname(result){
//     chatname="";
//     result.forEach(x=>{
//         chatname+=x.username
//         chatname+=','
//     });
//     chatname=chatname.slice(0,-1);
//     return chatname;
// }

module.exports=router;