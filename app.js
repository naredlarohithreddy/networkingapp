const http=require("http");
const express=require("express");
const path = require('path');
const bodyparser=require('body-parser');
const database=require('./database')
const session=require("express-session");


const app=express();
const middleware=require("./middleware")

app.listen(3002,()=>{console.log("listening")});
app.use(bodyparser.urlencoded({extended:false}))
app.use(session({
    secret:"Rohith",//used to authenticate a session
    saveUninitialized:true,//session is created but not modified
    resave:false,
    unset:'destroy'
}))

app.set("view engine","pug");
app.set("views","views");

app.use(express.static(path.join(__dirname,"public")));
//anything inside the path served as static file

const loginrouter=require("./login")
const registerrouter=require("./register")
app.use("/login",loginrouter);
app.use("/register",registerrouter);

app.get("/post",(req,res,next)=>{
    const payload={
        user:req.session.user
    }
    res.status(200).render("createpost",payload)
});

app.get("/",middleware.requirelogin,(req,res,next)=>{
    console.log(req.body)
    const payload={
        title:"app",
        user:req.session.user
    }
    res.status(200).render("home",payload);
});


