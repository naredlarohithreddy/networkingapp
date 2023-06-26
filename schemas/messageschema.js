var mongoose=require("mongoose")

var schema=mongoose.Schema;

schema=new schema({
    content:{type:String,trim:true},
    sentuser:{type:schema.Types.ObjectId, ref:"userinfo"},
    readusers:[{type:schema.Types.ObjectId, ref:"userinfo"}],
    chatid:{type:schema.Types.ObjectId, ref:"chatinfo"}
},{timestamps:true});

module.exports=mongoose.model("messageinfo",schema)
