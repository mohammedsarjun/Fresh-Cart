const express = require('express');
const path = require('path');
const Category = require('../../model/category');
const Product = require('../../model/productModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const productOffer = require('../../model/productOffers');
const { ObjectId } = require('mongoose').Types;
const CategoryOffer = require('../../model/categoryOffer');
const AppError = require('../../middleware/errorHandling');
const mongoose = require('mongoose');

async function renderProductDetails(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1; // Default to page 1
    let limit = 5; // Number of products per page
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || ''; // Get search query from URL

    // Create a regex pattern (case-insensitive) to match product name
    let regexPattern = new RegExp(searchQuery, 'i');

    // Apply search filter (match product name)
    let filter = searchQuery 
    ? { productName: regexPattern, isDeleted: { $ne: true } } 
    : { isDeleted: { $ne: true } };

    // Fetch products with pagination and search
    const products = await Product.find(filter).skip(skip).limit(limit);

    for (let product of products) {
      const offers = await productOffer.find({ selectProduct: product._id });

      if (offers.length > 0) {
        let modified = false; // Track if any modification happens

        for (let offer of offers) {
          if (
            offer.endDate > Date.now() &&
            offer.startDate < Date.now() &&
            offer.isListed == true
          ) {
            if (offer.selectVariety !== 'items') {
              for (let i = 0; i < product.varietyDetails.length; i++) {
                if (
                  product.varietyDetails[i].varietyMeasurement ===
                  offer.selectedVarietyMeasurement
                ) {
                  product.varietyDetails[i].varietyDiscount =
                    offer.offerPercentage;
                  modified = true;
                }
              }
            } else {
              product.varietyDetails.forEach((variety) => {
                variety.varietyDiscount = offer.offerPercentage;
              });
              modified = true;
            }
          } else {
            if (offer.selectVariety !== 'items') {
              for (let i = 0; i < product.varietyDetails.length; i++) {
                if (
                  product.varietyDetails[i].varietyMeasurement ===
                  offer.selectedVarietyMeasurement
                ) {
                  product.varietyDetails[i].varietyDiscount = 0;
                  modified = true;
                }
              }
            } else {
              product.varietyDetails.forEach((variety) => {
                variety.varietyDiscount = 0;
              });
              modified = true;
            }
          }
        }

        if (modified) {
          product.markModified('varietyDetails');
          await product.save();
        }
      } else {
        product.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = 0;
        });
        product.markModified('varietyDetails');
        await product.save();
      }
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch categories
    const categories = await Category.find();

    // Use Promise.all() to attach category names properly
    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const category = await Category.findOne({
          _id: new ObjectId(product.categoryId),
        });
        return {
          ...product.toObject(),
          categoryName: category ? category.categoryName : 'Unknown',
        };
      })
    );

    console.log(updatedProducts)

    // Render products page with updated details
    res.status(200).render('admin pages/products', {
      categories,
      products: updatedProducts,
      page,
      totalPages,
      searchQuery,
    });
  } catch (error) {
    console.error(error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function renderSingleProductDetails(req, res, next) {
  try {
    const productId = req.query.productId;

    const productDetail = await Product.findOne({
      _id: new ObjectId(productId),
      isDeleted: false 
    });

    if (!productDetail) {
      return next(new AppError('Product Not Found', 400));
    }
    let modified = false;
    const offers = await productOffer.find({
      selectProduct: productDetail._id,
    });

    if (offers.length > 0) {
      const categoryOffer = await CategoryOffer.findOne({
        category: productDetail.categoryId,
      });
      for (let offer of offers) {
        let offerPercentage =
          offer?.offerPercentage != undefined ? offer?.offerPercentage : 0;
        if (
          (offerPercentage < categoryOffer?.offerPercentage ||
            offer.isListed == false) &&
          categoryOffer?.endDate > Date.now() &&
          categoryOffer?.startDate < Date.now() &&
          categoryOffer?.isListed == true
        ) {
          if (offer.selectVariety !== 'items') {
            for (let i = 0; i < productDetail.varietyDetails.length; i++) {
              if (
                productDetail.varietyDetails[i].varietyMeasurement ===
                offer.selectedVarietyMeasurement
              ) {
                productDetail.varietyDetails[i].varietyDiscount =
                  categoryOffer.offerPercentage;
                modified = true;
              }
            }
          } else {
            productDetail.varietyDetails.forEach((variety) => {
              variety.varietyDiscount = categoryOffer.offerPercentage;
            });
            modified = true;
          }
        } else {
          productDetail.varietyDetails.forEach((varietyDetail) => {
            varietyDetail.varietyDiscount = 0;
          });

          if (
            offer?.endDate > Date.now() &&
            offer?.startDate < Date.now() &&
            offer?.isListed == true
          ) {
            if (offer.selectVariety !== 'items') {
              for (let i = 0; i < productDetail.varietyDetails.length; i++) {
                if (
                  productDetail.varietyDetails[i].varietyMeasurement ===
                  offer.selectedVarietyMeasurement
                ) {
                  productDetail.varietyDetails[i].varietyDiscount =
                    offer.offerPercentage;
                  modified = true;
                }
              }
            } else {
              productDetail.varietyDetails.forEach((variety) => {
                variety.varietyDiscount = offer.offerPercentage;
              });
              modified = true;
            }
          } else {
            if (offer.selectVariety !== 'items') {
              for (let i = 0; i < productDetail.varietyDetails.length; i++) {
                if (
                  productDetail.varietyDetails[i].varietyMeasurement ===
                  offer.selectedVarietyMeasurement
                ) {
                  productDetail.varietyDetails[i].varietyDiscount = 0;
                  modified = true;
                }
              }
            } else {
              productDetail.varietyDetails.forEach((variety) => {
                variety.varietyDiscount = 0;
              });
              modified = true;
            }
          }
        }
      }

      if (productDetail.variety != 'items') {
        const categoryOffer = await CategoryOffer.findOne({
          category: productDetail.categoryId,
        });
        if (
          categoryOffer &&
          categoryOffer.endDate > Date.now() &&
          categoryOffer.startDate < Date.now() &&
          categoryOffer.isListed == true
        ) {
          const productVarieties = [];
          for (let i = 0; i < productDetail.varietyDetails.length; i++) {
            productVarieties.push(
              productDetail.varietyDetails[i].varietyMeasurement
            );
          }
          const offerVarieties = [];
          for (let i = 0; i < offers.length; i++) {
            offerVarieties.push(offers[i].selectedVarietyMeasurement);
          }

          for (let i = 0; i < productVarieties.length; i++) {
            if (!offerVarieties.includes(productVarieties[i])) {
              productDetail.varietyDetails.find(
                (varietyDetail) =>
                  varietyDetail.varietyMeasurement == productVarieties[i]
              ).varietyDiscount = categoryOffer.offerPercentage;
              modified = true;
            }
          }
        }
      }
    } else {
      const categoryOffer = await CategoryOffer.findOne({
        category: productDetail.categoryId,
      });
      if (
        categoryOffer &&
        categoryOffer.endDate > Date.now() &&
        categoryOffer.startDate < Date.now() &&
        categoryOffer.isListed == true
      ) {
        productDetail.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = categoryOffer.offerPercentage;
        });
        modified = true;
      } else {
        productDetail.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = 0;
        });
        modified = true;
      }
    }

    if (modified) {
      productDetail.markModified('varietyDetails');
      await productDetail.save();
    }
    const category = await Category.findOne({
      _id: new ObjectId(productDetail.categoryId),
    });

    const updatedProducts = {
      ...productDetail.toObject(),
      categoryName: category ? category.categoryName : 'Unknown',
    };

    const categories = await Category.find();

    res
      .status(200)
      .render('admin pages/singleProduct', { updatedProducts, categories });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
    console.error('An error occurred:', error);
  }
}

async function addProduct(req, res, next) {
  try {
    const variety = JSON.parse(req.body.variety);

    if (variety[0] != 'items') {
      const images = req.files;
      const productImages = {};

      if (images['productImageOne']) {
        productImages.productImage1 = `/uploads/products/${images['productImageOne'][0].filename}`;
      }
      if (images['productImageTwo']) {
        productImages.productImage2 = `/uploads/products/${images['productImageTwo'][0].filename}`;
      }
      if (images['productImageThree']) {
        productImages.productImage3 = `/uploads/products/${images['productImageThree'][0].filename}`;
      }

      // Check for the presence of image files and store their paths
      const product = new Product({
        productName: req.body.productName,
        categoryId: req.body.productCategory,
        varietyDetails: JSON.parse(req.body.varietyDetails),
        productDescription: req.body.productDescription,
        productPic: productImages,
        totalStock: req.body.totalStock,
      });

      if (variety[0] == 'grams') {
        product.productPrice.perGram = req.body.pricePergrams;
        product.variety = variety[0];
      }
      if (variety[0] == 'ml') {
        product.productPrice.perMl = req.body.pricePerml;
        product.variety = variety[0];
      }

      await product.save();
      res.status(200).json({
        message: 'Product Added Successfully',
        redirectTo: '/admin/products',
      });
    } else {
      const images = req.files;
      const productImages = {};

      if (images['productImageOne']) {
        productImages.productImage1 = `/uploads/products/${images['productImageOne'][0].filename}`;
      }
      if (images['productImageTwo']) {
        productImages.productImage2 = `/uploads/products/${images['productImageTwo'][0].filename}`;
      }
      if (images['productImageThree']) {
        productImages.productImage3 = `/uploads/products/${images['productImageThree'][0].filename}`;
      }

      const product = new Product({
        productName: req.body.productName,
        categoryId: req.body.productCategory,
        varietyDetails: JSON.parse(req.body.varietyDetails),
        productDescription: req.body.productDescription,
        productPic: productImages,
        totalStock: req.body.totalStock,
        variety: variety[0],
      });

      await product.save();
      res.status(200).json({
        message: 'Product Added Successfully',
        redirectTo: '/admin/products',
      });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function unListProduct(req, res, next) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Find the user and update the block status
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    product.isListed = false; // Set block status
    await product.save(); // Save changes

    return res.json({ message: 'Product has been successfully Unlisted.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function listProduct(req, res, next) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Find the user and update the block status
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    product.isListed = true; // Set block status
    await product.save(); // Save changes

    return res.json({ message: 'Product has been successfully listed.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
async function deleteProduct(req, res, next) {
  try {
    const { productId } = req.body;

    // Check if the user exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

 
    await Product.findByIdAndUpdate(productId, { isDeleted: true });

    res.json({
      message: 'Product deleted successfully!',
      redirectTo: '/admin/products',
    });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateProduct(req, res, next) {
  try {
    const { productId } = req.body;

    // Check if the user exists
    const product = await Product.findById(productId);
    console.log(req.body);
    const variety = JSON.parse(req.body.variety);
    const varietyDetails = JSON.parse(req.body.varietyDetails);
    product.categoryId = req.body.productCategory;
    if (variety[0] != 'items') {
      console.log(req.files);
      const images = req.files;
      const productImages = {};
      const varietyDetails = [{}, {}, {}];

      if (images['editProductImageOne']) {
        productImages.productImage1 = `/uploads/products/${images['editProductImageOne'][0].filename}`;
      } else {
        productImages.productImage1 = product.productPic.productImage1;
      }
      if (images['editProductImageTwo']) {
        productImages.productImage2 = `/uploads/products/${images['editProductImageTwo'][0].filename}`;
      } else {
        productImages.productImage2 = product.productPic.productImage2;
      }
      if (images['editProductImageThree']) {
        productImages.productImage3 = `/uploads/products/${images['editProductImageThree'][0].filename}`;
      } else {
        productImages.productImage3 = product.productPic.productImage3;
      }
      product.productPic = productImages;

      // Check for the presence of image files and store their paths
      product.productName = req.body.productName;
      if (variety[0] == 'grams') {
        product.productPrice.perGram = req.body.perUnitRate;
      }
      if (variety[0] == 'ml') {
        product.productPrice.perMl = req.body.perUnitRate;
      }
      if (variety[0] == 'items') {
        product.productPrice.perItem = req.body.perUnitRate;
      }
      product.productDescription = req.body.productDescription;
      JSON.parse(req.body.varietyDetails).forEach((varietyDetail, i) => {
        varietyDetails[i].varietyMeasurement = varietyDetail.varietyMeasurement;
        varietyDetails[i].varietyStock = varietyDetail.varietyStock;
      });
      console.log(varietyDetails);
      product.varietyDetails = varietyDetails;

      if (variety[0] == 'grams') {
        product.productPrice.perGram = req.body.pricePergrams;
        product.productPrice.perMl = null;
        product.productPrice.perItem = null;
        product.variety = variety[0];
      }
      if (variety[0] == 'ml') {
        product.productPrice.perMl = req.body.pricePerml;
        product.productPrice.perGram = null;
        product.productPrice.perItem = null;
        product.variety = variety[0];
      }

      product.variety = variety[0];

      await product.save();
      res.status(200).json({
        message: 'Product Edited Successfully',
        redirectTo: '/admin/products',
      });
    } else {
      const images = req.files;
      const productImages = {};

      if (images['editProductImageOne']) {
        productImages.productImage1 = `/uploads/products/${images['editProductImageOne'][0].filename}`;
      } else {
        productImages.productImage1 = product.productPic.productImage1;
      }
      if (images['editProductImageTwo']) {
        productImages.productImage2 = `/uploads/products/${images['editProductImageTwo'][0].filename}`;
      } else {
        productImages.productImage2 = product.productPic.productImage2;
      }
      if (images['editProductImageThree']) {
        productImages.productImage3 = `/uploads/products/${images['editProductImageThree'][0].filename}`;
      } else {
        productImages.productImage3 = product.productPic.productImage3;
      }
      console.log(req.body.productDescription)
      product.productPic = productImages;
      product.productName = req.body.productName;
      product.categoryId = req.body.productCategory;
      product.productDescription = req.body.productDescription;
      product.variety = variety[0];
      product.varietyDetails = JSON.parse(req.body.varietyDetails)[0];
      await product.save();
      res.status(200).json({
        message: 'Product Edited Successfully',
        redirectTo: '/admin/products',
      });
    }
  } catch (error) {
    console.error('Error Editing product:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  renderProductDetails,
  addProduct,
  renderSingleProductDetails,
  unListProduct,
  listProduct,
  deleteProduct,
  updateProduct,
};
