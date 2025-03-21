const path = require('path');

const bcrypt = require('bcrypt');

const User = require('../../model/userSchema');
const Address = require('../../model/addressSchema');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;
const otpSchema = require('../../model/otpSchema');
const AppError = require('../../middleware/errorHandling');

async function userAddressRender(req, res) {
  try {
    let userAddress = await Address.find({ userId: req.session.userId });
    userAddress.sort((a, b) => b.isDefault - a.isDefault);

    res
      .status(200)
      .render(
        path.join(
          '../',
          'views',
          'UserPages',
          'accountSettings',
          'userAddress'
        ),
        { userAddress }
      );
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function addUserAddress(req, res, next) {
  try {
    const address = new Address({
      userId: req.session.userId,
      firstName: req.body.addAdressFirstName,
      lastName: req.body.addAddressLastName,
      addressType: req.body.addAddressType,
      addressLine1: req.body.addAddressLine1,
      addressLine2: req.body.addAddressLine2,
      city: req.body.addCity,
      state: req.body.addState,
      country: req.body.addCountry,
      zipCode: req.body.addZipCode,
    });

    const isDefaultAddress = await Address.findOne({
      userId: req.session.userId,
    });
    if (!isDefaultAddress) {
      address.isDefault = true;
    }
    await address.save();

    res.status(201).json({ message: 'Address Added.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function updateDefaultAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.body.addressId });
    const defaultAddress = await Address.findOne({
      userId: req.session.userId,
      isDefault: true,
    });
    if (defaultAddress) {
      defaultAddress.isDefault = false;
      await defaultAddress.save();
    }
    address.isDefault = true;
    await address.save();
    res.status(200).json({
      message: 'Your default address has been updated.',
    });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function editUserAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.body.addressId });

    if (address) {
      address.firstName = req.body.editAdressFirstName;
      address.lastName = req.body.editAddressLastName;
      address.addressLine1 = req.body.editAddressLine1;
      address.addressLine2 = req.body.editAddressLine2;
      address.city = req.body.editCity;
      address.state = req.body.editState;
      address.country = req.body.editCountry;
      address.zipCode = req.body.editZipCode;
      address.save();
      res.status(201).json({ message: 'Address Updated.' });
    }
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}

async function deleteUserAddress(req, res, next) {
  try {
    const address = await Address.findOne({ _id: req.body.addressId });
    if (address.isDefault == true) {
      await Address.deleteOne({ _id: req.body.addressId });
      const newAddress = await Address.findOne({ userId: req.session.userId });
      newAddress.isDefault = true;
      await newAddress.save();
    } else {
      await Address.deleteOne({ _id: req.body.addressId });
    }
    res.status(201).json({ message: 'Address Deleted.' });
  } catch (error) {
    next(new AppError('Sorry...Something went wrong', 500));
  }
}
module.exports = {
  addUserAddress,
  userAddressRender,
  updateDefaultAddress,
  editUserAddress,
  deleteUserAddress,
};
