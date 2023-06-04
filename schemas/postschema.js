const mongoose=require('mongoose')

const schema =mongoose.Schema;

var postschema=new schema({
    content:{type:String,trim:true},
    user:{type:schema.Types.ObjectId, ref:"userinfo"},
    postingimg :{type: String, default: "public/images/default.jpg" },//how we will store the image,
    likes:[{type:schema.Types.ObjectId, ref:"userinfo"}],
    pinned:Boolean
},{timestamps:true});

var postinfo=mongoose.model('postinfo',postschema);
//model converts schema into a model
//and we can access the crud operations on usermodel
// console.log(usermodel)
module.exports=postinfo