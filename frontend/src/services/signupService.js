// src/services/signupService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/register'; // Sửa endpoint

export const registerUser = async ({ username, email, phone, password }) => { // Thêm username, phone
  try {
    const response = await axios.post(API_URL, { username, email, phone, password });
    console.log('Response từ register:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi từ server khi đăng ký:', error.response?.data || error.message);
    throw error.response?.data || new Error('Đăng ký thất bại');
  }
};