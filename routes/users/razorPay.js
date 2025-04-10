const express = require('express');
const passport = require('passport');
const router = express.Router();
const razorpayController = require('../../controller/users/razorpayController');

router.post('/create-order', razorpayController.createOrder);

// Payment Verification Webhook
router.post('/verify-payment', razorpayController.verifyPayment);
router.post('/retryVerifyPayment', razorpayController.retryVerifyPayment)
module.exports = router;
