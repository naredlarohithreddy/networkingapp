const express=require('express');
const bodyparser=require('body-parser');
const app=express();
const router=express.Router();
const userinfo=require("../schemas/userschema");
const bcrypt=require("bcrypt");

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}))

router.get("/",(req,res,next)=>{
    res.status(200).render("register");
})

router.post("/",async (req,res,next)=>{

    var firstname=req.body.firstname.trim();
    var lastname=req.body.lastname.trim();
    var username=req.body.username.trim();
    var email=req.body.email.trim();
    var password=req.body.password;

    payload=req.body;

    if(firstname && lastname && email && username && password){
        let user= await userinfo.findOne({
            '$or' : [
                {username:username},
                {email:email}
            ]
        })
        .catch((error)=>{

            console.log(error);
            payload.error="Something Went wrong";
            res.status(200).render("register",payload);

        })

        if(user==null){

            var data = req.body;

            var password=data.password;
            let hash= await bcrypt.hash(password,10);
            data.password=hash;
            
            userinfo.create(data)
            .then((user)=>{
                req.session.user=user;
                return res.redirect("/");
            }) 

        }
        else{

            if(user.email==email){
                payload.error="Email already exists";
            }
            else{
                payload.error="username already exists";
            }
            res.status(200).render("register",payload);
        }
    }
    else{
        
        payload.error="fill the detials correctly";
        res.status(200).render("register",payload);
        
    }

})

module.exports=router;