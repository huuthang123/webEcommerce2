const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/my-orders', protect, orderController.getUserOrders); // Chỉ user đã đăng nhập
router.get('/', protect, restrictTo('admin'), orderController.getOrders); // Chỉ admin
router.post('/', protect, orderController.createOrder); // Chỉ user đã đăng nhập
router.delete('/:id', protect, orderController.deleteOrder); // Chỉ user sở hữu
router.put('/:id/status', protect, orderController.updateOrderStatus); // User sở hữu hoặc admin
router.get('/by-transaction/:transactionNo', protect, orderController.getOrderByTransaction); // Chỉ user đã đăng nhập

module.exports = router;