const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Route để tạo review mới cho một sản phẩm
router.post('/', authMiddleware, reviewController.createReview);

// Route để lấy reviews theo orderId và productId
router.get('/order/:orderId/product/:productId', authMiddleware, reviewController.getReviewsByProduct);

module.exports = router;