const path = require("path");
const express=require('express');
const Category = require("../../model/category")
const Product=require("../../model/productModel")
const bcrypt=require('bcrypt')
const fs=require('fs')
const { ObjectId } = require('mongoose').Types;
const productOffer=require("../../model/productOffers")
const CategoryOffer=require("../../model/categoryOffer")
async function shopPageRender(req, res) {
    try {
        let page = parseInt(req.query.page) || 1;  
        let limit = 5; 
        let skip = (page - 1) * limit;
        let searchQuery = req.query.search ? req.query.search.trim() : ""; 
        let categoryFilter=""
        if(!searchQuery){
           categoryFilter= req.query.category || "67a7a69ccd8dc70afb3447a6"; 
        }
        
        

       
        let filter = { isListed: true };

       
        if (categoryFilter) {
            filter.categoryId = categoryFilter;
        }

     
        if (searchQuery) {
            filter.productName = { $regex: searchQuery, $options: "i" };
        }

        
        let products = await Product.find(filter).skip(skip).limit(limit);
        let modified = false;
        for (let product of products) {
            const offers = await productOffer.find({ selectProduct: product._id }); // "offers" since find() returns an array
            const categoryOffer= await CategoryOffer.findOne({category:product.categoryId})
            if (offers.length > 0) {
                

        
                for (let offer of offers) {
                    let offerPercentage=offer?.offerPercentage!=undefined?offer?.offerPercentage:0
                    if ((offerPercentage < categoryOffer?.offerPercentage || offer.isListed == false) &&
                    categoryOffer?.endDate > Date.now() &&
                    categoryOffer?.startDate < Date.now() &&
                    categoryOffer?.isListed == true){
                        if (offer.selectVariety !== "items") {
                            for (let i = 0; i < product.varietyDetails.length; i++) {
                                if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                                    product.varietyDetails[i].varietyDiscount = categoryOffer.offerPercentage;
                                    modified = true;
                                }
                            }
                        } else {
                            product.varietyDetails.forEach(variety => {
                                variety.varietyDiscount =categoryOffer.offerPercentage;
                            });
                            modified = true;
                        }
                    }else{
     if (offer.endDate > Date.now() && offer.startDate < Date.now() && offer.isListed==true ) {
                        
                        if (offer.selectVariety !== "items") {
                            for (let i = 0; i < product.varietyDetails.length; i++) {
                                if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                                    product.varietyDetails[i].varietyDiscount = offer.offerPercentage;
                                    modified = true;
                                }
                            }
                        } else {
                            product.varietyDetails.forEach(variety => {
                                variety.varietyDiscount = offer.offerPercentage;
                            });
                            modified = true;
                        }
                    }else{
                        if (offer.selectVariety !== "items") {
                            for (let i = 0; i < product.varietyDetails.length; i++) {
                                if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                                    product.varietyDetails[i].varietyDiscount = 0
                                    modified = true;
                                }
                            }
                        } else {
                            product.varietyDetails.forEach(variety => {
                                variety.varietyDiscount = 0
                            });
                            modified = true;
                        }
                    }
                }
        
                
                    }

               
            }else{
                const categoryOffer= await CategoryOffer.findOne({category:product.categoryId})
                if(categoryOffer){
                    product.varietyDetails.forEach((varietyDetail)=>{
                        varietyDetail.varietyDiscount=categoryOffer.offerPercentage
                    })
                    modified = true
                }else{
                    product.varietyDetails.forEach((varietyDetail)=>{
                        varietyDetail.varietyDiscount=0
                    })
                    modified = true
                }
            }

            if (modified) {
                product.markModified("varietyDetails");
                await product.save();
            }
        }
        const category = await Category.find({ isPublished: true });

       
        let categoryFilterName = [];
        if (categoryFilter) {
            categoryFilterName = await Category.findOne(
                { _id: categoryFilter.trim() },
                { categoryName: 1 }
            );
        }

    
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).render(path.join("../", "views", "userPages", "shopPage"), {
            products,
            category,
            currentPage: page,
            totalPages,
            selectedCategory: categoryFilter,
            categoryFilterName,
            searchQuery 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching shop page");
    }
}


async function shopSinglePageRender(req,res){
    try {

        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId });
        const offers = await productOffer.find({ selectProduct: product._id });
        let modified = false; // Track if any modification happens
    if (offers.length > 0) {
    
        const categoryOffer= await CategoryOffer.findOne({category:product.categoryId})
        for (let offer of offers) {
            let offerPercentage=offer?.offerPercentage!=undefined?offer?.offerPercentage:0
            if ((offerPercentage < categoryOffer?.offerPercentage || offer.isListed == false) &&
            categoryOffer?.endDate > Date.now() &&
            categoryOffer?.startDate < Date.now() &&
            categoryOffer?.isListed == true){

                if (offer.selectVariety !== "items") {
                    for (let i = 0; i < product.varietyDetails.length; i++) {
                        if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                            product.varietyDetails[i].varietyDiscount = categoryOffer.offerPercentage;
                            modified = true;
                        }
                    }
                } else {
                    product.varietyDetails.forEach(variety => {
                        variety.varietyDiscount =categoryOffer.offerPercentage;
                    });
                    modified = true;
                }
                
            }else{

                product.varietyDetails.forEach((varietyDetail)=>{
                    varietyDetail.varietyDiscount=0
                })

                if (offer.endDate > Date.now() && offer.startDate < Date.now() && offer.isListed==true ) {
                
                    if (offer.selectVariety !== "items") {
    
                        
                        for (let i = 0; i < product.varietyDetails.length; i++) {
                            if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                                product.varietyDetails[i].varietyDiscount = offer.offerPercentage;
                                modified = true;
                                
                            }
                        }
                    } else {
                        product.varietyDetails.forEach(variety => {
                            variety.varietyDiscount = offer.offerPercentage;
                        });
                        modified = true;
                    }
                }else{
                    if (offer.selectVariety !== "items") {
                        for (let i = 0; i < product.varietyDetails.length; i++) {
                            if (product.varietyDetails[i].varietyMeasurement === offer.selectedVarietyMeasurement) {
                                product.varietyDetails[i].varietyDiscount = 0
                                modified = true;
                            }
                        }
                    } 
                }
            }

            if(product.variety!="items"){
                const categoryOffer= await CategoryOffer.findOne({category:product.categoryId});
                if(categoryOffer&&categoryOffer.endDate > Date.now() && categoryOffer.startDate < Date.now() && categoryOffer.isListed==true){
                    const productVarieties=[]
                    for(let i=0;i<product.varietyDetails.length;i++){
                        productVarieties.push(product.varietyDetails[i].varietyMeasurement)
                    }
                    const offerVarieties=[]
                    for(let i=0;i<offers.length;i++){
                        offerVarieties.push(offers[i].selectedVarietyMeasurement)
                    }
        
                    for(let i=0;i<productVarieties.length;i++){
                        if(!offerVarieties.includes(productVarieties[i])){
                            product.varietyDetails.find((varietyDetail)=>varietyDetail.varietyMeasurement==productVarieties[i]).varietyDiscount=categoryOffer.offerPercentage
                            modified = true
                        }
                    }
                
                }
              
                
            }
        if (modified) {
            product.markModified("varietyDetails");
                    await product.save();
                }
            
          
        }
    }else{
        const categoryOffer= await CategoryOffer.findOne({category:product.categoryId})
        if(categoryOffer){
            product.varietyDetails.forEach((varietyDetail)=>{
                varietyDetail.varietyDiscount=categoryOffer.offerPercentage
            })
            modified = true
        }else{
            product.varietyDetails.forEach((varietyDetail)=>{
                varietyDetail.varietyDiscount=0
            })
            modified = true
        }
      
    }

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const productVariety= product.variety
        let varietyArr=[]
        let varietyPrice=0
        let  varietyDiscount=0
        let varietyTotalPrice=0
        let varietyStock=0
       product.varietyDetails.forEach((product)=>{
        varietyArr.push(product.varietyMeasurement)
       })
    
       if(productVariety=="ml"){
        if(!req.query.ml){
            const perMl = product.productPrice 
            ? Object.values(product.productPrice).filter(productPrice => productPrice != null) 
            : [];
           
            varietyPrice=perMl*product.varietyDetails[0].varietyMeasurement
            varietyDiscount=product.varietyDetails[0].varietyDiscount
            varietyTotalPrice=varietyPrice - (varietyPrice * varietyDiscount / 100)
            varietyStock=product.varietyDetails[0].varietyStock
          
        }
        else{
            console.log("jio")
          const varietyDetailIndex= varietyArr.indexOf(req.query.ml)
            const perMl = product.productPrice 
            ? Object.values(product.productPrice).filter(productPrice => productPrice != null) 
            : [];
        
           varietyPrice=perMl*req.query.ml
           varietyDiscount=product.varietyDetails[varietyDetailIndex].varietyDiscount
           varietyStock=product.varietyDetails[varietyDetailIndex].varietyStock
           varietyTotalPrice=varietyPrice - (varietyPrice * varietyDiscount / 100)
        }
        
       }

       if(productVariety=="grams"){
        
        if(!req.query.grams){
            const perGram = product.productPrice 
            ? Object.values(product.productPrice).filter(productPrice => productPrice != null) 
            : [];
            varietyPrice=perGram*product.varietyDetails[0].varietyMeasurement
            varietyDiscount=product.varietyDetails[0].varietyDiscount
            varietyStock=product.varietyDetails[0].varietyStock
            varietyTotalPrice=varietyPrice - (varietyPrice * varietyDiscount / 100)
        }
     
        else{
          
          const varietyDetailIndex= varietyArr.indexOf(req.query.grams)
            const perGrams = product.productPrice 
            ? Object.values(product.productPrice).filter(productPrice => productPrice != null) 
            : [];
        
           varietyPrice=perGrams*req.query.grams
           varietyDiscount=product.varietyDetails[varietyDetailIndex].varietyDiscount
           varietyStock=product.varietyDetails[varietyDetailIndex].varietyStock
           varietyTotalPrice=varietyPrice - (varietyPrice * varietyDiscount / 100)
        }
        
       }

       
       if(productVariety=="items"){
            varietyPrice=product.varietyDetails[0].varietyPrice
            varietyStock=product.varietyDetails[0].itemStock
            varietyDiscount=product.varietyDetails[0].varietyDiscount
            varietyTotalPrice=varietyPrice - (varietyPrice * varietyDiscount / 100)
       }

       
       
       
       
    
        const categories = await Category.findOne({ _id: new ObjectId(product.categoryId) });
        const updatedProduct = { 
            ...product.toObject(), 
            categoryName: categories ? categories.categoryName : "Unknown" 
        };
        const relatedProducts=await Product.find({categoryId:updatedProduct.categoryId})
        res.status(200).render(path.join("../", "views", "userPages", "shopSingle"), {
            updatedProduct,
            originalUrl: req.originalUrl,
            varietyPrice,
            varietyDiscount,
            varietyTotalPrice,
            varietyStock,
            relatedProducts
        });
    } catch (error) { 
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
    
}

async function checkStockContoller(req, res){
try{
  
    const product =await Product.findOne({_id:req.body.productId})
    
    if(!req.body.isItem){
        const selectedVariety=product.varietyDetails.filter((varietyDetail)=>varietyDetail.varietyMeasurement==req.body.varietyMeasurement)
        if(req.body.quantity>Number(selectedVariety[0].varietyStock)){
            res.status(200).json({ available: false });
        }
        else{
            res.status(200).json({ available: true });
        }
    }
    else{
        const selectedVariety=product.varietyDetails[0]
        if(req.body.quantity>selectedVariety.itemStock){
            res.status(200).json({ available: false });
        }
        else{
            res.status(200).json({ available: true });
        }
    }
   
}catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports={
    shopPageRender,
    shopSinglePageRender,
    checkStockContoller
}