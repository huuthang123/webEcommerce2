// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState({});
  const [review, setReview] = useState({});
  const [productCategories, setProductCategories] = useState({}); // Lưu trữ category của từng sản phẩm

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Dữ liệu đơn hàng từ API:', response.data);
        const uniqueOrders = Array.from(
          new Map(response.data.map(order => [order._id, order])).values()
        );

        // Lấy category cho từng sản phẩm
        const categoryPromises = uniqueOrders.flatMap(order =>
          order.products.map(async (item) => {
            try {
              const productResponse = await axios.get(`http://localhost:5000/api/products/${item.productId._id}`);
              return { productId: item.productId._id, category: productResponse.data.category };
            } catch (error) {
              console.error(`Lỗi khi lấy category cho sản phẩm ${item.productId._id}:`, error);
              return { productId: item.productId._id, category: 'unknown' }; // Dự phòng nếu lỗi
            }
          })
        );

        const categories = await Promise.all(categoryPromises);
        const categoryMap = categories.reduce((acc, { productId, category }) => {
          acc[productId] = category;
          return acc;
        }, {});
        setProductCategories(categoryMap);

        setOrders(uniqueOrders);
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          logout();
          navigate("/sign-in");
        }
      }
    };
    fetchOrders();
  }, [user, logout, navigate]);

  const handleSubmitReview = async (orderId, productId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        {
          orderId,
          productId,
          rating: rating[productId] || 0,
          comment: review[productId] || '',
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Đánh giá đã gửi:', response.data);
      setRating((prev) => ({ ...prev, [productId]: 0 }));
      setReview((prev) => ({ ...prev, [productId]: '' }));
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        logout();
        navigate("/sign-in");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setOldPassword('');
      setNewPassword('');
      setShowPasswordForm(false);
      setTimeout(() => {
        logout();
        navigate('/sign-in');
        toast.info('Vui lòng đăng nhập lại với mật khẩu mới', {
          position: "top-right",
          autoClose: 3000,
        });
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        logout();
        navigate("/sign-in");
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const maskEmail = (email) => {
    const [name, domain] = email.split('@');
    return `${name.substring(0, 2)}****@${domain}`;
  };

  const getUniqueProducts = (products) => {
    const uniqueProductsMap = new Map();
    products.forEach((item) => {
      const key = item.productId._id;
      if (!uniqueProductsMap.has(key)) {
        uniqueProductsMap.set(key, item);
      }
    });
    return Array.from(uniqueProductsMap.values());
  };

  return (
    <div className="profile-container">
      <div className="user-info">
        <h2>Thông tin cá nhân</h2>
        <div className="email-section">
          <p>Email: {user?.email ? maskEmail(user.email) : 'Chưa đăng nhập'}</p>
          <button
            className="change-password-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            Đổi mật khẩu
          </button>
        </div>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="password-form">
            <h3>Đổi mật khẩu</h3>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Mật khẩu cũ"
              className="password-input"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              className="password-input"
              required
            />
            <button type="submit" className="update-btn">Cập nhật</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowPasswordForm(false)}
            >
              Hủy
            </button>
          </form>
        )}
      </div>

      <div className="order-history">
        <h2>Lịch sử đơn hàng</h2>
        {orders.length > 0 ? (
          <table className="order-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} onClick={() => setSelectedOrder(order)} className="order-row">
                  <td>{order._id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{order.status}</td>
                  <td>{order.totalPrice.toLocaleString('vi-VN')} VND</td>
                  <td>
                    <button className="view-details-btn">Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Chưa có đơn hàng nào</p>
        )}
      </div>

      {selectedOrder && (
        <div className="order-details">
          <h3>Chi tiết đơn hàng {selectedOrder._id}</h3>
          <div className="order-info">
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Địa chỉ:</strong> {selectedOrder.address.fullName}, {selectedOrder.address.address}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.address.phone}</p>
          </div>
          <div className="products-list">
            <h4>Sản phẩm trong đơn hàng</h4>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Kích thước</th>
                  <th>Màu sắc</th>
                  {selectedOrder.status === 'Confirmed' && <th>Đánh giá</th>}
                </tr>
              </thead>
              <tbody>
                {getUniqueProducts(selectedOrder.products).map((item) => (
                  <tr key={item.productId._id} className="product-row">
                    <td>
                      <Link
                        to={`/${productCategories[item.productId._id] || 'unknown'}/${item.productId._id}`}
                        className="product-link"
                      >
                        <img src={item.productId.image} alt={item.productId.name} className="product-image" />
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/${productCategories[item.productId._id] || 'unknown'}/${item.productId._id}`}
                        className="product-link"
                      >
                        {item.productId.name}
                      </Link>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString('vi-VN')} VND</td>
                    <td>{item.size || 'N/A'}</td>
                    <td>{item.color || 'N/A'}</td>
                    {selectedOrder.status === 'Confirmed' && (
                      <td>
                        <div className="review-section">
                          <div className="rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                onClick={() => setRating((prev) => ({ ...prev, [item.productId._id]: star }))}
                                className={star <= (rating[item.productId._id] || 0) ? 'star-filled' : 'star-empty'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <textarea
                            value={review[item.productId._id] || ''}
                            onChange={(e) => setReview((prev) => ({ ...prev, [item.productId._id]: e.target.value }))}
                            placeholder="Viết nhận xét của bạn..."
                            className="review-textarea"
                          />
                          <button
                            onClick={() => handleSubmitReview(selectedOrder._id, item.productId._id)}
                            className="submit-review-btn"
                          >
                            Gửi
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;