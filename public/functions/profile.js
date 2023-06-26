var cropper;

$(document).ready(()=>{
    if(selected=="posts"){
        $.get("/api/posts/",{user:postedby._id,isreply:false},(results)=>{
            outputprofilepost(results,$(".supplyprofile"));
        })
    }
    else{
        $.get("/api/posts/",{user:postedby._id,isreply:true},(results)=>{
            outputprofilepost(results,$(".supplyprofile"));
        })
    }
})

// $("#deletepostmodal").on("show.bs.modal",(event)=>{

//     var button=$(event.relatedTarget);

//     const closestelement = button.closest('.postcontainer');
//     var a=closestelement[0];
//     var b=a.attributes["data-id"];
//     var c=b.nodeValue;
//     var postId =c;

    
//     $(".deletepostbutton").data("id",postId);

// })

// $(".deletepostbutton").on("click",()=>{

//     var postId=$(".deletepostbutton").data().id;
//     $.ajax({
//         url:`/api/posts/${postId}`,
//         type:'DELETE',
//         success:(data)=>{
//             location.reload();
//         }
//     })
// })

$("#fileupload").change(event=>{
    const file=event.target.files[0];
    const reader=new FileReader();
    reader.onload=(e)=>{
        const image=document.createElement("img");
        image.src=e.target.result;
        $(".imagepreview").append(image)

        if(cropper!==undefined){
            cropper=null;
        }

        cropper=new Cropper(image,{
            aspectRatio:1/1,
            background:false,
        });

    }

    reader.readAsDataURL(file);
})

$("#cvupload").change(event=>{
    const file=event.target.files[0];
    const reader=new FileReader();
    reader.onload=(e)=>{
        const image=document.createElement("img");
        image.src=e.target.result;
        $(".cvpreview").append(image)

        if(cropper!==undefined){
            cropper=null;
        }

        cropper=new Cropper(image,{
            aspectRatio:3/1,
            background:false,
        });

    }

    reader.readAsDataURL(file);
})

$(".dpuploadbutton").click(event=>{
    var croppeddata=cropper.getCroppedCanvas();
    if(croppeddata==null){
        alert("could not upload image,please try after some time");
        return;
    }   

    croppeddata.toBlob((blob)=>{
        var formdata=new FormData();
        formdata.append("croppeddata",blob);

        $.ajax({
            url:"/api/users/profilepicture",
            type:"POST",
            processData:false,
            contentType:false,
            data:formdata,
            success:()=>location.reload(),
        })
    })
})

$(".cvuploadbutton").click(event=>{
    var croppeddata=cropper.getCroppedCanvas();
    if(croppeddata==null){
        alert("could not upload image,please try after some time");
        return;
    }   

    croppeddata.toBlob((blob)=>{
        var formdata=new FormData();
        formdata.append("croppeddata",blob);

        $.ajax({
            url:"/api/users/coverpicture",
            type:"POST",
            processData:false,
            contentType:false,
            data:formdata,
            success:()=>location.reload(),
        })
    })
})

$(".pinpost").on("click",()=>{

    var postId=$(".pinpost").data().id;
    $.ajax({
        url:`/api/posts/${postId}`,
        type:'PUT',
        success:(data)=>{
            location.reload();
        }
    })
})


$(document).ready(()=>{
    $(document).on("click",".follow",(event)=>{
        var button=$(event.target)
        var userid=button.data().id;

        $.ajax({
            url:`/api/users/${userid}/follow`,
            type:'PUT',
            success:(data,status,xhr)=>{
                console.log(data)
                if(xhr.status==404)return;

                const followerslabel=$("#followersvalue");

                var diff=1;
                if(data.following.includes(userid)){
                    console.log("yes")
                    button.removeClass("notfollowing");
                    button.addClass("following");
                    button[0].childNodes[0].data="Following";
                }
                else{
                    console.log("no")
                    button.removeClass("following");
                    button.addClass("notfollowing");
                    button[0].childNodes[0].data="Follow";
                    diff=-1;
                }

                if(followerslabel.length!=0){
                    var followersText = followerslabel.text();
                    followersText = parseInt(followersText);
                    followerslabel.text(followersText + diff);
                }
            }
        })
    })
})

function outputprofilepost(results,element){
    element.html=""
    results.forEach(async result => {
        if(result.pinned){
            var firsthtml=createprofileposthtml(result,true);
            const firstchild=element[0].childNodes[1];
            if(firstchild==undefined){
                element.append(firsthtml);
            }
            else{
                $(firsthtml).insertBefore($(firstchild));
            }
            var html=createprofileposthtml(result,false);
            element.append(html);
        }
        else{
            var html=createposthtml(result);
            element.append(html);
        }
    });
    if(results.length==0){
        element.append("<span class='noresults'>NO RESULTS FOUND</span>")
    }
}

function createprofileposthtml(postdata,bool){

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
        button=`<button type="button" class="postsettings" data-toggle="modal" data-target="#deleteunpinpostmodal"><i class="fa-solid fa-ellipsis"></i>
        </button>`
    }

    var imageappend="";

    if(postdata?.postingimg!=undefined){
        imageappend=`<div class="imageposted">   <img class="has" src=${postdata.postingimg} alt="posted picture"/></div>`;
    }

    var pinned="";
    if(postdata.pinned===true && bool){
        pinned=`<div class="pinnedtweet"> <i class="fa-solid fa-map-pin"></i>    pinned tweet</div>`;
    }

    return `
        <div class="mainpost">
            ${pinned}
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
    }function timeDifference(current, previous) {

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
    
    
    
}
