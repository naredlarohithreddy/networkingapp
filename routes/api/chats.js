const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const fs=require('fs');
const path=require('path');
const userinfo=require("../../schemas/userschema");
const chatinfo=require("../../schemas/chatschema");
const multer=require("multer");


const storage=multer.diskStorage({
    destination: path.join(__dirname,"../../uploads/images/")
})

const upload=multer({storage})

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))

router.post("/",async (req,res,next)=>{
    var selectedusers=JSON.parse(req.body.data);

    const obj={
        chatname:"newchat",
        users:selectedusers,
        groupchat:true
    }

    await chatinfo.create(obj)
    .then((results)=>res.status(202).send(results))
    .catch(err=>console.log(err));
})

module.exports=router;