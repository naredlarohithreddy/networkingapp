const http=require("http");
const express=require("express");
const path = require('path');
const bodyparser=require('body-parser');
const database=require('./database')
const session=require("express-session");


const app=express();
const middleware=require("./middleware");

app.listen(3003,()=>{console.log("listening")});
app.use(bodyparser.urlencoded({extended:false}));
//session middleware function
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

const comment=require("./routes/comment")

const displayposts=require("./routes/displaypost");
const profilerouter=require("./routes/profileroute");

const uploadsrouter=require("./routes/uploads");
const searchrouter=require("./routes/searchpage");
const chatspage=require("./routes/chatspage");

const postrouter=require("./routes/api/posts");
const commentpostsrouter=require("./routes/api/commentposts");
const getprofiledetails=require("./routes/api/users");
const chatsrouter=require("./routes/api/chats");
app.use("/api/posts",postrouter);
app.use("/api/commentposts",commentpostsrouter);

app.use("/login",loginrouter);
app.use("/register",registerrouter);
app.use("/api/users",getprofiledetails);
app.use("/api/chat",chatsrouter);

app.use("/comment",comment);
app.use("/posts",middleware.requirelogin,displayposts);
app.use("/profile",profilerouter);
app.use("/uploads",uploadsrouter);
app.use("/search",searchrouter);
app.use("/chats",chatspage);


app.get("/post",(req,res,next)=>{
    const payload={
        user:req.session.user,
        userjs:JSON.stringify(req.session.user)
    }
    res.status(200).render("createpost",payload)
})

app.get("/",middleware.requirelogin,(req,res,next)=>{
    const payload={
        title:"app",
        user:req.session.user,
        userjs:JSON.stringify(req.session.user)
    }
    res.status(200).render("home",payload);
});


