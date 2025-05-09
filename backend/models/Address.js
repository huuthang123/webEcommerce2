// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    fullName: {
        type: String,
        required: [true, "Họ và tên là bắt buộc"],
        validate: {
            validator: function (value) {
                return !/\d/.test(value);
            },
            message: "Họ và tên không được chứa số"
        }
    },
    phone: {
        type: String,
        required: [true, "Số điện thoại là bắt buộc"],
        validate: {
            validator: function (value) {
                return /^0\d{9}$/.test(value);
            },
            message: "Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số"
        }
    },
    province: { type: String, required: [true, "Tỉnh/Thành phố là bắt buộc"] },
    district: { type: String, required: [true, "Quận/Huyện là bắt buộc"] },
    ward: { type: String, required: [true, "Phường/Xã là bắt buộc"] },
    detail: { type: String, required: [true, "Địa chỉ chi tiết là bắt buộc"] }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);
module.exports = Address;