$(document).ready(()=>{
    $.get("/api/chat",(results)=>{
        createchathtml(results);
    })
})

function createchathtml(results){
    var element=$(".supplynew");
    element.html("");
    results.forEach(result=>{
        var html=createchattab(result);
        var selectedtab=$(html)
        selectedtab.click(()=>{
            window.location.href=`/chats/${result._id}`;
        })
        element.append(selectedtab);
    })
}

function createchattab(result){
    
    var latestmessage="THIS IS THE LATEST MESSAGE"
    if(result.chatname===""){
        var chatname="";
        result.users.forEach(x=>{
            chatname+=x.username
            chatname+=','
        });
        chatname=chatname.slice(0,-1);
    }

    var profileimg="";

    result.users.forEach(x=>{
        if(x.profilepicture!==undefined){
            var src=`${x.profilepicture}`;
            profileimg+=`<img src=${src} alt="default"/>`
        }
    });

    return `
        <div class="onechat" data-id=${result._id}>
            <div class="chatimg ">${profileimg}</div>
            <div class="chattab">
                <div class="chatname">${chatname}</div>
                <div class="latestmessage">
                    <span class="lastestmsgspan">
                        ${latestmessage}
                    </span>
                </div>
            </div>
        </div>
    `

}