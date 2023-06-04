const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const userinfo=require("../../schemas/userschema");
const postinfo=require("../../schemas/postschema");
const { user } = require('fontawesome');


app.use(bodyparser.urlencoded({extended:false}))

router.get("/",(req,res,next)=>{
    
    postinfo.find()
    .populate("user")
    .sort({"createdAt":-1})
    .then((results)=>{
        return res.status(200).send(results);
    })
    .catch(err=>{
        console.log(err);
    })
    
})

router.post("/",async (req,res,next)=>{

    if(!req.body.content){
        return res.sendStatus(400);
    }

    var posteddata={
        content: req.body.content,
        user:req.session.user,
        postingimg :req.postingimg

    }
    
    postinfo.create(posteddata)
    .then(async newpost=>{
        newpost=await userinfo.populate(newpost,{path:"user"});

        res.status(201).send(newpost);
    })
    .catch(error=>{
        console.log(error);
        res.sendStatus(400);
    })


})

router.put("/:id/like",async (req,res,next)=>{

    var postid=req.params.id;
    var userid=req.session.user._id;

    var liked= req.session.user.likes && req.session.user.likes.includes(postid);
    
    var option = liked ? "$pull" :"$addToSet";

    req.session.user=await userinfo.findByIdAndUpdate(userid, { [option]: { likes: postid } },{new:true})
    .catch(err=>{
        console.log(err)
    })

    var post=await postinfo.findByIdAndUpdate(postid, { [option]: { likes: userid } },{new:true})
    .catch(err=>{
        console.log(err)
    })
    

    res.status(200).send(post)

})

module.exports=router;