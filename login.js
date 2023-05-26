const express=require('express');
const http=require("http");

const app=express();
const router=express.Router();

app.set("views","views");
app.set("views engine","pug");

router.get("/",(req,res)=>{
    res.status(200).render("login2.pug");
})

module.exports=router;