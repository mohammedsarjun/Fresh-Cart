const { sendOtpFunction } = require('./authController.js');

const path = require('path');

const bcrypt = require('bcrypt');

const User = require('../../model/userSchema');

const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const otpSchema = require('../../model/otpSchema');
const AppError = require('../../middleware/errorHandling');
const referralSchema = require('../../model/referralSchema.js');
async function accountSettingsRender(req, res, next) {
  try {
    const userDetail = await User.findOne(
      { _id: req.session.userId },
      { password: 0 }
    );
    let referralCode = await referralSchema.findOne({ userId: userDetail._id });

    referralCode = referralCode.code;
    res
      .status(200)
      .render(
        path.join(
          '../',
          'views',
          'UserPages',
          'accountSettings',
          'userProfile'
        ),
        { userDetail, referralCode }
      );
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function userUpdate(req, res, next) {
  try {
    const userDetail = await User.findOne({ _id: req.body.userId });
    if (userDetail.phone != req.body.phone) {
      const phoneExist = User.findOne({ email: req.body.email });
      if (phoneExist) {
        res.status(400).json({
          error: 'Entered Phone Number is already Exist',
        });
      }
    } else if (userDetail.email != req.body.email) {
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        console.log(emailExist);
        res.status(400).json({
          error: 'Entered email is already Exist',
        });
      }
      req.session.isUserEmailChanged = true;
      req.session.updatingEmail = req.body.email;

      req.session.userUpdateDetails = req.body;
      await sendOtpFunction(req, res);
      res.status(302).json({
        redirectTo: '/auth/otp', // Send a redirect URL in the JSON respons`e
        message: 'OTP sent successfully',
      });
    } else {
      const updateUser = await User.findOne({ _id: req.body.userId });
      console.log(updateUser);
      updateUser.firstName = req.body.firstName;
      updateUser.secondName = req.body.secondName;
      updateUser.phone = req.body.phone;
      await updateUser.save();
      res.status(200).json({
        redirectTo: '/account/settings',
        message: 'User Details Updated!',
        statusCode: 200,
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function changeUserPassword(req, res, next) {
  try {
    const userDetails = await User.findOne({ _id: req.session.userId });
    const currentPasswordMatch = await bcrypt.compare(
      req.body.currentPassword,
      userDetails.password
    );
    if (currentPasswordMatch) {
      const newPassword = await bcrypt.hash(req.body.newPassword, 10);
      userDetails.password = newPassword;
      await userDetails.save();

      res.status(201).json({
        message: 'Password Updated',
      });
    } else {
      res.status(401).json({
        error: 'Current Password is Incorrect',
      });
    }
    console.log(userDetails);
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function userChangePassword(req, res, next) {
  try {
    req.session.userChangePassword = true;
    await sendOtpFunction(req, res);

    res.status(302).json({
      redirectTo: '/auth/otp', // Send a redirect URL in the JSON respons`e
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//address
async function referralRewardPageRender(req,res,next){
  try{
    res
    .status(200)
    .render(path.resolve('views', 'UserPages', 'accountSettings', 'referralReward'));
  }catch(error){
    console.log(error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
module.exports = {
  accountSettingsRender,
  userUpdate,
  changeUserPassword,
  userChangePassword,
  referralRewardPageRender
};
