// src/services/signInService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth/login"; // Sửa endpoint

export const signIn = async (email, password) => {
  try {
    const response = await axios.post(API_URL, { email, password });
    console.log('Response từ signIn:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Lỗi từ server khi đăng nhập:', error.response?.data || error.message);
    throw error.response?.data || { error: "Lỗi server!" };
  }
};