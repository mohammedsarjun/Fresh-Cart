const path = require("path");

const bcrypt = require("bcrypt");

const User=require("../../model/userSchema")
const Address=require("../../model/addressSchema")
const fs=require('fs')
const { ObjectId } = require('mongoose').Types;
const orderSchema=require("../../model/orderSchema");
const cartSchema = require("../../model/cartSchema");
const Product = require("../../model/productModel");
const Wallet=require("../../model/walletSchema")
async function renderOrderPage(req,res){
  try{
    const orderDetails = await orderSchema.find({ userId: req.session.userId });

    const updatedOrders = await Promise.all(
      orderDetails.map(async (orderDetail) => {
        // Convert to plain object
        let order = orderDetail.toObject();
    
        const productDetail = await Product.findOne({ _id: order.products[0]?.productId });
    
        // Add custom fields
        order.renderOrderDateAndTime= order.orderDateAndTime.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        order.frontProductImg = productDetail?.productPic?.productImage1;
        order.frontProductName = productDetail?.productName;
        order.totalProduct = order.products?.length-1;
    
        return order;
      })
    );

  // Now it contains the additional fields
    
  updatedOrders.sort((a, b) => new Date(b.orderDateAndTime) - new Date(a.orderDateAndTime));

    res.status(200).render( path.join("../", "views", "UserPages", "accountSettings", "orders"),{updatedOrders});
  }catch(err){
console.log(err)
  }

}

placeOrder = async function (req, res,isOnlinePayment){
  try{
    const { selectedAddress, selectedPayment, transactionDetails } = req.body;
   
    const cart=await cartSchema.findOne({userId:req.session.userId})
   
    let address=null

    if(isOnlinePayment==true){
       address=await Address.findOne({_id:req.session.selectedAddress})
    }else{
       address=await Address.findOne({_id:req.body.selectedAddress})
    }
    console.log(address)
    let paymentMethod=null
    if(isOnlinePayment==true){
      paymentMethod=req.session.selectedPayment
    }else{
      paymentMethod=req.body.selectedPayment
     
    }
    delete req.session.selectedAddress
    delete req.session.selectedPayment

    
    const products = []
      for(let i=0;i<cart.products.length;i++){
        let product=await Product.findOne({_id:cart.products[i].productId})
        if(product.variety!="items"){
            let selectedVariety =
            product.varietyDetails.find(
              (varietyDetail) =>
                varietyDetail.varietyMeasurement == cart.products[i].selectedVariety.value
            );
    
          let pricePerUnit = Object.entries(product.productPrice).filter(
            ([key, value]) => value !== null
          )[0][1];
    
          let discountAmount =
            (selectedVariety.varietyDiscount / 100) *
            (selectedVariety.varietyMeasurement * pricePerUnit);
    
          productPrice =
            selectedVariety.varietyMeasurement * pricePerUnit - discountAmount;
            let productsObj={
                productId: cart.products[i].productId,
                name: product.productName,
                quantity: cart.products[i].quantity,
                price:productPrice,
                varietyMeasurement: cart.products[i].selectedVariety.value||null
            }
            products.push(productsObj)
            const varietyDetail = product.varietyDetails.find(
              (varietyDetail) => varietyDetail.varietyMeasurement == cart.products[i].selectedVariety.value
            );
            
            if (varietyDetail) {
              varietyDetail.varietyStock -= cart.products[i].quantity; // Update the stock
              product.markModified("varietyDetails"); // Tell Mongoose that varietyDetails has changed
              await product.save(); // Save the updated product
            } else {
              console.log("Variety not found");
            }
        }else{
let productPrice = product.varietyDetails[0].varietyPrice; // Original price
let discountAmount = productPrice * (product.varietyDetails[0].varietyDiscount / 100); // Discount amount
let finalPrice = productPrice - discountAmount; // Price after discount
let productsObj={
  productId: cart.products[i].productId,
  name: product.productName,
  quantity: cart.products[i].quantity,
  price:finalPrice,
  varietyMeasurement: cart.products[i].selectedVariety.value||null
}
products.push(productsObj)
const varietyDetail = product.varietyDetails[0];

if (varietyDetail) {
  varietyDetail.itemStock -= cart.products[i].quantity; // Update the stock
  product.markModified("varietyDetails"); // Tell Mongoose that varietyDetails has changed
  await product.save(); // Save the updated product
} else {
  console.log("Variety not found");
}
        }
       
      }

      console.log(paymentMethod)
    const newOrder = new orderSchema({
        userId: req.session.userId,
        orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`, // 6-digit order ID
        paymentDetails: {
          method: paymentMethod,
          transactionId: transactionDetails?.paymentId||null,
          status: "Completed",
        },
        subTotal: cart.grandTotal,
        shippingCost:cart.shippingCost,
        orderStatus: "Pending",
        shippingDate: null,
        products: products,
        coupon: {
          code: null,
          discount: null,
        },
        shippingAddress: {
            firstName:address.firstName,
            lastName:address.lastName,
          addressType:address.addressType,
          addressLine1:address.addressLine1,
          addressLine2:address.addressLine2,
          city:address.city,
          state:address.state,
          country:address.country,
          zipCode:address.zipCode
        },
      });
   await newOrder.save()
   cart.products=[]
   await cart.save()
  const user =await User.findOne({_id:req.session.userId})
  if(cart?.coupon?.name){
    user.usedCoupons.push(cart?.coupon?.name)
    cart.coupon.discount=0
    cart.coupon.name=null
    cart.coupon.isMax=false
    cart.coupon.maxPurchase=0
    await cart.save()
   await user.save()
  }
   res.status(200).json({
    status: 200,
    message: "Thank You For Your Order",
    test:`Your Order is confirmed. Order Id${newOrder.orderId}`
  });
}catch(err){
console.log(err)
}
}

async function renderOrderSinglePage(req,res){
try{
  let orders=await orderSchema.find({_id:req.params.id})
  for(let i=0;i<orders.length;i++){
    orders[i]=orders[i].toObject()
    for(let j=0;j<orders[i].products.length;j++){
      let productDetail=await Product.findOne({_id:orders[i].products[j].productId})
      orders[i].orderDateAndTime = new Date(orders[i].orderDateAndTime).toLocaleString();

      orders[i].products[j].variety=productDetail.variety
    }
   

  }
 
  console.log(orders)
  res.status(200).render( path.join("../", "views", "UserPages","singleOrderPage"),{orders});
}catch(err){
  console.log(err)
  }
}
async function cancelOrder(req,res){
try{
  const order = await orderSchema.findOne({ _id: req.body.orderId });

  if (order && order.paymentDetails.method === "Razorpay") {
      let wallet = await Wallet.findOne({ userId: req.session.userId });
  
      // If wallet doesn't exist, create a new one
      if (!wallet) {
          wallet = new Wallet({
              userId: req.session.userId,
              balance: 0,
              transactions: []
          });
      }
  
      // Update wallet balance and add transaction
      wallet.balance += order.subTotal;
      wallet.transactions.push({
          amount: order.subTotal,
          type: "Razorpay",
          status: "completed",
          transactionDetail: "Order Cancelled. Payment returned to wallet",
          createdAt: Date.now()
      });
  
      await wallet.save();
  }
 
  order.orderStatus="Cancelled"
  order.save()
  for (let i = 0; i < order.products.length; i++) {
    const product = await Product.findOne({ _id: order.products[i].productId });

    if (!product) continue; // Ensure the product exists

    if (order.products[i].varietyMeasurement != null) {
        let selectedVariety = product.varietyDetails.find(
            (varietyDetail) => varietyDetail.varietyMeasurement == order.products[i].varietyMeasurement
        );

        if (selectedVariety) {
            selectedVariety.varietyStock += order.products[i].quantity;
            product.markModified('varietyDetails'); // Ensure Mongoose detects the change
        }
    }
    else{
      product.varietyDetails[0].itemStock=product.varietyDetails[0].itemStock+ order.products[i].quantity
      product.markModified('varietyDetails')
    }
    await product.save();
}

  res.status(200).json({
    status: 200,
    message: "Order Was Cancelled Successfully",
  });

}catch(err){
  console.log(err)
  }

}

async function returnOrder(req,res){
try{
  console.log(req.body)
  const order=await orderSchema.findOne({_id:req.body.orderId})
  order.orderStatus="Returning"
  order.returnDetails.reason=req.body.returnReason
  order.returnDetails.additionalDetails=req.body.additionalDetails
 await order.save()
 res.status(200).json({
  status: 200,
  message: "Returning Request Was Sent to the Admin",
});
}catch(err){
console.log(err)
}
}
module.exports={
    renderOrderPage,
    placeOrder,
    renderOrderSinglePage,
    cancelOrder,
    returnOrder
}