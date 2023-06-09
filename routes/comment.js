const express=require('express');
const http=require("http");
const bodyparser=require('body-parser');
const userinfo=require("../schemas/userschema");
const bcrypt=require("bcrypt");
const postinfo=require("../schemas/postschema");

const app=express();
const router=express.Router();

app.set("view engine","pug");
app.set("views","views");
app.use(bodyparser.urlencoded({extended:false}))


router.get("/",async (req,res,next)=>{

    var retweetedby = req.query.content;
    var postid = req.query.postid;
    var suser=req.session.user;

    await postinfo.findOne({_id:postid})
    .populate("user")
    .populate("retweetdata")
    .populate("commentdata")
    .sort({createdAt:-1})
    .then(async (results)=>{
        results=await postinfo.populate(results, { path: "retweetdata.commentdata"})
        results=await userinfo.populate(results, { path: "retweetdata.commentdata.user"})
        results=await userinfo.populate(results,{path:"commentdata.user"})
        results=await userinfo.populate(results,{path:"retweetdata.user"})

        var comment=results.commentdata!==undefined;
        var commentpost;
        var g,commenteduser;

        if(comment){
            commentpost=results.commentdata;
            g=commentpost.user;
            if(g===undefined){
                $.get("/api/posts/"+postid,result=>{
                    console.log("1")
                    console.log(result)
                    commentpost=result.commentdata;
                    g=commentpost.user;
                    commenteduser=g.username;
                    console.log(commenteduser);
                })
            }
            else if(g.username===undefined){
                $.get("/api/posts/"+postid,result=>{
                    console.log("2")
                    console.log(result)
                    commentpost=result.commentdata;
                    g=commentpost.user;
                    commenteduser=g.username;
                    console.log(commenteduser);
                })
            }
            else{
                console.log("3")
                if(g.username)commenteduser=g.username;
                console.log(commenteduser);
            }
        }
        
        

        //var retweettext="";


        var postedby=results.user;
        var postedname=postedby.firstname+" "+postedby.lastname;
        var timestamp=timeDifference(new Date(),new Date(results.createdAt));
        //var retweettext;
        // if(retweetedby && (retweetedby.length>0)){
        //     retweettext=`<span><i class="fas fa-retweet"></i>   retweeted by <a class="anchor" href="/profile/${retweetedby}">${retweetedby}</a></span>`;
        // }
        // const context="retweeted by"
        //retweettext:retweettext,
        const payload={
            postid:postid,
            retweetedby:retweetedby,
            
            results:results,
            postedname:postedname,
            postedby:postedby,
            timestamp:timestamp,
            suser:req.session.user,
            commentto:commenteduser
        }
        
        res.status(200).render("comment",payload);
    })
    .catch(err=>console.log(err));

})

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

module.exports=router;