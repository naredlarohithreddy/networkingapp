const mongoose=require('mongoose')

const schema =mongoose.Schema;

var postschema=new schema({
    content:{type:String,trim:true},
    commentdata:{type:schema.Types.ObjectId, ref:"postinfo"},
    user:{type:schema.Types.ObjectId, ref:"userinfo"},
    postingimg :{type: String },
    likes:[{type:schema.Types.ObjectId, ref:"userinfo"}],
    retweetusers:[{type:schema.Types.ObjectId, ref:"userinfo"}],
    retweetdata:{type:schema.Types.ObjectId, ref:"postinfo"},
    pinned:{type:Boolean,default:false}
},{timestamps:true});

var postinfo=mongoose.model('postinfo',postschema);
//model converts schema into a model
//and we can access the crud operations on usermodel
// console.log(usermodel)
module.exports=postinfo