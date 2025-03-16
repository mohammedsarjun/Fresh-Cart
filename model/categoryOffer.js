const mongoose = require("mongoose");

const categoryOfferSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Assuming you have a Category model
        required: true
    },
    categoryName:{
        type:String,
        required: true
    }
    ,
    offerPercentage: {
        type: Number,
        required: true,
        min: [1, "Offer percentage must be at least 1%"],
        max: [100, "Offer percentage cannot exceed 100%"]
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return this.startDate < value; // Ensure end date is after start date
            },
            message: "End date must be after start date."
        }
    },
    isListed: {
        type: Boolean,
        required: true,
        default:true
    },
    currentStatus:{
        type: String,
        enum: ["active", "expired", "upcoming"],
        required: true,
        default:"active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CategoryOffer = mongoose.model("CategoryOffer", categoryOfferSchema);

module.exports = CategoryOffer;
