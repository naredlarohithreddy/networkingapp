const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const fs=require('fs');
const path=require('path');
const userinfo=require("../../schemas/userschema");
const multer=require("multer");


const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})

const upload=multer({storage})

app.set("view engine","pug");
app.set("views","views");

app.use(bodyparser.urlencoded({extended:false}))

router.get("/",async (req,res,next)=>{

    var searchobj=req.query;

    if(searchobj?.data!==undefined){
        if(searchobj?.data!==undefined){
            const regex = new RegExp(`.*${searchobj.data.split('').join('.*')}.*`, 'i');
            searchobj={
                $or:[
                    {firstname:{$regex:regex}},
                    {lastname:{$regex:regex}},
                    {username:{$regex:regex}},
                ]
            }
            delete searchobj.data;
        }
    }

    var user=await userinfo.find(searchobj)
    .populate("followers")
    .populate("following")
    .catch(err=>console.log(err));

    if(user==null){
        alert("User Not Found");
        res.sendStatus(404);
    }

    res.status(200).send(user);
})

router.put("/:userid/follow",async (req,res,next)=>{

    var userid=req.params.userid;
    var user=await userinfo.findById(userid);

    if(user==null){
        alert("User Not Found");
        res.sendStatus(404);
    }

    var loggedinuser=req.session.user;
    var following= user.followers && user.followers.includes(loggedinuser._id);

    var option=following?"$pull":"$addToSet";
    console.log(option)

    req.session.user = await userinfo.findByIdAndUpdate(req.session.user._id, { [option]: { following: userid } }, { new: true})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    await userinfo.findByIdAndUpdate(userid, { [option]: { followers: req.session.user._id } })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    res.status(202).send(req.session.user);

})

router.get("/:userid",async (req,res,next)=>{
    var userid=req.params.userid;
    var user=await userinfo.findById(userid)
    .populate("followers")
    .populate("following")
    .catch(err=>console.log(err));

    if(user==null){
        alert("User Not Found");
        res.sendStatus(404);
    }

    res.status(200).send(user);
})

router.post("/profilepicture",upload.single("croppeddata"),(req,res,next)=>{
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

            req.session.user=await userinfo.findByIdAndUpdate(req.session.user._id,{profilepicture:filepath},{new:true})
            .catch(err=>console.log(err))

            res.sendStatus(200);
        })
    }
})

router.post("/coverpicture",upload.single("croppeddata"),(req,res,next)=>{
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

            req.session.user=await userinfo.findByIdAndUpdate(req.session.user._id,{coverpicture:filepath},{new:true})
            .catch(err=>console.log(err))

            res.sendStatus(200);
        })
    }
})

module.exports=router;