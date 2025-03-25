const Address = require('../../model/addressSchema');
const Cart = require('../../model/cartSchema');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../../model/userSchema');
const fs = require('fs');
const Product = require('../../model/productModel');
const cartSchema = require('../../model/cartSchema');
const Wishlist = require('../../model/wishlistSchema');
const Coupon = require('../../model/couponScehma');
const Wallet = require('../../model/walletSchema');
const orderController = require('./orderController');
const AppError = require('../../middleware/errorHandling');
const { v4: uuidv4 } = require('uuid');
async function checkoutPageRender(req, res, next) {
  try {
    if (req.session.checkoutSession == false) {
      return res.redirect('/cart'); // Redirect if session expired
    }
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

    let cart = JSON.stringify(
      await Cart.findOne({ userId: req.session.userId })
    );

    if (cart?.coupon?.discount) {
      cart.grandTotal =
        cart.grandTotal - (cart.grandTotal * cart.coupon.discount) / 100;
    }
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
        } else {
          productPrice = productDetail.varietyDetails[0].varietyPrice;
          discountPrice = (
            productPrice *
            (1 - productDetail.varietyDetails[0].varietyDiscount / 100)
          ).toFixed(1);
        }
        return {
          ...product,
          productName: productDetail
            ? productDetail.productName
            : 'Unknown Product', // Add product name
          productImg: productDetail?.productPic?.productImage1,
          productPrice: productPrice,
          discountPrice: discountPrice,
        };
      })
    );

    let address = await Address.find({ userId: req.session.userId });

    address.sort((a, b) => b.isDefault - a.isDefault);

    const wallet = await Wallet.findOne({ userId: req.session.userId });

    res
      .status(200)
      .render(path.join('../', 'views', 'UserPages', 'orderSide', 'checkout'), {
        address,
        cart,
        wallet,
      });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function verifyCoupon(req, res, next) {
  try {
    const { couponCode } = req.body;
    const userId = req.session.userId;

    // Fetch coupon, cart, and user simultaneously
    const [coupon, cart, user] = await Promise.all([
      Coupon.findOne({ couponCode }),
      Cart.findOne({ userId }),
      User.findById(userId),
    ]);

    if (!coupon) {
      return res.status(400).json({
        error: 'Invalid Coupon',
        text: 'This coupon code does not exist.',
      });
    }

    if (coupon.type == 'Special') {
      if (coupon.user == req.session.userId) {
      } else {
        return res.status(400).json({
          error: 'Invalid Coupon',
          text: 'This coupon code does not exist.',
        });
      }
    }else{
      if (coupon.couponStartDate > new Date()) {
        return res.status(400).json({
          error: 'Upcoming Coupon',
          text: `This coupon will be valid from ${coupon.couponStartDate}.`,
        });
      }
  
      if (coupon.couponExpiryDate < new Date()) {
        return res.status(400).json({
          error: 'Expired Coupon',
          text: 'This coupon has expired.',
        });
      }
    }

  

    if (!cart) {
      return res.status(400).json({
        error: 'Cart Not Found',
        text: 'Your cart is empty or unavailable.',
      });
    }

    if (cart.grandTotal < coupon.minimumPurchase) {
      return res.status(400).json({
        error: 'Minimum Purchase Not Met',
        text: `This coupon requires a minimum purchase of ${coupon.minimumPurchase}.`,
      });
    }

    if (user.usedCoupons.includes(couponCode)) {
      return res.status(403).json({
        error: 'Usage Limit Reached',
        text: 'This coupon has already been used.',
      });
    }

    // Add coupon to user's usedCoupons list and save

    cart.coupon.name = coupon.couponCode;
    cart.coupon.discount = coupon.discountPercentage;
    let discountAmount = (cart.grandTotal * coupon.discountPercentage) / 100;

    if (discountAmount > coupon.maximumDiscount) {
      console.log(
        cart.grandTotal - (cart.grandTotal * coupon.discountPercentage) / 100,
        coupon.maximumDiscount
      );
      cart.grandTotal = cart.grandTotal - coupon.maximumDiscount;
      cart.coupon.maxPurchase = coupon.maximumDiscount;
      cart.coupon.discount = 0;
      cart.coupon.isMax = true;
    } else {
      cart.coupon.isMax = false;
      cart.coupon.maxPurchase = 0;

      cart.grandTotal =
        cart.grandTotal - (cart.grandTotal * coupon.discountPercentage) / 100;
    }
    console.log(cart.coupon.isMax, 'dsahjkjhhasd');
    cart.save();

    return res.status(200).json({
      message: 'Coupon Applied Successfully!',
      text: 'Your discount has been applied.',
    });
  } catch (err) {
    console.error('Error verifying coupon:', err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function removeCoupon(req, res, next) {
  try {
    const cart = await Cart.findOne({ userId: req.session.userId });

    if (cart.coupon.isMax) {
      cart.grandTotal = cart.grandTotal + cart.coupon.maxPurchase;
      cart.coupon.isMax = false;
    } else {
      cart.grandTotal = cart.grandTotal / (1 - cart.coupon.discount / 100);
    }

    cart.coupon.name = null;
    cart.coupon.discount = 0;
    cart.save(res.status(200).json({ message: 'Coupon Removed' }));
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function placeOrderWithWallet(req, res, next) {
  try {
    let isWalletPayment = true;
    const wallet = await Wallet.findOne({ userId: req.session.userId });

    if (req.body.amount > wallet.balance) {
      return res.status(400).json({
        error:
          'Insufficient balance. Please add funds or use another payment method.',
      });
    }
    await orderController.placeOrder(req, res, null, isWalletPayment);
    wallet.balance = wallet.balance - req.body.amount;

    let transactionDetails = {
      amount: req.body.amount,
      type: 'Razorpay',
      transactionDetail: 'Payment for purchased product',
      transactionId: uuidv4(),
      transactionType: 'Debit',
    };

    wallet.transactions.push(transactionDetails);
    await wallet.save();
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
module.exports = {
  checkoutPageRender,
  verifyCoupon,
  removeCoupon,
  placeOrderWithWallet,
};
