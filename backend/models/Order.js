// models/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    products: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Product", 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true,
                min: 1 
            },
            price: { 
                type: Number, 
                required: true,
                min: 0 
            },
            size: { 
                type: String,
                enum: ['250', '500', '1000'],
                required: true 
            },
            color: { 
                type: String,
                default: "Không xác định" 
            }
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true,
        min: 0 
    },
    status: { 
        type: String, 
        default: "Pending", 
        enum: ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"] 
    },
    transactionId: { 
        type: String 
    },
    address: {
        fullName: { type: String, required: true },
        phone: { 
            type: String, 
            required: true,
            match: [/^0\d{9}$/, "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng 0"]
        },
        address: { type: String, required: true } // Chuỗi đầy đủ của province, district, ward, detail
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);