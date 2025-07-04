const express = require('express');
const router = express.Router();
const userController = require('../../controller/admin/userController');
const categoryController = require('../../controller/admin/categoryController');
const productController = require('../../controller/admin/productController');
const dashboardController = require('../../controller/admin/dashboardController');
const orderController = require('../../controller/admin/orderController');
const couponController = require('../../controller/admin/couponController');
const adminAuthMiddleware = require('../../middleware/adminAuth');
const { uploadCategory, uploadProduct } = require('../../services/multer');
const productOfferController = require('../../controller/admin/productOfferController');
const categoryOfferController = require('../../controller/admin/categoryOfferController');
const salesReportController = require('../../controller/admin/salesReportController');

//Dasboard
router.get('/', adminAuthMiddleware, dashboardController.renderDashboardPage);

//top 10 products

router.get(
  '/dashboard/top10products',
  adminAuthMiddleware,
  dashboardController.top10productsrender
);
router.get(
  '/dashboard/top10category',
  adminAuthMiddleware,
  dashboardController.top10categoryrender
);

//filter sales report

router.get(
  '/dashboard/changeFilter',
  adminAuthMiddleware,
  dashboardController.changeFilter
);

//filter order report

router.get(
  '/dashboard/changeOrderFilter',
  adminAuthMiddleware,
  dashboardController.changeOrderFilter
);
//customers

//GET
router.get(
  '/customers',
  adminAuthMiddleware,
  userController.renderCustomerDetails
);

//POST
router.post('/customers/block', userController.customerBlock);
router.post('/customers/unblock', userController.unBlockCustomer);
router.post('/customers/createUser', userController.createUser);

//PUT
router.put('/customers/edit', userController.updateUserDetails);

//Delete
router.delete('/customers/delete', userController.deleteUser);

//categories
//render category
router.get(
  '/categories',
  adminAuthMiddleware,
  uploadCategory.single('categoryImage'),
  categoryController.renderCategoryDetails
);

//POST
router.post(
  '/categories/addCategories',
  uploadCategory.single('categoryImage'),
  categoryController.addCategories
);
router.post('/categories/unPublish', categoryController.categoryUnpublish);
router.post('/categories/publish', categoryController.categoryPublish);
router.post(
  '/categories/updatecategory',
  uploadCategory.single('categoryImage'),
  categoryController.updateCategory
);

//delete
router.delete('/categories/delete', categoryController.categoryDelete);

//products
//render products
router.get(
  '/products',
  adminAuthMiddleware,
  productController.renderProductDetails
);
router.get(
  '/products/productDetail',
  adminAuthMiddleware,
  productController.renderSingleProductDetails
);

//post
router.post(
  '/products/addProducts',
  uploadProduct.fields([
    { name: 'productImageOne', maxCount: 1 },
    { name: 'productImageTwo', maxCount: 1 },
    { name: 'productImageThree', maxCount: 1 },
  ]),
  productController.addProduct
);
router.post('/products/unListProduct', productController.unListProduct);
router.post('/products/listProduct', productController.listProduct);

//put
router.put(
  '/products/editProduct',
  uploadProduct.fields([
    { name: 'editProductImageOne', maxCount: 1 },
    { name: 'editProductImageTwo', maxCount: 1 },
    { name: 'editProductImageThree', maxCount: 1 },
  ]),
  productController.updateProduct
);

//delete
router.put('/products/delete', productController.deleteProduct);

//orders
router.get('/orders', adminAuthMiddleware, orderController.renderOrderPage);

//order Detail

router.get(
  '/orders/orderDetail/:id',
  adminAuthMiddleware,
  orderController.renderOrderDetailPage
);

//put
router.put('/orderDetail/changeStatus', orderController.changeStatus);

//return order
router.put('/orderDetail/returnProduct', orderController.returnProduct);
router.get('/orderDetail/fetchReturnReason',orderController.fetchReturnProduct)
//coupon

router.get('/coupon', adminAuthMiddleware, couponController.renderCouponPage);

//post

router.post('/coupon/addCoupon', couponController.addCoupon);

//PUT

router.put('/coupon/updateCoupon', couponController.updateCoupon);

//delete
router.delete('/coupon/deleteCoupon', couponController.deleteCoupon);

//Product Offers

router.get('/productOffers', adminAuthMiddleware,productOfferController.renderProductOffersPage);

router.get(
  '/productOffers/fetchVarietyDetail/:id',
  productOfferController.fetchVarietyDetail
);

//add product offer

router.post('/productOffers/addOffer', productOfferController.addProductOffer);

//update product offer
router.put(
  '/productOffers/updateOffer',
  productOfferController.updateProductOffer
);

//delete product offer

router.delete(
  '/productOffers/delete/:id',
  productOfferController.deleteProductOffer
);

//Category offer

router.get('/categoryOffers', adminAuthMiddleware,categoryOfferController.renderCategoryOffersPage);

//add category offer

router.post(
  '/categoryOffer/addCategoryOffer',
  categoryOfferController.addCategoryOffer
);

//edit category Offer
router.put(
  '/categoryOffer/updateCategoryOffer',
  categoryOfferController.editCategoryOffer
);

//delete category Offer

router.delete(
  '/categoryOffers/delete/:id',
  categoryOfferController.deleteCategoryOffer
);

//Sales Report

router.get('/salesReport',adminAuthMiddleware, salesReportController.salesReport);
module.exports = router;
