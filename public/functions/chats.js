var selectedusers=[];
var timer;

$(document).ready(()=>{
    $(".newsearchbox").keydown(event=>{
        clearTimeout(timer);
        var input=$(event.target);
        var value=input.val();

        if (value == "" && event.keyCode == 8) {
            console.log(selectedusers.length)
            selectedusers.pop();
            updateSelectedUsersHtml();
            $(".resultsContainer").html("");
    
            if(selectedusers.length == 0) {
                $("#createchatButton").prop("disabled", true);
            }
    
            return;
        }

        timer=setTimeout(()=>{
            value=input.val().trim();

            if(value==""){
                $(".supply").html("");
            }
            else{
                search(value);
            }

        },500)
    })
})

function search(value){
    var url="/api/users";
    var region=$(".supply");

    $.get(url,{data:value},(results)=>{
        region.html("");
        if(results.length>0){
            outputusertab(results,region,"Followers")
        }
        else{
            region.append("<span>NO RESULTS FOUND</span>");
        }
    })
}

function outputusertab(results,element,string){
    element.html("");
    results.forEach(result => {

        if(result._id == userjs._id || selectedusers.some(u => u._id == result._id)) {
            return;
        }

        var html=createtab(result,string);
        var selecting=$(html)
        selecting.click(()=>appendinto(result));

        element.append(selecting);
    });
}

function appendinto(user) {
    selectedusers.push(user);
    updateSelectedUsersHtml()
    $(".newsearchbox").val("").focus();
    $(".supply").html("");
    $("#createchatbutton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
    var elements = [];

    selectedusers.forEach(user => {
        var name = user.username;
        var button=`<button class="cancel"><i class="fa fa-times" aria-hidden="true"></i></button>`;
        var userElement = $(`<span class='selectedUser'>${button}${name}</span>`);
        elements.push(userElement);
    })

    $(".selectedUser").remove();
    $(".searchedusers").append(elements);
}

$(document).on("click", "button.cancel", function() {
    var parentElement = $(this).parent();
    var x=parentElement[0].innerText;

    index=0;
    selectedusers.forEach(user => {
        var name = user.username;
        if(name==x){
            selectedusers.splice(index,1);
        }
        index++;
    })

    if(selectedusers.length==0){
        $("#createchatbutton").prop("disabled", true);
    }
    updateSelectedUsersHtml();

});

$("#createchatbutton").click(event=>{
    
    var users=JSON.stringify(selectedusers);
    $.post("/api/chat",{data:users},(result)=>{
        window.location.href=`/chats/${result._id}`;
    })
    // $.ajax({
    //     url:"/api/chat",
    //     type:"post",
    //     data:users,
    //     contentType:'application/json',
    //     success:(result)=>{
    //         window.location.url=`/chats/${result._id}`;
    //     }
    // })
})

function createtab(result,string){

    var text="Following";
    if(string==="Followers"){
        if(result.followers && result.followers.includes(userjs._id)){
            text="Following";
        }
        else{
            text="Follow";
        }
    }

    var buttonclass =(text==="Following") ? "follow following" : "follow notfollowing"   
    var followbutton=""
    if(result._id != userjs._id){
        followbutton= `<div class='buttonprofile'><button class='${buttonclass}' data-id='${result._id}'>${text}</button></div>`;
    }
    return `
        <div class="profiletab">
            <div class="imgcontainerff"><img src=${result.profilepicture}></img></div>
            <div class="usernameff"><a href="/profile/${result.username}">${result.username}</a></div>
            ${followbutton}
        </div>
    `
}