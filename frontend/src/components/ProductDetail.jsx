import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import ProductItem from './ProductItem';
import RelatedItems from './RelatedItems';
import Footer from './Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetail.css';
import CartSidebar from './CartSidebar';
import ShippingAddressForm from './ShippingAddressForm';
import AddressService from '../services/AddressService';

const ProductDetail = () => {
  const { category, id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressTableOpen, setIsAddressTableOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`Không tìm thấy sản phẩm: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Product data from API:', data);
      setProduct(data);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRelatedProducts = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/list`);
      if (!response.ok) {
        throw new Error(`Không tìm thấy sản phẩm liên quan: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Related products from API:', data);
      if (Array.isArray(data)) {
        setRelatedProducts(data.filter((p) => p._id !== id && p.category === category));
      } else {
        console.error('Dữ liệu sản phẩm liên quan không phải mảng:', data);
        setRelatedProducts([]);
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm liên quan:', err);
      setRelatedProducts([]);
    }
  }, [category, id]);

  const fetchAddresses = useCallback(async () => {
    if (!user?.token) {
      setError('Vui lòng đăng nhập để quản lý địa chỉ');
      return;
    }
    if (isFetchingAddresses) return;
    setIsFetchingAddresses(true);
    try {
      console.log('Token gửi đi trong fetchAddresses:', user.token);
      const addresses = await AddressService.getAddresses(user.token);
      setSavedAddresses(addresses);
      // Chỉ chọn địa chỉ mặc định nếu chưa có selectedAddress
      if (addresses.length > 0 && !selectedAddress) {
        setSelectedAddress({
          fullName: addresses[0].fullName,
          address: `${addresses[0].detail}, ${addresses[0].ward}, ${addresses[0].district}, ${addresses[0].province}`,
          phone: addresses[0].phone,
        });
      } else if (selectedAddress) {
        // Kiểm tra xem selectedAddress có còn trong danh sách không
        const currentAddress = addresses.find(
          (addr) =>
            addr.fullName === selectedAddress.fullName &&
            addr.phone === selectedAddress.phone &&
            `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}` === selectedAddress.address
        );
        if (!currentAddress) {
          // Nếu địa chỉ hiện tại không còn trong danh sách, chọn địa chỉ đầu tiên
          setSelectedAddress({
            fullName: addresses[0].fullName,
            address: `${addresses[0].detail}, ${addresses[0].ward}, ${addresses[0].district}, ${addresses[0].province}`,
            phone: addresses[0].phone,
          });
        }
      }
      setError(null);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách địa chỉ:', error.message);
      setError(error.message || 'Không thể tải danh sách địa chỉ');
      setSavedAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsFetchingAddresses(false);
    }
  }, [user, selectedAddress]);

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [fetchProduct, fetchRelatedProducts]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAddressSelect = async (address) => {
    setSelectedAddress({
      fullName: address.fullName,
      address: address.address || `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`,
      phone: address.phone,
    });
    setSuccessMessage('Địa chỉ đã được chọn thành công');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddressAdded = async (newAddress) => {
    setSuccessMessage('Địa chỉ mới đã được thêm thành công');
    setTimeout(() => setSuccessMessage(null), 3000);
    await fetchAddresses();
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress({
      fullName: address.fullName,
      address: `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`,
      phone: address.phone,
    });
    setSuccessMessage('Địa chỉ đã được chọn thành công');
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsAddressTableOpen(false);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!user?.token) return;
    try {
      await AddressService.deleteAddress(addressId, user.token);
      const updatedAddresses = savedAddresses.filter((addr) => addr._id !== addressId);
      setSavedAddresses(updatedAddresses);
      if (selectedAddress && addressId === savedAddresses.find(addr => 
        addr.fullName === selectedAddress.fullName &&
        addr.phone === selectedAddress.phone &&
        `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}` === selectedAddress.address
      )?._id) {
        if (updatedAddresses.length > 0) {
          setSelectedAddress({
            fullName: updatedAddresses[0].fullName,
            address: `${updatedAddresses[0].detail}, ${updatedAddresses[0].ward}, ${updatedAddresses[0].district}, ${updatedAddresses[0].province}`,
            phone: updatedAddresses[0].phone,
          });
        } else {
          setSelectedAddress(null);
        }
      }
      setSuccessMessage('Địa chỉ đã được xóa thành công');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error);
      setError(error.message || 'Không thể xóa địa chỉ');
    }
  };

  const openModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
    setSuccessMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  if (loading) {
    return <div>Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="product-detail">
      <Header />
      <div className="product-content">
        <ProductItem
          product={product}
          addToCart={addToCart}
          selectedAddress={selectedAddress}
        />
        <div className="address-section">
          <h3>Địa chỉ giao hàng</h3>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          {selectedAddress ? (
            <div className="selected-address-section">
              <p><strong>Số điện thoại:</strong> {selectedAddress.phone}</p>
              <p><strong>Địa chỉ:</strong> {selectedAddress.address}</p>
            </div>
          ) : (
            <p>Chưa có địa chỉ giao hàng</p>
          )}
          <button
            onClick={() => setIsAddressTableOpen(!isAddressTableOpen)}
            className="change-address-btn"
          >
            {selectedAddress ? 'Thay đổi địa chỉ' : 'Chọn địa chỉ giao hàng'}
          </button>

          {isAddressTableOpen && (
            <div className="address-table-container">
              <table className="address-table">
                <thead>
                  <tr>
                    <th>Họ và tên</th>
                    <th>Địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {savedAddresses.length > 0 ? (
                    savedAddresses.map((address) => (
                      <tr key={address._id}>
                        <td>{address.fullName}</td>
                        <td>{`${address.detail}, ${address.ward}, ${address.district}, ${address.province}`}</td>
                        <td>{address.phone}</td>
                        <td>
                          <button
                            onClick={() => handleSelectAddress(address)}
                            className="select-btn"
                          >
                            Chọn
                          </button>
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="edit-btn"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address._id)}
                            className="delete-btn"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">Chưa có địa chỉ nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button onClick={openModal} className="add-address-btn">
                Thêm địa chỉ mới
              </button>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="address-form-overlay">
            <ShippingAddressForm
              onAddressSelect={handleAddressSelect}
              onAddressAdded={handleAddressAdded}
              onClose={closeModal}
              initialData={editingAddress}
              isAddingNew={!editingAddress}
            />
          </div>
        )}

        <RelatedItems
          relatedProducts={relatedProducts}
          currentProductId={id}
          addToCart={addToCart}
          selectedAddress={selectedAddress}
        />
      </div>
      <Footer />
      <CartSidebar />
    </div>
  );
};

export default ProductDetail;