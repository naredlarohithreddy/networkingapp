const express=require('express');
const bodyparser=require('body-parser');
const chatinfo=require("../../schemas/chatschema");
const userinfo=require("../../schemas/userschema");
const notificationsinfo=require("../../schemas/notificationschema");
const mongoose=require("mongoose");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}));

router.get("/",async (req,res,next)=>{
    
    var loggedin_id=req.session.user._id;
    await notificationsinfo.find({sendto:loggedin_id,type:{$ne:'message'}})
    .populate("sentfrom")
    .populate("sendto")
    .then((results)=>{

        if(req.query.readonly!==undefined && req.query.readonly=="false"){
            results=results.filter(r=>!r.read);
        }
        res.status(200).send(results)
    })
    .catch(err=>console.log(err));

})

router.get("/latest",async (req,res,next)=>{
    
    var loggedin_id=req.session.user._id;
    await notificationsinfo.findOne({sendto:loggedin_id})
    .populate("sentfrom")
    .populate("sendto")
    .then((results)=>{
        res.status(200).send(results)
    })
    .catch(err=>console.log(err));

})

router.put("/:id/markasread",async (req,res,next)=>{
    
    var notificationsid=req.params.id;
    await notificationsinfo.findByIdAndUpdate(notificationsid,{read:true})
    .then(()=>res.sendStatus(204))
    .catch(err=>console.log(err));

})

router.put("/markasread",async (req,res,next)=>{
    
    await notificationsinfo.updateMany({sendto:req.session.user._id},{read:true})
    .then(()=>res.sendStatus(204))
    .catch(err=>console.log(err));

})

module.exports=router;