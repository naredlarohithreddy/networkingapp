const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const userinfo=require("../../schemas/userschema");
const postinfo=require("../../schemas/postschema");
const session=require("express-session");

app.set("view engine","pug");
app.set("views","views");

app.use(bodyparser.urlencoded({extended:false}))

router.get("/",async (req,res,next)=>{
    
    var results=await getPosts({});
    res.status(200).send(results);
    
})

router.get("/:id",async (req,res,next)=>{
    
    var postid=req.params.id;
    var results=await getPosts({_id:postid});
    results=results[0];
    res.status(200).send(results);
    
})

async function getPosts(filter) {

    var results = await postinfo.find(filter)
    .populate("user")
    .populate("retweetdata")
    .populate("commentdata")
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error))
    results=await postinfo.populate(results, { path: "retweetdata.commentdata"})
    results=await userinfo.populate(results, { path: "retweetdata.commentdata.user"})
    results=await userinfo.populate(results, { path: "commentdata.user"})
    return await userinfo.populate(results, { path: "retweetdata.user"});
}


router.post("/",async (req,res,next)=>{

    if(!req.body.content){
        return res.sendStatus(400);
    }

    var posteddata={
        content: req.body.content,
        user:req.session.user,
        postingimg :req.postingimg

    }
    
    if(req.body.commentdata){
        posteddata.commentdata=req.body.commentdata;
    }

    postinfo.create(posteddata)
    .then(async newpost=>{
        newpost=await postinfo.populate(newpost,{path:"commentdata"});
        newpost=await userinfo.populate(newpost,{path:"commentdata.user"});
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

router.put("/:id/retweet",async (req,res,next)=>{

    var postid=req.params.id;
    var usersession=req.session.user;
    var userid=usersession._id;

    var deletedpost=await postinfo.findOneAndDelete({user:userid,retweetdata:postid})
    .catch(err=>{
        console.log(err);
        res.sendStatus(400);
    })

    var option = (deletedpost!=null) ? "$pull" :"$addToSet";

    var repost=deletedpost;

    if(repost==null){
        repost=await postinfo.create({user:userid,retweetdata:postid})
        .catch(err=>{
            console.log(err);
            res.status(400);
        })
    }

    req.session.user=await userinfo.findByIdAndUpdate(userid, { [option]: { retweet: repost._id } },{new:true})
    .catch(err=>{
        console.log(err)
    })

    var post=await postinfo.findByIdAndUpdate(postid, { [option]: { retweetusers: userid } },{new:true})
    .catch(err=>{
        console.log(err)
    })
    

    res.status(200).send(post)

})

// router.put("/:id/comment:id1",async (req,res,next)=>{

//     var postid=req.params.id;
//     var commentedtopostid=req.params.id1;
//     var userid=req.session.user._id;

//     var option = "$addToSet";

//     var post=await postinfo.findByIdAndUpdate(postid, { [option]: { commentsposts: commentedtopostid } },{new:true})
//     .catch(err=>{
//         console.log(err)
//     })
    
//     res.status(200).send(post)

// })


module.exports=router;