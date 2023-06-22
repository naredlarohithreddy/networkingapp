$(document).ready(() => {
    $.get("/api/posts/" + postid, results => {
        outputPostsWithReplies(results, $(".supply"));
    })
})

function outputPostsWithReplies(results,element){
    element.html("");

    var x=0,y=0;
    if(results?.commentData?._id!==undefined){
        var html = createpost(results.commentData)
        element[0].insertAdjacentHTML("afterbegin",html);
    }

    var mainPostHtml = createpost(results.postData, true)
    element[0].insertAdjacentHTML("beforeend",mainPostHtml);

    if(results?.postData?.replies?.length>0){
        results?.postData?.replies.forEach(result => {
            var html = createpost(result)
            element[0].insertAdjacentHTML("beforeend",html);
        });
    }
}



