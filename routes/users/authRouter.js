 const express=require('express')
 const passport=require('passport')
 const router=express.Router()
 const authController=require('../../controller/users/authController')
 const homeController=require('../../controller/users/homeController')
 const authMiddleware=require('../../middleware/userAuth')

 //router
 router.post("/signup",authController.signUp)
 router.post("/login",authController.logIn)
 router.post("/resendOtp",authController.resendOtp)
 router.post("/otpVerify",authController.verifyOtp)
 router.post("/login",authController.logIn)
 router.post("/forgotPassword",authController.forgotPassword)
 router.post('/changePasswords',authController.changePassword)

 //get
 router.get("/otp",authController.renderOtpPage)
 router.get("/signup",authController.renderSignUpPage)
 router.get("/signin",authController.renderSignInPage)
 router.get("/google/signup",authController.authenticateGoogle)
 router.get("/google/callback",authController.googleCallBack);
 router.get("/google/signin",authController.googleCallBack)
 router.get("/forgotPassword",authController.renderForgotPasswordPage)
 router.get('/changePassword',authController.renderChangePasswordPage)
 router.get("/logout",authController.logout)
 router.get("/blocked",authController.userBlocked)
 module.exports=router