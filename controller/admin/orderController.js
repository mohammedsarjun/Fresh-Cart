const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../../model/userSchema');
const fs = require('fs');
const Cart = require('../../model/cartSchema');
const Product = require('../../model/productModel');
const cartSchema = require('../../model/cartSchema');
const Wishlist = require('../../model/wishlistSchema');
const orderSchema = require('../../model/orderSchema');
const Wallet = require('../../model/walletSchema');
const AppError = require('../../middleware/errorHandling');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
async function renderOrderPage(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || '';
    let statusQuery = req.query.status || '';

    // Create a regex pattern (case-insensitive) to match name or email
    let regexPattern = new RegExp(searchQuery, 'i');

    // Create the filter object dynamically
    let filter = {};

    if (searchQuery) {
      filter['orderId'] = regexPattern; // Use regex for flexible searching
    }

    if (statusQuery) {
      filter['orderStatus'] = statusQuery; // Exact match for status
    }

    const orderDetails = await orderSchema
  .find(filter)
  .sort({ orderDateAndTime: -1 }) // Sorts in descending order
  .skip(skip)
  .limit(limit);
  
    console.log(orderDetails.length);
    const updatedOrders = await Promise.all(
      orderDetails.map(async (orderDetail) => {
        // Convert to plain object
        let order = orderDetail.toObject();
        const userDetails = await User.findOne({ _id: orderDetail.userId });
        const productDetail = await Product.findOne({
          _id: order.products[0]?.productId,
        });

        // Add custom fields
        order.renderOrderDateAndTime =
          order.orderDateAndTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        order.frontProductImg = productDetail?.productPic?.productImage1;
        order.frontProductName = productDetail?.productName;
        order.totalProduct = order.products?.length - 1;
        order.userName = `${userDetails?.firstName} ${
          userDetails?.secondName || ''
        }`;

        return order;
      })
    );
    console.log(updatedOrders);
    // Now it contains the additional fields

  
    const totalProducts = await orderSchema.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).render(path.join('../', 'views', 'admin pages', 'orders'), {
      updatedOrders,
      totalPages,
      page,
      searchQuery,
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function renderOrderDetailPage(req, res, next) {
  try {
    let order = await orderSchema.findOne({ _id: req?.params?.id });
    let userDetail = await User.findOne({ _id: order.userId });

    order = order.toObject();
    order.userName = `${userDetail?.firstName} ${userDetail?.secondName || ''}`;
    order.userEmail = userDetail?.email;
    order.renderOrderDateAndTime = order.orderDateAndTime.toLocaleString();

    for (let i = 0; i < order.products.length; i++) {
      let productDetails = await Product.findOne({
        _id: order.products[i].productId,
      });
      order.products[i].productPic = productDetails.productPic.productImage1;
      order.products[i].variety = productDetails.variety;
    }

      let orders = await orderSchema.findOne({ _id: req.params.id });
        let cancelledProducts = orders.products.filter(
          product => product.orderStatus === "Cancelled"
        );
    
        let returnedProducts=orders.products.filter(
          product => product.orderStatus === "Returned"
        );
    
        let shippedProducts=orders.products.filter(
          product => product.orderStatus === "Shipped"
        );
        let deliveredProducts=orders.products.filter(
          product => product.orderStatus === "Delivered"
        );
        let isWholeCancelled = cancelledProducts.length === orders.products.length;
        let isWholeReturned= returnedProducts.length===orders.products.length;
        let isWholeShipped= shippedProducts.length===orders.products.length;
        let isWholeDelivered=deliveredProducts.length===orders.products.length;
        if (isWholeCancelled) {
          orders.orderStatus = "Cancelled";
        }
        if (isWholeReturned) {
          orders.orderStatus = "Returned";
        }
        if (isWholeShipped) {
          orders.orderStatus = "Shipped";
        }
    
        if(isWholeDelivered){
          orders.orderStatus = "Delivered";
        }
        
        await orders.save()
    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'orderSingle'), {
        order,
      });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function changeStatus(req, res, next) {
  try {
    console.log(req.body.orderId)
    let order = await orderSchema.findOne({ _id:new ObjectId(req.body.orderId) });
console.log(order)
    order.products.find((product)=>product.productId==req.body.productId&&product.varietyMeasurement==req.body.varietyMeasurement).orderStatus=req.body.selectedStatus
    if (req.body.selectedStatus == 'Delivered') {
      order.products.find((product)=>product.productId==req.body.productId&&product.varietyMeasurement==req.body.varietyMeasurement).shippingDate=Date.now()
    }
    order.markModified("products")
    await order.save();
    res.status(200).json({
      message: 'Status Changed SuccessFully',
    });
  } catch (err) {
    console.log(err)
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function returnProduct(req, res, next) {
  try {
    console.log(req.body)
    const order = await orderSchema.findOne({ _id: req.body.orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Find the wallet, create one if it doesn’t exist
    let wallet = await Wallet.findOne({ userId: order.userId });

    if (!wallet) {
      wallet = new Wallet({
        userId: order.userId,
        balance: 0,
        transactions: [],
      });
    }

    // Update wallet balance and add transaction
    wallet.balance += order.subTotal;
    wallet.transactions.push({
      amount: order.subTotal,
      type: 'Razorpay',
      status: 'completed',
      transactionDetail: 'Order Returned. Payment returned to wallet',
      createdAt: Date.now(),
      transactionId: uuidv4(),
      transactionType: 'Credit',
      isOrderRedirect: true,
      orderId: order._id,
    });

    await wallet.save();

  

    order.products.find((product)=>(product.productId==req.body.productId&&product.varietyMeasurement==req.body.varietyMeasurement)).orderStatus="Returned"
    order.markModified("products")
    await order.save();
    res.status(200).json({
      message: 'Product Returned Successfully',
    });
    console.log(req.body);
  } catch (err) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function fetchReturnProduct(req,res){
const order=await orderSchema.findOne({_id:req.query.orderId})
let product =order.products.find((product)=>(product.productId==req.query.productId&&product.varietyMeasurement==req.query.varietyMeasurement))
let response={}
response.returnDetails=product.returnDetails
response.productId=product.productId
response.varietyMeasurement=product.varietyMeasurement
res.status(200).json({response})
}
module.exports = {
  renderOrderPage,
  renderOrderDetailPage,
  changeStatus,
  returnProduct,
  fetchReturnProduct
};
