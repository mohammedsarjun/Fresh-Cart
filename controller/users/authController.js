const userSchema = require('../../model/userSchema');
const otpSchema = require('../../model/otpSchema');
const bcrypt = require('bcrypt');
const sendOtp = require('../../helper/sendOtp');
const path = require('path');
const cron = require('node-cron');
const passport = require('passport');
const user = require('../../model/userSchema');
const crypto = require('crypto');
const AppError = require('../../middleware/errorHandling');
const referralSchema = require('../../model/referralSchema');
const { error } = require('console');
const Coupon = require('../../model/couponScehma');
const walletSchema=require("../../model/walletSchema")

// Save OTP

//sign-up controller

async function signUp(req, res, next) {
  try {
    const isVerifiedUser = await getUserDetails(req.body.email);
    let referral = null;
    if (req.body.referralCode) {
      referral = await referralSchema.findOne({ code: req.body.referralCode });
      if (!referral) {
        res.status(404).json({
          error: 'Referral Code Not Exist',
        });
      }
    }

    if (isVerifiedUser?.isVerified == false) {
      req.session.otpEmail = req.body.email;
      const pass = await bcrypt.hash(req.body.password, 10);

      const updatedFields = {
        firstName: req.body.firstName,
        secondName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: pass,
        createdAt: Date.now(),
        referredBy: referral?.userId,
      };
      Object.assign(isVerifiedUser, updatedFields);
      await isVerifiedUser.save();
      await sendOtpFunction(req, res);
      res.status(302).json({
        redirectTo: '/auth/otp',
      });
    } else {
      const existEmail = await userSchema.findOne({ email: req.body.email });
      const existPhone = await userSchema.findOne({ phone: req.body.phone });
      if (existEmail) {
        res.status(409).json({
          error: 'Email Already exist',
        });
      } else if (existPhone) {
        res.status(409).json({
          error: 'Phone Number Already exist',
        });
      } else {
        const pass = await bcrypt.hash(req.body.password, 10);
        const user = new userSchema({
          firstName: req.body.firstName,
          secondName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone,
          firstName: req.body.firstName,
          password: pass,
          createdAt: Date.now(),
          referredBy: referral?.userId,
        });
        await user.save();

        req.session.otpEmail = req.body.email;
        await sendOtpFunction(req, res);
        res.status(302).json({
          redirectTo: '/auth/otp', // Send a redirect URL in the JSON respons`e
          message: 'OTP sent successfully',
        });
      }
    }
  } catch (dbErr) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
//Verify Otp
async function verifyOtp(req, res, next) {
  try {
    if (req.session.userChangePassword) {
      const user = await userSchema.findOne({ _id: req.session.userId });
      const otpDetails = await otpSchema.findOne({ email: user.email });

      if (user) {
        console.log(req.body.enteredOtp);
        let isOtpMatch = await bcrypt.compare(
          req.body.enteredOtp,
          otpDetails.otp
        );
        if (isOtpMatch) {
          req.session.isForgotPassword = true;
          res.status(200).json({
            redirectTo: '/auth/changePassword',
            message: 'OTP Verified',
            statusCode: 200,
          });
        } else {
          res.status(400).json({
            redirectTo: '/auth/otp?message=Entered OTP is wrong. Try Again!',
            statusCode: 400,
          });
        }
      }
    } else if (req.session.isUserEmailChanged) {
      const user = await getOtpDetails(req.session.updatingEmail);
      if (user) {
        let userUpdateDetails = req.session.userUpdateDetails;
        console.log(req.body.enteredOtp);
        let isOtpMatch = await bcrypt.compare(req.body.enteredOtp, user.otp);
        if (isOtpMatch) {
          const userId = await getUserDetails(req.session.updatingEmail);
          const updateUser = await userSchema.findById({
            _id: req.session.userUpdateDetails.userId,
          });
          console.log(updateUser);
          updateUser.firstName = userUpdateDetails.firstName;
          updateUser.secondName = userUpdateDetails.secondName;
          updateUser.email = userUpdateDetails.email;
          updateUser.phone = userUpdateDetails.phone;
          await updateUser.save();
          req.body.otpEmail = updateUser.email;
          delete req.session.isUserEmailChanged;
          delete req.session.updatingEmail;

          req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            res.status(200).json({
              redirectTo: '/account/settings',
              message: 'User Details Updated!',
              statusCode: 200,
            });
          });
          console.log("Everythioomng Is Ok")
          
        } else {
          res.status(400).json({
            redirectTo: '/auth/otp?message=Entered OTP is wrong. Try Again!',
            statusCode: 400,
          });
        }
      }
    } else if (req.session.isForgotPassword) {
      const user = await getOtpDetails(req.session.otpEmail);
      if (user) {
        let isOtpMatch = await bcrypt.compare(req.body.enteredOtp, user.otp);
        if (isOtpMatch) {
          const userId = await getUserDetails(req.session.otpEmail);
          req.session.userId = userId;
              let wallet = await walletSchema.findOne({ userId: req.session.userId });
          
              if (!wallet) {
                wallet = new walletSchema({
                  userId: req.session.userId,
                  balance: 0,
                  transactions: [],
                });
          
                await wallet.save(); 
              }
          res.status(200).json({
            redirectTo: '/auth/changePassword',
            message: 'OTP Verified!',
            statusCode: 200,
          });
        } else {
          res.status(400).json({
            redirectTo: '/auth/otp?message=Entered OTP is wrong. Try Again!',
            statusCode: 400,
          });
        }
      }
    } else {

      function generateReferralCode(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
          code += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        return code;
      }

      const user = await getOtpDetails(req.session.otpEmail);

      if (user) {
        let isOtpMatch = await bcrypt.compare(req.body.enteredOtp, user.otp);
        if (isOtpMatch) {
          const userDetails = await userSchema.findOne({
            email: req.session.otpEmail,
          });
          const userId = userDetails._id;
          req.session.userId = userId;
          if (userDetails) {
            userDetails.isVerified = true;
            await userDetails.save();
            delete req.session.otpExpiry;

            if (userDetails.referredBy) {

              
              const couponCode =
                'COUPON-' +
                Math.random().toString(36).substring(2, 8).toUpperCase();
              const newCoupon = new Coupon({
                couponCode: couponCode,
                discountPercentage: 10,
                user: userDetails.referredBy,
                couponStartDate: null,
                couponExpiryDate: null,
                minimumPurchase: 0,
                maximumDiscount: 500,
                type: 'Special',
                currentStatus: 'Special',
              });

              await newCoupon.save();

              const referredUserDetail=await userSchema.findOne({_id:userDetails.referredBy})

            referredUserDetail.referredUsers.push(userDetails._id)
            referredUserDetail.markModified("referredUsers")
            await referredUserDetail.save()

            }

            
      let wallet = await walletSchema.findOne({ userId: req.session.userId });

      if (!wallet) {
        wallet = new walletSchema({
          userId: req.session.userId,
          balance: 0,
          transactions: [],
        });
  
        await wallet.save(); // Save the newly created wallet
      }

            const referral = new referralSchema({
              code: generateReferralCode(),
              userId: userDetails._id,
           
            });

            await referral.save();

            req.session.isLogged = true;
            res.status(200).json({
              redirectTo: '/home',
              message: 'OTP Verified!',
              statusCode: 200,
            });
          }
        } else {
          res.status(400).json({
            redirectTo: '/auth/otp?message=Entered OTP is wrong. Try Again!',
            statusCode: 400,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//login controller
async function logIn(req, res, next) {
  try {
 

    const user = await userSchema.findOne({
      email: req.body.email,
      google_id: null,
    });

    console.log(user)
    if (!user) {
      res.status(401).json({
        error: 'Email or Password is incorrect',
      });
    } else {
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordMatch) {
        res.status(401).json({
          error: 'Email or Password is incorrect',
        });
      } else if (user.isVerified == false) {
        req.session.otpEmail = req.body.email;
        await sendOtpFunction(req, res);
        res.status(401).json({
          message:
            "You didn't verify your account,OTP sent to your email if you want to verify click verify button or else just ignore it!!",
          issue: "USER DIDN'T VERIFY",
        });
      } else {
        console.log("working pumbda")
        req.session.otpEmail = req.body.email;
        req.session.isLogged = true;
        req.session.userId = user._id;
        res.status(302).json({
          redirectTo: '/home',
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
//forgot password

async function forgotPassword(req, res, next) {
  try {
    console.log(req.body);
    const existingUser = await userSchema.findOne({ email: req.body.email });
    if (!existingUser) {
      res
        .status(404)
        .redirect(
          '/auth/forgotPassword?message=The email entered does not exist!'
        );
    } else {
      req.session.otpEmail = req.body.email;
      req.session.isForgotPassword = true;
      await sendOtpFunction(req, res,next);
      res.status(302).redirect('/auth/otp'); // Send a redirect URL in the JSON response
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function changePassword(req, res, next) {
  try {
    if (req.session.userChangePassword) {
      const user = await userSchema.findOne({ _id: req.session.userId });
      const pass = await bcrypt.hash(req.body.newPassword, 10);
      user.password = pass;
      await user.save();
      res.status(200).json({
        redirectTo: '/',
        message: 'Password Changed',
      });
    } else {
      const user = await userSchema.findOne({ email: req.session.otpEmail });
      const pass = await bcrypt.hash(req.body.newPassword, 10);
      user.password = pass;
      await user.save();
      res.status(200).json({
        redirectTo: '/',
        message: 'Password Changed',
      });
    }

    delete req.session.isForgotPassword;
    delete req.session.userChangePassword;
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
//resendOtp
async function resendOtp(req, res, next) {
  try {
    let otp = await generateOTP();
    let encryptOtp = await bcrypt.hash(otp, 10);
    let user;
    if ((req.session.userChangePassword == true)) {
      const userDetails = await userSchema.findOne({ _id: req.session.userId });
      await saveOtp(encryptOtp, userDetails.email);
      await sendOtp(userDetails.email, otp);
      user = await otpSchema.findOne({ email: userDetails.email });
    } else if (req.session.isUserEmailChanged == true) {
      await saveOtp(encryptOtp, req.session.updatingEmail);
      await sendOtp(req.session.updatingEmail, otp);
      user = await otpSchema.findOne({ email: req.session.updatingEmail });
    } else {
      console.log("hida pumda")
      console.log(req.session.otpEmail)
      await saveOtp(encryptOtp, req.session.otpEmail);
      await sendOtp(req.session.otpEmail, otp);
      user = await otpSchema.findOne({ email: req.session.otpEmail });
    }

    if (user) {
      req.session.otpExpiry = user.expireAt;
    }
    res.status(302).json({
      redirectTo: '/auth/otp', // Send a redirect URL in the JSON response
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
//Send And Save OTP
async function sendOtpFunction(req, res, next) {
  try {
    let otp = await generateOTP();
    let encryptOtp = await bcrypt.hash(otp, 10);
    let user;
    if (req.session.userChangePassword == true) {
      const userEmail = await userSchema.findOne({ _id: req.session.userId });
      console.log(userEmail);
      await saveOtp(encryptOtp, userEmail.email);
      await sendOtp(userEmail.email, otp);

      user = await otpSchema.findOne({ email: userEmail.email });
    } else if (req.session.isUserEmailChanged == true) {
      await saveOtp(encryptOtp, req.session.updatingEmail);
      await sendOtp(req.body.email, otp);
      user = await otpSchema.findOne({ email: req.session.updatingEmail });
    } else {
      await saveOtp(encryptOtp, req.session.otpEmail);
      await sendOtp(req.body.email, otp);
      user = await otpSchema.findOne({ email: req.session.otpEmail });
    }

    if (user) {
      req.session.otpExpiry = user.expireAt;
    } else {
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//generate Otp
async function generateOTP() {
  try {
    return crypto.randomInt(100000, 999999).toString();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

//save otp on otp schema
const saveOtp = async (otp, email) => {
  try {
    await otpSchema.updateOne(
      { email: email },
      {
        $set: {
          otp: otp,
          updatedAt: Date.now(),
          expireAt: Date.now() + 75 * 1000,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

//google sign-up authentication
const authenticateGoogle = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(
    req,
    res,
    next
  );
};
const googleCallBack = async (req, res, next) => {
  passport.authenticate(
    'google',
    { failureRedirect: '/' },
    async (err, user) => {
      if (err) {
        return next(err); // Handle error
      }

      if (!user) {
        return res.status(401).redirect('/'); // If user is not authenticated
      }

      try {
        // Check if the user already exists in the database
        let existingUser = await userSchema.findOne({ google_id: user.id });
        let existingEmail = await userSchema.findOne({
          google_id: null,
          email: user.emails[0].value,
        });
        if (existingEmail) {
          req.logIn(existingEmail, (err) => {
            if (err) return next(err);
            res
              .status(302)
              .redirect(
                '/auth/signup?message=User already exists with this email'
              ); // Redirect to home or wherever you need after login
          });
        } else if (existingUser) {
          // User already exists, log them in
          req.logIn(existingUser, async (err) => {
            if (err) return next(err);
            req.session.isLogged = true;
            req.session.otpEmail = user.emails[0].value;
           let userDetail = await userSchema.findOne({
              email: req.session.otpEmail,
            });
            req.session.userId=userDetail._id
            res.send(`
              <script>
                  window.location.replace('/');
              </script>
          `); // Redirect to home or wherever you need after login
          });
        } else {
          // New user, save to the database
          const newUser = new userSchema({
            google_id: user.id,
            firstName: user.name.givenName,
            lastName: user.name.familyName,
            email: user.emails[0].value,
            isVerified: true, // Assuming new users are verified
            createdAt: Date.now(),
          });

          await newUser.save(); // Save the new user to DB

          
            wallet = new walletSchema({
              userId: newUser._id,
              balance: 0,
              transactions: [],
            });
      
            await wallet.save(); 
          
          function generateReferralCode(length = 6) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < length; i++) {
              code += characters.charAt(
                Math.floor(Math.random() * characters.length)
              );
            }
            return code;
          }
          const referral = new referralSchema({
            code: generateReferralCode(),
            userId: newUser._id,
          });

          await referral.save();

          // Log in the new user
          req.logIn(newUser, async (err) => {
            if (err) return next(err);
            req.session.userId = newUser._id;
            req.session.isLogged = true;
            req.session.otpEmail = user.emails[0].value;
            res.send(`
              <script>
                  window.location.replace('/');
              </script>
          `); // Redirect to home or wherever after sign-up
          });
        }
      } catch (dbError) {
        console.log(dbError); // Handle database error
        next(new AppError('Sorry...Something went wrong', 500));
      }
    }
  )(req, res, next);
};
//logout
async function logout(req, res, next) {
  try {
    req.session.isLogged = false;
    res.status(302).redirect('/');
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//file rendering
function renderOtpPage(req, res, next) {
  try {
    res.status(200).render(path.join('../', 'views', 'UserPages', 'otpPage'), {
      otpExpire: req.session.otpExpiry,
      otpEmail: req.session.otpEmail,
    });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
function renderSignUpPage(req, res, next) {
  try {
    if (req.session.isLogged == true) {
      res.status(302).redirect('/');
    } else {
      res.status(200).render(path.join( 'UserPages', 'signup'));
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
function renderSignInPage(req, res, next) {
  try {
    if (req.session.isLogged == true) {
      res.status(302).redirect('/');
    } else {
      res.status(200).render(path.join('UserPages', 'signin'));
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
function renderForgotPasswordPage(req, res, next) {
  try {
    if (req.session.isLogged == true) {
      res.status(302).redirect('/');
    } else {
      res
        .status(200)
        .render(path.join('../', 'views', 'UserPages', 'forgotPassword'));
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
function renderChangePasswordPage(req, res, next) {
  try {
    if (req.session.isForgotPassword == true) {
      res
        .status(200)
        .render(path.join('../', 'views', 'UserPages', 'changePassword'));
    } else {
      res.status(302).redirect('/');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
//Needed methods
async function getUserDetails(userEmail) {
  try {
    return await userSchema.findOne({ email: userEmail });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function getOtpDetails(otpEmail) {
  try {
    return await otpSchema.findOne({ email: otpEmail });
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

//delete unVerified users after 24 hours
cron.schedule('0 0 * * *', async () => {
  try {
    const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const result = await userSchema.deleteMany({
      isVerified: false,
      createdAt: { $lt: expiryDate },
    });
    console.log(`${result.deletedCount} unverified accounts deleted.`);
  } catch (error) {
    console.error('Error deleting unverified accounts:', error);
  }
});

//user blocked

async function userBlocked(req, res) {
  try {
    res.status(403).render('UserPages/userBlocked');
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
module.exports = {
  signUp,
  logIn,
  resendOtp,
  authenticateGoogle,
  googleCallBack,
  verifyOtp,
  renderOtpPage,
  renderSignUpPage,
  renderSignInPage,
  forgotPassword,
  renderForgotPasswordPage,
  renderChangePasswordPage,
  changePassword,
  logout,
  userBlocked,
  sendOtpFunction,
};
