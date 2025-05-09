const express = require("express");
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/add", protect, restrictTo('admin'), addProduct); // Chỉ admin
router.get("/list", getProducts); // Công khai
router.get("/:id", getProductById); // Công khai
router.put("/:id", protect, restrictTo('admin'), updateProduct); // Chỉ admin
router.delete("/:id", protect, restrictTo('admin'), deleteProduct); // Chỉ admin

module.exports = router;