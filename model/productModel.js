const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        
        trim: true
    },
    availability: {
        type: String,
        enum: ['in stock', 'out of stock'],
        default:"in stock"
            },
    totalStock:{
        type:Number
    },
    productPrice: {
        perMl: { type: Number, default: null }, 
        perGram: { type: Number, default: null }, 
        perItem: { type: Number, default: null },
    },
    isListed: {
        type: Boolean,
        default: true
    },
    productDescription: {
        type: String,
        trim: true
    },
    productPic: {
        type: Object, // Store image URL or file path
        default: null
    },
    variety:{type:String,
        enum:['grams',"ml","items"]
    }
    ,
    varietyDetails: {type:Array},
    categoryId: {
        type: String,
        trim: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
