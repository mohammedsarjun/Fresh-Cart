const express = require('express');
const path = require('path');
const User = require('../../model/userSchema');
const Category = require('../../model/category');
const bcrypt = require('bcrypt');
const AppError = require('../../middleware/errorHandling');
async function renderCustomerDetails(req, res, next) {
  try {
    let page = parseInt(req.query.page) || 1; // Default to page 1
    let limit = 10; // Number of users per page
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || ''; // Get search query from URL

    // Create a regex pattern (case-insensitive) to match name or email
    let regexPattern = new RegExp(searchQuery, 'i');

    // Use regex in the query
    let filter = searchQuery
      ? { $or: [{ name: regexPattern }, { email: regexPattern }] }
      : {};

    // Fetch users based on search and pagination
    const users = await User.find(filter).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    console.log(users);
    res.render(path.join('../', 'views', 'admin pages', 'customers'), {
      users,
      page,
      totalPages,
      searchQuery,
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function customerBlock(req, res, next) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Find the user and update the block status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isBlocked = true; // Set block status
    await user.save(); // Save changes

    return res.json({ message: 'User has been successfully blocked.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function unBlockCustomer(req, res, next) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Find the user and update the block status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isBlocked = false; // Set block status to false
    await user.save(); // Save changes

    return res.json({ message: 'User has been successfully unblocked.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateUserDetails(req, res, next) {
  try {
    const { userId, firstName, secondName, email, phone } = req.body;

    if (!userId || !firstName || !secondName || !email) {
      return res
        .status(400)
        .json({ error: 'ID, Name, and Email are required.' });
    }

    // Check if another user already has the same email or phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: userId }, // Exclude the current user
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'Email or phone number already exists.' });
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName,
        secondName: secondName,
        email: email,
        phone: phone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User updated successfully!', user: updatedUser });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
    console.log(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { userId } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function createUser(req, res, next) {
  try {
    console.log(req.body);
    let { firstName, secondName, email, phone, password } = req.body;
    password = await bcrypt.hash(password, 10);
    // Check if email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'Email or phone number already exists!' });
    }

    // Save the new customer
    const newUser = new User({ firstName, secondName, email, phone, password });
    await newUser.save();

    res.json({ message: 'Customer added successfully!' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

module.exports = {
  renderCustomerDetails,
  customerBlock,
  unBlockCustomer,
  updateUserDetails,
  deleteUser,
  createUser,
};
