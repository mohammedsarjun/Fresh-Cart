const express=require('express')
const router=express.Router()
const authController=require('../../controller/admin/authController')

router.post("/signin",authController.signIn)

//GET
router.get("/signin",authController.renderSignInPage)


//logout
router.get("/logout",authController.logout)

module.exports=router