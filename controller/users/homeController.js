const path = require('path');
const express = require('express');
const Category = require('../../model/category');
const Product = require('../../model/productModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const AppError = require('../../middleware/errorHandling');

async function homePageRender(req, res, next) {
  try {
    let categoryFilter = { isPublished: true };
    let categories = await Category.find(categoryFilter);
    let productFilter = { isListed: true };
    let products = await Product.find(productFilter).lean();
    console.log(products)
    res.status(200).render(path.join('userPages', 'homePage'), {
      categories,
      products,
    });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  homePageRender,
};
