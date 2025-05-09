const express = require('express');
const { register, login, getMe, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/register", register); // Công khai
router.post("/login", login); // Công khai
router.get("/me", protect, getMe); // Chỉ user đã đăng nhập
router.put("/change-password", protect, changePassword); // Thêm route đổi mật khẩu

module.exports = router;