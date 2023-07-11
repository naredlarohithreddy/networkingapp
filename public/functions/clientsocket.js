var connected=false;
var socket=io.connect('http://localhost:3003');

socket.emit("setup",userjs);

socket.on("connected",()=>connected=true);

socket.on("message received",(message)=> {
    realtimemessage(message)
});

socket.on("notification received",(notification)=>{
    $.get("/api/notifications/latest",(notificationdata)=>{
        shownotificationpopup(notificationdata);
        notificationbadge();
    })
})

function emitnotification(userid){
    if(userid==userjs._id)return;

    socket.emit("notification received",userid);
}