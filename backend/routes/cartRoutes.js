const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart); // Chỉ user đã đăng nhập
router.post('/', protect, cartController.addToCart); // Chỉ user đã đăng nhập
router.delete('/remove/:productId/:size', protect, cartController.removeFromCart); // Chỉ user đã đăng nhập
router.put('/increase/:productId/:size', protect, cartController.increaseQuantity); // Chỉ user đã đăng nhập
router.put('/decrease/:productId/:size', protect, cartController.decreaseQuantity); // Chỉ user đã đăng nhập
router.post('/remove-items', protect, cartController.removeItemsFromCart); // Chỉ user đã đăng nhập

module.exports = router;