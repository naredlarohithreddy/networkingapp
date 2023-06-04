$("#textareatobeposted").keyup(event=>{
    const textarea=event.target;
    const value=textarea.value.trim();

    console.log(value);
    const submitbutton=$("#submitpostbutton");

    if(submitbutton.length==0){
        return alert("no submit button");
    }

    if(value==""){
        submitbutton.prop("disabled",true);
        return;
    }

    submitbutton.prop("disabled",false);

})

//const button=document.getElementById("submitpostbutton");

$("#submitpostbutton").click(()=>{

    const textarea=document.getElementById("textareatobeposted");
    const value=textarea.value.trim();

    const postobject={
        content : value
    }
     
    $.post("/api/posts",postobject,postdata=>{

        var html=createposthtml(postdata);
        textarea.val="";
        $("#submitpostbutton").prop("disabled",true);
        
        var xhr=new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var homeHTML = xhr.responseText;
          
                // Create a new DOMParser
                var parser = new DOMParser();

                // Parse the homeHTML string into a DOM element
                var parsedHTML = parser.parseFromString(homeHTML, 'text/html');
                // Prepend the container to the fetched home HTML content
                var targetElement = parsedHTML.querySelector('.supply');
                //var nextElement = parsedHTML.querySelector('.postcontainer');
                // var parentElement = targetElement.parentNode;

                // var posthtml=document.createElement("div");
                // posthtml.className='postcontainer';
                //targetElement.innerHTML=html;

                // posthtml.innerHTML=html;
                targetElement.insertAdjacentHTML("afterbegin",html);

                // parentElement.insertBefore(posthtml,targetElement);
                // Replace the current page with the updated home HTML content
                document.open();
                document.write(parsedHTML.documentElement.innerHTML);
                document.close();
            }
        };
        xhr.open('GET', '/', true);
        xhr.send();

    })
})


function createposthtml(postdata){

    if(postdata._id===undefined){
        alert("not populated")
    }

    var postedby=postdata.user;
    var postedname=postedby.firstname+" "+postedby.lastname;
    var timestamp=timeDifference(new Date(),new Date(postdata.createdAt));

    return `
        <div class="postcontainer" data-id="${postdata._id}">
            <div class="imgcontainer"> <img src="/images/default.jpg" alt="default"/></div>
            <div class="textcontainer"> 
                <div class="post">
                        <div class="infoofpost">
                            <div class="username">${postedname}</div>
                            <div class="info">@${postedby.username}     ${timestamp}</div>
                        </div>
                        <div class="contentcontainer">
                            <div class="contentpost">${postdata.content}</div>
                            <div class="imageposted">   <img src="/images/default.jpg" alt="posted picture"/></div>
                        </div>
                </div>
                <div class="postFooter">
                    <div class="postButtonContainer">
                        <button><i class="far fa-comment"></i></button>
                    </div>
                    <div class="postButtonContainer">
                        <button><i class="fas fa-retweet"></i></button>
                    </div>
                    <div class="postButtonContainer red">
                        <button class="likebutton"><i class="far fa-heart"></i><span>${postdata.likes.length||""}</span></button>
                    </div>
                </div>
            </div>
            <div class="optionscontainer"><a href="/postsettings"><i class="fa-solid fa-ellipsis"></i></a></div>
        </div>
    `;

}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}