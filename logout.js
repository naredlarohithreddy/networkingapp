const express=require("express");
const path = require('path');
const bodyparser=require('body-parser');
const database=require('./database')
const session=require("express-session");

const router=express.Router();
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",(req,res,next)=>{
    if(req.session){
        req.session.destroy(()=>{
            return res.redirect("/login");
        })
    }
})


