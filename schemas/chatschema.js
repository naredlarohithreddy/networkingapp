const mongoose=require("mongoose");

const schema =mongoose.Schema;

var chatschema=new schema({
    chatname:{type:String,trim:true},
    users:[{type:schema.Types.ObjectId, ref:"userinfo"}],
    groupchat:{type:Boolean,default:false},
    latestmessage:{type:schema.Types.ObjectId, ref:"messageinfo"}
},{timestamps:true});

var chatinfo=mongoose.model('chatinfo',chatschema);
//model converts schema into a model
//and we can access the crud operations on usermodel
// console.log(usermodel)
module.exports=chatinfo;