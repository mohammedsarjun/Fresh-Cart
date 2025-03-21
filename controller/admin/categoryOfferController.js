const path = require('path');
const Category = require('../../model/category');
const categoryOffer = require('../../model/categoryOffer');
const AppError = require('../../middleware/errorHandling');
async function renderCategoryOffersPage(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || '';

    let regexPattern = new RegExp(searchQuery, 'i');

    // Use regex in the query
    let filter = { categoryName: regexPattern };
    const category = await Category.find();
    let offer = await categoryOffer.find(filter).skip(skip).limit(limit); // Use .lean() instead of .toObject()

    for (let offers of offer) {
      if (new Date() < new Date(offers.startDate)) {
        offers.currentStatus = 'upcoming'; // Set to "upcoming" if current date is before start date
      } else if (new Date() > new Date(offers.endDate)) {
        offers.currentStatus = 'expired'; // Set to "expired" if current date is after expiry date
      } else {
        offers.currentStatus = 'active'; // Otherwise, it's active
      }
      await offers.save();
    }
    offer = offer.map((offers) => offers.toObject());
    for (let i = 0; i < offer.length; i++) {
      const categoryData = await Category.findOne({ _id: offer[i].category });
      if (categoryData) {
        offer[i].categoryName = categoryData.categoryName;
      }
      // Format start date
      let startDateObj = new Date(offer[i].startDate);
      let formattedStartDate = `${String(startDateObj.getDate()).padStart(
        2,
        '0'
      )}-${String(startDateObj.getMonth() + 1).padStart(
        2,
        '0'
      )}-${startDateObj.getFullYear()}`;
      offer[i].startDate = formattedStartDate;

      // Format end date
      let endDateObj = new Date(offer[i].endDate);
      let formattedEndDate = `${String(endDateObj.getDate()).padStart(
        2,
        '0'
      )}-${String(endDateObj.getMonth() + 1).padStart(
        2,
        '0'
      )}-${endDateObj.getFullYear()}`;
      offer[i].endDate = formattedEndDate;
    }

    const totalCoupon = await categoryOffer.countDocuments();
    const totalPages = Math.ceil(totalCoupon / limit);

    res
      .status(200)
      .render(path.join('../', 'views', 'admin pages', 'categoryOffer'), {
        category,
        offer,
        totalPages,
        page,
        searchQuery,
      });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addCategoryOffer(req, res, next) {
  const { category, offerPercentage, startDate, endDate, status } = req.body;

  try {
    console.log(startDate, endDate);
    let categoryName = await Category.findOne({ _id: category });

    // Check if a category offer already exists for the given category
    const existingOffer = await categoryOffer.findOne({ category });

    if (existingOffer) {
      return res.status(400).json({ error: 'Category offer already exists' });
    }

    // Create new offer if not already present
    const offer = new categoryOffer({
      category,
      categoryName: categoryName.categoryName,
      offerPercentage,
      startDate,
      endDate,
      status,
    });

    await offer.save();
    return res
      .status(201)
      .json({ message: 'Category offer added successfully' });
  } catch (err) {
    console.error(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function editCategoryOffer(req, res, next) {
  try {
    console.log(req.body);

    const offer = await categoryOffer.findOne({ category: req.body.category });
    if (!offer) {
      return res.status(404).json({ error: 'Category offer not found' });
    }

    offer.offerPercentage = req.body.offerPercentage;
    offer.startDate = req.body.startDate;
    offer.endDate = req.body.endDate;
    offer.isListed = req.body.isListed === 'list'; // Convert string to boolean

    await offer.save();

    return res
      .status(200)
      .json({ message: 'Category offer updated successfully' });
  } catch (err) {
    console.error(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function deleteCategoryOffer(req, res, next) {
  try {
    const offer = await categoryOffer.findOneAndDelete({
      category: req.params.id,
    });

    if (!offer) {
      return res
        .status(404)
        .json({ message: 'Error: Category offer not found' });
    }

    return res
      .status(200)
      .json({ message: 'Success: Category offer deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  renderCategoryOffersPage,
  addCategoryOffer,
  editCategoryOffer,
  deleteCategoryOffer,
};
