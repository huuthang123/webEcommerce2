// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    description: { 
        type: String,
        trim: true 
    },
    image: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true, 
        enum: ["fruit", "seafood", "meat", "nut"] 
    },
    prices: { 
        type: Map,
        of: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value.has('250') && value.has('500') && value.has('1000');
            },
            message: "Phải có giá cho các kích thước 25, 5 và 1"
        }
    },
    stock: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    rating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5 
    },
    sold: { 
        type: Number, 
        default: 0,
        min: 0 
    }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;