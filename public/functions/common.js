$(document).ready(()=>{
    //wait with timer
    notificationbadge();
    messagebadge();
})

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
            var b=a?.attributes["data-id"];
            var c=b?.nodeValue;
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
                        emitnotification(data.user)
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
                        emitnotification(data.user)
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


function createposthtml(postdata,like=false,retweet=false){

    if(postdata._id===undefined){
        alert("not populated")
    }
    var likeclass="",retweetclass="";
    if(like)likeclass="active"
    if(retweet)retweetclass="active"

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
            })
        }
        else if(g.username===undefined){
            $.get("/api/posts/"+postid,results=>{
                commentpost=results.commentData;
                g=commentpost.user;
                commenteduser=g.username;
            })
        }
        else{
            if(g.username)commenteduser=g.username;
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
                            <button class="retweetbutton ${retweetclass}"><i class="fas fa-retweet"><span>${postdata.retweetusers.length||""}</span></i></button>
                        </div>
                        <div class="postButtonContainer red">
                            <button class="likebutton ${likeclass}"><i class="far fa-heart"></i><span>${postdata.likes.length||""}</span></button>
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
    var userlogged=userjs;
    var id=userlogged._id.toString();
    results.forEach(async result => {
        console.log(result)
        var html;
        if(result.likes.includes(id) && result.retweetusers.includes(id)){
            html=createposthtml(result,true,true);
        }
        else if(result.likes.includes(id)){
            html=createposthtml(result,true);
        }
        else if(result.retweetusers.includes(id)){
            html=createposthtml(result,false,true);
        }
        else{
            html=createposthtml(result);
        }
        
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

function realtimemessage(message){
    if($(".showmessages").length==0){
        showmessagepopup(message)
        if(window.location.pathname=="/chats"){
            location.reload();
        }
        messagebadge();
    }
    else{
        var showmessages=$(".showmessages");
        displaymessage(showmessages,message);
        var id=message._id.toString();
        function makeAjaxRequest() {
            return new Promise(function(resolve, reject) {
              $.ajax({
                url: `/api/messages/update/${id}`,
                type: "PUT",
                data: id,
                success: function(results) {
                  resolve(results);
                },
                error: function(err) {
                  reject(err);
                }
              });
            });
          }
          
          makeAjaxRequest()
            .then(function(results) {
              messagebadge();
            })
            .catch(function(err) {
              console.log(err);
            });
    }
}

function messagebadge(){
    $.get("/api/chat",{readonly:false},(results)=>{
        var size=results.length;
        console.log(results)
        if(size>0){
            $("#messagesbadge").text(size).addClass("active");
        }
        else{
            $("#messagesbadge").text("").removeClass("active")
        }
    })
}

function markasread(notificationid=null,callback=null){
    if(callback==null)callback=()=>location.reload();

    var url=notificationid!=null?`api/notifications/${notificationid}/markasread`:`api/notifications/markasread`;

    $.ajax({
        url:url,
        type:"PUT",
        success:()=>callback()
    })
}

function notificationbadge(){
    $.get("/api/notifications",{readonly:false},(results)=>{
        var size=results.length;
        if(size>0){
            $("#notificationsbadge").text(size).addClass("active");
        }
        else{
            $("#notificationsbadge").removeClass("active")
        }
    })
}

function showmessagepopup(data){
    console.log(data);
    var html=createchat(data);
    var element=$(html);
    element.hide().prependTo("#notificationlist").slideDown("fast");

    setTimeout(()=>element.fadeOut(400),5000);
}

function createchat(results){

    
    var sendername=results.chatid.chatname;
    var sender=results.sentuser;
    var name=sender.username;

    var senderhtml="";
    senderhtml=`<span class="sendername">${sendername}</span>`

    var profileimg="";
    profileimg=`<img src=${sender.profilepicture}/>`;

    var imagecontainer="";
    imagecontainer=`<div class="chatimgcontainer">
                            ${profileimg}
                        </div>`

    return `<li class="messages">
                ${imagecontainer}
                <div class="msgcontainer">
                    ${senderhtml}
                    <div class="maincon">
                        <span class="sentname">
                            ${name}  :
                        </span>
                        <span class="messagebody">
                            ${results.content}
                        </span>
                    </div>
                </div>
            </li>`
    
}

function shownotificationpopup(data){
    var html=createnotihtml(data);
    var element=$(html);
    element.hide().prependTo("#notificationlist").slideDown("fast");

    setTimeout(()=>element.fadeOut(400),5000);
}

function createnotihtml(result){

    var sentfrom=result.sentfrom.username;
    var message = getNotificationText(result);
    var profileimg=`<img src=${result.sentfrom.profilepicture} alt="default"/>`;
    var href=getNotificationUrl(result);
    var className = result.read ? "" : "active";

    return `
        <a href='${href}' class="notify ${className}" data-id=${result._id}>
            <div class="notiimg">${profileimg}</div>
            <div class="latestnotify">
                <span class="lastestnotifyspan">
                    ${message}
                </span>
            </div>
        </a>
    
    `
}

function getNotificationText(result) {

    var sentfrom = result.sentfrom;

    var sentfromName = `${sentfrom.username}`;
    
    var text;

    if(result.type == "retweet") {
        text = `${sentfromName} retweeted one of your posts`;
    }
    else if(result.type == "like") {
        text = `${sentfromName} liked one of your posts`;
    }
    else if(result.type == "comment") {
        text = `${sentfromName} replied to one of your posts`;
    }
    else if(result.type == "follow") {
        text = `${sentfromName} followed you`;
    }

    return text;
}

function getNotificationUrl(result) { 
    var url = "#";

    if(result.type == "retweet" || 
        result.type == "like" || 
        result.type == "comment") {
            
        url = `/posts/${result.entity}`;
    }
    else if(result.type == "follow") {
        url = `/profile/${result.entity}`;
    }

    return url;
}