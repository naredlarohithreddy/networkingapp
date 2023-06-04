const mongoose=require('mongoose')

const schema =mongoose.Schema;

var userschema=new schema({
    firstname:{type:String,required:true,trim:true},
    lastname:{type:String,required:true,trim:true},
    username:{type:String,required:true,trim:true,unique:true},
    email:{type:String,required:true,trim:true,unique:true},
    password:{type:String,required:true},
    profilepicture:{ type: String, default: "public/images/default.jpg" },//how we will store the image
    likes:[{type:schema.Types.ObjectId, ref:"postinfo"}],
},{timestamps:true});

var usermodel=mongoose.model('userinfo',userschema);
//model converts schema into a model
//and we can access the crud operations on usermodel
// console.log(usermodel)
module.exports=usermodel

