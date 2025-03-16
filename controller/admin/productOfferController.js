const path=require('path')
const Product=require("../../model/productModel")
const productOffer=require("../../model/productOffers")
async function renderProductOffersPage(req,res){
    try{
        const product = await Product.find();

  

    let page = parseInt(req.query.page) || 1;  
    let limit = 5; 
    let skip = (page - 1) * limit;
    let searchQuery = req.query.search || "";
    
    let regexPattern = new RegExp(searchQuery, "i"); 

    // Use regex in the query
    let filter = {productName:regexPattern}

    let offer = await productOffer.find(filter).skip(skip).limit(limit);  // Keep it plural for clarity

    for (let offers of offer) {
        if (new Date() < new Date(offers.startDate)) {
            offers.currentStatus = "upcoming"; // Set to "upcoming" if current date is before start date
      } else if (new Date() > new Date(offers.endDate)) {
        offers.currentStatus = "expired"; // Set to "expired" if current date is after expiry date
      } else {
        offers.currentStatus = "active"; // Otherwise, it's active
      }
      await offers.save()
    }
// Convert each offer to an object and format the start and end dates
offer = await Promise.all(offer.map(async (offer) => {
    let offerObj = offer.toObject(); // Convert Mongoose doc to plain object
    const product = await Product.findOne({_id: offer.selectProduct});
    
    // Format start date
    let startDateObj = new Date(offerObj.startDate);
    let formattedStartDate = `${String(startDateObj.getDate()).padStart(2, '0')}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${startDateObj.getFullYear()}`;
    offerObj.startDate = formattedStartDate;

    // Format end date
    let endDateObj = new Date(offerObj.endDate);
    let formattedEndDate = `${String(endDateObj.getDate()).padStart(2, '0')}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${endDateObj.getFullYear()}`;
    offerObj.endDate = formattedEndDate;

    // Replace product ID with product name (if found)
    if (product) {
        offerObj.productId=offerObj.selectProduct
        offerObj.selectProduct = product.productName;
    }

    return offerObj;
})); 

const totalCoupon = await productOffer.countDocuments();
        const totalPages = Math.ceil(totalCoupon / limit);

        res.status(200).render(path.join("../", "views", "admin pages", "productOffers"), { product, offer,totalPages ,page,searchQuery });
        
    }catch(err){
        console.log(err)
    }
}

async function fetchVarietyDetail(req,res){
    try{
        const product= await Product.findOne({_id:req.params.id})
        const productVariety=product.varietyDetails.filter((varietyDetail)=>varietyDetail.varietyMeasurement!='')
        let productVarietyArr=[]
        for(let i=0;i<productVariety.length;i++){
            productVarietyArr.push(productVariety[i].varietyMeasurement)
        }
        
     res.status(200).json({
        productVariety:product.variety,
        productMeasurement:productVarietyArr==""?null:productVarietyArr
     })
        
    }catch(err){
        console.log(err)
    }
}

async function addProductOffer(req, res) {
    try {
        const product = await Product.findOne({ _id: req.body.selectedProduct });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const existingOffer = await productOffer.findOne({
            selectProduct: req.body.selectedProduct,
            selectVariety: product.variety,
            selectedVarietyMeasurement: req.body.selectedVariety || null,
        });

        if (existingOffer) {
            return res.status(400).json({ error: "Product Offer already exists" });
        }

        const offer = new productOffer({
            selectProduct: req.body.selectedProduct,
            productName:product.productName,
            selectVariety: product.variety,
            selectedVarietyMeasurement: req.body.selectedVariety || null,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            offerPercentage: req.body.offerPercentage,
        });

        await offer.save();
        res.status(201).json({ message: "Product Offer was Added" });

    } catch (error) {
        console.error("Error adding product offer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateProductOffer(req, res) {
    try {
        // Check if productOfferId exists
        let offer=""
        if (!req.body.productOfferId) {
            return res.status(400).json({ message: "Invalid Product Offer ID" });
        }
        if(req.body.variety!="items"){
             offer = await productOffer.findOne({ selectProduct: req.body.productOfferId ,selectedVarietyMeasurement:req.body.varietyMeasurement});
        }else{
            offer = await productOffer.findOne({ selectProduct: req.body.productOfferId})
        }


        if (!offer) {
            return res.status(404).json({ message: "Product Offer not found" });
        }

        console.log(req.body);

        // Validate input values before updating
        let isListed=req.body.status == "list"?true:false 
        offer.offerPercentage = req.body.offerPercentage || offer.offerPercentage;
        offer.startDate = req.body.startDate ? new Date(req.body.startDate) : offer.startDate;
        offer.endDate = req.body.endDate ? new Date(req.body.endDate) : offer.endDate;
        offer.isListed = isListed

        await offer.save();
        res.status(200).json({ message: "Product Offer updated Successfully" });
    } catch (err) {
        console.error("Error updating product offer:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
async function deleteProductOffer(req, res) {
    try {
       let deletedOffer=""
        console.log(req.params.id)
        const product=await Product.findOne({_id:req.params.id})
        if(req.body.productVariety!="items"){
           product.varietyDetails.find((varietyDetail)=>varietyDetail.varietyMeasurement==req.body.varietyMeasurement).varietDiscount=0
           product.markModified("varietyDetails")
          await product.save()
             deletedOffer = await productOffer.findOneAndDelete({ selectProduct: req.params.id ,selectedVarietyMeasurement:req.body.varietyMeasurement});

        }else{
            product.varietyDetails.varietDiscount=0
            product.markModified("varietyDetails")
            await product.save()
           deletedOffer = await productOffer.findOneAndDelete({ selectProduct: req.params.id });
        }
        

        if (!deletedOffer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        res.status(200).json({ message: "Offer Deleted Successfully" });

    } catch (err) {
        console.error("Error deleting product offer:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports={renderProductOffersPage,fetchVarietyDetail,addProductOffer,updateProductOffer,deleteProductOffer,}