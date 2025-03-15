const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const orderController=require("./orderController")
const walletController=require("./walletController")
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  

  async function createOrder(req,res){
    console.log(req.body.selectedAddress)
    req.session.selectedAddress=req.body.selectedAddress
    req.session.selectedPayment=req.body.selectedPayment

    if(req.body.isWallet){
      req.session.isWallet=req.body.isWallet
    }
    const options = {
        amount: req.body.amount * 100, // Amount in paise
        currency: "INR",
        receipt: "order_rcptid_11",
      };
    
      try {
        const order = await razorpay.orders.create(options);
        res.json(order);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }

  async function verifyPayment(req,res){
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

     
      

    if (generated_signature === razorpay_signature) {
      let isOnlinePayment=true

      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      if (!paymentDetails || paymentDetails.status !== "captured") {
        return res.status(400).json({ success: false, message: "Payment not captured" });
      }
      req.body.transactionDetails = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        paymentStatus: "Success", // You can change this based on Razorpay's response
        amountPaid: paymentDetails.amount / 100, // Convert from paisa to INR
        currency: paymentDetails.currency,
      };
    
      if(req.session.isWallet==true){
        walletController.addMoney(req,res)
      }else{
        orderController.placeOrder(req,res,isOnlinePayment)
      }
      
      // res.json({ success: true, message: "Payment Verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid Payment" });
    }
  }

  module.exports={createOrder,verifyPayment}