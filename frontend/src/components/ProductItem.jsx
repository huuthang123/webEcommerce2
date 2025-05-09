// src/components/ProductItem.jsx
import React, { useState } from 'react';
import "../styles/ProductItem.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductItem = ({ product, addToCart, selectedAddress }) => {
  const [selectedWeight, setSelectedWeight] = useState('0.25'); // Định dạng giao diện
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Log dữ liệu product để debug
  console.log('Product data in ProductItem:', product);

  // Kiểm tra xem product có tồn tại không
  if (!product) {
    return <div>Không có dữ liệu sản phẩm.</div>;
  }

  // Hàm ánh xạ weight từ giao diện sang key trong prices
  const mapWeightToPriceKey = (weight) => {
    switch (weight) {
      case '0.25': return '250';
      case '0.5': return '500';
      case '1': return '1000';
      default: return weight;
    }
  };

  // Hàm ánh xạ weight để hiển thị
  const mapWeightToDisplay = (weight) => {
    switch (weight) {
      case '0.25': return '0.25kg';
      case '0.5': return '0.5kg';
      case '1': return '1kg';
      default: return `${weight}kg`;
    }
  };

  const getPriceFromSchema = (weight) => {
    if (!product.prices) {
      console.error("Dữ liệu prices không tồn tại cho sản phẩm", product.name);
      return undefined;
    }

    const priceKey = mapWeightToPriceKey(weight);
    const price = product.prices[priceKey]; // Truy cập trực tiếp từ prices (Map hoặc Object)

    console.log(`Giá cho trọng lượng ${weight} (key: ${priceKey}):`, price);

    if (price === undefined) {
      console.error("Không tìm thấy giá cho trọng lượng", weight, "của sản phẩm", product.name);
      return undefined;
    }
    return price;
  };

  const handleAddToCart = () => {
    const price = getPriceFromSchema(selectedWeight);
    if (price === undefined) {
      setError("Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.");
      return;
    }

    const dbSize = mapWeightToPriceKey(selectedWeight); // Ánh xạ size sang định dạng cơ sở dữ liệu

    console.log('Adding to cart - Price:', price);

    addToCart({
      productId: product._id,
      name: product.name,
      price: price,
      image: product.image,
      size: dbSize, // Gửi size đã ánh xạ: '250', '500', hoặc '1000'
      quantity,
    });
    setError(null);
  };

  const handleBuyNow = () => {
    if (!user?.token) {
      navigate('/sign-in');
      return;
    }

    const price = getPriceFromSchema(selectedWeight);
    if (price === undefined) {
      setError("Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.");
      return;
    }

    const dbSize = mapWeightToPriceKey(selectedWeight); // Ánh xạ size sang định dạng cơ sở dữ liệu
    const totalAmount = price * quantity;

    const item = {
      productId: product._id,
      name: product.name,
      price: price,
      image: product.image,
      size: dbSize, // Gửi size đã ánh xạ
      quantity,
      selected: true,
    };

    navigate('/payment', {
      state: {
        selectedItems: [item],
        total: totalAmount,
        selectedAddress: selectedAddress,
      },
    });
    setError(null);
  };

  const currentPrice = getPriceFromSchema(selectedWeight);
  const originalPrice = currentPrice ? currentPrice / (1 - 0.17) : null;
  const discountPercentage = currentPrice ? 17 : null;

  return (
    <div className="product-item">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <h2 className="product-name">{product.name}</h2>
        <p className="product-description">{product.description || "Không có mô tả"}</p>
        <div className="product-meta">
          <span className="product-rating">⭐ {product.rating || 0} ({product.sold || 0} lượt bán)</span>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="product-price">
          {originalPrice && (
            <span className="original-price">{Math.round(originalPrice).toLocaleString()} VND</span>
          )}
          <span className="current-price">
            {currentPrice
              ? `${currentPrice.toLocaleString()} VND`
              : "Giá chưa cập nhật"}
            / {mapWeightToDisplay(selectedWeight)}
          </span>
          {discountPercentage && (
            <span className="discount">-{discountPercentage}%</span>
          )}
        </div>
        <div className="product-options">
          <label>Chọn trọng lượng: </label>
          <div className="weight-options">
            {["0.25", "0.5", "1"].map((weight) => (
              <button
                key={weight}
                className={`weight-option ${selectedWeight === weight ? 'selected' : ''}`}
                onClick={() => setSelectedWeight(weight)}
                disabled={getPriceFromSchema(weight) === undefined}
              >
                {mapWeightToDisplay(weight)}
              </button>
            ))}
          </div>
        </div>
        <div className="product-quantity">
          <label>Số lượng: </label>
          <div className="quantity-controls">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <input type="text" value={quantity} readOnly />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>
        <div className="product-actions">
          <button onClick={handleAddToCart} className="btn-add" disabled={currentPrice === undefined}>
            Thêm vào giỏ hàng
          </button>
          <button onClick={handleBuyNow} className="btn-buy" disabled={currentPrice === undefined}>
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;