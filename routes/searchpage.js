const express=require('express');
const bodyparser=require('body-parser');
const userinfo=require("../schemas/userschema");
const postinfo=require("../schemas/postschema");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",async (req,res,next)=>{

    const payload=createpayload(req.session.user,"posts");
    return res.status(200).render("searchpage",payload);

})

router.get("/posts",async (req,res,next)=>{
    
    const payload=createpayload(req.session.user,"posts");
    return res.status(200).render("searchpage",payload);


})

router.get("/users",async (req,res,next)=>{
    
    const payload=createpayload(req.session.user,"users");
    return res.status(200).render("searchpage",payload);


})

function createpayload(userloggedin,string){
    return {
        title:"Search",
        user:userloggedin,
        userjs:JSON.stringify(userloggedin),
        selectedtab:string
    }
}

module.exports=router;