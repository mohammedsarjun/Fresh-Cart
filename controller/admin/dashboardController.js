const express = require('express');
const path = require('path');
const User = require('../../model/userSchema');
const Category = require('../../model/category');
const bcrypt = require('bcrypt');
const AppError = require('../../middleware/errorHandling');

async function renderDashboardPage(req, res, next) {
  try {
    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'adminDashboard'));
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = { renderDashboardPage };
