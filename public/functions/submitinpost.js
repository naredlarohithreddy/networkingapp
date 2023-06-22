var cropper;
var croppeddata;

$(document).ready(()=>{
    const submitbutton=$("#submitpostbutton");
    submitbutton.prop("disabled",true);
})

$("#textareatobeposted").keyup(event=>{
    const textarea=event.target;
    const value=textarea.value.trim();

    const submitbutton=$("#submitpostbutton");

    if(submitbutton.length==0){
        return alert("no submit button");
    }

    if(value==""){
        submitbutton.prop("disabled",true);
        return;
    }

    submitbutton.prop("disabled",false);

})

$("#postpicupload").change(event=>{
    const file=event.target.files[0];
    const reader=new FileReader();
    reader.onload=(e)=>{
        const image=document.createElement("img");
        image.src=e.target.result;
        $(".postpicpreview").append(image)

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

$(".postpicuploadbutton").click(event=>{

    if(croppeddata!==undefined){
        croppeddata=null;
    }

    croppeddata=cropper.getCroppedCanvas();

    $('#postpicmodal').modal('hide');
    if(croppeddata!==undefined){
        console.log(croppeddata)
        const submitbutton=$("#submitpostbutton");
        submitbutton.prop("disabled",false);
    }

})

$("#submitpostbutton").click(async ()=>{

    const textarea=document.getElementById("textareatobeposted");
    const value=textarea.value.trim();

    var formdata=new FormData();
    console.log(croppeddata)
    if(croppeddata!==undefined){

        await new Promise((resolve) => {
            croppeddata.toBlob((blob) => {
              formdata.append("croppeddata", blob);
              resolve();
            });
        });

    }  

    $.ajax({
        url:"/api/posts",
        type:"POST",
        processData:false,
        contentType:false,
        headers: {
            "X-Value": value, // Send the value as a custom header
        } ,
        data:formdata,
        success:(postdata)=>{
            var html=createposthtml(postdata);
            textarea.val="";
            $(".postpicpreview").innerHTML="";
            $("#submitpostbutton").prop("disabled",true);
            
            var xhr=new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var homeHTML = xhr.responseText;
                    var parser = new DOMParser();
                    var parsedHTML = parser.parseFromString(homeHTML, 'text/html');
                    var targetElement = parsedHTML.querySelector('.supply');
                    targetElement.insertAdjacentHTML("afterbegin",html);
                    window.location.href="/";
                }
            };
            xhr.open('GET', '/', true);
            xhr.send();
        },
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
