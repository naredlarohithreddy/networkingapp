const http=require("http")
const express=require("express");

const app=express();
const middleware=require("./middleware")

app.set("view engine","pug");
app.set("views","views");

const loginrouter=require("./login")
app.use("/login",loginrouter);

app.get("/",middleware.requirelogin,(req,res)=>{
    res.status(200).render("home2",{title:"twitter",name:"Naredla RohithReddy"});
});

app.listen(3003,()=>{console.log("listening")});
