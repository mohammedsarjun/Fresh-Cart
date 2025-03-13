const path = require("path");
const express=require('express');
const Category = require("../../model/category")
const Product=require("../../model/productModel")
const bcrypt=require('bcrypt')
const fs=require('fs')
const { ObjectId } = require('mongoose').Types;


async function homePageRender(req,res){
    try{
    let categoryFilter={isPublished:true}
    let categories = await Category.find(categoryFilter);
    let productFilter={isListed:true}
    let products=await Product.find(productFilter).lean()
    res.status(200).render(path.join("../","views","userPages","homePage"),{categories,products})
    }catch (error) {
        console.error("An error occurred:", error);
    } 
    
}



module.exports={
    homePageRender
}