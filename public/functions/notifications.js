$(document).ready(()=>{
    $.get("/api/notifications",(results)=>{
        var element=$(".supplynew");
        createnotificationhtml(element,results);
    })
})


function createnotificationhtml(element,results){
    element.html("");

    results.forEach(result=>{
        var html=createnotihtml(result);
        element.append(html);
    })

}

$(document).on("click",".notify.active",(e)=>{
    var element=$(e.target)
    var notificationid=element.data().id;

    var href=element.attr("href");
    e.preventDefault();

    var callback=()=>window.location.href=href;
    markasread(notificationid,callback)
})

$("#markallasread").click((e)=>{
    var element=$(e.target)

    markasread()
})

