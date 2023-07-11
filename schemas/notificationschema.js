const mongoose=require("mongoose")

var schema= mongoose.Schema;

schema=new schema({
    sentfrom:{type:schema.Types.ObjectId, ref:"userinfo"},
    sendto:{type:schema.Types.ObjectId, ref:"userinfo"},
    type:String,
    entity:{type:schema.Types.ObjectId},
    read:{type:Boolean , default:false}
},{timestamps:true});

schema.statics.insertNotification= async (userfrom,userto,type,entityid)=>{
    var data={
        sentfrom:userfrom,
        sendto:userto,
        type:type,
        entity:entityid
    }
    await notificationSchema.deleteOne(data).catch(err=>console.log(err));
    return notificationSchema.create(data);
};

var notificationSchema=mongoose.model("notificationinfo",schema);

module.exports=notificationSchema;