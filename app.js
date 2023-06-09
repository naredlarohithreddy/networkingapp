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

const loginrouter=require("./routes/login");
const registerrouter=require("./routes/register");
const postrouter=require("./routes/api/posts");
const comment=require("./routes/comment")
const commentpostsrouter=require("./routes/api/commentposts");

app.use("/login",loginrouter);
app.use("/register",registerrouter);
app.use("/api/posts",postrouter);
app.use("/api/commentposts",commentpostsrouter);
app.use("/comment",comment);

app.get("/post",(req,res,next)=>{
    const payload={
        user:req.session.user
    }
    res.status(200).render("createpost",payload)
})
app.get("/",middleware.requirelogin,(req,res,next)=>{
    console.log(req.body)
    const payload={
        title:"app",
        user:req.session.user,
        userjs:JSON.stringify(req.session.user)
    }
    res.status(200).render("home",payload);
});


