const express=require('express');
const http=require("http");
const bodyparser=require('body-parser');
const userinfo=require("../schemas/userschema");
const postinfo=require("../schemas/postschema");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",(req,res,next)=>{

    const payload={
        userjs:JSON.stringify(req.session.user),
        userloggedin:req.session.user,
        user:userloggedin,
        postedby:JSON.stringify(user),
        title:"profile page",
    }
    payload.selectedtab="posts";

    res.status(200).render("profile",payload)
})

router.get("/:username/replies",async (req,res,next)=>{

    var payload=await createpayload(req.params.username,req.session.user)
    .catch(err=>{
        console.log(err)
    })
    payload.selectedtab="replies";

    res.status(200).render("profile",payload);
})

router.get("/:username/followers",async (req,res,next)=>{

    var payload=await createpayload(req.params.username,req.session.user)
    .catch(err=>{
        console.log(err)
    })
    payload.selectedtab="followers";

    res.status(200).render("followingandfollowers",payload);
})

router.get("/:username/following",async (req,res,next)=>{

    var payload=await createpayload(req.params.username,req.session.user)
    .catch(err=>{
        console.log(err)
    })
    payload.selectedtab="following";

    res.status(200).render("followingandfollowers",payload);
})

router.get("/:username",async (req,res,next)=>{

    var payload=await createpayload(req.params.username,req.session.user)
    .catch(err=>{
        console.log(err)
    })
    payload.selectedtab="posts";
    res.status(200).render("profile",payload);

})

async function createpayload(username,userloggedin){

    var profileuser=await userinfo.findOne({username:username})
    .catch(err=>{
        console.log(err)
    })

    if(profileuser==null){

        profileuser=await userinfo.findById(username)
        .catch(err=>{
            console.log(err)
        })
        
        if(profileuser==null){
            return {
                userjs:JSON.stringify(userloggedin),
                userloggedin:userloggedin,
                username:"not found",
                title:"profile page"
            }
        }
    }
    return {
        userjs:JSON.stringify(userloggedin),
        userloggedin:userloggedin,
        username:profileuser.username,
        user:profileuser,
        postedby:JSON.stringify(profileuser),
        title:"profile page"
    }

}

module.exports=router;