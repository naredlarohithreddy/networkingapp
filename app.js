const http=require("http");
const express=require("express");
const path = require('path');
const bodyparser=require('body-parser');
const database=require('./database')

const app=express();
const middleware=require("./middleware")

app.listen(3002,()=>{console.log("listening")});
app.use(bodyparser.urlencoded({extended:false}))

app.set("view engine","pug");
app.set("views","views");

app.use(express.static(path.join(__dirname,"public")));
//anything inside the path served as static file

const loginrouter=require("./login")
const registerrouter=require("./register")
app.use("/login",loginrouter);
app.use("/register",registerrouter);


app.get("/",middleware.requirelogin,(req,res,next)=>{
    console.log(res.body)
    res.status(200).render("home",{title:"twitter",name:"Naredla RohithReddy"});
});


