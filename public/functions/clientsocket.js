var connected=false;
var socket=io.connect('http://localhost:3003');

socket.emit("setup",userjs);

socket.on("connected",()=>connected=true);