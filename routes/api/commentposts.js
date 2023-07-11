const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const userinfo=require("../../schemas/userschema");
const postinfo=require("../../schemas/postschema");
const notificationinfo=require("../../schemas/notificationschema");

app.set("view engine","pug");
app.set("views","views");

const fs=require('fs');
const path=require('path');
const multer=require("multer");
const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})
const upload=multer({storage})


app.use(bodyparser.urlencoded({extended:false}))

router.post("/",upload.single("croppeddata"),(req,res,next)=>{
    const file=req.file;

    if(file!=null){
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

    content=req.headers['x-variable2'];
    postid=req.headers['x-variable1'];

    var posteddata={
        content: content,
        user:req.session.user,
        postingimg :filepath,
        commentdata:postid
    }

    postinfo.create(posteddata)
    .then(async newpost=>{
        newpost=await postinfo.populate(newpost,{path:"commentdata"});
        newpost=await userinfo.populate(newpost,{path:"user"});
        newpost=await userinfo.populate(newpost,{path:"commentdata.user"});

        var string=req.session.user._id.toString();
        if(req.session.user._id!=newpost.user._id){
            
            await notificationinfo.insertNotification(req.session.user._id,newpost.commentdata.user._id,"comment",newpost._id)
            .catch(err=>console.log(err));
        }
            
        res.status(201).send(newpost);
    })
})

module.exports=router;