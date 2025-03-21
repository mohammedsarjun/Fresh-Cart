const express = require('express');
const path = require('path');
const User = require('../../model/userSchema');
const Category = require('../../model/category');
const bcrypt = require('bcrypt');
const fs = require('fs');
const AppError = require('../../middleware/errorHandling');
//-----------------------------------categories-------------------------------//

// addCategories
async function addCategories(req, res, next) {
  try {
    const existCategory = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${req.body.categoryName}$`, 'i') },
    });

    if (existCategory) {
      res.status(409).json({
        error: 'Category already Exist',
      });
    } else {
      const { categoryName, categoryDescription, categoryImage } = req.body;
      const imageUrl = `/uploads/categories/${req.file.filename}`; // Store correct path

      // Save category to MongoDB
      const category = new Category({
        categoryName: categoryName,
        categoryDescription: categoryDescription,
        imageUrl: imageUrl,
      });
      await category.save();

      res.status(201).json({
        message: 'Category added successfully',
      });
    }
  } catch (error) {
    console.error('Error adding category:', error);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

//render files

async function renderCategoryDetails(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1; // Default to page 1
    let limit = 5; // Number of categories per page
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || ''; // Get search query from URL
    // Create a regex pattern (case-insensitive) to match category name
    let regexPattern = new RegExp(searchQuery, 'i');

    // Apply search filter (match category name)
    let filter = searchQuery ? { categoryName: regexPattern } : {};

    // Fetch categories with pagination and search
    const categories = await Category.find(filter).skip(skip).limit(limit);
    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    res.render('admin pages/categories', {
      categories,
      page,
      totalPages,
      searchQuery,
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function categoryUnpublish(req, res) {
  try {
    const id = req.body.categoryId;
    const category = await Category.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res
      .status(200)
      .json({ message: 'Category unpublished successfully', category });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function categoryPublish(req, res) {
  try {
    const id = req.body.categoryId;
    const category = await Category.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res
      .status(200)
      .json({ message: 'Category published successfully', category });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateCategory(req, res) {
  try {
    const { categoryId, categoryName, categoryDescription } = req.body;
    const newImageUrl = req.file
      ? `/uploads/categories/${req.file.filename}`
      : null;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.status(409).json({ error: 'Category name already exists' });
    }

    if (newImageUrl && category.imageUrl) {
      const oldImagePath = path.join(__dirname, '../../', category.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    category.imageUrl = newImageUrl || category.imageUrl;
    category.categoryName = categoryName;
    category.categoryDescription = categoryDescription;
    await category.save();

    res
      .status(200)
      .json({ message: 'Category updated successfully', category });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function categoryDelete(req, res) {
  try {
    const { categoryId } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const ImagePath = path.join(__dirname, '../../', category.imageUrl);
    if (fs.existsSync(ImagePath)) {
      fs.unlinkSync(ImagePath);
    }

    // Delete the user
    await Category.findByIdAndDelete(categoryId);

    res.json({ message: 'category deleted successfully!' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  addCategories,
  renderCategoryDetails,
  categoryUnpublish,
  categoryPublish,
  updateCategory,
  categoryDelete,
};
