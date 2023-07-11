const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const fs=require('fs');
const path=require('path');
const userinfo=require("../../schemas/userschema");
const postinfo=require("../../schemas/postschema");
const notificationinfo=require("../../schemas/notificationschema");

const multer=require("multer");
const { profile } = require('console');

const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})

const upload=multer({storage})

app.set("view engine","pug");
app.set("views","views");

app.use(bodyparser.urlencoded({extended:false}))

router.get("/",async (req,res,next)=>{

    var profileobj=req.query;
    if(profileobj?.isreply!==undefined){
        var reply=profileobj.isreply=="true";
        profileobj.commentdata={$exists:reply};
        delete profileobj.isreply;
        
    }
    if(profileobj?.followingonly!==undefined){
        var following=profileobj.followingonly==true;

        var objectids=[];
        req.session.user.following.forEach(element => {
            objectids.push(element);
        });
        
        objectids.push(req.session.user._id);
        profileobj.user={$in:objectids};

        delete profileobj.followingonly;
    }

    if(profileobj?.data!==undefined){
        const regex = new RegExp(`.*${profileobj.data.split('').join('.*')}.*`, 'i');
        profileobj.content={$regex:regex};
        delete profileobj.data;
    }

    var results=await getPosts(profileobj);
    res.status(200).send(results);
    
})

router.get("/:id",async (req,res,next)=>{
    
    var postid=req.params.id;
    var results=await getPosts({_id:postid});
    results=results[0];

    var result = {
        postData: results
    }

    if(results?.commentdata !== undefined) {
        result.commentData = results.commentdata;
        result.replies = await getPosts({ commentdata: postid });
    }

    res.status(200).send(result);
    
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


router.post("/",upload.single("croppeddata"),async (req,res,next)=>{

    const file=req.file;
    var filepath,temppath,targetpath;

    if(file!==undefined){
        var filepath=`/uploads/images/${req.file.filename}.jpeg`
        var temppath=req.file.path;
        var targetpath=path.join(__dirname+`../../..${filepath}`)

        fs.rename(temppath,targetpath,async err=>{
            if(err!=null){
                console.log(err);
                return res.sendStatus(400);
            }
        })

    }
    

    const value=req.headers['x-value']

    var posteddata={
        content: value,
        user:req.session.user,
        postingimg :filepath,
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
    
    var string=req.session.user._id.toString();

    if(!liked && string!=post.user._id){

        await userinfo.find({retweet:{$elemMatch:{$eq:post._id}}})
        .then((rusers)=>{
            rusers.forEach(async ruser=>{
                if(ruser._id!=string && ruser._id!=post.user._id){
                    await notificationinfo.insertNotification(req.session.user._id,ruser._id,"like",post._id)
                    .catch(err=>console.log(err));
                }
            })
        })
        await notificationinfo.insertNotification(req.session.user._id,post.user._id,"like",post._id)
        .catch(err=>console.log(err));
    }

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
    
    var string=req.session.user._id.toString();
    if(!deletedpost && string!=post.user._id){
        await notificationinfo.insertNotification(req.session.user._id,post.user._id,"retweet",repost._id)
        .catch(err=>console.log(err));
    }

    res.status(200).send(post)

})

router.delete("/:id",async (req,res,next)=>{

    var postid=req.params.id;
    var result=await postinfo.findById(postid);

    if(result?.postingimg!==undefined){
        var filepath=path.join(__dirname+"../../../"+result.postingimg)
        fs.unlink(filepath,err=>{
            console.log(err);
        })
    }

    await postinfo.deleteMany({commentdata:postid})
    .then(async ()=>await postinfo.deleteMany({retweetdata:postid}))
    .then(async()=>await postinfo.findByIdAndDelete(postid))
    .then(()=>{res.status(202).send("deleted");})
    .catch(err=>{
        console.log(err);
    })

})

router.put("/:id",async (req,res,next)=>{
    var postid=req.params.id;
    var result=await postinfo.findById(postid);

    var user=result.user;

    if(result.pinned===false){

        var allposts = await postinfo.find({ user: user }).catch(err => console.log(err));

        var numberofpinned=0;
        var postpinned=[];

        await allposts.forEach(post=>{
            if(post.pinned){
                numberofpinned++;
                postpinned.push(post)
            }
        })

        if(numberofpinned==2){
            var toberemovedfrompinned=postpinned.pop();
            await postinfo.findByIdAndUpdate(toberemovedfrompinned._id,{pinned:false})
            .catch(err=>console.log(err));
        }
    }


    if(result.pinned===false){
        await postinfo.findByIdAndUpdate(postid,{pinned:true})
        .catch(err=>console.log(err));

        return res.status(204).send('yes');
    }

    if(result.pinned===true){
        await postinfo.findByIdAndUpdate(postid,{pinned:false})
        .catch(err=>console.log(err));

        return res.status(204).send('yes');
    }
})

module.exports=router;
