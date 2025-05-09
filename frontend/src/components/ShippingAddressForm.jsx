import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddressService from '../services/AddressService';
import { useAuth } from '../context/AuthContext';
import '../styles/ShippingAddressForm.css';

function ShippingAddressForm({ onAddressSelect, onAddressAdded, onClose, initialData, isAddingNew }) {
  const { user, logout } = useAuth(); // Bỏ updateUser nếu không cần
  const [formData, setFormData] = useState({
    province: '',
    district: '',
    ward: '',
    detail: '',
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.token) return;
      try {
        const addresses = await AddressService.getAddresses(user.token);
        console.log('Fetched addresses:', addresses);
        setSavedAddresses(addresses);
        if (addresses.length > 0 && !initialData && !isAddingNew) {
          const defaultAddress = addresses[0];
          setSelectedAddressId(defaultAddress._id);
          onAddressSelect({
            _id: defaultAddress._id,
            fullName: defaultAddress.fullName,
            address: `${defaultAddress.detail}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.province}`,
            phone: defaultAddress.phone,
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách địa chỉ:', error);
      }
    };
    fetchAddresses();
  }, [user, onAddressSelect, initialData, isAddingNew]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        province: '',
        district: '',
        ward: '',
        detail: initialData.detail || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || ''
      });
      setSelectedAddressId(initialData._id);
    } else {
      setFormData({
        province: '',
        district: '',
        ward: '',
        detail: '',
        fullName: '',
        phone: ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh:', error);
        setErrors({ form: 'Lỗi khi tải danh sách tỉnh/thành phố.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (formData.province) {
      const fetchDistricts = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`https://provinces.open-api.vn/api/p/${formData.province}?depth=2`);
          setDistricts(response.data.districts || []);
          setFormData((prev) => ({ ...prev, district: '', ward: '' }));
          setWards([]);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách quận/huyện:', error);
          setErrors({ form: 'Lỗi khi tải danh sách quận/huyện.' });
        } finally {
          setLoading(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.district) {
      const fetchWards = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
          setWards(response.data.wards || []);
          setFormData((prev) => ({ ...prev, ward: '' }));
        } catch (error) {
          console.error('Lỗi khi lấy danh sách phường/xã:', error);
          setErrors({ form: 'Lỗi khi tải danh sách phường/xã.' });
        } finally {
          setLoading(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [formData.district]);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.fullName.trim()) newErrors.fullName = 'Họ và tên không được để trống.';
    else if (/\d/.test(data.fullName)) newErrors.fullName = 'Họ và tên không được chứa số.';
    const phoneRegex = /^0\d{9}$/;
    if (!data.phone.trim()) newErrors.phone = 'Số điện thoại không được để trống.';
    else if (!phoneRegex.test(data.phone)) newErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.';
    if (!data.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố.';
    if (!data.district) newErrors.district = 'Vui lòng chọn quận/huyện.';
    if (!data.ward) newErrors.ward = 'Vui lòng chọn phường/xã.';
    if (!data.detail.trim()) newErrors.detail = 'Địa chỉ chi tiết không được để trống.';
    return newErrors;
  };

  const handleInputChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    const newErrors = validateForm(updatedFormData);
    setErrors(newErrors);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    onAddressSelect({
      _id: address._id,
      fullName: address.fullName,
      address: `${address.detail}, ${address.ward}, ${address.district}, ${address.province}`,
      phone: address.phone,
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation failed:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    const provinceName = provinces.find(p => p.code === parseInt(formData.province))?.name;
    const districtName = districts.find(d => d.code === parseInt(formData.district))?.name;
    const wardName = wards.find(w => w.code === parseInt(formData.ward))?.name;

    if (!provinceName || !districtName || !wardName) {
      console.log('Missing location names:', { provinceName, districtName, wardName });
      setErrors({ form: 'Không thể tải tên tỉnh/quận/phường. Vui lòng thử lại.' });
      return;
    }

    const addressData = {
      fullName: formData.fullName,
      phone: formData.phone,
      province: provinceName,
      district: districtName,
      ward: wardName,
      detail: formData.detail,
    };
    console.log('Sending address data:', addressData);

    try {
      setLoading(true);
      let newAddress;
      if (initialData && initialData._id) {
        newAddress = await AddressService.updateAddress(initialData._id, addressData, user.token);
        console.log('Address updated:', newAddress);
        onAddressSelect(newAddress);
      } else {
        newAddress = await AddressService.addAddress(addressData, user.token);
        console.log('New address added:', newAddress);
        if (onAddressAdded) {
          onAddressAdded(newAddress);
        }
      }
      const updatedAddresses = await AddressService.getAddresses(user.token);
      console.log('Updated address list:', updatedAddresses);
      setSavedAddresses(updatedAddresses);
      setFormData({ province: '', district: '', ward: '', detail: '', fullName: '', phone: '' });
      setDistricts([]);
      setWards([]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors({ form: error.message || 'Lỗi khi lưu địa chỉ.' });
      if (error.message.includes('Token') || error.response?.status === 401) {
        console.log('Token invalid, logging out');
        logout();
        setErrors({ form: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user?.token) {
    return (
      <div className="shipping-address-container">
        <p className="form-error">Vui lòng đăng nhập để quản lý địa chỉ.</p>
      </div>
    );
  }

  return (
    <div className="shipping-address-container">
      {loading && <p>Đang tải...</p>}
      <h3>Chọn địa chỉ giao hàng</h3>
      {savedAddresses.length > 0 && !isAddingNew && (
        <div className="saved-addresses">
          {savedAddresses.map((address) => (
            <div
              key={address._id}
              className={`address-item ${selectedAddressId === address._id ? 'selected' : ''}`}
              onClick={() => handleSelectAddress(address)}
            >
              <p><strong>{address.fullName}</strong> ({address.phone})</p>
              <p>{`${address.detail}, ${address.ward}, ${address.district}, ${address.province}`}</p>
            </div>
          ))}
        </div>
      )}
      <h3>{initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label>Họ và tên:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={errors.fullName ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.fullName && <p className="error-message">{errors.fullName}</p>}
        </div>
        <div className="form-group">
          <label>Số điện thoại:</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.phone && <p className="error-message">{errors.phone}</p>}
        </div>
        <div className="form-group">
          <label>Tỉnh/Thành phố:</label>
          <select
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            className={errors.province ? 'input-error' : ''}
            disabled={loading}
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          {errors.province && <p className="error-message">{errors.province}</p>}
        </div>
        <div className="form-group">
          <label>Quận/Huyện:</label>
          <select
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            className={errors.district ? 'input-error' : ''}
            disabled={!formData.province || loading}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.district && <p className="error-message">{errors.district}</p>}
        </div>
        <div className="form-group">
          <label>Phường/Xã:</label>
          <select
            value={formData.ward}
            onChange={(e) => handleInputChange('ward', e.target.value)}
            className={errors.ward ? 'input-error' : ''}
            disabled={!formData.district || loading}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          {errors.ward && <p className="error-message">{errors.ward}</p>}
        </div>
        <div className="form-group">
          <label>Địa chỉ chi tiết:</label>
          <input
            type="text"
            value={formData.detail}
            onChange={(e) => handleInputChange('detail', e.target.value)}
            className={errors.detail ? 'input-error' : ''}
            disabled={loading}
          />
          {errors.detail && <p className="error-message">{errors.detail}</p>}
        </div>
        {errors.form && <p className="form-error">{errors.form}</p>}
        <div className="form-buttons">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang lưu...' : initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            disabled={loading}
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShippingAddressForm;