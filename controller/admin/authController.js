const express = require('express');
const path = require('path');
require('dotenv').config();
const AppError = require('../../middleware/errorHandling');
async function signIn(req, res, next) {
  try {
    console.log(process.env.ADMIN_EMAIL);
    if (
      req.body.email == process.env.ADMIN_EMAIL &&
      req.body.password == process.env.ADMIN_PASSWORD
    ) {
      req.session.isAdminLogged = true;
      res.status(200).json({
        redirectTo: '/admin',
        message: 'Admin logged in',
      });
    } else {
      res.status(400).json({
        redirectTo:
          '/admin/auth/signin?message=Entered Email or password is wrong !',
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//rendering files
async function renderSignInPage(req, res, next) {
  try {
    if (req.session.isAdminLogged == true) {
      res.status(302).redirect('/admin');
    } else {
      res
        .status(200)
        .render(path.join('../', 'views', 'admin pages', 'adminLogin'));
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function logout(req, res, next) {
  try {
    req.session.isAdminLogged = false;
    res.status(302).redirect('/admin');
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  signIn,
  renderSignInPage,
  logout,
};
