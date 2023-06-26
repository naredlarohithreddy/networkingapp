const http=require("http");
const express=require("express");
const path = require('path');
const bodyparser=require('body-parser');
const database=require('./database')
const session=require("express-session");
const app=express();
const middleware=require("./middleware");

const server=app.listen(3003,()=>{console.log("listening")});
const io=require("socket.io")(server);

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
const messagesrouter=require("./routes/api/messages");

app.use("/api/posts",postrouter);
app.use("/api/commentposts",commentpostsrouter);
app.use("/api/messages",messagesrouter);

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


io.on("connection",(socket)=>{
    console.log("connected")
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    // socket.on("chat submit",input=>console.log(input));
    socket.on("setup",(userdata)=>{
        socket.join(userdata._id)
        socket.emit("connected")
    })
    socket.on("join room",(chatid)=>{
        socket.join(chatid)
    })
    socket.on("typing",roomid=>socket.in(roomid).emit("typing"));
    socket.on("stop typing", roomid => socket.in(roomid).emit("stop typing"));
})

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


