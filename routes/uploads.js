const express=require('express');
const router=express.Router();
const path=require("path")

router.get("/images/:id",(req,res,next)=>{
    const filepath=path.join(__dirname,`../uploads/images/${req.params.id}`)
    res.sendFile(filepath);
})

module.exports=router;
