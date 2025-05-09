import React, { useEffect } from 'react';
import '../styles/cartsidebar.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CartSidebar() {
  const {
    cartItems,
    removeFromCart,
    isOpen,
    toggleCart,
    increaseQuantity,
    decreaseQuantity,
    fetchCartFromServer,
    loadCartFromLocalStorage,
  } = useCart();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hàm ánh xạ size từ cơ sở dữ liệu sang định dạng hiển thị
  const mapSizeToDisplay = (size) => {
    switch (size) {
      case '250': return '0.25kg';
      case '500': return '0.5kg';
      case '1000': return '1kg';
      default: return `${size}kg`;
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      if (user?.token) {
        try {
          await fetchCartFromServer();
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
            navigate("/sign-in");
          } else {
            console.error("Lỗi khi lấy giỏ hàng từ server:", error);
            loadCartFromLocalStorage();
          }
        }
      } else {
        loadCartFromLocalStorage();
      }
    };

    initializeCart();
  }, [user, fetchCartFromServer, loadCartFromLocalStorage, logout, navigate]);

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleViewProduct = (productId, category) => {
    const productPath = category ? `/${category}/${productId}` : `/product/${productId}`;
    navigate(productPath);
  };

  // Số lượng mặt hàng (số sản phẩm khác nhau) = độ dài của mảng cartItems
  const numberOfItems = cartItems.length;

  return (
    <>
      <div className="cart-toggle-btn" onClick={toggleCart}>
        <i className="fas fa-shopping-cart"></i>
        <span className="cart-count-badge">{numberOfItems}</span>
      </div>

      <div id="cart-sidebar" className={isOpen ? 'open' : 'closed'}>
        <div className="cart-header">
          <h2>Giỏ hàng 🛒</h2>
          <button className="close-btn" onClick={toggleCart}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="cart-actions">
          <p id="cart-count">Số lượng mặt hàng: {numberOfItems}</p>
        </div>
        <ul id="cart-items">
          {cartItems.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="cart-item">
              <div
                className="cart-item-details"
                onClick={() => handleViewProduct(item.productId, item.category)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <span>
                    {typeof item.name === 'string' && typeof item.size === 'string'
                      ? `${item.name} (${mapSizeToDisplay(item.size)})`
                      : "Tên sản phẩm không hợp lệ"}
                  </span>
                  <span>
                    {typeof item.price === 'number'
                      ? `${item.price.toLocaleString()} VND`
                      : "Chưa có giá"}
                  </span>
                  <div className="quantity-controls">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        decreaseQuantity(item.productId, item.size);
                      }}
                    >
                      -
                    </button>
                    <span>{typeof item.quantity === 'number' ? item.quantity : 1}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        increaseQuantity(item.productId, item.size);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.productId, item.size)}>Xóa</button>
            </li>
          ))}
        </ul>
        <div className="cart-footer">
          <button id="view-cart-btn" onClick={handleViewCart}>
            Xem giỏ hàng
          </button>
        </div>
      </div>
    </>
  );
}

export default CartSidebar;