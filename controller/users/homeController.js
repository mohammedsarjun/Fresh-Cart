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
    let productFilter = { isListed: true,  isDeleted: false  };
    let products = await Product.find(productFilter).lean();
    console.log(products)

    for(let i=0;i<products.length;i++){
     let isListedCategory=await Category.findOne({_id:products[i].categoryId})
     if(isListedCategory.isPublished==false){
      products.splice(i,1)
      i--
     } 
    }
    res.status(200).render(path.join('UserPages', 'homePage'), {
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
