$("#deletepostmodal").on("show.bs.modal",(event)=>{

    var button=$(event.relatedTarget);

    const closestelement = button.closest('.postcontainer');
    var a=closestelement[0];
    var b=a.attributes["data-id"];
    var c=b.nodeValue;
    var postId =c;

    
    $(".deletepostbutton").data("id",postId);
    $(".pinpost").data("id",postId);

})

$("#deleteunpinpostmodal").on("show.bs.modal",(event)=>{

    var button=$(event.relatedTarget);

    const closestelement = button.closest('.postcontainer');
    var a=closestelement[0];
    var b=a.attributes["data-id"];
    var c=b.nodeValue;
    var postId =c;

    
    $(".deletepostbutton").data("id",postId);
    $(".pinpost").data("id",postId);

})

$(".deletepostbutton").on("click",()=>{

    var postId=$(".deletepostbutton").data().id;
    $.ajax({
        url:`/api/posts/${postId}`,
        type:'DELETE',
        success:(data)=>{
            location.reload();
        }
    })
})

$(document).ready(()=>{
    $(document).on("click",".mainpost",(event)=>{
        var element=$(event.target);

        if(element.is("button"))return;
        if(element.is("a"))return;

            const closestelement = element.closest('.postcontainer');
            var a=closestelement[0];
            var parent=closestelement[0].parentElement;
            const retweetcontainer=element.closest(".retweetcontainer");
            var b=a.attributes["data-id"];
            var c=b.nodeValue;
            var postId =c;

            var d=parent?.childNodes[1];
            var e=d?.childNodes[0];
            var f,value;
            if(e && e.childNodes[2]){
                f=e.childNodes[2];
            }
            else{
                f="undefined";
            }
            if(f!="undefined"){
                value=f.innerText;
            }
        
            var data ={
                content:value,
                postid:postId,
            }
            var queryString = Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");

            window.location.href = "/posts?" + queryString;

    })
})

$(document).ready(()=>{
    $(document).on("click",".likebutton",(event)=>{
            var element=$(event.target);
            var isRoot = element.hasClass("postcontainer");
            var rootElement = isRoot == true ? element : element.closest(".postcontainer");
            var postId = rootElement.data().id;
        
            if(postId === undefined) return alert("Post id undefined");

            $.ajax({
                url:`/api/posts/${postId}/like`,
                type:'PUT',
                success:(data)=>{

                    element.find("span").text(data.likes.length || "")

                    var userloggedin=userjs;
                    if(data.likes.includes(userloggedin._id)){
                        element.addClass("active");
                    }
                    else{
                        element.removeClass("active")
                    }

                }
            })
    })
})

$(document).ready(()=>{
    $(document).on("click",".retweetbutton",(event)=>{
            var element=$(event.target);
            var isRoot = element.hasClass("postcontainer");
            var rootElement = isRoot == true ? element : element.closest(".postcontainer");
            var postId = rootElement.data().id;
        
            if(postId === undefined) return alert("Post id undefined");

            $.ajax({
                url:`/api/posts/${postId}/retweet`,
                type:'PUT',
                success:(data)=>{

                    element.find("span").text(data.retweetusers.length || "")

                    var userloggedin=userjs;
                    if(data.retweetusers.includes(userloggedin._id)){
                        element.addClass("active");
                    }
                    else{
                        element.removeClass("active")
                    }

                }
            })
    })
})

$(document).ready(()=>{
    $(document).on("click",".commentbutton",async (event)=>{

            var anchorElement = event.currentTarget.querySelector("a[href='/comment']");
            event.preventDefault();

            var element=$(event.target);
            const closestelement = element.closest('.postcontainer');
            var a=closestelement[0];
            var parent=closestelement[0].parentElement;
            const retweetcontainer=element.closest(".retweetcontainer");
            var b=a.attributes["data-id"];
            var c=b.nodeValue;
            var postId =c;

            var d=parent.childNodes[1];
            var e=d.childNodes[0];
            var f,value;
            if(e && e.childNodes[2]){
                f=e.childNodes[2];
            }
            else{
                f="undefined";
            }
            if(f!="undefined"){
                value=f.innerText;
            }
            var data ={
                content:value,
                postid:postId,
            }
            var queryString = Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");

            window.location.href = "/comment?" + queryString;
    })
})


function createposthtml(postdata){

    if(postdata._id===undefined){
        alert("not populated")
    }

    var isretweet=postdata.retweetdata!==undefined;
    var isretweet=postdata.retweetdata==null?0:1;

    var retweetedby=isretweet?postdata.user.username:null;
    postdata=isretweet?postdata.retweetdata : postdata;  

    var postid=postdata._id;
    var postedby=postdata.user;
    var postedname=postedby.firstname+" "+postedby.lastname;
    var timestamp=timeDifference(new Date(),new Date(postdata.createdAt));
    var comment=postdata.commentdata!==undefined;
    var commentpost;
    var g,commenteduser;

    if(comment){
        commentpost=postdata.commentdata;
        g=commentpost.user;
        if(g===undefined){
            $.get("/api/posts/"+postid,results=>{
                commentpost=results.commentData;
                g=commentpost.user;
                commenteduser=g.username;
                //console.log(commenteduser);
            })
        }
        else if(g.username===undefined){
            $.get("/api/posts/"+postid,results=>{
                commentpost=results.commentData;
                g=commentpost.user;
                commenteduser=g.username;
                //console.log(commenteduser);
            })
        }
        else{
            if(g.username)commenteduser=g.username;
            //console.log(commenteduser);
        }
    }
    
    var content="";
    if(postdata.content){
        content=postdata.content;
    }

    var retweettext="";
    var commentto="";
    if(commenteduser){
        commentto=`<div>commented to <a class="anchor" href="/profile/${commenteduser}">${commenteduser}</a></div>`;
    }
    
    if(isretweet){
        retweettext=`<span><i class="fas fa-retweet"></i>   retweeted by <a class="anchor" href="/profile/${retweetedby}">${retweetedby}</a></span>`;
    }

    var button="";
    if(postdata?.user?._id==userjs?._id){
        button=`<button type="button" class="postsettings" data-toggle="modal" data-target="#deletepostmodal"><i class="fa-solid fa-ellipsis"></i>
        </button>`
    }

    var imageappend="";

    if(postdata?.postingimg!=undefined){
        imageappend=`<div class="imageposted">   <img class="has" src=${postdata.postingimg} alt="posted picture"/></div>`;
    }

    return `
        <div class="mainpost">
            <div class="retweetcontainer">${retweettext}</div> 
            <div class="postcontainer" data-id="${postdata._id}">
                <div class="imgcontainer"> <img src=${postedby.profilepicture} alt="default"/></div>
                <div class="textcontainer"> 
                    <div class="post">
                            <div class="infoofpost">
                                <div class="username">
                                    <a href="/profile/${postedby.username}">${postedby.username}</a>
                                </div>
                                <!--<div class="info">@${postedby.username}     ${timestamp}</div>-->
                                ${commentto}
                            </div>
                            <div class="contentcontainer">
                                <div class="contentpost">${content}</div>
                                ${imageappend}
                            </div>
                    </div>
                    <div class="postFooter">
                        <div class="postButtonContainer">
                            <a href="/comment"><button class="commentbutton"><i class="far fa-comment"></i></button></a>
                        </div>
                        <div class="postButtonContainer green">
                            <button class="retweetbutton"><i class="fas fa-retweet"><span>${postdata.retweetusers.length||""}</span></i></button>
                        </div>
                        <div class="postButtonContainer red">
                            <button class="likebutton"><i class="far fa-heart"></i><span>${postdata.likes.length||""}</span></button>
                        </div>
                    </div>
                </div>
                <div class="optionscontainer">
                    ${button}
                </div>
            </div>
        </div>
    `;

}

function outputpost(results,element){
    element.html=""
    results.forEach(async result => {
        var html=createposthtml(result);
        element.append(html);
    });
    if(results.length==0){
        element.append("<span class='noresults'>NO RESULTS FOUND</span>")
    }
}

function outputPostsWithReplies(results,element){
    element.html("");

    var x=0,y=0;
    if(results?.commentData?._id!==undefined){
        var html = createpost(results.commentData)
        element[0].insertAdjacentHTML("afterbegin",html);
    }

    var mainPostHtml = createpost(results.postData, true)
    element[0].insertAdjacentHTML("beforeend",mainPostHtml);

    results.replies.forEach(result => {
        var html = createpost(result)
        element[0].insertAdjacentHTML("beforeend",html);
    });
}

function createpost(postdata,fontsize=false){

    if(postdata._id===undefined){
        alert("not populated")
    }

    var isretweet=postdata.retweetdata!==undefined;
    var retweetedby=isretweet?postdata.user.username:null;

    postdata=isretweet?postdata.retweetdata : postdata;  

    var postid=postdata._id;
    var postedby=postdata.user;
    var postedname=postedby.firstname+" "+postedby.lastname;
    var timestamp=timeDifference(new Date(),new Date(postdata.createdAt));
    var comment=postdata?.commentdata!==undefined;
    var commentpost;
    var g,commenteduser;

    if(comment){
        commentpost=postdata.commentdata;
        g=commentpost.user;
        if(g===undefined){
            $.get("/api/posts/"+postid,results=>{
                commentpost=results.commentData;
                g=commentpost.user;
                commenteduser=g.username;
                console.log(commenteduser);
            })
        }
        else if(g.username===undefined){
            $.get("/api/posts/"+postid,results=>{
                commentpost=results.commentData;
                g=commentpost.user;
                commenteduser=g.username;
                console.log(commenteduser);
            })
        }
        else{
            if(g.username)commenteduser=g.username;
            console.log(commenteduser);
        }
    }
    
    var commentto="";
    if(commenteduser){
        commentto=`<div>commented to <a class="anchor" href="/profile/${commenteduser}">${commenteduser}</a></div>`;
    }

    var button="";
    if(postdata.user._id==userjs._id){
        button=`<button type="button" class="postsettings" data-toggle="modal" data-target="#deletepostmodal"><i class="fa-solid fa-ellipsis"></i>
        </button>`
    }

    var imageappend="";

    if(postdata?.postingimg!=undefined){
        imageappend=`<div class="imageposted"> <img class="has" src=${postdata.postingimg} alt="posted picture"/></div>`;
    }

    return `
        <div class="mainpost">
            <div class="postcontainer" data-id="${postdata._id}">
                <div class="imgcontainer"> <img src=${postedby.profilepicture} alt="default"/></div>
                <div class="textcontainer"> 
                    <div class="post">
                            <div class="infoofpost">
                                <div class="username">
                                    <a href="/profile/${postedby.username}">${postedby.username}</a>
                                </div>
                                <!--<div class="info">@${postedby.username}     ${timestamp}</div>-->
                                ${commentto}
                            </div>
                            <div class="contentcontainer">
                                <div class="contentpost">${postdata.content}</div>
                                ${imageappend}
                            </div>
                    </div>
                    <div class="postFooter">
                        <div class="postButtonContainer">
                            <a href="/comment"><button class="commentbutton"><i class="far fa-comment"></i></button></a>
                        </div>
                        <div class="postButtonContainer green">
                            <button class="retweetbutton"><i class="fas fa-retweet"><span>${postdata.retweetusers.length||""}</span></i></button>
                        </div>
                        <div class="postButtonContainer red">
                            <button class="likebutton"><i class="far fa-heart"></i><span>${postdata.likes.length||""}</span></button>
                        </div>
                    </div>
                </div>
                <div class="optionscontainer">
                    ${button}
                </div>
            </div>
        </div>
        
    `;

}

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
