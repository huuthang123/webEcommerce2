// models/auth.js
const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String }, // Lưu refresh token nếu dùng
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // Hết hạn sau 7 ngày
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;