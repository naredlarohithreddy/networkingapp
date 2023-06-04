$(document).ready(()=>{
    $.get("/api/posts",(results)=>{
        outputpost(results,$(".supply"));
    })
})

function outputpost(results,element){
    element.html=""

    results.forEach(result => {

        $.getScript("/functions/submitinpost.js")
        .then(()=>{
            var html=createposthtml(result);
            element.append(html);
        })
        

    });

    if(results.length==0){
        element.append("<span class='noresults'>NO RESULTS FOUND</span>")
    }
}

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
                        console.log("yes");
                        element.addClass("active");
                    }
                    else{
                        element.removeClass("active")
                    }

                }
            })
    })
})
