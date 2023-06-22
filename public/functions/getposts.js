$(document).ready(()=>{
    $.get("/api/posts",{followingonly:true},(results)=>{
        outputpost(results,$(".supply"));
    })
})

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

$("#deletepostmodal").on("show.bs.modal",(event)=>{

    var button=$(event.relatedTarget);

    const closestelement = button.closest('.postcontainer');
    var a=closestelement[0];
    var b=a.attributes["data-id"];
    var c=b.nodeValue;
    var postId =c;

    
    $(".deletepostbutton").data("id",postId);

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

// $(document).ready(()=>{
//     $(document).on("click",".retweetbutton",(event)=>{
//             var element=$(event.target);
//             var isRoot = element.hasClass("postcontainer");
//             var rootElement = isRoot == true ? element : element.closest(".postcontainer");
//             var postId = rootElement.data().id;
        
//             if(postId === undefined) return alert("Post id undefined");

//             $.ajax({
//                 url:`/api/posts/${postId}/retweet`,
//                 type:'PUT',
//                 success:(data)=>{

//                     element.find("span").text(data.retweetusers.length || "")

//                     var userloggedin=userjs;
//                     if(data.retweetusers.includes(userloggedin._id)){
//                         element.addClass("active");
//                     }
//                     else{
//                         element.removeClass("active")
//                     }

//                 }
//             })
//     })
// })

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

