import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/Payment.css";

const mapSizeToDisplay = (size) => {
  switch (size) {
    case "250": return "0.25kg";
    case "500": return "0.5kg";
    case "1000": return "1kg";
    default: return `${size}kg`;
  }
};

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!state || (!state.selectedItems && !state.item) || !state.total || state.total <= 0) {
      setError("Không có sản phẩm nào để thanh toán. Vui lòng quay lại giỏ hàng.");
      setTimeout(() => navigate("/cart"), 3000);
    }
  }, [state, navigate]);

  const items = state?.selectedItems || (state?.item ? [state.item] : []);
  const total = state?.total || 0;
  const selectedAddress = state?.selectedAddress || {};

  const createOrderInfo = (items) =>
    items.map((item) => `${item.name} (${mapSizeToDisplay(item.size)}) - ${item.quantity} x ${item.price.toLocaleString()}đ`).join(", ");

  const handlePayment = async () => {
    if (!items.length || !total) {
      setError("Dữ liệu thanh toán không hợp lệ.");
      return;
    }
    if (!selectedAddress.fullName || !selectedAddress.phone || !selectedAddress.address) {
      setError("Vui lòng chọn hoặc thêm địa chỉ giao hàng trước khi thanh toán.");
      setTimeout(() => navigate("/cart"), 3000);
      return;
    }
    if (!user?.token) {
      setError("Vui lòng đăng nhập để thanh toán.");
      setTimeout(() => navigate("/sign-in"), 3000);
      return;
    }

    const orderInfo = createOrderInfo(items);
    const amount = total;

    const pendingOrder = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color || item.category || "Không xác định",
        name: item.name,
        image: item.image,
      })),
      total: amount,
      address: { ...selectedAddress },
      orderInfo,
    };

    // Kiểm tra dữ liệu trước khi lưu
    if (!pendingOrder.items.length || !pendingOrder.total || !pendingOrder.address.fullName || !pendingOrder.address.phone || !pendingOrder.address.address) {
      setError("Dữ liệu đơn hàng không đầy đủ. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Dữ liệu lưu vào pendingOrder:", pendingOrder);
      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
      const response = await axios.post(
        "http://localhost:5001/create_payment",
        { amount, orderInfo, items: pendingOrder.items, address: pendingOrder.address },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (response.data.status === "success") {
        window.location.href = response.data.url;
      } else {
        setError(response.data.error || "Không thể tạo URL thanh toán. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo URL thanh toán:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        logout();
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/sign-in"), 3000);
      } else {
        setError(error.response?.data?.error || "Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!items.length || !total) {
    return (
      <div className="payment-container">
        <h2>Thanh toán</h2>
        <p className="error-message">{error || "Đang tải..."}</p>
      </div>
    );
  }

  return (
    <div className="payment-container with-background">
      <h2>Thanh toán</h2>
      <div className="order-summary">
        <h3>Thông tin đơn hàng</h3>
        <div className="order-items">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="order-item">
              <img src={item.image} alt={item.name} className="order-item-image" />
              <div className="order-item-details">
                <p><strong>{item.name}</strong></p>
                <p>Phân loại: {mapSizeToDisplay(item.size)}</p>
                <p>Số lượng: {item.quantity}</p>
                <p>Đơn giá: {item.price.toLocaleString()}đ</p>
                <p>Tổng: {(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            </div>
          ))}
        </div>
        <div className="order-total">
          <p>Tổng thanh toán ({items.length} sản phẩm): <strong>{total.toLocaleString()}đ</strong></p>
        </div>
      </div>
      <div className="shipping-address">
        <h3>Địa chỉ giao hàng</h3>
        {selectedAddress.fullName && selectedAddress.phone && selectedAddress.address ? (
          <div>
            <p><strong>{selectedAddress.fullName}</strong> ({selectedAddress.phone})</p>
            <p>{selectedAddress.address}</p>
          </div>
        ) : (
          <p>Chưa có địa chỉ giao hàng đầy đủ. Vui lòng thêm địa chỉ trong giỏ hàng.</p>
        )}
      </div>
      <div className="payment-actions">
        {error && <p className="error-message">{error}</p>}
        <button
          onClick={handlePayment}
          disabled={loading || !selectedAddress?.fullName || !user?.token}
          className="payment-btn"
        >
          {loading ? "Đang xử lý..." : "Thanh toán với VNPay"}
        </button>
      </div>
    </div>
  );
};

export default Payment;