$(document).ready(()=>{
    if(selected=="followers"){
        $.get(`/api/users/${postedby._id}`,(results)=>{
            outputusertab(results.followers,$(".supply"),"Followers");
        })
    }
    else{
        $.get(`/api/users/${postedby._id}`,(results)=>{
            outputusertab(results.following,$(".supply"),"Following");
        })
    }
})

$(document).ready(()=>{
    $(document).on("click",".follow",(event)=>{
        var button=$(event.target)
        var userid=button.data().id;
        $.ajax({
            url:`/api/users/${userid}/follow`,
            type:'PUT',
            success:(data,status,xhr)=>{

                if(data.following.includes(userid)){
                    button.removeClass("notfollowing");
                    button.addClass("following");
                    button[0].childNodes[0].data="Following";
                    emitnotification(userid)
                }
                else{
                    button.removeClass("following");
                    button.addClass("notfollowing");
                    button[0].childNodes[0].data="Follow";
                }
            }
        })
    })
})

function outputusertab(results,element,string){
    element.html="";
    if(results && results.length>0){
        results.forEach(result => {
            var html=createtab(result,string);
            element.append(html);
        });
    }
    else{
        var html=`<span>NO RESULTS FOUND</span>`;
        element.append(html)
    }
}

function createtab(result,string){

    var text="Following";
    if(string==="Followers"){
        if(result.followers && result.followers.includes(postedby._id)){
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