$(document).ready(()=>{
    $.get("/api/posts",{followingonly:true},(results)=>{
        outputpost(results,$(".supply"));

    })
})

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



