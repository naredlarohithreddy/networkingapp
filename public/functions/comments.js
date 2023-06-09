// $(document).ready(()=>{
//     const submitbutton=$("#submitcommentbutton");
//     submitbutton.prop("disabled",true);

//     var postcontainer=document.getElementsByClassName('postcontainer')[0];
//     var postid=postcontainer.getAttribute("data-id");

//     const supply=$(".supply");

//     $.get("/api/posts",results=>{
//         outputposts(results,postid,supply[0])
//     })

// })

// function outputposts(results,postid,element){
//     results.forEach(result=>{
//         if(result._id==postid){
//             if(result.commentsposts.length>0){
//                 result.commentsposts.forEach(post=>{
//                     var html=createcommenthtml(post);
//                     element.insertAdjacentHTML("beforeend",html);
//                 })
//             }
//         }
//     })
// }


$("#textareatobecommented").keyup(event=>{

    const textvalue=event.target.value.trim();
    
    const button=$("#submitcommentbutton")

    if(textvalue.length>0){
        button.prop("disabled",false);
        return;
    }

    button.prop("disabled",true)

})

$("#submitcommentbutton").click(()=>{

    const button=$("#submitcommentbutton")

    const supply=$(".supply")

    const username=document.getElementsByClassName("postcontainer");
    const a=username[0];
    const b=a.getAttribute("data-id");
    const postid=b;
    button.data("id",postid);

    const textarea=document.getElementById("textareatobecommented");
    const value=textarea.value;

    const postobject={
        topost : postid,
        content : value
    }

    textarea.value="";
    button.prop("disabled",true);

    $.post("/api/commentposts",postobject, postdata=>{
        var html=createcommenthtml(postdata);
        supply[0].insertAdjacentHTML("beforeend",html);
    })

})


function createcommenthtml(postdata){

    if(postdata._id===undefined){
        alert("not populated")
    }

    var postedby=postdata.user;
    var postedname=postedby.firstname+" "+postedby.lastname;
    var timestamp=timeDifference(new Date(),new Date(postdata.createdAt));

    return `
        <div class="mainpost">
            <div class="postcontainer" data-id="${postdata._id}">
                <div class="imgcontainer"> <img src="/images/default.jpg" alt="default"/></div>
                <div class="textcontainer"> 
                    <div class="post">
                            <div class="infoofpost">
                                <div class="username">${postedname}</div>
                                <div class="info">@${postedby.username}     ${timestamp}</div>
                            </div>
                            <div class="contentcontainer">
                                <div class="contentpost">${postdata.content}</div>
                                <div class="imageposted">   <img src="/images/default.jpg" alt="posted picture"/></div>
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
                <div class="optionscontainer"><a href="/postsettings"><i class="fa-solid fa-ellipsis"></i></a></div>
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