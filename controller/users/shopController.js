const path = require('path');
const express = require('express');
const Category = require('../../model/category');
const Product = require('../../model/productModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const productOffer = require('../../model/productOffers');
const CategoryOffer = require('../../model/categoryOffer');
const productReview = require('../../model/productReview');
const category = require('../../model/category');
const User = require('../../model/userSchema');
const mongoose = require('mongoose');
const AppError = require('../../middleware/errorHandling');

async function shopPageRender(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search ? req.query.search.trim() : '';
    let categoryFilter = '';
    if (!searchQuery) {
      categoryFilter = req.query.category || '67a7a69ccd8dc70afb3447a6';
    }

    let filter = { isListed: true };

    if (categoryFilter) {
      filter.categoryId = categoryFilter;
    }

    if (searchQuery) {
      filter.productName = { $regex: searchQuery, $options: 'i' };
    }

    let products = await Product.find(filter).skip(skip).limit(limit);
    let modified = false;
    for (let product of products) {
      const offers = await productOffer.find({ selectProduct: product._id }); // "offers" since find() returns an array
      const categoryOffer = await CategoryOffer.findOne({
        category: product.categoryId,
      });

      if (offers.length > 0) {
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
              for (let i = 0; i < product.varietyDetails.length; i++) {
                if (
                  product.varietyDetails[i].varietyMeasurement ===
                  offer.selectedVarietyMeasurement
                ) {
                  product.varietyDetails[i].varietyDiscount =
                    categoryOffer.offerPercentage;
                  modified = true;
                }
              }
            } else {
              product.varietyDetails.forEach((variety) => {
                variety.varietyDiscount = categoryOffer.offerPercentage;
              });
              modified = true;
            }
          } else {
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
        }
      } else {
        console.log(product.productName);
        const categoryOffer = await CategoryOffer.findOne({
          category: product.categoryId,
        });
        if (categoryOffer) {
          product.varietyDetails.forEach((varietyDetail) => {
            varietyDetail.varietyDiscount = categoryOffer.offerPercentage;
          });
          modified = true;
        } else {
          product.varietyDetails.forEach((varietyDetail) => {
            varietyDetail.varietyDiscount = 0;
          });
          modified = true;
        }
      }

      if (modified) {
        product.markModified('varietyDetails');
        await product.save();
      }
    }
    const category = await Category.find({ isPublished: true });

    let categoryFilterName = [];
    if (categoryFilter) {
      categoryFilterName = await Category.findOne(
        { _id: categoryFilter.trim() },
        { categoryName: 1 }
      );
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    products = products.map((product) => product.toObject());

    await Promise.all(
      products.map(async (product) => {
        let avgRatingResult = await productReview.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(product._id) } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
            },
          },
        ]);

        product.avgRating =
          avgRatingResult.length > 0
            ? avgRatingResult[0].avgRating.toFixed(1)
            : 0;
        let reviewCount = await productReview
          .find({ productId: product._id })
          .countDocuments();
        product.totalRating = reviewCount;
      })
    );

    console.log(products); // Now all products have avgRating

    res.status(200).render(path.join('UserPages', 'shopPage'), {
      products,
      category,
      currentPage: page,
      totalPages,
      selectedCategory: categoryFilter,
      categoryFilterName,
      searchQuery,
    });
  } catch (err) {
    console.error(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function shopSinglePageRender(req, res, next) {
  try {
    const productId = req.params.id;
    console.log(
      'Product ID:',
      productId,
      'Valid:',
      mongoose.Types.ObjectId.isValid(productId)
    );
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return next(new AppError('Product Not Found', 400));
    }

    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return next(new AppError('Product Not Found', 400));
    }
    const offers = await productOffer.find({ selectProduct: product._id });
    let modified = false; // Track if any modification happens
    if (offers.length > 0) {
      const categoryOffer = await CategoryOffer.findOne({
        category: product.categoryId,
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
            for (let i = 0; i < product.varietyDetails.length; i++) {
              if (
                product.varietyDetails[i].varietyMeasurement ===
                offer.selectedVarietyMeasurement
              ) {
                product.varietyDetails[i].varietyDiscount =
                  categoryOffer.offerPercentage;
                modified = true;
              }
            }
          } else {
            product.varietyDetails.forEach((variety) => {
              variety.varietyDiscount = categoryOffer.offerPercentage;
            });
            modified = true;
          }
        } else {
          product.varietyDetails.forEach((varietyDetail) => {
            varietyDetail.varietyDiscount = 0;
          });

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
            }
          }
        }

        if (product.variety != 'items') {
          const categoryOffer = await CategoryOffer.findOne({
            category: product.categoryId,
          });
          console.log(categoryOffer);
          if (
            categoryOffer &&
            categoryOffer.endDate > Date.now() &&
            categoryOffer.startDate < Date.now() &&
            categoryOffer.isListed == true
          ) {
            const productVarieties = [];
            for (let i = 0; i < product.varietyDetails.length; i++) {
              productVarieties.push(
                product.varietyDetails[i].varietyMeasurement
              );
            }
            console.log(productVarieties);
            const offerVarieties = [];
            for (let i = 0; i < offers.length; i++) {
              offerVarieties.push(offers[i].selectedVarietyMeasurement);
            }
            console.log(productVarieties, offerVarieties);
            for (let i = 0; i < productVarieties.length; i++) {
              if (!offerVarieties.includes(productVarieties[i])) {
                product.varietyDetails.find(
                  (varietyDetail) =>
                    varietyDetail.varietyMeasurement == productVarieties[i]
                ).varietyDiscount = categoryOffer.offerPercentage;
                modified = true;
              }
            }
          }
        }
        if (modified) {
          product.markModified('varietyDetails');
          await product.save();
        }
      }
    } else {
      const categoryOffer = await CategoryOffer.findOne({
        category: product.categoryId,
      });

      if (
        categoryOffer &&
        categoryOffer.endDate > Date.now() &&
        categoryOffer.startDate < Date.now() &&
        categoryOffer.isListed == true
      ) {
        product.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = categoryOffer.offerPercentage;
        });
        modified = true;
      } else {
        product.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = 0;
        });
        modified = true;
      }
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const productVariety = product.variety;
    let varietyArr = [];
    let varietyPrice = 0;
    let varietyDiscount = 0;
    let varietyTotalPrice = 0;
    let varietyStock = 0;
    product.varietyDetails.forEach((product) => {
      varietyArr.push(product.varietyMeasurement);
    });

    if (productVariety == 'ml') {
      if (!req.query.ml) {
        const perMl = product.productPrice
          ? Object.values(product.productPrice).filter(
              (productPrice) => productPrice != null
            )
          : [];

        varietyPrice = perMl * product.varietyDetails[0].varietyMeasurement;
        varietyDiscount = product.varietyDetails[0].varietyDiscount;
        varietyTotalPrice =
          varietyPrice - (varietyPrice * varietyDiscount) / 100;
        varietyStock = product.varietyDetails[0].varietyStock;
      } else {
        console.log('jio');
        const varietyDetailIndex = varietyArr.indexOf(req.query.ml);
        const perMl = product.productPrice
          ? Object.values(product.productPrice).filter(
              (productPrice) => productPrice != null
            )
          : [];

        varietyPrice = perMl * req.query.ml;
        varietyDiscount =
          product.varietyDetails[varietyDetailIndex].varietyDiscount;
        varietyStock = product.varietyDetails[varietyDetailIndex].varietyStock;
        varietyTotalPrice =
          varietyPrice - (varietyPrice * varietyDiscount) / 100;
      }
    }

    if (productVariety == 'grams') {
      if (!req.query.grams) {
        const perGram = product.productPrice
          ? Object.values(product.productPrice).filter(
              (productPrice) => productPrice != null
            )
          : [];
        varietyPrice = perGram * product.varietyDetails[0].varietyMeasurement;
        varietyDiscount = product.varietyDetails[0].varietyDiscount;
        varietyStock = product.varietyDetails[0].varietyStock;
        varietyTotalPrice =
          varietyPrice - (varietyPrice * varietyDiscount) / 100;
      } else {
        const varietyDetailIndex = varietyArr.indexOf(req.query.grams);
        const perGrams = product.productPrice
          ? Object.values(product.productPrice).filter(
              (productPrice) => productPrice != null
            )
          : [];

        varietyPrice = perGrams * req.query.grams;
        varietyDiscount =
          product.varietyDetails[varietyDetailIndex].varietyDiscount;
        varietyStock = product.varietyDetails[varietyDetailIndex].varietyStock;
        varietyTotalPrice =
          varietyPrice - (varietyPrice * varietyDiscount) / 100;
      }
    }

    if (productVariety == 'items') {
      varietyPrice = product.varietyDetails[0].varietyPrice;
      varietyStock = product.varietyDetails[0].itemStock;
      varietyDiscount = product.varietyDetails[0].varietyDiscount;
      varietyTotalPrice = (
        varietyPrice -
        (varietyPrice * varietyDiscount) / 100
      ).toFixed(1);
    }

    const categories = await Category.findOne({
      _id: new ObjectId(product.categoryId),
    });
    const updatedProduct = {
      ...product.toObject(),
      categoryName: categories ? categories.categoryName : 'Unknown',
    };
    const relatedProducts = await Product.find({
      categoryId: updatedProduct.categoryId,
    });
    res
      .status(200)
      .render(path.join('UserPages', 'shopSingle'), {
        updatedProduct,
        originalUrl: req.originalUrl,
        varietyPrice,
        varietyDiscount,
        varietyTotalPrice,
        varietyStock,
        relatedProducts,
      });
  } catch (error) {
    console.error('Error fetching product:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function checkStockContoller(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.body.productId });

    if (!req.body.isItem) {
      const selectedVariety = product.varietyDetails.filter(
        (varietyDetail) =>
          varietyDetail.varietyMeasurement == req.body.varietyMeasurement
      );
      if (req.body.quantity > Number(selectedVariety[0].varietyStock)) {
        res.status(200).json({ available: false });
      } else {
        res.status(200).json({ available: true });
      }
    } else {
      const selectedVariety = product.varietyDetails[0];
      if (req.body.quantity > selectedVariety.itemStock) {
        res.status(200).json({ available: false });
      } else {
        res.status(200).json({ available: true });
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addReview(req, res, next) {
  try {
    if (!req.session.isLogged || !req.session.userId) {
      return res
        .status(403)
        .json({ redirectTo: '/auth/signin', isNotLogged: true });
    }

    // Check if the user has already submitted a review for this product
    const existingReview = await productReview.findOne({
      productId: req.body.productId,
      userId: req.session.userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: 'You have already reviewed this product.' });
    }

    // Proceed with saving the new review
    const review = new productReview({
      productId: req.body.productId,
      headline: req.body.headlineInput,
      reviewContent: req.body.reviewInput,
      rating: req.body.selectedRating,
      userId: req.session.userId,
    });

    await review.save();

    res.status(201).json({ message: 'Review Added Successfully' });
  } catch (err) {
    console.error('Error submitting review:', err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function loadProductReview(req, res, next) {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 2 } = req.query; // Default: fetch first 2 reviews
    const overAllReview = await productReview.find({ productId });
    let reviews = await productReview
      .find({ productId }) // Change `const` to `let`
      .skip((page - 1) * limit)
      .limit(Number(limit));

    reviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await User.findOne({ _id: review.userId });

        review = review.toObject(); // Convert Mongoose document to plain object
        review.firstName = user?.firstName || 'Unknown'; // Handle missing user
        review.secondName = user?.secondName || '';
        review.createdAt = new Date(review.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        return review;
      })
    );
    let avgRatingResult = await productReview.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } }, // Filter by product ID
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    let reviewCount = await productReview.find({ productId }).countDocuments();
    let avgRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].avgRating.toFixed(1) : 0;

    const ratings = {
      5: overAllReview.filter((review) => review.rating == 5).length,
      4: overAllReview.filter((review) => review.rating == 4).length,
      3: overAllReview.filter((review) => review.rating == 3).length,
      2: overAllReview.filter((review) => review.rating == 2).length,
      1: overAllReview.filter((review) => review.rating == 1).length,
    };
    res.json({ reviews, avgRating, reviewCount, ratings });
  } catch (error) {
    console.error('Error loading reviews:', error); // Log errors for debugging
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function filterProduct(req, res, next) {
  console.log(req.body.selectedRating);

  try {
    const category = await Category.findOne({ categoryName: req.params.id });
    console.log(category);

    const ratingRanges = {
      1: { min: 0, max: 1.9 },
      2: { min: 2, max: 3 },
      3: { min: 3.1, max: 4 },
      4: { min: 4.1, max: 4.9 },
      5: { min: 4.1, max: 5 },
    };

    // Get min and max values dynamically

    const minRating =
      Math.min(
        ...req.body.selectedRating.map((star) => ratingRanges[star]?.min)
      ) || 0;
    const maxRating =
      Math.max(
        ...req.body.selectedRating.map((star) => ratingRanges[star]?.max)
      ) || 0;

    console.log(minRating, maxRating);

    let products = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratings',
        },
      },
      {
        $addFields: {
          averageRating: { $avg: '$ratings.rating' },
        },
      },
      {
        $match: {
          categoryId: category._id.toString(),
          averageRating: { $gte: minRating, $lte: maxRating },
        },
      },
    ]);

    await Promise.all(
      products.map(async (product) => {
        let avgRatingResult = await productReview.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(product._id) } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
            },
          },
        ]);

        product.avgRating =
          avgRatingResult.length > 0
            ? avgRatingResult[0].avgRating.toFixed(1)
            : 0;
        let reviewCount = await productReview
          .find({ productId: product._id })
          .countDocuments();
        product.totalRating = reviewCount;
      })
    );

    for (let i = 0; i < products.length; i++) {
      // Handle ratings calculation
      let fullStars = Math.floor(products[i].avgRating);
      let halfStar = products[i].avgRating % 1 >= 0.5 ? '★' : '';
      let emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
      let starsHTML = '★'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);

      // Handle pricing logic
      let priceHTML = '';
      if (products[i].variety !== 'items') {
        let price =
          Object.values(products[i].productPrice).find((p) => p !== null) || 0;
        let variety = products[i].varietyDetails[0] || {};
        let basePrice = variety.varietyMeasurement * price;
        let discountPrice = variety.varietyDiscount
          ? basePrice - (basePrice * variety.varietyDiscount) / 100
          : basePrice;
        console.log(discountPrice);
        products[i].finalPrice = discountPrice;
      } else {
        let variety = products[i].varietyDetails[0] || {};
        let originalPrice = variety.varietyPrice || 0;
        let discountedPrice = variety.varietyDiscount
          ? originalPrice - (originalPrice * variety.varietyDiscount) / 100
          : originalPrice;
        products[i].finalPrice = Number(discountedPrice);
      }
    }
    if(req.body.minPrice&&req.body.maxPrice){
      products = products.filter((product) => {
        return (
          product.finalPrice >= (req.body.minPrice ?? -Infinity) &&
          product.finalPrice <= (req.body.maxPrice ?? Infinity)
        );
      });
    }
   
    res.status(200).json({ products });
    console.log(products.length);
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  shopPageRender,
  shopSinglePageRender,
  checkStockContoller,
  addReview,
  loadProductReview,
  filterProduct,
};
