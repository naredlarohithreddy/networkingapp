$(document).ready(()=>{
    $(".searchbox").keydown(event=>{
        var input=$(event.target);
        var value;

        setTimeout(()=>{
            value=input.val().trim();

            if(value==""){
                $(".supplysearch").html="";
            }
            else{
                search(value,selectedtab);
            }

        },500)
    })
})

function search(value,selectedtab){
    var url=selectedtab=="users"?"/api/users":"/api/posts";
    var region=$(".supplysearch");
    var element=region[0]

    $.get(url,{data:value},(results)=>{
        element.innerHTML="";
        console.log(results)
        if(selectedtab=="posts" && results.length>0){
            outputpost(results,region);
        }
        else if(selectedtab=="users" && results.length>0){
            outputusertab(results,region,"Followers")
        }
        else{
            element.innerHTML="<span>NO RESULTS FOUND</span>"
        }
    })
}

function outputusertab(results,element,string){
    element.html="";
    results.forEach(result => {
        var html=createtab(result,string);
        element.append(html);
    });
}

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