// src/services/menuService.js
import axios from 'axios';

export async function fetchMenuItems(category, token = null) {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await axios.get(`http://localhost:5000/api/products/list?category=${category}`, config);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu menu:', error.response?.data || error.message);
    return [];
  }
}