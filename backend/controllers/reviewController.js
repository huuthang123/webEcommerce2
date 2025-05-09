const Review = require('../models/Review');
const Product = require('../models/Product');

const reviewController = {
  createReview: async (req, res) => {
    try {
      const userId = req.user._id; // Lấy từ token
      const { orderId, productId, rating, comment } = req.body;

      const existingReview = await Review.findOne({ userId, orderId, productId });
      if (existingReview) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
      }

      const review = new Review({
        userId,
        orderId,
        productId,
        rating,
        comment
      });

      await review.save();

      const reviews = await Review.find({ productId });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { rating: avgRating });

      res.status(201).json({ message: 'Đánh giá đã được lưu', review });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  getReviewsByProduct: async (req, res) => {
    try {
      const { productId } = req.params; // Không cần orderId nếu chỉ lấy theo product
      const reviews = await Review.find({ productId })
        .populate('userId', 'username email') // Chỉ lấy username và email
        .select('rating comment createdAt'); // Lọc dữ liệu trả về
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};

module.exports = reviewController;