const path = require('path');
const Order = require('../../model/orderSchema');
const User = require('../../model/userSchema');
const AppError = require('../../middleware/errorHandling');
async function salesReport(req, res, next) {
  try {
    const totalRevenue = await Order.aggregate([
      {
        $match: { orderStatus: 'Delivered' }, // Filter orders with status "delivered"
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$subTotal' }, // Sum only "delivered" orders' subTotal
        },
      },
    ]);

    const totalOrderRevenue =
      totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;
    let totalDiscount = await Order.aggregate([
      { $match: { orderStatus: 'Delivered' } },
      {
        $group: {
          _id: null,
          totalDiscount: { $sum: { $ifNull: ['$overallDiscountAmount', 0] } },
        },
      },
    ]);

    totalDiscount =
      totalDiscount.length > 0 ? totalDiscount[0].totalDiscount : 0;

    let startDate = null;
    let endDate = null;
    let timePeriod = null;

    // Check if both startDate and endDate are provided
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    }

    if (req.query.timePeriod) {
      timePeriod = req.query.timePeriod.toLowerCase();

      const now = new Date();

      switch (timePeriod) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          endDate = new Date();
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          endDate = new Date();
          break;
        default:
          console.warn(
            'Invalid time period. Using provided startDate and endDate.'
          );
      }
    }

    const orders = await Order.find({
      shippingDate: {
        $ne: null,
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    console.log(orders);
    for (const order of orders) {
      const user = await User.findOne({ _id: order.userId }).lean();
      order.userName = `${user?.firstName || ''} ${
        user?.secondName || ''
      }`.trim();

      order.shippingDate = new Date(order.shippingDate).toLocaleDateString(
        'en-GB'
      ); // DD/MM/YYYY format
    }
    const isFetchRequest =
      req.headers['accept']?.includes('application/json') ||
      req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isFetchRequest) {
      res.status(200).json({ orders, totalOrderRevenue, totalDiscount });
    } else {
      res
        .status(200)
        .render(path.join('../', 'views', 'admin pages', 'salesReport'), {
          totalOrderRevenue,
          totalDiscount,
          orders,
        });
    }
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  salesReport,
};
