const express = require('express');
const path = require('path');
const User = require('../../model/userSchema');
const Category = require('../../model/category');
const bcrypt = require('bcrypt');
const AppError = require('../../middleware/errorHandling');
const Order = require('../../model/orderSchema');
const Product = require('../../model/productModel');
async function renderDashboardPage(req, res, next) {
  try {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999); // Ensure `today` remains a Date object
    
    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)); // Proper way to get UTC start of the month
    startOfMonth.setUTCHours(0, 0, 0, 0);
   
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startOfMonth, $lte: today },
          orderStatus: 'Delivered',
        },
      },
      {
        $project: { montlyRevenue: '$subTotal' },
      },
      {
        $group: { _id: null, monthlyRevenue: { $sum: '$montlyRevenue' } },
      },
    ]);

    let ordersToShip = await Order.aggregate([
      {
        $match: {
          orderStatus: 'Pending',
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Summing the number of orders, assuming each order is 1
        },
      },
    ]);

    ordersToShip = ordersToShip[0]?.count;
    console.log(ordersToShip);

    let ordersDelivered = await Order.aggregate([
      {
        $match: {
          orderStatus: 'Delivered',
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Summing the number of orders, assuming each order is 1
        },
      },
    ]);

    ordersDelivered = ordersDelivered[0]?.count;

    let totalUsers = await User.aggregate([
      {
        $match: { isVerified: true, isBlocked: false },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    totalUsers = totalUsers[0].count;

    // Render Sales Graph
    today.setHours(23, 59, 59, 999); // End of today

    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - 6);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setUTCHours(23, 59, 59, 999);
    // Fetch sales data from MongoDB
    const salesData = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startOfWeek, $lte: endOfWeek },
          orderStatus: 'Delivered',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$shippingDate' },
          },
          totalRevenue: { $sum: '$subTotal' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    // Prepare result with all days of the week
    const result = {
      data: [],
      category: [],
    };

    let currentDate = new Date(startOfWeek);
    while (currentDate <= endOfWeek) {
      const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      result.data.push(
        salesData.find((day) => day._id === formattedDate)?.totalRevenue || 0
      );

      result.category.push(currentDate.toLocaleDateString('en-GB')); // Format as DD/MM/YYYY

      currentDate.setDate(currentDate.getDate() + 1);
    }

    //Order Filter result

    let orderData = await Order.aggregate([
      {
        $match: {
          orderDateAndTime: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);
    
    // Define all possible order statuses
    const allStatuses = ["Delivered", "Returned", "Cancelled", "Pending"];
    
    // Convert aggregation result to an object for easy lookup
    let orderCounts = Object.fromEntries(orderData.map(item => [item._id, item.count]));
    
    // Ensure all statuses are included, defaulting to 0 if missing
    let finalData = {
      series: allStatuses.map(status => orderCounts[status] || 0),
      labels: allStatuses
    };
    
    

    let orderResult=finalData
    console.log(monthlyRevenue)
    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'adminDashboard'), {
        monthlyRevenue,
        ordersToShip,
        totalUsers,
        ordersDelivered,
        result,
        orderResult,
      });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
async function changeFilter(req, res, next) {
  if (req.query.changeFilter === 'month') {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endDate.setUTCHours(23, 59, 59, 999);
    const salesData = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startDate, $lte: endDate },
          orderStatus: 'Delivered',
        },
      },
      {
        $project: {
          week: { $ceil: { $divide: [{ $dayOfMonth: '$shippingDate' }, 7] } },
          totalSold: '$subTotal',
        },
      },
      {
        $group: { _id: '$week', totalRevenue: { $sum: '$totalSold' } },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = {
      data: [0, 0, 0, 0],
      category: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    };

    salesData.forEach((week) => {
      result.data[week._id - 1] = week.totalRevenue;
    });

    console.log(result);
    return res.status(200).json({ result });
  }

  if (req.query.changeFilter === 'week') {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - 6);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setUTCHours(23, 59, 59, 999);
    // Fetch sales data from MongoDB
    const salesData = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startOfWeek, $lte: endOfWeek },
          orderStatus: 'Delivered',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$shippingDate' },
          },
          totalRevenue: { $sum: '$subTotal' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(salesData);
    // Prepare result with all days of the week
    const result = {
      data: [],
      category: [],
    };

    let currentDate = new Date(startOfWeek);
    while (currentDate <= endOfWeek) {
      const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      result.data.push(
        salesData.find((day) => day._id === formattedDate)?.totalRevenue || 0
      );

      result.category.push(currentDate.toLocaleDateString('en-GB')); // Format as DD/MM/YYYY

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(result);
    return res.status(200).json({ result });
  }

  if (req.query.changeFilter === 'year') {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st
    const endOfYear = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of the current month

    const salesData = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startOfYear, $lte: endOfYear },
          orderStatus: 'Delivered',
        },
      },
      {
        $project: {
          month: { $month: '$shippingDate' }, // Extract month number (1-12)
          totalSold: '$subTotal',
        },
      },
      {
        $group: { _id: '$month', totalRevenue: { $sum: '$totalSold' } },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const result = {
      data: Array(today.getMonth() + 1).fill(0), // Initialize all months with 0
      category: months.slice(0, today.getMonth() + 1), // Show only up to the current month
    };

    salesData.forEach((month) => {
      result.data[month._id - 1] = month.totalRevenue; // Assign revenue to the correct month
    });

    console.log(result);
    return res.status(200).json({ result });
  }

  if (req.query.changeFilter === 'timePeriod') {
    let { startDate, endDate } = req.query;

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          shippingDate: { $gte: startDate, $lte: endDate },
          orderStatus: 'Delivered',
        },
      },
      {
        $project: {
          date: {
            $dateToString: { format: '%d/%m/%Y', date: '$shippingDate' },
          }, // Format as DD/MM/YYYY
          totalSold: '$subTotal',
        },
      },
      {
        $group: { _id: '$date', totalRevenue: { $sum: '$totalSold' } },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = {
      data: [],
      category: [],
    };

    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const formattedDate = currentDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
      result.data.push(
        salesData.find((day) => day._id === formattedDate)?.totalRevenue || 0
      );
      result.category.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(result);
    return res.status(200).json({ result });
  }
}

async function top10productsrender(req, res, next) {
  try {
    let topProducts = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $unwind: '$products' }, // Break array into individual documents
      {
        $group: {
          _id: '$products.productId', // Group by productId
          totalSales: { $sum: '$products.quantity' }, // Sum up quantity
        },
      },
      { $sort: { totalSales: -1 } }, // Sort by highest sales
      { $limit: 10 }, // Get top 10 products
      {
        $lookup: {
          // Join with Product collection
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' }, // Convert array to object
      {
        $project: {
          // Select fields to return
          _id: 0,
          productId: '$_id',
          varietyMeasurement: '',
          totalSales: 1,
        },
      },
    ]);
    console.log(topProducts);
    for (let i = 0; i < topProducts.length; i++) {
      let productDetail = await Product.findOne({
        _id: topProducts[i].productId,
      });

      topProducts[i].productName = productDetail.productName;
      topProducts[i].productDescription = productDetail.productDescription;
      topProducts[i].productPic = productDetail.productPic.productImage1;
    }

    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'top10products'), {
        topProducts,
      });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function top10categoryrender(req, res, next) {
  try {
    const topCategories = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.categoryId',
          totalSales: { $sum: '$products.quantity' },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalSales: 1,
        },
      },
    ]);

    console.log(topCategories);

    for (let i = 0; i < topCategories.length; i++) {
      let categoryDetail = await Category.findOne({
        _id: topCategories[i].category,
      });
      topCategories[i].categoryName = categoryDetail.categoryName;
      topCategories[i].categoryPic = categoryDetail.imageUrl;
    }

    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'top10categories'), {
        topCategories,
      });
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function changeOrderFilter(req, res, next) {
  try {
    if (req.query.timePeriod == 'week') {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      const startOfWeek = new Date();
      startOfWeek.setDate(today.getDate() - 6);
      startOfWeek.setUTCHours(0, 0, 0, 0);

      const endOfWeek = new Date();
      endOfWeek.setUTCHours(23, 59, 59, 999);
      // Fetch sales data from MongoDB
      let orderData = await Order.aggregate([
        {
          $match: {
            orderDateAndTime: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]);
      
      // Define all possible order statuses
      const allStatuses = ["Delivered", "Returned", "Cancelled", "Pending"];
      
      // Convert aggregation result to an object for easy lookup
      let orderCounts = Object.fromEntries(orderData.map(item => [item._id, item.count]));
      
      // Ensure all statuses are included, defaulting to 0 if missing
      let finalData = {
        series: allStatuses.map(status => orderCounts[status] || 0),
        labels: allStatuses
      };
      
      
  
      let orderResult=finalData

  
      console.log(orderResult);
      return res.status(200).json({ orderResult });
    }

    if (req.query.timePeriod == 'month') {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setUTCHours(23, 59, 59, 999);

      // Fetch sales data from MongoDB
      let orderData = await Order.aggregate([
        {
          $match: {
            orderDateAndTime: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]);
      
      // Define all possible order statuses
      const allStatuses = ["Delivered", "Returned", "Cancelled", "Pending"];
      
      // Convert aggregation result to an object for easy lookup
      let orderCounts = Object.fromEntries(orderData.map(item => [item._id, item.count]));
      
      // Ensure all statuses are included, defaulting to 0 if missing
      let finalData = {
        series: allStatuses.map(status => orderCounts[status] || 0),
        labels: allStatuses
      };
      
      
  
      let orderResult=finalData
 
      console.log(orderResult);
      return res.status(200).json({ orderResult });
    }

    if (req.query.timePeriod == 'year') {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st
      const endOfYear = new Date(today.getFullYear(), today.getMonth() + 1, 0); // End of the current month

      // Fetch sales data from MongoDB
      let orderData = await Order.aggregate([
        {
          $match: {
            orderDateAndTime: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]);
      
      // Define all possible order statuses
      const allStatuses = ["Delivered", "Returned", "Cancelled", "Pending"];
      
      // Convert aggregation result to an object for easy lookup
      let orderCounts = Object.fromEntries(orderData.map(item => [item._id, item.count]));
      
      // Ensure all statuses are included, defaulting to 0 if missing
      let finalData = {
        series: allStatuses.map(status => orderCounts[status] || 0),
        labels: allStatuses
      };
      
     
  
      let orderResult=finalData
      return res.status(200).json({ orderResult });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  renderDashboardPage,
  changeFilter,
  top10productsrender,
  top10categoryrender,
  changeOrderFilter,
};
