const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const fs=require('fs');
const path=require('path');
const userinfo=require("../../schemas/userschema");
const chatinfo=require("../../schemas/chatschema");
const messageinfo=require("../../schemas/messageschema");
const notificationinfo=require("../../schemas/notificationschema");
const multer=require("multer");


const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})

const upload=multer({storage})

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))


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

        await messageinfo.updateOne(
            { _id: results._id },
            { $push: { readusers: req.session.user._id} }
        );
        
        var chat=await chatinfo.findByIdAndUpdate(req.params.id,{latestmessage:results._id},{new:true})
        .catch(err=>console.log(err));

        chat.users.forEach(async user=>{
            if(req.session.user._id!=user._id){
                await notificationinfo.insertNotification(req.session.user._id,user._id,"message",chat._id)
                .catch(err=>console.log(err));
            }
        })
        
        await chat.save();
        res.status(202).send(results)
    })
    .catch(err=>console.log(err));
})

router.put("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
    
        const updatedMessage = await messageinfo.findByIdAndUpdate(
            id,
            { $push: { readusers: req.session.user._id } },
            { new: true }
        );
    
        const chat = await chatinfo
        .findById(updatedMessage.chatid)
        .populate("latestmessage");

        if (!chat.latestmessage.readusers.includes(req.session.user._id)) {
            chat.latestmessage.readusers.push(req.session.user._id);
            await chat.save();
        }
        
  
        res.status(200).send(chat);
    } catch (err) {
      console.log(err);
      next(err);
    }
  });


module.exports=router;