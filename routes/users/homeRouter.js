const express = require('express');
const passport = require('passport');
const router = express.Router();
const homeController = require('../../controller/users/homeController');
const authMiddleware = require('../../middleware/userAuth');
const shopController = require('../../controller/users/shopController');
const accountController = require('../../controller/users/accountContoller');
const addressController = require('../../controller/users/addressContoller');
const cartWishlistController = require('../../controller/users/cart-whishListController');
const checkoutController = require('../../controller/users/checkoutController');
const orderController = require('../../controller/users/orderController');
const walletController = require('../../controller/users/walletController');

router.get('', homeController.homePageRender);
router.get('/home', homeController.homePageRender);

//shop
router.get('/shop', shopController.shopPageRender);
router.post('/shop/filterProduct/:id', shopController.filterProduct);

router.get('/shop/productDetail/:id', shopController.shopSinglePageRender);
router.get(
  '/shop/productDetail/review/:productId',
  shopController.loadProductReview
);

//post
router.post('/shop/product/checkStock', shopController.checkStockContoller);
router.post('/shop/productDetail/add-review', shopController.addReview);

//account settings
//get
router.get(
  '/account/settings',
  authMiddleware,
  accountController.accountSettingsRender
);
router.get(
  '/account/settings/changePassword',
  authMiddleware,
  accountController.userChangePassword
);

//account wallet

router.get(
  '/account/wallet',
  authMiddleware,
  walletController.walletPageRender
);

//referral rewards
router.get(
  '/account/referralReward',
  authMiddleware,
  accountController.referralRewardPageRender
);

//put
router.put('/account/settings/editUserData', accountController.userUpdate);
router.put('/account/changePassword', accountController.changeUserPassword);

//User Address
//get
router.get(
  '/account/address',
  authMiddleware,
  addressController.userAddressRender
);

//Post
router.post('/account/address/addAddress', addressController.addUserAddress);

//Patch
router.patch(
  '/account/address/updateDefaultAddress',
  addressController.updateDefaultAddress
);

//Put
router.put('/account/address/editAddress', addressController.editUserAddress);

//Delete

router.delete(
  '/account/address/deleteAddress',
  addressController.deleteUserAddress
);

//Cart and wishlist
router.get('/cart', authMiddleware, cartWishlistController.cartPageRender);

//post
router.post('/cart/addCart', cartWishlistController.addCart);

//Put
router.put('/cart/updateCart', cartWishlistController.updateCart);
router.put('/cart/modifyQuantity', cartWishlistController.modifyCart);

//Delete
router.delete('/cart/deleteCart', cartWishlistController.deleteCart);
//Wishlist

router.get(
  '/wishlist',
  authMiddleware,
  cartWishlistController.wishlistPageRender
);

//post
router.post('/wishlist/addWishlist', cartWishlistController.addWishlist);

//delete
router.delete(
  '/wishlist/deleteWishlist',
  cartWishlistController.deleteWishlist
);

//checkout
router.get(
  '/cart/checkout',
  authMiddleware,
  checkoutController.checkoutPageRender
);

//Orders
router.get('/account/orders', authMiddleware, orderController.renderOrderPage);
router.get(
  '/order/orderDetail/:id',
  authMiddleware,
  orderController.renderOrderSinglePage
);
router.get(
  '/order/orderSuccess',
  authMiddleware,
  orderController.renderOrderSuccessPage
);

router.get("/order/orderFailure",authMiddleware,orderController.renderPaymentFailurePage)

//post
router.post('/cart/placeOrder', (req, res) => {
  orderController.placeOrder(req, res, null, null);
});

router.post("/order/failOrderPayment",orderController.failOrderPayment)
//cancel order

//cancelSingleOrder

router.put('/order/cancelSingleOrder', orderController.cancelSingleOrder)
//put
router.put('/order/cancelOrder', orderController.cancelOrder);

//return order
router.put('/order/returnOrder', orderController.returnOrder);

//Verify Coupon

router.post('/cart/verifyCoupon', checkoutController.verifyCoupon);

//remove Coupon
router.delete('/cart/removeCoupon', checkoutController.removeCoupon);

//Pay With Wallet

router.post(
  '/cart/placeOrderWithWallet',
  checkoutController.placeOrderWithWallet
);

module.exports = router;
