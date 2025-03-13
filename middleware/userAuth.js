const usercollection = require("../model/userSchema");

module.exports = async function (req,res,next){
    try{
    
        if(req.session.isLogged){
            
            const user = await usercollection.findOne({ _id: req.session.userId})
            if(user.isBlocked == true){
                return res.redirect("/auth/blocked")
            } else {
            next()
            }
        }else{
            console.log("dahks")
           return res.redirect('/auth/signin')
        }
    }catch(err){
        console.log("middleware: ", err);
    }
}