const express=require('express');
const path = require("path");
const User = require("../../model/userSchema");
const Category = require("../../model/category")
const bcrypt=require('bcrypt')

async function renderDashboardPage(req,res){
    try{
    res.status(200).render((path.join("../", "views", "admin pages", "adminDashboard")))
    }catch (error) {
        console.error("An error occurred:", error);
    } 
}


module.exports={renderDashboardPage}