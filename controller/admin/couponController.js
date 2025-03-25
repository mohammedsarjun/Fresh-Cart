const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Cart = require('../../model/cartSchema');
const Product = require('../../model/productModel');
const orderSchema = require('../../model/orderSchema');
const Coupon = require('../../model/couponScehma');
const { default: mongoose } = require('mongoose');
const AppError = require('../../middleware/errorHandling');

async function renderCouponPage(req, res, next) {
  try {
    let coupon = await Coupon.find({ type: { $ne: 'Special' } });
    for (let coupons of coupon) {
      if (new Date() < new Date(coupons.couponStartDate)) {
        coupons.currentStatus = 'upcoming'; // Set to "upcoming" if current date is before start date
      } else if (new Date() > new Date(coupons.couponExpiryDate)) {
        coupons.currentStatus = 'expired'; // Set to "expired" if current date is after expiry date
      } else {
        coupons.currentStatus = 'active'; // Otherwise, it's active
      }

      await coupons.save();
    }
    let page = parseInt(req.query.page) || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || '';

    let regexPattern = new RegExp(searchQuery, 'i');

    // Use regex in the query
    let filter = { couponCode: regexPattern, type: { $ne: 'Special' } };

    coupon = await Coupon.find(filter).skip(skip).limit(limit);
    coupon = coupon.map((coupon) => {
      return {
        ...coupon.toObject(),
        couponStartDate: new Date(coupon.couponStartDate).toLocaleDateString(
          'en-GB'
        ),
        couponExpiryDate: new Date(coupon.couponExpiryDate).toLocaleDateString(
          'en-GB'
        ),
      };
    });

    const totalCoupon = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupon / limit);
    res.status(200).render(path.join('../', 'views', 'admin pages', 'coupon'), {
      coupon,
      totalPages,
      page,
      searchQuery,
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addCoupon(req, res, next) {
  try {
    const existingCoupon = await Coupon.findOne({
      couponCode: req.body.couponName,
    });

    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon already exists' });
    }

    const coupon = new Coupon({
      couponCode: req.body.couponName,
      discountPercentage: req.body.discountPercentage,
      couponStartDate: req.body.startDate,
      couponExpiryDate: req.body.expiryDate,
      minimumPurchase: req.body.minPurchase,
      maximumDiscount: req.body.maxDiscount,
    });

    await coupon.save();
    res.status(200).json({ message: 'Coupon Added Successfully' });
  } catch (err) {
    console.error(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateCoupon(req, res, next) {
  try {
    console.log(req.body);

    const coupon = await Coupon.findOne({ _id: req.body.couponId });

    console.log(coupon);

    const existingCoupon = await Coupon.findOne({
      couponCode: req.body.couponName,
      _id: { $ne: coupon._id },
    });
    console.log(existingCoupon);
    if (existingCoupon) {
      console.log('gello');
      return res
        .status(400)
        .json({ error: 'Coupon with this name already exists' });
    }

    coupon.couponCode = req.body.couponName;
    coupon.discountPercentage = req.body.discountPercentage;
    coupon.couponStartDate = req.body.startDate;
    coupon.couponExpiryDate = req.body.expiryDate;
    coupon.minimumPurchase = req.body.minPurchase;
    coupon.maximumDiscount = req.body.maxDiscount;
    coupon.isListed = req.body.updateListingStatus === 'listed' ? true : false;

    await coupon.save();

    res.status(200).json({ message: 'Coupon Edited Successfully' });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function deleteCoupon(req, res, next) {
  try {
    const { couponId } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ error: 'coupon not found.' });
    }

    // Delete the user
    await Coupon.findByIdAndDelete(coupon);

    res.json({ message: 'Coupon deleted successfully!' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
module.exports = {
  renderCouponPage,
  addCoupon,
  updateCoupon,
  deleteCoupon,
};
