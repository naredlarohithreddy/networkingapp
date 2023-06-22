const monogoose=require("mongoose");


class database{

    constructor(){
        this.connect();
    }

    connect(){
        monogoose.connect("mongodb+srv://rohithreddyn013:Rajikavitha1@cluster0.ssjnfon.mongodb.net/?retryWrites=true&w=majority",{ 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(()=>{
            console.log("connection succesfull");
        })
        .catch((err)=>{
            console.log("connection not succesfull"+err);
        })
    }
}

module.exports=new database();
