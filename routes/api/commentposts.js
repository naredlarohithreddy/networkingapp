const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const userinfo=require("../../schemas/userschema");
const postinfo=require("../../schemas/postschema");
const session=require("express-session");
const url=require('url');
const { comment } = require('fontawesome');

app.set("view engine","pug");
app.set("views","views");


app.use(bodyparser.urlencoded({extended:false}))

router.post("/",async (req,res,next)=>{

    if(!req.body.content){
        return res.sendStatus(400);
    }

    var posteddata={
        content: req.body.content,
        user:req.session.user,
        postingimg :req.body.postingimg,
        commentdata:req.body.topost
    }

    postinfo.create(posteddata)
    .then(async newpost=>{
        newpost=await postinfo.populate(newpost,{path:"commentdata"});
        newpost=await userinfo.populate(newpost,{path:"user"});
        newpost=await userinfo.populate(newpost,{path:"commentdata.user"});
        
        console.log(newpost)
        res.status(201).send(newpost);
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })
})

module.exports=router;