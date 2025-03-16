const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../../model/userSchema");
const fs = require("fs"); 
const Cart = require("../../model/cartSchema");
const Product = require("../../model/productModel");
const cartSchema = require("../../model/cartSchema");
const Wishlist = require("../../model/wishlistSchema");
const orderSchema=require("../../model/orderSchema");
const Wallet=require("../../model/walletSchema")
;


async function renderOrderPage (req,res){
  try{
   
   let page = parseInt(req.query.page) || 1;  
   let limit = 5; 
   let skip = (page - 1) * limit;
   let searchQuery = req.query.search || ""
   let statusQuery = req.query.status || ""


    // Create a regex pattern (case-insensitive) to match name or email
    let regexPattern = new RegExp(searchQuery, "i"); 

    // Create the filter object dynamically
    let filter = {};
    
    if (searchQuery) {
        filter["orderId"] = regexPattern;  // Use regex for flexible searching
    }
    
    if (statusQuery) {
        filter["orderStatus"] = statusQuery;  // Exact match for status
    }
    
        

           const orderDetails = await orderSchema.find(filter).skip(skip).limit(limit);

console.log(orderDetails.length)
      const updatedOrders = await Promise.all(
        orderDetails.map(async (orderDetail) => {
          // Convert to plain object
          let order = orderDetail.toObject();
          const userDetails=await User.findOne({_id:orderDetail.userId})
          const productDetail = await Product.findOne({ _id: order.products[0]?.productId });
      
          // Add custom fields
          order.renderOrderDateAndTime= order.orderDateAndTime.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          order.frontProductImg = productDetail?.productPic?.productImage1;
          order.frontProductName = productDetail?.productName;
          order.totalProduct = order.products?.length-1;
          order.userName=`${userDetails.firstName} ${userDetails.secondName||""}`
      
          return order;
        })
      );
      console.log(updatedOrders)
    // Now it contains the additional fields
      
    updatedOrders.sort((a, b) => new Date(b.orderDateAndTime) - new Date(a.orderDateAndTime));
    const totalProducts = await orderSchema.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

  res
  .status(200)
  .render(
    path.join("../", "views", "admin pages", "orders")
  ,{updatedOrders,
    totalPages,
     page,
     searchQuery});
}catch(err){
  console.log(err)
  }
  
}

async function renderOrderDetailPage(req,res){
  try{
    let order=await orderSchema.findOne({_id:req?.params?.id});
    let userDetail=await User.findOne({_id:order.userId});
    
    order=order.toObject()
    order.userName=`${userDetail.firstName} ${userDetail.secondName || ""}`
    order.userEmail=userDetail.email
    order.renderOrderDateAndTime =order.orderDateAndTime.toLocaleString();

    for(let i=0;i<order.products.length;i++){
      let productDetails=await Product.findOne({_id:order.products[i].productId})
      order.products[i].productPic=productDetails.productPic.productImage1
      order.products[i].variety=productDetails.variety
    }
    
    console.log(order)
    res
  .status(200)
  .render(
    path.join("../", "views", "admin pages", "orderSingle"),{order});
  }catch(err){
console.log(err)
  }
}

async function changeStatus(req,res){
let order=await orderSchema.findOne({_id:req.body.orderId}) 

  order.orderStatus=req.body.selectedStatus
  await order.save()
  res.status(200).json({
    message: "Status Changed SuccessFully",
});



}

async function returnProduct(req,res){
  const order = await orderSchema.findOne({ _id: req.body.orderId });

  if (!order) {
      return res.status(404).json({ error: "Order not found." });
  }
  
  // Find the wallet, create one if it doesn’t exist
  let wallet = await Wallet.findOne({ userId: order.userId });
  
  if (!wallet) {
      wallet = new Wallet({
          userId: order.userId,
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
      transactionDetail: "Order Returned. Payment returned to wallet",
      createdAt: Date.now()
  });
  
  await wallet.save();
  

  
  order.orderStatus="Returned"
  await order.save()
  res.status(200).json({
    message: "Product Returned Successfully",
});
console.log(req.body)
}
module.exports = {
    renderOrderPage,
    renderOrderDetailPage,
    changeStatus,
    returnProduct
    
  };