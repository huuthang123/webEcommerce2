// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // Mỗi user chỉ có một giỏ hàng
    },
    items: [{
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1 
        },
        size: { 
            type: String, 
            required: true, 
            enum: ['250', '500', '1000'] // Giới hạn kích thước hợp lệ
        },
        name: { 
            type: String, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true,
            min: 0 
        },
        image: { 
            type: String, 
            required: true 
        }
    }]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;