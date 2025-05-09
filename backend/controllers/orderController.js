const Order = require("../models/Order");

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching orders for user:', userId);
    const orders = await Order.find({ userId })
      .populate("userId", "username email")
      .populate("products.productId", "name image");
    if (!orders.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng nào" });
    }
    res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng của user:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    console.log('Fetching all orders');
    const orders = await Order.find()
      .populate("userId", "username email")
      .populate("products.productId", "name image");
    if (!orders.length) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng nào" });
    }
    res.json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tất cả đơn hàng:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, total, transactionId, address } = req.body;
    console.log('Creating order with data:', { userId, items, total, transactionId, address });

    // Kiểm tra từng trường một cách chi tiết
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items:', items);
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ" });
    }
    if (!total || isNaN(total) || total <= 0) {
      console.log('Invalid total:', total);
      return res.status(400).json({ message: "Tổng tiền không hợp lệ" });
    }
    if (!address || typeof address !== 'object' || !address.fullName || !address.phone || !address.address) {
      console.log('Invalid address:', address);
      return res.status(400).json({ message: "Địa chỉ giao hàng không đầy đủ" });
    }

    const products = items.map((item) => {
      if (!item.productId || !item.quantity || !item.price || !item.size) {
        throw new Error(`Dữ liệu sản phẩm không hợp lệ: ${JSON.stringify(item)}`);
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color || "Không xác định",
      };
    });

    const newOrder = new Order({
      userId,
      products,
      totalPrice: total,
      transactionId,
      address,
      status: "Pending",
    });

    await newOrder.save();
    res.status(201).json({ message: "Tạo đơn hàng thành công", order: newOrder });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;
    console.log('Deleting order:', orderId, 'for user:', userId);

    const order = await Order.findOneAndDelete({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại hoặc không thuộc về bạn" });
    }
    res.json({ message: "Đơn hàng đã bị xóa" });
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    console.log('Updating order status:', orderId, 'by user:', req.user._id);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật đơn hàng này" });
    }

    order.status = status;
    await order.save();
    res.json({ message: "Cập nhật trạng thái thành công", order });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Thêm endpoint để lấy đơn hàng theo transactionId
const getOrderByTransaction = async (req, res) => {
  try {
    const transactionId = req.params.transactionNo;
    console.log('Fetching order by transactionId:', transactionId);

    const order = await Order.findOne({ transactionId })
      .populate("userId", "username email")
      .populate("products.productId", "name image");

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng với mã giao dịch này" });
    }

    // Định dạng dữ liệu để phù hợp với frontend
    const formattedOrder = {
      items: order.products.map(product => ({
        productId: product.productId._id,
        name: product.productId.name,
        image: product.productId.image,
        quantity: product.quantity,
        price: product.price,
        size: product.size,
        color: product.color,
      })),
      total: order.totalPrice,
      address: order.address,
      transactionId: order.transactionId,
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng theo transactionId:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { getUserOrders, getOrders, createOrder, deleteOrder, updateOrderStatus, getOrderByTransaction };