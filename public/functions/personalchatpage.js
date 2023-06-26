var typing=false;
var lastTypingTime;

$(document).ready(()=>{

    socket.emit("join room",chatid)
    socket.on("typing",()=>{$(".typing").show();});
    socket.on("stop typing", () => $(".typing").hide());
    

    $.get(`/api/chat/${chatid}`,(results)=>{
        var content;
        if(results.chatname===""){
            content=createname(results)
        }
        else{
            content=results.chatname
        }
        var span=$("#personalchatname")[0];
        span.textContent=content;
    })

    $.get(`/api/chat/${chatid}/messages`,(results)=>{
        
        var messages=[];
        var lastsenderid='';

        results.forEach((message,index)=>{
            var html=createelement(message,results[index+1],lastsenderid);
            messages.push(html)

            lastsenderid=message.sentuser._id;
        })

        var messageelement=messages.join("");
        $(".showmessages").append(messageelement);
        scrolltoheight(false);

        $(".loadingspin").remove();
        $(".showmessages").css("visibility","visible");
        $(".chatfooter").css("visibility","visible");
        
    })
})

function createname(result){
        chatname="";
        result.users.forEach(x=>{
            chatname+=x.username
            chatname+=','
        });
        chatname=chatname.slice(0,-1);
        return chatname;
}

$(".chatnameinput").keyup(event=>{
    
    var value=$(event.target).val().trim();
    if(value!==""){
        $("#postchatbutton").prop("disabled",false);
    }
})

$(".postchatbutton").click((event)=>{
    
    var value=$("#chatnameinput").val().trim();
    $.ajax({
        url:`/api/chat/${chatid}`,
        type:"PUT",
        data:{chatname:value},
        success:(results)=>{
            window.location.reload();
        }
    })
    $("#chatnameinput").val("");
    value="";
    $("#chatname").modal('hide');
})

$(".chatnameinput").keydown((event)=>{

    if(!connected) return;

    if(!typing) {
        typing = true;
        socket.emit("typing", chatid);
    }

    lastTypingTime = new Date().getTime();
    var timerlength = 3000;

    setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerlength && typing) {
            socket.emit("stop typing", chatid);
            typing = false;
        }
    }, timerlength);
})

$("#postchatbutton").click(()=>{
    var value=$(".chatnameinput").val().trim();
    var x=value;
    socket.emit("chat submit",x);
    var showmessages=$(".showmessages");
    $.post(`/api/messages/${chatid}`,{content:value})
        .done((results, status, xhr) => {
            console.log(results)
            if(xhr.status!=202){
                alert("could not load the message");
                $(".chatnameinput")[0].value=x;
                return;
            }

            var html=createelement(results,null,"");
            showmessages.append(html);
            scrolltoheight(false);
            

        })
    
        socket.emit("stop typing", chatid);
        typing = false;
    $(".chatnameinput").val("");
    value="";
})

function createelement(results,nextmsg,lastsenderid){

    var sender=results.sentuser;
    var sendername=sender.username;

    var currentsenderid=sender._id;
    var nextsenderid=nextmsg!=null? nextmsg.sentuser._id:"";

    var isfirst=lastsenderid!=currentsenderid
    var islast=nextsenderid!=currentsenderid

    var ismine=results.sentuser._id==userjs._id;
    var classname=ismine?"mine":"others";

    var senderhtml="";
    if(isfirst){
        classname+=" first"

        if(!ismine){
            senderhtml=`<span class="sendername">${sendername}</span>`
        }
    }

    var profileimg="";
    if(islast){
        classname+=" last"

        profileimg=`<img src=${sender.profilepicture}/>`;
    }

    var imagecontainer="";
    if(!ismine){
        imagecontainer=`<div class="chatimgcontainer">
                            ${profileimg}
                        </div>`
    }

    return `<li class="messages ${classname}">
                ${imagecontainer}
                <div class="msgcontainer">
                    ${senderhtml}
                    <span class="messagebody">
                        ${results.content}
                    </span>
                </div>
            </li>`
    
}

function scrolltoheight(animated){
    var container=$(".showmessages");
    var scrollheight=container[0].scrollHeight;

    if(animated){
        container.animate({scrollTop:scrollheight},"slow");
    }
    else{
        container.scrollTop(scrollheight)
    }
}