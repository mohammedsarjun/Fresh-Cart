const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../../model/userSchema');
const fs = require('fs');
const Cart = require('../../model/cartSchema');
const cartSchema = require('../../model/cartSchema');
const Wishlist = require('../../model/wishlistSchema');
const Category = require('../../model/category');
const Product = require('../../model/productModel');
const productOffer = require('../../model/productOffers');
const CategoryOffer = require('../../model/categoryOffer');
const AppError = require('../../middleware/errorHandling');
//cart

async function cartPageRender(req, res, next) {
  try {
    let isStock = false;
    let isValidCheckout = true;
    let userCart = await Cart.findOne({ userId: req.session.userId });

    if (!userCart) {
      userCart = new Cart({
        userId: req.session.userId,
        products: [],
        subtotal: 0,
        shippingCost: 0,
        grandTotal: 0,
        couponName: null,
        couponDiscount: 0,
      });
    }
    if (userCart.products.length == 0) {
      userCart.shippingCost = 0;
      userCart.grandTotal = 0;
      await userCart.save();
    }
    userCart.coupon.name = null;
    userCart.coupon.discount = 0;
    await userCart.save();
    for (let product of userCart.products) {
      productDetail = await Product.findOne({ _id: product.productId });

      const offers = await productOffer.find({
        selectProduct: productDetail?._id,
      }); // "offers" since find() returns an array

      if (offers.length > 0) {
        let modified = false; // Track if any modification happens

        for (let offer of offers) {
          if (
            offer.endDate > Date.now() &&
            offer.startDate < Date.now() &&
            offer.isListed == true
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

        
              try {
                if (modified) {
                  productDetail.markModified('varietyDetails');
                    await productDetail.save();
                }
            } catch (error) {
                if (error.name === 'VersionError') {
                    // Refetch latest data and retry
                    const latestProduct = await Product.findById(productDetail._id);
                    latestProduct.varietyDetails = productDetail.varietyDetails;
                    await latestProduct.save();
                }
            }
      } else {
        productDetail.varietyDetails.forEach((varietyDetail) => {
          varietyDetail.varietyDiscount = 0;
        });
        productDetail.markModified('varietyDetails');
        await productDetail.save();
      }
    }

    //updating database for product offer
    let modified = false;
    for (let product of userCart.products) {
      productDetail = await Product.findOne({ _id: product.productId });
      const offers = await productOffer.find({
        selectProduct: productDetail._id,
      }); // "offers" since find() returns an array
      const categoryOffer = await CategoryOffer.findOne({
        category: productDetail.categoryId,
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
            if (
              offer.endDate > Date.now() &&
              offer.startDate < Date.now() &&
              offer.isListed == true
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
      } else {
        console.log(productDetail.productName);
        const categoryOffer = await CategoryOffer.findOne({
          category: productDetail.categoryId,
        });
        if (categoryOffer) {
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
    }

    for (let i = 0; i < userCart.products.length; i++) {
      const product = await Product.findOne({
        _id: userCart.products[i].productId,
      });
      let productDiscount = 0;
      if (userCart.products[i].selectedVariety.type != 'items') {
        productDiscount = product.varietyDetails.find(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            userCart.products[i].selectedVariety.value
        ).varietyDiscount;
      } else {
        productDiscount = product.varietyDetails[0].varietyDiscount;
      }
      userCart.products[i].selectedVariety.productDiscount = productDiscount;
      await userCart.save();
    }
    //deleting Unlist Product
    for (let i = 0; i < userCart.products.length; i++) {
      const productDetail = await Product.findOne({
        _id: userCart.products[i].productId,
      });
      const categoryDetail = await Category.findOne({
        _id: productDetail.categoryId,
      });
      if (
        productDetail.isListed == false ||
        categoryDetail.isPublished == false
      ) {
        userCart.products.splice(i, 1);
        await userCart.save();
        i--;
      }
      if(productDetail.isDeleted==true){
        userCart.products.splice(i, 1);
        await userCart.save();
        i--;
      }
    }

    //deleting Unlist Product End here ---------------------

    for (let i = 0; i < userCart.products.length; i++) {
      const productDetail = await Product.findOne({
        _id: userCart.products[i].productId,
      });

      if (productDetail.variety != 'items') {
        const productStock = productDetail.varietyDetails.filter(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            userCart.products[i].selectedVariety.value
        )[0].varietyStock;
        if (userCart.products[i].quantity > productStock) {
          userCart.products[i].quantity = productStock;
          await userCart.save();
        }
      } else {
        const productStock = productDetail.varietyDetails[0].itemStock;
        if (userCart.products[i].quantity > productStock) {
          userCart.products[i].quantity = productStock;
          await userCart.save();
        }
      }
      for (let i = 0; i < userCart.products.length; i++) {
        const productDetail = await Product.findOne({
          _id: userCart.products[i].productId,
        });
        if (productDetail.variety != 'items') {
          const selectedVariety = userCart.products[i].selectedVariety.value;
          const varietyDetail = productDetail?.varietyDetails.filter(
            (varietyDetail) =>
              varietyDetail.varietyMeasurement == selectedVariety
          )[0];

          const price = Object.values(productDetail.productPrice).find(
            (price) => price != null
          );

          const productPrice =
            varietyDetail.varietyMeasurement *
            price *
            userCart.products[i].quantity;

          const productDiscount = productDetail.varietyDetails.filter(
            (varietyDetail) =>
              varietyDetail.varietyMeasurement ==
              userCart.products[i].selectedVariety.value
          )[0].varietyDiscount;
          let totalPrice =
            productPrice - (productPrice * productDiscount) / 100;

          userCart.subtotal = totalPrice;
          console.log(userCart.subtotal);

          await userCart.save();
        } else {
          const productStock = productDetail.varietyDetails[0].itemStock;
          if (userCart.products[i].quantity > productStock) {
            userCart.products[i].quantity = productStock;
            await userCart.save();
          }
        }
      }
    }
    let cart = await Cart.findOne({ userId: req.session.userId });
    cart.subtotal = 0;
    cart.products.forEach((product) => {
      if (product.selectedVariety.type != 'items') {
        cart.subtotal =
          cart.subtotal +
          product.selectedVariety.value *
            product.selectedVariety.pricePerVariety *
            (1 - product.selectedVariety.productDiscount / 100) *
            product.quantity;
      } else {
        cart.subtotal =
          cart.subtotal +
          product.selectedVariety.pricePerVariety *
            (1 - product.selectedVariety.productDiscount / 100) *
            product.quantity;
      }
    });

    if (cart.subtotal == 0) {
      cart.shippingCost = 0;
    }

    // Update grand total
    cart.grandTotal = cart.subtotal + cart.shippingCost;

    await cart.save();
    cart = JSON.stringify(await Cart.findOne({ userId: req.session.userId }));
    cart = JSON.parse(cart);

    let productPrice = 0;
    let discountPrice = 0;

    // Fetch product details and update the cart.products array
    cart.products = await Promise.all(
      cart.products.map(async (product) => {
        const productDetail = await Product.findOne({ _id: product.productId });
        if (product.selectedVariety.type != 'items') {
          productPrice =
            product?.selectedVariety?.value *
            Object.entries(productDetail?.productPrice || {}).filter(
              ([_, value]) => value != null
            )[0][1];
          discountPrice = (
            productPrice -
            (productPrice *
              productDetail.varietyDetails.filter(
                (varietyDetail) =>
                  varietyDetail.varietyMeasurement ==
                  product.selectedVariety.value
              )[0].varietyDiscount) /
              100
          ).toFixed(1);
          let varietyStock = productDetail.varietyDetails.filter(
            (varietyDetail) =>
              varietyDetail.varietyMeasurement == product.selectedVariety.value
          )[0].varietyStock;

          isStock = varietyStock > 0 ? true : false;
        } else {
          productPrice = productDetail.varietyDetails[0].varietyPrice;
          discountPrice = (
            productPrice *
            (1 - productDetail.varietyDetails[0].varietyDiscount / 100)
          ).toFixed(1);
          isStock =
            productDetail.varietyDetails[0].itemStock > 0 ? true : false;
        }

        console.log(isValidCheckout);
        return {
          ...product,
          productName: productDetail
            ? productDetail.productName
            : 'Unknown Product', // Add product name
          productImg: productDetail?.productPic?.productImage1,
          productPrice: productPrice,
          discountPrice: discountPrice,
          isStock: isStock,
        };
      })
    );

    for (let i = 0; i < cart.products.length; i++) {
      if (cart.products[i].isStock == false) {
        isValidCheckout = false;
        break;
      }
    }
    req.session.checkoutSession = true;
    let cartCount = cart.products.length;

    res
      .status(200)
      .render(
        path.join('../', 'views', 'UserPages', 'cart-wishlist', 'shopCart'),
        { cart, isValidCheckout, cartCount }
      );
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addCart(req, res, next) {
  try {
    if (req.session.isLogged) {
      const user = await User.findOne({ _id: req.session.userId });
      if (user.isBlocked == true) {
        req.session.isLogged = false;
        return res.status(401).json({
          redirectTo: '/auth/blocked',
        });
      } else {
      }
    } else {
      return res.status(401).json({
        redirectTo: '/auth/signin',
      });
    }
  } catch (err) {
    console.log('middleware: ', err);
  }
  try {
    console.log(req.body);
    // Check if the user already has a cart
    let cart = await Cart.findOne({ userId: req.session.userId });
    const product = await Product.findOne({ _id: req.body.productId });
    let varietyMeasurement =
      req.body.varietyMeasurement ||
      product.varietyDetails[0].varietyMeasurement;
    let responed = false;

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({
        userId: req.session.userId,
        products: [],
        subtotal: 0,
        shippingCost: 0,
        grandTotal: 0,
        couponName: null,
        couponDiscount: 0,
      });
    }

    let productPrice = 0;

    // Check if the product already exists in the cart
    let existingProduct = cart.products.find(
      (p) =>
        p.productId.toString() === req.body.productId &&
        (!req.body.variety ||
          (p.selectedVariety.type === req.body.variety &&
            p.selectedVariety.value == varietyMeasurement))
    );

    console.log(existingProduct);

    if (req.body.variety !== 'items') {
      let selectedVariety =
        product.varietyDetails.find(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement == req.body.varietyMeasurement
        ) || product.varietyDetails[0];

      let pricePerUnit = Object.entries(product.productPrice)?.filter(
        ([key, value]) => value !== null
      )[0][1];

      let discountAmount =
        (selectedVariety.varietyDiscount / 100) *
        (selectedVariety.varietyMeasurement * pricePerUnit);

      productPrice =
        selectedVariety.varietyMeasurement * pricePerUnit - discountAmount;

      if (existingProduct) {
        let overAllQuantity =
          existingProduct.quantity + parseInt(req.body.quantity);
        // If product already exists, update the quantity
        let productStock = await Product.findOne({
          _id: existingProduct.productId,
        });

        productStock = productStock.varietyDetails.filter(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            existingProduct.selectedVariety.value
        )[0].varietyStock;
        console.log(productStock);
        if (overAllQuantity > productStock) {
          res.status(400).json({
            status: 400,
            error: 'Not enough stock available',
          });
          responed = true;
        } else if (overAllQuantity > 20) {
          res.status(400).json({
            status: 400,
            error: 'Add to cart limit exceeded for this product!',
          });
          responed = true;
        } else {
          existingProduct.quantity = overAllQuantity;
        }
      } else {
        const product = await Product.findOne({ _id: req.body.productId });
        // If product doesn't exist, add new entry
        cart.products.push({
          productId: req.body.productId,
          quantity: parseInt(req.body.quantity),
          selectedVariety: {
            type: req.body.variety || null,
            value:
              req.body.varietyMeasurement ||
              product.varietyDetails[0].varietyMeasurement,
            pricePerVariety: Object.values(product.productPrice).filter(
              (productPrice) => productPrice != null
            )[0],
            productDiscount: product.varietyDetails.filter(
              (varietyDetail) =>
                varietyDetail.varietyMeasurement ==
                  req.body.varietyMeasurement ||
                product.varietyDetails[0].varietyMeasurement
            )[0].varietyDiscount,
          },
        });
      }
    } else {
      if (existingProduct) {
        let overAllQuantity =
          existingProduct.quantity + parseInt(req.body.quantity);
        // If product already exists, update the quantity
        let productStock = await Product.findOne({
          _id: existingProduct.productId,
        });

        productStock = productStock.varietyDetails[0].itemStock;
        console.log(productStock);
        if (overAllQuantity > productStock) {
          res.status(400).json({
            status: 400,
            error: 'Not enough stock available',
          });
          responed = true;
        } else if (overAllQuantity > 20) {
          res.status(400).json({
            status: 400,
            error: 'Add to cart limit exceeded for this product!',
          });
          responed = true;
        } else {
          existingProduct.quantity = overAllQuantity;
        }
      } else {
        const product = await Product.findOne({ _id: req.body.productId });
        cart.products.push({
          productId: req.body.productId,
          quantity: parseInt(req.body.quantity),
          selectedVariety: {
            type: req.body.variety || null,
            value: null,
            pricePerVariety: product.varietyDetails[0].varietyPrice,
            productDiscount: product.varietyDetails[0].varietyDiscount,
          },
        });
        let variety = product.varietyDetails[0]; // Get the first variety

        let discountAmount =
          (variety.varietyDiscount / 100) * variety.varietyPrice;
        productPrice = variety.varietyPrice - discountAmount;
      }
    }

    // Update subtotal
    cart.subtotal += productPrice * req.body.quantity;
    cart.shippingCost = 40;

    // Update grand total
    cart.grandTotal = cart.subtotal + cart.shippingCost;

    // Save the cart
    await cart.save();
    if (responed == false) {
      res.status(200).json({
        status: 200,
        message: 'Product added to cart successfully',
      });
    }
  } catch (error) {
    console.error('Error Adding cart:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ userId: req.session.userId });
    console.log(req.body);
    req.body.forEach(async (obj) => {
      // console.log(obj.isItem)
      if (obj.isItem == false) {
        cart.products
          .filter((product) => product.productId == obj.productId)
          .filter(
            (product) => product.selectedVariety.value == obj.productMeasurement
          )[0].quantity = obj.productQuantity;
      } else {
        cart.products.filter(
          (product) => product.productId == obj.productId
        )[0].quantity = obj.productQuantity;
      }
    });

    cart.subtotal = 0;
    cart.products.forEach((product) => {
      if (product.selectedVariety.type != 'items') {
        cart.subtotal =
          cart.subtotal +
          product.selectedVariety.value *
            product.selectedVariety.pricePerVariety *
            (1 - product.selectedVariety.productDiscount / 100) *
            product.quantity;
      } else {
        cart.subtotal =
          cart.subtotal +
          product.selectedVariety.pricePerVariety *
            (1 - product.selectedVariety.productDiscount / 100) *
            product.quantity;
      }
    });
    cart.shippingCost = 40;

    // Update grand total
    cart.grandTotal = cart.subtotal + cart.shippingCost;

    await cart.save();
    res.status(200).json({
      status: 200,
      message: 'Cart Updated Successfully',
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function deleteCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });

    for (let i = 0; i < cart.products.length; i++) {
      if (req.body.variety != 'items') {
        if (
          cart?.products[i]?.productId == req.body.productId &&
          cart?.products[i]?.selectedVariety?.value ==
            req.body.varietyMeasurement
        ) {
          const productDetail = await Product.findOne({
            _id: cart.products[i].productId,
          });
          let pricePerVariety = Object.values(
            productDetail.productPrice
          ).filter((productPrice) => productPrice != null)[0];
          let productDiscount = productDetail.varietyDetails.filter(
            (varietyDetail) =>
              varietyDetail.varietyMeasurement ==
              cart.products[i].selectedVariety.value
          )[0].varietyDiscount;
          cart.subtotal =
            cart.subtotal -
            pricePerVariety *
              cart.products[i].selectedVariety.value *
              (1 - productDiscount / 100) *
              cart.products[i].quantity;
          cart.grandTotal = cart.subtotal + cart.shippingCost;
          cart.products.splice(i, 1);
          break;
        }
      } else {
        if (cart.products[i].productId == req.body.productId) {
          const productDetail = await Product.findOne({
            _id: cart.products[i].productId,
          });
          cart.subtotal =
            cart.subtotal -
            productDetail.varietyDetails[0].varietyPrice *
              (1 - productDetail.varietyDetails[0].varietyDiscount / 100) *
              cart.products[i].quantity;
          cart.grandTotal = cart.subtotal + cart.shippingCost;
          cart.products.splice(i, 1);
          break;
        }
      }
    }

    await cart.save();
    res
      .status(200)
      .json({ status: 200, message: 'Your Item Has Been Deleted from Cart' });
  } catch (error) {
    console.log(error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//----------------------------------------------------wishlist-------------------------------------------------//
async function wishlistPageRender(req, res, next) {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.session.userId });
    let wishlistObj = [];

    for (let i = 0; i < wishlist?.products?.length; i++) {
      if (wishlist.products[i].variety.varietyName != 'items') {
        let productDetail = await Product.findOne({
          _id: wishlist.products[i].productId,
        });
        wishlistObj.push({
          ...wishlist.products[i].toObject(),
          productName: productDetail.productName,
          productPic: productDetail.productPic.productImage1,
          productPrice:
            productDetail.varietyDetails.find(
              (varietyDetail) =>
                varietyDetail.varietyMeasurement ==
                wishlist.products[i].variety.varietyMeasurement
            ).varietyMeasurement *
            Object.values(productDetail.productPrice).find(
              (price) => price != null
            ),
          productStock: productDetail.varietyDetails.find(
            (varietyDetail) =>
              varietyDetail.varietyMeasurement ==
              wishlist.products[i].variety.varietyMeasurement
          ).varietyStock,
          productVariety: productDetail.variety,
          varietyMeasurement: wishlist.products[i].variety.varietyMeasurement,
        });
      } else {
        let productDetail = await Product.findOne({
          _id: wishlist.products[i].productId,
        });
        wishlistObj.push({
          ...wishlist.products[i].toObject(),
          productName: productDetail.productName,
          productPic: productDetail.productPic.productImage1,
          productPrice: productDetail.varietyDetails[0].varietyPrice,
          productStock: productDetail.varietyDetails[0].itemStock,
          productVariety: productDetail.variety,
          varietyMeasurement: null,
        });
      }
    }

    const cart = await Cart.findOne({ userId: req.session.userId });

    for (let i = 0; i < wishlist?.products?.length; i++) {
      for (let j = 0; j < cart?.products?.length; j++) {
        if (
          String(wishlist?.products[i]?.productId) ==
            String(cart?.products[j]?.productId) &&
          String(wishlist?.products[i]?.variety?.varietyMeasurement) ==
            String(cart?.products[j]?.selectedVariety?.value)
        ) {
          wishlist.products.splice(i, 1);
          await wishlist.save();

          wishlistObj.splice(i, 1);
        }
      }
    }


    for (let i = 0; i < wishlist?.products?.length; i++) {
      const productDetail = await Product.findOne({
        _id: wishlist.products[i].productId,
      });
      const categoryDetail = await Category.findOne({
        _id: productDetail.categoryId,
      });
      if (
        productDetail.isListed == false ||
        categoryDetail.isPublished == false
      ) {
        wishlist.products.splice(i, 1);
        await wishlist.save();
        wishlistObj.splice(i, 1);
      }
      if(productDetail.isDeleted==true){
        wishlist.products.splice(i, 1);
        await wishlist.save();
        wishlistObj.splice(i, 1);
      }
    }
    let wishlistCount = wishlistObj.length;
    res
      .status(200)
      .render(
        path.join('../', 'views', 'UserPages', 'cart-wishlist', 'wishlist'),
        { wishlistObj, wishlistCount }
      );
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addWishlist(req, res, next) {
  try {
    if (req.session.isLogged) {
      const user = await User.findOne({ _id: req.session.userId });
      if (user.isBlocked == true) {
        req.session.isLogged = false;
        return res.status(401).json({
          redirectTo: '/auth/blocked',
        });
      } else {
      }
    } else {
      return res.status(401).json({
        status: 401,
        redirectTo: '/auth/signin',
      });
    }
  } catch (err) {
    console.log('middleware: ', err);
  }
  try {
    console.log(req.body);

    // Find the product
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let varietyMeasurement = req.body.varietyMeasurement;
    if (req.body.isItem == false && varietyMeasurement == null) {
      varietyMeasurement = product.varietyDetails[0].varietyMeasurement;
    }

    // Check if the wishlist exists for the user
    let wishlist = await Wishlist.findOne({ userId: req.session.userId });

    if (wishlist) {
      // Check if the product already exists in the wishlist
      const existingProduct = wishlist.products.find(
        (item) =>
          item.productId.toString() === req.body.productId &&
          item.variety.varietyMeasurement === varietyMeasurement
      );

      if (existingProduct) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      // Push the new product into the wishlist's products array
      wishlist.products.push({
        productId: req.body.productId,
        isItem: req.body.isItem,
        variety: {
          varietyName: req.body.variety,
          varietyMeasurement: varietyMeasurement || null,
        },
      });

      await wishlist.save();
      return res.status(200).json({ message: 'Product added to wishlist' });
    } else {
      // Create a new wishlist if none exists
      const newWishlist = new Wishlist({
        userId: req.session.userId,
        products: [
          {
            productId: req.body.productId,
            isItem: req.body.isItem,
            variety: {
              varietyName: req.body.variety,
              varietyMeasurement: varietyMeasurement || null,
            },
          },
        ],
      });

      await newWishlist.save();
      return res.status(200).json({ message: 'Wishlist Added' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function deleteWishlist(req, res, next) {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.session.userId });

    for (let i = 0; i < wishlist.products.length; i++) {
      if (req.body.variety != 'items') {
        if (
          wishlist.products[i].productId == req.body.productId &&
          wishlist.products[i].variety.varietyMeasurement ==
            req.body.varietyMeasurement
        ) {
          wishlist.products.splice(i, 1);
          break;
        }
      } else {
        if (wishlist.products[i].productId == req.body.productId) {
          wishlist.products.splice(i, 1);
          break;
        }
      }
    }

    await wishlist.save();
    res
      .status(200)
      .json({ message: 'Your Item Has Been Deleted from Wishlist' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function modifyCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (req.body.modify === 'increase') {
      if (req.body.isItem !== true) {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity += 1; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity increased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      } else {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity += 1; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity increased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      }
    }

    if (req.body.modify === 'decrease') {
      if (req.body.isItem !== true) {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity -= 1; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity Decreased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      } else {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity -= 1; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity increased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      }
    }

    if (req.body.modify === 'direct') {
      if (req.body.isItem !== true) {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity = req.body.currentValue; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity Decreased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      } else {
        let filterProduct = cart.products.find(
          (product) => product.productId == req.body.productId
        );
        if (filterProduct) {
          filterProduct.quantity = req.body.currentValue; // Correct way to modify the quantity
          cart.markModified('products');
          await cart.save();
          return res.status(200).json({ message: 'Quantity increased', cart });
        } else {
          return res.status(404).json({ message: 'Product not found in cart' });
        }
      }
    }

    return res.status(400).json({ message: 'Invalid request' });
  } catch (err) {
    console.error(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  cartPageRender,
  addCart,
  updateCart,
  deleteCart,
  wishlistPageRender,
  addWishlist,
  deleteWishlist,
  modifyCart,
};
