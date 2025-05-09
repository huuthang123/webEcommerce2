// src/components/RelatedItems.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/RelatedItems.css';

const mapSizeToDatabase = (size) => {
  switch (size) {
    case '0.25': return '250';
    case '0.5': return '500';
    case '1': return '1000';
    default: return size;
  }
};

const mapSizeToDisplay = (size) => {
  switch (size) {
    case '0.25': return '0.25kg';
    case '0.5': return '0.5kg';
    case '1': return '1kg';
    default: return `${size}kg`;
  }
};

const RelatedItems = ({ relatedProducts, currentProductId, addToCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  console.log('Related products in RelatedItems:', relatedProducts);

  const getPriceFromSchema = (product, size) => {
    if (!product || !product.prices) {
      console.error('Dữ liệu prices không tồn tại cho sản phẩm', product?.name);
      return undefined;
    }

    const dbSize = mapSizeToDatabase(size);
    const price = product.prices[dbSize];

    if (price === undefined) {
      console.error('Không tìm thấy giá cho trọng lượng', size, 'của sản phẩm', product.name);
      return undefined;
    }
    return price;
  };

  const handleAddToCart = (product) => {
    const size = '0.25';
    const price = getPriceFromSchema(product, size);
    if (!price) {
      setError('Giá sản phẩm chưa được cập nhật. Vui lòng thử lại sau.');
      return;
    }

    const dbSize = mapSizeToDatabase(size);
    addToCart({
      productId: product._id,
      name: product.name,
      price: price,
      image: product.image,
      size: dbSize,
      quantity: 1,
    });
    setError(null);
  };

  return (
    <div className="related-items">
      <h3>Sản phẩm cùng loại</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="related-list">
        {relatedProducts.length > 0 ? (
          relatedProducts
            .filter((product) => product._id !== currentProductId)
            .map((product) => {
              const size = '0.25';
              const displaySize = mapSizeToDisplay(size);
              const currentPrice = getPriceFromSchema(product, size);

              return (
                <div key={product._id} className="related-item">
                  <div
                    onClick={() => navigate(`/${product.category}/${product._id}`)}
                    className="related-item-content"
                  >
                    <img src={product.image} alt={product.name} className="related-image" />
                    <h4 className="related-name">{product.name}</h4>
                    <p className="related-price">
                      {currentPrice
                        ? `${currentPrice.toLocaleString()} VND / ${displaySize}`
                        : `Giá chưa cập nhật ${displaySize}`}
                    </p>
                  </div>
                  <div className="related-actions">
                    <button
                      className="btn-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!currentPrice}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <p>Không có sản phẩm liên quan.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedItems;