const path = require('path');

const bcrypt = require('bcrypt');

const User = require('../../model/userSchema');
const Address = require('../../model/addressSchema');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const orderSchema = require('../../model/orderSchema');
const cartSchema = require('../../model/cartSchema');
const Product = require('../../model/productModel');
const Wallet = require('../../model/walletSchema');
const AppError = require('../../middleware/errorHandling');
const { v4: uuidv4 } = require('uuid');
async function renderOrderPage(req, res, next) {
  try {
    const orderDetails = await orderSchema.find({ userId: req.session.userId });

orderDetails.forEach(async(order)=>{


   
    let cancelledProducts = order.products.filter(
      product => product.orderStatus === "Cancelled"
    );

    let returnedProducts=order.products.filter(
      product => product.orderStatus === "Returned"
    );

    let shippedProducts=order.products.filter(
      product => product.orderStatus === "Shipped"
    );
    let deliveredProducts=order.products.filter(
      product => product.orderStatus === "Delivered"
    );
    let isWholeCancelled = cancelledProducts.length === order.products.length;
    let isWholeReturned= returnedProducts.length===order.products.length;
    let isWholeShipped= shippedProducts.length===order.products.length;
    let isWholeDelivered=deliveredProducts.length===order.products.length;
    if (isWholeCancelled) {
      order.orderStatus = "Cancelled";
    }
    if (isWholeReturned) {
      order.orderStatus = "Returned";
    }
    if (isWholeShipped) {
      order.orderStatus = "Shipped";
    }

    if(isWholeDelivered){
      order.orderStatus = "Delivered";
    }
    
    await order.save()
  })
    const updatedOrders = await Promise.all(
      orderDetails.map(async (orderDetail) => {
        // Convert to plain object
        let order = orderDetail.toObject();

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

        return order;
      })
    );

    // Now it contains the additional fields

    updatedOrders.sort(
      (a, b) => new Date(b.orderDateAndTime) - new Date(a.orderDateAndTime)
    );

    res
      .status(200)
      .render(
        path.join('../', 'views', 'UserPages', 'accountSettings', 'orders'),
        { updatedOrders }
      );
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
placeOrder = async function (req, res, isOnlinePayment, isWalletPayment, next) {
  try {

    const { selectedAddress, selectedPayment, transactionDetails } = req.body;

    const cart = await cartSchema.findOne({ userId: req.session.userId });

    let address = null;

    if (isOnlinePayment == true) {
      address = await Address.findOne({ _id: req.session.selectedAddress });
    } else {
      address = await Address.findOne({ _id: req.body.selectedAddress });
    }
    console.log(address);
    let paymentMethod = null;
    if (isOnlinePayment == true) {
      paymentMethod = req.session.selectedPayment;
    } else {
      paymentMethod = req.body.selectedPayment;
    }
    delete req.session.selectedAddress;
    delete req.session.selectedPayment;

    const products = [];
    let overallDiscountAmount = 0;
    for (let i = 0; i < cart.products.length; i++) {
      let product = await Product.findOne({ _id: cart.products[i].productId });
      if (product.variety != 'items') {
        let selectedVariety = product.varietyDetails.find(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            cart.products[i].selectedVariety.value
        );

        let pricePerUnit = Object.entries(product.productPrice).filter(
          ([key, value]) => value !== null
        )[0][1];

        let discountAmount =
          (selectedVariety.varietyDiscount / 100) *
          (selectedVariety.varietyMeasurement * pricePerUnit);
        overallDiscountAmount = overallDiscountAmount + discountAmount;
        productPrice =
          selectedVariety.varietyMeasurement * pricePerUnit - discountAmount;
        let productsObj = {
          productId: cart.products[i].productId,
          name: product.productName,
          variety: product.variety,
          quantity: cart.products[i].quantity,
          productPrice: selectedVariety.varietyMeasurement * pricePerUnit,
          price: productPrice,
          varietyMeasurement: cart.products[i].selectedVariety.value || null,
        };
        products.push(productsObj);
        const varietyDetail = product.varietyDetails.find(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            cart.products[i].selectedVariety.value
        );

        if (varietyDetail) {
          varietyDetail.varietyStock -= cart.products[i].quantity; // Update the stock
          product.markModified('varietyDetails'); // Tell Mongoose that varietyDetails has changed
          await product.save(); // Save the updated product
        } else {
          console.log('Variety not found');
        }
      } else {
        let productPrice = product.varietyDetails[0].varietyPrice; // Original price
        let discountAmount =
          productPrice * (product.varietyDetails[0].varietyDiscount / 100); // Discount amount
        overallDiscountAmount = overallDiscountAmount + discountAmount;
        let finalPrice = productPrice - discountAmount; // Price after discount
        let productsObj = {
          productId: cart.products[i].productId,
          name: product.productName,
          variety: product.variety,
          quantity: cart.products[i].quantity,
          productPrice,
          price: finalPrice,
          varietyMeasurement: cart.products[i].selectedVariety.value || null,
        };
        products.push(productsObj);
        const varietyDetail = product.varietyDetails[0];

        if (varietyDetail) {
          varietyDetail.itemStock -= cart.products[i].quantity; // Update the stock
          product.markModified('varietyDetails'); // Tell Mongoose that varietyDetails has changed
          await product.save(); // Save the updated product
        } else {
          console.log('Variety not found');
        }
      }
    }

    console.log(paymentMethod);
    const newOrder = new orderSchema({
      userId: req.session.userId,
      orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`, // 6-digit order ID
      paymentDetails: {
        method: paymentMethod,
        transactionId: transactionDetails?.paymentId || null,
        status: 'Completed',
      },
      subTotal: cart.grandTotal,
      overallDiscountAmount,
      shippingCost: cart.shippingCost,
      orderStatus: 'Pending',
      shippingDate: null,
      products: products,
      coupon: {
        code: null,
        discount: null,
      },
      shippingAddress: {
        firstName: address?.firstName,
        lastName: address?.lastName,
        addressType: address?.addressType,
        addressLine1: address?.addressLine1,
        addressLine2: address?.addressLine2,
        city: address?.city,
        state: address?.state,
        country: address?.country,
        zipCode: address?.zipCode,
      },
    });

    cart.products = [];
    await cart.save();
    const user = await User.findOne({ _id: req.session.userId });
    if (cart?.coupon?.name) {
      newOrder.coupon.code = cart.coupon.name;
      newOrder.coupon.discount = cart.coupon.discount;
      newOrder.overallDiscountAmount =
        overallDiscountAmount +
        (cart.coupon.discount * newOrder.subTotal) / 100;
      user.usedCoupons.push(cart?.coupon?.name);
      cart.coupon.discount = 0;
      cart.coupon.name = null;
      cart.coupon.isMax = false;
      cart.coupon.maxPurchase = 0;
      await cart.save();
      await user.save();
    }
    await newOrder.save();
    req.session.orderSuccess = true;
    res.status(200).json({
      redirectTo: `/order/orderSuccess?orderId=${
        newOrder.orderId
      }&orderAddress=${encodeURIComponent(
        newOrder.shippingAddress.addressLine1
      )},${encodeURIComponent(newOrder.shippingAddress.addressLine2 || '')}`,
      message: 'Order Placed Successfully',
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
};

async function renderOrderSinglePage(req, res, next) {
  try {
    let orders = await orderSchema.find({ _id: req.params.id,userId:req.session.userId });
    console.log(orders)
    if(orders==""){
      return res.status(403).send("403 FORBIDDEN")
    }
    for (let i = 0; i < orders.length; i++) {
      orders[i] = orders[i].toObject();
      for (let j = 0; j < orders[i].products.length; j++) {
        let productDetail = await Product.findOne({
          _id: orders[i].products[j].productId,
        });
        orders[i].orderDateAndTime = new Date(
          orders[i].orderDateAndTime
        ).toLocaleString();

        orders[i].products[j].variety = productDetail.variety;
      }
    }
    let order = await orderSchema.findOne({ _id: req.params.id });
    let cancelledProducts = order.products.filter(
      product => product.orderStatus === "Cancelled"
    );

    let returnedProducts=order.products.filter(
      product => product.orderStatus === "Returned"
    );

    let shippedProducts=order.products.filter(
      product => product.orderStatus === "Shipped"
    );
    let deliveredProducts=order.products.filter(
      product => product.orderStatus === "Delivered"
    );
    let isWholeCancelled = cancelledProducts.length === order.products.length;
    let isWholeReturned= returnedProducts.length===order.products.length;
    let isWholeShipped= shippedProducts.length===order.products.length;
    let isWholeDelivered=deliveredProducts.length===order.products.length;
    if (isWholeCancelled) {
      order.orderStatus = "Cancelled";
    }
    if (isWholeReturned) {
      order.orderStatus = "Returned";
    }
    if (isWholeShipped) {
      order.orderStatus = "Shipped";
    }

    if(isWholeDelivered){
      order.orderStatus = "Delivered";
    }
    
    await order.save()
    res
      .status(200)
      .render(path.join('../', 'views', 'UserPages', 'singleOrderPage'), {
        orders,
      });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
async function cancelOrder(req, res, next) {
  try {
    const order = await orderSchema.findOne({ _id: req.body.orderId });

    if (order && (order.paymentDetails.method === 'Wallet'||order.paymentDetails.method === 'Razorpay') ) {
      let wallet = await Wallet.findOne({ userId: req.session.userId });

      // If wallet doesn't exist, create a new one
      if (!wallet) {
        wallet = new Wallet({
          userId: req.session.userId,
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
        transactionId: uuidv4(),
        transactionDetail: 'Order Cancelled. Payment returned to wallet',
        createdAt: Date.now(),
        transactionType: 'Credit',
        isOrderRedirect: true,
        orderId: order._id,
      });

      await wallet.save();
    }

    order.orderStatus = 'Cancelled';
    order.save();
    for (let i = 0; i < order.products.length; i++) {
      const product = await Product.findOne({
        _id: order.products[i].productId,
      });

      if (!product) continue; // Ensure the product exists

      if (order.products[i].varietyMeasurement != null) {
        let selectedVariety = product.varietyDetails.find(
          (varietyDetail) =>
            varietyDetail.varietyMeasurement ==
            order.products[i].varietyMeasurement
        );

        if (selectedVariety) {
          selectedVariety.varietyStock += order.products[i].quantity;
          product.markModified('varietyDetails'); // Ensure Mongoose detects the change
        }
      } else {
        product.varietyDetails[0].itemStock =
          product.varietyDetails[0].itemStock + order.products[i].quantity;
        product.markModified('varietyDetails');
      }
      await product.save();
    }

    res.status(200).json({
      status: 200,
      message: 'Order Was Cancelled Successfully',
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function returnOrder(req, res, next) {
  try {
    console.log(req.body);
    const order = await orderSchema.findOne({ _id: req.body.orderId });

    let product= order.products.find((product)=>(product.productId==req.body.productId&&product.varietyMeasurement==req.body.varietyMeasurement))

    
    product.orderStatus = 'Returning';
    product.returnDetails.reason = req.body.returnReason;
    product.returnDetails.additionalDetails = req.body.additionalDetails;
    order.markModified("products")
    await order.save();
    res.status(200).json({
      status: 200,
      message: 'Returning Request Was Sent to the Admin',
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function renderOrderSuccessPage(req, res, next) {
  try {
    if (req.session.orderSuccess) {
      req.session.orderSuccess = false;
      let orderId = req.query.orderId;
      let orderAddress = req.query.orderAddress;
      console.log(orderAddress);
      res
        .status(200)
        .render(
          path.join(
            '../',
            'views',
            'UserPages',
            'orderSide',
            'orderSuccessPage'
          ),
          { orderId, orderAddress }
        );
    } else {
      res.status(404).redirect('/account/orders');
    }
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function cancelSingleOrder(req,res,next){
  try {
  
  
    let order = await orderSchema.findOne({ _id: req.body.orderId });

    if (order && (order.paymentDetails.method === 'Wallet'||order.paymentDetails.method === 'Razorpay') ) {
      let wallet = await Wallet.findOne({ userId: req.session.userId });

      // If wallet doesn't exist, create a new one
      if (!wallet) {
        wallet = new Wallet({
          userId: req.session.userId,
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
        transactionId: uuidv4(),
        transactionDetail: 'Order Cancelled. Payment returned to wallet',
        createdAt: Date.now(),
        transactionType: 'Credit',
        isOrderRedirect: true,
        orderId: order._id,
      });

      await wallet.save();
    }

  let product=  order.products.find(product =>
      product.productId==req.body.productId &&
      product.varietyMeasurement == req.body.varietyMeasurement
    );
    
    order.subTotal=order.subTotal-(product.price*product.quantity)
    let changeOrderStatus = order.products.find(product =>
      product.productId==req.body.productId &&
      product.varietyMeasurement == req.body.varietyMeasurement
    );

    if (changeOrderStatus) {
      changeOrderStatus.orderStatus = "Cancelled";
      order.markModified("products");

      let singleProductDocument= await Product.findOne({_id:product.productId})
      let singleProductVariety= singleProductDocument.varietyDetails.find((variety)=>variety.varietyMeasurement==product.varietyMeasurement)
     console.log(singleProductVariety)
      singleProductVariety.varietyStock=singleProductVariety.varietyStock+product.quantity
      singleProductDocument.markModified('varietyDetails')
     await singleProductDocument.save()
      console.log(product)
      console.log(singleProductDocument)
      let cancelledProducts = order.products.filter(
        product => product.orderStatus === "Cancelled"
      );
  
      let isWholeCancelled = cancelledProducts.length === order.products.length;
  
      if (isWholeCancelled) {
        order.orderStatus = "Cancelled";
      }
  
      await order.save();
      res.status(200).json({
        status: 200,
        message: 'Order Was Cancelled Successfully',
      });
    } else {
      return res.status(404).json({ message: "Product not found in order" });
    }
  }catch (err) {
    console.log(err)
    next(new AppError('Sorry...Something went wrong', 500));
  }
}


async function failOrderPayment(req,res){
  const { selectedAddress, selectedPayment, transactionDetails } = req.body;

  const cart = await cartSchema.findOne({ userId: req.session.userId });

  let address = null;


    address = await Address.findOne({ _id: req.body.selectedAddress });
  
  console.log(address);
  let paymentMethod = selectedPayment;
 
 

  const products = [];
  let overallDiscountAmount = 0;
  for (let i = 0; i < cart.products.length; i++) {
    let product = await Product.findOne({ _id: cart.products[i].productId });
    if (product.variety != 'items') {
      let selectedVariety = product.varietyDetails.find(
        (varietyDetail) =>
          varietyDetail.varietyMeasurement ==
          cart.products[i].selectedVariety.value
      );

      let pricePerUnit = Object.entries(product.productPrice).filter(
        ([key, value]) => value !== null
      )[0][1];

      let discountAmount =
        (selectedVariety.varietyDiscount / 100) *
        (selectedVariety.varietyMeasurement * pricePerUnit);
      overallDiscountAmount = overallDiscountAmount + discountAmount;
      productPrice =
        selectedVariety.varietyMeasurement * pricePerUnit - discountAmount;
      let productsObj = {
        productId: cart.products[i].productId,
        name: product.productName,
        variety: product.variety,
        quantity: cart.products[i].quantity,
        productPrice: selectedVariety.varietyMeasurement * pricePerUnit,
        price: productPrice,
        varietyMeasurement: cart.products[i].selectedVariety.value || null,
      };
      products.push(productsObj);
      const varietyDetail = product.varietyDetails.find(
        (varietyDetail) =>
          varietyDetail.varietyMeasurement ==
          cart.products[i].selectedVariety.value
      );

      if (varietyDetail) {
        varietyDetail.varietyStock -= cart.products[i].quantity; // Update the stock
        product.markModified('varietyDetails'); // Tell Mongoose that varietyDetails has changed
        await product.save(); // Save the updated product
      } else {
        console.log('Variety not found');
      }
    } else {
      let productPrice = product.varietyDetails[0].varietyPrice; // Original price
      let discountAmount =
        productPrice * (product.varietyDetails[0].varietyDiscount / 100); // Discount amount
      overallDiscountAmount = overallDiscountAmount + discountAmount;
      let finalPrice = productPrice - discountAmount; // Price after discount
      let productsObj = {
        productId: cart.products[i].productId,
        name: product.productName,
        variety: product.variety,
        quantity: cart.products[i].quantity,
        productPrice,
        price: finalPrice,
        varietyMeasurement: cart.products[i].selectedVariety.value || null,
      };
      products.push(productsObj);
      const varietyDetail = product.varietyDetails[0];

      if (varietyDetail) {
        varietyDetail.itemStock -= cart.products[i].quantity; // Update the stock
        product.markModified('varietyDetails'); // Tell Mongoose that varietyDetails has changed
        await product.save(); // Save the updated product
      } else {
        console.log('Variety not found');
      }
    }
  }

  const newOrder = new orderSchema({
    userId: req.session.userId,
    orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`, // 6-digit order ID
    paymentDetails: {
      method: paymentMethod,
      transactionId: transactionDetails?.paymentId || null,
      status: 'Failed',
    },
    subTotal: cart.grandTotal,
    overallDiscountAmount,
    shippingCost: cart.shippingCost,
    orderStatus: 'Pending',
    shippingDate: null,
    products: products,
    coupon: {
      code: null,
      discount: null,
    },
    shippingAddress: {
      firstName: address?.firstName,
      lastName: address?.lastName,
      addressType: address?.addressType,
      addressLine1: address?.addressLine1,
      addressLine2: address?.addressLine2,
      city: address?.city,
      state: address?.state,
      country: address?.country,
      zipCode: address?.zipCode,
    },
  });

  cart.products = [];
  await cart.save();
  const user = await User.findOne({ _id: req.session.userId });
  if (cart?.coupon?.name) {
    newOrder.coupon.code = cart.coupon.name;
    newOrder.coupon.discount = cart.coupon.discount;
    newOrder.overallDiscountAmount =
      overallDiscountAmount +
      (cart.coupon.discount * newOrder.subTotal) / 100;
    user.usedCoupons.push(cart?.coupon?.name);
    cart.coupon.discount = 0;
    cart.coupon.name = null;
    cart.coupon.isMax = false;
    cart.coupon.maxPurchase = 0;
    await cart.save();
    await user.save();
  }
  await newOrder.save();
  console.log(newOrder)

res.status(200).json({message:"Payment Failure"})
}


async function renderPaymentFailurePage(req, res, next) {
  try {
  
      res
        .status(200)
        .render(
          path.join(
            '../',
            'views',
            'UserPages',
            'orderSide',
            'paymentFailurePage'
          )
        );
  
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  renderOrderPage,
  placeOrder,
  renderOrderSinglePage,
  cancelOrder,
  returnOrder,
  renderOrderSuccessPage,
  cancelSingleOrder,
  failOrderPayment,
  renderPaymentFailurePage
};
