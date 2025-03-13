const usercollection = require("../model/userSchema");

module.exports = async function (req,res,next){
    try{
        
        if(req.session.isAdminLogged==true){
            next()
        }else{
           return res.redirect('/admin/auth/signin')
        }
    }catch(err){
        console.log("middleware: ", err);
    }
}