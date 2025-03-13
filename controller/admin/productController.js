const express=require('express');
const path = require("path");
const Category = require("../../model/category")
const Product=require("../../model/productModel")
const bcrypt=require('bcrypt')
const fs=require('fs')
const { ObjectId } = require('mongoose').Types;
async function renderProductDetails(req, res) {
    try {
        let page = parseInt(req.query.page) || 1;  // Default to page 1
        let limit = 5; // Number of products per page
        let skip = (page - 1) * limit;
        let searchQuery = req.query.search || ""; // Get search query from URL

        // Create a regex pattern (case-insensitive) to match product name
        let regexPattern = new RegExp(searchQuery, "i");

        // Apply search filter (match product name)
        let filter = searchQuery ? { productName: regexPattern } : {};

        // Fetch products with pagination and search
        const products = await Product.find(filter).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch categories
        const categories = await Category.find();

        // Use Promise.all() to attach category names properly
        const updatedProducts = await Promise.all(products.map(async (product) => {
            const category = await Category.findOne({ _id: new ObjectId(product.categoryId) });
            return { ...product.toObject(), categoryName: category ? category.categoryName : "Unknown" };
        }));

        // Render products page with updated details
        res.status(200).render("admin pages/products", { 
            categories, 
            products: updatedProducts, 
            page, 
            totalPages, 
            searchQuery 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}


async function renderSingleProductDetails(req,res){
    try{
    const productId=req.query.productId
   
    const productDetail=await Product.findOne({_id: new ObjectId(productId)})
    const category = await Category.findOne({_id:new ObjectId(productDetail.categoryId)});

    const updatedProducts = { ...productDetail.toObject(), categoryName: category ? category.categoryName : "Unknown" };
 
   const categories=await Category.find()

    res.status(200).render("admin pages/singleProduct",{updatedProducts,categories});
    }catch (error) {
        console.error("An error occurred:", error);
    } 
}

async function addProduct(req, res) {
    try {
        
        const variety = JSON.parse(req.body.variety);

        if (variety[0] != "items") {
            const images = req.files;
            const productImages = {};

            if (images['productImageOne']) {
                productImages.productImage1 = `/uploads/products/${images['productImageOne'][0].filename}`;
            }
            if (images['productImageTwo']) {
                productImages.productImage2 = `/uploads/products/${images['productImageTwo'][0].filename}`;
            }
            if (images['productImageThree']) {
                productImages.productImage3 = `/uploads/products/${images['productImageThree'][0].filename}`;
            }

            // Check for the presence of image files and store their paths
            const product = new Product({
                productName: req.body.productName,
                categoryId: req.body.productCategory,
                varietyDetails: JSON.parse(req.body.varietyDetails),
                productDescription: req.body.productDescription,
                productPic: productImages,
                totalStock: req.body.totalStock
            });

            if (variety[0] == "grams") {
                product.productPrice.perGram = req.body.pricePergrams;
                product.variety = variety[0];
            }
            if (variety[0] == "ml") {
                product.productPrice.perMl = req.body.pricePerml;
                product.variety = variety[0];
            }

            await product.save();
            res.status(200).json({
                message: "Product Added Successfully",
                redirectTo: "/admin/products"
            });

        } else {
            const images = req.files;
            const productImages = {};

            if (images['productImageOne']) {
                productImages.productImage1 = `/uploads/products/${images['productImageOne'][0].filename}`;
            }
            if (images['productImageTwo']) {
                productImages.productImage2 = `/uploads/products/${images['productImageTwo'][0].filename}`;
            }
            if (images['productImageThree']) {
                productImages.productImage3 = `/uploads/products/${images['productImageThree'][0].filename}`;
            }

            const product = new Product({
                productName: req.body.productName,
                categoryId: req.body.productCategory,
                varietyDetails: JSON.parse(req.body.varietyDetails),
                productDescription: req.body.productDescription,
                productPic: productImages,
                totalStock: req.body.totalStock,
                variety: variety[0]
            });

            await product.save();
            res.status(200).json({
                message: "Product Added Successfully",
                redirectTo: "/admin/products"
            });
        }
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: error.message });
    }
}

async function unListProduct(req,res){
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        // Find the user and update the block status
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        product.isListed = false;  // Set block status
        await product.save();  // Save changes

        return res.json({ message: "Product has been successfully Unlisted." });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error." });
    }
}

async function listProduct(req,res){
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        // Find the user and update the block status
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        product.isListed = true;  // Set block status
        await product.save();  // Save changes

        return res.json({ message: "Product has been successfully listed." });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error." });
    }
}
async function deleteProduct(req,res){
   
    try {
        const {productId} = req.body;

        // Check if the user exists
        const product = await Product.findById(productId);
        console.log(product)
        if (!product) {
            return res.status(404).json({ error: "User not found." });
        }

        
        await Product.findByIdAndDelete(productId);

        res.json({ message: "Product deleted successfully!" ,redirectTo:"/admin/products"});
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error." });
    }
}

async function updateProduct(req,res){
 try {
    const {productId} = req.body;

    // Check if the user exists
    const product = await Product.findById(productId);
      console.log(req.body)
        const variety = JSON.parse(req.body.variety);
        const varietyDetails=JSON.parse(req.body.varietyDetails)
        product.categoryId=req.body.productCategory
        if (variety[0] != "items") {
            console.log(req.files)
            const images = req.files;
            const productImages = {};
            const varietyDetails=[{},{},{}]

            if (images['editProductImageOne']) {
                productImages.productImage1 = `/uploads/products/${images['editProductImageOne'][0].filename}`;
            }
            else{
                productImages.productImage1 = product.productPic.productImage1;
            }
            if (images['editProductImageTwo']) {
                productImages.productImage2 = `/uploads/products/${images['editProductImageTwo'][0].filename}`;
            }
            else{
                productImages.productImage2 = product.productPic.productImage2;
            }
            if (images['editProductImageThree']) {
                productImages.productImage3 = `/uploads/products/${images['editProductImageThree'][0].filename}`;
            }
            else{
                productImages.productImage3 = product.productPic.productImage3;
            }
           product.productPic=productImages

           
            // Check for the presence of image files and store their paths
            product.productName=req.body.productName
            if(variety[0]=="grams"){
                product.productPrice.perGram=req.body.perUnitRate
            }
            if(variety[0]=="ml"){
                product.productPrice.perMl=req.body.perUnitRate
            }
            if(variety[0]=="items"){
                product.productPrice.perItem=req.body.perUnitRate
            }
            product.productDescription=req.body.productDescription
           JSON.parse(req.body.varietyDetails).forEach((varietyDetail,i) => {
                varietyDetails[i].varietyMeasurement=varietyDetail.varietyMeasurement
                varietyDetails[i].varietyDiscount=varietyDetail.varietyDiscount
                varietyDetails[i].varietyStock=varietyDetail.varietyStock

            });
            console.log(varietyDetails)
            product.varietyDetails=varietyDetails

            if (variety[0] == "grams") {
                product.productPrice.perGram = req.body.pricePergrams;
                product.productPrice.perMl=null
                product.productPrice.perItem=null
                product.variety = variety[0];
            }
            if (variety[0] == "ml") {
                product.productPrice.perMl = req.body.pricePerml;
                product.productPrice.perGram=null
                product.productPrice.perItem=null
                product.variety = variety[0];
            }

            product.variety=variety[0]

            await product.save();
            res.status(200).json({
                message: "Product Edited Successfully",
                redirectTo: "/admin/products"
            });

        } else {
            const images = req.files;
            const productImages = {};

            if (images['editProductImageOne']) {
                productImages.productImage1 = `/uploads/products/${images['editProductImageOne'][0].filename}`;
            }
            else{
                productImages.productImage1 = product.productPic.productImage1;
            }
            if (images['editProductImageTwo']) {
                productImages.productImage2 = `/uploads/products/${images['editProductImageTwo'][0].filename}`;
            }
            else{
                productImages.productImage2 = product.productPic.productImage2;
            }
            if (images['editProductImageThree']) {
                productImages.productImage3 = `/uploads/products/${images['editProductImageThree'][0].filename}`;
            }
            else{
                productImages.productImage3 = product.productPic.productImage3;
            }
           product.productPic=productImages
           product.productName=req.body.productName
           product.categoryId=req.body.productCategory
           product.productDescription=req.body.productDescription
           product.variety=variety[0]
           product.varietyDetails=JSON.parse(req.body.varietyDetails)[0]
            await product.save();
            res.status(200).json({
                message: "Product Edited Successfully",
                redirectTo: "/admin/products"
            });
        }
    } catch (error) {
        console.error("Error Editing product:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports={renderProductDetails,addProduct,renderSingleProductDetails,unListProduct,listProduct,deleteProduct,updateProduct}