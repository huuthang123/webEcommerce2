// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, size, name, price, image } = req.body;
    console.log('Received data:', { userId, productId, quantity, size, name, price, image });

    // Kiểm tra dữ liệu đầu vào
    if (!productId || !quantity || !size || !name || !price || !image) {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
    }

    // Kiểm tra sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra size hợp lệ (dựa trên schema Cart)
    const validSizes = ['250', '500', '1000'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ message: "Kích thước không hợp lệ" });
    }

    // Kiểm tra giá từ product.prices
    const validPrice = product.prices.get(size); // Truy cập trực tiếp giá từ Map
    if (validPrice === undefined) {
      return res.status(400).json({ message: "Kích thước không hợp lệ hoặc giá không tồn tại" });
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ userId });
    const cartItem = {
      productId,
      quantity,
      size, // Lưu size theo định dạng schema: '250', '500', '1000'
      name: name || product.name,
      price: price || validPrice, // Sử dụng giá từ frontend nếu có, nếu không thì lấy từ product
      image: image || product.image,
    };

    if (!cart) {
      cart = new Cart({ userId, items: [cartItem] });
    } else {
      const item = cart.items.find(i => i.productId.toString() === productId && i.size === size);
      if (item) {
        item.quantity += quantity;
      } else {
        cart.items.push(cartItem);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching cart for userId:', userId);
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(200).json({ userId, items: [] }); // Trả về giỏ hàng rỗng thay vì 404

    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi khi lấy giỏ hàng", error: error.message });
  }
};

exports.increaseQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.params;
    console.log('Increasing quantity:', { userId, productId, size });

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const item = cart.items.find(i => i.productId.toString() === productId && i.size === size);
    if (!item) return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });

    item.quantity += 1;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi tăng số lượng:", error);
    res.status(500).json({ message: "Lỗi khi tăng số lượng", error: error.message });
  }
};

exports.decreaseQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.params;
    console.log('Decreasing quantity:', { userId, productId, size });

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const item = cart.items.find(i => i.productId.toString() === productId && i.size === size);
    if (!item) return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.items = cart.items.filter(i => !(i.productId.toString() === productId && i.size === size));
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi giảm số lượng:", error);
    res.status(500).json({ message: "Lỗi khi giảm số lượng", error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.params;
    console.log('Removing from cart:', { userId, productId, size });

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    const itemExists = cart.items.some(i => i.productId.toString() === productId && i.size === size);
    if (!itemExists) return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });

    cart.items = cart.items.filter(i => !(i.productId.toString() === productId && i.size === size));
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
  }
};

exports.removeItemsFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;
    console.log('Removing items from cart:', { userId, items });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Vui lòng cung cấp danh sách sản phẩm hợp lệ" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

    cart.items = cart.items.filter(cartItem => {
      return !items.some(item => 
        item.productId === cartItem.productId.toString() && item.size === cartItem.size
      );
    });

    await cart.save();
    res.status(200).json({ message: "Đã xóa các sản phẩm đã thanh toán khỏi giỏ hàng", cart });
  } catch (error) {
    console.error("Lỗi khi xóa các sản phẩm đã thanh toán:", error);
    res.status(500).json({ message: "Lỗi khi xóa các sản phẩm đã thanh toán", error: error.message });
  }
};

module.exports = {
  addToCart: exports.addToCart,
  getCart: exports.getCart,
  increaseQuantity: exports.increaseQuantity,
  decreaseQuantity: exports.decreaseQuantity,
  removeFromCart: exports.removeFromCart,
  removeItemsFromCart: exports.removeItemsFromCart,
};